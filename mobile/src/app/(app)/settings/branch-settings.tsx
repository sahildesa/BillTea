import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, BackHandler } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Phone, Eye, Edit2, Trash2, Plus } from 'lucide-react-native';
import { useTheme } from '../../../hooks/useTheme';
import { GlassPanel } from '../../../components/ui/GlassPanel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../../../api/client';
import { BlurView } from 'expo-blur';

// Header height for the custom translucent header, mirrors CompanySettingsScreen
const HEADER_HEIGHT = 56;

type Branch = {
  id: string;
  name: string;
  isMainBranch: boolean;
};

export default function BranchSettingsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBranches() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/branches');
        if (res.status === 200 && res.data?.success) {
          setBranches(Array.isArray(res.data.branches) ? res.data.branches : []);
        } else {
          setError('Could not load branches.');
        }
      } catch (err) {
        console.error('Failed to load branches:', err);
        setError('Could not load branches.');
      } finally {
        setLoading(false);
      }
    }
    loadBranches();
  }, []);

  // Single source of truth for "back" so the on-screen button and the
  // phone's hardware/gesture back button always land in the same place.
  const goBack = useCallback(() => {
    router.push('/settings');
  }, []);

  // Intercept the Android hardware/gesture back button while this screen
  // is focused, since it otherwise pops the native stack (which may skip
  // straight past /settings to the dashboard) instead of using our route.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        goBack();
        return true; // prevent default behavior (going to dashboard)
      });
      return () => subscription.remove();
    }, [goBack])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? ['#081326', '#111b2f'] : [colors.background, colors.surface]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Ambient Glows */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.glowCircle1}>
          <LinearGradient
            colors={[colors.primary + '14', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
        <View style={styles.glowCircle2}>
          <LinearGradient
            colors={[colors.tertiary + '14', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
      </View>

      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.glassBorder }]}>
        <BlurView intensity={70} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassBackground }]} />

        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={goBack}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.primary + '1A',
                borderColor: colors.primary + '33',
              },
            ]}
            activeOpacity={0.7}
          >
            <ArrowLeft color={colors.primary} size={18} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Branch Management</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + HEADER_HEIGHT + 24,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.actionBar}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              {loading ? 'Loading branches...' : `${branches.length} Branches configured`}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your business locations</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/settings/create-branch')}
            style={[styles.addButton, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '4D' }]}
          >
            <Plus color={colors.primary} size={20} />
            <Text style={[styles.addButtonText, { color: colors.primary }]}>Add Branch</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.error + '20', borderColor: colors.error + '40' }]}>
            <Text style={{ color: colors.error, fontSize: 13 }}>{error}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : branches.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No branches yet.</Text>
        ) : (
          <View style={styles.branchList}>
            {branches.map((branch) => (
              <GlassPanel key={branch.id} style={styles.branchCard}>
                {branch.isMainBranch && (
                  <LinearGradient
                    colors={[colors.primary, colors.tertiary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.mainHighlight}
                  />
                )}

                <View style={styles.cardHeader}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.branchName, { color: colors.text }]}>{branch.name}</Text>
                    {branch.isMainBranch && (
                      <View style={[styles.mainBadge, { backgroundColor: colors.primary + '4D', borderColor: colors.primary + '33' }]}>
                        <Text style={[styles.mainBadgeText, { color: colors.primary }]}>MAIN</Text>
                      </View>
                    )}
                  </View>
                  {/* City/phone aren't returned by the API yet, so this row is left out for now */}
                </View>

                <View style={[styles.cardFooter, { borderTopColor: colors.primary + '1A' }]}>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant + '80' }]}>
                      <Eye color={colors.textSecondary} size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant + '80' }]}>
                      <Edit2 color={colors.textSecondary} size={18} />
                    </TouchableOpacity>
                    {!branch.isMainBranch && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant + '80' }]}>
                        <Trash2 color={colors.error} size={18} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </GlassPanel>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowCircle1: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    overflow: 'hidden',
  },
  glowCircle2: {
    position: 'absolute',
    top: '40%',
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    borderBottomWidth: 1,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
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
  errorBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  loadingWrap: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 40,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
  },
});