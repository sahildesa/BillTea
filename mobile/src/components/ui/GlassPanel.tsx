import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

export function GlassPanel({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.wrapper, style]} {...props}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay} />
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
    borderColor: 'rgba(125, 211, 252, 0.1)',
    borderWidth: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 21, 36, 0.6)',
  },
  content: {
    padding: 20,
    flex: 1,
  },
});
