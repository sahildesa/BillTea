import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

type Props = {
  title: string;
  invoice: string;
  company: string;
  category: string;
  amount: string;
  date: string;
  type: "income" | "expense";
};

export default function ProfitTransactionCard({
  title,
  invoice,
  company,
  category,
  amount,
  date,
  type,
}: Props) {
  const income = type === "income";

  return (
    <View style={styles.card}>
      {/* Top */}

      <View style={styles.topRow}>
        <View style={styles.left}>
          <View
            style={[
              styles.circle,
              income
                ? styles.incomeCircle
                : styles.expenseCircle,
            ]}
          >
            <Text
              style={[
                styles.circleText,
                {
                  color: income
                    ? "#22C55E"
                    : "#EF4444",
                },
              ]}
            >
              {income ? "+" : "−"}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.title}>
              {title}
            </Text>

            <Text style={styles.invoice}>
              {invoice}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text
            style={[
              styles.amount,
              {
                color: income
                  ? "#22C55E"
                  : "#EF4444",
              },
            ]}
          >
            {income ? "+" : "-"}
            {amount}
          </Text>

          <Text style={styles.date}>
            {date}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Bottom */}

      <View style={styles.bottomRow}>
        <Text
          numberOfLines={1}
          style={styles.company}
        >
          {company}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.category}
        >
          {category}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#121A2A",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 16,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },

  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  incomeCircle: {
    backgroundColor: "rgba(34,197,94,0.15)",
  },

  expenseCircle: {
    backgroundColor: "rgba(239,68,68,0.15)",
  },

  circleText: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 30,
  },

  info: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  invoice: {
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
  },

  right: {
    alignItems: "flex-end",
  },

  amount: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  date: {
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "500",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 18,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  company: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 12,
  },

  category: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "right",
  },
});