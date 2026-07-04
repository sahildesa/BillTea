import { apiClient, TOKEN_KEYS } from '../api/client';
import { storage } from './storage';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    
    if (response.data && response.data.accessToken) {
      await storage.setItemAsync(TOKEN_KEYS.ACCESS, response.data.accessToken);
      if (response.data.refreshToken) {
        await storage.setItemAsync(TOKEN_KEYS.REFRESH, response.data.refreshToken);
      }
    }
    
    return response.data;
  },
};
