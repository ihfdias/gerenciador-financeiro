import axios from 'axios';
import { clearCsrfToken, getCsrfToken, setCsrfToken } from './csrf';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// --- Request interceptor: attach CSRF token to mutating requests ---
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

// --- Response interceptor: keep CSRF token in sync + silent token refresh ---

let isRefreshing = false;
let refreshQueue = []; // { resolve, reject }[]

function drainQueue(error = null) {
  refreshQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => {
    if (response?.data?.csrfToken) {
      setCsrfToken(response.data.csrfToken);
    }
    return response;
  },
  async (error) => {
    const original = error.config;

    const isExpiredSession =
      error.response?.status === 401 &&
      !original._retried &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login');

    if (!isExpiredSession) {
      return Promise.reject(error);
    }

    // Queue concurrent requests while a refresh is already in-flight
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(() => api(original));
    }

    original._retried = true;
    isRefreshing = true;

    try {
      // The response interceptor (success branch) will call setCsrfToken automatically,
      // so the retried request's CSRF header will carry the new token.
      await api.post('/api/auth/refresh');
      drainQueue();
      return api(original);
    } catch {
      drainQueue(error);
      clearCsrfToken();
      // Signal AuthContext to clear user state; PrivateWrapper redirects via React Router
      // (avoids full page reload which would restart this same cycle)
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
