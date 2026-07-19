/**
 * GhostOperationsBuilderField - Visual builder for ghost node (GDPR privacy operations)
 * Operations: mask, remove, hash, pseudonymize, encrypt fields
 */

import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';

export interface GhostOperation {
  id: string;
  type: string;
  fields: string[];
  format?: string;
}

const OP_TYPES = [
  { value: 'mask',           label: '🔲 Mask (partial hide)', desc: 'e.g. 4111****1111' },
  { value: 'remove',         label: '🗑 Remove field', desc: 'Deletes the field entirely' },
  { value: 'hash',           label: '#  Hash (one-way)', desc: 'SHA-256 by default' },
  { value: 'pseudonymize',   label: '🎭 Pseudonymize', desc: 'Replace with consistent fake' },
  { value: 'encrypt',        label: '🔒 Encrypt', desc: 'AES reversible encryption' },
  { value: 'redact',         label: '⬛ Redact', desc: 'Replace with [REDACTED]' },
];

const FORMAT_HINTS: Record<string, string> = {
  mask:         'Pattern: e.g. ****@****.com',
  hash:         'Algorithm: sha256 / sha512 / md5',
  pseudonymize: 'Type: name / email / phone / id',
  encrypt:      'Key: your-encryption-key',
};

const TYPES_WITH_FORMAT = ['mask', 'hash', 'pseudonymize', 'encrypt'];

function genId() { return Math.random().toString(36).substring(2, 9); }
function normalize(v: any): GhostOperation[] { return Array.isArray(v) ? v : []; }

const inputCls = 'flex-1 bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 min-w-0';
const selectCls = 'bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 cursor-pointer';

interface Props { value: any; onChange: (v: GhostOperation[]) => void; }

export function GhostOperationsBuilderField({ value, onChange }: Props) {
  const ops = normalize(value);

  function add() { onChange([...ops, { id: genId(), type: 'mask', fields: [] }]); }
  function remove(id: string) { onChange(ops.filter(o => o.id !== id)); }
  function update(id: string, patch: Partial<GhostOperation>) {
    onChange(ops.map(o => o.id === id ? { ...o, ...patch } : o));
  }

  function addField(id: string, field: string) {
    const op = ops.find(o => o.id === id);
    if (!op || !field.trim() || op.fields.includes(field.trim())) return;
    update(id, { fields: [...op.fields, field.trim()] });
  }

  function removeField(id: string, field: string) {
    const op = ops.find(o => o.id === id);
    if (!op) return;
    update(id, { fields: op.fields.filter(f => f !== field) });
  }

  return (
    <div className="flex flex-col gap-2">
      {ops.length === 0 && (
        <p className="text-xs text-gray-500 px-1">No privacy operations — add one below.</p>
      )}

      {ops.map((op, i) => (
        <div key={op.id} className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
          {/* Header: number + type select + remove */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 w-4 shrink-0 text-center">{i + 1}</span>
            <select className={`${selectCls} flex-1`} value={op.type}
              onChange={e => update(op.id, { type: e.target.value, format: '' })}>
              {OP_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button type="button" onClick={() => remove(op.id)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Description hint */}
          <p className="text-xs text-gray-500 pl-5">
            {OP_TYPES.find(t => t.value === op.type)?.desc}
          </p>

          {/* Target fields */}
          <div className="flex flex-col gap-1.5 pl-5">
            <span className="text-xs text-gray-400">Target Fields</span>
            <div className="flex flex-wrap gap-1.5">
              {op.fields.map(f => (
                <span key={f} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue/20 border border-brand-blue/40 text-brand-blue text-xs">
                  {f}
                  <button type="button" onClick={() => removeField(op.id, f)}
                    className="hover:text-white transition-colors">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <FieldInput onAdd={field => addField(op.id, field)} />
            </div>
          </div>

          {/* Format option (for specific types) */}
          {TYPES_WITH_FORMAT.includes(op.type) && (
            <div className="flex items-center gap-1.5 pl-5">
              <span className="text-xs text-gray-500 shrink-0">Option</span>
              <input type="text" className={inputCls} placeholder={FORMAT_HINTS[op.type] || ''}
                value={op.format || ''} onChange={e => update(op.id, { format: e.target.value })} />
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

// Small inline input to add a field name
function FieldInput({ onAdd }: { onAdd: (f: string) => void }) {
  const [val, setVal] = React.useState('');
  function commit() {
    if (val.trim()) { onAdd(val.trim()); setVal(''); }
  }
  return (
    <input type="text" className="w-28 bg-black/30 border border-dashed border-white/20 rounded-full text-white text-xs px-2.5 py-0.5 focus:outline-none focus:border-brand-blue transition-all placeholder-gray-500"
      placeholder="+ field name"
      value={val}
      onChange={e => setVal(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); } }}
      onBlur={commit}
    />
  );
}
