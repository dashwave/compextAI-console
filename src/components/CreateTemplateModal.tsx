import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AVAILABLE_MODELS, ModelType } from '../lib/api/template';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: {
    name: string;
    model: ModelType;
    temperature?: number;
    timeout?: number;
    system_prompt?: string;
    response_format?: Record<string, any>;
  }) => Promise<void>;
  isCreating: boolean;
}

export function CreateTemplateModal({
  isOpen,
  onClose,
  onSubmit,
  isCreating
}: CreateTemplateModalProps) {
  const [name, setName] = useState('');
  const [model, setModel] = useState<ModelType>(AVAILABLE_MODELS[0]);
  const [temperature, setTemperature] = useState(0.5);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [responseFormat, setResponseFormat] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    let parsedResponseFormat = {};
    if (responseFormat.trim()) {
      try {
        parsedResponseFormat = JSON.parse(responseFormat);
      } catch (err) {
        setError('Invalid JSON format for response format');
        return;
      }
    }

    try {
      await onSubmit({
        name: name.trim(),
        model,
        temperature,
        timeout: 600,
        system_prompt: systemPrompt.trim() || null,
        response_format: parsedResponseFormat
      });
      setName('');
      setModel(AVAILABLE_MODELS[0]);
      setTemperature(0.5);
      setSystemPrompt('');
      setResponseFormat('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Create New Template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter template name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelType)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature (0-2)
            </label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Response Format (JSON)
            </label>
            <textarea
              value={responseFormat}
              onChange={(e) => setResponseFormat(e.target.value)}
              placeholder="{}"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
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
              disabled={isCreating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}