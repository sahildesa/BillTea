import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENV } from '../config/env';

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

console.log('API_URL is:', ENV.API_URL);

// Keys for secure store
export const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
};

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from SecureStore', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh token
        const res = await axios.post(`${ENV.API_URL}/auth/refresh`, {
          refreshToken,
        });

        if (res.data?.accessToken) {
          await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, res.data.accessToken);
          if (res.data.refreshToken) {
            await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, res.data.refreshToken);
          }

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, we should logout the user (clear tokens)
        await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
        await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
        
        // You might want to trigger a global event here so the UI can redirect to login
        console.error('Refresh token expired or invalid', refreshError);
      }
    }

    return Promise.reject(error);
  }
);
