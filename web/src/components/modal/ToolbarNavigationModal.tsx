/**
 * ToolbarNavigationModal - Modal for workflow actions and navigation
 * Features:
 * - Opens when gear icon is clicked
 * - Contains all workflow actions (save, execute, activate, delete, etc.)
 * - Clean, organized layout with icons
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, Play, Power, Trash2, FolderOpen, Settings, Zap } from 'lucide-react';

interface ToolbarNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onExecute: () => void;
  onToggleActive: () => void;
  onDeleteSelected: () => void;
  saving: boolean;
  executing: boolean;
  isActive: boolean;
  hasSelection: boolean;
  workflowId?: string;
}

export default function ToolbarNavigationModal({
  isOpen,
  onClose,
  onSave,
  onExecute,
  onToggleActive,
  onDeleteSelected,
  saving,
  executing,
  isActive,
  hasSelection,
  workflowId,
}: ToolbarNavigationModalProps) {
  if (!isOpen) return null;

  const isNew = !workflowId || workflowId === 'new';
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl border max-h-[80vh] overflow-hidden flex flex-col bg-bg-modal border-white/10 animate-scaleIn"
        style={{
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-blue/20 rounded-lg">
              <Settings className="w-5 h-5 text-brand-blue" />
            </div>
            <h2 className="text-lg font-semibold text-white">{t('modal.toolbarNav.title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {/* Workflow Actions Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Actions Principales
            </h3>

            <button
              onClick={onSave}
              disabled={saving || isNew}
              className="w-full flex items-center gap-3 px-4 py-3 bg-brand-blue hover:bg-brand-hover text-white rounded-lg disabled:bg-white/10 disabled:cursor-not-allowed transition-all duration-200 group"
            >
              {saving ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
              <div className="flex-1 text-left">
                <div className="font-medium">{t('modal.toolbarNav.save')}</div>
                <div className="text-xs text-white/70">{t('modal.toolbarNav.saveDesc')}</div>
              </div>
            </button>

            <button
              onClick={onExecute}
              disabled={executing || isNew || !isActive}
              className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-white/10 disabled:cursor-not-allowed transition-all duration-200 group"
            >
              {executing ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
              <div className="flex-1 text-left">
                <div className="font-medium">{t('modal.toolbarNav.execute')}</div>
                <div className="text-xs text-white/70">{t('modal.toolbarNav.executeDesc')}</div>
              </div>
              {isNew && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded">{t('modal.toolbarNav.saveFirst')}</span>
              )}
            </button>

            <button
              onClick={onToggleActive}
              disabled={isNew}
              className={`w-full flex items-center gap-3 px-4 py-3 text-white rounded-lg disabled:bg-white/10 disabled:cursor-not-allowed transition-all duration-200 group ${
                isActive
                  ? 'bg-accent-orange hover:bg-orange-700'
                  : 'bg-white/10 hover:bg-white/10'
              }`}
            >
              <Power className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="flex-1 text-left">
                <div className="font-medium">
                  {isActive ? t('modal.toolbarNav.deactivate') : t('modal.toolbarNav.activate')}
                </div>
                <div className="text-xs text-white/70">
                  {isActive ? t('modal.toolbarNav.deactivateDesc') : t('modal.toolbarNav.activateDesc')}
                </div>
              </div>
              {isActive && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
              )}
            </button>
          </div>

          {/* Edit Actions Section */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {t('modal.toolbarNav.sectionEdit')}
            </h3>
            <button
              onClick={onDeleteSelected}
              disabled={!hasSelection}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 group"
            >
              <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="flex-1 text-left">
                <div className="font-medium">{t('modal.toolbarNav.deleteSelection')}</div>
                <div className="text-xs opacity-70">{t('modal.toolbarNav.deleteSelectionDesc')}</div>
              </div>
            </button>
          </div>

          {/* Workflow Info Section */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {t('modal.toolbarNav.sectionInfo')}
            </h3>
            <div className="p-4 bg-bg-card rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{t('modal.toolbarNav.statusLabel')}</span>
                <span className={`font-medium ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
                  {isActive ? t('modal.toolbarNav.active') : t('modal.toolbarNav.inactive')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">ID</span>
                <span className="font-mono text-xs text-gray-500">{workflowId || t('modal.toolbarNav.new')}</span>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="p-4 bg-brand-blue/10 rounded-lg border border-brand-blue/20">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-brand-blue mb-1">{t('modal.toolbarNav.shortcuts')}</div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Delete</kbd> {t('modal.toolbarNav.shortcutDelete')}</div>
                  <div><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Ctrl</kbd> + Clic {t('modal.toolbarNav.shortcutMultiSelect')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-bg-modal">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-white/10 hover:bg-white/10 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-bg-modal"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
