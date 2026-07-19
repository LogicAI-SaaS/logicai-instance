/**
 * AiOptionsField - Dynamic add-option builder for AI model nodes
 * Same pattern as httpRequest options (add/remove from dropdown)
 * The `availableOptions` list comes from (fieldMeta as any).availableOptions in node.ts config
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export interface AvailableAiOption {
  key: string;
  label: string;
  inputType: 'number' | 'boolean' | 'text' | 'select' | 'textarea';
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface Props {
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
  availableOptions: AvailableAiOption[];
}

const inputCls =
  'flex-1 bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 min-w-0 w-full';
const selectCls =
  'w-full bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 cursor-pointer';

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
        checked ? 'bg-brand-blue' : 'bg-white/20'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export function AiOptionsField({ value, onChange, availableOptions }: Props) {
  const v = value || {};
  const activeKeys = Object.keys(v);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inactiveOptions = availableOptions.filter(
    (o) => !activeKeys.includes(o.key),
  );

  function add(opt: AvailableAiOption) {
    const def =
      opt.defaultValue ??
      (opt.inputType === 'boolean'
        ? false
        : opt.inputType === 'number'
          ? 0
          : '');
    onChange({ ...v, [opt.key]: def });
    setDropdownOpen(false);
  }

  function remove(key: string) {
    const next = { ...v };
    delete next[key];
    onChange(next);
  }

  function update(key: string, val: any) {
    onChange({ ...v, [key]: val });
  }

  return (
    <div className="flex flex-col gap-2">
      {activeKeys.length === 0 && (
        <p className="text-xs text-gray-500 px-1">No properties</p>
      )}

      {activeKeys.map((key) => {
        const opt = availableOptions.find((o) => o.key === key);
        if (!opt) return null;
        return (
          <div
            key={key}
            className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                {opt.label}
              </span>
              <div className="flex items-center gap-2">
                {opt.inputType === 'boolean' && (
                  <Toggle
                    checked={v[key] ?? false}
                    onChange={(val) => update(key, val)}
                  />
                )}
                <button
                  type="button"
                  onClick={() => remove(key)}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {opt.inputType === 'number' && (
              <input
                type="number"
                className={inputCls}
                min={opt.min}
                max={opt.max}
                step={opt.step ?? 1}
                placeholder={opt.placeholder}
                value={v[key] ?? opt.defaultValue ?? 0}
                onChange={(e) => update(key, parseFloat(e.target.value))}
              />
            )}
            {opt.inputType === 'text' && (
              <input
                type="text"
                className={inputCls}
                placeholder={opt.placeholder}
                value={v[key] ?? opt.defaultValue ?? ''}
                onChange={(e) => update(key, e.target.value)}
              />
            )}
            {opt.inputType === 'textarea' && (
              <textarea
                rows={3}
                className="w-full bg-black/30 border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none hover:border-white/20"
                placeholder={opt.placeholder}
                value={v[key] ?? opt.defaultValue ?? ''}
                onChange={(e) => update(key, e.target.value)}
              />
            )}
            {opt.inputType === 'select' && (
              <select
                className={selectCls}
                value={v[key] ?? opt.defaultValue ?? ''}
                onChange={(e) => update(key, e.target.value)}
              >
                {opt.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}

      {inactiveOptions.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            <span>Add option</span>
            {dropdownOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {dropdownOpen && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
              {inactiveOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => add(opt)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
