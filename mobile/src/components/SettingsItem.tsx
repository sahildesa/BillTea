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
import { COLORS } from '../constants/colors';

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
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressedState
        ]}
      >
        {/* Glassmorphism Blur background */}
        {Platform.OS === 'ios' ? (
          <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={StyleSheet.absoluteFill} />
        )}
        
        <View style={[styles.cardContent, { borderColor }]}>
          <View style={styles.leftSection}>
            {/* Left Icon Container */}
            <View style={[styles.iconContainer, { borderColor }]}>
              <MaterialIcons name={iconName} size={22} color={iconColor} />
            </View>
            
            {/* Labels */}
            <View style={styles.textContainer}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.subLabel}>{subLabel}</Text>
            </View>
          </View>
          
          {/* Right Chevron */}
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={COLORS.textSecondary}
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
    backgroundColor: 'rgba(15, 21, 36, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.1)',
    // Shadow for elevation effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  pressable: {
    width: '100%',
  },
  pressedState: {
    backgroundColor: 'rgba(26, 36, 56, 0.4)',
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
    backgroundColor: 'rgba(26, 36, 56, 0.8)',
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
    color: COLORS.text,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  subLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  chevron: {
    opacity: 0.6,
  },
});
