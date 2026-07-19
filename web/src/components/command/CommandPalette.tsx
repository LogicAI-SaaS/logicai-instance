/**
 * Command Palette
 *
 * Global search and quick action palette for workflow editor.
 * Provides quick access to nodes, actions, and commands.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, Clock, FolderOpen, Zap, Command, Loader2 } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { NODE_TYPES_METADATA } from '../../types/node';
import { formatShortcut, useKeyboardShortcut, DEFAULT_SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

export interface Command {
  id: string;
  type: 'node' | 'action' | 'workflow' | 'recent';
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }> | React.ReactNode;
  action: () => void;
  category?: string;
  tags?: string[];
  shortcut?: string;
}

export interface CommandPaletteProps {
  /** Whether the palette is open */
  isOpen: boolean;
  /** Close the palette */
  onClose: () => void;
  /** Available commands */
  commands?: Command[];
  /** Recent commands */
  recentCommands?: string[];
  /** Add command to execute when a node is selected */
  onAddNode?: (nodeType: string, position?: { x: number; y: number }) => void;
  /** Save workflow command */
  onSave?: () => void;
  /** Execute workflow command */
  onExecute?: () => void;
  /** Export workflow command */
  onExport?: () => void;
  /** Import workflow command */
  onImport?: () => void;
}

import { Save, Play, Download, Upload, FileText, Settings, HelpCircle, Plus } from 'lucide-react';

/**
 * Default action commands
 */
const getDefaultActionCommands = (
  onSave?: () => void,
  onExecute?: () => void,
  onExport?: () => void,
  onImport?: () => void
): Command[] => [
  { id: 'save', type: 'action', label: 'Save Workflow', description: 'Save current workflow', icon: Save, shortcut: 'Ctrl+S', action: onSave },
  { id: 'execute', type: 'action', label: 'Execute Workflow', description: 'Run the workflow', icon: Play, shortcut: 'Ctrl+Enter', action: onExecute },
  { id: 'export', type: 'action', label: 'Export Workflow', description: 'Export to JSON file', icon: Download, shortcut: 'Ctrl+Shift+E', action: onExport },
  { id: 'import', type: 'action', label: 'Import Workflow', description: 'Import from JSON file', icon: Upload, shortcut: 'Ctrl+Shift+I', action: onImport },
];

/**
 * Main Command Palette Component
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands: customCommands = [],
  recentCommands = [],
  onAddNode,
  onSave,
  onExecute,
  onExport,
  onImport,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  // @ts-ignore - project may not exist in all React Flow versions
  const { project } = useReactFlow() || {};

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Close on Escape
  useKeyboardShortcut({ key: 'Escape', id: 'close', label: 'Close', description: 'Close command palette', category: 'help' } as any, onClose, [isOpen]);

  // Build all commands
  const allCommands = useMemo(() => {
    const commands: Command[] = [];

    // Node commands
    if (onAddNode) {
      Object.entries(NODE_TYPES_METADATA).forEach(([type, meta]) => {
        commands.push({
          id: `node-${type}`,
          type: 'node',
          label: meta.description || type,
          description: `Add ${meta.description || type} node`,
          icon: React.createElement('div', { className: 'w-4 h-4 rounded', style: { backgroundColor: '#3b82f6' } }),
          action: () => {
            // @ts-ignore - project may not exist in all React Flow versions
            const position = project ? project({ x: 0, y: 0 }) : { x: 100, y: 100 };
            onAddNode(type, { x: position.x + Math.random() * 200, y: position.y + Math.random() * 200 });
            onClose();
          },
          category: meta.category,
          tags: [],
        });
      });
    }

    // Action commands
    commands.push(...getDefaultActionCommands(onSave, onExecute, onExport, onImport).filter(c => c.action));

    // Custom commands
    commands.push(...customCommands);

    return commands;
  }, [onAddNode, onSave, onExecute, onExport, onImport, customCommands, project, onClose]);

  // Filter and rank commands
  const filteredCommands = useMemo(() => {
    if (!query) {
      // Show recent commands first when no query
      const recent = allCommands.filter(c => recentCommands.includes(c.id));
      const others = allCommands.filter(c => !recentCommands.includes(c.id));
      return [...recent, ...others].slice(0, 10);
    }

    const lowerQuery = query.toLowerCase();

    // Rank by relevance
    return allCommands
      .map(command => {
        let score = 0;

        // Exact match
        if (command.label.toLowerCase() === lowerQuery) score += 100;
        else if (command.label.toLowerCase().startsWith(lowerQuery)) score += 50;
        else if (command.label.toLowerCase().includes(lowerQuery)) score += 20;

        // Description match
        if (command.description?.toLowerCase().includes(lowerQuery)) score += 10;

        // Tag match
        if (command.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) score += 15;

        // Category match
        if (command.category?.toLowerCase().includes(lowerQuery)) score += 5;

        return { command, score };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(result => result.command);
  }, [allCommands, query, recentCommands]);

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter' && filteredCommands.length > 0) {
      e.preventDefault();
      filteredCommands[selectedIndex]?.action();
    }
  }, [filteredCommands, selectedIndex]);

  // Execute command
  const executeCommand = useCallback((command: Command) => {
    command.action();
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[20vh] z-50 p-4">
      <div className="bg-black rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/10">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('commandPalette.placeholder')}
            className="flex-1 bg-transparent border-none outline-none text-orange-500 placeholder-gray-400"
          />
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <kbd className="px-1.5 py-0.5 bg-white/10 text-gray-300 rounded">↑↓</kbd>
            <span>{t('commandPalette.navigateHint')}</span>
            <kbd className="px-1.5 py-0.5 bg-white/10 text-gray-300 rounded ml-2">Enter</kbd>
            <span>{t('commandPalette.selectHint')}</span>
            <kbd className="px-1.5 py-0.5 bg-white/10 text-gray-300 rounded ml-2">Esc</kbd>
            <span>{t('commandPalette.closeHint')}</span>
          </div>
        </div>

        {/* Command List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('commandPalette.noResults')}</p>
              <p className="text-sm mt-1">{t('commandPalette.noResultsHint')}</p>
            </div>
          ) : (
            <div className="py-2">
              {/* Recent Commands Header */}
              {!query && recentCommands.length > 0 && (
                <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  {t('commandPalette.recent')}
                </div>
              )}

              {/* Commands */}
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => executeCommand(command)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                    ${index === selectedIndex
                      ? 'bg-white/5'
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex-shrink-0 text-gray-600">
                    {typeof command.icon === 'function'
                      ? React.createElement(command.icon as React.ComponentType<{ className?: string }>, { className: 'w-5 h-5' })
                      : React.isValidElement(command.icon)
                      ? command.icon
                      : null
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">
                      {command.label}
                    </div>
                    {command.description && (
                      <div className="text-sm text-gray-300 truncate">
                        {command.description}
                      </div>
                    )}
                  </div>
                  {command.shortcut && (
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-600 rounded">
                      {command.shortcut}
                    </kbd>
                  )}
                  {command.category && (
                    <span className="text-xs text-gray-500 capitalize">
                      {command.category}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-white/5 border-white/10 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              LogicAI
            </span>
            <span className='text-orange-500'>{t('commandPalette.commandsAvailable', { count: allCommands.length })}</span>
          </div>
          <div>
            Press <kbd className="px-1 py-0.5 bg-white/10 text-gray-300 rounded">Ctrl+K</kbd> {t('commandPalette.openHint')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
