/**
 * SqlQueryBuilderField — Visual SQL query builder for MySQL / PostgreSQL nodes.
 *
 * Supports SELECT, INSERT, UPDATE, DELETE with:
 *  - Visual column pickers, WHERE conditions, ORDER BY, LIMIT/OFFSET
 *  - Fallback "Raw SQL" mode that shows a plain textarea
 *  - Produces a SQL string written back to the `query` field
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Plus,
  Trash2,
  Code,
  Sliders,
  ArrowUpDown,
  X,
  Table2,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import { localApiRequest } from '../../config/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SqlOperation = 'select' | 'insert' | 'update' | 'delete' | 'raw';

export type WhereCondition = {
  id: string;
  column: string;
  operator: string;
  value: string;
  conjunction: 'AND' | 'OR';
};

export type OrderByClause = {
  id: string;
  column: string;
  direction: 'ASC' | 'DESC';
};

export type SetPair = {
  id: string;
  column: string;
  value: string;
};

export interface SqlBuilderValue {
  mode: 'builder' | 'raw';
  operation: SqlOperation;
  table: string;
  // SELECT
  columns: string[];          // '*' means all
  distinct: boolean;
  limit: string;
  offset: string;
  where: WhereCondition[];
  orderBy: OrderByClause[];
  // INSERT
  insertPairs: SetPair[];
  // UPDATE
  setPairs: SetPair[];
  // raw
  rawSql: string;
}

/** Connection info passed from NodeConfigModal when a DB is selected */
export interface SqlBuilderConnection {
  /** 'local:${id}' for platform-managed DBs, 'ext:${id}' for external */
  connectionId: string;
  engine: 'postgresql' | 'mysql' | 'mariadb';
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

export interface SqlQueryBuilderFieldProps {
  value: SqlBuilderValue | string;
  onChange: (query: string, builderState: SqlBuilderValue) => void;
  dialect?: 'mysql' | 'postgresql';
  /** When set, enables live table/column discovery from the connected DB */
  connection?: SqlBuilderConnection;
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 8);

const defaultState = (): SqlBuilderValue => ({
  mode: 'builder',
  operation: 'select',
  table: '',
  columns: ['*'],
  distinct: false,
  limit: '',
  offset: '',
  where: [],
  orderBy: [],
  insertPairs: [{ id: uid(), column: '', value: '' }],
  setPairs: [{ id: uid(), column: '', value: '' }],
  rawSql: '',
});

const WHERE_OPERATORS = [
  '=', '!=', '<', '<=', '>', '>=',
  'LIKE', 'NOT LIKE', 'ILIKE',
  'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL',
  'BETWEEN',
];

// ─── SQL generator ─────────────────────────────────────────────────────────────

function buildSql(s: SqlBuilderValue, dialect: 'mysql' | 'postgresql'): string {
  const q = dialect === 'postgresql'
    ? (id: string) => `"${id.replace(/"/g, '""')}"`
    : (id: string) => `\`${id.replace(/`/g, '``')}\``;

  const buildWhere = (conditions: WhereCondition[]): string => {
    if (conditions.length === 0) return '';
    return conditions
      .map((c, i) => {
        let expr: string;
        if (c.operator === 'IS NULL' || c.operator === 'IS NOT NULL') {
          expr = `${q(c.column)} ${c.operator}`;
        } else if (c.operator === 'IN' || c.operator === 'NOT IN') {
          expr = `${q(c.column)} ${c.operator} (${c.value})`;
        } else if (c.operator === 'BETWEEN') {
          expr = `${q(c.column)} BETWEEN ${c.value}`;
        } else {
          const isVar = c.value.startsWith('{{') || c.value.startsWith('$');
          const val = isVar ? c.value : `'${c.value.replace(/'/g, "''")}'`;
          expr = `${q(c.column)} ${c.operator} ${val}`;
        }
        return i === 0 ? expr : `${c.conjunction} ${expr}`;
      })
      .join('\n  ');
  };

  const tbl = s.table ? q(s.table) : '<table>';

  if (s.operation === 'select') {
    const cols = s.columns.length === 0 || (s.columns.length === 1 && s.columns[0] === '*')
      ? '*'
      : s.columns.map(c => c === '*' ? '*' : q(c)).join(', ');
    let sql = `SELECT${s.distinct ? ' DISTINCT' : ''} ${cols}\nFROM ${tbl}`;
    const where = buildWhere(s.where);
    if (where) sql += `\nWHERE ${where}`;
    if (s.orderBy.length > 0) {
      sql += `\nORDER BY ${s.orderBy.map(o => `${q(o.column)} ${o.direction}`).join(', ')}`;
    }
    if (s.limit) sql += `\nLIMIT ${s.limit}`;
    if (s.offset) sql += `\nOFFSET ${s.offset}`;
    return sql + ';';
  }

  if (s.operation === 'insert') {
    const pairs = s.insertPairs.filter(p => p.column.trim());
    if (pairs.length === 0) return `INSERT INTO ${tbl} () VALUES ();`;
    const cols = pairs.map(p => q(p.column)).join(', ');
    const vals = pairs.map(p => {
      const isVar = p.value.startsWith('{{') || p.value.startsWith('$');
      return isVar ? p.value : `'${p.value.replace(/'/g, "''")}'`;
    }).join(', ');
    return `INSERT INTO ${tbl} (${cols})\nVALUES (${vals});`;
  }

  if (s.operation === 'update') {
    const pairs = s.setPairs.filter(p => p.column.trim());
    if (pairs.length === 0) return `UPDATE ${tbl}\nSET <column> = <value>;`;
    const setClause = pairs.map(p => {
      const isVar = p.value.startsWith('{{') || p.value.startsWith('$');
      const val = isVar ? p.value : `'${p.value.replace(/'/g, "''")}'`;
      return `  ${q(p.column)} = ${val}`;
    }).join(',\n');
    let sql = `UPDATE ${tbl}\nSET\n${setClause}`;
    const where = buildWhere(s.where);
    if (where) sql += `\nWHERE ${where}`;
    return sql + ';';
  }

  if (s.operation === 'delete') {
    let sql = `DELETE FROM ${tbl}`;
    const where = buildWhere(s.where);
    if (where) sql += `\nWHERE ${where}`;
    else sql += '\n-- ⚠️  No WHERE clause — will delete ALL rows!';
    return sql + ';';
  }

  return s.rawSql;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FieldInput({ value, onChange, placeholder, mono = true, list }: {
  value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean; list?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      list={list}
      autoComplete={list ? 'off' : undefined}
      className={`flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-700 focus:outline-none focus:border-orange-500/40 text-xs ${mono ? 'font-mono' : ''}`}
    />
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1 hover:bg-red-500/20 rounded text-gray-600 hover:text-red-400 transition-colors shrink-0"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

function SectionLabel({ icon: Icon, label }: { icon: React.ComponentType<any>; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className="w-3.5 h-3.5 text-gray-500" />
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── WHERE builder ─────────────────────────────────────────────────────────────

function WhereBuilder({ where, onChange, colListId }: {
  where: WhereCondition[];
  onChange: (w: WhereCondition[]) => void;
  colListId?: string;
}) {
  const add = () => onChange([...where, { id: uid(), column: '', operator: '=', value: '', conjunction: 'AND' }]);
  const remove = (id: string) => onChange(where.filter(c => c.id !== id));
  const update = (id: string, patch: Partial<WhereCondition>) =>
    onChange(where.map(c => c.id === id ? { ...c, ...patch } : c));

  return (
    <div className="space-y-2">
      <SectionLabel icon={Sliders} label="WHERE" />
      {where.map((c, i) => (
        <div key={c.id} className="flex items-center gap-1.5 flex-wrap">
          {i > 0 && (
            <select
              value={c.conjunction}
              onChange={e => update(c.id, { conjunction: e.target.value as 'AND' | 'OR' })}
              className="w-14 px-1.5 py-1.5 bg-[#1a1a1a] border border-white/10 rounded text-xs text-orange-400 font-mono focus:outline-none"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          )}
          <FieldInput value={c.column} onChange={v => update(c.id, { column: v })} placeholder="column" list={colListId} />
          <select
            value={c.operator}
            onChange={e => update(c.id, { operator: e.target.value })}
            className="px-1.5 py-1.5 bg-[#1a1a1a] border border-white/10 rounded text-xs text-blue-300 font-mono focus:outline-none"
          >
            {WHERE_OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
          {c.operator !== 'IS NULL' && c.operator !== 'IS NOT NULL' && (
            <FieldInput value={c.value} onChange={v => update(c.id, { value: v })} placeholder="value or {{ $var }}" />
          )}
          <RemoveBtn onClick={() => remove(c.id)} />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors mt-1"
      >
        <Plus className="w-3 h-3" /> Ajouter condition
      </button>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function SqlQueryBuilderField({ value, onChange, dialect = 'postgresql', connection }: SqlQueryBuilderFieldProps) {
  // Parse initial state
  const [state, setState] = useState<SqlBuilderValue>(() => {
    if (typeof value === 'object' && value !== null && 'mode' in value) {
      return value as SqlBuilderValue;
    }
    const s = defaultState();
    if (typeof value === 'string' && value.trim()) {
      s.mode = 'raw';
      s.rawSql = value;
    }
    return s;
  });
  const { t } = useTranslation();

  // Re-sync if parent resets value to a plain string
  useEffect(() => {
    if (typeof value === 'string' && value.trim() && state.mode === 'builder') {
      // only sync rawSql, don't switch modes
      setState(prev => ({ ...prev, rawSql: value }));
    }
  }, []);  // intentionally run once

  // ── Schema discovery ──────────────────────────────────────────────────────
  const builderId = useRef(uid()).current;
  const colListId = `sqb-cols-${builderId}`;

  const [tables, setTables] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingCols, setLoadingCols] = useState(false);

  const fetchTables = useCallback(async () => {
    if (!connection?.connectionId) return;
    setLoadingTables(true);
    try {
      let res: Response;
      if (connection.connectionId.startsWith('local:')) {
        const localId = connection.connectionId.slice(6);
        res = await localApiRequest(`/api/local-databases/${localId}/tables`);
      } else {
        res = await localApiRequest('/api/local-databases/schema/tables', {
          method: 'POST',
          body: JSON.stringify({
            engine: connection.engine,
            host: connection.host,
            port: connection.port,
            database: connection.database,
            username: connection.username,
            password: connection.password,
            ssl: connection.ssl,
          }),
        });
      }
      const json = await res.json();
      if (json.success) {
        setTables((json.data as { name: string }[]).map(t => t.name));
      }
    } catch {
      // silently ignore — user can still type manually
    } finally {
      setLoadingTables(false);
    }
  }, [connection?.connectionId]);

  const fetchColumns = useCallback(async (tableName: string) => {
    if (!connection?.connectionId || !tableName.trim()) {
      setColumns([]);
      return;
    }
    setLoadingCols(true);
    try {
      let res: Response;
      if (connection.connectionId.startsWith('local:')) {
        const localId = connection.connectionId.slice(6);
        res = await localApiRequest(`/api/local-databases/${localId}/tables/${encodeURIComponent(tableName)}/structure`);
      } else {
        res = await localApiRequest('/api/local-databases/schema/columns', {
          method: 'POST',
          body: JSON.stringify({
            engine: connection.engine,
            host: connection.host,
            port: connection.port,
            database: connection.database,
            username: connection.username,
            password: connection.password,
            ssl: connection.ssl,
            table: tableName,
          }),
        });
      }
      const json = await res.json();
      if (json.success) {
        setColumns((json.data as { name: string }[]).map(c => c.name));
      }
    } catch {
      setColumns([]);
    } finally {
      setLoadingCols(false);
    }
  }, [connection?.connectionId]);

  // Fetch tables when connection changes
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Fetch columns when table changes
  useEffect(() => {
    fetchColumns(state.table);
  }, [state.table, fetchColumns]);

  const update = useCallback((patch: Partial<SqlBuilderValue>) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      const sql = next.mode === 'raw' ? next.rawSql : buildSql(next, dialect);
      onChange(sql, next);
      return next;
    });
  }, [onChange, dialect]);

  const sql = state.mode === 'raw' ? state.rawSql : buildSql(state, dialect);

  const OPERATIONS: { value: SqlOperation; label: string; color: string }[] = [
    { value: 'select', label: 'SELECT', color: 'text-blue-400' },
    { value: 'insert', label: 'INSERT', color: 'text-green-400' },
    { value: 'update', label: 'UPDATE', color: 'text-orange-400' },
    { value: 'delete', label: 'DELETE', color: 'text-red-400' },
  ];

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {state.mode === 'builder'
            ? <Sliders className="w-3.5 h-3.5 text-orange-400" />
            : <Code className="w-3.5 h-3.5 text-gray-400" />}
          <span className="text-xs font-medium text-gray-300">
            {state.mode === 'builder' ? 'Builder visuel' : 'SQL brut'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => update({ mode: state.mode === 'builder' ? 'raw' : 'builder', rawSql: sql })}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
          title="Basculer mode"
        >
          {state.mode === 'builder' ? <Code className="w-3 h-3" /> : <Sliders className="w-3 h-3" />}
          {state.mode === 'builder' ? 'Mode SQL' : 'Mode Builder'}
        </button>
      </div>

      {state.mode === 'raw' ? (
        /* Raw SQL textarea */
        <textarea
          value={state.rawSql}
          onChange={e => update({ rawSql: e.target.value })}
          rows={6}
          spellCheck={false}
          placeholder={`SELECT * FROM users WHERE id = ${dialect === 'postgresql' ? '$1' : '?'};`}
          className="w-full px-3 py-2.5 bg-[#0d0d0d] border border-white/10 rounded-xl text-white placeholder-gray-700 focus:outline-none focus:border-orange-500/40 text-xs font-mono resize-y"
        />
      ) : (
        /* Visual builder */
        <div className="space-y-4 p-4 bg-[#080808] border border-white/10 rounded-xl">

          {/* Hidden datalist for column suggestions */}
          {columns.length > 0 && (
            <datalist id={colListId}>
              {columns.map(col => <option key={col} value={col} />)}
            </datalist>
          )}

          {/* Operation selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {OPERATIONS.map(op => (
              <button
                key={op.value}
                type="button"
                onClick={() => update({ operation: op.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  state.operation === op.value
                    ? `${op.color} bg-white/10 border border-white/20 shadow-sm`
                    : 'text-gray-600 hover:text-gray-400 bg-white/5 border border-white/5 hover:border-white/15'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div>
            <SectionLabel icon={Table2} label={`Table${loadingTables ? '' : tables.length > 0 ? ` (${tables.length})` : ''}`} />
            {tables.length > 0 ? (
              <div className="flex items-center gap-2">
                <select
                  value={state.table}
                  onChange={e => update({ table: e.target.value })}
                  className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/40 text-xs font-mono"
                >
                  <option value="">{t('db.chooseTable')}</option>
                  {tables.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {loadingCols && <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin shrink-0" />}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FieldInput
                  value={state.table}
                  onChange={v => update({ table: v })}
                  placeholder="nom_de_la_table"
                />
                {loadingTables && <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin shrink-0" />}
              </div>
            )}
          </div>

          {/* SELECT-specific fields */}
          {state.operation === 'select' && (
            <>
              {/* Columns */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <SectionLabel icon={Table2} label="Colonnes" />
                  <label className="flex items-center gap-1.5 text-[10px] text-gray-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={state.distinct}
                      onChange={e => update({ distinct: e.target.checked })}
                      className="w-3 h-3 accent-orange-500"
                    />
                    DISTINCT
                  </label>
                </div>
                <div className="space-y-1.5">
                  {state.columns.map((col, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <FieldInput
                        value={col}
                        onChange={v => {
                          const cols = [...state.columns];
                          cols[i] = v;
                          update({ columns: cols });
                        }}
                        placeholder={i === 0 ? '* (toutes)' : 'colonne'}
                        list={columns.length > 0 ? colListId : undefined}
                      />
                      {state.columns.length > 1 && (
                        <RemoveBtn onClick={() => update({ columns: state.columns.filter((_, j) => j !== i) })} />
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => update({ columns: [...state.columns, ''] })}
                    className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Colonne
                  </button>
                </div>
              </div>

              {/* WHERE */}
              <WhereBuilder
                where={state.where}
                onChange={w => update({ where: w })}
                colListId={columns.length > 0 ? colListId : undefined}
              />

              {/* ORDER BY */}
              <div>
                <SectionLabel icon={ArrowUpDown} label="ORDER BY" />
                <div className="space-y-1.5">
                  {state.orderBy.map(o => (
                    <div key={o.id} className="flex items-center gap-1.5">
                      <FieldInput value={o.column} onChange={v => update({
                        orderBy: state.orderBy.map(x => x.id === o.id ? { ...x, column: v } : x)
                      })} placeholder="colonne" list={columns.length > 0 ? colListId : undefined} />
                      <select
                        value={o.direction}
                        onChange={e => update({
                          orderBy: state.orderBy.map(x => x.id === o.id ? { ...x, direction: e.target.value as 'ASC' | 'DESC' } : x)
                        })}
                        className="px-2 py-1.5 bg-[#1a1a1a] border border-white/10 rounded text-xs text-gray-300 font-mono focus:outline-none"
                      >
                        <option value="ASC">ASC</option>
                        <option value="DESC">DESC</option>
                      </select>
                      <RemoveBtn onClick={() => update({ orderBy: state.orderBy.filter(x => x.id !== o.id) })} />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => update({ orderBy: [...state.orderBy, { id: uid(), column: '', direction: 'ASC' }] })}
                    className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Tri
                  </button>
                </div>
              </div>

              {/* LIMIT / OFFSET */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-600 mb-1 font-mono">LIMIT</label>
                  <FieldInput value={state.limit} onChange={v => update({ limit: v })} placeholder="100" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-600 mb-1 font-mono">OFFSET</label>
                  <FieldInput value={state.offset} onChange={v => update({ offset: v })} placeholder="0" />
                </div>
              </div>
            </>
          )}

          {/* INSERT-specific */}
          {state.operation === 'insert' && (
            <div>
              <SectionLabel icon={Plus} label="Valeurs" />
              <div className="space-y-1.5">
                {state.insertPairs.map(p => (
                  <div key={p.id} className="flex items-center gap-1.5">
                    <FieldInput value={p.column} onChange={v => update({
                      insertPairs: state.insertPairs.map(x => x.id === p.id ? { ...x, column: v } : x)
                    })} placeholder="colonne" list={columns.length > 0 ? colListId : undefined} />
                    <span className="text-gray-600 text-xs font-mono shrink-0">=</span>
                    <FieldInput value={p.value} onChange={v => update({
                      insertPairs: state.insertPairs.map(x => x.id === p.id ? { ...x, value: v } : x)
                    })} placeholder="valeur ou {{ $var }}" />
                    <RemoveBtn onClick={() => update({ insertPairs: state.insertPairs.filter(x => x.id !== p.id) })} />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => update({ insertPairs: [...state.insertPairs, { id: uid(), column: '', value: '' }] })}
                  className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Champ
                </button>
              </div>
            </div>
          )}

          {/* UPDATE-specific */}
          {state.operation === 'update' && (
            <>
              <div>
                <SectionLabel icon={Sliders} label="SET" />
                <div className="space-y-1.5">
                  {state.setPairs.map(p => (
                    <div key={p.id} className="flex items-center gap-1.5">
                      <FieldInput value={p.column} onChange={v => update({
                        setPairs: state.setPairs.map(x => x.id === p.id ? { ...x, column: v } : x)
                      })} placeholder="colonne" list={columns.length > 0 ? colListId : undefined} />
                      <span className="text-gray-600 text-xs font-mono shrink-0">=</span>
                      <FieldInput value={p.value} onChange={v => update({
                        setPairs: state.setPairs.map(x => x.id === p.id ? { ...x, value: v } : x)
                      })} placeholder="valeur ou {{ $var }}" />
                      <RemoveBtn onClick={() => update({ setPairs: state.setPairs.filter(x => x.id !== p.id) })} />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => update({ setPairs: [...state.setPairs, { id: uid(), column: '', value: '' }] })}
                    className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Champ
                  </button>
                </div>
              </div>
              <WhereBuilder where={state.where} onChange={w => update({ where: w })} colListId={columns.length > 0 ? colListId : undefined} />
            </>
          )}

          {/* DELETE-specific */}
          {state.operation === 'delete' && (
            <WhereBuilder where={state.where} onChange={w => update({ where: w })} colListId={columns.length > 0 ? colListId : undefined} />
          )}
        </div>
      )}

      {/* Live SQL preview */}
      {state.mode === 'builder' && (
        <div className="rounded-xl border border-white/5 bg-[#050505] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-black/30">
            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3 h-3" /> {t('modal.sql.generatedSql')}
            </span>
            <span className="text-[10px] text-gray-700">{dialect}</span>
          </div>
          <pre className="px-3 py-2.5 text-xs font-mono text-gray-300 whitespace-pre-wrap break-all overflow-x-auto max-h-40">
            {sql || t('modal.sql.configureQuery')}
          </pre>
        </div>
      )}
    </div>
  );
}
