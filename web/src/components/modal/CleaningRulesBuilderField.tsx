/**
 * CleaningRulesBuilderField - Visual builder for smartDataCleaner cleaning rules
 * Each rule: field name + cleaning type + optional format
 */

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface CleaningRule {
  id: string;
  field: string;
  type: string;
  format?: string;
}

const CLEANING_TYPES = [
  { value: 'trim',           label: 'Trim whitespace' },
  { value: 'lowercase',      label: 'Lowercase' },
  { value: 'uppercase',      label: 'Uppercase' },
  { value: 'normalizePhone', label: 'Normalize Phone' },
  { value: 'normalizeDate',  label: 'Normalize Date' },
  { value: 'removeSpaces',   label: 'Remove Spaces' },
  { value: 'removeEmpty',    label: 'Remove if Empty' },
  { value: 'toNumber',       label: 'To Number' },
  { value: 'toBoolean',      label: 'To Boolean' },
  { value: 'replaceRegex',   label: 'Replace (Regex)' },
];

const FORMAT_HINTS: Record<string, string> = {
  normalizePhone: 'e.g. E164 or national',
  normalizeDate:  'e.g. YYYY-MM-DD',
  replaceRegex:   'e.g. /foo/g → bar',
};

const TYPES_WITH_FORMAT = ['normalizePhone', 'normalizeDate', 'replaceRegex'];

function genId() { return Math.random().toString(36).substring(2, 9); }

function normalize(v: any): CleaningRule[] {
  if (Array.isArray(v)) return v;
  return [];
}

const inputCls = 'flex-1 bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 min-w-0';
const selectCls = 'bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 cursor-pointer';

interface Props { value: any; onChange: (v: CleaningRule[]) => void; }

export function CleaningRulesBuilderField({ value, onChange }: Props) {
  const rules = normalize(value);

  function add() {
    onChange([...rules, { id: genId(), field: '', type: 'trim' }]);
  }
  function remove(id: string) {
    onChange(rules.filter(r => r.id !== id));
  }
  function update(id: string, patch: Partial<CleaningRule>) {
    onChange(rules.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  return (
    <div className="flex flex-col gap-2">
      {rules.length === 0 && (
        <p className="text-xs text-gray-500 px-1">No rules yet — add one below.</p>
      )}

      {rules.map((rule, i) => (
        <div key={rule.id} className="flex flex-col gap-1.5 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 w-4 shrink-0 text-center">{i + 1}</span>
            <input type="text" className={inputCls} placeholder="Field name (e.g. phone)" value={rule.field}
              onChange={e => update(rule.id, { field: e.target.value })} />
            <select className={selectCls} value={rule.type}
              onChange={e => update(rule.id, { type: e.target.value, format: '' })}>
              {CLEANING_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button type="button" onClick={() => remove(rule.id)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {TYPES_WITH_FORMAT.includes(rule.type) && (
            <div className="flex items-center gap-1.5 pl-5">
              <span className="text-xs text-gray-500 shrink-0">Format</span>
              <input type="text" className={inputCls} placeholder={FORMAT_HINTS[rule.type] || ''}
                value={rule.format || ''}
                onChange={e => update(rule.id, { format: e.target.value })} />
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={add}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-xs self-start">
        <Plus className="w-3.5 h-3.5" /> Add Rule
      </button>
    </div>
  );
}
