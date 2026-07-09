import { apiClient } from '../api/client';
import { TOKEN_KEYS } from '../constants/keys';
import * as ExpoSecureStore from 'expo-secure-store';

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });

    if (response.data && response.data.accessToken) {
      await ExpoSecureStore.setItemAsync(TOKEN_KEYS.ACCESS, response.data.accessToken);
      if (response.data.refreshToken) {
        await ExpoSecureStore.setItemAsync(TOKEN_KEYS.REFRESH, response.data.refreshToken);
      }
    }

    return response.data;
  },
};