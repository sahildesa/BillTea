import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CreateQuotation() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Quotation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a111a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});
