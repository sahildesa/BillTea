import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks/useTheme';

export function GlassPanel({ children, style, ...props }: ViewProps) {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={[styles.wrapper, { borderColor: colors.glassBorder }, style]} {...props}>
      <BlurView intensity={isDark ? 40 : 60} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} pointerEvents="none" />
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
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    padding: 20,
    flex: 1,
  },
});
