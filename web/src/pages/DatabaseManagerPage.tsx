/**
 * DatabaseManagerPage — phpMyAdmin-like interface for local databases.
 * Supports PostgreSQL, MySQL/MariaDB (table browser, structure, SQL editor,
 * create/drop/truncate table, add/drop column, insert/edit/delete row)
 * and Redis (key browser, value viewer/editor, rename key).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Database,
  Table2,
  Loader2,
  Search,
  Play,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  Code2,
  LayoutList,
  Key,
  Server,
  Trash2,
  Plus,
  X,
  CheckCircle,
  Edit2,
  MoreVertical,
  PlusCircle,
  MinusCircle,
  Save,
  Copy,
  Download,
  Filter,
  Columns,
} from 'lucide-react';
import AppLayout from '../components/layouts/AppLayout';
import { localApiRequest } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type LocalDbEngine = 'postgresql' | 'mysql' | 'mariadb' | 'redis';
type LocalDbStatus = 'creating' | 'starting' | 'running' | 'stopped' | 'error';

interface LocalDbRecord {
  id: string;
  name: string;
  engine: LocalDbEngine;
  port: number;
  database: string;
  username: string;
  status: LocalDbStatus;
}

interface TableMeta {
  name: string;
  row_count: number;
}

interface ColumnMeta {
  name: string;
  type: string;
  full_type?: string;
  nullable: string | boolean;
  default_value: string | null;
  is_primary: boolean;
  max_length?: number | null;
  extra?: string;
}

interface TableDataResult {
  fields: string[];
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface SqlResult {
  fields: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  command?: string;
  error?: string;
}

interface RedisKeyMeta {
  key: string;
  type: string;
  ttl: number;
}

interface RedisKeyValue {
  key: string;
  type: string;
  value: unknown;
  ttl: number;
}

interface ColumnDef {
  name: string;
  type: string;
  nullable?: boolean;
  defaultValue?: string | null;
  isPrimary?: boolean;
  autoIncrement?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ENGINE_BADGE: Record<string, string> = {
  postgresql: 'bg-blue-500/20 text-blue-400',
  mysql:      'bg-orange-500/20 text-orange-400',
  mariadb:    'bg-teal-500/20 text-teal-400',
  redis:      'bg-red-500/20 text-red-300',
};

const REDIS_TYPE_BADGE: Record<string, string> = {
  string: 'bg-green-500/20 text-green-400',
  list:   'bg-blue-500/20 text-blue-400',
  set:    'bg-purple-500/20 text-purple-400',
  zset:   'bg-orange-500/20 text-orange-400',
  hash:   'bg-yellow-500/20 text-yellow-400',
};

// ─── CellValue ────────────────────────────────────────────────────────────────

function CellValue({ val }: { val: unknown }) {
  if (val === null || val === undefined) {
    return <span className="italic text-gray-600 text-xs">NULL</span>;
  }
  if (typeof val === 'boolean') {
    return val
      ? <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-mono">true</span>
      : <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-mono">false</span>;
  }
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  const truncated = str.length > 160 ? str.slice(0, 160) + '…' : str;
  return (
    <span className="font-mono text-xs text-gray-300" title={str.length > 160 ? str : undefined}>
      {truncated}
    </span>
  );
}

// ─── DataGrid (interactive with row edit/delete) ──────────────────────────────

interface DataGridProps {
  fields: string[];
  rows: Record<string, unknown>[];
  structure?: ColumnMeta[];
  dbId?: string;
  tableName?: string;
  onMutated?: () => void;
}

function DataGrid({ fields, rows, structure, dbId, tableName, onMutated }: DataGridProps) {
  const [editingRow, setEditingRow] = useState<{ index: number; data: Record<string, unknown> } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const pkCol = structure?.find((c) => c.is_primary)?.name ?? fields[0];
  const canEdit = !!(dbId && tableName && pkCol);
  const { t } = useTranslation();

  // Reset selection when rows change (page change / mutated)
  useEffect(() => { setSelectedRows(new Set()); }, [rows]);

  const toggleRow = (i: number) =>
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const toggleAll = () =>
    setSelectedRows((prev) =>
      prev.size === rows.length ? new Set() : new Set(rows.map((_, i) => i)),
    );

  const handleEdit = (i: number) => {
    setEditingRow({ index: i, data: { ...rows[i] } });
    setActionError('');
  };

  const handleSaveEdit = async () => {
    if (!editingRow || !dbId || !tableName || !pkCol) return;
    setSavingEdit(true);
    setActionError('');
    try {
      const pkValue = rows[editingRow.index][pkCol];
      const { [pkCol]: _pk, ...updateData } = editingRow.data;
      const res = await localApiRequest(`/api/local-databases/${dbId}/tables/${encodeURIComponent(tableName)}/rows`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pkColumn: pkCol, pkValue, data: updateData }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Erreur inconnue');
      setEditingRow(null);
      onMutated?.();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteRow = async (i: number) => {
    if (!dbId || !tableName || !pkCol) return;
    const res = await localApiRequest(`/api/local-databases/${dbId}/tables/${encodeURIComponent(tableName)}/rows`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pkColumn: pkCol, pkValue: rows[i][pkCol] }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? 'Erreur inconnue');
  };

  const handleDelete = async (i: number) => {
    if (!confirm(t('dbm.confirm.deleteRow', { col: pkCol, val: rows[i][pkCol] }))) return;
    setDeletingIdx(i);
    setActionError('');
    try {
      await deleteRow(i);
      onMutated?.();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeletingIdx(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    if (!confirm(t('dbm.confirm.deleteRows', { count: selectedRows.size }))) return;
    setBulkDeleting(true);
    setActionError('');
    try {
      for (const i of Array.from(selectedRows).sort((a, b) => b - a)) {
        await deleteRow(i);
      }
      setSelectedRows(new Set());
      onMutated?.();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBulkDeleting(false);
    }
  };

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-700">
        <Database className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm">{t('dbm.noRows')}</p>
      </div>
    );
  }

  const allSelected = selectedRows.size === rows.length;
  const someSelected = selectedRows.size > 0 && !allSelected;

  return (
    <div className="flex flex-col overflow-hidden h-full">
      {/* Bulk-action toolbar */}
      {selectedRows.size > 0 && (
        <div className="shrink-0 flex items-center gap-3 px-3 py-1.5 bg-orange-500/10 border-b border-orange-500/20 text-xs">
          <span className="text-orange-300 font-medium">
            {t('dbm.selectedRows', { count: selectedRows.size })}
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md disabled:opacity-50 transition-colors"
          >
            {bulkDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            {t('dbm.delete')}
          </button>
          <button
            onClick={() => setSelectedRows(new Set())}
            className="ml-auto text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {actionError}
        </div>
      )}

      <div className="overflow-auto flex-1">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-[#080808] z-10">
            <tr>
              {/* Checkbox select-all */}
              {canEdit && (
                <th className="w-8 px-2 py-2 border-b border-white/10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 accent-orange-500 cursor-pointer"
                    title={t('dbm.selectAll')}
                  />
                </th>
              )}
              {/* Actions column */}
              {canEdit && <th className="w-16 px-2 py-2 border-b border-white/10" />}
              {fields.map((f) => (
                <th
                  key={f}
                  className="text-left px-3 py-2 text-xs text-gray-500 font-medium border-b border-white/10 whitespace-nowrap select-none"
                >
                  {f}
                  {f === pkCol && (
                    <span className="ml-1 text-[9px] text-orange-400/70 font-bold">PK</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isEditing = editingRow?.index === i;
              const isSelected = selectedRows.has(i);
              return (
                <tr
                  key={i}
                  className={`group border-b border-white/5 transition-colors ${
                    isEditing
                      ? 'bg-orange-500/5 border-orange-500/20'
                      : isSelected
                      ? 'bg-orange-500/[0.07]'
                      : i % 2 === 0
                      ? 'hover:bg-white/5'
                      : 'bg-white/[0.02] hover:bg-white/5'
                  }`}
                >
                  {/* Row checkbox */}
                  {canEdit && (
                    <td className="px-2 py-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(i)}
                        className="w-3.5 h-3.5 accent-orange-500 cursor-pointer"
                      />
                    </td>
                  )}
                  {/* Action buttons — always visible */}
                  {canEdit && (
                    <td className="px-2 py-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleSaveEdit}
                            disabled={savingEdit}
                            className="p-1 rounded hover:bg-green-500/20 text-green-400 disabled:opacity-40"
                            title={t('dbm.save')}
                          >
                            {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setEditingRow(null)}
                            className="p-1 rounded hover:bg-white/10 text-gray-500"
                            title={t('dbm.cancel')}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(i)}
                            className="p-1 rounded hover:bg-blue-500/20 text-gray-500 hover:text-blue-400 transition-colors"
                            title={t('dbm.edit')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(i)}
                            disabled={deletingIdx === i}
                            className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 disabled:opacity-40 transition-colors"
                            title={t('dbm.delete')}
                          >
                            {deletingIdx === i ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                  {fields.map((f) => (
                    <td key={f} className="px-3 py-1.5 max-w-xs overflow-hidden">
                      {isEditing && f !== pkCol ? (
                        <input
                          type="text"
                          value={String(editingRow!.data[f] ?? '')}
                          onChange={(e) =>
                            setEditingRow((prev) =>
                              prev ? { ...prev, data: { ...prev.data, [f]: e.target.value } } : null
                            )
                          }
                          className="w-full min-w-[80px] px-2 py-0.5 bg-white/10 border border-orange-500/30 rounded text-white text-xs font-mono focus:outline-none focus:border-orange-500/60"
                        />
                      ) : (
                        <CellValue val={row[f]} />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── CreateTableModal ─────────────────────────────────────────────────────────

interface CreateTableModalProps {
  dbId: string;
  engine: string;
  onClose: () => void;
  onCreated: (name: string) => void;
}

const SQL_TYPES_PG = ['SERIAL', 'INTEGER', 'BIGINT', 'SMALLINT', 'NUMERIC', 'FLOAT', 'BOOLEAN',
  'TEXT', 'VARCHAR(255)', 'CHAR(32)', 'UUID', 'TIMESTAMP', 'DATE', 'JSONB', 'BYTEA'];
const SQL_TYPES_MYSQL = ['INT', 'BIGINT', 'SMALLINT', 'TINYINT', 'FLOAT', 'DOUBLE', 'DECIMAL(10,2)',
  'BOOLEAN', 'VARCHAR(255)', 'TEXT', 'LONGTEXT', 'CHAR(32)', 'DATETIME', 'DATE', 'TIMESTAMP', 'JSON', 'BLOB'];

function CreateTableModal({ dbId, engine, onClose, onCreated }: CreateTableModalProps) {
  const { t } = useTranslation();
  const typeOptions = (engine === 'postgresql') ? SQL_TYPES_PG : SQL_TYPES_MYSQL;
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<ColumnDef[]>([
    { name: 'id', type: engine === 'postgresql' ? 'SERIAL' : 'INT', isPrimary: true, autoIncrement: true, nullable: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addCol = () => setColumns((prev) => [...prev, { name: '', type: typeOptions[7], nullable: true }]);
  const removeCol = (i: number) => setColumns((prev) => prev.filter((_, idx) => idx !== i));
  const updateCol = (i: number, patch: Partial<ColumnDef>) =>
    setColumns((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const handleCreate = async () => {
    if (!tableName.trim()) { setError(t('dbm.tableNameRequired')); return; }
    if (columns.some((c) => !c.name.trim())) { setError(t('dbm.columnNameRequired')); return; }
    setSaving(true);
    setError('');
    try {
      const res = await localApiRequest(`/api/local-databases/${dbId}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tableName, columns }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Erreur inconnue');
      onCreated(tableName);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[660px] max-h-[90vh] flex flex-col bg-[#0d0d0d] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-orange-400" />
            <h2 className="text-white font-semibold">{t('dbm.createTable.title')}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Table name */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">{t('dbm.createTable.nameLabel')}</label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="ma_table"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-700 focus:outline-none focus:border-orange-500/40 text-sm font-mono"
            />
          </div>

          {/* Columns */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">{t('dbm.createTable.columnsLabel')}</label>
              <button
                onClick={addCol}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
              >
                <Plus className="w-3.5 h-3.5" /> {t('dbm.createTable.addCol')}
              </button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2 px-2 text-[10px] text-gray-600 uppercase tracking-wider font-medium">
                <span>{t('dbm.createTable.colName')}</span><span>{t('dbm.createTable.colType')}</span><span>NULL</span><span>PK</span><span />
              </div>

              {columns.map((col, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-center">
                  <input
                    type="text"
                    value={col.name}
                    onChange={(e) => updateCol(i, { name: e.target.value })}
                    placeholder="colonne"
                    className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-700 focus:outline-none text-xs font-mono"
                  />
                  <select
                    value={col.type}
                    onChange={(e) => updateCol(i, { type: e.target.value })}
                    className="px-2 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none text-xs font-mono"
                  >
                    {typeOptions.map((typ) => <option key={typ} value={typ}>{typ}</option>)}
                  </select>
                  <label className="flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!col.nullable}
                      onChange={(e) => updateCol(i, { nullable: e.target.checked })}
                      className="w-3.5 h-3.5 accent-orange-500"
                    />
                  </label>
                  <label className="flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!col.isPrimary}
                      onChange={(e) => updateCol(i, { isPrimary: e.target.checked, autoIncrement: e.target.checked })}
                      className="w-3.5 h-3.5 accent-orange-500"
                    />
                  </label>
                  <button
                    onClick={() => removeCol(i)}
                    disabled={columns.length <= 1}
                    className="p-1 hover:bg-red-500/20 rounded text-gray-600 hover:text-red-400 disabled:opacity-20"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-black/20">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
            {t('dbm.cancel')}
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !tableName.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {t('dbm.create')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AddColumnModal ───────────────────────────────────────────────────────────

interface AddColumnModalProps {
  dbId: string;
  tableName: string;
  engine: string;
  onClose: () => void;
  onAdded: () => void;
}

function AddColumnModal({ dbId, tableName, engine, onClose, onAdded }: AddColumnModalProps) {
  const { t } = useTranslation();
  const typeOptions = (engine === 'postgresql') ? SQL_TYPES_PG : SQL_TYPES_MYSQL;
  const [col, setCol] = useState<ColumnDef>({ name: '', type: typeOptions[7], nullable: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!col.name.trim()) { setError(t('dbm.columnRequired')); return; }
    setSaving(true);
    setError('');
    try {
      const res = await localApiRequest(`/api/local-databases/${dbId}/tables/${encodeURIComponent(tableName)}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(col),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Erreur inconnue');
      onAdded();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[460px] bg-[#0d0d0d] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Columns className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-semibold">{t('dbm.addColumn.title')}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">{t('dbm.addColumn.nameLabel')}</label>
            <input type="text" value={col.name} onChange={(e) => setCol((c) => ({ ...c, name: e.target.value }))}
              placeholder="nom_colonne"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/40 text-sm font-mono" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">{t('dbm.addColumn.typeLabel')}</label>
            <select value={col.type} onChange={(e) => setCol((c) => ({ ...c, type: e.target.value }))}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none text-sm font-mono">
              {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!col.nullable} onChange={(e) => setCol((c) => ({ ...c, nullable: e.target.checked }))}
                className="w-4 h-4 accent-orange-500" />
              <span className="text-sm text-gray-300">{t('dbm.structure.nullable')}</span>
            </label>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">{t('dbm.addColumn.defaultValue')}</label>
            <input type="text" value={col.defaultValue ?? ''} onChange={(e) => setCol((c) => ({ ...c, defaultValue: e.target.value || null }))}
              placeholder="NULL"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-700 focus:outline-none text-sm font-mono" />
          </div>
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-black/20">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">{t('dbm.cancel')}</button>
          <button onClick={handleAdd} disabled={saving || !col.name.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {t('dbm.addColumn.addBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── InsertRowModal ───────────────────────────────────────────────────────────

interface InsertRowModalProps {
  dbId: string;
  tableName: string;
  structure: ColumnMeta[];
  onClose: () => void;
  onInserted: () => void;
}

function InsertRowModal({ dbId, tableName, structure, onClose, onInserted }: InsertRowModalProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    structure.forEach((c) => { if (!c.is_primary) init[c.name] = ''; });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleInsert = async () => {
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v !== '') payload[k] = v;
      }
      const res = await localApiRequest(`/api/local-databases/${dbId}/tables/${encodeURIComponent(tableName)}/rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Erreur inconnue');
      onInserted();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  const editableCols = structure.filter((c) => !c.is_primary);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[500px] max-h-[90vh] flex flex-col bg-[#0d0d0d] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Plus className="w-5 h-5 text-green-400" />
            <h2 className="text-white font-semibold">{t('dbm.insertRow.title')}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {editableCols.map((col) => (
            <div key={col.name}>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <span className="font-mono text-gray-300">{col.name}</span>
                <span className="text-gray-700">{col.full_type || col.type}</span>
                {col.nullable === 'YES' || col.nullable === true
                  ? <span className="text-yellow-500/70">nullable</span>
                  : <span className="text-red-400/60">required</span>}
              </label>
              <input
                type="text"
                value={data[col.name] ?? ''}
                onChange={(e) => setData((prev) => ({ ...prev, [col.name]: e.target.value }))}
                placeholder={col.default_value ? t('dbm.insertRow.defaultPlaceholder', { default: col.default_value }) : ''}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-700 focus:outline-none focus:border-green-500/40 text-sm font-mono"
              />
            </div>
          ))}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-black/20">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">{t('dbm.cancel')}</button>
          <button onClick={handleInsert} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {t('dbm.insert')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RedisValueDisplay ────────────────────────────────────────────────────────

function RedisValueDisplay({ kv }: { kv: RedisKeyValue }) {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [editVal, setEditVal] = useState('');

  useEffect(() => {
    if (kv.type === 'string') setEditVal(String(kv.value ?? ''));
    setEditMode(false);
  }, [kv.key]);

  if (kv.type === 'string') {
    return (
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 uppercase tracking-wider">{t('dbm.redis.valString')}</span>
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            {editMode ? t('dbm.cancel') : t('dbm.edit')}
          </button>
        </div>
        {editMode ? (
          <textarea
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:border-orange-500/40"
          />
        ) : (
          <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap break-all bg-black/40 p-3 rounded-lg max-h-64 overflow-y-auto">
            {String(kv.value ?? '')}
          </pre>
        )}
      </div>
    );
  }

  if (kv.type === 'hash') {
    const hash = kv.value as Record<string, string>;
    const entries = Object.entries(hash);
    return (
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-2 border-b border-white/5 bg-black/20 text-xs text-gray-600">
          {t('dbm.redis.fields', { count: entries.length })}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-2 text-xs text-gray-600 font-medium w-1/3">{t('dbm.redis.hashField')}</th>
              <th className="text-left px-4 py-2 text-xs text-gray-600 font-medium">{t('dbm.redis.hashValue')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([field, val]) => (
              <tr key={field} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-2 font-mono text-xs text-orange-300 whitespace-nowrap">{field}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-300 break-all">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (kv.type === 'list' || kv.type === 'set') {
    const items = kv.value as string[];
    return (
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-2 border-b border-white/5 bg-black/20 text-xs text-gray-600">
          {t('dbm.redis.elements', { count: items.length })}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-1.5 border-b border-white/5 hover:bg-white/5"
            >
              <span className="text-gray-700 text-xs tabular-nums w-8 shrink-0">{i}</span>
              <span className="font-mono text-xs text-gray-300 break-all">{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kv.type === 'zset') {
    const items = kv.value as { value: string; score: number }[];
    return (
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-2 border-b border-white/5 bg-black/20 text-xs text-gray-600">
          {t('dbm.redis.members', { count: items.length })}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-2 text-xs text-gray-600 font-medium">{t('dbm.redis.member')}</th>
              <th className="text-right px-4 py-2 text-xs text-gray-600 font-medium">{t('dbm.redis.score')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-2 font-mono text-xs text-gray-300">{item.value}</td>
                <td className="px-4 py-2 font-mono text-xs text-orange-300 text-right tabular-nums">
                  {item.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <pre className="bg-[#0d0d0d] border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap break-all max-h-80 overflow-y-auto">
      {JSON.stringify(kv.value, null, 2)}
    </pre>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DatabaseManagerPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── DB record ──────────────────────────────────────────────────────────────
  const [db, setDb] = useState<LocalDbRecord | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState('');

  // ── SQL: sidebar ──────────────────────────────────────────────────────────
  const [tables, setTables] = useState<TableMeta[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tableFilter, setTableFilter] = useState('');

  // ── SQL: selected table ───────────────────────────────────────────────────
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'structure' | 'sql'>('data');

  // ── SQL: data tab ─────────────────────────────────────────────────────────
  const [tableData, setTableData] = useState<TableDataResult | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataPage, setDataPage] = useState(1);

  // ── SQL: structure tab ────────────────────────────────────────────────────
  const [structure, setStructure] = useState<ColumnMeta[]>([]);
  const [structureLoading, setStructureLoading] = useState(false);

  // ── SQL: SQL editor tab ───────────────────────────────────────────────────
  const [sqlInput, setSqlInput] = useState('');
  const [sqlResult, setSqlResult] = useState<SqlResult | null>(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [sqlTime, setSqlTime] = useState<number | null>(null);

  // ── Redis ─────────────────────────────────────────────────────────────────
  const [redisPattern, setRedisPattern] = useState('*');
  const [redisKeys, setRedisKeys] = useState<RedisKeyMeta[]>([]);
  const [redisLoading, setRedisLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [keyValue, setKeyValue] = useState<RedisKeyValue | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);
  const [deletingKey, setDeletingKey] = useState(false);
  const [addingKey, setAddingKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newTtl, setNewTtl] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [renamingKey, setRenamingKey] = useState('');
  const [renameNewKey, setRenameNewKey] = useState('');

  // ── DDL / Row modals ───────────────────────────────────────────────────────
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showInsertRow, setShowInsertRow] = useState(false);
  const [tableMenuOpen, setTableMenuOpen] = useState<string | null>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const [structureActionError, setStructureActionError] = useState('');

  // Close table context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tableMenuRef.current && !tableMenuRef.current.contains(e.target as Node)) {
        setTableMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Load DB record ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    (async () => {
      setDbLoading(true);
      try {
        const res = await localApiRequest(`/api/local-databases/${id}/status`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error ?? 'Erreur inconnue');
        setDb(json.data);
      } catch (e: unknown) {
        setDbError(e instanceof Error ? e.message : String(e));
      } finally {
        setDbLoading(false);
      }
    })();
  }, [id]);

  // ── Load tables (SQL engines) ──────────────────────────────────────────────

  const loadTables = useCallback(async () => {
    if (!id) return;
    setTablesLoading(true);
    try {
      const res = await localApiRequest(`/api/local-databases/${id}/tables`);
      const json = await res.json();
      if (json.success) setTables(json.data);
    } finally {
      setTablesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (db && db.engine !== 'redis') loadTables();
  }, [db]);

  // ── Load Redis keys ────────────────────────────────────────────────────────

  const loadRedisKeys = useCallback(
    async (pattern = '*') => {
      if (!id) return;
      setRedisLoading(true);
      try {
        const res = await localApiRequest(
          `/api/local-databases/${id}/redis/keys?pattern=${encodeURIComponent(pattern)}`,
        );
        const json = await res.json();
        if (json.success) setRedisKeys(json.data);
      } finally {
        setRedisLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    if (db?.engine === 'redis') loadRedisKeys();
  }, [db]);

  // ── Table data loaders ─────────────────────────────────────────────────────

  const loadTableData = useCallback(
    async (table: string, page: number) => {
      if (!id) return;
      setDataLoading(true);
      setTableData(null);
      try {
        const res = await localApiRequest(
          `/api/local-databases/${id}/tables/${encodeURIComponent(table)}/rows?page=${page}&limit=50`,
        );
        const json = await res.json();
        if (json.success) setTableData(json.data);
      } finally {
        setDataLoading(false);
      }
    },
    [id],
  );

  const loadTableStructure = useCallback(
    async (table: string) => {
      if (!id) return;
      setStructureLoading(true);
      setStructure([]);
      try {
        const res = await localApiRequest(
          `/api/local-databases/${id}/tables/${encodeURIComponent(table)}/structure`,
        );
        const json = await res.json();
        if (json.success) setStructure(json.data);
      } finally {
        setStructureLoading(false);
      }
    },
    [id],
  );

  // ── Table selection ────────────────────────────────────────────────────────

  const handleSelectTable = (name: string) => {
    if (selectedTable === name) return;
    setSelectedTable(name);
    setTableData(null);
    setStructure([]);
    setSqlResult(null);
    setDataPage(1);
    if (activeTab === 'data') loadTableData(name, 1);
    else if (activeTab === 'structure') loadTableStructure(name);
    else if (activeTab === 'sql' && !sqlInput)
      setSqlInput(`SELECT *\nFROM "${name}"\nLIMIT 50;`);
  };

  const handleTabChange = (tab: 'data' | 'structure' | 'sql') => {
    setActiveTab(tab);
    if (!selectedTable) return;
    if (tab === 'data') loadTableData(selectedTable, dataPage);
    if (tab === 'structure' && structure.length === 0) loadTableStructure(selectedTable);
    if (tab === 'sql' && !sqlInput)
      setSqlInput(`SELECT *\nFROM "${selectedTable}"\nLIMIT 50;`);
  };

  const goToPage = (p: number) => {
    if (!selectedTable) return;
    setDataPage(p);
    loadTableData(selectedTable, p);
  };

  // ── SQL execution ──────────────────────────────────────────────────────────

  const handleExecuteSql = async () => {
    if (!id || !sqlInput.trim()) return;
    setSqlLoading(true);
    setSqlResult(null);
    const t0 = Date.now();
    try {
      const res = await localApiRequest(`/api/local-databases/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlInput }),
      });
      const json = await res.json();
      setSqlTime(Date.now() - t0);
      setSqlResult(json.success ? json.data : { fields: [], rows: [], rowCount: 0, error: json.error });
    } finally {
      setSqlLoading(false);
    }
  };

  // ── Redis operations ───────────────────────────────────────────────────────

  const loadKeyValue = async (key: string) => {
    if (!id) return;
    setSelectedKey(key);
    setKeyValue(null);
    setKeyLoading(true);
    try {
      const res = await localApiRequest(
        `/api/local-databases/${id}/redis/key?key=${encodeURIComponent(key)}`,
      );
      const json = await res.json();
      if (json.success) setKeyValue(json.data);
    } finally {
      setKeyLoading(false);
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (!id || !confirm(t('dbm.confirm.deleteKey', { key }))) return;
    setDeletingKey(true);
    try {
      await localApiRequest(
        `/api/local-databases/${id}/redis/key?key=${encodeURIComponent(key)}`,
        { method: 'DELETE' },
      );
      setSelectedKey(null);
      setKeyValue(null);
      loadRedisKeys(redisPattern);
    } finally {
      setDeletingKey(false);
    }
  };

  const handleSaveNewKey = async () => {
    if (!id || !newKey.trim() || !newValue) return;
    setSavingKey(true);
    try {
      await localApiRequest(`/api/local-databases/${id}/redis/key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: newKey,
          value: newValue,
          ttl: newTtl ? parseInt(newTtl, 10) : undefined,
        }),
      });
      setAddingKey(false);
      setNewKey('');
      setNewValue('');
      setNewTtl('');
      loadRedisKeys(redisPattern);
      loadKeyValue(newKey);
    } finally {
      setSavingKey(false);
    }
  };

  const handleRenameKey = async () => {
    if (!id || !renamingKey || !renameNewKey.trim()) return;
    try {
      const res = await localApiRequest(`/api/local-databases/${id}/redis/key`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldKey: renamingKey, newKey: renameNewKey }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRenamingKey('');
      setRenameNewKey('');
      loadRedisKeys(redisPattern);
      loadKeyValue(renameNewKey);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    }
  };

  // ── DDL: drop / truncate table ─────────────────────────────────────────────

  const handleDropTable = async (tableName: string) => {
    if (!id || !confirm(t('dbm.confirm.dropTable', { tableName }))) return;
    setTableMenuOpen(null);
    try {
      const res = await localApiRequest(`/api/local-databases/${id}/tables/${encodeURIComponent(tableName)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      if (selectedTable === tableName) {
        setSelectedTable(null);
        setTableData(null);
        setStructure([]);
      }
      loadTables();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const handleTruncateTable = async (tableName: string) => {
    if (!id || !confirm(t('dbm.confirm.truncateTable', { tableName }))) return;
    setTableMenuOpen(null);
    try {
      const res = await localApiRequest(`/api/local-databases/${id}/tables/${encodeURIComponent(tableName)}/truncate`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      if (selectedTable === tableName) loadTableData(tableName, 1);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    }
  };

  // ── DDL: drop column ───────────────────────────────────────────────────────

  const handleDropColumn = async (columnName: string) => {
    if (!id || !selectedTable || !confirm(t('dbm.confirm.dropColumn', { col: columnName }))) return;
    setStructureActionError('');
    try {
      const res = await localApiRequest(
        `/api/local-databases/${id}/tables/${encodeURIComponent(selectedTable)}/columns/${encodeURIComponent(columnName)}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      loadTableStructure(selectedTable);
    } catch (e) {
      setStructureActionError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  // ─── Export table as SQL INSERT dump ─────────────────────────────────────

  const handleExportSql = () => {
    if (!tableData || !selectedTable) return;
    const lines: string[] = [`-- Export ${selectedTable} – ${new Date().toISOString()}\n`];
    for (const row of tableData.rows) {
      const cols = tableData.fields.map((f) => `"${f}"`).join(', ');
      const vals = tableData.fields.map((f) => {
        const v = row[f];
        if (v === null || v === undefined) return 'NULL';
        if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        return `'${String(v).replace(/'/g, "''")}'`;
      }).join(', ');
      lines.push(`INSERT INTO "${selectedTable}" (${cols}) VALUES (${vals});`);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_export.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (dbLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      </AppLayout>
    );
  }

  if (dbError || !db) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-gray-400">{dbError || t('dbm.notFound')}</p>
          <button
            onClick={() => navigate('/database')}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm"
          >
            {t('dbm.back')}
          </button>
        </div>
      </AppLayout>
    );
  }

  const isRedis = db.engine === 'redis';
  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(tableFilter.toLowerCase()),
  );

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-hidden">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="shrink-0 px-5 py-3 border-b border-white/10 bg-black/40 flex items-center gap-3">
          <button
            onClick={() => navigate('/database')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('db.page.title')}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-700" />

          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                ENGINE_BADGE[db.engine] || 'bg-gray-500/20 text-gray-400'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
            </div>
            <span className="text-white font-semibold">{db.name}</span>
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                ENGINE_BADGE[db.engine] || 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {db.engine}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3 text-xs text-gray-600 select-none">
            <span className="font-mono">localhost:{db.port}</span>
            {db.database && <span>· {db.database}</span>}
            <span className="flex items-center gap-1 text-green-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            {t('dbm.online')}
            </span>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <div className="w-60 shrink-0 border-r border-white/10 flex flex-col bg-[#050505]">
            {isRedis ? (
              /* Redis key list */
              <>
                <div className="p-2.5 border-b border-white/5 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                    <input
                      type="text"
                      value={redisPattern}
                      onChange={(e) => setRedisPattern(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadRedisKeys(redisPattern)}
                      placeholder="Pattern (ex: user:*)"
                      className="w-full pl-8 pr-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 placeholder-gray-700 focus:outline-none focus:border-orange-500/40 text-xs"
                    />
                  </div>
                  <button
                    onClick={() => loadRedisKeys(redisPattern)}
                    className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white"
                    title={t('dbm.refresh')}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${redisLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                    <span className="text-[10px] text-gray-700 uppercase tracking-widest font-medium">
                      {t('dbm.redis.keysSection')} · {redisKeys.length}
                    </span>
                    <button
                      onClick={() => setAddingKey(true)}
                      className="p-1 hover:bg-white/10 rounded text-gray-600 hover:text-white transition-colors"
                      title={t('dbm.redis.newKey')}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {redisLoading ? (
                    <div className="flex items-center justify-center h-20">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-700" />
                    </div>
                  ) : redisKeys.length === 0 ? (
                    <p className="px-3 py-8 text-center text-xs text-gray-700">
                      {t('dbm.redis.noKeys')}
                    </p>
                  ) : (
                    redisKeys.map((k) => (
                      <button
                        key={k.key}
                        onClick={() => loadKeyValue(k.key)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-white/5 ${
                          selectedKey === k.key
                            ? 'bg-orange-500/15 text-orange-300'
                            : 'text-gray-400'
                        }`}
                      >
                        <span
                          className={`shrink-0 px-1 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            REDIS_TYPE_BADGE[k.type] || 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {k.type.slice(0, 3)}
                        </span>
                        <span className="text-xs font-mono truncate">{k.key}</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              /* SQL table list */
              <>
                <div className="p-2.5 border-b border-white/5 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                    <input
                      type="text"
                      value={tableFilter}
                      onChange={(e) => setTableFilter(e.target.value)}
                      placeholder={t('dbm.filterTables')}
                      className="w-full pl-8 pr-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 placeholder-gray-700 focus:outline-none focus:border-orange-500/40 text-xs"
                    />
                  </div>
                  <button
                    onClick={loadTables}
                    className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white"
                    title={t('dbm.refresh')}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${tablesLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                    <span className="text-[10px] text-gray-700 uppercase tracking-widest font-medium">
                      {t('dbm.tablesSection')} · {filteredTables.length}
                    </span>
                    <button
                      onClick={() => setShowCreateTable(true)}
                      className="p-1 hover:bg-white/10 rounded text-gray-600 hover:text-orange-400 transition-colors"
                      title={t('dbm.createTable.title')}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {tablesLoading ? (
                    <div className="flex items-center justify-center h-20">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-700" />
                    </div>
                  ) : filteredTables.length === 0 ? (
                    <div className="px-3 py-8 text-center space-y-3">
                      <p className="text-xs text-gray-700">
                        {tableFilter ? t('dbm.noResults') : t('dbm.noTables')}
                      </p>
                      {!tableFilter && (
                        <button
                          onClick={() => setShowCreateTable(true)}
                          className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 mx-auto"
                        >
                          <Plus className="w-3 h-3" /> {t('dbm.createTable.title')}
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredTables.map((tbl) => (
                      <div
                        key={tbl.name}
                        className={`group relative flex items-center justify-between gap-1 px-2 py-1.5 transition-colors hover:bg-white/5 ${
                          selectedTable === tbl.name ? 'bg-orange-500/15' : ''
                        }`}
                      >
                        <button
                          onClick={() => handleSelectTable(tbl.name)}
                          className={`flex items-center gap-2 min-w-0 flex-1 text-left ${
                            selectedTable === tbl.name ? 'text-orange-300' : 'text-gray-400'
                          }`}
                        >
                          <Table2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs font-mono truncate">{tbl.name}</span>
                        </button>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-gray-700 tabular-nums">
                            {Number(tbl.row_count).toLocaleString()}
                          </span>
                          {/* Context menu button */}
                          <div className="relative" ref={tableMenuOpen === tbl.name ? tableMenuRef : undefined}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setTableMenuOpen(tableMenuOpen === tbl.name ? null : tbl.name); }}
                              className="p-0.5 rounded hover:bg-white/10 text-gray-700 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </button>
                            {tableMenuOpen === tbl.name && (
                              <div className="absolute right-0 top-5 z-50 w-40 bg-[#141414] border border-white/15 rounded-lg shadow-2xl overflow-hidden">
                                <button
                                  onClick={() => { setSelectedTable(tbl.name); setActiveTab('structure'); setTableMenuOpen(null); if (structure.length === 0 || selectedTable !== tbl.name) loadTableStructure(tbl.name); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white text-left"
                                >
                                  <Server className="w-3.5 h-3.5 text-blue-400" /> Structure
                                </button>
                                <button
                                  onClick={() => { handleSelectTable(tbl.name); setTableMenuOpen(null); setShowInsertRow(true); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white text-left"
                                >
                                  <Plus className="w-3.5 h-3.5 text-green-400" /> {t('dbm.insertRow.title')}
                                </button>
                                <div className="border-t border-white/5" />
                                <button
                                  onClick={() => handleTruncateTable(tbl.name)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-yellow-400 hover:bg-yellow-500/10 text-left"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" /> {t('dbm.truncateTable')}
                                </button>
                                <button
                                  onClick={() => handleDropTable(tbl.name)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 text-left"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> {t('dbm.delete')}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Main content ──────────────────────────────────────────────── */}
          <div className="flex-1 overflow-hidden flex flex-col">

            {isRedis ? (
              /* Redis content pane */
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* New key form */}
                {addingKey && (
                  <div className="p-4 bg-[#0d0d0d] border border-white/10 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">{t('dbm.redis.newKeyTitle')}</h3>
                      <button
                        onClick={() => setAddingKey(false)}
                        className="text-gray-600 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('dbm.redis.keyLabel')}</label>
                        <input
                          type="text"
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          placeholder="my:key"
                          className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-700 focus:outline-none text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {t('dbm.redis.ttlLabel')}
                        </label>
                        <input
                          type="number"
                          value={newTtl}
                          onChange={(e) => setNewTtl(e.target.value)}
                          placeholder={t('dbm.redis.unlimited')}
                          className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-700 focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">{t('dbm.redis.valueLabel')}</label>
                      <textarea
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        rows={3}
                        placeholder={t('dbm.redis.valuePlaceholder')}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-700 focus:outline-none text-sm font-mono resize-none"
                      />
                    </div>
                    <button
                      onClick={handleSaveNewKey}
                      disabled={savingKey || !newKey.trim() || !newValue}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
                    >
                      {savingKey ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {t('dbm.create')}
                    </button>
                  </div>
                )}

                {!selectedKey ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-700">
                    <Key className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">{t('dbm.redis.selectKey')}</p>
                  </div>
                ) : keyLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                  </div>
                ) : keyValue ? (
                  <div className="max-w-3xl space-y-4">
                    {/* Key header */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-base font-mono font-semibold text-white break-all">
                          {keyValue.key}
                        </h2>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            REDIS_TYPE_BADGE[keyValue.type] || 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {keyValue.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-600">
                          TTL :{' '}
                          {keyValue.ttl === -1 ? (
                            <span className="text-gray-500">{t('dbm.redis.persistent')}</span>
                          ) : (
                            <span className="text-yellow-500">{keyValue.ttl}s</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {renamingKey === keyValue.key ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={renameNewKey}
                              onChange={(e) => setRenameNewKey(e.target.value)}
                              placeholder={t('dbm.redis.newName')}
                              autoFocus
                              className="px-2 py-1 bg-white/10 border border-orange-500/40 rounded-lg text-white text-xs font-mono focus:outline-none w-48"
                            />
                            <button
                              onClick={handleRenameKey}
                              disabled={!renameNewKey.trim()}
                              className="p-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 disabled:opacity-40"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { setRenamingKey(''); setRenameNewKey(''); }}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setRenamingKey(keyValue.key); setRenameNewKey(keyValue.key); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> {t('dbm.redis.rename')}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteKey(keyValue.key)}
                          disabled={deletingKey}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                        >
                          {deletingKey ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          {t('dbm.delete')}
                        </button>
                      </div>
                    </div>

                    <RedisValueDisplay kv={keyValue} />
                  </div>
                ) : null}
              </div>
            ) : !selectedTable ? (
              /* No table selected */
              <div className="flex flex-col items-center justify-center flex-1 text-gray-700">
                <Table2 className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">{t('dbm.selectTable')}</p>
              </div>
            ) : (
              /* SQL table content */
              <>
                {/* Tabs */}
                <div className="shrink-0 flex items-center gap-0.5 px-4 border-b border-white/10 bg-[#050505]">
                  {(['data', 'structure', 'sql'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                        activeTab === tab
                          ? 'text-orange-400 border-orange-400'
                          : 'text-gray-500 border-transparent hover:text-gray-300'
                      }`}
                    >
                      {tab === 'data' && <LayoutList className="w-3.5 h-3.5" />}
                      {tab === 'structure' && <Server className="w-3.5 h-3.5" />}
                      {tab === 'sql' && <Code2 className="w-3.5 h-3.5" />}
                      {tab === 'data' ? t('dbm.tabs.data') : tab === 'structure' ? t('dbm.tabs.structure') : t('dbm.tabs.sql')}
                    </button>
                  ))}
                  <span className="ml-auto text-xs text-gray-700 pr-2 font-mono">
                    {selectedTable}
                  </span>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-hidden flex flex-col">

                  {/* DATA TAB */}
                  {activeTab === 'data' && (
                    <div className="flex flex-col h-full">
                      {/* Toolbar */}
                      <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2 border-b border-white/5 bg-[#050505]">
                        <span className="text-xs text-gray-600">
                          {dataLoading
                            ? t('dbm.loading')
                            : tableData
                            ? t('dbm.data.pagination', { start: (dataPage - 1) * 50 + 1, end: Math.min(dataPage * 50, tableData.total), total: tableData.total.toLocaleString() })
                            : ''}
                        </span>
                        <div className="flex items-center gap-1">
                          {/* Insert row */}
                          <button
                            onClick={() => setShowInsertRow(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs font-medium transition-colors"
                            title={t('dbm.insertRow.title')}
                          >
                            <Plus className="w-3.5 h-3.5" /> {t('dbm.insert')}
                          </button>
                          {/* Export current page as SQL */}
                          {tableData && tableData.rows.length > 0 && (
                            <button
                              onClick={handleExportSql}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                              title={t('dbm.exportSql')}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="w-px h-4 bg-white/10 mx-1" />
                          <button
                            onClick={() => goToPage(Math.max(1, dataPage - 1))}
                            disabled={dataPage <= 1 || dataLoading}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-gray-600 tabular-nums px-1">
                            {tableData ? `${dataPage} / ${tableData.pages}` : '–'}
                          </span>
                          <button
                            onClick={() =>
                              goToPage(Math.min(tableData?.pages ?? 1, dataPage + 1))
                            }
                            disabled={
                              !tableData || dataPage >= tableData.pages || dataLoading
                            }
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => selectedTable && loadTableData(selectedTable, dataPage)}
                            disabled={dataLoading}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors ml-1"
                            title={t('dbm.refresh')}
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`}
                            />
                          </button>
                        </div>
                      </div>

                      {dataLoading ? (
                        <div className="flex items-center justify-center flex-1">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                        </div>
                      ) : tableData ? (
                        <DataGrid
                          fields={tableData.fields}
                          rows={tableData.rows}
                          structure={structure}
                          dbId={id}
                          tableName={selectedTable ?? undefined}
                          onMutated={() => selectedTable && loadTableData(selectedTable, dataPage)}
                        />
                      ) : null}
                    </div>
                  )}

                  {/* STRUCTURE TAB */}
                  {activeTab === 'structure' && (
                    <div className="flex flex-col h-full">
                      {/* Toolbar */}
                      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#050505]">
                        <span className="text-xs text-gray-600">{t('dbm.structure.columnCount', { count: structure.length })}</span>
                        <div className="flex items-center gap-2">
                          {structureActionError && (
                            <span className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />{structureActionError}
                            </span>
                          )}
                          <button
                            onClick={() => setShowAddColumn(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> {t('dbm.addColumn.btn')}
                          </button>
                          <button
                            onClick={() => selectedTable && loadTableStructure(selectedTable)}
                            disabled={structureLoading}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                            title={t('dbm.refresh')}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${structureLoading ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1">
                      {structureLoading ? (
                        <div className="flex items-center justify-center h-40">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-[#080808] z-10">
                            <tr className="border-b border-white/10">
                              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">
                                {t('dbm.structure.column')}
                              </th>
                              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">
                                {t('dbm.structure.type')}
                              </th>
                              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">
                                {t('dbm.structure.nullable')}
                              </th>
                              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">
                                {t('dbm.structure.default')}
                              </th>
                              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">
                                PK
                              </th>
                              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">
                                Extra
                              </th>
                              <th className="w-10 px-4 py-2.5" />
                            </tr>
                          </thead>
                          <tbody>
                            {structure.map((col) => (
                              <tr
                                key={col.name}
                                className="group border-b border-white/5 hover:bg-white/5"
                              >
                                <td className="px-4 py-2 font-mono text-xs text-white">
                                  {col.name}
                                </td>
                                <td className="px-4 py-2">
                                  <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 text-xs font-mono">
                                    {col.full_type || col.type}
                                    {col.max_length ? `(${col.max_length})` : ''}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-xs">
                                  {col.nullable === 'YES' || col.nullable === true ? (
                                    <span className="text-yellow-500/80">YES</span>
                                  ) : (
                                    <span className="text-gray-600">NO</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-xs font-mono text-gray-500">
                                  {col.default_value ?? (
                                    <span className="text-gray-700 italic">NULL</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-xs">
                                  {col.is_primary && (
                                    <span className="flex items-center gap-1 text-orange-400 font-medium">
                                      <CheckCircle className="w-3.5 h-3.5" /> PK
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-xs text-gray-600 font-mono">
                                  {col.extra || ''}
                                </td>
                                <td className="px-4 py-2">
                                  {!col.is_primary && (
                                    <button
                                      onClick={() => handleDropColumn(col.name)}
                                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-opacity"
                                      title={t('dbm.confirm.dropColumn', { col: col.name })}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      </div>
                    </div>
                  )}

                  {/* SQL TAB */}
                  {activeTab === 'sql' && (
                    <div className="flex flex-col h-full">
                      {/* Editor */}
                      <div className="shrink-0 p-4 border-b border-white/5">
                        <textarea
                          value={sqlInput}
                          onChange={(e) => setSqlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                              e.preventDefault();
                              handleExecuteSql();
                            }
                          }}
                          rows={7}
                          placeholder={`SELECT *\nFROM "${selectedTable}"\nLIMIT 50;`}
                          spellCheck={false}
                          className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-xl text-gray-200 placeholder-gray-700 focus:outline-none focus:border-orange-500/40 text-sm font-mono resize-none leading-relaxed"
                        />
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-xs text-gray-700">{t('dbm.sql.ctrlEnter')}</span>
                          <button
                            onClick={handleExecuteSql}
                            disabled={sqlLoading || !sqlInput.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
                          >
                            {sqlLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            {t('dbm.sql.execute')}
                          </button>
                        </div>
                      </div>

                      {/* Results */}
                      <div className="flex-1 overflow-hidden flex flex-col">
                        {!sqlResult ? (
                          <div className="flex items-center justify-center flex-1 text-gray-700">
                            <p className="text-sm">{t('dbm.sql.noResults')}</p>
                          </div>
                        ) : (
                          <>
                            {/* Result meta bar */}
                            <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-[#050505]">
                              {sqlResult.error ? (
                                <div className="flex items-center gap-2 text-red-400 text-xs">
                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                  <span className="font-mono">{sqlResult.error}</span>
                                </div>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                  <span className="text-xs text-gray-500">
                                    {t('dbm.sql.rowCount', { count: sqlResult.rowCount })}
                                    {sqlResult.command && ` · ${sqlResult.command}`}
                                    {sqlTime !== null && ` · ${sqlTime}ms`}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Result grid */}
                            {!sqlResult.error && sqlResult.fields.length > 0 && (
                              <div className="flex-1 overflow-hidden">
                                <DataGrid
                                  fields={sqlResult.fields}
                                  rows={sqlResult.rows}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showCreateTable && db && (
        <CreateTableModal
          dbId={id!}
          engine={db.engine}
          onClose={() => setShowCreateTable(false)}
          onCreated={(name) => {
            setShowCreateTable(false);
            loadTables();
            handleSelectTable(name);
          }}
        />
      )}

      {showAddColumn && db && selectedTable && (
        <AddColumnModal
          dbId={id!}
          tableName={selectedTable}
          engine={db.engine}
          onClose={() => setShowAddColumn(false)}
          onAdded={() => {
            setShowAddColumn(false);
            loadTableStructure(selectedTable);
          }}
        />
      )}

      {showInsertRow && selectedTable && structure.length > 0 && (
        <InsertRowModal
          dbId={id!}
          tableName={selectedTable}
          structure={structure}
          onClose={() => setShowInsertRow(false)}
          onInserted={() => {
            setShowInsertRow(false);
            loadTableData(selectedTable, dataPage);
          }}
        />
      )}

      {/* Load structure if inserting before structure tab was opened */}
      {showInsertRow && selectedTable && structure.length === 0 && (() => {
        loadTableStructure(selectedTable);
        return null;
      })()}
    </AppLayout>
  );
}
