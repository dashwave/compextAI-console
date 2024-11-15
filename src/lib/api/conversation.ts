import { apiClient, handleApiError } from '../api-client';

export interface Thread {
  identifier: string;
  title: string;
  metadata: Record<string, string> | null;
}

export interface ListThreadsParams {
  page: number;
  limit: number;
  search?: string;
  filters?: Record<string, string>;
}

export interface ThreadsResponse {
  threads: Thread[];
  total: number;
}

export const threadApi = {
  list: async (projectName: string, params: ListThreadsParams): Promise<ThreadsResponse> => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        ...(params.search ? { search: params.search } : {}),
        ...(params.filters ? { filters: JSON.stringify(params.filters) } : {})
      });

      const response = await apiClient.get(`/thread/all/${projectName}?${queryParams}`);
      return response.data;
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
  },

  getMessagesWithExecution: async (threadId: string): Promise<Message[]> => {
    try {
      const response = await apiClient.get(`/message/thread/${threadId}?include_execution=true`);
      return response.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }
};
