import * as SecureStore from 'expo-secure-store';

export const storage = {
  getItemAsync: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error('Error reading secure item', e);
      return null;
    }
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error('Error writing secure item', e);
    }
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error('Error deleting secure item', e);
    }
  },
};
