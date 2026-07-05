import React from "react";
import { View, Text, StyleSheet } from "react-native";
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
    valueColor: "#E8EEF6",
    iconColor: "#A0B4C4",
  },
  {
    id: 2,
    title: "Total Amount",
    value: "$452,800",
    icon: Wallet,
    valueColor: "#7DD3FC",
    iconColor: "#7DD3FC",
  },
  {
    id: 3,
    title: "Total Paid",
    value: "$385,000",
    icon: CircleDollarSign,
    valueColor: "#E8EEF6",
    iconColor: "#34D399",
  },
  {
    id: 4,
    title: "Total Pending",
    value: "$67,800",
    icon: Clock3,
    valueColor: "#E8EEF6",
    iconColor: "#FF6B6B",
  },
];

export default function SummaryCard() {
  return (
    <View style={styles.grid}>
      {DATA.map((item) => {
        const Icon = item.icon;

        return (
          <View key={item.id} style={styles.card}>
            <View style={styles.topRow}>
              <Icon
                size={18}
                color={item.iconColor}
                strokeWidth={2}
              />

              <Text style={styles.label}>
                {item.title}
              </Text>
            </View>

            <Text
              style={[
                styles.value,
                { color: item.valueColor },
              ]}
            >
              {item.value}
            </Text>
          </View>
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
    marginBottom:8,
  },

  card: {
    width: "48%",

    minHeight: 110,

    backgroundColor: "rgba(15,21,36,0.65)",

    borderWidth: 1,

    borderColor: "rgba(125,211,252,0.10)",

    borderRadius: 18,

    padding: 16,

    justifyContent: "space-between",

    marginBottom: 15,
  },

  topRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  label: {
    color: "#A0B4C4",

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