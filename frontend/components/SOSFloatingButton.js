import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SHADOWS } from '../constants/theme';
import { useRouter } from 'expo-router';

export default function SOSFloatingButton() {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={[
        styles.button, 
        { backgroundColor: colors.error },
        !isDarkMode && SHADOWS.medium
      ]}
      onPress={() => router.push('/(tabs)/sos')}
    >
      <MaterialCommunityIcons name="shield-alert" size={28} color="#FFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Ensure it floats above everything
  }
});
