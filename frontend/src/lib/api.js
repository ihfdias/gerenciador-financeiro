import axios from 'axios';
import { getCsrfToken, setCsrfToken } from './csrf';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase();

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCsrfToken();

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
});

api.interceptors.response.use((response) => {
  if (response?.data?.csrfToken) {
    setCsrfToken(response.data.csrfToken);
  }

  return response;
});

export default api;
