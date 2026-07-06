import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { TOKEN_KEYS } from '../api/client';



// Web-safe storage wrappers
export async function setStorageItemAsync(key: string, value: string) {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function getStorageItemAsync(key: string) {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
    return null;
  }
  return await SecureStore.getItemAsync(key);
}

export async function deleteStorageItemAsync(key: string) {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

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
      await deleteStorageItemAsync(TOKEN_KEYS.ACCESS);
      await deleteStorageItemAsync(TOKEN_KEYS.REFRESH);
    } catch (e) {
      console.error('Error removing tokens', e);
    }
    set({ user: null, isAuthenticated: false });
  },
  restoreToken: async () => {
    set({ isLoading: true });
    try {
      const token = await getStorageItemAsync(TOKEN_KEYS.ACCESS);
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