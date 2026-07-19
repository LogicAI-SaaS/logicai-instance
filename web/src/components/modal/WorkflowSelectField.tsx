/**
 * WorkflowSelectField - Dynamic select populated from user's workflows via API
 */

import React, { useEffect, useState } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { localApiRequest } from '../../config/api';

interface Workflow {
  id: string;
  name: string;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export function WorkflowSelectField({ value, onChange }: Props) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchWorkflows() {
    setLoading(true);
    setError(null);
    try {
      const res = await localApiRequest('/api/workflows');
      const data = await res.json();
      setWorkflows(data.data || []);
    } catch {
      setError('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const res = await localApiRequest('/api/workflows', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Workflow',
          description: '',
          nodes: [],
          edges: [],
        }),
      });
      const data = await res.json();
      const newWorkflow = data.data;
      // Open in new tab
      window.open(`/workflow/${newWorkflow.id}`, '_blank');
      // Select it automatically
      onChange(newWorkflow.id);
      // Refresh list
      await fetchWorkflows();
    } catch {
      setError('Failed to create workflow');
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all hover:border-white/20 cursor-pointer shadow-inner disabled:opacity-50"
        >
          <option value="">— Select a workflow —</option>
          {workflows.map((wf) => (
            <option key={wf.id} value={wf.id}>
              {wf.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={fetchWorkflows}
          disabled={loading}
          className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all disabled:opacity-50"
          title="Refresh workflows"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <button
        type="button"
        onClick={handleCreate}
        disabled={creating}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-sm self-start disabled:opacity-50"
      >
        <Plus className={`w-4 h-4 ${creating ? 'animate-spin' : ''}`} />
        {creating ? 'Creating…' : 'Create new workflow'}
      </button>

      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
