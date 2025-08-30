import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ghoorni-backend-production.up.railway.app/api',
});

// Request Interceptor: Automatically add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user_id');
      // Don't redirect here to avoid infinite loops
      console.log('Authentication failed, token cleared');
    }
    return Promise.reject(error);
  }
);

export default api;