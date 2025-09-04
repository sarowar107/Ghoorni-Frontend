// API configuration - Use environment variables with fallbacks
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://your-production-backend.railway.app/api' 
    : 'http://localhost:8080/api');

// VAPID public key for push notifications
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI8YlOu_7VsgdQUBUKqFZEdgfLGOFkxzcoNvFIMa1nSndDbRAhYAo9xDkw';

// Environment configuration
export const config = {
  apiUrl: API_URL,
  vapidPublicKey: VAPID_PUBLIC_KEY,
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Debug logging in development
if (config.isDevelopment) {
  console.log('🔧 Development Config:', {
    apiUrl: config.apiUrl,
    environment: config.environment,
    vapidKey: config.vapidPublicKey ? '✅ Set' : '❌ Missing',
  });
}

export default config;
