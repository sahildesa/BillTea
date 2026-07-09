import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function TransactionHistoryHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        TRANSACTION HISTORY
      </Text>

      <TouchableOpacity activeOpacity={0.7}>
        <Text style={styles.filter}>
          Filter
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#E0E8F0",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  filter: {
    color: "#7DD3FC",
    fontSize: 12,
    fontWeight: "600",
  },
});