/**
 * FormBuilderField - Visual drag-and-drop form builder for formTrigger node
 * Allows building forms with field preview in real time
 */

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'phone' | 'url' | 'password';
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: string; // comma-separated for select
  description?: string;
}

const FIELD_TYPES: { value: FormField['type']; label: string; icon: string }[] = [
  { value: 'text', label: 'Text', icon: 'T' },
  { value: 'email', label: 'Email', icon: '@' },
  { value: 'number', label: 'Number', icon: '0' },
  { value: 'phone', label: 'Phone', icon: '📞' },
  { value: 'url', label: 'URL', icon: '🔗' },
  { value: 'textarea', label: 'Textarea', icon: '¶' },
  { value: 'select', label: 'Dropdown', icon: '▾' },
  { value: 'checkbox', label: 'Checkbox', icon: '✓' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'password', label: 'Password', icon: '🔒' },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

interface Props {
  value: FormField[];
  onChange: (fields: FormField[]) => void;
}

export function FormBuilderField({ value, onChange }: Props) {
  const fields: FormField[] = Array.isArray(value) ? value : [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  function addField() {
    const newField: FormField = {
      id: generateId(),
      name: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: 'text',
      required: false,
      placeholder: '',
    };
    const updated = [...fields, newField];
    onChange(updated);
    setExpandedId(newField.id);
  }

  function removeField(id: string) {
    onChange(fields.filter(f => f.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function updateField(id: string, patch: Partial<FormField>) {
    onChange(fields.map(f => f.id === id ? { ...f, ...patch } : f));
  }

  function moveField(from: number, to: number) {
    if (to < 0 || to >= fields.length) return;
    const updated = [...fields];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  }

  // Drag handlers
  function handleDragStart(index: number) {
    setDragIndex(index);
  }
  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }
  function handleDrop(index: number) {
    if (dragIndex !== null && dragIndex !== index) {
      moveField(dragIndex, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{t('modal.formBuilder.fieldCount', { count: fields.length })}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(p => !p)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              previewMode
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            }`}
          >
            <Eye className="w-3 h-3" />
            {t('modal.formBuilder.preview')}
          </button>
          <button
            type="button"
            onClick={addField}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue border border-brand-blue/40 rounded-md text-xs font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            {t('modal.formBuilder.addField')}
          </button>
        </div>
      </div>

      {/* Preview mode */}
      {previewMode ? (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">{t('modal.formBuilder.previewTitle')}</p>
          {fields.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">{t('modal.formBuilder.noFields')}</p>
          )}
          {fields.map(field => (
            <div key={field.id} className="space-y-1">
              <label className="text-sm font-medium text-gray-200">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {field.description && (
                <p className="text-xs text-gray-500">{field.description}</p>
              )}
              {field.type === 'textarea' ? (
                <textarea
                  disabled
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-gray-400 resize-none"
                />
              ) : field.type === 'select' ? (
                <select disabled className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-gray-400">
                  <option value="">Select...</option>
                  {field.options?.split(',').map(o => (
                    <option key={o.trim()} value={o.trim()}>{o.trim()}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-2 cursor-not-allowed">
                  <input type="checkbox" disabled className="rounded" />
                  <span className="text-sm text-gray-400">{field.placeholder || field.label}</span>
                </label>
              ) : (
                <input
                  disabled
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-gray-400"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Builder mode */
        <div className="space-y-2">
          {fields.length === 0 && (
            <div className="text-center py-6 rounded-xl border border-dashed border-white/20 text-gray-500 text-sm">
              {t('modal.formBuilder.noFieldsStart')}
            </div>
          )}
          {fields.map((field, index) => (
            <div
              key={field.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              className={`rounded-xl border transition-all ${
                dragOverIndex === index && dragIndex !== index
                  ? 'border-brand-blue/60 bg-brand-blue/5'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {/* Field header row */}
              <div className="flex items-center gap-2 px-3 py-2.5">
                <GripVertical className="w-4 h-4 text-gray-600 cursor-grab active:cursor-grabbing shrink-0" />

                {/* Type badge */}
                <span className="text-xs font-mono bg-white/10 text-gray-300 px-2 py-0.5 rounded">
                  {field.type}
                </span>

                {/* Label */}
                <input
                  type="text"
                  value={field.label}
                  onChange={e => updateField(field.id, { label: e.target.value })}
                  placeholder="Label"
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none min-w-0"
                />

                {/* Required badge */}
                <button
                  type="button"
                  onClick={() => updateField(field.id, { required: !field.required })}
                  className={`text-xs px-2 py-0.5 rounded font-medium transition-colors shrink-0 ${
                    field.required
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-white/5 text-gray-500 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {field.required ? 'requis' : 'optionnel'}
                </button>

                {/* Expand */}
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === field.id ? null : field.id)}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {expandedId === field.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded config */}
              {expandedId === field.id && (
                <div className="px-3 pb-3 pt-1 border-t border-white/10 space-y-2.5">
                  {/* Field type */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">{t('modal.formBuilder.typeLabel')}</label>
                    <div className="flex flex-wrap gap-1.5">
                      {FIELD_TYPES.map(ft => (
                        <button
                          key={ft.value}
                          type="button"
                          onClick={() => updateField(field.id, { type: ft.value })}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                            field.type === ft.value
                              ? 'bg-brand-blue text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {ft.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name (key) */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">{t('modal.formBuilder.nameKey')}</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={e => updateField(field.id, { name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                        placeholder="field_name"
                        className="w-full px-2.5 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Placeholder</label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={e => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="Ex: John Doe..."
                        className="w-full px-2.5 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                  </div>

                  {/* Options for select */}
                  {field.type === 'select' && (
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">{t('modal.formBuilder.optionsLabel')}</label>
                      <input
                        type="text"
                        value={field.options || ''}
                        onChange={e => updateField(field.id, { options: e.target.value })}
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full px-2.5 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div>
                      <label className="text-xs text-gray-400 block mb-1">{t('modal.formBuilder.descriptionLabel')}</label>
                    <input
                      type="text"
                      value={field.description || ''}
                      onChange={e => updateField(field.id, { description: e.target.value })}
                      placeholder={t('modal.formBuilder.helpPlaceholder')}
                      className="w-full px-2.5 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
