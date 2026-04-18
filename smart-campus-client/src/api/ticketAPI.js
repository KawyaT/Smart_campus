import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/tickets';

const TicketAPI = {
  getAllTickets: () => axios.get(API_BASE_URL),
  getTicketById: (id) => axios.get(`${API_BASE_URL}/${id}`),
  createTicket: (data) => axios.post(API_BASE_URL, data),
  updateTicket: (id, data) => axios.put(`${API_BASE_URL}/${id}`, data),
  deleteTicket: (id) => axios.delete(`${API_BASE_URL}/${id}`),
  getTicketsByStatus: (status) => axios.get(`${API_BASE_URL}/status/${status}`),
  getTicketsByPriority: (priority) => axios.get(`${API_BASE_URL}/priority/${priority}`),
  searchTickets: (keyword) => axios.get(`${API_BASE_URL}/search`, { params: { keyword } }),
  getOpenTickets: () => axios.get(`${API_BASE_URL}/open/list`),
  getDashboardStats: () => axios.get(`${API_BASE_URL}/dashboard/stats`),
};

export default TicketAPI;
