/**
 * localDbService — manage embedded database processes running inside the container.
 *
 * Databases are spawned as child processes using binaries installed in the Docker image.
 * No Docker socket required.
 *
 * Supported engines (requires apk packages added to Dockerfile):
 *   postgresql  — postgresql16, postgresql16-client, su-exec
 *   mysql/mariadb — mariadb, mariadb-client, su-exec
 *   redis       — redis
 *   mongodb     — NOT SUPPORTED in embedded mode
 */

import { spawn, execFileSync, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import net from 'net';

// ─── Types ───────────────────────────────────────────────────────────────────

export type LocalDbEngine = 'postgresql' | 'mysql' | 'mariadb' | 'mongodb' | 'redis';

export interface LocalDbRecord {
  id: string;
  name: string;
  engine: LocalDbEngine;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  status: 'creating' | 'starting' | 'running' | 'stopped' | 'error';
  createdAt: string;
  errorMessage?: string;
  progressMessage?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DATA_DIR = process.env.DATA_DIR || '/app/data';
const DB_DIR   = path.join(DATA_DIR, 'databases');
const REGISTRY_FILE = path.join(DATA_DIR, 'local-databases.json');

/** Base port for each engine — incremented until a free port is found */
const BASE_PORTS: Record<LocalDbEngine, number> = {
  postgresql: 15432,
  mysql:      13306,
  mariadb:    13306,
  mongodb:    27017,
  redis:      16379,
};

/** In-memory process map — rebuilt after server restart via restoreRunningDatabases() */
const processMap = new Map<string, ChildProcess>();

// ─── Path helpers ─────────────────────────────────────────────────────────────

const instanceDir     = (id: string) => path.join(DB_DIR, id);
const instanceDataDir = (id: string) => path.join(DB_DIR, id, 'data');
const instanceLogDir  = (id: string) => path.join(DB_DIR, id, 'log');

function ensureInstanceDirs(id: string) {
  for (const d of [instanceDir(id), instanceDataDir(id), instanceLogDir(id)]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }
}

function chownDir(target: string, user: string) {
  try { execFileSync('chown', ['-R', `${user}:${user}`, target], { stdio: 'pipe' }); }
  catch { /* silently ignore on non-Linux / if already correct */ }
}

// ─── Registry helpers ─────────────────────────────────────────────────────────

function ensureBaseDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_DIR))   fs.mkdirSync(DB_DIR,   { recursive: true });
}

export function readRegistry(): LocalDbRecord[] {
  ensureBaseDir();
  if (!fs.existsSync(REGISTRY_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8')); }
  catch { return []; }
}

function writeRegistry(records: LocalDbRecord[]) {
  ensureBaseDir();
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

function updateRecord(id: string, patch: Partial<LocalDbRecord>) {
  const records = readRegistry();
  const idx = records.findIndex((r) => r.id === id);
  if (idx !== -1) { records[idx] = { ...records[idx], ...patch }; writeRegistry(records); }
}

// ─── Network helpers ──────────────────────────────────────────────────────────

async function findFreePort(base: number): Promise<number> {
  for (let p = base; p < base + 1000; p++) {
    const free = await new Promise<boolean>((resolve) => {
      const srv = net.createServer();
      srv.once('error', () => resolve(false));
      srv.once('listening', () => { srv.close(); resolve(true); });
      srv.listen(p, '127.0.0.1');
    });
    if (free) return p;
  }
  throw new Error('Aucun port disponible dans la plage assignee');
}

async function waitForPort(port: number, timeoutMs = 60000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await new Promise<boolean>((resolve) => {
      const s = net.createConnection({ port, host: '127.0.0.1' });
      s.once('connect', () => { s.destroy(); resolve(true); });
      s.once('error', () => resolve(false));
      setTimeout(() => { try { s.destroy(); } catch {} resolve(false); }, 400);
    });
    if (ok) return;
    await new Promise((r) => setTimeout(r, 600));
  }
  throw new Error(`Service non disponible sur le port ${port} apres ${timeoutMs / 1000}s`);
}

async function waitForSocket(sockPath: string, timeoutMs = 120000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(sockPath)) return;
    await new Promise((r) => setTimeout(r, 600));
  }
  throw new Error(`Socket ${sockPath} non disponible apres ${timeoutMs / 1000}s`);
}

// ─── PostgreSQL ───────────────────────────────────────────────────────────────

async function initPostgres(id: string, username: string, password: string): Promise<void> {
  const dd = instanceDataDir(id);
  if (fs.existsSync(path.join(dd, 'PG_VERSION'))) return; // already initialised

  chownDir(instanceDir(id), 'postgres');

  const pwFile = path.join(instanceDir(id), '.pwfile');
  fs.writeFileSync(pwFile, password + '\n', { mode: 0o600 });
  chownDir(pwFile, 'postgres');

  try {
    execFileSync('su-exec', [
      'postgres', 'initdb',
      '-D', dd,
      '-U', username,
      '--pwfile', pwFile,
      '--auth', 'scram-sha-256',
      '--auth-local', 'trust',
    ], { stdio: 'pipe' });
  } finally {
    try { fs.unlinkSync(pwFile); } catch {}
  }
}

function spawnPostgres(id: string, port: number): ChildProcess {
  const logFile = path.join(instanceLogDir(id), 'postgres.log');
  const proc = spawn('su-exec', [
    'postgres', 'postgres',
    '-D', instanceDataDir(id),
    '-p', String(port),
    '-h', '0.0.0.0',
    '-k', '/tmp',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  const out = fs.createWriteStream(logFile, { flags: 'a' });
  proc.stdout?.pipe(out);
  proc.stderr?.pipe(out);
  return proc;
}

async function setupPostgresUsers(
  port: number, superuser: string, password: string, database: string,
): Promise<void> {
  const env = { ...process.env, PGPASSWORD: password };
  const tryPsql = (sql: string) => {
    try {
      // Always connect to the 'postgres' maintenance database — the superuser
      // database named after the user may not exist on a fresh cluster.
      execFileSync('psql', ['-h', '127.0.0.1', '-p', String(port), '-U', superuser, '-d', 'postgres', '-c', sql],
        { stdio: 'pipe', env });
    } catch { /* ignore already-exists errors */ }
  };
  tryPsql(`CREATE DATABASE "${database.replace(/"/g, '""')}"`);
}

// ─── MariaDB / MySQL ──────────────────────────────────────────────────────────

async function initMariadb(id: string): Promise<void> {
  const dd = instanceDataDir(id);
  if (fs.existsSync(path.join(dd, 'mysql'))) return; // already initialised

  chownDir(instanceDir(id), 'mysql');

  execFileSync('su-exec', [
    'mysql', 'mysql_install_db',
    `--datadir=${dd}`,
    '--skip-test-db',
    '--user=mysql',
  ], { stdio: 'pipe' });
}

function spawnMariadb(id: string, port: number): ChildProcess {
  const sock    = `/tmp/mysql_${id}.sock`;
  const logFile = path.join(instanceLogDir(id), 'mariadb.log');
  const proc = spawn('su-exec', [
    'mysql', 'mysqld',
    `--datadir=${instanceDataDir(id)}`,
    `--port=${port}`,
    '--bind-address=0.0.0.0',
    `--socket=${sock}`,
    '--skip-networking=0',
    '--user=mysql',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  const out = fs.createWriteStream(logFile, { flags: 'a' });
  proc.stdout?.pipe(out);
  proc.stderr?.pipe(out);
  return proc;
}

function setupMariadbUsers(
  sock: string, database: string, appUser: string, appPass: string,
): void {
  const db  = database.replace(/`/g, String.raw`\``);
  const usr = appUser.replace(/'/g, "''");
  const pwd = appPass.replace(/'/g, "''");
  const sql = [
    `CREATE DATABASE IF NOT EXISTS \`${db}\`;`,
    `CREATE USER IF NOT EXISTS '${usr}'@'%' IDENTIFIED BY '${pwd}';`,
    `GRANT ALL PRIVILEGES ON \`${db}\`.* TO '${usr}'@'%';`,
    `FLUSH PRIVILEGES;`,
  ].join(' ');
  execFileSync('mysql', ['--socket', sock, '-u', 'root', '-e', sql], { stdio: 'pipe' });
}

// ─── Redis ────────────────────────────────────────────────────────────────────

function spawnRedis(id: string, port: number, password: string): ChildProcess {
  const dd      = instanceDataDir(id);
  const logFile = path.join(instanceLogDir(id), 'redis.log');
  if (!fs.existsSync(dd)) fs.mkdirSync(dd, { recursive: true });
  const proc = spawn('redis-server', [
    '--port', String(port),
    '--requirepass', password,
    '--dir', dd,
    '--appendonly', 'yes',
    '--bind', '0.0.0.0',
    '--protected-mode', 'no',
    '--daemonize', 'no',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  const out = fs.createWriteStream(logFile, { flags: 'a' });
  proc.stdout?.pipe(out);
  proc.stderr?.pipe(out);
  return proc;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function spawnEngine(
  id: string, engine: LocalDbEngine, port: number, password: string,
): ChildProcess {
  if (engine === 'postgresql')                  return spawnPostgres(id, port);
  if (engine === 'mysql' || engine === 'mariadb') return spawnMariadb(id, port);
  if (engine === 'redis')                       return spawnRedis(id, port, password);
  throw new Error(`Moteur non supporte en mode integre: ${engine}`);
}

function trackProcess(id: string, proc: ChildProcess): void {
  processMap.set(id, proc);
  proc.on('exit', (code) => {
    processMap.delete(id);
    const r = readRegistry().find((x) => x.id === id);
    if (r?.status === 'running') {
      updateRecord(id, {
        status: 'stopped',
        errorMessage: code ? `Processus termine avec le code ${code}` : undefined,
      });
    }
  });
}

// ─── Background provisioning ──────────────────────────────────────────────────

async function _doProvision(
  id: string, engine: LocalDbEngine,
  database: string, username: string, password: string,
): Promise<void> {
  try {
    if (engine === 'mongodb') {
      throw new Error(
        'MongoDB nest pas disponible en mode integre. ' +
        'Utilisez "Connecter une base externe" pour MongoDB.',
      );
    }

    ensureInstanceDirs(id);

    updateRecord(id, { progressMessage: 'Allocation du port...' });
    const port = await findFreePort(BASE_PORTS[engine]);

    if (engine === 'postgresql') {
      updateRecord(id, { progressMessage: 'Initialisation de PostgreSQL...' });
      await initPostgres(id, username, password);

      updateRecord(id, { progressMessage: 'Demarrage de PostgreSQL...' });
      const proc = spawnPostgres(id, port);
      trackProcess(id, proc);

      updateRecord(id, { progressMessage: 'En attente du port TCP...' });
      await waitForPort(port, 60000);

      updateRecord(id, { progressMessage: 'Creation de la base de donnees...' });
      await setupPostgresUsers(port, username, password, database);

    } else if (engine === 'mysql' || engine === 'mariadb') {
      updateRecord(id, { progressMessage: 'Initialisation de MariaDB...' });
      await initMariadb(id);

      updateRecord(id, { progressMessage: 'Demarrage de MariaDB...' });
      const proc = spawnMariadb(id, port);
      trackProcess(id, proc);

      const sock = `/tmp/mysql_${id}.sock`;
      updateRecord(id, { progressMessage: 'En attente de MariaDB...' });
      await waitForSocket(sock, 120000);

      updateRecord(id, { progressMessage: 'Creation des utilisateurs...' });
      setupMariadbUsers(sock, database, username, password);

      await waitForPort(port, 30000);

    } else if (engine === 'redis') {
      updateRecord(id, { progressMessage: 'Demarrage de Redis...' });
      const proc = spawnRedis(id, port, password);
      trackProcess(id, proc);

      await waitForPort(port, 30000);
    }

    updateRecord(id, {
      port,
      status: 'running',
      progressMessage: undefined,
      errorMessage: undefined,
    });

  } catch (err: any) {
    updateRecord(id, {
      status: 'error',
      errorMessage: err.message,
      progressMessage: undefined,
    });
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface CreateLocalDbOptions {
  name: string;
  engine: LocalDbEngine;
  database?: string;
  username?: string;
  password?: string;
}

export async function createLocalDatabase(opts: CreateLocalDbOptions): Promise<LocalDbRecord> {
  const id       = crypto.randomBytes(8).toString('hex');
  const database = opts.database || 'logicaidb';
  const username = opts.username || 'logicai';
  const password = opts.password || crypto.randomBytes(12).toString('base64url');

  const record: LocalDbRecord = {
    id,
    name:     opts.name,
    engine:   opts.engine,
    host:     '127.0.0.1',
    port:     0,
    database,
    username,
    password,
    status:      'creating',
    createdAt:   new Date().toISOString(),
    progressMessage: 'Initialisation...',
  };

  const records = readRegistry();
  records.push(record);
  writeRegistry(records);

  _doProvision(id, opts.engine, database, username, password).catch((err) =>
    console.error('[localDb] provision error:', id, err),
  );

  return record;
}

export async function refreshLocalDbStatus(id: string): Promise<LocalDbRecord | null> {
  const records = readRegistry();
  const record  = records.find((r) => r.id === id);
  if (!record) return null;

  if (record.status === 'creating' || record.status === 'starting') return record;

  // Detect process that died without updating the registry (e.g. OOM kill)
  if (record.status === 'running' && !processMap.has(id)) {
    updateRecord(id, { status: 'stopped' });
    return { ...record, status: 'stopped' };
  }

  return readRegistry().find((r) => r.id === id) ?? null;
}

export async function removeLocalDatabase(id: string): Promise<void> {
  const records = readRegistry();
  const record  = records.find((r) => r.id === id);
  if (!record) throw new Error(`Base de donnees ${id} introuvable`);

  const proc = processMap.get(id);
  if (proc) {
    proc.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 3000));
    try { proc.kill('SIGKILL'); } catch {}
    processMap.delete(id);
  }

  const dir = instanceDir(id);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });

  writeRegistry(records.filter((r) => r.id !== id));
}

export async function startLocalDatabase(id: string): Promise<void> {
  const records = readRegistry();
  const record  = records.find((r) => r.id === id);
  if (!record) throw new Error(`Base de donnees ${id} introuvable`);
  if (!record.port) throw new Error('Port non configure — re-creez la base de donnees');
  if (processMap.has(id)) return; // already running

  const proc = spawnEngine(id, record.engine, record.port, record.password);
  trackProcess(id, proc);
  await waitForPort(record.port, 60000);
  updateRecord(id, { status: 'running', errorMessage: undefined });
}

export async function stopLocalDatabase(id: string): Promise<void> {
  const proc = processMap.get(id);
  if (!proc) { updateRecord(id, { status: 'stopped' }); return; }

  await new Promise<void>((resolve) => {
    proc.once('exit', () => resolve());
    proc.kill('SIGTERM');
    setTimeout(() => { try { proc.kill('SIGKILL'); } catch {} resolve(); }, 8000);
  });
  processMap.delete(id);
  updateRecord(id, { status: 'stopped' });
}

/**
 * Re-start all databases that were running when the server last stopped.
 * Call once from server.ts after the HTTP server has initialised.
 */
export async function restoreRunningDatabases(): Promise<void> {
  const running = readRegistry().filter((r) => r.status === 'running');
  if (running.length === 0) return;

  console.log(`[localDb] Restoring ${running.length} database(s)...`);

  await Promise.all(running.map(async (r) => {
    try {
      await startLocalDatabase(r.id);
      console.log(`[localDb] Restored: ${r.name} (${r.engine} :${r.port})`);
    } catch (err: any) {
      console.error(`[localDb] Failed to restore ${r.name}:`, err.message);
      updateRecord(r.id, { status: 'stopped' });
    }
  }));
}
