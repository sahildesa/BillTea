import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
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
import { apiClient } from "@/api/client";

type Tab = "quotations" | "invoices" | "expenses";

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

function SegmentButton({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.segmentButton,
        isActive && styles.segmentButtonActive,
        pressed && styles.segmentButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.segmentText,
          isActive ? styles.segmentTextActive : styles.segmentTextInactive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function QuotationsScreen() {
  const searchInputRef = useRef<TextInput>(null);
  const [activeTab, setActiveTab] = useState<Tab>("quotations");

  // Record list states
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Fetching & Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedTabs, setFetchedTabs] = useState<Record<Tab, boolean>>({
    quotations: false,
    invoices: false,
    expenses: false,
  });

  // Search states
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");

  const title = useMemo(() => {
    if (activeTab === "quotations") return "Quotations";
    if (activeTab === "invoices") return "Invoices";
    return "Expenses";
  }, [activeTab]);

  // Fetch data lazily on tab switch
  useEffect(() => {
    if (fetchedTabs[activeTab]) return;

    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const endpoint = `/${activeTab}`;
        const res = await apiClient.get(endpoint);
        if (!mounted) return;

        if (res.status === 200 && res.data?.success) {
          const list = Array.isArray(res.data[activeTab]) ? res.data[activeTab] : [];
          if (activeTab === "quotations") {
            setQuotations(list);
          } else if (activeTab === "invoices") {
            setInvoices(list);
          } else if (activeTab === "expenses") {
            setExpenses(list);
          }
          setFetchedTabs((prev) => ({ ...prev, [activeTab]: true }));
        } else {
          setError(`Failed to load ${activeTab} list.`);
        }
      } catch (err) {
        if (mounted) {
          setError(`Failed to connect to server to load ${activeTab}.`);
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
    if (activeTab === "quotations") {
      const totalVolume = quotations.reduce(
        (sum, item) => sum + (item.totals?.grandTotal ?? 0),
        0
      );
      const pendingCount = quotations.filter((q) => q.status === "SENT").length;
      return [
        { label: "Total Volume", value: formatAbbreviatedCurrency(totalVolume) },
        { label: "Pending Sent", value: String(pendingCount) },
      ];
    }
    if (activeTab === "invoices") {
      const totalVolume = invoices.reduce(
        (sum, item) => sum + (item.totals?.grandTotal ?? 0),
        0
      );
      const pendingCount = invoices.filter(
        (i) => i.status === "UNPAID" || i.status === "PARTIAL"
      ).length;
      const totalPaid = invoices.reduce((sum, item) => sum + (item.amountPaid ?? 0), 0);
      return [
        { label: "Total Volume", value: formatAbbreviatedCurrency(totalVolume) },
        { label: "Pending", value: String(pendingCount) },
        {
          label: "Total Paid",
          value: formatAbbreviatedCurrency(totalPaid),
          color: "#34D399",
        },
      ];
    }
    // Expenses
    const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    return [
      {
        label: "Total Expenses",
        value: formatAbbreviatedCurrency(totalExpenses),
        color: "#fb7185",
      },
      { label: "Unpaid", value: "—" }, // TODO: Requires backend support (e.g. isReimbursed boolean)
      { label: "Reimbursed", value: "—" }, // TODO: Requires backend support (e.g. isReimbursed boolean)
    ];
  }, [activeTab, quotations, invoices, expenses]);

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
  const renderQuotationCard = (quotation: Quotation) => {
    const statusColors = {
      DRAFT: "#fbbf24",
      SENT: "#34d399",
      ACCEPTED: "#60a5fa",
      EXPIRED: "#fb7185",
    };
    const statusColor = statusColors[quotation.status] ?? "#A0B4C4";
    const customerName =
      quotation.customer?.companyName ??
      quotation.customer?.customerName ??
      "Unknown Customer";

    return (
      <View key={quotation.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIdentity}>
            <View style={styles.idPill}>
              <Text style={styles.idPillText}>{quotation.quotationNumber}</Text>
            </View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {customerName}
              </Text>
              <Text style={styles.cardSubtitle}>
                {formatDate(quotation.quotationDate)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${statusColor}15`,
                borderColor: `${statusColor}30`,
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {quotation.status}
            </Text>
          </View>
        </View>

        <View style={styles.innerDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.priceRow}>
            <Text style={styles.priceCurrency}>$</Text>
            <Text style={styles.priceValue}>
              {(quotation.totals?.grandTotal ?? 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View style={styles.actionsRow}>
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
              onPress={() => handleDeleteQuotation(quotation.id)}
              color="#FF6B6B"
            />
          </View>
        </View>
      </View>
    );
  };

  const renderInvoiceCard = (invoice: Invoice) => {
    const statusColors = {
      PAID: "#34d399",
      UNPAID: "#fbbf24",
      PARTIAL: "#fbbf24",
      OVERDUE: "#fb7185",
      DRAFT: "#88b4cc",
      SENT: "#7dd3fc",
      CANCELLED: "#64748b",
    };
    const statusColor = statusColors[invoice.status] ?? "#A0B4C4";
    const customerName =
      invoice.customer?.companyName ?? invoice.customer?.customerName ?? "Unknown Customer";

    const isOverdue = invoice.status === "OVERDUE";
    const isCancelled = invoice.status === "CANCELLED";

    return (
      <View
        key={invoice.id}
        style={[styles.card, isCancelled && { opacity: 0.5 }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardIdentity}>
            <Text style={[styles.invoiceNumberText, { color: statusColor }]}>
              {invoice.invoiceNumber}
            </Text>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {customerName}
              </Text>
              <Text
                style={[
                  styles.cardSubtitle,
                  isOverdue && { color: statusColor, fontWeight: "700" },
                ]}
              >
                {isOverdue
                  ? `Due ${formatDate(invoice.dueDate)}`
                  : formatDate(invoice.invoiceDate)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${statusColor}15`,
                borderColor: `${statusColor}30`,
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {invoice.status}
            </Text>
          </View>
        </View>

        <View style={styles.innerDivider} />

        <View style={styles.invoiceDetailsContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceCurrency}>$</Text>
            <Text style={styles.priceValue}>
              {(invoice.totals?.grandTotal ?? 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <Text style={styles.balanceText}>
            Balance: {formatCurrency(invoice.amountDue ?? 0)}
          </Text>
        </View>

        <View style={[styles.actionsRow, { marginTop: 12, justifyContent: "flex-end" }]}>
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
            onPress={() => handleDeleteInvoice(invoice.id)}
            color="#FF6B6B"
          />
        </View>
      </View>
    );
  };

  const renderExpenseCard = (expense: Expense) => {
    const shortId = expense.id
      ? expense.id.substring(expense.id.length - 8).toUpperCase()
      : "EXP";
    const loggedBy = expense.createdBy?.fullName ?? "—";
    const categoryName = expense.category?.name ?? "Uncategorized";

    return (
      <View key={expense.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIdentity}>
            <View style={styles.expenseIconWrap}>
              <Text style={styles.expenseIconText}>EXP</Text>
            </View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {categoryName}
              </Text>
              <Text style={styles.cardSubtitle}>
                Ref: #{shortId} • {formatDate(expense.date)}
              </Text>
            </View>
          </View>

          <View style={styles.expenseAmountRow}>
            <Text style={styles.expenseAmountText}>
              -{formatCurrency(expense.amount)}
            </Text>
          </View>
        </View>

        {expense.note ? (
          <View style={styles.noteContainer}>
            <Text style={styles.noteText} numberOfLines={2}>
              {expense.note}
            </Text>
          </View>
        ) : null}

        <View style={styles.innerDivider} />

        <View style={styles.expenseFooter}>
          <Text style={styles.loggedByText}>Logged by: {loggedBy}</Text>

          <View style={styles.actionsRow}>
            <ActionIconButton icon={Copy} onPress={() => handleComingSoon("Copy")} />
            <ActionIconButton
              icon={PencilLine}
              onPress={() => handleComingSoon("Edit")}
              color="#fbbf24"
            />
            <ActionIconButton icon={Eye} onPress={() => handleComingSoon("View")} />
            <ActionIconButton
              icon={Trash2}
              onPress={() => handleDeleteExpense(expense.id)}
              color="#FF6B6B"
            />
          </View>
        </View>
      </View>
    );
  };

  const collapseSearch = () => {
    setSearchActive(false);
    searchInputRef.current?.blur();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <AppHeader
        title={title}
        onSearchPress={handleSearchIconPress}
        searchActive={searchActive}
        showSearchInput={searchActive}
        searchInputRef={searchInputRef}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        searchPlaceholder={`Search ${activeTab}...`}
        onSearchBlur={() => setSearchActive(false)}
      />

      <Pressable style={styles.bodyPressable} onPress={collapseSearch}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={collapseSearch}
        >
          {/* Pill Segmented Tab Control */}
          <View style={styles.segment}>
            <SegmentButton
              label="Quotations"
              isActive={activeTab === "quotations"}
              onPress={() => setActiveTab("quotations")}
            />
            <SegmentButton
              label="Invoices"
              isActive={activeTab === "invoices"}
              onPress={() => setActiveTab("invoices")}
            />
            <SegmentButton
              label="Expenses"
              isActive={activeTab === "expenses"}
              onPress={() => setActiveTab("expenses")}
            />
          </View>

          {/* Unified Stats Row */}
          <GlassPanel style={styles.statsPanel}>
            <View style={styles.statsContainer}>
              {currentStats.map((stat, idx) => (
                <React.Fragment key={stat.label}>
                  {idx > 0 && <View style={styles.statsDivider} />}
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text
                      style={[
                        styles.statValue,
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

          {/* Data List Content */}
          {loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator size="large" color="#7DD3FC" />
              <Text style={styles.stateText}>Loading {activeTab}...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateText}>{error}</Text>
            </View>
          ) : activeTab === "quotations" ? (
            <View style={styles.list}>
              {filteredQuotations.map(renderQuotationCard)}
              {filteredQuotations.length === 0 && (
                <View style={styles.stateCard}>
                  <Text style={styles.stateText}>No quotations found.</Text>
                </View>
              )}
            </View>
          ) : activeTab === "invoices" ? (
            <View style={styles.list}>
              {filteredInvoices.map(renderInvoiceCard)}
              {filteredInvoices.length === 0 && (
                <View style={styles.stateCard}>
                  <Text style={styles.stateText}>No invoices found.</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.list}>
              {filteredExpenses.map(renderExpenseCard)}
              {filteredExpenses.length === 0 && (
                <View style={styles.stateCard}>
                  <Text style={styles.stateText}>No expenses found.</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  bodyPressable: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "rgba(15,21,36,0.65)",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.12)",
    padding: 3,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 21,
  },
  segmentButtonActive: {
    backgroundColor: "#123854",
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.18)",
  },
  segmentButtonPressed: {
    opacity: 0.94,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#7DD3FC",
    fontWeight: "700",
  },
  segmentTextInactive: {
    color: "#9AA8B8",
  },
  statsPanel: {
    marginBottom: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.12)",
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
    backgroundColor: "rgba(125,211,252,0.15)",
  },
  statLabel: {
    color: "#9AA8B8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  statValue: {
    color: "#7DD3FC",
    fontSize: 18,
    fontWeight: "800",
  },
  list: {
    gap: 15,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: "rgba(15,21,36,0.75)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.15)",
    padding: 16,
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
    backgroundColor: "rgba(125, 211, 252, 0.1)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.15)",
  },
  idPillText: {
    color: "#7DD3FC",
    fontSize: 12,
    fontWeight: "700",
  },
  invoiceNumberText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  cardTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    color: "#E0E8F0",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    color: "#A0B4C4",
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  innerDivider: {
    height: 1,
    backgroundColor: "rgba(125,211,252,0.1)",
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  priceCurrency: {
    color: "#7DD3FC",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 1,
  },
  priceValue: {
    color: "#7DD3FC",
    fontSize: 18,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  invoiceDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceText: {
    color: "#A0B4C4",
    fontSize: 13,
    fontWeight: "500",
  },
  expenseIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(18,56,84,0.95)",
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  expenseIconText: {
    color: "#7DD3FC",
    fontSize: 11,
    fontWeight: "800",
  },
  expenseAmountRow: {
    alignItems: "flex-end",
  },
  expenseAmountText: {
    color: "#fb7185",
    fontSize: 16,
    fontWeight: "800",
  },
  noteContainer: {
    backgroundColor: "rgba(125, 211, 252, 0.03)",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.05)",
  },
  noteText: {
    color: "#9AA8B8",
    fontSize: 13,
    lineHeight: 18,
  },
  expenseFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  loggedByText: {
    color: "#9AA8B8",
    fontSize: 12,
    fontStyle: "italic",
    flex: 1,
  },
  stateCard: {
    backgroundColor: "rgba(15,21,36,0.75)",
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
    color: "#A0B4C4",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
