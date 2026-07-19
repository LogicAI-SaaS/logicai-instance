/**
 * NodeHoverActions - Floating action panel shown on node hover
 * Features:
 * - Start execution from this node
 * - Enable/Disable (mask) node
 * - Delete node with auto-reconnect
 * - Options dropdown
 */

import { Play, Eye, EyeOff, Trash2, MoreHorizontal, Settings, Copy } from 'lucide-react';
import type { CustomNode } from '../../types/node';
import type { Edge } from '@xyflow/react';
import { useEffect, useState, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useTranslation } from 'react-i18next';

interface NodeHoverActionsProps {
  node: CustomNode;
  edges: Edge[];
  onStartFrom: (nodeId: string) => void;
  onToggleDisabled: (nodeId: string) => void;
  onDeleteWithReconnect: (nodeId: string) => void;
  onOpenOptions: (nodeId: string) => void;
  isDisabled?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// ─── Color palette for buttons ────────────────────────────────────────────────
const COLORS: Record<string, { idle: string; hover: string }> = {
  emerald: { idle: 'text-emerald-400',  hover: 'hover:bg-emerald-500/15 hover:text-emerald-300' },
  sky:     { idle: 'text-sky-400',      hover: 'hover:bg-sky-500/15 hover:text-sky-300' },
  slate:   { idle: 'text-slate-400',    hover: 'hover:bg-white/6 hover:text-slate-200' },
  red:     { idle: 'text-red-400',      hover: 'hover:bg-red-500/15 hover:text-red-300' },
  violet:  { idle: 'text-violet-400',   hover: 'hover:bg-violet-500/15 hover:text-violet-300' },
  blue:    { idle: 'text-blue-400',     hover: 'hover:bg-blue-500/15 hover:text-blue-300' },
  purple:  { idle: 'text-purple-400',   hover: 'hover:bg-purple-500/15 hover:text-purple-300' },
};

// ─── Action button ─────────────────────────────────────────────────────────────
function ActionBtn({
  onClick, title, color, icon, active = false,
}: {
  onClick: () => void;
  title: string;
  color: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  const c = COLORS[color] ?? COLORS.slate;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        p-1.5 rounded-lg transition-all duration-150 flex items-center justify-center
        ${c.idle} ${c.hover}
        ${active ? 'bg-white/10' : ''}
      `}
    >
      {icon}
    </button>
  );
}

// ─── Dropdown item ─────────────────────────────────────────────────────────────
function DropItem({
  label, icon, onClick, color = 'slate',
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}) {
  const c = COLORS[color] ?? COLORS.slate;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors ${c.hover}`}
    >
      <span className={c.idle}>{icon}</span>
      {label}
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function NodeHoverActions({
  node,
  edges,
  onStartFrom,
  onToggleDisabled,
  onDeleteWithReconnect,
  onOpenOptions,
  isDisabled = false,
  onMouseEnter,
  onMouseLeave,
}: NodeHoverActionsProps) {
  const { t } = useTranslation();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showDropdown, setShowDropdown] = useState(false);
  const reactFlow = useReactFlow();
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Track whether mouse is currently inside the panel so we can decide
  // whether to call onMouseLeave when the dropdown closes via outside-click.
  const isPanelHovered = useRef(false);

  // Position panel above the node
  useEffect(() => {
    const el = document.querySelector(`[data-id="${node.id}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
  }, [node.id, node.position, reactFlow.getZoom(), reactFlow.getViewport()]);

  // Close dropdown on outside click; notify parent if mouse left the panel too
  useEffect(() => {
    if (!showDropdown) return;
    function onDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        // If mouse is not over the panel anymore, tell parent to start hide timer
        if (!isPanelHovered.current) onMouseLeave?.();
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showDropdown, onMouseLeave]);

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, calc(-100% - 8px))' }}
    >
      {/* Panel */}
      <div
        className="flex items-center gap-0.5 pointer-events-auto rounded-xl border border-white/10 px-1.5 py-1"
        style={{
          background: 'rgba(8, 8, 18, 0.96)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
        onMouseEnter={() => { isPanelHovered.current = true; onMouseEnter?.(); }}
        // While the dropdown is open, suppress leave so the mouse can travel
        // upward into the dropdown without the panel disappearing.
        onMouseLeave={() => { isPanelHovered.current = false; if (!showDropdown) onMouseLeave?.(); }}
      >
        {/* ── Execute from here ───── */}
        <ActionBtn
          onClick={() => onStartFrom(node.id)}
          title={t('canvas.executeFromNode')}
          color="emerald"
          icon={<Play className="w-3.5 h-3.5" />}
        />

        {/* ── divider ─────────────── */}
        <div className="w-px h-4 bg-white/10 mx-0.5" />

        {/* ── Toggle mask ─────────── */}
        <ActionBtn
          onClick={() => onToggleDisabled(node.id)}
          title={isDisabled ? t('canvas.reactivateNode') : t('canvas.hideNode')}
          color={isDisabled ? 'sky' : 'slate'}
          icon={isDisabled
            ? <Eye className="w-3.5 h-3.5" />
            : <EyeOff className="w-3.5 h-3.5" />
          }
          active={isDisabled}
        />

        {/* ── Delete + reconnect ───── */}
        <ActionBtn
          onClick={() => onDeleteWithReconnect(node.id)}
          title="Supprimer et reconnecter"
          color="red"
          icon={<Trash2 className="w-3.5 h-3.5" />}
        />

        {/* ── divider ─────────────── */}
        <div className="w-px h-4 bg-white/10 mx-0.5" />

        {/* ── Options dropdown ────── */}
        <div className="relative" ref={dropdownRef}>
          <ActionBtn
            onClick={() => setShowDropdown((v) => !v)}
            title="Options"
            color="violet"
            icon={<MoreHorizontal className="w-3.5 h-3.5" />}
            active={showDropdown}
          />

          {showDropdown && (
            <div
              className="absolute bottom-full right-0 w-44 rounded-xl border border-white/10 overflow-hidden"
              style={{
                background: 'rgba(8, 8, 18, 0.98)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
              }}
            >
              {/* pt-1 gives visual breathing room without creating a geometric gap */}
              <div className="pt-1">
                <DropItem
                  label="Configurer"
                  icon={<Settings className="w-3.5 h-3.5" />}
                  onClick={() => { onOpenOptions(node.id); setShowDropdown(false); }}
                  color="blue"
                />
                <DropItem
                  label="Dupliquer"
                  icon={<Copy className="w-3.5 h-3.5" />}
                  onClick={() => setShowDropdown(false)}
                  color="purple"
                />
                <div className="h-px bg-white/6 mx-2 my-0.5" />
                <DropItem
                  label="Supprimer"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => { onDeleteWithReconnect(node.id); setShowDropdown(false); }}
                  color="red"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
