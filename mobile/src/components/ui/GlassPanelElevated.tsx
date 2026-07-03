import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

export function GlassPanelElevated({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.wrapper, style]} {...props}>
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
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
    borderColor: 'rgba(125, 211, 252, 0.15)',
    borderWidth: 1,
    shadowColor: '#7dd3fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 21, 36, 0.75)',
  },
  content: {
    padding: 20,
    flex: 1,
  },
});
