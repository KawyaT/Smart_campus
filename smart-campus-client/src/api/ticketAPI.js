import { apiClient } from './client';

const API_BASE_URL = '/tickets';

const TicketAPI = {
  // Basic CRUD
  getAllTickets: () => apiClient.get(API_BASE_URL),
  getTicketById: (id) => apiClient.get(`${API_BASE_URL}/${id}`),
  createTicket: (data) => apiClient.post(API_BASE_URL, data),
  updateTicket: (id, data) => apiClient.put(`${API_BASE_URL}/${id}`, data),
  deleteTicket: (id) => apiClient.delete(`${API_BASE_URL}/${id}`),
  
  // Filtering & Search
  searchTickets: (keyword) => apiClient.get(`${API_BASE_URL}/search`, { params: { keyword } }),
  getTicketsByStatus: (status) => apiClient.get(`${API_BASE_URL}/status/${status}`),
  getTicketsByPriority: (priority) => apiClient.get(`${API_BASE_URL}/priority/${priority}`),
  getTicketsByCategory: (category) => apiClient.get(`${API_BASE_URL}/category/${category}`),
  getTicketsByDepartment: (department) => apiClient.get(`${API_BASE_URL}/department/${department}`),
  getTicketsByAssignee: (assigneeId) => apiClient.get(`${API_BASE_URL}/assignee/${assigneeId}`),
  getTicketsCreatedBy: (userId) => apiClient.get(`${API_BASE_URL}/created-by/${userId}`),
  
  // Special queries
  getOpenTickets: () => apiClient.get(`${API_BASE_URL}/open/list`),
  getOverdueTickets: () => apiClient.get(`${API_BASE_URL}/overdue`),
  
  // Analytics
  getDashboardStats: () => apiClient.get(`${API_BASE_URL}/dashboard/stats`),
  getAnalytics: () => apiClient.get(`${API_BASE_URL}/analytics`),
  
  // Comments
  addComment: (ticketId, data) => apiClient.post(`${API_BASE_URL}/${ticketId}/comments`, data),
  getTicketComments: (ticketId) => apiClient.get(`${API_BASE_URL}/${ticketId}/comments`),
};

export default TicketAPI;
