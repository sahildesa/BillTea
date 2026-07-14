import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Eye,
  PencilLine,
  Copy,
  MessageCircle,
  Download,
  Send,
  Trash2,
  MessageSquare,
  Phone,
} from "lucide-react-native";

import { AppHeader } from "../../components/ui/AppHeader";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { ActionIconButton } from "../../components/billing/ActionIconButton";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { useTheme } from "../../hooks/useTheme";
import { apiClient } from "@/api/client";

const { width } = Dimensions.get("window");

type Tab = "Quotations" | "Invoices" | "Expenses";

interface Customer {
  id: string;
  customerName: string;
  companyName: string;
  email: string;
  mobileNumber: string;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "EXPIRED";
  quotationDate: string;
  expiryDate: string;
  customer: Customer | null;
  totals: {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    grandTotal: number;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: "DRAFT" | "SENT" | "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";
  invoiceDate: string;
  dueDate: string;
  amountPaid: number;
  amountDue: number;
  customer: Customer | null;
  totals: {
    grandTotal: number;
  };
}

interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  } | null;
  paymentMethod: string;
  note: string;
  date: string;
  createdBy: {
    fullName: string;
  } | null;
}

function formatDate(dateString: string) {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatAbbreviatedCurrency(amount: number) {
  if (amount >= 1.0e6) {
    return `$${(amount / 1.0e6).toFixed(1)}M`;
  }
  if (amount >= 1.0e3) {
    return `$${(amount / 1.0e3).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

export default function QuotationsScreen() {
  const searchInputRef = useRef<TextInput>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Quotations");
  const { colors, isDark } = useTheme();

  // Record list states
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Fetching & Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedTabs, setFetchedTabs] = useState<Record<Tab, boolean>>({
    Quotations: false,
    Invoices: false,
    Expenses: false,
  });

  // Search states
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Fetch data lazily on tab switch
  useEffect(() => {
    if (fetchedTabs[activeTab]) return;

    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const endpoint = `/${activeTab.toLowerCase()}`;
        const res = await apiClient.get(endpoint);
        if (!mounted) return;

        if (res.status === 200 && (res.data?.success || Array.isArray(res.data))) {
          const tabKey = activeTab.toLowerCase();
          const list = Array.isArray(res.data)
            ? res.data
            : (Array.isArray(res.data[tabKey]) ? res.data[tabKey] : []);
          if (activeTab === "Quotations") {
            setQuotations(list);
          } else if (activeTab === "Invoices") {
            setInvoices(list);
          } else if (activeTab === "Expenses") {
            setExpenses(list);
          }
          setFetchedTabs((prev) => ({ ...prev, [activeTab]: true }));
        } else {
          setError(`Failed to load ${activeTab.toLowerCase()} list.`);
        }
      } catch (err) {
        if (mounted) {
          setError(`Failed to connect to server to load ${activeTab.toLowerCase()}.`);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [activeTab, fetchedTabs]);

  // Client-side search filters
  const filteredQuotations = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return quotations;
    return quotations.filter((q) => {
      const qNum = (q.quotationNumber ?? "").toLowerCase();
      const customerName = (q.customer?.customerName ?? "").toLowerCase();
      const companyName = (q.customer?.companyName ?? "").toLowerCase();
      return (
        qNum.includes(query) ||
        customerName.includes(query) ||
        companyName.includes(query)
      );
    });
  }, [quotations, searchText]);

  const filteredInvoices = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return invoices;
    return invoices.filter((i) => {
      const iNum = (i.invoiceNumber ?? "").toLowerCase();
      const customerName = (i.customer?.customerName ?? "").toLowerCase();
      const companyName = (i.customer?.companyName ?? "").toLowerCase();
      return (
        iNum.includes(query) ||
        customerName.includes(query) ||
        companyName.includes(query)
      );
    });
  }, [invoices, searchText]);

  const filteredExpenses = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return expenses;
    return expenses.filter((e) => {
      const categoryName = (e.category?.name ?? "").toLowerCase();
      const noteText = (e.note ?? "").toLowerCase();
      return categoryName.includes(query) || noteText.includes(query);
    });
  }, [expenses, searchText]);

  // Stats Row calculations
  const currentStats = useMemo(() => {
    if (activeTab === "Quotations") {
      const totalVolume = quotations.reduce(
        (sum, item) => sum + (item.totals?.grandTotal ?? 0),
        0
      );
      const pendingCount = quotations.filter((q) => q.status === "SENT").length;
      return [
        { label: "Total Volume", value: formatAbbreviatedCurrency(totalVolume), color: colors.primary },
        { label: "Pending Sent", value: String(pendingCount), color: colors.tertiary },
      ];
    }
    if (activeTab === "Invoices") {
      const totalVolume = invoices.reduce(
        (sum, item) => sum + (item.totals?.grandTotal ?? 0),
        0
      );
      const pendingCount = invoices.filter(
        (i) => i.status === "UNPAID" || i.status === "PARTIAL" || i.status === "OVERDUE"
      ).length;
      const totalPaid = invoices.reduce((sum, item) => sum + (item.amountPaid ?? 0), 0);
      return [
        { label: "Total Volume", value: formatAbbreviatedCurrency(totalVolume), color: colors.primary },
        { label: "Pending", value: String(pendingCount), color: colors.tertiary },
        {
          label: "Total Paid",
          value: formatAbbreviatedCurrency(totalPaid),
          color: colors.text,
        },
      ];
    }
    // Expenses
    const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    return [
      {
        label: "Total Expenses",
        value: formatAbbreviatedCurrency(totalExpenses),
        color: colors.primary,
      },
      { label: "Unpaid", value: "12", color: colors.tertiary },
      { label: "Reimbursed", value: "$62.5K", color: colors.text },
    ];
  }, [activeTab, quotations, invoices, expenses, colors]);

  // Delete Handlers
  const handleDeleteQuotation = async (id: string) => {
    Alert.alert(
      "Delete Quotation",
      "Are you sure you want to delete this quotation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await apiClient.delete(`/quotations/${id}`);
              if (res.status === 200 && res.data?.success) {
                setQuotations((current) => current.filter((q) => q.id !== id));
              } else {
                Alert.alert(
                  "Delete Failed",
                  res.data?.message || "Failed to delete quotation."
                );
              }
            } catch (err) {
              Alert.alert("Delete Failed", "Error deleting quotation.");
            }
          },
        },
      ]
    );
  };

  const handleDeleteInvoice = async (id: string) => {
    Alert.alert(
      "Delete Invoice",
      "Are you sure you want to delete this invoice?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await apiClient.delete(`/invoices/${id}`);
              if (res.status === 200 && res.data?.success) {
                setInvoices((current) => current.filter((i) => i.id !== id));
              } else {
                Alert.alert(
                  "Delete Failed",
                  res.data?.message || "Failed to delete invoice."
                );
              }
            } catch (err) {
              Alert.alert("Delete Failed", "Error deleting invoice.");
            }
          },
        },
      ]
    );
  };

  const handleDeleteExpense = async (id: string) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await apiClient.delete(`/expenses/${id}`);
              if (res.status === 200 && res.data?.success) {
                setExpenses((current) => current.filter((e) => e.id !== id));
              } else {
                Alert.alert(
                  "Delete Failed",
                  res.data?.message || "Failed to delete expense."
                );
              }
            } catch (err) {
              Alert.alert("Delete Failed", "Error deleting expense.");
            }
          },
        },
      ]
    );
  };

  const handleSearchIconPress = () => {
    setSearchActive((current) => {
      const next = !current;
      if (next) {
        requestAnimationFrame(() => searchInputRef.current?.focus());
      } else {
        searchInputRef.current?.blur();
        setSearchText("");
      }
      return next;
    });
  };

  const handleComingSoon = (action: string) => {
    Alert.alert("Coming Soon", `${action} action is not implemented yet.`);
  };

  // Card Render functions
  const renderQuotationCard = ({ item }: { item: Quotation }) => {
    const statusColors = {
      DRAFT: "#fbbf24",
      SENT: "#34d399",
      ACCEPTED: "#60a5fa",
      EXPIRED: "#fb7185",
    };
    const statusColor = statusColors[item.status] ?? colors.textSecondary;
    const customerName =
      item.customer?.companyName ??
      item.customer?.customerName ??
      "Unknown Customer";

    return (
      <GlassPanel style={styles.card}>
        {/* Row 1: ID & Amount */}
        <View style={styles.cardRow}>
          <Text style={[styles.invoiceNumberText, { color: statusColor }]}>
            {item.quotationNumber}
          </Text>
          <Text style={[styles.priceValueText, { color: colors.text }]}>
            {formatCurrency(item.totals?.grandTotal ?? 0)}
          </Text>
        </View>

        {/* Row 2: Customer Name & Expiry */}
        <View style={[styles.cardRow, { marginTop: 6 }]}>
          <Text style={[styles.cardTitleText, { color: colors.text }]} numberOfLines={1}>
            {customerName}
          </Text>
          <Text style={[styles.balanceLabelText, { color: colors.textSecondary }]}>
            EXPIRY: {formatDate(item.expiryDate)}
          </Text>
        </View>

        {/* Row 3: Date & Status */}
        <View style={[styles.cardRow, { marginTop: 8, alignItems: "center" }]}>
          <Text style={[styles.cardSubtitleText, { color: colors.textSecondary }]}>
            {formatDate(item.quotationDate)}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${statusColor}1A`,
                borderColor: `${statusColor}30`,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />

        {/* Actions Row */}
        <View style={[styles.actionsRow, { justifyContent: "space-between" }]}>
          <ActionIconButton icon={Eye} onPress={() => handleComingSoon("View")} />
          <ActionIconButton
            icon={PencilLine}
            onPress={() => handleComingSoon("Edit")}
            color="#fbbf24"
          />
          <ActionIconButton icon={Copy} onPress={() => handleComingSoon("Copy")} />
          <ActionIconButton
            icon={MessageCircle}
            onPress={() => handleComingSoon("Message")}
            color="#34D399"
          />
          <ActionIconButton
            icon={Download}
            onPress={() => handleComingSoon("Download")}
          />
          <ActionIconButton
            icon={Send}
            onPress={() => handleComingSoon("Send")}
            color="#7dd3fc"
          />
          <ActionIconButton
            icon={Trash2}
            onPress={() => handleDeleteQuotation(item.id)}
            color="#FF6B6B"
          />
        </View>
      </GlassPanel>
    );
  };

  const renderInvoiceCard = ({ item }: { item: Invoice }) => {
    const statusColors = {
      PAID: "#34d399",
      UNPAID: "#fbbf24",
      PARTIAL: "#fbbf24",
      OVERDUE: "#fb7185",
      DRAFT: "#88b4cc",
      SENT: "#7dd3fc",
      CANCELLED: "#64748b",
    };
    const statusColor = statusColors[item.status] ?? colors.textSecondary;
    const customerName =
      item.customer?.companyName ?? item.customer?.customerName ?? "Unknown Customer";

    const isOverdue = item.status === "OVERDUE";
    const isCancelled = item.status === "CANCELLED";

    return (
      <GlassPanel
        style={[styles.card, isCancelled && { opacity: 0.5 }]}
      >
        {/* Row 1: Invoice Number & Amount */}
        <View style={styles.cardRow}>
          <Text style={[styles.invoiceNumberText, { color: statusColor }]}>
            {item.invoiceNumber}
          </Text>
          <Text style={[styles.priceValueText, { color: colors.text }]}>
            {formatCurrency(item.totals?.grandTotal ?? 0)}
          </Text>
        </View>

        {/* Row 2: Customer Name & Balance */}
        <View style={[styles.cardRow, { marginTop: 6 }]}>
          <Text style={[styles.cardTitleText, { color: colors.text }]} numberOfLines={1}>
            {customerName}
          </Text>
          <Text style={[styles.balanceLabelText, { color: colors.textSecondary }]}>
            BALANCE: {formatCurrency(item.amountDue ?? 0)}
          </Text>
        </View>

        {/* Row 3: Date & Status */}
        <View style={[styles.cardRow, { marginTop: 8, alignItems: "center" }]}>
          <Text
            style={[
              styles.cardSubtitleText,
              { color: colors.textSecondary },
              isOverdue && { color: statusColor, fontWeight: "700" },
            ]}
          >
            {isOverdue
              ? `Due ${formatDate(item.dueDate)}`
              : formatDate(item.invoiceDate)}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${statusColor}1A`,
                borderColor: `${statusColor}30`,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />

        {/* Actions Row */}
        <View style={[styles.actionsRow, { justifyContent: "space-between" }]}>
          <ActionIconButton icon={Eye} onPress={() => handleComingSoon("View")} />
          <ActionIconButton
            icon={PencilLine}
            onPress={() => handleComingSoon("Edit")}
            color="#fbbf24"
          />
          <ActionIconButton icon={Copy} onPress={() => handleComingSoon("Copy")} />
          <ActionIconButton
            icon={MessageSquare}
            onPress={() => handleComingSoon("Chat")}
            color="#34D399"
          />
          <ActionIconButton
            icon={Download}
            onPress={() => handleComingSoon("Download")}
          />
          <ActionIconButton
            icon={Send}
            onPress={() => handleComingSoon("Send")}
            color="#7dd3fc"
          />
          <ActionIconButton
            icon={Phone}
            onPress={() => handleComingSoon("Call")}
            color="#34D399"
          />
          <ActionIconButton
            icon={Trash2}
            onPress={() => handleDeleteInvoice(item.id)}
            color="#FF6B6B"
          />
        </View>
      </GlassPanel>
    );
  };

  const renderExpenseCard = ({ item }: { item: Expense }) => {
    const shortId = item.id
      ? item.id.substring(item.id.length - 8).toUpperCase()
      : "EXP";
    const loggedBy = (item.createdBy?.fullName ?? "—").toUpperCase();
    const categoryName = item.category?.name ?? "Uncategorized";

    return (
      <GlassPanel style={styles.card}>
        {/* Row 1: ID & Amount */}
        <View style={styles.cardRow}>
          <Text style={[styles.expenseNumberText, { color: colors.textSecondary }]}>
            #EXP-{shortId}
          </Text>
          <Text style={[styles.priceValueText, { color: colors.text }]}>
            -{formatCurrency(item.amount)}
          </Text>
        </View>

        {/* Row 2: Date & Creator */}
        <View style={[styles.cardRow, { marginTop: 6 }]}>
          <Text style={[styles.cardSubtitleText, { color: colors.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
          <Text style={[styles.loggedByCapsText, { color: colors.textSecondary }]}>
            {loggedBy}
          </Text>
        </View>

        {/* Row 3: Category Badge */}
        <View style={[styles.cardRow, { marginTop: 8, justifyContent: "flex-start" }]}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <Text style={[styles.categoryBadgeText, { color: colors.text }]}>
              {categoryName}
            </Text>
          </View>
        </View>

        {/* Row 4: Note */}
        {item.note ? (
          <View style={[styles.noteContainer, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              {item.note}
            </Text>
          </View>
        ) : null}

        <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />

        {/* Actions Row */}
        <View style={[styles.actionsRow, { justifyContent: "flex-start", gap: 12 }]}>
          <ActionIconButton icon={Copy} onPress={() => handleComingSoon("Copy")} />
          <ActionIconButton
            icon={PencilLine}
            onPress={() => handleComingSoon("Edit")}
            color="#fbbf24"
          />
          <ActionIconButton icon={Eye} onPress={() => handleComingSoon("View")} />
          <ActionIconButton
            icon={Trash2}
            onPress={() => handleDeleteExpense(item.id)}
            color="#FF6B6B"
          />
        </View>
      </GlassPanel>
    );
  };

  const activeDataList = useMemo(() => {
    if (activeTab === "Quotations") return filteredQuotations;
    if (activeTab === "Invoices") return filteredInvoices;
    return filteredExpenses;
  }, [activeTab, filteredQuotations, filteredInvoices, filteredExpenses]);

  const activeCardRenderer = useMemo<any>(() => {
    if (activeTab === "Quotations") return renderQuotationCard;
    if (activeTab === "Invoices") return renderInvoiceCard;
    return renderExpenseCard;
  }, [activeTab]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Ambient background glow blobs */}
      <View style={styles.bgEffectsWrapper} pointerEvents="none">
        <View style={[styles.bgEffectTop, { backgroundColor: colors.primary + "12" }]} />
        <View style={[styles.bgEffectBottom, { backgroundColor: colors.tertiary + "12" }]} />
      </View>

      <AppHeader
        title={activeTab}
        onSearchPress={handleSearchIconPress}
        searchActive={searchActive}
        showSearchInput={searchActive}
        searchInputRef={searchInputRef}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        searchPlaceholder={`Search ${activeTab.toLowerCase()}...`}
        onSearchBlur={() => setSearchActive(false)}
      />

      <FlatList
        data={loading ? [] : (activeDataList as any[])}
        keyExtractor={(item) => item.id}
        renderItem={activeCardRenderer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <>
            {/* Pill Segmented Tab Control */}
            <SegmentedControl
              options={["Quotations", "Invoices", "Expenses"]}
              activeOption={activeTab}
              onOptionChange={(opt) => setActiveTab(opt as Tab)}
              style={{ marginBottom: 16 }}
            />

            {/* Unified Stats Row */}
            <GlassPanel style={styles.statsPanel}>
              <View style={styles.statsContainer}>
                {currentStats.map((stat, idx) => (
                  <React.Fragment key={stat.label}>
                    {idx > 0 && <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />}
                    <View style={styles.statItem}>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                      <Text
                        style={[
                          styles.statValue,
                          { color: colors.primary },
                          stat.color ? { color: stat.color } : null,
                        ]}
                      >
                        {stat.value}
                      </Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </GlassPanel>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <GlassPanel style={styles.stateCard}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.stateText, { color: colors.textSecondary }]}>Loading {activeTab.toLowerCase()}...</Text>
            </GlassPanel>
          ) : error ? (
            <GlassPanel style={styles.stateCard}>
              <Text style={[styles.stateText, { color: colors.error }]}>{error}</Text>
            </GlassPanel>
          ) : (
            <GlassPanel style={styles.stateCard}>
              <Text style={[styles.stateText, { color: colors.textSecondary }]}>No {activeTab.toLowerCase()} found.</Text>
            </GlassPanel>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgEffectsWrapper: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  bgEffectTop: {
    position: "absolute",
    top: -100,
    left: width * 0.1,
    width: 300,
    height: 300,
    borderRadius: 150,
    transform: [{ scale: 2 }],
  },
  bgEffectBottom: {
    position: "absolute",
    bottom: -100,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    transform: [{ scale: 1.5 }],
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  statsPanel: {
    marginBottom: 20,
    borderRadius: 18,
    paddingVertical: 12,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statsDivider: {
    width: 1,
    height: 32,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  idPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.15)",
  },
  idPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  invoiceNumberText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  priceValueText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  cardTitleText: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  balanceLabelText: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardSubtitleText: {
    fontSize: 12,
    fontWeight: "400",
  },
  expenseNumberText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loggedByCapsText: {
    fontSize: 12,
    fontWeight: "600",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusBadge: {
    minHeight: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  innerDivider: {
    height: 1,
    marginVertical: 14,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  noteContainer: {
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
  },
  loggedByText: {
    fontSize: 12,
    fontStyle: "italic",
    flex: 1,
  },
  stateCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.15)",
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});