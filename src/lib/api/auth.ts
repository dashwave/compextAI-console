import { apiClient, handleApiError } from '../api-client';

interface AuthResponse {
  api_token: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<string> => {
    try {
      const response = await apiClient.post<AuthResponse>('/user/login', {
        username,
        password
      });
      return response.data.api_token;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  signup: async (username: string, email: string, password: string): Promise<string> => {
    try {
      const response = await apiClient.post<AuthResponse>('/user/signup', {
        username,
        email,
        password
      });
      return response.data.api_token;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};