/**
 * Workflow Toolbar
 *
 * Provides workflow controls: save, execute, export, import, auto-save status
 */

import React, { useRef, useState } from 'react';
import { Save, Play, Download, Upload, Copy, Trash2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Node, Edge } from '@xyflow/react';
import {
  exportWorkflow,
  importWorkflow,
  copyToClipboard,
  validateWorkflowFile,
  getWorkflowInfo,
} from '../../lib/workflowExporter';

export interface WorkflowToolbarProps {
  /** Current workflow nodes */
  nodes: Node[];
  /** Current workflow edges */
  edges: Edge[];
  /** Save callback */
  onSave?: () => Promise<void> | void;
  /** Execute callback */
  onExecute?: () => Promise<void> | void;
  /** Clear workflow callback */
  onClear?: () => void;
  /** Import callback */
  onImport?: (data: { nodes: Node[]; edges: Edge[] }) => void;
  /** Is workflow currently executing */
  isExecuting?: boolean;
  /** Is workflow currently saving */
  isSaving?: boolean;
  /** Last saved timestamp */
  lastSaved?: Date | null;
  /** Has unsaved changes */
  hasUnsavedChanges?: boolean;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  nodes,
  edges,
  onSave,
  onExecute,
  onClear,
  onImport,
  isExecuting = false,
  isSaving = false,
  lastSaved = null,
  hasUnsavedChanges = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleExport = () => {
    const metadata = {
      name: 'My Workflow',
      description: 'Exported from LogicAI-N8N',
      tags: ['workflow'],
    };
    exportWorkflow(nodes, edges, metadata);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);

    // Validate file
    const isValid = await validateWorkflowFile(file);
    if (!isValid) {
      setImportError(t('toolbar.invalidFile'));
      return;
    }

    try {
      const { nodes: importedNodes, edges: importedEdges, metadata } = await importWorkflow(file);
      onImport?.({ nodes: importedNodes, edges: importedEdges });
      console.log('Imported workflow:', metadata);
    } catch (error: any) {
      setImportError(error.message || t('toolbar.importFailed'));
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(nodes, edges);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      onImport?.({ nodes: data.nodes, edges: data.edges });
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return t('toolbar.savedJustNow');
    if (minutes < 60) return t('toolbar.savedMinutesAgo', { m: minutes });
    if (hours < 24) return t('toolbar.savedHoursAgo', { h: hours });
    return t('toolbar.savedOn', { date: date.toLocaleDateString() });
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-black border-b border-white/10">
      {/* Left section - Primary actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          title={t('toolbar.titleSave')}
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">
            {isSaving ? t('toolbar.saving') : t('toolbar.save')}
          </span>
        </button>

        <button
          onClick={onExecute}
          disabled={isExecuting}
          className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          title={t('toolbar.titleExecute')}
        >
          <Play className={`w-4 h-4 ${isExecuting ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-medium">
            {isExecuting ? t('toolbar.executing') : t('toolbar.execute')}
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10" />

      {/* Middle section - Import/Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-white rounded-md transition-colors"
          title={t('toolbar.titleExport')}
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">{t('toolbar.export')}</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-white rounded-md transition-colors"
          title={t('toolbar.titleImport')}
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm">{t('toolbar.import')}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <button
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition-colors"
          title={t('toolbar.titleClear')}
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">{t('toolbar.clear')}</span>
        </button>
      </div>

      {/* Right section - Status */}
      <div className="ml-auto flex items-center gap-4">
        {/* Node/Edge count */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{nodes.length}</span>
          <span>{t('toolbar.nodes')}</span>
          <span className="text-gray-400">•</span>
          <span>{edges.length}</span>
          <span>{t('toolbar.connections')}</span>
        </div>

        {/* Auto-save status */}
        {lastSaved && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{formatLastSaved(lastSaved)}</span>
          </div>
        )}

        {/* Unsaved changes indicator */}
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-sm text-orange-600 dark:text-orange-400">{t('toolbar.unsavedChanges')}</span>
          </div>
        )}
      </div>

      {/* Import error alert */}
      {importError && (
        <div className="absolute bottom-4 right-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{importError}</p>
          <button
            onClick={() => setImportError(null)}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
