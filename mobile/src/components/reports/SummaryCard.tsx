import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GlassPanel } from "../ui/GlassPanel";
import { useTheme } from "../../hooks/useTheme";
import {
  ReceiptText,
  Wallet,
  CircleDollarSign,
  Clock3,
} from "lucide-react-native";

const DATA = [
  {
    id: 1,
    title: "Total Invoices",
    value: "1,245",
    icon: ReceiptText,
    iconColor: "#A0B4C4",
  },
  {
    id: 2,
    title: "Total Amount",
    value: "$452,800",
    icon: Wallet,
    iconColor: "#7DD3FC",
  },
  {
    id: 3,
    title: "Total Paid",
    value: "$385,000",
    icon: CircleDollarSign,
    iconColor: "#34D399",
  },
  {
    id: 4,
    title: "Total Pending",
    value: "$67,800",
    icon: Clock3,
    iconColor: "#FF6B6B",
  },
];

export default function SummaryCard() {
  const { colors } = useTheme();

  return (
    <View style={styles.grid}>
      {DATA.map((item) => {
        const Icon = item.icon;

        return (
          <GlassPanel key={item.id} style={styles.card}>
            <View style={styles.topRow}>
              <Icon
                size={18}
                color={item.iconColor}
                strokeWidth={2}
              />

              <Text
                style={[
                  styles.label,
                  { color: colors.textSecondary },
                ]}
              >
                {item.title}
              </Text>
            </View>

            <Text
              style={[
                styles.value,
                {
                  color:
                    item.title === "Total Amount"
                      ? colors.primary
                      : colors.text,
                },
              ]}
            >
              {item.value}
            </Text>
          </GlassPanel>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  card: {
    width: "48%",
    padding: 16,
    marginBottom: 15,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },

  value: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 18,
  },
});