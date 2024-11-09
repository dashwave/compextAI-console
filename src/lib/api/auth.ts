import { apiClient } from '../api-client';
import { AxiosError } from 'axios';

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
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Login failed',
          status: error.response?.status || 500
        };
      }
      throw {
        message: 'An unexpected error occurred',
        status: 500
      };
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
      if (error instanceof AxiosError) {
        throw {
          message: error.response?.data?.message || 'Signup failed',
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