import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { FileText } from "lucide-react-native";
import { GlassPanel } from "../ui/GlassPanel";
import { useTheme } from "../../hooks/useTheme";

type Props = {
  invoice: string;
  company: string;
  date: string;
  total: string;
  paid: string;
  status: "paid" | "pending";
};

export default function InvoiceCard({
  invoice,
  company,
  date,
  total,
  paid,
  status,
}: Props) {
  const isPaid = status === "paid";
  const { colors } = useTheme();

  return (
    <GlassPanel style={styles.card}>
      {/* Top */}
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.left}>
          <FileText
            size={18}
            color={colors.textSecondary}
            strokeWidth={2}
          />

          <Text
            style={[
              styles.invoice,
              { color: colors.text },
            ]}
          >
            {invoice}
          </Text>
        </View>

        <Text
          style={[
            styles.date,
            { color: colors.textSecondary },
          ]}
        >
          {date}
        </Text>
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View>
          <Text
            style={[
              styles.company,
              { color: colors.textSecondary },
            ]}
          >
            {company}
          </Text>

          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary },
              ]}
            >
              Total:
            </Text>

            <Text
              style={[
                styles.total,
                { color: colors.text },
              ]}
            >
              {total}
            </Text>

            <Text
              style={[
                styles.separator,
                { color: colors.textSecondary },
              ]}
            >
              |
            </Text>

            <Text
              style={[
                styles.label,
                { color: colors.textSecondary },
              ]}
            >
              Paid:
            </Text>

            <Text
              style={[
                styles.total,
                {
                  color: isPaid
                    ? "#34D399"
                    : colors.textSecondary,
                },
              ]}
            >
              {paid}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.badge,
            isPaid
              ? styles.paidBadge
              : styles.pendingBadge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: isPaid
                  ? "#34D399"
                  : colors.error,
              },
            ]}
          >
            {isPaid ? "PAID" : "PENDING"}
          </Text>
        </View>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 15,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  invoice: {
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 14,
  },

  date: {
    fontSize: 12,
  },

  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 14,
  },

  company: {
    fontWeight: "500",
    fontSize: 15,
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  label: {
    fontSize: 13,
  },

  total: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 3,
  },

  separator: {
    marginHorizontal: 8,
    opacity: 0.35,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },

  paidBadge: {
    backgroundColor: "rgba(52,211,153,0.10)",
    borderColor: "rgba(52,211,153,0.20)",
  },

  pendingBadge: {
    backgroundColor: "rgba(255,107,107,0.10)",
    borderColor: "rgba(255,107,107,0.20)",
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
});