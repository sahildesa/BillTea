import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Edit2, RefreshCw, Trash2, Plus } from 'lucide-react-native';
import { useTheme } from '../../../hooks/useTheme';
import { GlassPanel } from '../../../components/ui/GlassPanel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/ui/AppHeader';

const USERS = [
  {
    id: '1',
    name: 'Robert Sterling',
    email: 'robert.s@billaro.io',
    role: 'Manager',
    location: 'Main HQ, North Sector',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDngezLLFtEpKS-aadPvNpA-X1a6IbHTsEjQuFDsDZHp0jbiukNqveV3sx5AGCnsmd0NEeev8WJ6JvjZRfiHYSypy0CO3LC3x3fhd_rtMytKfBkFpdvfmiRRO3EyrROM3_4OhElDQQnfPdDSUTBLp74VDSAKRNRPftSgsFJ8T6MK5Z1dMzWyN7aXiBWqm5wJJX_2K3pWjAmEoHVOi4uvJnYwmZBJf_09JAA9KoDOqTkQ17p0oSQnpt5',
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@billaro.io',
    role: 'Staff',
    location: 'East Sector',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSL6NjlvTKtkJT_wucJsBSg0CqS1-Sp8lOTdF4PdZLolCcLx1novp5MYfZvCnzmo1TDMlz1lbpzu0cUgNeeXZGPCrdbsGD-ows_b0WoCFOERZN8EnEXX6xH4UtpBX2BHaNU3PSf5jah62ns9JFSFgLm-PnNb284QTLfqai2lxppiO5WyGvMJIqRkmGvBneWsemLVg43VIBeCKT3OWdWqGXN0lz1Th1dzEaaYjGhq9-uWvmNIcDGvMx',
  },
  {
    id: '3',
    name: 'David Chen',
    email: 'david.c@billaro.io',
    role: 'Staff',
    location: 'Main HQ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB25qAmpwM-uIKGiFmhVhSn3XcSi0FwdlU-CHV_lyWjUOkeeL6yFnMJkjEDRu-q5NUjPZaupewA8e-TDekFaV09HhjONLoipNlz7VmQmixhXDFqvCRemP5ZvSvw8_AKgxUKFwX8iNJgq37lihhEp6qCeB2pBeEE6gsJmIfo7ZqzaGovWxaCisn3Q3KLHtHzCDOEBD5V8SecY1PZU0kDDN5pRtm-qX9mbBB0aUnLGiYY5_s0O2mTaYBj',
  },
];

export default function UserManagementScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? ['#081326', '#111b2f'] : [colors.background, colors.surface]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Global Header */}
      <AppHeader title="User Management" />

      {/* Content */}
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: 24, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.actionBar}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{USERS.length} Users configured</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage access and roles</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/settings/create-staff')}
            style={[styles.addButton, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '4D' }]}
          >
            <Plus color={colors.primary} size={20} />
            <Text style={[styles.addButtonText, { color: colors.primary }]}>Add User</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userList}>
          {USERS.map((user) => (
            <GlassPanel key={user.id} style={styles.userCard}>
              <View style={styles.cardContent}>
                
                {/* Avatar and Info */}
                <View style={styles.userInfo}>
                  <View style={[styles.avatarContainer, { borderColor: colors.primary + '33' }]}>
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                    <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                    
                    <View style={styles.roleLocationRow}>
                      <View style={[
                        styles.roleBadge, 
                        { 
                          backgroundColor: user.role === 'Manager' ? colors.primary + '1A' : colors.secondary + '1A',
                          borderColor: user.role === 'Manager' ? colors.primary + '33' : colors.secondary + '33'
                        }
                      ]}>
                        <Text style={[
                          styles.roleText,
                          { color: user.role === 'Manager' ? colors.primary : colors.secondary }
                        ]}>
                          {user.role}
                        </Text>
                      </View>
                      
                      <View style={styles.locationContainer}>
                        <MapPin color={colors.textSecondary} size={14} />
                        <Text style={[styles.locationText, { color: colors.textSecondary }]}>{user.location}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={[styles.actionButtons, { borderTopColor: colors.primary + '1A' }]}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant + '00' }]}>
                    <Edit2 color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant + '00' }]}>
                    <RefreshCw color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.error + '1A' }]}>
                    <Trash2 color={colors.error} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </GlassPanel>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: 'rgba(125, 211, 252, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  userList: {
    gap: 16,
  },
  userCard: {},
  cardContent: {
    flexDirection: 'column',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.8,
  },
  locationText: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
  },
});
