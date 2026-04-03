import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '../theme/colors';
import DashboardScreen from '../screens/DashboardScreen';
import TimetableScreen from '../screens/TimetableScreen';
import EventsScreen from '../screens/EventsScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Timetable: { focusDay?: string; highlightExamId?: string } | undefined;
  Events: { initialTab?: 'events' | 'clubs'; initialFilter?: string; highlightEventId?: string } | undefined;
  Map: { focusBuildingId?: string; focusBuildingName?: string; focusRoom?: string; source?: string } | undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<string, string> = {
  Dashboard: '🏠', Timetable: '📅', Events: '🎉', Map: '🗺️', Profile: '👤',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
        headerTitle: route.name === 'Dashboard' ? 'RVU Connect' : route.name,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Timetable" component={TimetableScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
