import { apiClient, handleApiError } from '../api-client';

interface ExecutionTemplate {
  model: string;
  temperature: number;
  max_tokens?: number;
  max_completion_tokens?: number;
  top_p?: number;
  max_output_tokens?: number;
  response_format?: Record<string, any>;
}

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
  thread_execution_params_template: ExecutionTemplate;
  output?: string;
}

export interface ListExecutionsParams {
  page: number;
  limit: number;
  search?: string;
  filters?: Record<string, string>;
}

export interface ExecutionsResponse {
  executions: Execution[];
  total: number;
}

export const executionApi = {
  list: async (projectName: string, params: ListExecutionsParams): Promise<ExecutionsResponse> => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        ...(params.search ? { search: params.search } : {}),
        ...(params.filters ? { filters: JSON.stringify(params.filters) } : {})
      });

      const response = await apiClient.get(`/threadexec/all/${projectName}?${queryParams}`);
      return response.data;
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
  },

  rerun: async (executionId: string, templateId: string): Promise<Execution> => {
    try {
      const response = await apiClient.post(`/threadexec/${executionId}/rerun`, {
        thread_execution_param_template_id: templateId
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};