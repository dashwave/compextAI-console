import React, { useState, useEffect } from 'react';
import { FileCode, Settings, ChevronDown, ChevronUp, Save, Plus, X, Trash2 } from 'lucide-react';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { CreateTemplateModal } from './CreateTemplateModal';
import { Template, templateApi, AVAILABLE_MODELS, ModelType } from '../lib/api/template';

interface Project {
  id: string;
  name: string;
  lastModified: string;
}

interface TemplatesTabProps {
  project: Project;
}

export function TemplatesTab({ project }: TemplatesTabProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTemplate, setDeleteTemplate] = useState<Template | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [project.name]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateApi.list(project.name);
      setTemplates(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (template: Template) => {
    try {
      setSaving(true);
      await templateApi.update(template.identifier, template);
      setTemplates(templates.map(t => 
        t.identifier === template.identifier ? template : t
      ));
      setEditingTemplate(null);
    } catch (err) {
      console.error('Error updating template:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (newTemplate: Partial<Template>) => {
    try {
      setIsCreating(true);
      const created = await templateApi.create(project.name, newTemplate);
      setTemplates([created, ...templates]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating template:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTemplate) return;

    try {
      setIsDeleting(true);
      await templateApi.delete(deleteTemplate.identifier);
      setTemplates(templates.filter(t => t.identifier !== deleteTemplate.identifier));
      setDeleteTemplate(null);
    } catch (err) {
      console.error('Error deleting template:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Configuration Templates</h2>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Create Template
        </button>
      </div>

      <div className="space-y-4">
        {templates.map((template) => {
          const isExpanded = expandedId === template.identifier;
          const isEditing = editingTemplate?.identifier === template.identifier;

          return (
            <div
              key={template.identifier}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <FileCode className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h3 className="text-lg font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-500">Model: {template.model}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isExpanded && !isEditing && (
                    <>
                      <button
                        onClick={() => setEditingTemplate(template)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTemplate(template);
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : template.identifier)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={editingTemplate.name}
                          disabled
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <select
                          value={editingTemplate.model}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            model: e.target.value as ModelType
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        >
                          {AVAILABLE_MODELS.map(model => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          value={editingTemplate.temperature}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            temperature: parseFloat(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timeout</label>
                        <input
                          type="number"
                          min="0"
                          value={editingTemplate.timeout}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            timeout: parseInt(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                        <input
                          type="number"
                          min="0"
                          value={editingTemplate.max_tokens || ''}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            max_tokens: e.target.value ? parseInt(e.target.value) : null
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Completion Tokens</label>
                        <input
                          type="number"
                          min="0"
                          value={editingTemplate.max_completion_tokens || ''}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            max_completion_tokens: e.target.value ? parseInt(e.target.value) : null
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Output Tokens</label>
                        <input
                          type="number"
                          min="0"
                          value={editingTemplate.max_output_tokens || ''}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            max_output_tokens: e.target.value ? parseInt(e.target.value) : null
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Top P</label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={editingTemplate.top_p || ''}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            top_p: e.target.value ? parseFloat(e.target.value) : null
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
                        <textarea
                          value={editingTemplate.system_prompt || ''}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            system_prompt: e.target.value || null
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Response Format</label>
                        <textarea
                          value={JSON.stringify(editingTemplate.response_format || {}, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              setEditingTemplate({
                                ...editingTemplate,
                                response_format: parsed
                              });
                            } catch (err) {
                              // Invalid JSON, ignore
                            }
                          }}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingTemplate(null)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdate(editingTemplate)}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          <Save size={18} />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Temperature:</span>
                          <span className="ml-2">{template.temperature}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Timeout:</span>
                          <span className="ml-2">{template.timeout}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Max Tokens:</span>
                          <span className="ml-2">{template.max_tokens || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Top P:</span>
                          <span className="ml-2">{template.top_p || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Max Completion Tokens:</span>
                          <span className="ml-2">{template.max_completion_tokens || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Max Output Tokens:</span>
                          <span className="ml-2">{template.max_output_tokens || 'N/A'}</span>
                        </div>
                      </div>
                      {template.system_prompt && (
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">System Prompt:</span>
                          <p className="text-sm bg-gray-50 p-3 rounded-lg">{template.system_prompt}</p>
                        </div>
                      )}
                      {template.response_format && Object.keys(template.response_format).length > 0 && (
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">Response Format:</span>
                          <pre className="text-sm bg-gray-50 p-3 rounded-lg overflow-auto">
                            {JSON.stringify(template.response_format, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isCreating={isCreating}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteTemplate}
        onClose={() => setDeleteTemplate(null)}
        onConfirm={handleDelete}
        title="Delete Template"
        message={`Are you sure you want to delete the template "${deleteTemplate?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}