import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Template, templateApi } from '../lib/api/template';

interface CreatePromptConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, environment: string, templateId: string) => Promise<void>;
  projectName: string;
  isCreating: boolean;
}

export function CreatePromptConfigModal({
  isOpen,
  onClose,
  onSubmit,
  projectName,
  isCreating
}: CreatePromptConfigModalProps) {
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, projectName]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await templateApi.list(projectName);
      setTemplates(data);
      if (data.length > 0) {
        setTemplateId(data[0].identifier);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!environment.trim()) {
      setError('Environment is required');
      return;
    }
    if (!templateId) {
      setError('Template is required');
      return;
    }

    try {
      await onSubmit(name.trim(), environment.trim(), templateId);
      setName('');
      setEnvironment('');
      setTemplateId('');
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Create Prompt Configuration</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter configuration name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environment <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={environment}
              onChange={(e) => {
                setEnvironment(e.target.value);
                setError('');
              }}
              placeholder="Enter environment"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template <span className="text-red-500">*</span>
            </label>
            {isLoading ? (
              <div className="text-center py-2">Loading templates...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-2 text-gray-500">No templates available</div>
            ) : (
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {templates.map(template => (
                  <option key={template.identifier} value={template.identifier}>
                    {template.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isLoading || templates.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus size={18} />
              {isCreating ? 'Creating...' : 'Create Config'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}