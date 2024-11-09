import { apiClient } from '../api-client';
import { AxiosError } from 'axios';
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
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Failed to fetch prompt configs',
          status: error.response?.status || 500
        };
      }
      throw {
        message: 'An unexpected error occurred',
        status: 500
      };
    }
  },

  getTemplate: async (templateId: string): Promise<Template> => {
    try {
      const response = await apiClient.get(`/execparamstemplate/${templateId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Failed to fetch template',
          status: error.response?.status || 500
        };
      }
      throw {
        message: 'An unexpected error occurred',
        status: 500
      };
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
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Failed to create prompt config',
          status: error.response?.status || 500
        };
      }
      throw {
        message: 'An unexpected error occurred',
        status: 500
      };
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
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Failed to update prompt config',
          status: error.response?.status || 500
        };
      }
      throw {
        message: 'An unexpected error occurred',
        status: 500
      };
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
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Failed to delete prompt config',
          status: error.response?.status || 500
        };
      }
      throw {
        message: 'An unexpected error occurred',
        status: 500
      };
    }
  }
};