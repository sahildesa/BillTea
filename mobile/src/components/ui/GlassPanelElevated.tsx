import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks/useTheme';

export function GlassPanelElevated({ children, style, ...props }: ViewProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.wrapper, { borderColor: colors.glassBorder, shadowColor: colors.primary }, style]} {...props}>
      <BlurView intensity={isDark ? 70 : 80} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View style={[styles.overlay, { backgroundColor: colors.glassBackground }]} pointerEvents="none" />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 3,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    padding: 20,
    flex: 1,
  },
});
