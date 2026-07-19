/**
 * FilterBuilderField - Visual condition builder for filter node
 * Rows of field / operator / value with AND/OR combinator
 */

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface FilterBuilderValue {
  combineConditions: 'and' | 'or';
  conditions: FilterCondition[];
}

const OPERATORS = [
  { value: 'equals', label: '= equals' },
  { value: 'not_equals', label: '≠ not equals' },
  { value: 'contains', label: '⊃ contains' },
  { value: 'not_contains', label: '⊅ not contains' },
  { value: 'starts_with', label: '▷ starts with' },
  { value: 'ends_with', label: '◁ ends with' },
  { value: 'greater_than', label: '> greater than' },
  { value: 'less_than', label: '< less than' },
  { value: 'greater_or_equal', label: '≥ greater or equal' },
  { value: 'less_or_equal', label: '≤ less or equal' },
  { value: 'is_empty', label: '∅ is empty' },
  { value: 'is_not_empty', label: '◉ is not empty' },
  { value: 'regex', label: '~ matches regex' },
];

const NO_VALUE_OPS = new Set(['is_empty', 'is_not_empty']);

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function emptyCondition(): FilterCondition {
  return { id: generateId(), field: '', operator: 'equals', value: '' };
}

interface Props {
  value: FilterBuilderValue | FilterCondition[];
  onChange: (val: FilterBuilderValue) => void;
}

function normalize(value: FilterBuilderValue | FilterCondition[]): FilterBuilderValue {
  if (Array.isArray(value)) {
    return { combineConditions: 'and', conditions: value.length > 0 ? value : [emptyCondition()] };
  }
  if (value && typeof value === 'object' && 'conditions' in value) {
    const v = value as FilterBuilderValue;
    return { ...v, conditions: v.conditions.length > 0 ? v.conditions : [emptyCondition()] };
  }
  return { combineConditions: 'and', conditions: [emptyCondition()] };
}

export function FilterBuilderField({ value, onChange }: Props) {
  const data = normalize(value);

  function update(partial: Partial<FilterBuilderValue>) {
    onChange({ ...data, ...partial });
  }

  function addCondition() {
    update({ conditions: [...data.conditions, emptyCondition()] });
  }

  function removeCondition(id: string) {
    const filtered = data.conditions.filter((c) => c.id !== id);
    update({ conditions: filtered.length > 0 ? filtered : [emptyCondition()] });
  }

  function updateCondition(id: string, patch: Partial<FilterCondition>) {
    update({
      conditions: data.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  const inputClass =
    'bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20';

  return (
    <div className="flex flex-col gap-3">
      {/* Combinator selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Combine with</span>
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          {(['and', 'or'] as const).map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => update({ combineConditions: op })}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${
                data.combineConditions === op
                  ? 'bg-brand-blue text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* Condition rows */}
      <div className="flex flex-col gap-2">
        {data.conditions.map((cond, idx) => (
          <div key={cond.id} className="flex items-center gap-2">
            {/* Badge: index or combinator label */}
            <span className="text-[10px] text-gray-500 w-6 text-right shrink-0">
              {idx === 0 ? 'IF' : data.combineConditions.toUpperCase()}
            </span>

            {/* Field */}
            <input
              type="text"
              className={`${inputClass} flex-1 min-w-0`}
              placeholder="{{ $json.field }}"
              value={cond.field}
              onChange={(e) => updateCondition(cond.id, { field: e.target.value })}
            />

            {/* Operator */}
            <select
              className={`${inputClass} shrink-0`}
              value={cond.operator}
              onChange={(e) => updateCondition(cond.id, { operator: e.target.value })}
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            {/* Value */}
            {!NO_VALUE_OPS.has(cond.operator) && (
              <input
                type="text"
                className={`${inputClass} flex-1 min-w-0`}
                placeholder="value"
                value={cond.value}
                onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
              />
            )}

            {/* Remove */}
            <button
              type="button"
              onClick={() => removeCondition(cond.id)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
              title="Remove condition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add condition */}
      <button
        type="button"
        onClick={addCondition}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-sm self-start"
      >
        <Plus className="w-4 h-4" />
        Add condition
      </button>
    </div>
  );
}
