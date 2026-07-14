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
import { useTheme } from "../../hooks/useTheme";

export default function ExportButtons() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: colors.text },
        ]}
      >
        EXPORT REPORT
      </Text>

      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.button,
            {
              backgroundColor: colors.glassBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Table2
            size={22}
            color={colors.primary}
            strokeWidth={2}
          />

          <Text
            style={[
              styles.buttonText,
              { color: colors.textSecondary },
            ]}
          >
            Excel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.button,
            {
              backgroundColor: colors.glassBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <FileSpreadsheet
            size={22}
            color={colors.primary}
            strokeWidth={2}
          />

          <Text
            style={[
              styles.buttonText,
              { color: colors.textSecondary },
            ]}
          >
            CSV
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.button,
            {
              backgroundColor: colors.glassBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <FileText
            size={22}
            color={colors.primary}
            strokeWidth={2}
          />

          <Text
            style={[
              styles.buttonText,
              { color: colors.textSecondary },
            ]}
          >
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
    borderRadius: 14,
    borderWidth: 1,
  },

  buttonText: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: "500",
  },
});