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

  markAllRead: async () => {
    await apiClient.put('/notifications/mark-all-read');
  },

  remove: async (id) => {
    await apiClient.delete(`/notifications/${id}`);
  },

  /** ADMIN: broadcast SYSTEM notice to every user (in-app only). */
  broadcastSystem: async (message) => {
    const { data } = await apiClient.post('/admin/notifications/broadcast', { message });
    return data;
  },

  /** ADMIN: history of campus-wide broadcasts (newest first). */
  listBroadcasts: async () => {
    const { data } = await apiClient.get('/admin/notifications/broadcasts');
    return Array.isArray(data) ? data : [];
  },

  /** ADMIN: remove broadcast from history and delete all user copies. */
  deleteBroadcastBatch: async (batchId) => {
    await apiClient.delete(`/admin/notifications/broadcasts/${encodeURIComponent(batchId)}`);
  },
};
