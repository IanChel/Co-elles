import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function PaperThemeWrapper({ children }) {
  const { isDarkMode, colors } = useTheme();

  const paperTheme = {
    ...(isDarkMode ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDarkMode ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: colors.primary,
      secondary: colors.accent,
      background: colors.background,
      surface: colors.surface,
      error: colors.error,
    }
  };

  return <PaperProvider theme={paperTheme}>{children}</PaperProvider>;
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState } from 'react';
import AnimatedSplashScreen from '../components/AnimatedSplashScreen';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <PaperThemeWrapper>
            <Stack screenOptions={{ headerShown: false }} />
            {showSplash && <AnimatedSplashScreen onFinish={() => setShowSplash(false)} />}
          </PaperThemeWrapper>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
