/**
 * EnginesSelectField - Multi-select checkboxes for aggregatorMultiSearch engines
 */

import React from 'react';

const ENGINES = [
  { value: 'google',     label: 'Google' },
  { value: 'duckduckgo', label: 'DuckDuckGo' },
  { value: 'bing',       label: 'Bing' },
  { value: 'yahoo',      label: 'Yahoo' },
  { value: 'brave',      label: 'Brave' },
  { value: 'ecosia',     label: 'Ecosia' },
  { value: 'linkedin',   label: 'LinkedIn' },
  { value: 'twitter',    label: 'Twitter/X' },
  { value: 'reddit',     label: 'Reddit' },
];

function normalize(v: any): string[] {
  if (Array.isArray(v)) return v;
  // Handle JSON string from legacy textarea
  if (typeof v === 'string') {
    try { const p = JSON.parse(v); return Array.isArray(p) ? p : ['google', 'duckduckgo']; } catch { return ['google', 'duckduckgo']; }
  }
  return ['google', 'duckduckgo'];
}

interface Props { value: any; onChange: (v: string[]) => void; }

export function EnginesSelectField({ value, onChange }: Props) {
  const selected = normalize(value);

  function toggle(engine: string) {
    const next = selected.includes(engine)
      ? selected.filter(e => e !== engine)
      : [...selected, engine];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {ENGINES.map(eng => {
          const active = selected.includes(eng.value);
          return (
            <button key={eng.value} type="button" onClick={() => toggle(eng.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                active
                  ? 'bg-brand-blue/20 border-brand-blue text-brand-blue'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
              }`}>
              {eng.label}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-amber-400/80 px-1">⚠ Select at least one engine.</p>
      )}
      {selected.length > 0 && (
        <p className="text-xs text-gray-500 px-1">{selected.length} engine{selected.length > 1 ? 's' : ''} selected</p>
      )}
    </div>
  );
}
