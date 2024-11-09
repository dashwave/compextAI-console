import React, { useState, useEffect } from 'react';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { promptConfigApi } from '../lib/api/prompt-config';
import { templateApi } from '../lib/api/template';
import { Template } from '../lib/api/template';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { CreatePromptConfigModal } from './CreatePromptConfigModal';

interface PromptConfig {
  name: string;
  environment: string;
  template_id: string;
}

interface PromptConfigsTabProps {
  project: {
    name: string;
  };
}

export function PromptConfigsTab({ project }: PromptConfigsTabProps) {
  const [configs, setConfigs] = useState<PromptConfig[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateDetails, setTemplateDetails] = useState<Record<string, Template | null>>({});
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfig, setDeleteConfig] = useState<PromptConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchConfigs = async () => {
    try {
      const data = await promptConfigApi.list(project.name);
      setConfigs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch configurations');
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await templateApi.list(project.name);
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch templates');
    }
  };

  const fetchTemplateDetails = async (templateId: string) => {
    if (!templateDetails[templateId]) {
      try {
        const template = await promptConfigApi.getTemplate(templateId);
        setTemplateDetails(prev => ({
          ...prev,
          [templateId]: template
        }));
      } catch (err: any) {
        console.log(`Template not found for ID: ${templateId}`);
        setTemplateDetails(prev => ({
          ...prev,
          [templateId]: null
        }));
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchConfigs(), fetchTemplates()]);
      setLoading(false);
    };
    init();
  }, [project.name]);

  useEffect(() => {
    if (expandedConfig) {
      const config = configs.find(c => c.name === expandedConfig);
      if (config) {
        fetchTemplateDetails(config.template_id);
      }
    }
  }, [expandedConfig]);

  const handleCreateConfig = async (name: string, environment: string, templateId: string) => {
    try {
      setIsCreating(true);
      await promptConfigApi.create(project.name, name, environment, templateId);
      await fetchConfigs();
      setIsModalOpen(false);
    } catch (err: any) {
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteConfig = async () => {
    if (!deleteConfig) return;

    try {
      setIsDeleting(true);
      await promptConfigApi.delete(project.name, deleteConfig.name, deleteConfig.environment);
      await fetchConfigs();
      setDeleteConfig(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete configuration');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-8">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium">Prompt Configurations</h2>
          <p className="text-sm text-gray-500">Manage your AI model's behavior with custom prompt configurations</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Configuration
        </button>
      </div>

      <div className="space-y-4">
        {configs.map((config) => (
          <div
            key={`${config.name}-${config.environment}`}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">{config.name}</h3>
                <p className="text-sm text-gray-500">{config.environment}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfig(config);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setExpandedConfig(expandedConfig === config.name ? null : config.name)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {expandedConfig === config.name ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
              </div>
            </div>

            {expandedConfig === config.name && templateDetails[config.template_id] && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Template Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Template Name:</span>
                    <span className="text-gray-900">{templateDetails[config.template_id]?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Model:</span>
                    <span className="text-gray-900">{templateDetails[config.template_id]?.model}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Temperature:</span>
                    <span className="text-gray-900">{templateDetails[config.template_id]?.temperature}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Timeout:</span>
                    <span className="text-gray-900">{templateDetails[config.template_id]?.timeout}</span>
                  </div>
                  {templateDetails[config.template_id]?.system_prompt && (
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">System Prompt:</span>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">
                        {templateDetails[config.template_id]?.system_prompt}
                      </p>
                    </div>
                  )}
                  {templateDetails[config.template_id]?.response_format && 
                   Object.keys(templateDetails[config.template_id]?.response_format || {}).length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">Response Format:</span>
                      <pre className="text-sm bg-gray-50 p-3 rounded-lg overflow-auto">
                        {JSON.stringify(templateDetails[config.template_id]?.response_format, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {configs.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No prompt configurations found
          </div>
        )}
      </div>

      <CreatePromptConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateConfig}
        projectName={project.name}
        isCreating={isCreating}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteConfig}
        onClose={() => setDeleteConfig(null)}
        onConfirm={handleDeleteConfig}
        title="Delete Prompt Configuration"
        message={`Are you sure you want to delete the prompt configuration "${deleteConfig?.name}" for environment "${deleteConfig?.environment}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}