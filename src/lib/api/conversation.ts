import { apiClient, handleApiError } from '../api-client';

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
      throw handleApiError(error);
    }
  },

  getMessages: async (threadId: string): Promise<Message[]> => {
    try {
      const response = await apiClient.get(`/message/thread/${threadId}`);
      return response.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }
};