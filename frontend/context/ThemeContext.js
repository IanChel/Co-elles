import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [colors, setColors] = useState(isDarkMode ? darkTheme : lightTheme);

  useEffect(() => {
    // Check user preference
    const loadThemePref = async () => {
      const savedTheme = await AsyncStorage.getItem('themePref');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    };
    loadThemePref();
  }, [systemColorScheme]);

  useEffect(() => {
    setColors(isDarkMode ? darkTheme : lightTheme);
  }, [isDarkMode]);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('themePref', newTheme ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
