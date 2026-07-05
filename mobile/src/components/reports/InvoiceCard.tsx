import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { FileText } from "lucide-react-native";

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

  return (
    <View style={styles.card}>
      {/* Top */}
      <View style={styles.header}>
        <View style={styles.left}>
          <FileText
            size={18}
            color="#A0B4C4"
            strokeWidth={2}
          />

          <Text style={styles.invoice}>
            {invoice}
          </Text>
        </View>

        <Text style={styles.date}>
          {date}
        </Text>
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View>
          <Text style={styles.company}>
            {company}
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Total:
            </Text>

            <Text style={styles.total}>
              {total}
            </Text>

            <Text style={styles.separator}>
              |
            </Text>

            <Text style={styles.label}>
              Paid:
            </Text>

            <Text
              style={[
                styles.total,
                {
                  color: isPaid
                    ? "#34D399"
                    : "#94A3B8",
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
                  : "#FF6B6B",
              },
            ]}
          >
            {isPaid ? "PAID" : "PENDING"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(15,21,36,0.75)",

    borderRadius: 18,

    borderWidth: 1,

    borderColor: "rgba(125,211,252,0.15)",

    padding: 16,

    marginBottom: 15,
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingBottom: 12,

    borderBottomWidth: 1,

    borderBottomColor: "rgba(125,211,252,0.10)",
  },

  left: {
    flexDirection: "row",

    alignItems: "center",
  },

  invoice: {
    color: "#E0E8F0",

    marginLeft: 8,

    fontWeight: "600",

    fontSize: 14,
  },

  date: {
    color: "#A0B4C4",

    fontSize: 12,
  },

  bottom: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",

    marginTop: 14,
  },

  company: {
    color: "#E0E8F0",

    fontWeight: "600",

    fontSize: 15,

    marginBottom: 6,
  },

  row: {
    flexDirection: "row",

    alignItems: "center",

    flexWrap: "wrap",
  },

  label: {
    color: "#A0B4C4",

    fontSize: 12,
  },

  total: {
    color: "#E0E8F0",

    fontSize: 12,

    fontWeight: "600",

    marginLeft: 3,
  },

  separator: {
    color: "#7DD3FC",

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