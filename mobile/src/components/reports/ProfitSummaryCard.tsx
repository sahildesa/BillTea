import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  TrendingUp,
  TrendingDown,
  Landmark,
} from "lucide-react-native";

export default function ProfitSummaryCard() {
  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.row}>
        {/* Total Income */}
        <View style={[styles.card, styles.incomeCard]}>
          <View style={styles.titleRow}>
            <TrendingUp
              size={18}
              color="#7DD3FC"
              strokeWidth={2}
            />
            <Text style={styles.label}>Total Income</Text>
          </View>

          <Text style={styles.incomeAmount}>
            $542,200
          </Text>
        </View>

        {/* Expenses */}
        <View style={[styles.card, styles.expenseCard]}>
          <View style={styles.titleRow}>
            <TrendingDown
              size={18}
              color="#FF6B6B"
              strokeWidth={2}
            />
            <Text style={styles.label}>Expenses</Text>
          </View>

          <Text style={styles.expenseAmount}>
            $124,400
          </Text>
        </View>
      </View>

      {/* Bottom Card */}
      <View style={styles.profitCard}>
        <View style={styles.titleRow}>
          <Landmark
            size={18}
            color="#C792EA"
            strokeWidth={2}
          />
          <Text style={styles.label}>Net Profit</Text>
        </View>

        <Text style={styles.profitAmount}>
          $417,800
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 26,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  card: {
    width: "48%",
    backgroundColor: "#111827",
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
  },

  incomeCard: {
    borderColor: "rgba(125,211,252,0.18)",
  },

  expenseCard: {
    borderColor: "rgba(255,107,107,0.22)",
  },

  profitCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(199,146,234,0.22)",
    paddingHorizontal: 20,
    paddingVertical: 22,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  label: {
    color: "#AAB4C5",
    fontSize: 17,
    marginLeft: 10,
    fontWeight: "500",
  },

  incomeAmount: {
    color: "#7DD3FC",
    fontSize: 27,
    fontWeight: "700",
  },

  expenseAmount: {
    color: "#FF6B6B",
    fontSize: 27,
    fontWeight: "700",
  },

  profitAmount: {
    color: "#C792EA",
    fontSize: 28,
    fontWeight: "700",
  },
});