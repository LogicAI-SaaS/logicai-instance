/**
 * DatabaseConnectionField — Picker that shows all saved database connections
 * (local DBs from API + external connections from localStorage).
 * For use in NodeConfigModal on database-category nodes.
 */

import React, { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw, AlertCircle, CheckCircle, Server, Plug } from 'lucide-react';
import { localApiRequest } from '../../config/api';
import { useTranslation } from 'react-i18next';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DbNodeType = 'mySQL' | 'postgreSQL' | 'redis' | 'mongoDB';

interface LocalDbRecord {
  id: string;
  name: string;
  engine: 'postgresql' | 'mysql' | 'mariadb' | 'redis';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  status: string;
}

interface ExternalConnection {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

export interface ResolvedConnection {
  /** Source id (for re-selection on modal re-open) */
  connectionId: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  /** Full connection string (for MongoDB) */
  connectionString?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY = 'db_external_connections';

/** Which local DB engines are compatible with each node type */
const LOCAL_ENGINE_COMPAT: Record<DbNodeType, string[]> = {
  mySQL:      ['mysql', 'mariadb'],
  postgreSQL: ['postgresql'],
  redis:      ['redis'],
  mongoDB:    [], // MongoDB not available as local DB
};

/** Which external connection types are compatible with each node type */
const EXT_TYPE_COMPAT: Record<DbNodeType, string[]> = {
  mySQL:      ['mysql'],
  postgreSQL: ['postgresql'],
  redis:      ['redis'],
  mongoDB:    ['mongodb'],
};

const ENGINE_COLORS: Record<string, string> = {
  postgresql: 'text-blue-400',
  mysql:      'text-orange-400',
  mariadb:    'text-teal-400',
  redis:      'text-red-300',
  mongodb:    'text-green-400',
  mssql:      'text-red-400',
  sqlite:     'text-gray-400',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readExternalConnections(): ExternalConnection[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExternalConnection[];
  } catch {
    return [];
  }
}

function buildConnectionString(c: ResolvedConnection, nodeType: DbNodeType): string {
  if (nodeType === 'mongoDB') {
    const auth = c.username && c.password
      ? `${encodeURIComponent(c.username)}:${encodeURIComponent(c.password)}@`
      : '';
    const db = c.database ? `/${c.database}` : '';
    return `mongodb://${auth}${c.host}:${c.port}${db}`;
  }
  return '';
}

function resolveLocalDb(db: LocalDbRecord): ResolvedConnection {
  return {
    connectionId: `local:${db.id}`,
    host: '127.0.0.1',
    port: db.port,
    database: db.database,
    username: db.username,
    password: db.password,
  };
}

function resolveExternal(c: ExternalConnection): ResolvedConnection {
  return {
    connectionId: `ext:${c.id}`,
    host: c.host,
    port: c.port,
    database: c.database,
    username: c.username,
    password: c.password,
    ssl: c.ssl,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** Which database node type is being configured */
  nodeType: DbNodeType;
  /** Currently selected connection id (connectionId from ResolvedConnection) */
  value: string;
  onChange: (resolved: ResolvedConnection) => void;
  onNavigateToDb: () => void;
}

const DatabaseConnectionField: React.FC<Props> = ({ nodeType, value, onChange, onNavigateToDb }) => {
  const [localDbs, setLocalDbs] = useState<LocalDbRecord[]>([]);
  const [externalConns, setExternalConns] = useState<ExternalConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const localEngines = LOCAL_ENGINE_COMPAT[nodeType] ?? [];
  const extTypes = EXT_TYPE_COMPAT[nodeType] ?? [];

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await localApiRequest('/api/local-databases');
      const json = await res.json();
      if (json.success) {
        const running = (json.data as LocalDbRecord[]).filter(
          (db) => db.status === 'running' && localEngines.includes(db.engine),
        );
        setLocalDbs(running);
      }
    } catch {
      setError('Impossible de charger les bases locales');
    } finally {
      setLoading(false);
    }
    const ext = readExternalConnections().filter((c) => extTypes.includes(c.type));
    setExternalConns(ext);
  };

  useEffect(() => {
    load();
  }, [nodeType]);

  const totalCount = localDbs.length + externalConns.length;

  // ── Render: empty state ──────────────────────────────────────────────────

  if (!loading && totalCount === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-5 px-4 bg-white/5 border border-white/10 rounded-xl">
        <AlertCircle className="w-7 h-7 text-gray-600" />
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          {t('modal.dbconn.noDbsFound')}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onNavigateToDb}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('modal.dbconn.newDb')}
          </button>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
        </div>
      </div>
    );
  }

  // ── Render: picker ───────────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      {loading ? (
        <div className="flex items-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-gray-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          {t('db.loadingConnections')}
        </div>
      ) : (
        <>
          {/* Connections list */}
          <div className="space-y-1.5">
            {/* Local DBs group */}
            {localDbs.length > 0 && (
              <>
                <p className="text-[10px] text-gray-700 uppercase tracking-wider font-medium px-1 flex items-center gap-1.5">
                  <Server className="w-3 h-3" /> Bases locales
                </p>
                {localDbs.map((db) => {
                  const resolvedId = `local:${db.id}`;
                  const isSelected = value === resolvedId;
                  return (
                    <button
                      key={db.id}
                      type="button"
                      onClick={() => {
                        const resolved = resolveLocalDb(db);
                        const final: ResolvedConnection = {
                          ...resolved,
                          connectionString: buildConnectionString(resolved, nodeType),
                        };
                        onChange(final);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-orange-500/15 border-orange-500/50 text-orange-300'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <Database className={`w-4 h-4 shrink-0 ${ENGINE_COLORS[db.engine] || 'text-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{db.name}</p>
                        <p className="text-xs text-gray-500 font-mono truncate">
                          localhost:{db.port} / {db.database || db.username}
                        </p>
                      </div>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isSelected ? 'bg-orange-500/30 text-orange-200' : 'bg-white/10 text-gray-500'
                      }`}>
                        local
                      </span>
                      {isSelected && <CheckCircle className="w-4 h-4 shrink-0 text-orange-400" />}
                    </button>
                  );
                })}
              </>
            )}

            {/* External group */}
            {externalConns.length > 0 && (
              <>
                <p className="text-[10px] text-gray-700 uppercase tracking-wider font-medium px-1 flex items-center gap-1.5 mt-2">
                  <Plug className="w-3 h-3" /> Connexions externes
                </p>
                {externalConns.map((c) => {
                  const resolvedId = `ext:${c.id}`;
                  const isSelected = value === resolvedId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        const resolved = resolveExternal(c);
                        const final: ResolvedConnection = {
                          ...resolved,
                          connectionString: buildConnectionString(resolved, nodeType),
                        };
                        onChange(final);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-500/15 border-blue-500/50 text-blue-300'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <Database className={`w-4 h-4 shrink-0 ${ENGINE_COLORS[c.type] || 'text-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-gray-500 font-mono truncate">
                          {c.host}:{c.port}{c.database ? ` / ${c.database}` : ''}
                          {c.ssl ? ' · SSL' : ''}
                        </p>
                      </div>
                      {isSelected && <CheckCircle className="w-4 h-4 shrink-0 text-blue-400" />}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onNavigateToDb}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-orange-400 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Ajouter une connexion
            </button>
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Actualiser
            </button>
          </div>
        </>
      )}

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default DatabaseConnectionField;
