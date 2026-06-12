import { Redirect, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
      setIsFirstLaunch(hasSeen !== 'true');
    };
    checkOnboarding();
  }, []);

  // Écran de chargement pendant la vérification
  if (isLoading || isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Si premier lancement, onboarding
  if (isFirstLaunch) {
    return <Redirect href="/onboarding" />;
  }

  // Redirige selon l'état de connexion
  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
