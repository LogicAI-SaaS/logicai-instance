/**
 * AiBuiltinToolsField - Toggle built-in native tools for each AI provider
 * The `tools` list comes from (fieldMeta as any).tools in node.ts config
 */

import React from 'react';

export interface AiTool {
  value: string;
  label: string;
  description?: string;
  alwaysOn?: boolean;
}

interface Props {
  value: Record<string, boolean>;
  onChange: (v: Record<string, boolean>) => void;
  tools: AiTool[];
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange()}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-brand-blue' : 'bg-white/20'}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export function AiBuiltinToolsField({ value, onChange, tools }: Props) {
  if (!tools || tools.length === 0) {
    return (
      <p className="text-xs text-gray-500 px-1">
        No built-in tools available for this provider.
      </p>
    );
  }

  function toggle(tool: AiTool) {
    if (tool.alwaysOn) return;
    const cur = value?.[tool.value] ?? false;
    onChange({ ...(value || {}), [tool.value]: !cur });
  }

  return (
    <div className="flex flex-col gap-2">
      {tools.map((tool) => (
        <div
          key={tool.value}
          className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-200">
              {tool.label}
              {tool.alwaysOn && (
                <span className="ml-1.5 text-xs text-gray-500">(always on)</span>
              )}
            </span>
            {tool.description && (
              <p className="text-xs text-gray-500">{tool.description}</p>
            )}
          </div>
          <Toggle
            checked={tool.alwaysOn ? true : (value?.[tool.value] ?? false)}
            onChange={() => toggle(tool)}
            disabled={tool.alwaysOn}
          />
        </div>
      ))}
    </div>
  );
}
