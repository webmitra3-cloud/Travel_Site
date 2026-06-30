import axios from 'axios';

const getProcessEnv = () => {
  try {
    return (globalThis as any).process?.env?.REACT_APP_API_URL;
  } catch {
    return null;
  }
};

const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  getProcessEnv() || 
  '/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 Unauthorized and request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh');
      
      if (refresh) {
        try {
          // Attempt token refresh without triggering request interceptor authorization headers recursively
          const { data } = await axios.post(`${API_BASE_URL}users/login/refresh/`, { refresh });
          localStorage.setItem('token', data.access);
          if (data.refresh) {
            localStorage.setItem('refresh', data.refresh);
          }
          
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear auth storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refresh');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
