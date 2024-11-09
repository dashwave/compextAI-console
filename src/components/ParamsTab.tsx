import React, { useState, useEffect } from 'react';
import { Settings, ChevronDown, ChevronUp, Trash2, Plus, Save, X } from 'lucide-react';
import { promptConfigApi, PromptConfig } from '../lib/api/prompt-config';
import { Template, templateApi } from '../lib/api/template';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { CreatePromptConfigModal } from './CreatePromptConfigModal';

interface Project {
  id: string;
  name: string;
  lastModified: string;
}

interface ParamsTabProps {
  project: Project;
}

export function ParamsTab({ project }: ParamsTabProps) {
  const [configs, setConfigs] = useState<PromptConfig[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfig, setDeleteConfig] = useState<PromptConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [templateDetails, setTemplateDetails] = useState<Record<string, Template | null>>({});
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<PromptConfig | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
    fetchAvailableTemplates();
  }, [project.name]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await promptConfigApi.list(project.name);
      setConfigs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching prompt configs:', err);
      setError('Failed to load prompt configurations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTemplates = async () => {
    try {
      const templates = await templateApi.list(project.name);
      setAvailableTemplates(templates);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const fetchTemplateDetails = async (templateId: string) => {
    if (!templateDetails[templateId]) {
      try {
        setLoadingTemplate(templateId);
        const template = await promptConfigApi.getTemplate(templateId);
        setTemplateDetails(prev => ({
          ...prev,
          [templateId]: template
        }));
      } catch (err) {
        console.error('Error fetching template:', err);
        setTemplateDetails(prev => ({
          ...prev,
          [templateId]: null
        }));
      } finally {
        setLoadingTemplate(null);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteConfig) return;

    try {
      setIsDeleting(true);
      await promptConfigApi.delete(
        project.name,
        deleteConfig.name,
        deleteConfig.environment
      );
      setConfigs(configs.filter(c => 
        !(c.name === deleteConfig.name && c.environment === deleteConfig.environment)
      ));
      setDeleteConfig(null);
    } catch (err) {
      console.error('Error deleting prompt config:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreate = async (name: string, environment: string, templateId: string) => {
    try {
      setIsCreating(true);
      const newConfig = await promptConfigApi.create(project.name, name, environment, templateId);
      setConfigs([newConfig, ...configs]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating prompt config:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleExpand = async (configId: string, templateId: string) => {
    if (expandedId === configId) {
      setExpandedId(null);
      setEditingConfig(null);
    } else {
      setExpandedId(configId);
      await fetchTemplateDetails(templateId);
    }
  };

  const handleUpdate = async () => {
    if (!editingConfig) return;

    try {
      setIsSaving(true);
      await promptConfigApi.update(
        project.name,
        editingConfig.name,
        editingConfig.environment,
        editingConfig.template_id
      );

      // Update the configs list with the new template
      setConfigs(configs.map(c => 
        c.name === editingConfig.name && c.environment === editingConfig.environment
          ? editingConfig
          : c
      ));

      // Clear the template details cache for the new template
      await fetchTemplateDetails(editingConfig.template_id);
      
      setEditingConfig(null);
    } catch (err) {
      console.error('Error updating prompt config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium">Prompt Configurations</h2>
          <p className="text-sm text-gray-500">Manage your AI model's behavior with custom prompt configurations</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Create Config
        </button>
      </div>

      <div className="space-y-4">
        {configs.map((config) => {
          const configId = `${config.name}-${config.environment}`;
          const isExpanded = expandedId === configId;
          const isEditing = editingConfig?.name === config.name && 
                          editingConfig?.environment === config.environment;
          const template = templateDetails[config.template_id];
          const isLoadingTemplate = loadingTemplate === config.template_id;

          return (
            <div
              key={configId}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">{config.name}</h3>
                  <p className="text-sm text-gray-500">Environment: {config.environment}</p>
                </div>
                <div className="flex gap-2">
                  {isExpanded && !isEditing && (
                    <>
                      <button
                        onClick={() => setEditingConfig(config)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfig(config);
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleExpand(configId, config.template_id)}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                        <select
                          value={editingConfig.template_id}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            template_id: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {availableTemplates.map(template => (
                            <option key={template.identifier} value={template.identifier}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingConfig(null)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdate}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          <Save size={18} />
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : isLoadingTemplate ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : template ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Template:</span>
                          <span className="ml-2">{template.name}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Model:</span>
                          <span className="ml-2">{template.model}</span>
                        </div>
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
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Template information not available
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {configs.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No prompt configurations found
          </div>
        )}
      </div>

      <CreatePromptConfigModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        projectName={project.name}
        isCreating={isCreating}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteConfig}
        onClose={() => setDeleteConfig(null)}
        onConfirm={handleDelete}
        title="Delete Prompt Configuration"
        message={`Are you sure you want to delete the prompt configuration "${deleteConfig?.name}" for environment "${deleteConfig?.environment}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}