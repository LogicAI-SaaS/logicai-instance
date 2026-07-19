/**
 * Template Gallery
 *
 * Modal for browsing and applying workflow templates.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, Star, Clock, TrendingUp, Filter } from 'lucide-react';
import {
  WORKFLOW_TEMPLATES,
  getTemplatesByCategory,
  getPopularTemplates,
  searchTemplates,
} from '../../lib/workflowTemplates';
import type { WorkflowTemplate } from '../../lib/workflowTemplates';

export interface TemplateGalleryProps {
  /** Whether the gallery is open */
  isOpen: boolean;
  /** Close the gallery */
  onClose: () => void;
  /** Apply a template */
  onApplyTemplate: (template: WorkflowTemplate) => void;
}

/**
 * Category icons and colors
 */
const CATEGORY_CONFIG: Record<
  WorkflowTemplate['category'],
  { icon: string; color: string; label: string }
> = {
  automation: { icon: '⚡', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200', label: 'Automation' },
  integration: { icon: '🔗', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', label: 'Integration' },
  ai: { icon: '🤖', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200', label: 'AI & ML' },
  data: { icon: '📊', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', label: 'Data' },
  communication: { icon: '💬', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200', label: 'Communication' },
};

/**
 * Difficulty badge
 */
const DifficultyBadge: React.FC<{ level: WorkflowTemplate['difficulty'] }> = ({ level }) => {
  const config = {
    beginner: { label: 'Beginner', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' },
    intermediate: { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' },
    advanced: { label: 'Advanced', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' },
  };

  const { label, color } = config[level];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>
  );
};

/**
 * Template Card
 */
const TemplateCard: React.FC<{
  template: WorkflowTemplate;
  onSelect: () => void;
}> = ({ template, onSelect }) => {
  const categoryConfig = CATEGORY_CONFIG[template.category];

  return (
    <div
      onClick={onSelect}
      className="bg-white/5 rounded-lg border border-white/10 p-4 hover:shadow-lg hover:border-orange-500 cursor-pointer transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{categoryConfig.icon}</span>
          <div>
            <h3 className="font-semibold text-white">{template.name}</h3>
            <p className="text-xs text-gray-300">
              {template.nodes.length} nodes • {template.edges.length} connections
            </p>
          </div>
        </div>
        {template.popularity && template.popularity > 85 && (
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">
        {template.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {template.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-white/10 text-white rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <DifficultyBadge level={template.difficulty} />
        {template.popularity && (
          <div className="flex items-center gap-1 text-xs text-gray-300">
            <TrendingUp className="w-3 h-3" />
            {template.popularity}% popular
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main Template Gallery Component
 */
export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose, onApplyTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WorkflowTemplate['category'] | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let templates = WORKFLOW_TEMPLATES;

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      templates = searchTemplates(searchQuery).filter((t) =>
        selectedCategory === 'all' ? true : t.category === selectedCategory
      );
    }

    return templates;
  }, [searchQuery, selectedCategory]);

  // Get popular templates
  const popularTemplates = useMemo(() => getPopularTemplates(3), []);

  const handleApplyTemplate = (template: WorkflowTemplate) => {
    onApplyTemplate(template);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Workflow Templates
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              Start with a pre-built workflow template
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-white/10 rounded-md bg-white/5 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                    ${
                      selectedCategory === 'all'
                        ? 'bg-orange-500/5 text-orange-500'
                        : 'hover:bg-orange-500 text-white'
                    }
                  `}
                >
                  <Filter className="w-4 h-4" />
                  All Templates
                  <span className="ml-auto text-xs opacity-60">{WORKFLOW_TEMPLATES.length}</span>
                </button>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as WorkflowTemplate['category'])}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                      ${
                        selectedCategory === key
                          ? 'bg-orange-500/5 text-orange-500'
                          : 'hover:bg-orange-500 text-white'
                      }
                    `}
                  >
                    <span>{config.icon}</span>
                    {config.label}
                    <span className="ml-auto text-xs opacity-60">
                      {getTemplatesByCategory(key as WorkflowTemplate['category']).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Templates */}
            <div>
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Popular
              </h3>
              <div className="space-y-2">
                {popularTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className="w-full text-left p-2 hover:bg-orange-500 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm text-white truncate">
                        {template.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Section header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedCategory === 'all' ? 'All Templates' : CATEGORY_CONFIG[selectedCategory].label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Template grid */}
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No templates found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => setSelectedTemplate(template)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onApply={() => handleApplyTemplate(selectedTemplate)}
        />
      )}
    </div>
  );
};

/**
 * Template Detail Modal
 */
const TemplateDetailModal: React.FC<{
  template: WorkflowTemplate;
  onClose: () => void;
  onApply: () => void;
}> = ({ template, onClose, onApply }) => {
  const { t } = useTranslation();
  const categoryConfig = CATEGORY_CONFIG[template.category];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-black border border-white/10 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{categoryConfig.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {template.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${categoryConfig.color}`}>
                    {categoryConfig.label}
                  </span>
                  <DifficultyBadge level={template.difficulty} />
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-md"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">{template.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">
                {template.nodes.length}
              </div>
              <div className="text-xs text-gray-300">Nodes</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">
                {template.edges.length}
              </div>
              <div className="text-xs text-gray-300">Connections</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">
                {template.popularity || 0}%
              </div>
              <div className="text-xs text-gray-300">Popularity</div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/5 text-white rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Workflow preview */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Workflow Preview
            </h3>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="space-y-2">
                {template.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>{(node.data?.label as string) || node.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/10 rounded-md text-white hover:bg-white/10 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={onApply}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {t('templates.useTemplate')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
