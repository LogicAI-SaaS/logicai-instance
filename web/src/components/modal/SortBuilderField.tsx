/**
 * SortBuilderField - Visual sort configuration builder
 * Mirrors the LogicAI Sort node UI: Type + Fields list + Options
 */

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface SortField {
  id: string;
  fieldName: string;
  order: 'asc' | 'desc';
}

export interface SortBuilderValue {
  sortType: 'simple' | 'random' | 'code';
  fields: SortField[];
  disableDotNotation: boolean;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function emptyField(): SortField {
  return { id: generateId(), fieldName: '', order: 'asc' };
}

function normalize(value: any): SortBuilderValue {
  if (value && typeof value === 'object' && 'sortType' in value) {
    return {
      sortType: value.sortType ?? 'simple',
      fields: Array.isArray(value.fields) ? value.fields : [emptyField()],
      disableDotNotation: value.disableDotNotation ?? false,
    };
  }
  return { sortType: 'simple', fields: [emptyField()], disableDotNotation: false };
}

interface Props {
  value: SortBuilderValue | any;
  onChange: (val: SortBuilderValue) => void;
}

export function SortBuilderField({ value, onChange }: Props) {
  const data = normalize(value);

  function update(partial: Partial<SortBuilderValue>) {
    onChange({ ...data, ...partial });
  }

  function addField() {
    update({ fields: [...data.fields, emptyField()] });
  }

  function removeField(id: string) {
    const filtered = data.fields.filter((f) => f.id !== id);
    update({ fields: filtered.length > 0 ? filtered : [emptyField()] });
  }

  function updateField(id: string, patch: Partial<SortField>) {
    update({ fields: data.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
  }

  const inputClass =
    'w-full bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20';

  const selectClass =
    'bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 cursor-pointer';

  return (
    <div className="flex flex-col gap-4">
      {/* Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Type</label>
        <select
          className={`${selectClass} w-full`}
          value={data.sortType}
          onChange={(e) => update({ sortType: e.target.value as SortBuilderValue['sortType'] })}
        >
          <option value="simple">Simple</option>
          <option value="random">Random</option>
          <option value="code">Code</option>
        </select>
      </div>

      {/* Fields To Sort By — only for Simple */}
      {data.sortType === 'simple' && (
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Fields To Sort By
          </label>

          {data.fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Field Name</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. id"
                    value={field.fieldName}
                    onChange={(e) => updateField(field.id, { fieldName: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeField(field.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                    title="Remove field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[11px] text-gray-500">Enter the field name as text</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Order</span>
                <select
                  className={`${selectClass} w-full`}
                  value={field.order}
                  onChange={(e) => updateField(field.id, { order: e.target.value as 'asc' | 'desc' })}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addField}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm border border-white/10 hover:border-white/20"
          >
            <Plus className="w-4 h-4" />
            Add Field To Sort By
          </button>
        </div>
      )}

      {/* Options */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Options</label>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <span className="text-sm text-gray-300">Disable Dot Notation</span>
          <button
            type="button"
            role="switch"
            aria-checked={data.disableDotNotation}
            onClick={() => update({ disableDotNotation: !data.disableDotNotation })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              data.disableDotNotation ? 'bg-brand-blue' : 'bg-white/20'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                data.disableDotNotation ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
