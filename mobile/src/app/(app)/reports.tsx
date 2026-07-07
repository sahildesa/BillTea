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
import { useTheme } from "../../hooks/useTheme";

export default function ReportsScreen() {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
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
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
});