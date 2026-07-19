import { Request, Response } from 'express';
import {
  listTables,
  getTableStructure,
  getTableRows,
  executeRawSql,
  createTable,
  dropTable,
  truncateTable,
  addColumn,
  dropColumn,
  insertRow,
  updateRow,
  deleteRow,
  listRedisKeys,
  getRedisKeyValue,
  setRedisStringKey,
  deleteRedisKey,
  getRedisInfo,
  renameRedisKey,
  listTablesExt,
  getColumnsExt,
  type ColumnDef,
  type ExtDbParams,
} from '../services/localDbQueryService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ok = (res: Response, data: unknown) => res.json({ success: true, data });
const fail = (res: Response, msg: string, status = 400) =>
  res.status(status).json({ success: false, error: msg });

const wrap =
  (fn: (req: any, res: Response) => Promise<void>) =>
  async (req: any, res: Response) => {
    try {
      await fn(req, res);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : String(e), 500);
    }
  };

// ─── SQL handlers ─────────────────────────────────────────────────────────────

/** GET /api/local-databases/:id/tables */
export const getTablesHandler = wrap(async (req, res) => {
  ok(res, await listTables(String(req.params.id)));
});

/** GET /api/local-databases/:id/tables/:table/structure */
export const getTableStructureHandler = wrap(async (req, res) => {
  ok(res, await getTableStructure(String(req.params.id), String(req.params.table)));
});

/** GET /api/local-databases/:id/tables/:table/rows?page=1&limit=50 */
export const getTableRowsHandler = wrap(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 50));
  ok(res, await getTableRows(String(req.params.id), String(req.params.table), page, limit));
});

/** POST /api/local-databases/:id/execute  body: { sql } */
export const executeQueryHandler = wrap(async (req, res) => {
  const { sql } = req.body as { sql?: string };
  if (!sql?.trim()) { fail(res, 'Le champ "sql" est requis'); return; }
  ok(res, await executeRawSql(String(req.params.id), sql));
});

// ─── DDL handlers ─────────────────────────────────────────────────────────────

/** POST /api/local-databases/:id/tables  body: { name, columns[] } */
export const createTableHandler = wrap(async (req, res) => {
  const { name, columns } = req.body as { name?: string; columns?: ColumnDef[] };
  if (!name?.trim()) { fail(res, 'Le champ "name" est requis'); return; }
  if (!Array.isArray(columns) || columns.length === 0) { fail(res, 'Au moins une colonne est requise'); return; }
  await createTable(String(req.params.id), name, columns);
  ok(res, { created: true, name });
});

/** DELETE /api/local-databases/:id/tables/:table */
export const dropTableHandler = wrap(async (req, res) => {
  await dropTable(String(req.params.id), String(req.params.table));
  ok(res, { dropped: true });
});

/** POST /api/local-databases/:id/tables/:table/truncate */
export const truncateTableHandler = wrap(async (req, res) => {
  await truncateTable(String(req.params.id), String(req.params.table));
  ok(res, { truncated: true });
});

/** POST /api/local-databases/:id/tables/:table/columns  body: ColumnDef */
export const addColumnHandler = wrap(async (req, res) => {
  const col = req.body as ColumnDef;
  if (!col?.name?.trim()) { fail(res, 'Le champ "name" est requis'); return; }
  if (!col?.type?.trim()) { fail(res, 'Le champ "type" est requis'); return; }
  await addColumn(String(req.params.id), String(req.params.table), col);
  ok(res, { added: true, column: col.name });
});

/** DELETE /api/local-databases/:id/tables/:table/columns/:column */
export const dropColumnHandler = wrap(async (req, res) => {
  await dropColumn(
    String(req.params.id),
    String(req.params.table),
    String(req.params.column),
  );
  ok(res, { dropped: true });
});

// ─── Row CRUD handlers ────────────────────────────────────────────────────────

/** POST /api/local-databases/:id/tables/:table/rows  body: { data } */
export const insertRowHandler = wrap(async (req, res) => {
  const { data } = req.body as { data?: Record<string, unknown> };
  if (!data || typeof data !== 'object') { fail(res, 'Le champ "data" (objet) est requis'); return; }
  await insertRow(String(req.params.id), String(req.params.table), data);
  ok(res, { inserted: true });
});

/** PUT /api/local-databases/:id/tables/:table/rows  body: { pkColumn, pkValue, data } */
export const updateRowHandler = wrap(async (req, res) => {
  const { pkColumn, pkValue, data } = req.body as {
    pkColumn?: string;
    pkValue?: unknown;
    data?: Record<string, unknown>;
  };
  if (!pkColumn?.trim()) { fail(res, 'Le champ "pkColumn" est requis'); return; }
  if (pkValue === undefined || pkValue === null) { fail(res, 'Le champ "pkValue" est requis'); return; }
  if (!data || typeof data !== 'object') { fail(res, 'Le champ "data" est requis'); return; }
  await updateRow(String(req.params.id), String(req.params.table), pkColumn, pkValue, data);
  ok(res, { updated: true });
});

/** DELETE /api/local-databases/:id/tables/:table/rows  body: { pkColumn, pkValue } */
export const deleteRowHandler = wrap(async (req, res) => {
  const { pkColumn, pkValue } = req.body as { pkColumn?: string; pkValue?: unknown };
  if (!pkColumn?.trim()) { fail(res, 'Le champ "pkColumn" est requis'); return; }
  if (pkValue === undefined || pkValue === null) { fail(res, 'Le champ "pkValue" est requis'); return; }
  await deleteRow(String(req.params.id), String(req.params.table), pkColumn, pkValue);
  ok(res, { deleted: true });
});

// ─── Redis handlers ───────────────────────────────────────────────────────────

/** GET /api/local-databases/:id/redis/keys?pattern=* */
export const getRedisKeysHandler = wrap(async (req, res) => {
  const pattern = String(req.query.pattern || '*');
  ok(res, await listRedisKeys(String(req.params.id), pattern));
});

/** GET /api/local-databases/:id/redis/key?key=<key> */
export const getRedisKeyHandler = wrap(async (req, res) => {
  const key = String(req.query.key || '');
  if (!key) { fail(res, 'Le paramètre "key" est requis'); return; }
  ok(res, await getRedisKeyValue(String(req.params.id), key));
});

/** POST /api/local-databases/:id/redis/key  body: { key, value, ttl? } */
export const setRedisKeyHandler = wrap(async (req, res) => {
  const { key, value, ttl } = req.body as { key?: string; value?: string; ttl?: number };
  if (!key) { fail(res, 'Le champ "key" est requis'); return; }
  if (value === undefined || value === null) { fail(res, 'Le champ "value" est requis'); return; }
  await setRedisStringKey(String(req.params.id), key, String(value), ttl);
  ok(res, { set: true });
});

/** DELETE /api/local-databases/:id/redis/key?key=<key> */
export const deleteRedisKeyHandler = wrap(async (req, res) => {
  const key = String(req.query.key || '');
  if (!key) { fail(res, 'Le paramètre "key" est requis'); return; }
  await deleteRedisKey(String(req.params.id), key);
  ok(res, { deleted: true });
});

/** PATCH /api/local-databases/:id/redis/key  body: { oldKey, newKey } */
export const renameRedisKeyHandler = wrap(async (req, res) => {
  const { oldKey, newKey } = req.body as { oldKey?: string; newKey?: string };
  if (!oldKey?.trim()) { fail(res, 'Le champ "oldKey" est requis'); return; }
  if (!newKey?.trim()) { fail(res, 'Le champ "newKey" est requis'); return; }
  await renameRedisKey(String(req.params.id), oldKey, newKey);
  ok(res, { renamed: true });
});

/** GET /api/local-databases/:id/redis/info */
export const getRedisInfoHandler = wrap(async (req, res) => {
  ok(res, await getRedisInfo(String(req.params.id)));
});

// ─── External DB schema (used by Visual SQL Builder in node config) ───────────

function parseExtParams(body: any): ExtDbParams {
  const { engine, host, port, database, username, password, ssl } = body ?? {};
  if (!engine || !host || !port) throw new Error('engine, host et port sont obligatoires');
  const validEngines = ['postgresql', 'mysql', 'mariadb'];
  if (!validEngines.includes(engine)) throw new Error(`Moteur invalide : ${engine}`);
  return {
    engine: engine as ExtDbParams['engine'],
    host: String(host),
    port: Number(port),
    database: String(database ?? ''),
    username: String(username ?? ''),
    password: String(password ?? ''),
    ssl: Boolean(ssl),
  };
}

/** POST /api/local-databases/schema/tables */
export const getExtTablesHandler = wrap(async (req, res) => {
  ok(res, await listTablesExt(parseExtParams(req.body)));
});

/** POST /api/local-databases/schema/columns  body: { ...params, table } */
export const getExtColumnsHandler = wrap(async (req, res) => {
  const p = parseExtParams(req.body);
  const table = String(req.body.table ?? '');
  if (!table) throw new Error('Le paramètre "table" est obligatoire');
  ok(res, await getColumnsExt(p, table));
});
