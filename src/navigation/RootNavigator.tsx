import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import TodayScreen from '../screens/TodayScreen';
import colors from '../theme/colors';

type TabIconName =
  | 'calendar-outline'
  | 'time-outline'
  | 'stats-chart-outline'
  | 'settings-outline';

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Today"
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={getTabIcon(route.name)}
            size={size ?? 20}
            color={color}
          />
        ),
        tabBarLabelStyle: { fontSize: 12 },
        sceneContainerStyle: { backgroundColor: colors.background },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function getTabIcon(routeName: string): TabIconName {
  switch (routeName) {
    case 'Today':
      return 'calendar-outline';
    case 'History':
      return 'time-outline';
    case 'Stats':
      return 'stats-chart-outline';
    case 'Settings':
    default:
      return 'settings-outline';
  }
}

