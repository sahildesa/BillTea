import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Phone, Eye, Edit2, Trash2, Plus } from 'lucide-react-native';
import { useTheme } from '../../../hooks/useTheme';
import { GlassPanel } from '../../../components/ui/GlassPanel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/ui/AppHeader';

export default function BranchSettingsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const branches = [
    {
      id: '1',
      name: 'Main Headquarters',
      isMain: true,
      city: 'New York',
      phone: '+1 234 567 8900',
      staff: 28,
      customers: '1,092',
      isActive: true,
    },
    {
      id: '2',
      name: 'North Sector Office',
      isMain: false,
      city: 'Chicago',
      phone: '+1 312 555 0198',
      staff: 12,
      customers: '450',
      isActive: true,
    },
    {
      id: '3',
      name: 'West Coast Hub',
      isMain: false,
      city: 'Seattle',
      phone: '+1 206 555 0142',
      staff: 0,
      customers: '0',
      isActive: false,
    }
  ];

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

      {/* Header */}
      <AppHeader title="Branch Management" />

      {/* Content */}
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: 24, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.actionBar}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{branches.length} Branches configured</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your business locations</Text>
          </View>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '4D' }]}>
            <Plus color={colors.primary} size={20} />
            <Text style={[styles.addButtonText, { color: colors.primary }]}>Add Branch</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.branchList}>
          {branches.map((branch) => (
            <GlassPanel key={branch.id} style={[styles.branchCard, !branch.isActive && styles.inactiveCard]}>
              {branch.isMain && (
                <LinearGradient 
                  colors={[colors.primary, colors.tertiary]} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 0 }} 
                  style={styles.mainHighlight} 
                />
              )}
              
              <View style={styles.cardHeader}>
                <View style={styles.nameRow}>
                  <Text style={[styles.branchName, { color: branch.isActive ? colors.text : colors.textSecondary }]}>{branch.name}</Text>
                  {branch.isMain && (
                    <View style={[styles.mainBadge, { backgroundColor: colors.primary + '4D', borderColor: colors.primary + '33' }]}>
                      <Text style={[styles.mainBadgeText, { color: colors.primary }]}>MAIN</Text>
                    </View>
                  )}
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <MapPin color={colors.textSecondary} size={14} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>{branch.city}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Phone color={colors.textSecondary} size={14} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>{branch.phone}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.statsContainer, { backgroundColor: colors.surface + (isDark ? '66' : '33'), borderColor: colors.border + '4D' }]}>
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Staff</Text>
                  <Text style={[styles.statValue, { color: branch.isActive ? colors.primary : colors.textSecondary }]}>{branch.staff}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Customers</Text>
                  <Text style={[styles.statValue, { color: branch.isActive ? colors.tertiary : colors.textSecondary }]}>{branch.customers}</Text>
                </View>
              </View>

              <View style={[styles.cardFooter, { borderTopColor: colors.primary + '1A' }]}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: branch.isActive ? '#4ade80' : colors.textSecondary, shadowColor: branch.isActive ? '#4ade80' : 'transparent' }]} />
                  <Text style={[styles.statusText, { color: branch.isActive ? colors.text : colors.textSecondary }]}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  {branch.isActive && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant + '80' }]}>
                      <Eye color={colors.textSecondary} size={18} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant + '80' }]}>
                    <Edit2 color={colors.textSecondary} size={18} />
                  </TouchableOpacity>
                  {!branch.isMain && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant + '80' }]}>
                      <Trash2 color={branch.isActive ? colors.error : colors.textSecondary} size={18} />
                    </TouchableOpacity>
                  )}
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
  branchList: {
    gap: 16,
  },
  branchCard: {
    // Optional additional card styling
  },
  mainHighlight: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    height: 4,
    opacity: 0.7,
  },
  cardHeader: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  branchName: {
    fontSize: 20,
    fontWeight: '600',
  },
  mainBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  mainBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 16,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
  },
  inactiveCard: {
    opacity: 0.7,
  },
});
