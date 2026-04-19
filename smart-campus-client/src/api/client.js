import axios from 'axios';

/**
 * OAuth / Google redirect must hit the real backend (not under Vite).
 * API calls in dev use same-origin `/api` so Vite proxies to 8081 (fixes ERR_NETWORK / CORS).
 */
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? 'http://localhost:8081';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '/api' : `${API_ORIGIN}/api`);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
