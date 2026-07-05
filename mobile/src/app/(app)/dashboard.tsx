import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { GlassPanelElevated } from '../../components/ui/GlassPanelElevated';
import { TrendChart } from '../../components/ui/TrendChart';
import { Home, Moon, Receipt, TrendingUp, FileText, CircleAlert, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<'Summary' | 'Trends'>('Summary');
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Decorative Background Effects */}
      <View style={styles.bgEffectsWrapper} pointerEvents="none">
        <View style={styles.bgEffectTop} />
        <View style={styles.bgEffectBottom} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.navigate('/(app)/dashboard')}>
            <Home color="#a0b4c4" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.headerRightBtn}>
          <Moon color="#a0b4c4" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Controls */}
        <View style={styles.tabNav}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'Summary' && styles.tabBtnActive]}
            onPress={() => setActiveTab('Summary')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'Summary' ? styles.tabBtnTextActive : styles.tabBtnTextInactive]}>
              Summary
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'Trends' && styles.tabBtnActive]}
            onPress={() => setActiveTab('Trends')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'Trends' ? styles.tabBtnTextActive : styles.tabBtnTextInactive]}>
              Trends
            </Text>
          </TouchableOpacity>
        </View>

        {/* Core Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Invoice Card */}
          <GlassPanel style={[styles.metricCard, { borderColor: 'rgba(125, 211, 252, 0.2)', shadowColor: '#7dd3fc', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 30, elevation: 3 }]}>
            <LinearGradient
              colors={['rgba(125, 211, 252, 0.05)', 'transparent']}
              style={[StyleSheet.absoluteFill, { opacity: 0.3, margin: -20 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.metricCardTop}>
              <Receipt color="#7dd3fc" size={20} />
              <View style={styles.trendBadge}>
                <TrendingUp color="#4ade80" size={12} />
                <Text style={styles.trendBadgeText}>+12%</Text>
              </View>
            </View>
            <Text style={styles.metricLabel}>TOTAL INVOICES</Text>
            <Text style={styles.metricValue}>1,245</Text>
            <Text style={styles.metricSubtext}>$452.8K Revenue</Text>
          </GlassPanel>

          {/* Quotation Card */}
          <GlassPanel style={[styles.metricCard, { borderColor: 'rgba(200, 160, 240, 0.2)', shadowColor: '#c8a0f0', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 30, elevation: 3 }]}>
            <LinearGradient
              colors={['rgba(200, 160, 240, 0.05)', 'transparent']}
              style={[StyleSheet.absoluteFill, { opacity: 0.3, margin: -20 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.metricCardTop}>
              <FileText color="#c8a0f0" size={20} />
              <View style={styles.trendBadge}>
                <TrendingUp color="#4ade80" size={12} />
                <Text style={styles.trendBadgeText}>+5%</Text>
              </View>
            </View>
            <Text style={styles.metricLabel}>TOTAL QUOTATIONS</Text>
            <Text style={styles.metricValue}>842</Text>
            <Text style={styles.metricSubtext}>$217K Projected</Text>
          </GlassPanel>
        </View>

        {/* Sales Trends Card */}
        <GlassPanelElevated style={styles.trendsCard}>
          <View style={styles.trendsHeader}>
            <View>
              <Text style={styles.trendsTitle}>Sales Trends</Text>
              <Text style={styles.trendsSubtitle}>Invoice vs Quotation Value</Text>
            </View>
            <View style={styles.trendsLegend}>
              <View style={styles.legendBadgePrimary}>
                <View style={styles.legendDotPrimary} />
                <Text style={styles.legendLabel}>INVOICES</Text>
                <Text style={styles.legendValuePrimary}>$235K</Text>
              </View>
              <View style={styles.legendBadgeTertiary}>
                <View style={styles.legendDotTertiary} />
                <Text style={styles.legendLabel}>QUOTATIONS</Text>
                <Text style={styles.legendValueTertiary}>$217K</Text>
              </View>
            </View>
          </View>
          
          <TrendChart />
          
          <View style={styles.chartXAxis}>
            <Text style={styles.chartXLabel}>W1</Text>
            <Text style={styles.chartXLabel}>W2</Text>
            <Text style={styles.chartXLabel}>W3</Text>
            <Text style={styles.chartXLabel}>W4</Text>
          </View>
        </GlassPanelElevated>

        {/* Reminders Section */}
        <GlassPanel style={styles.remindersCard}>
          <Text style={styles.remindersTitle}>Reminders</Text>
          <View style={styles.remindersList}>
            
            <View style={styles.reminderItem}>
              <View style={styles.reminderIconWrapperError}>
                <CircleAlert color="#ff6b6b" size={20} />
              </View>
              <View style={styles.reminderContent}>
                <Text style={styles.reminderTitleText}>Follow up with TechCorp</Text>
                <Text style={styles.reminderSubtitleText}>Overdue Invoice #1042</Text>
              </View>
              <Text style={styles.reminderPriority}>High</Text>
            </View>

            <View style={styles.reminderItem}>
              <View style={styles.reminderIconWrapperPrimary}>
                <Calendar color="#7dd3fc" size={20} />
              </View>
              <View style={styles.reminderContent}>
                <Text style={styles.reminderTitleText}>Client Meeting</Text>
                <Text style={styles.reminderSubtitleText}>Omega Systems - Tomorrow 2PM</Text>
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
    backgroundColor: '#0a0e1a',
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
    backgroundColor: 'rgba(125, 211, 252, 0.1)',
    borderRadius: 150,
    transform: [{ scale: 2 }],
  },
  bgEffectBottom: {
    position: 'absolute',
    bottom: -100,
    right: -50,
    width: 250,
    height: 250,
    backgroundColor: 'rgba(200, 160, 240, 0.1)',
    borderRadius: 125,
    transform: [{ scale: 1.5 }],
  },
  header: {
    height: 90,
    paddingTop: 40,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 21, 36, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(125, 211, 252, 0.1)',
    zIndex: 10,
    shadowColor: '#7dd3fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e0e8f0',
    marginLeft: 12,
    letterSpacing: -0.5,
  },
  headerRightBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 100, // Space for bottom tab
  },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 28, 46, 0.5)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(42, 58, 72, 0.3)',
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#1a2438',
    borderColor: 'rgba(125, 211, 252, 0.3)',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#7dd3fc',
  },
  tabBtnTextInactive: {
    color: '#a0b4c4',
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
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
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
    color: '#a0b4c4',
    letterSpacing: 1,
    opacity: 0.8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e0e8f0',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  metricSubtext: {
    fontSize: 10,
    color: '#a0b4c4',
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
    color: '#e0e8f0',
    letterSpacing: -0.5,
  },
  trendsSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a0b4c4',
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
    backgroundColor: 'rgba(125, 211, 252, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.1)',
  },
  legendBadgeTertiary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 160, 240, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 240, 0.1)',
  },
  legendDotPrimary: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7dd3fc',
    marginRight: 6,
    shadowColor: '#7dd3fc',
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  legendDotTertiary: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c8a0f0',
    marginRight: 6,
    shadowColor: '#c8a0f0',
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#e0e8f0',
    letterSpacing: 0.5,
    marginRight: 6,
  },
  legendValuePrimary: {
    fontSize: 10,
    fontWeight: '500',
    color: '#7dd3fc',
  },
  legendValueTertiary: {
    fontSize: 10,
    fontWeight: '500',
    color: '#c8a0f0',
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartXLabel: {
    fontSize: 12,
    color: '#a0b4c4',
  },
  remindersCard: {
    marginBottom: 20,
  },
  remindersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e0e8f0',
    marginBottom: 16,
  },
  remindersList: {
    gap: 12,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 28, 46, 0.3)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(42, 58, 72, 0.3)',
  },
  reminderIconWrapperError: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reminderIconWrapperPrimary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(125, 211, 252, 0.1)',
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
    color: '#e0e8f0',
  },
  reminderSubtitleText: {
    fontSize: 12,
    color: '#a0b4c4',
    marginTop: 2,
  },
  reminderPriority: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ff6b6b',
  },
});
