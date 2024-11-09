import { apiClient } from '../api-client';
import { AxiosError } from 'axios';

export interface Thread {
  identifier: string;
  title: string;
  metadata: Record<string, string>;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export const threadApi = {
  list: async (projectName: string): Promise<Thread[]> => {
    try {
      const response = await apiClient.get(`/thread/all/${projectName}`);
      return response.data || [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Failed to fetch threads',
          status: error.response?.status || 500
        };
      }
      throw {
        message: 'An unexpected error occurred',
        status: 500
      };
    }
  },

  getMessages: async (threadId: string): Promise<Message[]> => {
    try {
      const response = await apiClient.get(`/message/thread/${threadId}`);
      return response.data || [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Failed to fetch messages',
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