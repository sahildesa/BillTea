import React from "react";
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
} from "react-native";

import { AppHeader } from "../../components/ui/AppHeader";
import Header from "../../components/reports/Header";
import SummaryCard from "../../components/reports/SummaryCard";
import RecentReport from "../../components/reports/RecentReport";

export default function ReportsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0A0E1A"
      />

      <AppHeader title="Reports" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Header />
        <SummaryCard />
        <RecentReport />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
});