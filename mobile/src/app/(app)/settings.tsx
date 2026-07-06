import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { Home } from 'lucide-react-native';
import { router } from 'expo-router';

import { COLORS } from '../../constants/colors';
import ProfileHeader from '../../components/ProfileHeader';
import SettingsItem from '../../components/SettingsItem';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

export default function SettingsScreen() {
  const handleEditProfile = () => {
    console.log('Edit Profile Pressed');
    // Placeholder handler
    // router.push('/profile-edit');
  };

  const logoutScaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleLogoutPressIn = () => {
    Animated.spring(logoutScaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handleLogoutPressOut = () => {
    Animated.spring(logoutScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handleLogout = async () => {
    console.log('Logout Pressed');
    const { logout } = useAuthStore.getState();
    await logout();
    router.replace('/(auth)/explore'); // Navigate to login/auth screen
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Ambient Glows */}
      {/* Top Blue Glow */}
      <View style={styles.topGlowContainer} pointerEvents="none">
        <LinearGradient
          colors={['rgba(125, 211, 252, 0.12)', 'rgba(10, 14, 26, 0)']}
          style={styles.glowCircle}
        />
      </View>

      {/* Bottom Purple Glow */}
      <View style={styles.bottomGlowContainer} pointerEvents="none">
        <LinearGradient
          colors={['rgba(200, 160, 240, 0.08)', 'rgba(10, 14, 26, 0)']}
          style={styles.glowCircle}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Custom Header Bar */}
        <View style={styles.header}>
          {Platform.OS === 'ios' && (
            <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
          )}
          <View style={styles.headerContent}>
            <Pressable
              onPress={() => router.push('/dashboard')}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed
              ]}
            >
              <Home size={24} color={COLORS.textSecondary} />
            </Pressable>

            <Text style={styles.headerTitle}>BillTea</Text>

            <Pressable
              onPress={() => console.log('More options pressed')}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed
              ]}
            >
              <MaterialIcons name="more-vert" size={24} color={COLORS.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Scrollable Settings Panel */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isTablet && styles.scrollContentTablet
          ]}
        >
          {/* Profile Header */}
          <ProfileHeader
            name="Sarang Wagh"
            role="Business Administrator"
            avatarUri="https://lh3.googleusercontent.com/aida-public/AB6AXuCikZgFX6gEoglH2uQdLP1N5dN8spNucZQ_rb9lPo4yRYB6WWoo1e2d18EGDcdRpyk6rMoyi3kSH0WCvs2TRXMqJzVku5feWeHdAxhHqGZpK1ZVLRIZglACbHPBuVsWGRfoxvgFzav1frnHXFUiZX_jwyC2lsXhGDxVqlqecU4XtdOVVrXugOj6i6D0xaoAkMXIR3mpch0JEZTF_HpJyFioRw8zMBCpEflfUo0cOjDvK-RuLwAtxUsr"
            planName="Premium Plan"
            onEditPress={handleEditProfile}
          />

          {/* Preferences Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Preferences</Text>

            {/* Company Settings */}
            <SettingsItem
              label="Company Settings"
              subLabel="Profile, Tax details"
              iconName="business"
              iconColor={COLORS.primary}
              borderColor="rgba(125, 211, 252, 0.15)"
              onPress={() => router.push('/company-settings')}
            />

            {/* Theme Settings */}
            <SettingsItem
              label="Theme Settings"
              subLabel="Appearance, Dark mode"
              iconName="palette"
              iconColor={COLORS.tertiary}
              borderColor="rgba(200, 160, 240, 0.15)"
              onPress={() => router.push('/theme-settings')}
            />

            {/* Invoice Settings */}
            <SettingsItem
              label="Invoice Settings"
              subLabel="Templates, Numbering"
              iconName="description"
              iconColor={COLORS.secondary}
              borderColor="rgba(136, 180, 204, 0.15)"
              onPress={() => router.push('/invoice-settings')}
            />

            {/* Account Security */}
            <SettingsItem
              label="Account Security"
              subLabel="Password, 2FA"
              iconName="lock"
              iconColor={COLORS.error}
              borderColor="rgba(255, 107, 107, 0.15)"
              onPress={() => router.push('/account-security')}
            />

            {/* Help & Support */}
            <SettingsItem
              label="Help & Support"
              subLabel="FAQs, Contact us"
              iconName="help"
              iconColor={COLORS.textSecondary}
              borderColor="rgba(160, 180, 196, 0.15)"
              onPress={() => router.push('/help-support')}
            />

            {/* Quotation Settings */}
            <SettingsItem
              label="Quotation Settings"
              subLabel="Templates, numbering"
              iconName="request-quote"
              iconColor={COLORS.primary}
              borderColor="rgba(125, 211, 252, 0.15)"
              onPress={() => router.push('/quotation-settings')}
            />

            {/* Plan & Subscription */}
            <SettingsItem
              label="Plan & Subscription"
              subLabel="Manage your premium plan"
              iconName="card-membership"
              iconColor={COLORS.tertiary}
              borderColor="rgba(200, 160, 240, 0.15)"
              onPress={() => router.push('/plan-subscription')}
            />

            {/* WhatsApp Settings */}
            <SettingsItem
              label="WhatsApp Settings"
              subLabel="Notifications, messaging"
              iconName="chat"
              iconColor={COLORS.secondary}
              borderColor="rgba(136, 180, 204, 0.15)"
              onPress={() => router.push('/whatsapp-settings')}
            />

            {/* Branch Settings */}
            <SettingsItem
              label="Branch Settings"
              subLabel="Manage multiple locations"
              iconName="store"
              iconColor={COLORS.textSecondary}
              borderColor="rgba(160, 180, 196, 0.15)"
              onPress={() => router.push('/branch-settings')}
            />

            {/* User Management */}
            <SettingsItem
              label="User Management"
              subLabel="Team roles, permissions"
              iconName="group-add"
              iconColor={COLORS.primary}
              borderColor="rgba(125, 211, 252, 0.15)"
              onPress={() => router.push('/user-management')}
            />

            {/* Logout Button */}
            <Animated.View
              style={[
                styles.logoutWrapper,
                { transform: [{ scale: logoutScaleAnim }] },
              ]}
            >
              <Pressable
                onPress={handleLogout}
                onPressIn={handleLogoutPressIn}
                onPressOut={handleLogoutPressOut}
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed && styles.logoutButtonPressed,
                ]}
              >
                <MaterialIcons
                  name="logout"
                  size={20}
                  color={COLORS.error}
                  style={styles.logoutIcon}
                />
                <Text style={styles.logoutText}>Log Out</Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  topGlowContainer: {
    position: 'absolute',
    top: -150,
    left: '50%',
    marginLeft: -250,
    width: 500,
    height: 500,
    zIndex: 0,
  },
  bottomGlowContainer: {
    position: 'absolute',
    bottom: -150,
    right: -150,
    width: 400,
    height: 400,
    zIndex: 0,
  },
  glowCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 250,
  },
  header: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(125, 211, 252, 0.1)',
    backgroundColor: 'rgba(15, 21, 36, 0.6)',
    zIndex: 10,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPressed: {
    backgroundColor: 'rgba(125, 211, 252, 0.1)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110, // Margin to allow scrolling above custom floating tab bar
    zIndex: 1,
  },
  scrollContentTablet: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  sectionContainer: {
    marginTop: 20,
    width: '100%',
  },
  sectionHeader: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginLeft: 8,
    marginBottom: 12,
    opacity: 0.6,
  },
  logoutWrapper: {
    width: '100%',
    minHeight: 60,

    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.25)',

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: 'transparent',

    marginTop: 24,
  },
  logoutButton: {
    paddingVertical: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    alignSelf: 'center',

    backgroundColor: 'transparent',
  },
  logoutButtonPressed: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.error,
    letterSpacing: 0.5,
  },
});
