// API configuration
export const API_URL = 'http://localhost:8080/api';

// VAPID public key for push notifications
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI8YlOu_7VsgdQUBUKqFZEdgfLGOFkxzcoNvFIMa1nSndDbRAhYAo9xDkw';

// Environment configuration
export const config = {
  apiUrl: API_URL,
  vapidPublicKey: VAPID_PUBLIC_KEY,
};

export default config;
