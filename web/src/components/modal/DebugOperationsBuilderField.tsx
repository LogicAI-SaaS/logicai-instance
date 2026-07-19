/**
 * DebugOperationsBuilderField - Visual builder for liveCanvasDebugger operations
 */

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface DebugOperation {
  id: string;
  type: string;
  level?: string;
  message?: string;
  field?: string;
  label?: string;
}

const OP_TYPES = [
  { value: 'log',        label: '📋 Log message' },
  { value: 'inspect',    label: '🔍 Inspect field' },
  { value: 'assert',     label: '✅ Assert condition' },
  { value: 'timer',      label: '⏱ Timer (start/stop)' },
  { value: 'breakpoint', label: '🛑 Breakpoint' },
  { value: 'counter',    label: '🔢 Counter' },
];

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];

function genId() { return Math.random().toString(36).substring(2, 9); }
function normalize(v: any): DebugOperation[] { return Array.isArray(v) ? v : []; }

const inputCls = 'flex-1 bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 min-w-0';
const selectCls = 'bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 cursor-pointer';

interface Props { value: any; onChange: (v: DebugOperation[]) => void; }

export function DebugOperationsBuilderField({ value, onChange }: Props) {
  const ops = normalize(value);

  function add() { onChange([...ops, { id: genId(), type: 'log', level: 'info', message: '' }]); }
  function remove(id: string) { onChange(ops.filter(o => o.id !== id)); }
  function update(id: string, patch: Partial<DebugOperation>) {
    onChange(ops.map(o => o.id === id ? { ...o, ...patch } : o));
  }

  return (
    <div className="flex flex-col gap-2">
      {ops.length === 0 && (
        <p className="text-xs text-gray-500 px-1">No operations — add one below.</p>
      )}

      {ops.map((op, i) => (
        <div key={op.id} className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 w-4 shrink-0 text-center">{i + 1}</span>
            <select className={`${selectCls} flex-1`} value={op.type}
              onChange={e => update(op.id, { type: e.target.value })}>
              {OP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button type="button" onClick={() => remove(op.id)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {op.type === 'log' && (
            <div className="flex gap-1.5 pl-5">
              <select className={selectCls} value={op.level || 'info'}
                onChange={e => update(op.id, { level: e.target.value })}>
                {LOG_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <input type="text" className={inputCls} placeholder="Message or {{ $json.field }}"
                value={op.message || ''} onChange={e => update(op.id, { message: e.target.value })} />
            </div>
          )}
          {op.type === 'inspect' && (
            <div className="flex gap-1.5 pl-5">
              <input type="text" className={inputCls} placeholder="Field to inspect (e.g. $json.user)"
                value={op.field || ''} onChange={e => update(op.id, { field: e.target.value })} />
            </div>
          )}
          {op.type === 'assert' && (
            <div className="flex gap-1.5 pl-5">
              <input type="text" className={inputCls} placeholder="Condition (e.g. {{ $json.count }} > 0)"
                value={op.message || ''} onChange={e => update(op.id, { message: e.target.value })} />
            </div>
          )}
          {op.type === 'timer' && (
            <div className="flex gap-1.5 pl-5">
              <select className={selectCls} value={op.level || 'start'}
                onChange={e => update(op.id, { level: e.target.value })}>
                <option value="start">Start</option>
                <option value="stop">Stop</option>
              </select>
              <input type="text" className={inputCls} placeholder="Timer label"
                value={op.label || ''} onChange={e => update(op.id, { label: e.target.value })} />
            </div>
          )}
          {op.type === 'counter' && (
            <div className="flex gap-1.5 pl-5">
              <input type="text" className={inputCls} placeholder="Counter name"
                value={op.label || ''} onChange={e => update(op.id, { label: e.target.value })} />
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={add}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-xs self-start">
        <Plus className="w-3.5 h-3.5" /> Add Operation
      </button>
    </div>
  );
}
