import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function TransactionHistoryHeader() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: colors.text },
        ]}
      >
        TRANSACTION HISTORY
      </Text>

      <TouchableOpacity activeOpacity={0.7}>
        <Text
          style={[
            styles.filter,
            { color: colors.primary },
          ]}
        >
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
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  filter: {
    fontSize: 12,
    fontWeight: "600",
  },
});