import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppHeader } from '../../components/ui/AppHeader';

export default function QuotationsScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Quotations" />
      <View style={styles.content}>
        <Text style={styles.text}>Quotations</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e0e8f0',
  },
});
