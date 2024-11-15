import React, { useState, useEffect } from 'react';
import { Play, Loader } from 'lucide-react';
import { Template, templateApi } from '../lib/api/template';
import { executionApi } from '../lib/api/execution';

interface ReExecuteSectionProps {
  projectName: string;
  executionId: string;
  onReExecute: (newExecutionId: string) => void;
}

export function ReExecuteSection({ projectName, executionId, onReExecute }: ReExecuteSectionProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [projectName]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await templateApi.list(projectName);
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(data[0].identifier);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReExecute = async () => {
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    try {
      setIsExecuting(true);
      setError(null);
      const result = await executionApi.rerun(executionId, selectedTemplate);
      onReExecute(result.identifier);
    } catch (err: any) {
      setError(err.message || 'Failed to re-execute');
      setIsExecuting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
            Select Template
          </label>
          <select
            id="template"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isExecuting}
          >
            {templates.map(template => (
              <option key={template.identifier} value={template.identifier}>
                {template.name} ({template.model})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleReExecute}
          disabled={isExecuting || !selectedTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isExecuting ? (
            <>
              <Loader className="animate-spin" size={18} />
              <span>Executing...</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>Re-Execute</span>
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}