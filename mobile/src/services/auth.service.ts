import { apiClient, TOKEN_KEYS } from '../api/client';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    
    if (response.data && response.data.accessToken) {
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, response.data.accessToken);
      if (response.data.refreshToken) {
        await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, response.data.refreshToken);
      }
    }
    
    return response.data;
  },
};
