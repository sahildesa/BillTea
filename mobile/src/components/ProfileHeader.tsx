import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS } from '../constants/colors';

interface ProfileHeaderProps {
  name: string;
  role: string;
  avatarUri: string;
  planName: string;
  onEditPress: () => void;
}

export default function ProfileHeader({
  name,
  role,
  avatarUri,
  planName,
  onEditPress,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Avatar Container with Ice-Blue Glowing Border */}
      <View style={styles.avatarWrapper}>
        <LinearGradient
          colors={['rgba(125, 211, 252, 0.5)', 'rgba(200, 160, 240, 0.25)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.avatarInnerContainer}>
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
            
            {/* Edit Button Badge */}
            <Pressable
              onPress={onEditPress}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed
              ]}
            >
              {Platform.OS === 'ios' && (
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              )}
              <MaterialIcons name="edit" size={14} color={COLORS.primary} />
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      {/* Name and Designation */}
      <Text style={styles.nameText}>{name}</Text>
      <Text style={styles.roleText}>{role}</Text>

      {/* Premium Plan Badge */}
      <View style={styles.badgeWrapper}>
        <LinearGradient
          colors={['rgba(125, 211, 252, 0.15)', 'rgba(125, 211, 252, 0.05)']}
          style={styles.badgeGradient}
        >
          <View style={styles.badgeContent}>
            <MaterialIcons name="verified" size={14} color={COLORS.primary} style={styles.verifiedIcon} />
            <Text style={styles.badgeText}>{planName}</Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    width: '100%',
  },
  avatarWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 16,
  },
  gradientBorder: {
    width: 130,
    height: 130,
    borderRadius: 65,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInnerContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 62,
    borderWidth: 2,
    borderColor: COLORS.background,
    backgroundColor: COLORS.surface,
    position: 'relative',
    overflow: 'visible', // allow edit badge to position slightly outer if needed
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  editButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 36, 56, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    overflow: 'hidden',
  },
  editButtonPressed: {
    backgroundColor: COLORS.primary,
    opacity: 0.9,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  badgeWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.25)',
  },
  badgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedIcon: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
