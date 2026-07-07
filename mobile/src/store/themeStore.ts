import { create } from 'zustand';
import { getStorageItemAsync, setStorageItemAsync } from '../utils/storage';

export type ThemeMode = 'System' | 'Dark' | 'Light';

const THEME_STORAGE_KEY = 'app_theme_mode';

interface ThemeState {
  theme: ThemeMode;
  isInitialized: boolean;
  setTheme: (theme: ThemeMode) => Promise<void>;
  initTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'System', // Default fallback
  isInitialized: false,
  
  setTheme: async (theme: ThemeMode) => {
    try {
      await setStorageItemAsync(THEME_STORAGE_KEY, theme);
      set({ theme });
    } catch (error) {
      console.error('Failed to save theme to storage:', error);
      set({ theme }); // Update state even if storage fails
    }
  },

  initTheme: async () => {
    try {
      const storedTheme = await getStorageItemAsync(THEME_STORAGE_KEY);
      if (storedTheme === 'System' || storedTheme === 'Dark' || storedTheme === 'Light') {
        set({ theme: storedTheme as ThemeMode, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      console.error('Failed to load theme from storage:', error);
      set({ isInitialized: true });
    }
  },
}));
