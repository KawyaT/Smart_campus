import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/tickets';

const TicketAPI = {
  // Basic CRUD
  getAllTickets: () => axios.get(API_BASE_URL),
  getTicketById: (id) => axios.get(`${API_BASE_URL}/${id}`),
  createTicket: (data) => axios.post(API_BASE_URL, data),
  updateTicket: (id, data) => axios.put(`${API_BASE_URL}/${id}`, data),
  deleteTicket: (id) => axios.delete(`${API_BASE_URL}/${id}`),
  
  // Filtering & Search
  searchTickets: (keyword) => axios.get(`${API_BASE_URL}/search`, { params: { keyword } }),
  getTicketsByStatus: (status) => axios.get(`${API_BASE_URL}/status/${status}`),
  getTicketsByPriority: (priority) => axios.get(`${API_BASE_URL}/priority/${priority}`),
  getTicketsByCategory: (category) => axios.get(`${API_BASE_URL}/category/${category}`),
  getTicketsByDepartment: (department) => axios.get(`${API_BASE_URL}/department/${department}`),
  getTicketsByAssignee: (assigneeId) => axios.get(`${API_BASE_URL}/assignee/${assigneeId}`),
  
  // Special queries
  getOpenTickets: () => axios.get(`${API_BASE_URL}/open/list`),
  getOverdueTickets: () => axios.get(`${API_BASE_URL}/overdue`),
  
  // Analytics
  getDashboardStats: () => axios.get(`${API_BASE_URL}/dashboard/stats`),
  getAnalytics: () => axios.get(`${API_BASE_URL}/analytics`),
  
  // Comments
  addComment: (ticketId, data) => axios.post(`${API_BASE_URL}/${ticketId}/comments`, data),
  getTicketComments: (ticketId) => axios.get(`${API_BASE_URL}/${ticketId}/comments`),
};

export default TicketAPI;
