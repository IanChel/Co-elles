import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { colors, isDarkMode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          marginTop: 4,
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home-variant" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="create-trip"
        options={{
          title: 'Publier',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="plus-circle" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-trips"
        options={{
          title: 'Trajets',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="ticket-confirmation" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chat" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="shield-alert" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
