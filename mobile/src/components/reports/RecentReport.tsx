import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import InvoiceCard from "./InvoiceCard";

export default function RecentReport() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          RECENT INVOICES
        </Text>

        <TouchableOpacity activeOpacity={0.8}>
          <Text style={styles.viewAll}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Invoice List */}

      <InvoiceCard
        invoice="#INV-2041"
        company="TechCorp Pvt Ltd"
        date="12 Oct 2025"
        total="$4,500"
        paid="$4,500"
        status="paid"
      />

      <InvoiceCard
        invoice="#INV-2042"
        company="Creative Studio"
        date="10 Oct 2025"
        total="$2,850"
        paid="$0"
        status="pending"
      />

      <InvoiceCard
        invoice="#INV-2043"
        company="Global Solutions"
        date="08 Oct 2025"
        total="$8,250"
        paid="$8,250"
        status="paid"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 18,
  },

  title:{
    color:"#F8FAFC",
    fontSize:18,
    fontWeight:"700",
    letterSpacing:0.8,
},

  viewAll: {
    color: "#7DD3FC",
    fontSize: 14,
    fontWeight: "600",
  },
});