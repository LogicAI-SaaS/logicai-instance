/**
 * DatabasePage — Manage database connections (external) and local Docker DBs
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Database,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Eye,
  EyeOff,
  Server,
  Plug,
  ChevronRight,
  Play,
  Square,
  Copy,
  AlertCircle,
} from 'lucide-react';
import AppLayout from '../components/layouts/AppLayout';
import { localApiRequest } from '../config/api';

// ─── Types ───────────────────────────────────────────────────────────────────

type DbType = 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'redis' | 'mssql';
type LocalDbEngine = 'postgresql' | 'mysql' | 'mariadb' | 'mongodb' | 'redis';
type LocalDbStatus = 'creating' | 'starting' | 'running' | 'stopped' | 'error';

interface DbConnection {
  id: string;
  name: string;
  type: DbType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  createdAt: Date;
  lastTested?: Date;
  testStatus?: 'success' | 'error';
  isLocal?: false;
}

interface LocalDbRecord {
  id: string;
  name: string;
  engine: LocalDbEngine;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  status: LocalDbStatus;
  createdAt: string;
  errorMessage?: string;
  progressMessage?: string;
  isLocal: true;
}

type AnyDb = DbConnection | LocalDbRecord;

// ─── Constants ───────────────────────────────────────────────────────────────

const DB_TYPES: { value: DbType; label: string; defaultPort: number; color: string }[] = [
  { value: 'postgresql', label: 'PostgreSQL', defaultPort: 5432,  color: 'text-blue-400' },
  { value: 'mysql',      label: 'MySQL',      defaultPort: 3306,  color: 'text-orange-400' },
  { value: 'mssql',      label: 'SQL Server', defaultPort: 1433,  color: 'text-red-400' },
  { value: 'mongodb',    label: 'MongoDB',    defaultPort: 27017, color: 'text-green-400' },
  { value: 'redis',      label: 'Redis',      defaultPort: 6379,  color: 'text-red-300' },
  { value: 'sqlite',     label: 'SQLite',     defaultPort: 0,     color: 'text-gray-400' },
];

const LOCAL_ENGINES: { value: LocalDbEngine; label: string; color: string; desc: string }[] = [
  { value: 'postgresql', label: 'PostgreSQL', color: 'text-blue-400',   desc: 'postgresql16' },
  { value: 'mysql',      label: 'MySQL',      color: 'text-orange-400', desc: 'mariadb (compat)' },
  { value: 'mariadb',    label: 'MariaDB',    color: 'text-teal-400',   desc: 'mariadb' },
  { value: 'redis',      label: 'Redis',      color: 'text-red-300',    desc: 'redis' },
];

const DB_ICON_COLORS: Record<string, string> = {
  postgresql: 'bg-blue-500/20 text-blue-400',
  mysql:      'bg-orange-500/20 text-orange-400',
  mariadb:    'bg-teal-500/20 text-teal-400',
  mssql:      'bg-red-500/20 text-red-400',
  mongodb:    'bg-green-500/20 text-green-400',
  redis:      'bg-red-500/20 text-red-300',
  sqlite:     'bg-gray-500/20 text-gray-400',
};

const STATUS_STYLES: Record<LocalDbStatus, { className: string }> = {
  creating: { className: 'bg-yellow-500/20 text-yellow-400' },
  starting: { className: 'bg-blue-500/20 text-blue-400' },
  running:  { className: 'bg-green-500/20 text-green-400' },
  stopped:  { className: 'bg-gray-500/20 text-gray-400' },
  error:    { className: 'bg-red-500/20 text-red-400' },
};

// ─── LocalDbModal ─────────────────────────────────────────────────────────────

interface LocalDbModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (record: LocalDbRecord) => void;
}

const LocalDbModal: React.FC<LocalDbModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [engine, setEngine] = useState<LocalDbEngine>('postgresql');
  const [name, setName] = useState('');
  const [dbName, setDbName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { t } = useTranslation();

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setEngine('postgresql');
      setName('');
      setDbName('');
      setUsername('');
      setPassword('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isRedis = engine === 'redis';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await localApiRequest('/api/local-databases', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          engine,
          database: dbName.trim() || undefined,
          username: username.trim() || undefined,
          password: password || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || t('db.modal.local.createError'));
      }
      onCreated({ ...json.data, isLocal: true });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative w-[520px] max-h-[90vh] overflow-y-auto bg-[#0d0d0d] border border-white/10 rounded-xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Server className="w-4.5 h-4.5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{t('db.modal.local.title')}</h2>
            <p className="text-xs text-gray-500">{t('db.modal.local.subtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Engine picker */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('db.modal.local.engine')}</label>
            <div className="grid grid-cols-5 gap-2">
              {LOCAL_ENGINES.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => setEngine(e.value)}
                  className={`flex flex-col items-center py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                    engine === e.value
                      ? 'bg-orange-500/15 border-orange-500/50 text-orange-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Database className={`w-4 h-4 mb-1 ${e.color}`} />
                  {e.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              Image utilisée : <span className="text-gray-500 font-mono">{LOCAL_ENGINES.find((e) => e.value === engine)?.desc}</span>
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('db.modal.local.nameLabel')}</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ma base PostgreSQL"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 text-sm"
            />
          </div>

          {!isRedis && (
            <>
              {/* DB name + username */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">{t('db.modal.local.dbNameLabel')}</label>
                  <input
                    type="text"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    placeholder="logicai"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">{t('db.modal.local.usernameLabel')}</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              {t('db.modal.local.passwordLabel')}{' '}
              <span className="text-gray-600">({t('db.modal.local.passwordHint')})</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('db.modal.local.passwordPlaceholder')}
                className="w-full px-3 py-2 pr-9 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Info note */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 leading-relaxed">
            {t('db.modal.local.infoNote')}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors disabled:opacity-40"
            >
              {t('db.modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t('db.modal.local.creating')}</>
              ) : (
                <><Plus className="w-4 h-4" /> {t('db.modal.local.create')}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── ExternalConnectionModal (unchanged logic) ────────────────────────────────

interface ExtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (conn: Omit<DbConnection, 'id' | 'createdAt'>) => void;
  editing?: DbConnection;
}

const ExternalConnectionModal: React.FC<ExtModalProps> = ({ isOpen, onClose, onSave, editing }) => {
  const defaultType = DB_TYPES[0];
  const [type, setType] = useState<DbType>(editing?.type ?? defaultType.value);
  const [name, setName] = useState(editing?.name ?? '');
  const [host, setHost] = useState(editing?.host ?? 'localhost');
  const [port, setPort] = useState<number>(editing?.port ?? defaultType.defaultPort);
  const [database, setDatabase] = useState(editing?.database ?? '');
  const [username, setUsername] = useState(editing?.username ?? '');
  const [password, setPassword] = useState(editing?.password ?? '');
  const [ssl, setSsl] = useState(editing?.ssl ?? false);
  const [showPwd, setShowPwd] = useState(false);
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleTypeChange = (dbType: DbType) => {
    setType(dbType);
    const meta = DB_TYPES.find((d) => d.value === dbType);
    if (meta && meta.defaultPort) setPort(meta.defaultPort);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ type, name, host, port, database, username, password, ssl });
    onClose();
  };

  const isSqlite = type === 'sqlite';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[500px] max-h-[90vh] overflow-y-auto bg-[#0d0d0d] border border-white/10 rounded-xl shadow-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-5">
          {editing ? t('db.modal.ext.titleEdit') : t('db.modal.ext.titleNew')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('db.modal.ext.typeLabel')}</label>
            <div className="grid grid-cols-3 gap-2">
              {DB_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeChange(t.value)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    type === t.value
                      ? 'bg-orange-500/20 border-orange-500/60 text-orange-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('db.modal.ext.connNameLabel')}</label>
            <input
              required type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t('db.modal.ext.connNamePlaceholder')}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 text-sm"
            />
          </div>

          {isSqlite ? (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">{t('db.modal.ext.filePathLabel')}</label>
              <input
                required type="text" value={database} onChange={(e) => setDatabase(e.target.value)}
                placeholder="/data/mydb.sqlite"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 text-sm"
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1.5">{t('db.modal.ext.hostLabel')}</label>
                  <input
                    required type="text" value={host} onChange={(e) => setHost(e.target.value)}
                    placeholder="localhost"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">{t('db.modal.ext.portLabel')}</label>
                  <input
                    required type="number" value={port} onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/60 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  {type === 'mongodb' ? t('db.modal.ext.dbNameMongoLabel') : t('db.modal.ext.dbNameLabel')}
                </label>
                <input type="text" value={database} onChange={(e) => setDatabase(e.target.value)}
                  placeholder="mydb"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 text-sm"
                />
              </div>
              {type !== 'redis' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">{t('db.modal.ext.usernameLabel')}</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="postgres"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">{t('db.modal.ext.passwordLabel')}</label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'} value={password}
                        onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                        className="w-full px-3 py-2 pr-9 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 text-sm"
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div onClick={() => setSsl(!ssl)}
                  className={`w-9 h-5 rounded-full transition-colors ${ssl ? 'bg-orange-500' : 'bg-white/15'}`}>
                  <div className={`w-4 h-4 mt-0.5 rounded-full bg-white shadow transition-transform ${ssl ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-300">{t('db.modal.ext.enableSsl')}</span>
              </label>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors">
              {t('db.modal.cancel')}
            </button>
            <button type="submit"
              className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors">
              {editing ? t('db.modal.ext.update') : t('db.modal.ext.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── LocalDbCard ──────────────────────────────────────────────────────────────

interface LocalDbCardProps {
  db: LocalDbRecord;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
  actionLoading: Set<string>;
}

const LocalDbCard: React.FC<LocalDbCardProps> = ({ db, onStart, onStop, onDelete, onOpen, actionLoading }) => {
  const busy = actionLoading.has(db.id);
  const s = STATUS_STYLES[db.status];
  const isProvisioning = db.status === 'creating' || db.status === 'starting';
  const iconClass = DB_ICON_COLORS[db.engine] || 'bg-gray-500/20 text-gray-400';
  const { t } = useTranslation();

  const [copiedPwd, setCopiedPwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const copyPassword = () => {
    navigator.clipboard.writeText(db.password).then(() => {
      setCopiedPwd(true);
      setTimeout(() => setCopiedPwd(false), 1500);
    });
  };

  return (
    <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex items-start gap-4 flex-1 min-w-0 ${
            db.status === 'running' ? 'cursor-pointer group' : ''
          }`}
          onClick={db.status === 'running' ? () => onOpen(db.id) : undefined}
        >
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass} ${db.status === 'running' ? 'group-hover:opacity-80 transition-opacity' : ''}`}>
            {isProvisioning
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <Database className="w-5 h-5" />}
          </div>

          {/* Info */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-white font-semibold ${db.status === 'running' ? 'group-hover:text-orange-300 transition-colors' : ''}`}>{db.name}</h3>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-gray-400 text-xs capitalize">
                {db.engine}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 text-xs font-medium">
                LOCAL
              </span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${s.className}`}>
                {t(`db.status.${db.status}`)}
              </span>
              {db.status === 'running' && (
                <span className="flex items-center gap-0.5 text-xs text-gray-600 group-hover:text-orange-400 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" /> {t('db.card.open')}
                </span>
              )}
            </div>

            {/* Progress message */}
            {db.progressMessage && (
              <p className="text-xs text-gray-500 italic">{db.progressMessage}</p>
            )}

            {/* Connection info */}
            {db.status === 'running' && (
              <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                <p>
                  <span className="text-gray-600">{t('db.card.connection')}</span>{' '}
                  <span className="font-mono text-gray-400">localhost:{db.port}</span>
                </p>
                {db.database && (
                  <p>
                    <span className="text-gray-600">{t('db.card.database')}</span>{' '}
                    <span className="font-mono text-gray-400">{db.database}</span>
                    {db.username && (
                      <> · <span className="text-gray-600">{t('db.card.user')}</span>{' '}
                        <span className="font-mono text-gray-400">{db.username}</span></>
                    )}
                  </p>
                )}
                {db.password && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">{t('db.card.password')}</span>
                    <span className="font-mono text-gray-400">
                      {showPwd ? db.password : '••••••••••'}
                    </span>
                    <button onClick={() => setShowPwd(!showPwd)}
                      className="text-gray-600 hover:text-gray-400">
                      {showPwd ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button onClick={copyPassword}
                      className="text-gray-600 hover:text-orange-400 transition-colors"
                      title={t('db.card.copyPassword')}>
                      {copiedPwd ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {db.status === 'error' && db.errorMessage && (
              <p className="text-xs text-red-400 flex items-start gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {db.errorMessage}
              </p>
            )}

            <p className="text-xs text-gray-700">
              {t('db.card.createdAt')} {new Date(db.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {db.status === 'stopped' && (
            <button onClick={() => onStart(db.id)} disabled={busy} title={t('db.card.start')}
              className="p-2 rounded-lg hover:bg-green-500/20 text-gray-500 hover:text-green-400 transition-colors disabled:opacity-40">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            </button>
          )}
          {db.status === 'running' && (
            <button onClick={() => onStop(db.id)} disabled={busy} title={t('db.card.stop')}
              className="p-2 rounded-lg hover:bg-yellow-500/20 text-gray-500 hover:text-yellow-400 transition-colors disabled:opacity-40">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
            </button>
          )}
          <button onClick={() => onDelete(db.id)} disabled={busy || isProvisioning} title={t('db.card.delete')}
            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-40">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const EXT_CONN_LS_KEY = 'db_external_connections';

function loadExtConnections(): DbConnection[] {
  try {
    const raw = localStorage.getItem(EXT_CONN_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DbConnection[];
    return parsed.map((c) => ({ ...c, createdAt: new Date(c.createdAt) }));
  } catch {
    return [];
  }
}

export default function DatabasePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  // External connections — persisted in localStorage
  const [connections, setConnections] = useState<DbConnection[]>(loadExtConnections);
  // Local Docker DBs (from API)
  const [localDbs, setLocalDbs] = useState<LocalDbRecord[]>([]);
  const [localDbsLoading, setLocalDbsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [showLocalModal, setShowLocalModal] = useState(false);
  const [showExtModal, setShowExtModal] = useState(false);
  const [editingConn, setEditingConn] = useState<DbConnection | undefined>();
  const [testing, setTesting] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());

  // Open local DB creation modal when navigated with ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowLocalModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // IDs being polled for status updates
  const pollingRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Persist external connections ──────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem(
      EXT_CONN_LS_KEY,
      JSON.stringify(connections),
    );
  }, [connections]);

  // ── Fetch local DBs ──────────────────────────────────────────────────────

  const fetchLocalDbs = useCallback(async () => {
    try {
      const res = await localApiRequest('/api/local-databases');
      const json = await res.json();
      if (json.success) {
        setLocalDbs((json.data as LocalDbRecord[]).map((r) => ({ ...r, isLocal: true as const })));
      }
    } catch {
      // ignore network errors on load
    } finally {
      setLocalDbsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocalDbs();
  }, [fetchLocalDbs]);

  // ── Polling for in-progress DBs ──────────────────────────────────────────

  const pollStatus = useCallback(async (id: string) => {
    try {
      const res = await localApiRequest(`/api/local-databases/${id}/status`);
      const json = await res.json();
      if (!json.success) return;
      const updated: LocalDbRecord = { ...json.data, isLocal: true };
      setLocalDbs((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (updated.status !== 'creating' && updated.status !== 'starting') {
        pollingRef.current.delete(id);
      }
    } catch {
      pollingRef.current.delete(id);
    }
  }, []);

  // Global polling interval — runs every 3s, polls all tracked IDs
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      pollingRef.current.forEach((id) => pollStatus(id));
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pollStatus]);

  // When localDbs changes, register in-progress ones for polling
  useEffect(() => {
    localDbs.forEach((db) => {
      if (db.status === 'creating' || db.status === 'starting') {
        pollingRef.current.add(db.id);
      }
    });
  }, [localDbs]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLocalCreated = (record: LocalDbRecord) => {
    setLocalDbs((prev) => [record, ...prev]);
    pollingRef.current.add(record.id);
  };

  const handleExtSave = (data: Omit<DbConnection, 'id' | 'createdAt'>) => {
    if (editingConn) {
      setConnections((prev) =>
        prev.map((c) => (c.id === editingConn.id ? { ...data, id: c.id, createdAt: c.createdAt } : c))
      );
    } else {
      setConnections((prev) => [
        ...prev,
        { ...data, id: Math.random().toString(36).slice(2), createdAt: new Date() },
      ]);
    }
    setEditingConn(undefined);
  };

  const handleDeleteExt = (id: string) => {
    if (!confirm(t('db.confirm.deleteConn'))) return;
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  const handleTestExt = (id: string) => {
    setTesting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setConnections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, lastTested: new Date(), testStatus: 'success' } : c))
      );
      setTesting((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }, 1500);
  };

  const handleStartLocal = async (id: string) => {
    setActionLoading((prev) => new Set(prev).add(id));
    try {
      await localApiRequest(`/api/local-databases/${id}/start`, { method: 'POST' });
      await pollStatus(id);
    } finally {
      setActionLoading((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleStopLocal = async (id: string) => {
    setActionLoading((prev) => new Set(prev).add(id));
    try {
      await localApiRequest(`/api/local-databases/${id}/stop`, { method: 'POST' });
      setLocalDbs((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'stopped' as LocalDbStatus } : r))
      );
    } finally {
      setActionLoading((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleDeleteLocal = async (id: string) => {
    if (!confirm(t('db.confirm.deleteLocalDb'))) return;
    setActionLoading((prev) => new Set(prev).add(id));
    try {
      await localApiRequest(`/api/local-databases/${id}`, { method: 'DELETE' });
      setLocalDbs((prev) => prev.filter((r) => r.id !== id));
      pollingRef.current.delete(id);
    } finally {
      setActionLoading((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────────

  const filteredLocal = localDbs.filter(
    (db) =>
      db.name.toLowerCase().includes(search.toLowerCase()) ||
      db.engine.toLowerCase().includes(search.toLowerCase())
  );

  const filteredExt = connections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase())
  );

  const totalCount = localDbs.length + connections.length;

  return (
    <AppLayout>
      {/* Page header */}
      <div className="px-8 py-6 border-b border-white/10 bg-black/40 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('db.page.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('db.page.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLocalModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Server className="w-4 h-4" />
            {t('db.page.createLocalBtn')}
          </button>
          <button
            onClick={() => { setEditingConn(undefined); setShowExtModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plug className="w-4 h-4" />
            {t('db.page.connectExtBtn')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-8 py-4 border-b border-white/10 shrink-0">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('db.page.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {localDbsLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : totalCount === 0 && !search ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center mb-2">
              <Database className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-white">{t('db.page.emptyTitle')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('db.page.emptySubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              <button
                onClick={() => setShowLocalModal(true)}
                className="group flex flex-col gap-4 p-6 bg-bg-card border border-white/10 rounded-2xl hover:border-orange-500/40 hover:bg-white/5 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center">
                  <Server className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-base">{t('db.page.createLocalCard')}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {t('db.page.createLocalCardDesc')}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-orange-400 font-medium group-hover:gap-2 transition-all">
                  {t('db.page.configure')} <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                onClick={() => { setEditingConn(undefined); setShowExtModal(true); }}
                className="group flex flex-col gap-4 p-6 bg-bg-card border border-white/10 rounded-2xl hover:border-blue-500/40 hover:bg-white/5 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <Plug className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-base">{t('db.page.connectExtCard')}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {t('db.page.connectExtCardDesc')}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-400 font-medium group-hover:gap-2 transition-all">
                  {t('db.page.connect')} <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 max-w-4xl">
            {/* Search empty */}
            {filteredLocal.length === 0 && filteredExt.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                <Database className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-gray-500 font-medium">{t('db.page.noResults')}</p>
              </div>
            )}

            {/* Local DB section */}
            {filteredLocal.length > 0 && (
              <>
                <p className="text-xs text-gray-600 uppercase tracking-widest font-medium px-1 mt-1">
                  {t('db.page.localSection')} · {filteredLocal.length}
                </p>
                {filteredLocal.map((db) => (
                  <LocalDbCard
                    key={db.id}
                    db={db}
                    onStart={handleStartLocal}
                    onStop={handleStopLocal}
                    onDelete={handleDeleteLocal}
                    onOpen={(id) => navigate(`/database/${id}`)}
                    actionLoading={actionLoading}
                  />
                ))}
              </>
            )}

            {/* External connections section */}
            {filteredExt.length > 0 && (
              <>
                <p className="text-xs text-gray-600 uppercase tracking-widest font-medium px-1 mt-3">
                  {t('db.page.extSection')} · {filteredExt.length}
                </p>
                {filteredExt.map((conn) => {
                  const typeMeta = DB_TYPES.find((t) => t.value === conn.type);
                  const iconClass = DB_ICON_COLORS[conn.type];
                  return (
                    <div key={conn.id} className="bg-[#0d0d0d] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
                            <Database className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-white font-semibold">{conn.name}</h3>
                              <span className="px-2 py-0.5 rounded-md bg-white/10 text-gray-400 text-xs">
                                {typeMeta?.label ?? conn.type}
                              </span>
                              {conn.ssl && (
                                <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 text-xs">SSL</span>
                              )}
                            </div>
                            {conn.type !== 'sqlite' && (
                              <p className="text-sm text-gray-500 mt-1">
                                {conn.username ? `${conn.username}@` : ''}{conn.host}:{conn.port}
                                {conn.database ? ` / ${conn.database}` : ''}
                              </p>
                            )}
                            {conn.type === 'sqlite' && (
                              <p className="text-sm text-gray-500 mt-1 font-mono">{conn.database}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                              <span>{t('db.card.createdAtExt')} {conn.createdAt.toLocaleDateString()}</span>
                              {conn.lastTested && (
                                <span className={`flex items-center gap-1 ${conn.testStatus === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                  {conn.testStatus === 'success'
                                    ? <CheckCircle className="w-3 h-3" />
                                    : <XCircle className="w-3 h-3" />}
                                  {t('db.card.tested')} {conn.lastTested.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleTestExt(conn.id)} disabled={testing.has(conn.id)}
                            title={t('db.card.testConnection')}
                            className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors disabled:opacity-40">
                            {testing.has(conn.id)
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button onClick={() => { setEditingConn(conn); setShowExtModal(true); }}
                            title={t('db.card.edit')}
                            className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteExt(conn.id)} title={t('db.card.delete')}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <LocalDbModal
        isOpen={showLocalModal}
        onClose={() => setShowLocalModal(false)}
        onCreated={handleLocalCreated}
      />
      <ExternalConnectionModal
        isOpen={showExtModal}
        onClose={() => { setShowExtModal(false); setEditingConn(undefined); }}
        onSave={handleExtSave}
        editing={editingConn}
      />
    </AppLayout>
  );
}

