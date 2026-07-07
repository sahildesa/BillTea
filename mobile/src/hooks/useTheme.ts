import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors, ThemeColors } from '../constants/colors';

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const systemColorScheme = useColorScheme();
  const themeMode = useThemeStore((state) => state.theme);

  const isDark = 
    themeMode === 'Dark' || 
    (themeMode === 'System' && systemColorScheme === 'dark');

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
}
