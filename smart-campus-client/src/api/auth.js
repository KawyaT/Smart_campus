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

  /** Update display name, phone, and address (Bearer). */
  updateProfile: async ({ name, phone, address }) => {
    try {
      const { data } = await apiClient.patch('/auth/profile', { name, phone, address });
      return data;
    } catch (error) {
      const d = error.response?.data;
      const msg =
        (typeof d === 'object' && d && d.message) ||
        (typeof d === 'string' ? d : null) ||
        error.message ||
        'Could not update profile';
      throw { message: msg, status: error.response?.status };
    }
  },

  /** Permanently delete own account (Bearer). */
  deleteAccount: async () => {
    try {
      await apiClient.delete('/auth/account');
    } catch (error) {
      const d = error.response?.data;
      const msg =
        (typeof d === 'object' && d && d.message) ||
        (typeof d === 'string' ? d : null) ||
        error.message ||
        'Could not delete account';
      throw { message: msg, status: error.response?.status };
    }
  },

  /** Current user (requires Bearer token). Used after Google OAuth redirect. */
  getMe: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      const msg =
        (typeof data === 'object' && data && (data.message || data.error)) ||
        (typeof data === 'string' ? data : null) ||
        (status === 401 ? 'Session expired or invalid token' : null) ||
        (error.code === 'ERR_NETWORK' ? 'Cannot reach API (is the server running on port 8081?)' : null) ||
        'Failed to load profile';
      throw { message: msg, status };
    }
  },
};

export default authAPI;
