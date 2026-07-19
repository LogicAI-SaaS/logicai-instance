import { Router } from 'express';
import {
  listLocalDatabases,
  createLocalDb,
  getLocalDbStatus,
  startLocalDb,
  stopLocalDb,
  deleteLocalDb,
} from '../controllers/localDbController';
import {
  getTablesHandler,
  getTableStructureHandler,
  getTableRowsHandler,
  executeQueryHandler,
  createTableHandler,
  dropTableHandler,
  truncateTableHandler,
  addColumnHandler,
  dropColumnHandler,
  insertRowHandler,
  updateRowHandler,
  deleteRowHandler,
  getRedisKeysHandler,
  getRedisKeyHandler,
  setRedisKeyHandler,
  deleteRedisKeyHandler,
  renameRedisKeyHandler,
  getRedisInfoHandler,
  getExtTablesHandler,
  getExtColumnsHandler,
} from '../controllers/localDbQueryController';

const router = Router();

// ── Lifecycle ──────────────────────────────────────────────────────────────────

// GET  /api/local-databases
router.get('/', listLocalDatabases);
// POST /api/local-databases
router.post('/', createLocalDb);
// GET  /api/local-databases/:id/status
router.get('/:id/status', getLocalDbStatus);
// POST /api/local-databases/:id/start
router.post('/:id/start', startLocalDb);
// POST /api/local-databases/:id/stop
router.post('/:id/stop', stopLocalDb);
// DELETE /api/local-databases/:id
router.delete('/:id', deleteLocalDb);

// ── SQL query API ──────────────────────────────────────────────────────────────

// POST   /api/local-databases/schema/tables   { engine, host, port, database, username, password }
router.post('/schema/tables', getExtTablesHandler);
// POST   /api/local-databases/schema/columns  { engine, host, port, database, username, password, table }
router.post('/schema/columns', getExtColumnsHandler);

// GET    /api/local-databases/:id/tables
router.get('/:id/tables', getTablesHandler);
// POST   /api/local-databases/:id/tables               { name, columns[] }
router.post('/:id/tables', createTableHandler);
// GET    /api/local-databases/:id/tables/:table/structure
router.get('/:id/tables/:table/structure', getTableStructureHandler);
// POST   /api/local-databases/:id/tables/:table/truncate
router.post('/:id/tables/:table/truncate', truncateTableHandler);
// DELETE /api/local-databases/:id/tables/:table
router.delete('/:id/tables/:table', dropTableHandler);
// POST   /api/local-databases/:id/tables/:table/columns  body: ColumnDef
router.post('/:id/tables/:table/columns', addColumnHandler);
// DELETE /api/local-databases/:id/tables/:table/columns/:column
router.delete('/:id/tables/:table/columns/:column', dropColumnHandler);
// GET    /api/local-databases/:id/tables/:table/rows?page=1&limit=50
router.get('/:id/tables/:table/rows', getTableRowsHandler);
// POST   /api/local-databases/:id/tables/:table/rows   { data }
router.post('/:id/tables/:table/rows', insertRowHandler);
// PUT    /api/local-databases/:id/tables/:table/rows   { pkColumn, pkValue, data }
router.put('/:id/tables/:table/rows', updateRowHandler);
// DELETE /api/local-databases/:id/tables/:table/rows   { pkColumn, pkValue }
router.delete('/:id/tables/:table/rows', deleteRowHandler);
// POST   /api/local-databases/:id/execute              { sql }
router.post('/:id/execute', executeQueryHandler);

// ── Redis query API ────────────────────────────────────────────────────────────

// GET    /api/local-databases/:id/redis/keys?pattern=*
router.get('/:id/redis/keys', getRedisKeysHandler);
// GET    /api/local-databases/:id/redis/key?key=<key>
router.get('/:id/redis/key', getRedisKeyHandler);
// POST   /api/local-databases/:id/redis/key  { key, value, ttl? }
router.post('/:id/redis/key', setRedisKeyHandler);
// PATCH  /api/local-databases/:id/redis/key  { oldKey, newKey }
router.patch('/:id/redis/key', renameRedisKeyHandler);
// DELETE /api/local-databases/:id/redis/key?key=<key>
router.delete('/:id/redis/key', deleteRedisKeyHandler);
// GET    /api/local-databases/:id/redis/info
router.get('/:id/redis/info', getRedisInfoHandler);

export default router;
