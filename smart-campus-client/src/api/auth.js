import { apiClient } from './client';

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  getRoles: async () => {
    try {
      const response = await apiClient.get('/users/roles');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch roles' };
    }
  },
};

export default authAPI;
