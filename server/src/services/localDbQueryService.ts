/**
 * localDbQueryService — query interface for embedded databases.
 * Supports PostgreSQL, MySQL/MariaDB (SQL) and Redis (key-value).
 */

import { Pool as PgPool } from 'pg';
import { readRegistry, LocalDbRecord } from './localDbService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SqlResult {
  fields: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  command?: string;
  error?: string;
}

export interface TableMeta {
  name: string;
  row_count: number;
}

export interface ColumnMeta {
  name: string;
  type: string;
  full_type?: string;
  nullable: string | boolean;
  default_value: string | null;
  is_primary: boolean;
  max_length?: number | null;
  extra?: string;
}

export interface TableDataResult {
  fields: string[];
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface RedisKeyMeta {
  key: string;
  type: string;
  ttl: number;
}

export interface RedisKeyValue {
  key: string;
  type: string;
  value: unknown;
  ttl: number;
}

// ─── Internals ────────────────────────────────────────────────────────────────

function getRecord(id: string): LocalDbRecord {
  const r = readRegistry().find((rec) => rec.id === id);
  if (!r) throw new Error('Base de données introuvable');
  if (r.status !== 'running')
    throw new Error(`La base de données n'est pas en cours d'exécution (statut : ${r.status})`);
  return r;
}

function sanitizeIdentifier(name: string): void {
  if (!/^[a-zA-Z0-9_$]+$/.test(name))
    throw new Error(`Nom d'objet invalide : "${name}" (caractères autorisés : a-z, A-Z, 0-9, _, $)`);
}

// ─── PostgreSQL ───────────────────────────────────────────────────────────────

/**
 * Ensure the target database exists inside the PostgreSQL cluster.
 * Connects to the always-available `postgres` maintenance database and runs
 * CREATE DATABASE if required. Safe to call multiple times.
 */
async function ensurePgDatabaseExists(r: LocalDbRecord): Promise<void> {
  const targetDb = r.database || r.username || 'postgres';
  if (targetDb === 'postgres') return; // already guaranteed to exist

  const maint = new PgPool({
    host: '127.0.0.1',
    port: r.port,
    user: r.username || 'postgres',
    password: r.password,
    database: 'postgres', // always-present maintenance DB
    max: 1,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 8000,
  });
  try {
    const exists = await maint.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb],
    );
    if ((exists.rowCount ?? exists.rows.length) === 0) {
      // CREATE DATABASE cannot run inside a transaction – use a raw client
      const client = await maint.connect();
      try {
        await client.query(`CREATE DATABASE "${targetDb.replace(/"/g, '""')}"`);
      } finally {
        client.release();
      }
    }
  } finally {
    await maint.end().catch(() => {});
  }
}

async function pgExec(
  r: LocalDbRecord,
  sql: string,
  params: unknown[] = [],
): Promise<SqlResult> {
  // Auto-heal: create the target database if it was never initialised properly
  await ensurePgDatabaseExists(r);

  const pool = new PgPool({
    host: '127.0.0.1',
    port: r.port,
    user: r.username || 'postgres',
    password: r.password,
    database: r.database || r.username || 'postgres',
    max: 1,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 8000,
  });
  try {
    const res = await pool.query(sql, params as any[]);
    return {
      fields: (res.fields || []).map((f) => f.name),
      rows: (res.rows || []) as Record<string, unknown>[],
      rowCount: res.rowCount ?? res.rows.length,
      command: res.command,
    };
  } finally {
    await pool.end().catch(() => {});
  }
}

// ─── MySQL / MariaDB ──────────────────────────────────────────────────────────

async function mysqlExec(
  r: LocalDbRecord,
  sql: string,
  params: unknown[] = [],
): Promise<SqlResult> {
  const mysql = await import('mysql2/promise');
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: r.port,
    user: r.username || 'root',
    password: r.password,
    database: r.database || undefined,
    connectTimeout: 8000,
  });
  try {
    const [rows, fields] = await conn.query(sql, params);
    const fieldNames = Array.isArray(fields)
      ? (fields as Array<{ name: string }>).map((f) => f.name)
      : [];
    const rowArray = Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
    const rc = Array.isArray(rows) ? rows.length : ((rows as any).affectedRows ?? 0);
    return { fields: fieldNames, rows: rowArray, rowCount: rc };
  } finally {
    await conn.end().catch(() => {});
  }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

async function sqlExec(r: LocalDbRecord, sql: string, params: unknown[] = []): Promise<SqlResult> {
  if (r.engine === 'postgresql') return pgExec(r, sql, params);
  if (r.engine === 'mysql' || r.engine === 'mariadb') return mysqlExec(r, sql, params);
  throw new Error(`Le moteur ${r.engine} ne supporte pas les requêtes SQL`);
}

// ─── Table listing ────────────────────────────────────────────────────────────

export async function listTables(id: string): Promise<TableMeta[]> {
  const r = getRecord(id);

  if (r.engine === 'postgresql') {
    const res = await pgExec(r, `
      SELECT t.table_name                           AS name,
             COALESCE(s.n_live_tup, 0)::bigint      AS row_count
      FROM   information_schema.tables t
      LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
      WHERE  t.table_schema = 'public'
        AND  t.table_type   = 'BASE TABLE'
      ORDER BY t.table_name
    `);
    return res.rows.map((row) => ({
      name: String(row.name),
      row_count: Number(row.row_count),
    }));
  }

  if (r.engine === 'mysql' || r.engine === 'mariadb') {
    const res = await mysqlExec(r, `
      SELECT TABLE_NAME                         AS name,
             COALESCE(TABLE_ROWS, 0)            AS row_count
      FROM   information_schema.TABLES
      WHERE  TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);
    return res.rows.map((row) => ({
      name: String(row.name),
      row_count: Number(row.row_count),
    }));
  }

  throw new Error(`listTables non supporté pour le moteur ${r.engine}`);
}

// ─── Table structure ──────────────────────────────────────────────────────────

export async function getTableStructure(id: string, tableName: string): Promise<ColumnMeta[]> {
  sanitizeIdentifier(tableName);
  const r = getRecord(id);

  if (r.engine === 'postgresql') {
    const res = await pgExec(
      r,
      `
      SELECT
        c.column_name                                               AS name,
        c.data_type                                                 AS type,
        c.character_maximum_length                                  AS max_length,
        c.is_nullable                                               AS nullable,
        c.column_default                                            AS default_value,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END AS is_primary
      FROM   information_schema.columns c
      LEFT JOIN (
        SELECT kcu.column_name
        FROM   information_schema.table_constraints tc
        JOIN   information_schema.key_column_usage  kcu
          ON  tc.constraint_name = kcu.constraint_name
          AND tc.table_schema    = kcu.table_schema
        WHERE  tc.constraint_type = 'PRIMARY KEY'
          AND  tc.table_name      = $1
          AND  tc.table_schema    = 'public'
      ) pk ON pk.column_name = c.column_name
      WHERE  c.table_schema = 'public'
        AND  c.table_name   = $1
      ORDER BY c.ordinal_position
      `,
      [tableName],
    );
    return res.rows as unknown as ColumnMeta[];
  }

  if (r.engine === 'mysql' || r.engine === 'mariadb') {
    const res = await mysqlExec(
      r,
      `
      SELECT
        COLUMN_NAME                       AS name,
        DATA_TYPE                         AS type,
        COLUMN_TYPE                       AS full_type,
        CHARACTER_MAXIMUM_LENGTH          AS max_length,
        IS_NULLABLE                       AS nullable,
        COLUMN_DEFAULT                    AS default_value,
        (COLUMN_KEY = 'PRI')              AS is_primary,
        EXTRA                             AS extra
      FROM   information_schema.COLUMNS
      WHERE  TABLE_SCHEMA = DATABASE()
        AND  TABLE_NAME   = ?
      ORDER BY ORDINAL_POSITION
      `,
      [tableName],
    );
    return res.rows as unknown as ColumnMeta[];
  }

  throw new Error(`getTableStructure non supporté pour le moteur ${r.engine}`);
}

// ─── External connection schema (for nodes using arbitrary DB credentials) ────

export interface ExtDbParams {
  engine: 'postgresql' | 'mysql' | 'mariadb';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

async function pgExecExt(p: ExtDbParams, sql: string, params: unknown[] = []): Promise<SqlResult> {
  const pool = new PgPool({
    host: p.host,
    port: p.port,
    user: p.username || 'postgres',
    password: p.password,
    database: p.database || p.username || 'postgres',
    ssl: p.ssl ? { rejectUnauthorized: false } : undefined,
    max: 1,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 10000,
  });
  try {
    const res = await pool.query(sql, params as any[]);
    return {
      fields: (res.fields || []).map((f) => f.name),
      rows: (res.rows || []) as Record<string, unknown>[],
      rowCount: res.rowCount ?? res.rows.length,
      command: res.command,
    };
  } finally {
    await pool.end().catch(() => {});
  }
}

async function mysqlExecExt(p: ExtDbParams, sql: string, params: unknown[] = []): Promise<SqlResult> {
  const mysql = await import('mysql2/promise');
  const conn = await mysql.createConnection({
    host: p.host,
    port: p.port,
    user: p.username || 'root',
    password: p.password,
    database: p.database || undefined,
    ssl: p.ssl ? {} : undefined,
    connectTimeout: 10000,
  });
  try {
    const [rows, fields] = await conn.query(sql, params);
    const fieldNames = Array.isArray(fields)
      ? (fields as Array<{ name: string }>).map((f) => f.name)
      : [];
    const rowArray = Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
    const rc = Array.isArray(rows) ? rows.length : ((rows as any).affectedRows ?? 0);
    return { fields: fieldNames, rows: rowArray, rowCount: rc };
  } finally {
    await conn.end().catch(() => {});
  }
}

export async function listTablesExt(p: ExtDbParams): Promise<TableMeta[]> {
  if (p.engine === 'postgresql') {
    const res = await pgExecExt(p, `
      SELECT table_name AS name, 0::bigint AS row_count
      FROM   information_schema.tables
      WHERE  table_schema = 'public'
        AND  table_type   = 'BASE TABLE'
      ORDER BY table_name
    `);
    return res.rows.map((r) => ({ name: String(r.name), row_count: 0 }));
  }
  if (p.engine === 'mysql' || p.engine === 'mariadb') {
    const res = await mysqlExecExt(p, `
      SELECT TABLE_NAME AS name, 0 AS row_count
      FROM   information_schema.TABLES
      WHERE  TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);
    return res.rows.map((r) => ({ name: String(r.name), row_count: 0 }));
  }
  throw new Error(`listTablesExt: moteur non supporté (${p.engine})`);
}

export async function getColumnsExt(p: ExtDbParams, tableName: string): Promise<ColumnMeta[]> {
  sanitizeIdentifier(tableName);
  if (p.engine === 'postgresql') {
    const res = await pgExecExt(
      p,
      `SELECT column_name AS name, data_type AS type, is_nullable AS nullable,
              column_default AS default_value, false AS is_primary
       FROM   information_schema.columns
       WHERE  table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [tableName],
    );
    return res.rows as unknown as ColumnMeta[];
  }
  if (p.engine === 'mysql' || p.engine === 'mariadb') {
    const res = await mysqlExecExt(
      p,
      `SELECT COLUMN_NAME AS name, DATA_TYPE AS type, IS_NULLABLE AS nullable,
              COLUMN_DEFAULT AS default_value, (COLUMN_KEY = 'PRI') AS is_primary
       FROM   information_schema.COLUMNS
       WHERE  TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [tableName],
    );
    return res.rows as unknown as ColumnMeta[];
  }
  throw new Error(`getColumnsExt: moteur non supporté (${p.engine})`);
}

// ─── Table rows (paginated) ───────────────────────────────────────────────────

export async function getTableRows(
  id: string,
  tableName: string,
  page = 1,
  limit = 50,
): Promise<TableDataResult> {
  sanitizeIdentifier(tableName);
  const r = getRecord(id);
  const safeLimit = Math.min(Math.max(1, limit), 500);
  const offset = (page - 1) * safeLimit;

  let countResult: SqlResult;
  let dataResult: SqlResult;

  if (r.engine === 'postgresql') {
    countResult = await pgExec(r, `SELECT COUNT(*) AS count FROM "${tableName}"`);
    dataResult = await pgExec(
      r,
      `SELECT * FROM "${tableName}" LIMIT ${safeLimit} OFFSET ${offset}`,
    );
  } else {
    countResult = await mysqlExec(
      r,
      `SELECT COUNT(*) AS count FROM \`${tableName}\``,
    );
    dataResult = await mysqlExec(
      r,
      `SELECT * FROM \`${tableName}\` LIMIT ${safeLimit} OFFSET ${offset}`,
    );
  }

  const total = Number(countResult.rows[0]?.count ?? 0);
  return {
    fields: dataResult.fields,
    rows: dataResult.rows,
    total,
    page,
    limit: safeLimit,
    pages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}

// ─── Raw SQL execution ────────────────────────────────────────────────────────

export async function executeRawSql(id: string, sql: string): Promise<SqlResult> {
  const r = getRecord(id);
  try {
    return await sqlExec(r, sql);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { fields: [], rows: [], rowCount: 0, error: msg };
  }
}

// ─── Redis ────────────────────────────────────────────────────────────────────

async function redisConnect(r: LocalDbRecord) {
  const { createClient } = await import('redis');
  const client = createClient({
    socket: { host: '127.0.0.1', port: r.port, connectTimeout: 8000 },
    password: r.password || undefined,
  });
  await client.connect();
  return client;
}

export async function listRedisKeys(id: string, pattern = '*'): Promise<RedisKeyMeta[]> {
  const r = getRecord(id);
  const client = await redisConnect(r);
  try {
    const keys: string[] = [];
    let cursor = 0;
    do {
      const res = await (client as any).scan(cursor, { MATCH: pattern, COUNT: 200 });
      cursor = Number(res.cursor);
      keys.push(...(res.keys as string[]));
    } while (cursor !== 0 && keys.length < 500);

    return Promise.all(
      keys.slice(0, 300).map(async (key) => ({
        key: String(key),
        type: String(await client.type(key)),
        ttl: Number(await client.ttl(key)),
      })),
    ) as Promise<RedisKeyMeta[]>;
  } finally {
    await client.disconnect().catch(() => {});
  }
}

export async function getRedisKeyValue(id: string, key: string): Promise<RedisKeyValue> {
  const r = getRecord(id);
  const client = await redisConnect(r);
  try {
    const type = String(await client.type(key));
    const ttl = Number(await client.ttl(key));
    let value: unknown = null;
    switch (type) {
      case 'string': value = await client.get(key); break;
      case 'list':   value = await client.lRange(key, 0, -1); break;
      case 'set':    value = await client.sMembers(key); break;
      case 'zset':   value = await client.zRangeWithScores(key, 0, -1); break;
      case 'hash':   value = await client.hGetAll(key); break;
    }
    return { key, type, value, ttl };
  } finally {
    await client.disconnect().catch(() => {});
  }
}

export async function setRedisStringKey(
  id: string,
  key: string,
  value: string,
  ttl?: number,
): Promise<void> {
  const r = getRecord(id);
  const client = await redisConnect(r);
  try {
    if (ttl && ttl > 0) {
      await client.set(key, value, { EX: ttl });
    } else {
      await client.set(key, value);
    }
  } finally {
    await client.disconnect().catch(() => {});
  }
}

export async function deleteRedisKey(id: string, key: string): Promise<void> {
  const r = getRecord(id);
  const client = await redisConnect(r);
  try {
    await client.del(key);
  } finally {
    await client.disconnect().catch(() => {});
  }
}

// ─── DDL: create table ────────────────────────────────────────────────────────

export interface ColumnDef {
  name: string;
  type: string;        // e.g. "VARCHAR(255)" / "INTEGER"
  nullable?: boolean;
  defaultValue?: string | null;
  isPrimary?: boolean;
  autoIncrement?: boolean;
}

export async function createTable(
  id: string,
  tableName: string,
  columns: ColumnDef[],
): Promise<void> {
  sanitizeIdentifier(tableName);
  for (const c of columns) sanitizeIdentifier(c.name);
  const r = getRecord(id);

  if (columns.length === 0) throw new Error('Au moins une colonne est requise');

  if (r.engine === 'postgresql') {
    const cols = columns.map((c) => {
      let def = `"${c.name}" ${c.type}`;
      if (c.isPrimary && c.autoIncrement) def = `"${c.name}" SERIAL`;
      if (c.isPrimary) def += ' PRIMARY KEY';
      if (!c.nullable && !c.isPrimary) def += ' NOT NULL';
      if (c.defaultValue !== undefined && c.defaultValue !== null && !c.isPrimary)
        def += ` DEFAULT ${c.defaultValue}`;
      return def;
    }).join(',\n  ');
    await pgExec(r, `CREATE TABLE "${tableName}" (\n  ${cols}\n)`);
    return;
  }
  if (r.engine === 'mysql' || r.engine === 'mariadb') {
    const cols = columns.map((c) => {
      let def = `\`${c.name}\` ${c.type}`;
      if (c.autoIncrement) def += ' AUTO_INCREMENT';
      if (c.isPrimary) def += ' PRIMARY KEY';
      if (!c.nullable && !c.isPrimary) def += ' NOT NULL';
      if (c.defaultValue !== undefined && c.defaultValue !== null && !c.isPrimary)
        def += ` DEFAULT ${c.defaultValue}`;
      return def;
    }).join(',\n  ');
    await mysqlExec(r, `CREATE TABLE \`${tableName}\` (\n  ${cols}\n)`);
    return;
  }
  throw new Error(`createTable non supporté pour le moteur ${r.engine}`);
}

// ─── DDL: drop table ──────────────────────────────────────────────────────────

export async function dropTable(id: string, tableName: string): Promise<void> {
  sanitizeIdentifier(tableName);
  const r = getRecord(id);
  if (r.engine === 'postgresql') {
    await pgExec(r, `DROP TABLE IF EXISTS "${tableName}" CASCADE`);
    return;
  }
  if (r.engine === 'mysql' || r.engine === 'mariadb') {
    await mysqlExec(r, `DROP TABLE IF EXISTS \`${tableName}\``);
    return;
  }
  throw new Error(`dropTable non supporté pour le moteur ${r.engine}`);
}

// ─── DDL: truncate table ──────────────────────────────────────────────────────

export async function truncateTable(id: string, tableName: string): Promise<void> {
  sanitizeIdentifier(tableName);
  const r = getRecord(id);
  if (r.engine === 'postgresql') {
    await pgExec(r, `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
    return;
  }
  if (r.engine === 'mysql' || r.engine === 'mariadb') {
    await mysqlExec(r, `TRUNCATE TABLE \`${tableName}\``);
    return;
  }
  throw new Error(`truncateTable non supporté pour le moteur ${r.engine}`);
}

// ─── DDL: add column ──────────────────────────────────────────────────────────

export async function addColumn(
  id: string,
  tableName: string,
  col: ColumnDef,
): Promise<void> {
  sanitizeIdentifier(tableName);
  sanitizeIdentifier(col.name);
  const r = getRecord(id);

  if (r.engine === 'postgresql') {
    let def = `"${col.name}" ${col.type}`;
    if (!col.nullable) def += ' NOT NULL';
    if (col.defaultValue !== undefined && col.defaultValue !== null)
      def += ` DEFAULT ${col.defaultValue}`;
    await pgExec(r, `ALTER TABLE "${tableName}" ADD COLUMN ${def}`);
    return;
  }
  if (r.engine === 'mysql' || r.engine === 'mariadb') {
    let def = `\`${col.name}\` ${col.type}`;
    if (!col.nullable) def += ' NOT NULL';
    if (col.defaultValue !== undefined && col.defaultValue !== null)
      def += ` DEFAULT ${col.defaultValue}`;
    await mysqlExec(r, `ALTER TABLE \`${tableName}\` ADD COLUMN ${def}`);
    return;
  }
  throw new Error(`addColumn non supporté pour le moteur ${r.engine}`);
}

// ─── DDL: drop column ─────────────────────────────────────────────────────────

export async function dropColumn(
  id: string,
  tableName: string,
  columnName: string,
): Promise<void> {
  sanitizeIdentifier(tableName);
  sanitizeIdentifier(columnName);
  const r = getRecord(id);
  if (r.engine === 'postgresql') {
    await pgExec(r, `ALTER TABLE "${tableName}" DROP COLUMN IF EXISTS "${columnName}" CASCADE`);
    return;
  }
  if (r.engine === 'mysql' || r.engine === 'mariadb') {
    await mysqlExec(r, `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``);
    return;
  }
  throw new Error(`dropColumn non supporté pour le moteur ${r.engine}`);
}

// ─── Row CRUD: insert ─────────────────────────────────────────────────────────

export async function insertRow(
  id: string,
  tableName: string,
  data: Record<string, unknown>,
): Promise<void> {
  sanitizeIdentifier(tableName);
  const r = getRecord(id);
  const keys = Object.keys(data);
  if (keys.length === 0) throw new Error('Aucune donnée fournie');
  for (const k of keys) sanitizeIdentifier(k);

  if (r.engine === 'postgresql') {
    const cols = keys.map((k) => `"${k}"`).join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    await pgExec(r, `INSERT INTO "${tableName}" (${cols}) VALUES (${placeholders})`, Object.values(data));
    return;
  }
  if (r.engine === 'mysql' || r.engine === 'mariadb') {
    const cols = keys.map((k) => `\`${k}\``).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    await mysqlExec(r, `INSERT INTO \`${tableName}\` (${cols}) VALUES (${placeholders})`, Object.values(data));
    return;
  }
  throw new Error(`insertRow non supporté pour le moteur ${r.engine}`);
}

// ─── Row CRUD: update (by primary key col + value) ───────────────────────────

export async function updateRow(
  id: string,
  tableName: string,
  pkColumn: string,
  pkValue: unknown,
  data: Record<string, unknown>,
): Promise<void> {
  sanitizeIdentifier(tableName);
  sanitizeIdentifier(pkColumn);
  const r = getRecord(id);
  const keys = Object.keys(data);
  if (keys.length === 0) throw new Error('Aucune donnée à modifier');
  for (const k of keys) sanitizeIdentifier(k);

  if (r.engine === 'postgresql') {
    const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const pkIdx = keys.length + 1;
    await pgExec(
      r,
      `UPDATE "${tableName}" SET ${sets} WHERE "${pkColumn}" = $${pkIdx}`,
      [...Object.values(data), pkValue],
    );
    return;
  }
  if (r.engine === 'mysql' || r.engine === 'mariadb') {
    const sets = keys.map((k) => `\`${k}\` = ?`).join(', ');
    await mysqlExec(
      r,
      `UPDATE \`${tableName}\` SET ${sets} WHERE \`${pkColumn}\` = ?`,
      [...Object.values(data), pkValue],
    );
    return;
  }
  throw new Error(`updateRow non supporté pour le moteur ${r.engine}`);
}

// ─── Row CRUD: delete (by primary key col + value) ───────────────────────────

export async function deleteRow(
  id: string,
  tableName: string,
  pkColumn: string,
  pkValue: unknown,
): Promise<void> {
  sanitizeIdentifier(tableName);
  sanitizeIdentifier(pkColumn);
  const r = getRecord(id);
  if (r.engine === 'postgresql') {
    await pgExec(r, `DELETE FROM "${tableName}" WHERE "${pkColumn}" = $1`, [pkValue]);
    return;
  }
  if (r.engine === 'mysql' || r.engine === 'mariadb') {
    await mysqlExec(r, `DELETE FROM \`${tableName}\` WHERE \`${pkColumn}\` = ?`, [pkValue]);
    return;
  }
  throw new Error(`deleteRow non supporté pour le moteur ${r.engine}`);
}

// ─── Redis: rename key ────────────────────────────────────────────────────────

export async function renameRedisKey(
  id: string,
  oldKey: string,
  newKey: string,
): Promise<void> {
  const r = getRecord(id);
  const client = await redisConnect(r);
  try {
    await client.rename(oldKey, newKey);
  } finally {
    await client.disconnect().catch(() => {});
  }
}

export async function getRedisInfo(id: string): Promise<Record<string, string>> {
  const r = getRecord(id);
  const client = await redisConnect(r);
  try {
    const raw = String(await client.info());
    const parsed: Record<string, string> = {};
    for (const line of raw.split('\r\n')) {
      if (!line || line.startsWith('#') || !line.includes(':')) continue;
      const colonIdx = line.indexOf(':');
      parsed[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim();
    }
    return parsed;
  } finally {
    await client.disconnect().catch(() => {});
  }
}
