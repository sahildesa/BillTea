import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WhatsappSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>WhatsApp Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
});
