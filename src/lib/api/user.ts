import { apiClient, handleApiError } from '../api-client';

export interface ApiKeys {
  anthropic_key?: string;
  openai_key?: string;
}

export const userApi = {
  getApiKeys: async (): Promise<ApiKeys> => {
    try {
      const response = await apiClient.get('/user/api_keys');
      return response.data || {};
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateApiKeys: async (keys: ApiKeys): Promise<ApiKeys> => {
    try {
      const response = await apiClient.put('/user/api_keys', keys);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};