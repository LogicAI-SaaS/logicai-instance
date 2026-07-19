/**
 * HttpRequestBuilderField - Full HTTP request configuration UI
 * url, method, query params, headers, body, options
 */

import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
export interface KVPair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface HttpRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  sendQuery: boolean;
  queryParams: KVPair[];
  sendHeaders: boolean;
  headers: KVPair[];
  sendBody: boolean;
  bodyType: 'json' | 'form' | 'raw' | 'binary';
  bodyJson: string;
  bodyForm: KVPair[];
  bodyRaw: string;
  // Options
  batching: boolean;
  batchSize: number;
  ignoreSsl: boolean;
  lowercaseHeaders: boolean;
  redirects: boolean;
  maxRedirects: number;
  responseFormat: 'auto' | 'json' | 'text' | 'binary';
  pagination: boolean;
  paginationParam: string;
  proxy: string;
  timeout: number;
}

function genId() {
  return Math.random().toString(36).substring(2, 9);
}

function emptyKV(): KVPair {
  return { id: genId(), key: '', value: '', enabled: true };
}

const DEFAULT: HttpRequestConfig = {
  url: '',
  method: 'GET',
  sendQuery: false,
  queryParams: [],
  sendHeaders: false,
  headers: [],
  sendBody: false,
  bodyType: 'json',
  bodyJson: '{}',
  bodyForm: [],
  bodyRaw: '',
  batching: false,
  batchSize: 10,
  ignoreSsl: false,
  lowercaseHeaders: false,
  redirects: true,
  maxRedirects: 3,
  responseFormat: 'auto',
  pagination: false,
  paginationParam: 'page',
  proxy: '',
  timeout: 30000,
};

function normalize(v: any): HttpRequestConfig {
  if (v && typeof v === 'object' && 'url' in v) return { ...DEFAULT, ...v };
  return { ...DEFAULT };
}

// ── Sub-components ─────────────────────────────────────────────────────────
const inputCls = 'flex-1 bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 min-w-0';
const selectCls = 'bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 cursor-pointer';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${checked ? 'bg-brand-blue' : 'bg-white/20'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function KVBuilder({ pairs, onChange, keyPlaceholder = 'key', valuePlaceholder = 'value' }: {
  pairs: KVPair[];
  onChange: (pairs: KVPair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  function add() { onChange([...pairs, emptyKV()]); }
  function remove(id: string) {
    const f = pairs.filter(p => p.id !== id);
    onChange(f.length > 0 ? f : []);
  }
  function update(id: string, patch: Partial<KVPair>) {
    onChange(pairs.map(p => p.id === id ? { ...p, ...patch } : p));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {pairs.map(p => (
        <div key={p.id} className="flex items-center gap-1.5">
          <button type="button" onClick={() => update(p.id, { enabled: !p.enabled })}
            className={`w-4 h-4 rounded border shrink-0 transition-colors ${p.enabled ? 'bg-brand-blue border-brand-blue' : 'bg-transparent border-white/20'}`}
            title={p.enabled ? 'Disable' : 'Enable'}
          />
          <input type="text" className={inputCls} placeholder={keyPlaceholder} value={p.key}
            onChange={e => update(p.id, { key: e.target.value })} />
          <input type="text" className={inputCls} placeholder={valuePlaceholder} value={p.value}
            onChange={e => update(p.id, { value: e.target.value })} />
          <button type="button" onClick={() => remove(p.id)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-xs self-start">
        <Plus className="w-3 h-3" /> Add parameter
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
interface Props {
  value: HttpRequestConfig | any;
  onChange: (val: HttpRequestConfig) => void;
}

const AVAILABLE_OPTIONS = [
  { key: 'batching', label: 'Batching' },
  { key: 'ignoreSsl', label: 'Ignore SSL Issues (Insecure)' },
  { key: 'lowercaseHeaders', label: 'Lowercase Headers' },
  { key: 'redirects', label: 'Redirects' },
  { key: 'responseFormat', label: 'Response' },
  { key: 'pagination', label: 'Pagination' },
  { key: 'proxy', label: 'Proxy' },
  { key: 'timeout', label: 'Timeout' },
] as const;

type OptionKey = typeof AVAILABLE_OPTIONS[number]['key'];

export function HttpRequestBuilderField({ value, onChange }: Props) {
  const data = normalize(value);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionDropdownOpen, setOptionDropdownOpen] = useState(false);
  const [activeOptions, setActiveOptions] = useState<Set<OptionKey>>(() => {
    // Pre-activate options that have non-default values
    const set = new Set<OptionKey>();
    if (data.batching) set.add('batching');
    if (data.ignoreSsl) set.add('ignoreSsl');
    if (data.lowercaseHeaders) set.add('lowercaseHeaders');
    if (!data.redirects || data.maxRedirects !== 3) set.add('redirects');
    if (data.responseFormat !== 'auto') set.add('responseFormat');
    if (data.pagination) set.add('pagination');
    if (data.proxy) set.add('proxy');
    if (data.timeout !== 30000) set.add('timeout');
    return set;
  });

  function u(patch: Partial<HttpRequestConfig>) {
    onChange({ ...data, ...patch });
  }

  function addOption(key: OptionKey) {
    setActiveOptions(prev => new Set([...prev, key]));
    setOptionDropdownOpen(false);
  }

  function removeOption(key: OptionKey) {
    setActiveOptions(prev => { const s = new Set(prev); s.delete(key); return s; });
  }

  const inactiveOptions = AVAILABLE_OPTIONS.filter(o => !activeOptions.has(o.key));

  return (
    <div className="flex flex-col gap-4 text-sm">

      {/* URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">URL</label>
        <input type="text" className={`${inputCls} w-full`} placeholder="https://api.example.com/endpoint"
          value={data.url} onChange={e => u({ url: e.target.value })} />
      </div>

      {/* Method */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Method</label>
        <select className={`${selectCls} w-full`} value={data.method}
          onChange={e => u({ method: e.target.value as any })}>
          {['GET','POST','PUT','DELETE','PATCH','HEAD','OPTIONS'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Query Parameters */}
      <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">Query Parameters</span>
          <Toggle checked={data.sendQuery} onChange={v => u({ sendQuery: v, queryParams: v && data.queryParams.length === 0 ? [emptyKV()] : data.queryParams })} />
        </div>
        {data.sendQuery && (
          <div className="mt-1">
            <div className="flex gap-1.5 mb-1.5 text-[11px] text-gray-500 px-6">
              <span className="flex-1">Name</span>
              <span className="flex-1">Value</span>
              <span className="w-7" />
            </div>
            <KVBuilder pairs={data.queryParams} onChange={p => u({ queryParams: p })} 
              keyPlaceholder="parameter" valuePlaceholder="{{ $json.value }}" />
          </div>
        )}
      </div>

      {/* Headers */}
      <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">Headers</span>
          <Toggle checked={data.sendHeaders} onChange={v => u({ sendHeaders: v, headers: v && data.headers.length === 0 ? [emptyKV()] : data.headers })} />
        </div>
        {data.sendHeaders && (
          <div className="mt-1">
            <div className="flex gap-1.5 mb-1.5 text-[11px] text-gray-500 px-6">
              <span className="flex-1">Name</span>
              <span className="flex-1">Value</span>
              <span className="w-7" />
            </div>
            <KVBuilder pairs={data.headers} onChange={p => u({ headers: p })}
              keyPlaceholder="Content-Type" valuePlaceholder="application/json" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">Body</span>
          <Toggle checked={data.sendBody} onChange={v => u({ sendBody: v })} />
        </div>
        {data.sendBody && (
          <div className="flex flex-col gap-3 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Body Type</span>
              <select className={`${selectCls} w-full`} value={data.bodyType} onChange={e => u({ bodyType: e.target.value as any })}>
                <option value="json">JSON</option>
                <option value="form">Form Data (URL-encoded)</option>
                <option value="raw">Raw Text</option>
                <option value="binary">Binary</option>
              </select>
            </div>
            {data.bodyType === 'json' && (
              <textarea rows={5} className="w-full bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all resize-none hover:border-white/20"
                placeholder={'{\n  "key": "{{ $json.value }}"\n}'}
                value={data.bodyJson} onChange={e => u({ bodyJson: e.target.value })} />
            )}
            {data.bodyType === 'form' && (
              <KVBuilder pairs={data.bodyForm} onChange={p => u({ bodyForm: p })}
                keyPlaceholder="field" valuePlaceholder="{{ $json.value }}" />
            )}
            {(data.bodyType === 'raw' || data.bodyType === 'binary') && (
              <textarea rows={4} className="w-full bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all resize-none hover:border-white/20"
                placeholder="Raw content…"
                value={data.bodyRaw} onChange={e => u({ bodyRaw: e.target.value })} />
            )}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        <button type="button" onClick={() => setOptionsOpen(o => !o)}
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-white/20 transition-all">
          <span className="font-medium text-sm">Options</span>
          {optionsOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>

        {optionsOpen && (
          <div className="flex flex-col gap-2 pl-1">
            {activeOptions.size === 0 && (
              <span className="text-xs text-gray-500 px-2">No properties</span>
            )}

            {/* Batching */}
            {activeOptions.has('batching') && (
              <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm font-medium">Batching</span>
                  <button type="button" onClick={() => removeOption('batching')}
                    className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 shrink-0">Batch Size</span>
                  <input type="number" min={1} className={`${inputCls}`} value={data.batchSize}
                    onChange={e => u({ batchSize: parseInt(e.target.value) || 10 })} />
                </div>
              </div>
            )}

            {/* Ignore SSL */}
            {activeOptions.has('ignoreSsl') && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-gray-300 text-sm">Ignore SSL Issues (Insecure)</span>
                <div className="flex items-center gap-2">
                  <Toggle checked={data.ignoreSsl} onChange={v => u({ ignoreSsl: v })} />
                  <button type="button" onClick={() => removeOption('ignoreSsl')}
                    className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}

            {/* Lowercase Headers */}
            {activeOptions.has('lowercaseHeaders') && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-gray-300 text-sm">Lowercase Headers</span>
                <div className="flex items-center gap-2">
                  <Toggle checked={data.lowercaseHeaders} onChange={v => u({ lowercaseHeaders: v })} />
                  <button type="button" onClick={() => removeOption('lowercaseHeaders')}
                    className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}

            {/* Redirects */}
            {activeOptions.has('redirects') && (
              <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm font-medium">Redirects</span>
                  <div className="flex items-center gap-2">
                    <Toggle checked={data.redirects} onChange={v => u({ redirects: v })} />
                    <button type="button" onClick={() => removeOption('redirects')}
                      className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {data.redirects && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 shrink-0">Max Redirects</span>
                    <input type="number" min={0} className={inputCls} value={data.maxRedirects}
                      onChange={e => u({ maxRedirects: parseInt(e.target.value) || 3 })} />
                  </div>
                )}
              </div>
            )}

            {/* Response */}
            {activeOptions.has('responseFormat') && (
              <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm font-medium">Response Format</span>
                  <button type="button" onClick={() => removeOption('responseFormat')}
                    className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <select className={`${selectCls} w-full`} value={data.responseFormat}
                  onChange={e => u({ responseFormat: e.target.value as any })}>
                  <option value="auto">Auto-detect</option>
                  <option value="json">JSON</option>
                  <option value="text">Text</option>
                  <option value="binary">Binary</option>
                </select>
              </div>
            )}

            {/* Pagination */}
            {activeOptions.has('pagination') && (
              <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm font-medium">Pagination</span>
                  <div className="flex items-center gap-2">
                    <Toggle checked={data.pagination} onChange={v => u({ pagination: v })} />
                    <button type="button" onClick={() => removeOption('pagination')}
                      className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {data.pagination && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 shrink-0">Page Param</span>
                    <input type="text" className={inputCls} placeholder="page" value={data.paginationParam}
                      onChange={e => u({ paginationParam: e.target.value })} />
                  </div>
                )}
              </div>
            )}

            {/* Proxy */}
            {activeOptions.has('proxy') && (
              <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm font-medium">Proxy</span>
                  <button type="button" onClick={() => removeOption('proxy')}
                    className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <input type="text" className={`${inputCls} w-full`} placeholder="http://proxy:8080"
                  value={data.proxy} onChange={e => u({ proxy: e.target.value })} />
              </div>
            )}

            {/* Timeout */}
            {activeOptions.has('timeout') && (
              <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm font-medium">Timeout (ms)</span>
                  <button type="button" onClick={() => removeOption('timeout')}
                    className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <input type="number" min={0} className={`${inputCls} w-full`} value={data.timeout}
                  onChange={e => u({ timeout: parseInt(e.target.value) || 30000 })} />
              </div>
            )}

            {/* Add option dropdown */}
            {inactiveOptions.length > 0 && (
              <div className="relative">
                <button type="button" onClick={() => setOptionDropdownOpen(o => !o)}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm">
                  <span>Add option</span>
                  {optionDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {optionDropdownOpen && (
                  <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-white/10 rounded-xl shadow-xl overflow-hidden">
                    {inactiveOptions.map(opt => (
                      <button key={opt.key} type="button" onClick={() => addOption(opt.key)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
