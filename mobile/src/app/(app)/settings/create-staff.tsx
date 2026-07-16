import React from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { AppHeader } from '../../../components/ui/AppHeader';

export default function CreateStaffScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader title="Create Staff" />
      
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>
          Create Staff Screen Placeholder
        </Text>
      </View>
    </View>
  );
}
