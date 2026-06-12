import { Tabs } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          elevation: 10,
        },
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Rechercher',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="magnify" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-trip"
        options={{
          title: 'Proposer',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="plus-circle" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-trips"
        options={{
          title: 'Mes Trajets',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="ticket-confirmation" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="alert-circle" size={24} color={COLORS.sosRed} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
