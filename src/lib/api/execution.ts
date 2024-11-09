import { apiClient } from '../api-client';
import { AxiosError } from 'axios';

export interface Thread {
  identifier: string;
  title: string;
  metadata: Record<string, any>;
}

export interface Message {
  role: string;
  content: string;
}

export interface Execution {
  identifier: string;
  status: 'completed' | 'failed' | 'running';
  created_at: string;
  thread_id: string;
  thread: Thread;
  input: {
    messages: Message[];
  };
  output: Record<string, any>;
  content: string;
  execution_response_metadata: Record<string, any>;
  execution_request_metadata: Record<string, any>;
}

export const executionApi = {
  list: async (projectName: string): Promise<Execution[]> => {
    try {
      const response = await apiClient.get(`/threadexec/all/${projectName}`);
      return response.data || [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Failed to fetch executions',
          status: error.response?.status || 500
        };
      }
      throw {
        message: 'An unexpected error occurred',
        status: 500
      };
    }
  },

  get: async (executionId: string): Promise<Execution> => {
    try {
      const response = await apiClient.get(`/threadexec/${executionId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Failed to fetch execution',
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