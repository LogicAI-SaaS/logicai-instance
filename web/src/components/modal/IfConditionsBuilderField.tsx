/**
 * IfConditionsBuilderField – LogicAI-style condition builder for the If node.
 * Each condition has: value1 (with type picker) · operator · value2
 * Conditions are linked with AND / OR.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Type, Hash, Calendar, ToggleLeft, List, Braces } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

export type ConditionValueType = 'string' | 'number' | 'dateTime' | 'boolean' | 'array' | 'object';

const VALUE_TYPES: { id: ConditionValueType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'string',   label: 'String',      icon: <Type className="w-3.5 h-3.5" />,        color: 'text-orange-400' },
  { id: 'number',   label: 'Number',      icon: <Hash className="w-3.5 h-3.5" />,        color: 'text-blue-400' },
  { id: 'dateTime', label: 'Date & Time', icon: <Calendar className="w-3.5 h-3.5" />,   color: 'text-purple-400' },
  { id: 'boolean',  label: 'Boolean',     icon: <ToggleLeft className="w-3.5 h-3.5" />, color: 'text-green-400' },
  { id: 'array',    label: 'Array',       icon: <List className="w-3.5 h-3.5" />,        color: 'text-yellow-400' },
  { id: 'object',   label: 'Object',      icon: <Braces className="w-3.5 h-3.5" />,     color: 'text-pink-400' },
];

const OPERATORS_BY_TYPE: Record<ConditionValueType, { value: string; label: string; noValue?: boolean }[]> = {
  string: [
    { value: 'exists',              label: 'exists',              noValue: true },
    { value: 'not_exists',          label: 'does not exist',      noValue: true },
    { value: 'is_empty',            label: 'is empty',            noValue: true },
    { value: 'is_not_empty',        label: 'is not empty',        noValue: true },
    { value: 'equals',              label: 'is equal to' },
    { value: 'not_equals',          label: 'is not equal to' },
    { value: 'contains',            label: 'contains' },
    { value: 'not_contains',        label: 'does not contain' },
    { value: 'starts_with',         label: 'starts with' },
    { value: 'not_starts_with',     label: 'does not start with' },
    { value: 'ends_with',           label: 'ends with' },
    { value: 'not_ends_with',       label: 'does not end with' },
    { value: 'matches_regex',       label: 'matches regex' },
    { value: 'not_matches_regex',   label: 'does not match regex' },
  ],
  number: [
    { value: 'exists',        label: 'exists',          noValue: true },
    { value: 'not_exists',    label: 'does not exist',  noValue: true },
    { value: 'equals',        label: 'is equal to' },
    { value: 'not_equals',    label: 'is not equal to' },
    { value: 'gt',            label: 'greater than' },
    { value: 'gte',           label: 'greater or equal to' },
    { value: 'lt',            label: 'less than' },
    { value: 'lte',           label: 'less or equal to' },
  ],
  dateTime: [
    { value: 'exists',      label: 'exists',          noValue: true },
    { value: 'not_exists',  label: 'does not exist',  noValue: true },
    { value: 'equals',      label: 'is equal to' },
    { value: 'not_equals',  label: 'is not equal to' },
    { value: 'before',      label: 'is before' },
    { value: 'after',       label: 'is after' },
  ],
  boolean: [
    { value: 'exists',      label: 'exists',          noValue: true },
    { value: 'not_exists',  label: 'does not exist',  noValue: true },
    { value: 'is_true',     label: 'is true',         noValue: true },
    { value: 'is_false',    label: 'is false',        noValue: true },
    { value: 'equals',      label: 'is equal to' },
    { value: 'not_equals',  label: 'is not equal to' },
  ],
  array: [
    { value: 'exists',        label: 'exists',             noValue: true },
    { value: 'not_exists',    label: 'does not exist',     noValue: true },
    { value: 'is_empty',      label: 'is empty',           noValue: true },
    { value: 'is_not_empty',  label: 'is not empty',       noValue: true },
    { value: 'contains',      label: 'contains' },
    { value: 'not_contains',  label: 'does not contain' },
    { value: 'length_eq',     label: 'length equals' },
    { value: 'length_gt',     label: 'length greater than' },
    { value: 'length_lt',     label: 'length less than' },
  ],
  object: [
    { value: 'exists',      label: 'exists',          noValue: true },
    { value: 'not_exists',  label: 'does not exist',  noValue: true },
    { value: 'is_empty',    label: 'is empty',        noValue: true },
    { value: 'is_not_empty',label: 'is not empty',    noValue: true },
    { value: 'has_key',     label: 'has key' },
    { value: 'not_has_key', label: 'does not have key' },
  ],
};

export interface IfCondition {
  id: string;
  value1: string;
  value1Type: ConditionValueType;
  operator: string;
  value2: string;
}

export interface IfConditionsValue {
  combineWith: 'and' | 'or';
  conditions: IfCondition[];
}

function genId() {
  return Math.random().toString(36).substring(2, 9);
}

function emptyCondition(): IfCondition {
  return { id: genId(), value1: '', value1Type: 'string', operator: 'equals', value2: '' };
}

function normalize(value: any): IfConditionsValue {
  if (value && typeof value === 'object' && 'conditions' in value) {
    const v = value as IfConditionsValue;
    return { combineWith: v.combineWith ?? 'and', conditions: v.conditions?.length > 0 ? v.conditions : [emptyCondition()] };
  }
  return { combineWith: 'and', conditions: [emptyCondition()] };
}

// ── Type Picker Popover ───────────────────────────────────────────────────────

function TypePicker({ current, onChange }: { current: ConditionValueType; onChange: (t: ConditionValueType) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const typeDef = VALUE_TYPES.find(t => t.id === current)!;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-white/10 bg-black/30 hover:border-white/20 transition-all text-xs font-semibold ${typeDef.color} whitespace-nowrap`}
        title="Choose value type"
      >
        {typeDef.icon}
        <span>{typeDef.label}</span>
        <ChevronRight className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
          {VALUE_TYPES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => { onChange(t.id); setOpen(false); }}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-medium transition-all hover:bg-white/10 ${
                t.id === current ? 'bg-white/10' : ''
              } ${t.color}`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.id === current && <span className="ml-auto text-brand-blue text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Operator Dropdown ─────────────────────────────────────────────────────────

function OperatorDropdown({
  valueType,
  current,
  onChange,
}: { valueType: ConditionValueType; current: string; onChange: (op: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const ops = OPERATORS_BY_TYPE[valueType];
  const currentOp = ops.find(o => o.value === current) ?? ops[0];

  // If current operator not in new type's list, reset
  useEffect(() => {
    if (!ops.find(o => o.value === current)) {
      onChange(ops[0].value);
    }
  }, [valueType]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative min-w-[160px]" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg border border-white/10 bg-black/30 hover:border-brand-blue/60 transition-all text-xs text-white font-medium"
      >
        <span>{currentOp.label}</span>
        <ChevronRight className={`w-3 h-3 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-card border border-white/10 rounded-xl shadow-2xl overflow-auto max-h-64 min-w-[200px]">
          {ops.map(op => (
            <button
              key={op.value}
              type="button"
              onClick={() => { onChange(op.value); setOpen(false); }}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-xs transition-all hover:bg-white/10 ${
                op.value === current ? 'text-brand-blue bg-white/10' : 'text-gray-300'
              }`}
            >
              {op.label}
              {op.value === current && <span className="text-brand-blue">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  value: IfConditionsValue | any;
  onChange: (val: IfConditionsValue) => void;
}

export function IfConditionsBuilderField({ value, onChange }: Props) {
  const data = normalize(value);

  function update(partial: Partial<IfConditionsValue>) {
    onChange({ ...data, ...partial });
  }

  function addCondition() {
    update({ conditions: [...data.conditions, emptyCondition()] });
  }

  function removeCondition(id: string) {
    const next = data.conditions.filter(c => c.id !== id);
    update({ conditions: next.length > 0 ? next : [emptyCondition()] });
  }

  function patchCondition(id: string, patch: Partial<IfCondition>) {
    update({ conditions: data.conditions.map(c => c.id === id ? { ...c, ...patch } : c) });
  }

  const inputClass = 'flex-1 min-w-0 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue hover:border-white/20 transition-all';

  return (
    <div className="flex flex-col gap-4">
      {/* AND / OR combinator */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Combine with</span>
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          {(['and', 'or'] as const).map(op => (
            <button
              key={op}
              type="button"
              onClick={() => update({ combineWith: op })}
              className={`px-5 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${
                data.combineWith === op
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
      <div className="flex flex-col gap-3">
        {data.conditions.map((cond, idx) => {
          const ops = OPERATORS_BY_TYPE[cond.value1Type];
          const currentOp = ops.find(o => o.value === cond.operator) ?? ops[0];
          const noValue = !!currentOp?.noValue;

          return (
            <div key={cond.id} className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
              {/* Row label */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                  idx === 0
                    ? 'bg-white/10 text-gray-300'
                    : data.combineWith === 'and'
                      ? 'bg-blue-900/50 text-blue-300'
                      : 'bg-orange-900/50 text-orange-300'
                }`}>
                  {idx === 0 ? 'IF' : data.combineWith.toUpperCase()}
                </span>
                <div className="flex-1 h-px bg-white/10" />
                <button
                  type="button"
                  onClick={() => removeCondition(cond.id)}
                  className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Value 1 row: type picker + input */}
              <div className="flex items-center gap-2">
                <TypePicker
                  current={cond.value1Type}
                  onChange={t => patchCondition(cond.id, { value1Type: t, operator: OPERATORS_BY_TYPE[t][0].value })}
                />
                <input
                  type="text"
                  className={inputClass}
                  placeholder="{{ $json.fieldName }}"
                  value={cond.value1}
                  onChange={e => patchCondition(cond.id, { value1: e.target.value })}
                />
              </div>

              {/* Operator */}
              <div className="flex items-center gap-2 pl-1">
                <div className="w-3 h-3 rounded-full border-2 border-white/20 shrink-0" />
                <OperatorDropdown
                  valueType={cond.value1Type}
                  current={cond.operator}
                  onChange={op => patchCondition(cond.id, { operator: op })}
                />
              </div>

              {/* Value 2 (only if operator needs it) */}
              {!noValue && (
                <div className="flex items-center gap-2 pl-1">
                  <div className="w-3 h-3 rounded border border-white/20 bg-white/5 shrink-0" />
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="value"
                    value={cond.value2}
                    onChange={e => patchCondition(cond.id, { value2: e.target.value })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add condition */}
      <button
        type="button"
        onClick={addCondition}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-sm self-start"
      >
        <Plus className="w-4 h-4" />
        Add condition
      </button>
    </div>
  );
}
