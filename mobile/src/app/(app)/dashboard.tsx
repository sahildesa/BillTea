import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassPanelElevated } from '../../components/ui/GlassPanelElevated';
import { TrendChart } from '../../components/ui/TrendChart';
import { AppHeader } from '../../components/ui/AppHeader';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Receipt, TrendingUp, FileText, CircleAlert, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<'Summary' | 'Trends'>('Summary');
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Decorative Background Effects */}
      <View style={styles.bgEffectsWrapper} pointerEvents="none">
        <View style={[styles.bgEffectTop, { backgroundColor: colors.primary + '1A' }]} />
        <View style={[styles.bgEffectBottom, { backgroundColor: colors.tertiary + '1A' }]} />
      </View>

      {/* Header */}
      <AppHeader title="Dashboard" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Controls */}
        <SegmentedControl
          options={['Summary', 'Trends']}
          activeOption={activeTab}
          onOptionChange={(opt) => setActiveTab(opt as typeof activeTab)}
        />

        {/* Core Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Invoice Card */}
          <GlassPanel style={[styles.metricCard, { borderColor: colors.primary + '33', shadowColor: colors.primary }]}>
            <LinearGradient
              colors={[colors.primary + '0D', 'transparent']}
              style={[StyleSheet.absoluteFill, { opacity: 0.3, margin: -20 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.metricCardTop}>
              <Receipt color={colors.primary} size={20} />
              <View style={[styles.trendBadge, { backgroundColor: '#4ade801a' }]}>
                <TrendingUp color="#4ade80" size={12} />
                <Text style={styles.trendBadgeText}>+12%</Text>
              </View>
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>TOTAL INVOICES</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>1,245</Text>
            <Text style={[styles.metricSubtext, { color: colors.textSecondary }]}>$452.8K Revenue</Text>
          </GlassPanel>

          {/* Quotation Card */}
          <GlassPanel style={[styles.metricCard, { borderColor: colors.tertiary + '33', shadowColor: colors.tertiary }]}>
            <LinearGradient
              colors={[colors.tertiary + '0D', 'transparent']}
              style={[StyleSheet.absoluteFill, { opacity: 0.3, margin: -20 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.metricCardTop}>
              <FileText color={colors.tertiary} size={20} />
              <View style={[styles.trendBadge, { backgroundColor: '#4ade801a' }]}>
                <TrendingUp color="#4ade80" size={12} />
                <Text style={styles.trendBadgeText}>+5%</Text>
              </View>
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>TOTAL QUOTATIONS</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>842</Text>
            <Text style={[styles.metricSubtext, { color: colors.textSecondary }]}>$217K Projected</Text>
          </GlassPanel>
        </View>

        {/* Sales Trends Card */}
        <GlassPanelElevated style={styles.trendsCard}>
          <View style={styles.trendsHeader}>
            <View>
              <Text style={[styles.trendsTitle, { color: colors.text }]}>Sales Trends</Text>
              <Text style={[styles.trendsSubtitle, { color: colors.textSecondary }]}>Invoice vs Quotation Value</Text>
            </View>
            <View style={styles.trendsLegend}>
              <View style={[styles.legendBadgePrimary, { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '1A' }]}>
                <View style={[styles.legendDotPrimary, { backgroundColor: colors.primary, shadowColor: colors.primary }]} />
                <Text style={[styles.legendLabel, { color: colors.text }]}>INVOICES</Text>
                <Text style={[styles.legendValuePrimary, { color: colors.primary }]}>$235K</Text>
              </View>
              <View style={[styles.legendBadgeTertiary, { backgroundColor: colors.tertiary + '0D', borderColor: colors.tertiary + '1A' }]}>
                <View style={[styles.legendDotTertiary, { backgroundColor: colors.tertiary, shadowColor: colors.tertiary }]} />
                <Text style={[styles.legendLabel, { color: colors.text }]}>QUOTATIONS</Text>
                <Text style={[styles.legendValueTertiary, { color: colors.tertiary }]}>$217K</Text>
              </View>
            </View>
          </View>
          
          <TrendChart />
          
          <View style={styles.chartXAxis}>
            <Text style={[styles.chartXLabel, { color: colors.textSecondary }]}>W1</Text>
            <Text style={[styles.chartXLabel, { color: colors.textSecondary }]}>W2</Text>
            <Text style={[styles.chartXLabel, { color: colors.textSecondary }]}>W3</Text>
            <Text style={[styles.chartXLabel, { color: colors.textSecondary }]}>W4</Text>
          </View>
        </GlassPanelElevated>

        {/* Reminders Section */}
        <GlassPanel style={styles.remindersCard}>
          <Text style={[styles.remindersTitle, { color: colors.text }]}>Reminders</Text>
          <View style={styles.remindersList}>
            
            <View style={[styles.reminderItem, { backgroundColor: isDark ? 'rgba(20, 28, 46, 0.3)' : 'rgba(255, 255, 255, 0.5)', borderColor: colors.border }]}>
              <View style={[styles.reminderIconWrapperError, { backgroundColor: colors.error + '1A' }]}>
                <CircleAlert color={colors.error} size={20} />
              </View>
              <View style={styles.reminderContent}>
                <Text style={[styles.reminderTitleText, { color: colors.text }]}>Follow up with TechCorp</Text>
                <Text style={[styles.reminderSubtitleText, { color: colors.textSecondary }]}>Overdue Invoice #1042</Text>
              </View>
              <Text style={[styles.reminderPriority, { color: colors.error }]}>High</Text>
            </View>

            <View style={[styles.reminderItem, { backgroundColor: isDark ? 'rgba(20, 28, 46, 0.3)' : 'rgba(255, 255, 255, 0.5)', borderColor: colors.border }]}>
              <View style={[styles.reminderIconWrapperPrimary, { backgroundColor: colors.primary + '1A' }]}>
                <Calendar color={colors.primary} size={20} />
              </View>
              <View style={styles.reminderContent}>
                <Text style={[styles.reminderTitleText, { color: colors.text }]}>Client Meeting</Text>
                <Text style={[styles.reminderSubtitleText, { color: colors.textSecondary }]}>Omega Systems - Tomorrow 2PM</Text>
              </View>
            </View>

          </View>
        </GlassPanel>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgEffectsWrapper: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  bgEffectTop: {
    position: 'absolute',
    top: -100,
    left: width * 0.1,
    width: 300,
    height: 300,
    borderRadius: 150,
    transform: [{ scale: 2 }],
  },
  bgEffectBottom: {
    position: 'absolute',
    bottom: -100,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    transform: [{ scale: 1.5 }],
  },

  scrollContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: (width - 48) / 2, // 2 columns minus padding
  },
  metricCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4ade80',
    marginLeft: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    opacity: 0.8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  metricSubtext: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 8,
  },
  trendsCard: {
    marginBottom: 16,
  },
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  trendsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  trendsSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
    marginTop: 4,
  },
  trendsLegend: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  legendBadgePrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  legendBadgeTertiary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  legendDotPrimary: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  legendDotTertiary: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginRight: 6,
  },
  legendValuePrimary: {
    fontSize: 10,
    fontWeight: '500',
  },
  legendValueTertiary: {
    fontSize: 10,
    fontWeight: '500',
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartXLabel: {
    fontSize: 12,
  },
  remindersCard: {
    marginBottom: 20,
  },
  remindersTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  remindersList: {
    gap: 12,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  reminderIconWrapperError: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reminderIconWrapperPrimary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reminderSubtitleText: {
    fontSize: 12,
    marginTop: 2,
  },
  reminderPriority: {
    fontSize: 12,
    fontWeight: '500',
  },
});
