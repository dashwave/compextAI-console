import { apiClient, handleApiError } from '../api-client';

export interface Template {
  identifier: string;
  name: string;
  model: string;
  temperature: number;
  timeout: number;
  max_tokens: number;
  max_completion_tokens: number;
  max_output_tokens: number;
  top_p: number;
  response_format: Record<string, any>;
  system_prompt: string;
}

export const AVAILABLE_MODELS = [
  'gpt4',
  'gpt-4o',
  'o1-mini',
  'o1-preview',
  'o1',
  'o3-mini',
  'claude-3-5-sonnet',
  'claude-3-7-sonnet'
] as const;

export type ModelType = typeof AVAILABLE_MODELS[number];

export const templateApi = {
  list: async (projectName: string): Promise<Template[]> => {
    try {
      const response = await apiClient.get(`/execparamstemplate/all/${projectName}`);
      return response.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  create: async (projectName: string, template: Partial<Template>): Promise<Template> => {
    try {
      const response = await apiClient.post('/execparamstemplate', {
        project_name: projectName,
        name: template.name,
        model: template.model,
        temperature: template.temperature || 0.5,
        timeout: template.timeout || 600,
        max_tokens: template.max_tokens || null,
        max_completion_tokens: template.max_completion_tokens || null,
        max_output_tokens: template.max_output_tokens || null,
        top_p: template.top_p || null,
        system_prompt: template.system_prompt || null,
        response_format: template.response_format || {}
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (identifier: string, template: Partial<Template>): Promise<Template> => {
    try {
      const response = await apiClient.put(`/execparamstemplate/${identifier}`, template);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (identifier: string): Promise<void> => {
    try {
      await apiClient.delete(`/execparamstemplate/${identifier}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};