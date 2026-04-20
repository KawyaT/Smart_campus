import { apiClient } from './client';

export const notificationsAPI = {
  list: async (type) => {
    const params = type && type !== 'ALL' ? { type } : {};
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  unreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  markRead: async (id) => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  remove: async (id) => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
