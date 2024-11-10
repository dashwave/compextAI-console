import { apiClient, handleApiError } from '../api-client';

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
      throw handleApiError(error);
    }
  },

  create: async (name: string, description: string): Promise<Project> => {
    try {
      const response = await apiClient.post('/project', { name, description });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (projectId: string): Promise<void> => {
    try {
      await apiClient.delete(`/project/${projectId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};