import { apiClient, handleApiError } from '../api-client';

export interface Execution {
  identifier: string;
  status: string;
  created_at: string;
  thread_id: string;
  thread: any;
  input_messages: Array<{
    role: string;
    content: string;
  }>;
  content: string;
  execution_response_metadata: Record<string, any>;
  execution_request_metadata: Record<string, any>;
  system_prompt?: string;
}

export const executionApi = {
  list: async (projectName: string): Promise<Execution[]> => {
    try {
      const response = await apiClient.get(`/threadexec/all/${projectName}`);
      return response.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  get: async (executionId: string): Promise<Execution> => {
    try {
      const response = await apiClient.get(`/threadexec/${executionId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};