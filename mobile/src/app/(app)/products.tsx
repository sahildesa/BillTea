import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProductsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Products & Customers</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e1a',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e0e8f0',
  },
});
