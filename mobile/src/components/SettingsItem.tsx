import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface SettingsItemProps {
  label: string;
  subLabel: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  borderColor: string;
  onPress: () => void;
}

export default function SettingsItem({
  label,
  subLabel,
  iconName,
  iconColor,
  borderColor,
  onPress,
}: SettingsItemProps) {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
      <Animated.View style={[
        styles.container, 
        { 
          transform: [{ scale: scaleAnim }],
          backgroundColor: colors.glassBackground,
          borderColor: colors.glassBorder,
          shadowColor: colors.shadow
        }
      ]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.pressable,
            pressed && { backgroundColor: colors.surfaceVariant }
          ]}
        >
          {/* Glassmorphism Blur background */}
          {Platform.OS === 'ios' ? (
            <BlurView intensity={isDark ? 24 : 40} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} pointerEvents="none" />
          ) : (
            <View style={StyleSheet.absoluteFill} pointerEvents="none" />
          )}
        
        <View style={[styles.cardContent, { borderColor }]}>
          <View style={styles.leftSection}>
            {/* Left Icon Container */}
            <View style={[styles.iconContainer, { borderColor, backgroundColor: colors.surface }]}>
              <MaterialIcons name={iconName} size={22} color={iconColor} />
            </View>
            
            {/* Labels */}
            <View style={styles.textContainer}>
              <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
              <Text style={[styles.subLabel, { color: colors.textSecondary }]}>{subLabel}</Text>
            </View>
          </View>
          
          {/* Right Chevron */}
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={colors.textSecondary}
            style={styles.chevron}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    // Shadow for elevation effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  pressable: {
    width: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    width: '100%',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '400',
  },
  chevron: {
    opacity: 0.6,
  },
});
