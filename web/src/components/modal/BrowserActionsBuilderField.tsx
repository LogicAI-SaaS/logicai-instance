/**
 * BrowserActionsBuilderField - Visual step builder for noCodeBrowserAutomator
 * Each step has a type + dynamic fields based on that type
 */

import React from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export interface BrowserAction {
  id: string;
  type: string;
  // Fields depend on type:
  url?: string;
  selector?: string;
  value?: string;
  ms?: number;
  filename?: string;
  direction?: 'up' | 'down';
  px?: number;
  code?: string;
  timeout?: number;
}

const ACTION_TYPES = [
  { value: 'goto',             label: '🌐 Go to URL' },
  { value: 'click',            label: '🖱 Click' },
  { value: 'fill',             label: '✏️ Fill Input' },
  { value: 'select',           label: '☑️ Select Option' },
  { value: 'waitForSelector',  label: '⏳ Wait for Element' },
  { value: 'wait',             label: '⏱ Wait (ms)' },
  { value: 'screenshot',       label: '📷 Screenshot' },
  { value: 'scroll',           label: '↕️ Scroll' },
  { value: 'evaluate',         label: '⚙️ Run JavaScript' },
];

function genId() { return Math.random().toString(36).substring(2, 9); }

function normalize(v: any): BrowserAction[] {
  if (Array.isArray(v)) return v;
  return [];
}

const inputCls = 'flex-1 bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 min-w-0';
const selectCls = 'bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 cursor-pointer';
const smallInputCls = 'w-24 bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 shrink-0';

interface Props { value: any; onChange: (v: BrowserAction[]) => void; }

export function BrowserActionsBuilderField({ value, onChange }: Props) {
  const actions = normalize(value);

  function add() {
    onChange([...actions, { id: genId(), type: 'goto', url: '' }]);
  }
  function remove(id: string) {
    onChange(actions.filter(a => a.id !== id));
  }
  function update(id: string, patch: Partial<BrowserAction>) {
    onChange(actions.map(a => a.id === id ? { ...a, ...patch } : a));
  }
  function move(index: number, dir: -1 | 1) {
    const arr = [...actions];
    const [item] = arr.splice(index, 1);
    arr.splice(index + dir, 0, item);
    onChange(arr);
  }

  return (
    <div className="flex flex-col gap-2">
      {actions.length === 0 && (
        <p className="text-xs text-gray-500 px-1">No steps yet — add one below.</p>
      )}

      {actions.map((action, i) => (
        <div key={action.id} className="flex gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
          {/* Step number + reorder */}
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)}
              className="p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors">
              <ChevronUp className="w-3 h-3" />
            </button>
            <span className="text-xs text-gray-500 w-4 text-center">{i + 1}</span>
            <button type="button" disabled={i === actions.length - 1} onClick={() => move(i, 1)}
              className="p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors">
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Type select */}
            <select className={`${selectCls} w-full`} value={action.type}
              onChange={e => update(action.id, { type: e.target.value })}>
              {ACTION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            {/* Dynamic fields */}
            {action.type === 'goto' && (
              <input type="text" className={inputCls} placeholder="https://example.com"
                value={action.url || ''} onChange={e => update(action.id, { url: e.target.value })} />
            )}
            {(action.type === 'click') && (
              <input type="text" className={inputCls} placeholder="CSS selector (e.g. #submit, .btn)"
                value={action.selector || ''} onChange={e => update(action.id, { selector: e.target.value })} />
            )}
            {action.type === 'fill' && (
              <div className="flex gap-1.5">
                <input type="text" className={inputCls} placeholder="CSS selector"
                  value={action.selector || ''} onChange={e => update(action.id, { selector: e.target.value })} />
                <input type="text" className={inputCls} placeholder="Value to fill"
                  value={action.value || ''} onChange={e => update(action.id, { value: e.target.value })} />
              </div>
            )}
            {action.type === 'select' && (
              <div className="flex gap-1.5">
                <input type="text" className={inputCls} placeholder="CSS selector (e.g. select#country)"
                  value={action.selector || ''} onChange={e => update(action.id, { selector: e.target.value })} />
                <input type="text" className={inputCls} placeholder="Option value"
                  value={action.value || ''} onChange={e => update(action.id, { value: e.target.value })} />
              </div>
            )}
            {action.type === 'waitForSelector' && (
              <div className="flex gap-1.5">
                <input type="text" className={inputCls} placeholder="CSS selector to wait for"
                  value={action.selector || ''} onChange={e => update(action.id, { selector: e.target.value })} />
                <input type="number" className={smallInputCls} placeholder="ms" min={0}
                  value={action.timeout ?? 5000} onChange={e => update(action.id, { timeout: parseInt(e.target.value) || 5000 })} />
              </div>
            )}
            {action.type === 'wait' && (
              <div className="flex items-center gap-2">
                <input type="number" className={smallInputCls} placeholder="ms" min={0}
                  value={action.ms ?? 1000} onChange={e => update(action.id, { ms: parseInt(e.target.value) || 1000 })} />
                <span className="text-xs text-gray-500">milliseconds</span>
              </div>
            )}
            {action.type === 'screenshot' && (
              <input type="text" className={inputCls} placeholder="Output filename (e.g. screenshot.png)"
                value={action.filename || ''} onChange={e => update(action.id, { filename: e.target.value })} />
            )}
            {action.type === 'scroll' && (
              <div className="flex gap-1.5">
                <select className={selectCls} value={action.direction || 'down'}
                  onChange={e => update(action.id, { direction: e.target.value as any })}>
                  <option value="down">↓ Down</option>
                  <option value="up">↑ Up</option>
                </select>
                <input type="number" className={smallInputCls} placeholder="px" min={0}
                  value={action.px ?? 500} onChange={e => update(action.id, { px: parseInt(e.target.value) || 500 })} />
              </div>
            )}
            {action.type === 'evaluate' && (
              <textarea rows={3} className="w-full bg-black/30 border border-white/10 rounded-lg text-white text-xs px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none hover:border-white/20"
                placeholder="() => document.title"
                value={action.code || ''} onChange={e => update(action.id, { code: e.target.value })} />
            )}
          </div>

          <button type="button" onClick={() => remove(action.id)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors self-start shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <button type="button" onClick={add}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-xs self-start">
        <Plus className="w-3.5 h-3.5" /> Add Step
      </button>
    </div>
  );
}
