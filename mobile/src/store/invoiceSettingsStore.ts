import { create } from 'zustand';
import { getStorageItemAsync, setStorageItemAsync } from '../utils/storage';

export interface InvoiceSettings {
  prefix: string;
  startingNumber: number;
  showHsnCode: boolean;
  showSku: boolean;
  showPaymentMethod: boolean;
  displayPersonalName: boolean;
  topMessage: string;
  bottomMessage: string;
  termsAndConditions: string;
}

interface InvoiceSettingsState {
  settings: InvoiceSettings;
  isInitialized: boolean;
  updateSettings: (settings: Partial<InvoiceSettings>) => Promise<void>;
  initSettings: () => Promise<void>;
}

const SETTINGS_STORAGE_KEY = 'invoice_settings';

const defaultSettings: InvoiceSettings = {
  prefix: 'INV',
  startingNumber: 1,
  showHsnCode: true,
  showSku: false,
  showPaymentMethod: true,
  displayPersonalName: false,
  topMessage: '',
  bottomMessage: '',
  termsAndConditions: '',
};

export const useInvoiceSettingsStore = create<InvoiceSettingsState>((set) => ({
  settings: defaultSettings,
  isInitialized: false,

  updateSettings: async (newSettings: Partial<InvoiceSettings>) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      // Save asynchronously to storage
      setStorageItemAsync(SETTINGS_STORAGE_KEY, JSON.stringify(updated)).catch((error) => {
        console.error('Failed to save invoice settings to storage:', error);
      });
      return { settings: updated };
    });
  },

  initSettings: async () => {
    try {
      const stored = await getStorageItemAsync(SETTINGS_STORAGE_KEY);
      if (stored) {
        set({ settings: { ...defaultSettings, ...JSON.parse(stored) }, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      console.error('Failed to load invoice settings from storage:', error);
      set({ isInitialized: true });
    }
  },
}));
