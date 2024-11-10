import { apiClient, handleApiError } from '../api-client';
import { Template } from './template';

export interface PromptConfig extends Template {
  name: string;
  environment: string;
  template_id: string;
}

export const promptConfigApi = {
  list: async (projectName: string): Promise<PromptConfig[]> => {
    try {
      const response = await apiClient.get(`/execparams/fetchall/${projectName}`);
      return response.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getTemplate: async (templateId: string): Promise<Template> => {
    try {
      const response = await apiClient.get(`/execparamstemplate/${templateId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  create: async (projectName: string, name: string, environment: string, templateId: string): Promise<PromptConfig> => {
    try {
      const response = await apiClient.post('/execparams/create', {
        project_name: projectName,
        name,
        environment,
        template_id: templateId
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (projectName: string, name: string, environment: string, templateId: string): Promise<PromptConfig> => {
    try {
      const response = await apiClient.put('/execparams/update', {
        project_name: projectName,
        name,
        environment,
        template_id: templateId
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (projectName: string, name: string, environment: string): Promise<void> => {
    try {
      await apiClient.delete('/execparams/delete', {
        data: {
          project_name: projectName,
          name,
          environment
        }
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }
};