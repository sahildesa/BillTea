export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  primary: string;
  secondary: string;
  tertiary: string;
  text: string;
  textSecondary: string;
  error: string;
  
  // Additional semantic colors to replace random hex codes in styles
  border: string;
  glassBackground: string;
  glassBorder: string;
  shadow: string;
}

export const darkColors: ThemeColors = {
  background: '#0a0e1a',
  surface: '#0f1524',
  surfaceVariant: '#1a2438',
  primary: '#7dd3fc',
  secondary: '#88b4cc',
  tertiary: '#c8a0f0',
  text: '#e0e8f0',
  textSecondary: '#a0b4c4',
  error: '#ff6b6b',
  
  border: '#2a3a48',
  glassBackground: 'rgba(15, 21, 36, 0.6)',
  glassBorder: 'rgba(125, 211, 252, 0.15)',
  shadow: '#000000',
};

export const lightColors: ThemeColors = {
  background: '#ffffff',
  surface: '#f8f9ff',
  surfaceVariant: '#e0eaff',
  primary: '#0369a1',
  secondary: '#0284c7',
  tertiary: '#4f46e5',
  text: '#0f172a',
  textSecondary: '#475569',
  error: '#ef4444',
  
  border: '#cbd5e1',
  glassBackground: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(3, 105, 161, 0.1)',
  shadow: 'rgba(0, 0, 0, 0.05)',
};

// Temporarily keep COLORS pointing to dark mode to prevent instant build failure
// while we migrate everything, but mark it deprecated.
/** @deprecated Use useTheme() hook instead */
export const COLORS = darkColors;
