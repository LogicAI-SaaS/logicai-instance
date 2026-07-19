/**
 * FtpBuilderField - Complete FTP/FTPS/SFTP configuration with inline folder browser
 */

import React, { useState, useCallback } from 'react';
import {
  Folder,
  File,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Check,
  X,
  Search,
  Loader2,
} from 'lucide-react';
import { localApiRequest } from '../../config/api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface FtpConfig {
  operation: string;
  protocol: 'ftp' | 'ftps' | 'sftp';
  host: string;
  port: number;
  user: string;
  password: string;
  privateKey?: string;
  remotePath: string;
}

interface FtpItem {
  name: string;
  type: 'file' | 'dir';
  size: number;
  date?: string;
}

const DEFAULT: FtpConfig = {
  operation: 'upload',
  protocol: 'ftp',
  host: '',
  port: 21,
  user: '',
  password: '',
  remotePath: '/',
};

function normalize(v: any): FtpConfig {
  if (v && typeof v === 'object' && 'protocol' in v) return { ...DEFAULT, ...v };
  return { ...DEFAULT };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function joinPath(base: string, name: string): string {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${b}/${name}`;
}

function parentPath(p: string): string {
  if (p === '/' || p === '') return '/';
  const parts = p.replace(/\/$/, '').split('/');
  parts.pop();
  return parts.join('/') || '/';
}

function breadcrumbs(p: string): { label: string; path: string }[] {
  if (p === '/') return [{ label: 'root', path: '/' }];
  const parts = p.replace(/^\//, '').split('/');
  const result: { label: string; path: string }[] = [{ label: 'root', path: '/' }];
  let cumul = '';
  for (const part of parts) {
    cumul += '/' + part;
    result.push({ label: part, path: cumul });
  }
  return result;
}

// ── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  'flex-1 bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 min-w-0';
const selectCls =
  'bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 cursor-pointer';

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  value: FtpConfig | any;
  onChange: (val: FtpConfig) => void;
}

type ConnStatus = 'idle' | 'testing' | 'ok' | 'error';

export function FtpBuilderField({ value, onChange }: Props) {
  const data = normalize(value);
  const [connStatus, setConnStatus] = useState<ConnStatus>('idle');
  const [connError, setConnError] = useState<string>('');
  const [browserOpen, setBrowserOpen] = useState(false);
  const [browsePath, setBrowsePath] = useState(data.remotePath || '/');
  const [browserItems, setBrowserItems] = useState<FtpItem[]>([]);
  const [browserLoading, setBrowserLoading] = useState(false);
  const [browserError, setBrowserError] = useState<string>('');
  const [search, setSearch] = useState('');

  function u(patch: Partial<FtpConfig>) {
    const next = { ...data, ...patch };
    // Auto-set default port when protocol changes
    if (patch.protocol) {
      if (patch.protocol === 'sftp') next.port = 22;
      else next.port = 21;
    }
    onChange(next);
  }

  // ── Connection test ──────────────────────────────────────────────────────
  async function testConnection() {
    setConnStatus('testing');
    setConnError('');
    try {
      const res = await localApiRequest('/api/ftp/browse', {
        method: 'POST',
        body: JSON.stringify({
          protocol: data.protocol,
          host: data.host,
          port: data.port,
          user: data.user,
          password: data.password,
          privateKey: data.privateKey,
          path: '/',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setConnStatus('ok');
      } else {
        setConnStatus('error');
        setConnError(json.error || 'Connection failed');
      }
    } catch (e: any) {
      setConnStatus('error');
      setConnError(e.message || 'Network error');
    }
  }

  // ── Browser ──────────────────────────────────────────────────────────────
  const loadPath = useCallback(
    async (path: string) => {
      setBrowserLoading(true);
      setBrowserError('');
      setSearch('');
      try {
        const res = await localApiRequest('/api/ftp/browse', {
          method: 'POST',
          body: JSON.stringify({
            protocol: data.protocol,
            host: data.host,
            port: data.port,
            user: data.user,
            password: data.password,
            privateKey: data.privateKey,
            path,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setBrowserItems(json.items);
          setBrowsePath(path);
        } else {
          setBrowserError(json.error || 'Failed to list directory');
        }
      } catch (e: any) {
        setBrowserError(e.message || 'Network error');
      } finally {
        setBrowserLoading(false);
      }
    },
    [data.protocol, data.host, data.port, data.user, data.password, data.privateKey],
  );

  function openBrowser() {
    setBrowserOpen(true);
    loadPath(data.remotePath || '/');
  }

  function selectPath(path: string) {
    u({ remotePath: path });
    setBrowserOpen(false);
  }

  const crumbs = breadcrumbs(browsePath);
  const filtered = browserItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4 text-sm">

      {/* Operation */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Operation</label>
        <select className={`${selectCls} w-full`} value={data.operation} onChange={e => u({ operation: e.target.value })}>
          <option value="upload">Upload File</option>
          <option value="download">Download File</option>
          <option value="list">List Directory</option>
          <option value="delete">Delete File</option>
          <option value="rename">Rename File</option>
          <option value="mkdir">Create Directory</option>
        </select>
      </div>

      {/* Connection */}
      <div className="flex flex-col gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Connection</span>

        {/* Protocol + Host + Port */}
        <div className="flex gap-2">
          <select className={selectCls} value={data.protocol}
            onChange={e => u({ protocol: e.target.value as any })}>
            <option value="ftp">FTP</option>
            <option value="ftps">FTPS</option>
            <option value="sftp">SFTP</option>
          </select>
          <input type="text" className={inputCls} placeholder="ftp.example.com"
            value={data.host} onChange={e => u({ host: e.target.value })} />
          <input type="number" className="w-20 bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 shrink-0"
            min={1} max={65535} value={data.port}
            onChange={e => u({ port: parseInt(e.target.value) || 21 })} />
        </div>

        {/* User + Password */}
        <div className="flex gap-2">
          <input type="text" className={inputCls} placeholder="Username"
            value={data.user} onChange={e => u({ user: e.target.value })} />
          <input type="password" className={inputCls} placeholder="Password"
            value={data.password} onChange={e => u({ password: e.target.value })} />
        </div>

        {/* Private Key (SFTP only) */}
        {data.protocol === 'sftp' && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Private Key (optional, instead of password)</span>
            <textarea rows={3} className="w-full bg-black/30 border border-white/10 rounded-lg text-white text-xs px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none hover:border-white/20"
              placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
              value={data.privateKey || ''}
              onChange={e => u({ privateKey: e.target.value })} />
          </div>
        )}

        {/* Test connection */}
        <div className="flex items-center gap-2">
          <button type="button"
            disabled={!data.host || connStatus === 'testing'}
            onClick={testConnection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs">
            {connStatus === 'testing'
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />}
            Test Connection
          </button>
          {connStatus === 'ok' && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <Check className="w-3.5 h-3.5" /> Connected
            </span>
          )}
          {connStatus === 'error' && (
            <span className="flex items-center gap-1 text-xs text-red-400 truncate max-w-xs" title={connError}>
              <X className="w-3.5 h-3.5 shrink-0" /> {connError}
            </span>
          )}
        </div>
      </div>

      {/* Remote Path */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Remote Path</label>
        <div className="flex gap-2">
          <input type="text" className={inputCls} placeholder="/uploads/file.txt"
            value={data.remotePath} onChange={e => u({ remotePath: e.target.value })} />
          <button type="button"
            disabled={!data.host}
            onClick={openBrowser}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-blue/20 border border-brand-blue/40 text-brand-blue hover:bg-brand-blue/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs shrink-0 font-medium">
            <Folder className="w-3.5 h-3.5" /> Browse
          </button>
        </div>
      </div>

      {/* ── Inline File Browser ─────────────────────────────────────────── */}
      {browserOpen && (
        <div className="flex flex-col rounded-xl border border-white/10 bg-black/40 overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-card border-b border-white/10">
            <button type="button" onClick={() => loadPath(parentPath(browsePath))}
              disabled={browsePath === '/' || browserLoading}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto text-xs">
              {crumbs.map((crumb, i) => (
                <React.Fragment key={crumb.path}>
                  {i > 0 && <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />}
                  <button type="button"
                    onClick={() => loadPath(crumb.path)}
                    className={`px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors shrink-0 ${i === crumbs.length - 1 ? 'text-white font-medium' : 'text-gray-400 hover:text-white'}`}>
                    {crumb.label}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Refresh */}
            <button type="button" onClick={() => loadPath(browsePath)} disabled={browserLoading}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${browserLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Close */}
            <button type="button" onClick={() => setBrowserOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-white/10">
            <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <input type="text" className="flex-1 bg-transparent text-white text-xs focus:outline-none placeholder-gray-600"
                placeholder="Filter…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* File List */}
          <div className="max-h-56 overflow-y-auto">
            {browserLoading && (
              <div className="flex items-center justify-center gap-2 py-8 text-gray-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
              </div>
            )}
            {browserError && !browserLoading && (
              <div className="flex items-center gap-2 px-4 py-4 text-red-400 text-xs">
                <X className="w-4 h-4 shrink-0" /> {browserError}
              </div>
            )}
            {!browserLoading && !browserError && filtered.length === 0 && (
              <div className="py-8 text-center text-gray-500 text-xs">Empty directory</div>
            )}
            {!browserLoading && !browserError && filtered.map(item => (
              <div key={item.name}
                className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors group cursor-default">
                {item.type === 'dir'
                  ? <Folder className="w-4 h-4 text-yellow-400/80 shrink-0" />
                  : <File className="w-4 h-4 text-gray-500 shrink-0" />}
                <span
                  className={`flex-1 text-xs truncate ${item.type === 'dir' ? 'text-yellow-100 hover:text-white cursor-pointer' : 'text-gray-300'}`}
                  onClick={() => item.type === 'dir' && loadPath(joinPath(browsePath, item.name))}>
                  {item.name}
                </span>
                <span className="text-xs text-gray-600 shrink-0 w-16 text-right">
                  {item.type === 'file' ? formatSize(item.size) : ''}
                </span>
                <button type="button"
                  onClick={() => selectPath(joinPath(browsePath, item.name))}
                  className="px-2 py-0.5 rounded text-xs bg-brand-blue/20 text-brand-blue hover:bg-brand-blue/40 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                  Select
                </button>
              </div>
            ))}
          </div>

          {/* Footer: select current directory */}
          <div className="px-3 py-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-500 truncate">{browsePath}</span>
            <button type="button" onClick={() => selectPath(browsePath)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-medium hover:bg-brand-blue/80 transition-colors shrink-0">
              <Check className="w-3 h-3" /> Use this directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
