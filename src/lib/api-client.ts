import axios, { AxiosInstance, AxiosError } from 'axios';

const BASE_URL = 'https://compext-ai.dashwave.io/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update auth token when it changes
export const updateAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Initialize auth token from localStorage
const storedToken = localStorage.getItem('api_token');
if (storedToken) {
  updateAuthToken(storedToken);
}

export interface ApiError {
  message: string;
  status: number;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    // Handle JSON error responses
    if (error.response?.data?.error) {
      return {
        message: error.response.data.error,
        status: error.response.status
      };
    }
    
    // Handle string error messages
    if (error.response?.data?.message) {
      return {
        message: error.response.data.message,
        status: error.response.status
      };
    }

    // Default error message based on status code
    const statusMessage = {
      400: 'Bad request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not found',
      500: 'Internal server error',
    }[error.response?.status] || 'An unexpected error occurred';

    return {
      message: statusMessage,
      status: error.response?.status || 500
    };
  }

  // Handle non-Axios errors
  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    status: 500
  };
}

export * from './api/project';
export * from './api/template';
export * from './api/conversation';
export * from './api/prompt-config';

export default apiClient;