import { Request, Response } from 'express';
import {
  createLocalDatabase,
  readRegistry,
  refreshLocalDbStatus,
  removeLocalDatabase,
  startLocalDatabase,
  stopLocalDatabase,
  type LocalDbEngine,
} from '../services/localDbService';

const VALID_ENGINES: LocalDbEngine[] = ['postgresql', 'mysql', 'mariadb', 'mongodb', 'redis'];

/**
 * GET /api/local-databases
 * List all local database records.
 */
export async function listLocalDatabases(req: Request, res: Response) {
  try {
    const records = readRegistry();
    res.json({ success: true, data: records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/local-databases
 * Create and start a new local database container.
 * Body: { name, engine, database?, username?, password? }
 */
export async function createLocalDb(req: Request, res: Response) {
  const { name, engine, database, username, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'name is required' });
  }
  if (!VALID_ENGINES.includes(engine)) {
    return res.status(400).json({
      success: false,
      error: `engine must be one of: ${VALID_ENGINES.join(', ')}`,
    });
  }

  try {
    const record = await createLocalDatabase({
      name: name.trim(),
      engine,
      database,
      username,
      password,
    });
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    console.error('[localDb] create error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/local-databases/:id/status
 * Refresh and return the container status.
 */
export async function getLocalDbStatus(req: Request, res: Response) {
  const id = String(req.params.id);
  try {
    const record = await refreshLocalDbStatus(id);
    if (!record) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/local-databases/:id/start
 */
export async function startLocalDb(req: Request, res: Response) {
  const id = String(req.params.id);
  try {
    await startLocalDatabase(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/local-databases/:id/stop
 */
export async function stopLocalDb(req: Request, res: Response) {
  const id = String(req.params.id);
  try {
    await stopLocalDatabase(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/local-databases/:id
 * Stop + remove container and volume, then delete registry entry.
 */
export async function deleteLocalDb(req: Request, res: Response) {
  const id = String(req.params.id);
  try {
    await removeLocalDatabase(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
