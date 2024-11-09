import axios, { AxiosInstance } from 'axios';

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

export * from './api/project';
export * from './api/template';
export * from './api/conversation';
export * from './api/prompt-config';

export default apiClient;