/**
 * Keyboard Shortcuts Modal
 *
 * Modal displaying all available keyboard shortcuts.
 */

import React, { useMemo } from 'react';
import { X, Search, Zap, PenTool, Eye, Play, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_SHORTCUTS, formatShortcut, useKeyboardShortcut } from '../../hooks/useKeyboardShortcuts';
import type { KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

export interface KeyboardShortcutsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close the modal */
  onClose: () => void;
  /** Custom shortcuts to display */
  shortcuts?: Omit<KeyboardShortcut, 'action'>[];
}

/**
 * Category icons mapping
 */
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'workflow': Zap,
  'editing': PenTool,
  'view': Eye,
  'execution': Play,
  'help': HelpCircle,
};

/**
 * Category names
 */
const CATEGORY_NAMES: Record<string, string> = {
  'workflow': 'Workflow',
  'editing': 'Editing',
  'view': 'View',
  'execution': 'Execution',
  'help': 'Help',
};

/**
 * Main Keyboard Shortcuts Modal Component
 */
export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts = DEFAULT_SHORTCUTS,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { t } = useTranslation();

  // Close on ? key press
  useKeyboardShortcut({ key: '?', id: 'close', label: 'Close', description: 'Close shortcuts modal', category: 'help' } as any, onClose, [isOpen]);

  // Filter shortcuts by search query
  const filteredShortcuts = useMemo(() => {
    if (!searchQuery) return shortcuts;

    const query = searchQuery.toLowerCase();
    return shortcuts.filter(
      (s) =>
        s.label.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.key.toLowerCase().includes(query)
    );
  }, [shortcuts, searchQuery]);

  // Group shortcuts by category
  const groupedShortcuts = useMemo(() => {
    const groups: Record<string, Omit<KeyboardShortcut, 'action'>[]> = {};

    filteredShortcuts.forEach((shortcut) => {
      const category = shortcut.category || 'help';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(shortcut);
    });

    return groups;
  }, [filteredShortcuts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">
              {t('shortcuts.title')}
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              {t('shortcuts.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('shortcuts.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-md bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredShortcuts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('shortcuts.noResults')}</p>
              <p className="text-sm mt-1">{t('shortcuts.noResultsHint')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
                const IconComponent = CATEGORY_ICONS[category];
                return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-brand-blue uppercase tracking-wider mb-3 flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    {t(`shortcuts.categories.${category}`)}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut) => (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {shortcut.label}
                          </div>
                          <div className="text-sm text-gray-300">
                            {shortcut.description}
                          </div>
                        </div>
                        <kbd className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-sm font-mono text-white shadow-sm">
                          {formatShortcut(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 rounded-b-lg">
          <p className="text-sm text-gray-300 text-center">
            Press <kbd className="px-2 py-1 bg-white/10 border border-white/5 rounded text-xs font-mono">?</kbd> {t('shortcuts.footerAction')}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * In-line keyboard shortcut badge component
 */
export const ShortcutBadge: React.FC<{ shortcut: Omit<KeyboardShortcut, 'action'> }> = ({ shortcut }) => {
  return (
    <kbd className="px-2 py-1 bg-white/10 border border-white/5 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
      {formatShortcut(shortcut)}
    </kbd>
  );
};

/**
 * Tooltip with keyboard shortcut
 */
export const ShortcutTooltip: React.FC<{
  shortcut: Omit<KeyboardShortcut, 'action'>;
  children: React.ReactNode;
}> = ({ shortcut, children }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {shortcut.description}
        <div className="mt-1 text-gray-400">
          {formatShortcut(shortcut)}
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
