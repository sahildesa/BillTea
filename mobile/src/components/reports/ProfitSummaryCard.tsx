import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  TrendingUp,
  TrendingDown,
  Landmark,
} from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";

export default function ProfitSummaryCard() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.row}>
        {/* Total Income */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <View style={styles.titleRow}>
            <TrendingUp
              size={18}
              color={colors.primary}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary },
              ]}
            >
              Total Income
            </Text>
          </View>

          <Text
            style={[
              styles.incomeAmount,
              { color: colors.primary },
            ]}
          >
            $542,200
          </Text>
        </View>

        {/* Expenses */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <View style={styles.titleRow}>
            <TrendingDown
              size={18}
              color={colors.error}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary },
              ]}
            >
              Expenses
            </Text>
          </View>

          <Text
            style={[
              styles.expenseAmount,
              { color: colors.error },
            ]}
          >
            $124,400
          </Text>
        </View>
      </View>

      {/* Bottom Card */}
      <View
        style={[
          styles.profitCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.glassBorder,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <Landmark
            size={18}
            color={colors.tertiary}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.label,
              { color: colors.textSecondary },
            ]}
          >
            Net Profit
          </Text>
        </View>

        <Text
          style={[
            styles.profitAmount,
            { color: colors.tertiary },
          ]}
        >
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
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
  },

  profitCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  label: {
    fontSize: 17,
    marginLeft: 10,
    fontWeight: "500",
  },

  incomeAmount: {
    fontSize: 27,
    fontWeight: "700",
  },

  expenseAmount: {
    fontSize: 27,
    fontWeight: "700",
  },

  profitAmount: {
    fontSize: 28,
    fontWeight: "700",
  },
});