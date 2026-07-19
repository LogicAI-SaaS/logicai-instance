/**
 * Keyboard Shortcuts System
 *
 * Configurable keyboard shortcuts for workflow editor.
 */

import { useEffect, useCallback, useMemo } from 'react';

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  id: string;
  label: string;
  description: string;
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  category?: 'workflow' | 'editing' | 'view' | 'execution' | 'help';
  enabled?: boolean;
}

/**
 * Default keyboard shortcuts
 */
export const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  // Workflow
  {
    id: 'save',
    label: 'Save',
    description: 'Save the current workflow',
    key: 's',
    ctrl: true,
    category: 'workflow',
  },
  {
    id: 'execute',
    label: 'Execute',
    description: 'Execute the workflow',
    key: 'Enter',
    ctrl: true,
    category: 'execution',
  },
  {
    id: 'export',
    label: 'Export',
    description: 'Export workflow to file',
    key: 'e',
    ctrl: true,
    shift: true,
    category: 'workflow',
  },
  {
    id: 'import',
    label: 'Import',
    description: 'Import workflow from file',
    key: 'i',
    ctrl: true,
    shift: true,
    category: 'workflow',
  },
  {
    id: 'new',
    label: 'New Workflow',
    description: 'Create a new workflow',
    key: 'n',
    ctrl: true,
    category: 'workflow',
  },

  // Editing
  {
    id: 'undo',
    label: 'Undo',
    description: 'Undo last action',
    key: 'z',
    ctrl: true,
    category: 'editing',
  },
  {
    id: 'redo',
    label: 'Redo',
    description: 'Redo last action',
    key: 'z',
    ctrl: true,
    shift: true,
    category: 'editing',
  },
  {
    id: 'delete',
    label: 'Delete',
    description: 'Delete selected nodes',
    key: 'Delete',
    category: 'editing',
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    description: 'Duplicate selected nodes',
    key: 'd',
    ctrl: true,
    category: 'editing',
  },
  {
    id: 'copy',
    label: 'Copy',
    description: 'Copy selected nodes',
    key: 'c',
    ctrl: true,
    category: 'editing',
  },
  {
    id: 'paste',
    label: 'Paste',
    description: 'Paste nodes from clipboard',
    key: 'v',
    ctrl: true,
    category: 'editing',
  },
  {
    id: 'selectAll',
    label: 'Select All',
    description: 'Select all nodes',
    key: 'a',
    ctrl: true,
    category: 'editing',
  },

  // View
  {
    id: 'zoomIn',
    label: 'Zoom In',
    description: 'Zoom in the canvas',
    key: '+',
    ctrl: true,
    category: 'view',
  },
  {
    id: 'zoomOut',
    label: 'Zoom Out',
    description: 'Zoom out the canvas',
    key: '-',
    ctrl: true,
    category: 'view',
  },
  {
    id: 'resetZoom',
    label: 'Reset Zoom',
    description: 'Reset zoom to 100%',
    key: '0',
    ctrl: true,
    category: 'view',
  },
  {
    id: 'fitView',
    label: 'Fit View',
    description: 'Fit all nodes in view',
    key: 'f',
    ctrl: true,
    category: 'view',
  },
  {
    id: 'toggleMiniMap',
    label: 'Toggle Mini-Map',
    description: 'Show/hide mini-map',
    key: 'm',
    ctrl: true,
    category: 'view',
  },

  // Help
  {
    id: 'commandPalette',
    label: 'Command Palette',
    description: 'Open command palette',
    key: 'k',
    ctrl: true,
    category: 'help',
  },
  {
    id: 'shortcuts',
    label: 'Keyboard Shortcuts',
    description: 'Show keyboard shortcuts',
    key: '?',
    category: 'help',
  },
];

/**
 * Format shortcut key for display
 */
export const formatShortcut = (shortcut: Omit<KeyboardShortcut, 'action'>): string => {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.meta) parts.push('Cmd');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');

  // Format special keys
  const keyMap: Record<string, string> = {
    'Enter': 'Enter',
    'Delete': 'Delete',
    'Escape': 'Esc',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    ' ': 'Space',
  };

  parts.push(keyMap[shortcut.key] || shortcut.key.toUpperCase());

  return parts.join(' + ');
};

/**
 * Check if event matches shortcut
 */
const matchesShortcut = (event: KeyboardEvent, shortcut: Omit<KeyboardShortcut, 'action'>): boolean => {
  const ctrl = event.ctrlKey || event.metaKey;
  const shift = event.shiftKey;
  const alt = event.altKey;

  return (
    event.key === shortcut.key &&
    !!shortcut.ctrl === ctrl &&
    !!shortcut.shift === shift &&
    !!shortcut.alt === alt
  );
};

/**
 * Hook for using keyboard shortcuts
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  options?: {
    /** Prevent default behavior for all shortcuts */
    preventDefault?: boolean;
    /** Only trigger when not in input */
    ignoreInputs?: boolean;
  }
) => {
  const { preventDefault = true, ignoreInputs = true } = options || {};

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if in input/textarea
      if (
        ignoreInputs &&
        (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          (event.target as HTMLElement).isContentEditable)
      ) {
        return;
      }

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => s.enabled !== false && matchesShortcut(event, s));

      if (shortcut) {
        if (preventDefault) {
          event.preventDefault();
        }
        shortcut.action();
      }
    },
    [shortcuts, preventDefault, ignoreInputs]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Get shortcuts by category
  const getShortcutsByCategory = useCallback(
    (category: KeyboardShortcut['category']) => {
      return shortcuts.filter((s) => s.category === category);
    },
    [shortcuts]
  );

  return { shortcuts, getShortcutsByCategory };
};

/**
 * Hook for a single keyboard shortcut
 */
export const useKeyboardShortcut = (
  shortcut: Omit<KeyboardShortcut, 'action'>,
  action: () => void,
  deps: any[] = []
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if in input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, action, ...deps]);
};

export default useKeyboardShortcuts;
