import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";

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
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
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
                    : colors.error,
                },
              ]}
            >
              {income ? "+" : "−"}
            </Text>
          </View>

          <View style={styles.info}>
            <Text
              style={[
                styles.title,
                { color: colors.text },
              ]}
            >
              {title}
            </Text>

            <Text
              style={[
                styles.invoice,
                { color: colors.textSecondary },
              ]}
            >
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
                  : colors.error,
              },
            ]}
          >
            {income ? "+" : "-"}
            {amount}
          </Text>

          <Text
            style={[
              styles.date,
              { color: colors.textSecondary },
            ]}
          >
            {date}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: colors.border },
        ]}
      />

      {/* Bottom */}
      <View style={styles.bottomRow}>
        <Text
          numberOfLines={1}
          style={[
            styles.company,
            { color: colors.text },
          ]}
        >
          {company}
        </Text>

        <Text
          numberOfLines={1}
          style={[
            styles.category,
            { color: colors.textSecondary },
          ]}
        >
          {category}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
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
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  invoice: {
    marginTop: 5,
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
    fontSize: 12,
    fontWeight: "500",
  },

  divider: {
    height: 1,
    marginVertical: 18,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  company: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    marginRight: 12,
  },

  category: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "right",
  },
});