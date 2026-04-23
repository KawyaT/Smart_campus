import { apiClient } from './client';

export const usersAPI = {
  /** Admin only */
  getAll: async () => {
    const { data } = await apiClient.get('/users');
    return data;
  },

  /** Admin only */
  deleteUser: async (userId) => {
    await apiClient.delete(`/users/${userId}`);
  },
};
