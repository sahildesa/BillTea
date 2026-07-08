import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  Table2,
  FileSpreadsheet,
  FileText,
} from "lucide-react-native";

export default function ExportButtons() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        EXPORT REPORT
      </Text>

      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
        >
          <Table2
            size={22}
            color="#7DD3FC"
            strokeWidth={2}
          />

          <Text style={styles.buttonText}>
            Excel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
        >
          <FileSpreadsheet
            size={22}
            color="#7DD3FC"
            strokeWidth={2}
          />

          <Text style={styles.buttonText}>
            CSV
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
        >
          <FileText
            size={22}
            color="#7DD3FC"
            strokeWidth={2}
          />

          <Text style={styles.buttonText}>
            PDF
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },

  title: {
    color: "#E0E8F0",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  button: {
    width: "31%",
    paddingVertical: 14,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(15,21,36,0.60)",

    borderRadius: 14,

    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.10)",
  },

  buttonText: {
    marginTop: 8,
    color: "#A0B4C4",
    fontSize: 10,
    fontWeight: "500",
  },
});