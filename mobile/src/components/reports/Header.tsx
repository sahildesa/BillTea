import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { House } from "lucide-react-native";

export default function Header() {
  const [selected, setSelected] = useState<"invoice" | "profit">("invoice");

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} style={styles.iconButton}>
          <House
            size={22}
            color="#A7B6C7"
            strokeWidth={2.3}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Reports</Text>

        <View style={styles.placeholder} />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Toggle */}
      <View style={styles.segment}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSelected("invoice")}
          style={[
            styles.segmentButton,
            selected === "invoice" && styles.segmentActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              selected === "invoice" && styles.segmentTextActive,
            ]}
          >
            Invoice Report
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSelected("profit")}
          style={[
            styles.segmentButton,
            selected === "profit" && styles.segmentActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              selected === "profit" && styles.segmentTextActive,
            ]}
          >
            Profit Report
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },

  placeholder: {
    width: 36,
  },

  title: {
    color: "#E8EEF6",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(125,211,252,0.10)",
    marginHorizontal: -20,
    marginTop: 6,
    marginBottom: 18,
  },

  segment: {
    flexDirection: "row",
    backgroundColor: "rgba(15,21,36,0.65)",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.12)",
    padding: 3,
    marginBottom: 20,
  },

  segmentButton: {
    flex: 1,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 21,
  },

  segmentActive: {
    backgroundColor: "#123854",
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.18)",
  },

  segmentText: {
    color: "#9AA8B8",
    fontSize: 14,
    fontWeight: "600",
  },

  segmentTextActive: {
    color: "#7DD3FC",
    fontWeight: "700",
  },
});