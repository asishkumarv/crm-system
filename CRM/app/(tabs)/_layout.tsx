import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="adminDashboard"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          href: user?.role === 'admin' ? '/(tabs)/adminDashboard' : null,
        }}
      />
      <Tabs.Screen
        name="employeeDashboard"
        options={{
          title: 'Employee',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          href: user?.role === 'employee' ? '/(tabs)/employeeDashboard' : null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="adminProfile"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="employeeProfile"
        options={{ href: null }}
      />
    </Tabs>
  );
}
