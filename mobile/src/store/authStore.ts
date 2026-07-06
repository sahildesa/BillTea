import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEYS } from '../api/client';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
    } catch (e) {
      console.error('Error removing tokens', e);
    }
    set({ user: null, isAuthenticated: false });
  },
  restoreToken: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
      if (token) {
        // Here we could ideally decode the token or call /auth/me to get the user
        // For now, if there's a token, we assume authenticated.
        set({ isAuthenticated: true });
      } else {
        set({ isAuthenticated: false });
      }
    } catch (error) {
      console.error('Failed to restore token', error);
      set({ isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  }
}));