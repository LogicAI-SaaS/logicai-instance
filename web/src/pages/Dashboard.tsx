/**
 * Dashboard - Page principale affichant tous les workflows
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Square,
  Trash2,
  Edit,
  FolderOpen,
} from 'lucide-react';
import { localApiRequest } from '../config/api';
import type { Workflow } from '../types/workflow';
import AppLayout from '../components/layouts/AppLayout';

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => { loadWorkflows(); }, []);

  async function loadWorkflows() {
    try {
      setLoading(true);
      setError(null);
      const response = await localApiRequest('/api/workflows');
      const data = await response.json();
      setWorkflows(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('dashboard.deleteConfirm'))) return;
    try {
      const response = await localApiRequest(`/api/workflows/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setWorkflows((prev) => prev.filter((w) => w.id !== id));
      } else {
        const err = await response.json();
        throw new Error(err.error || t('dashboard.deleteFailed'));
      }
    } catch (err: any) {
      alert(err.message || t('dashboard.deleteFailed'));
    }
  }

  async function handleToggleActive(workflow: Workflow) {
    try {
      const response = await localApiRequest(`/api/workflows/${workflow.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !workflow.isActive }),
      });
      const result = await response.json();
      const updated = result.data;
      setWorkflows((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    } catch (err: any) {
      alert(err.message || 'Failed to update workflow');
    }
  }

  async function handleCreateNew() {
    try {
      const response = await localApiRequest('/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ name: t('dashboard.newWorkflowName'), description: '', nodes: [], edges: [] }),
      });
      const result = await response.json();
      navigate(`/workflow/${result.data.id}`);
    } catch (err: any) {
      alert(err.message || t('dashboard.createFailed'));
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4" />
            <p className="text-gray-400">{t('dashboard.loadingWorkflows')}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadWorkflows}
              className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-hover transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-8xl mx-auto">
          {workflows.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('dashboard.noWorkflows')}</h3>
              <p className="text-gray-400 mb-6">{t('dashboard.noWorkflowsSubtitle')}</p>
              <button
                onClick={handleCreateNew}
                className="px-8 py-4 bg-brand-blue hover:bg-brand-hover text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-xl shadow-brand-blue/30 font-medium text-lg"
              >
                {t('dashboard.createFirst')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="bg-bg-card border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all duration-200 hover:shadow-xl hover:shadow-brand-blue/5"
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${workflow.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                      {workflow.isActive ? t('dashboard.active') : t('dashboard.inactive')}
                    </span>
                    <span className="text-xs text-gray-500">{workflow.nodes.length} {t('dashboard.nodes')}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{workflow.name}</h3>
                  {workflow.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{workflow.description}</p>
                  )}
                  {workflow.webhookPath && (
                    <p className="text-xs text-gray-500 mb-4 font-mono break-all bg-gray-800/50 p-2 rounded">
                      {`${window.location.origin}/webhook/${workflow.id}`}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    <button
                      onClick={() => navigate(`/workflow/${workflow.id}`)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      {t('dashboard.edit')}
                    </button>
                    <button
                      onClick={() => handleToggleActive(workflow)}
                      className={`p-2.5 rounded transition-colors ${workflow.isActive ? 'bg-orange-900/50 text-orange-300 hover:bg-orange-900/70' : 'bg-green-900/50 text-green-300 hover:bg-green-900/70'}`}
                      title={workflow.isActive ? t('dashboard.disable') : t('dashboard.activate')}
                    >
                      {workflow.isActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(workflow.id)}
                      className="p-2.5 bg-red-900/50 text-red-300 rounded hover:bg-red-900/70 transition-colors"
                      title={t('dashboard.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
