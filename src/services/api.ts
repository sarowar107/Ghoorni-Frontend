import axios from 'axios';
import { config } from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Ensure headers object exists
      config.headers = config.headers || {};
      
      // Set Authorization header with proper format
      config.headers.Authorization = `Bearer ${token}`;
      
      // Prevent caching for auth-related requests
      if (config.url?.includes('/auth/')) {
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        config.headers['Pragma'] = 'no-cache';
      }
      
      console.log('Request headers set with token');
    } else {
      console.log('No auth token available for request');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors (401, 403, etc.)
    if (error.response && error.response.status === 401) {
      // Just remove the token but don't redirect - let the React Router handle this
      // This prevents redirect loops
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;
