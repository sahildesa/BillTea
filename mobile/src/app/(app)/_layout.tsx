import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../components/ui/CustomTabBar';

export default function AppLayout() {
  return (
    <Tabs 
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="quotations" />
      <Tabs.Screen name="products" />
      <Tabs.Screen name="dummy" />
      <Tabs.Screen name="reports" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="create-quotation" options={{ href: null } as any} />
      <Tabs.Screen name="create-invoice" options={{ href: null } as any} />
      <Tabs.Screen name="create-expense" options={{ href: null } as any} />
    </Tabs>
  );
}
