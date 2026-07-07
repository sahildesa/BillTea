import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { AppHeader } from '../../components/ui/AppHeader';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { useTheme } from '../../hooks/useTheme';
import {
  Menu,
  SlidersHorizontal,
  Eye,
  Pencil,
  Copy,
  MessageCircle,
  Download,
  Send,
  Trash2,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------

type QuotationStatus = 'Sent' | 'Draft' | 'Approved' | 'Rejected';

interface Quotation {
  id: string;
  date: string;
  company: string;
  contact: string | null;
  amount: number;
  status: QuotationStatus;
}

const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: 'QUO-2024-089',
    date: 'Today, 10:24 AM',
    company: 'Acme Corp Ltd.',
    contact: 'John Smith',
    amount: 24500.0,
    status: 'Sent',
  },
  {
    id: 'QUO-2024-088',
    date: 'Yesterday',
    company: 'Globex Industries',
    contact: 'Sarah Connor',
    amount: 8250.5,
    status: 'Draft',
  },
  {
    id: 'QUO-2024-087',
    date: 'Oct 12, 2024',
    company: 'Initech Solutions',
    contact: 'Bill Lumbergh',
    amount: 145000.0,
    status: 'Approved',
  },
  {
    id: 'QUO-2024-086',
    date: 'Oct 10, 2024',
    company: 'Stark Industries',
    contact: null,
    amount: 999999.0,
    status: 'Rejected',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<QuotationStatus, string> = {
  Sent: '#34d399',
  Draft: '#fbbf24',
  Approved: '#60a5fa',
  Rejected: '#ff6b6b',
};

function formatCurrency(value: number): string {
  return (
    '$' +
    value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type TabName = 'Quotations' | 'Invoices' | 'Expenses';

function StatusBadge({ status }: { status: QuotationStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <View
      style={[
        statusBadgeStyles.pill,
        { backgroundColor: color + '1A' }, // ~10% opacity tint
      ]}
    >
      <View style={[statusBadgeStyles.dot, { backgroundColor: color }]} />
      <Text style={[statusBadgeStyles.label, { color }]}>{status}</Text>
    </View>
  );
}

const statusBadgeStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});

function ActionRow() {
  const iconSize = 18;
  const mutedColor = '#a0b4c4';

  return (
    <View style={actionRowStyles.container}>
      <View style={actionRowStyles.group}>
        <Pressable style={actionRowStyles.btn} android_ripple={{ color: 'rgba(125,211,252,0.1)', borderless: true }}>
          <Eye color={mutedColor} size={iconSize} />
        </Pressable>
        <Pressable style={actionRowStyles.btn} android_ripple={{ color: 'rgba(125,211,252,0.1)', borderless: true }}>
          <Pencil color={mutedColor} size={iconSize} />
        </Pressable>
        <Pressable style={actionRowStyles.btn} android_ripple={{ color: 'rgba(125,211,252,0.1)', borderless: true }}>
          <Copy color={mutedColor} size={iconSize} />
        </Pressable>
      </View>

      <View style={actionRowStyles.group}>
        <Pressable style={actionRowStyles.btn} android_ripple={{ color: 'rgba(125,211,252,0.1)', borderless: true }}>
          <MessageCircle color={mutedColor} size={iconSize} />
        </Pressable>
        <Pressable style={actionRowStyles.btn} android_ripple={{ color: 'rgba(125,211,252,0.1)', borderless: true }}>
          <Download color={mutedColor} size={iconSize} />
        </Pressable>
        <Pressable style={actionRowStyles.btn} android_ripple={{ color: 'rgba(125,211,252,0.1)', borderless: true }}>
          <Send color={mutedColor} size={iconSize} />
        </Pressable>
        <Pressable
          style={actionRowStyles.btn}
          android_ripple={{ color: 'rgba(255,107,107,0.15)', borderless: true }}
        >
          <Trash2 color="#ff6b6b" size={iconSize} />
        </Pressable>
      </View>
    </View>
  );
}

const actionRowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btn: {
    padding: 8,
    borderRadius: 8,
  },
});

// ---------------------------------------------------------------------------
// QuotationCard
// ---------------------------------------------------------------------------

function QuotationCard({ item }: { item: Quotation }) {
  const isArchived = item.contact === null;
  const { colors } = useTheme();

  return (
    <GlassPanel
      style={[
        cardStyles.wrapper,
        isArchived && { opacity: 0.55 },
      ]}
    >
      {/* Row 1: ID / date + amount / status */}
      <View style={cardStyles.topRow}>
        <View style={cardStyles.topLeft}>
          <View style={[cardStyles.idPill, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[cardStyles.idText, { color: colors.textSecondary }]}>#{item.id}</Text>
          </View>
          <Text style={[cardStyles.dateText, { color: colors.textSecondary }]}>{item.date}</Text>
        </View>

        <View style={cardStyles.topRight}>
          <Text style={[cardStyles.amountText, { color: colors.text }]}>
            {formatCurrency(item.amount)}
          </Text>
          <StatusBadge status={item.status} />
        </View>
      </View>

      {/* Row 2: Company + contact */}
      <View style={cardStyles.clientRow}>
        <Text style={[cardStyles.companyText, { color: colors.text }]}>{item.company}</Text>
        {item.contact ? (
          <Text style={[cardStyles.contactText, { color: colors.textSecondary }]}>{item.contact}</Text>
        ) : null}
      </View>

      {/* Divider + action row (only for non-archived items) */}
      {!isArchived && (
        <>
          <View style={cardStyles.divider} />
          <ActionRow />
        </>
      )}
    </GlassPanel>
  );
}

const cardStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  topLeft: {
    flex: 1,
    marginRight: 12,
  },
  idPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(125, 211, 252, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  idText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7dd3fc',
  },
  dateText: {
    fontSize: 12,
    color: '#a0b4c4',
    fontWeight: '400',
  },
  topRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e0e8f0',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  clientRow: {
    marginBottom: 4,
  },
  companyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e0e8f0',
  },
  contactText: {
    fontSize: 13,
    color: '#a0b4c4',
    fontWeight: '400',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 12,
  },
});

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function QuotationsScreen() {
  const [activeTab, setActiveTab] = useState<TabName>('Quotations');
  const { colors } = useTheme();

  const renderItem = ({ item }: { item: Quotation }) => (
    <QuotationCard item={item} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Ambient background glow blobs */}
      <View style={styles.bgEffectsWrapper} pointerEvents="none">
        <View style={[styles.bgEffectTop, { backgroundColor: colors.primary + '1A' }]} />
        <View style={[styles.bgEffectBottom, { backgroundColor: colors.tertiary + '1A' }]} />
      </View>

      <AppHeader
        title="Quotations"
        onSearchPress={() => console.log('Search pressed')}
        onFilterPress={() => console.log('Filter pressed')}
      />

      {/* Scrollable body */}
      <FlatList
        data={activeTab === 'Quotations' ? MOCK_QUOTATIONS : []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Segmented tab control */}
            <SegmentedControl
              options={['Quotations', 'Invoices', 'Expenses']}
              activeOption={activeTab}
              onOptionChange={(opt) => setActiveTab(opt as TabName)}
            />

            {/* Stats summary row */}
            <View style={styles.statsRow}>
              <GlassPanel style={styles.statCard}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Volume</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  $1.2M
                </Text>
              </GlassPanel>
              <GlassPanel style={styles.statCard}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
                <Text style={[styles.statValue, { color: colors.tertiary }]}>
                  42
                </Text>
              </GlassPanel>
            </View>
          </>
        }
        ListEmptyComponent={
          activeTab !== 'Quotations' ? (
            <GlassPanel style={styles.comingSoonCard}>
              <Text style={[styles.comingSoonText, { color: colors.text }]}>
                {activeTab} coming soon
              </Text>
            </GlassPanel>
          ) : null
        }
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // -- Ambient background blobs (copied from dashboard.tsx) --
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

  // -- List content --
  listContent: {
    padding: 16,
    paddingBottom: 100, // room for bottom tab bar
  },

  // -- Segmented tabs (mirrors dashboard.tsx tabNav) --
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

  // -- Stats row --
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a0b4c4',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // -- Coming soon placeholder --
  comingSoonCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#a0b4c4',
  },
});