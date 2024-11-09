import { apiClient } from '../api-client';
import { AxiosError } from 'axios';

export interface Project {
  id: number;
  identifier: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_id: number;
  name: string;
  description: string;
}

export const projectApi = {
  list: async (): Promise<Project[]> => {
    try {
      const response = await apiClient.get('/project');
      return response.data || [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Failed to fetch projects',
          status: error.response?.status || 500
        };
      }
      throw {
        message: 'An unexpected error occurred',
        status: 500
      };
    }
  },

  create: async (name: string, description: string): Promise<Project> => {
    try {
      const response = await apiClient.post('/project', { name, description });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Failed to create project',
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