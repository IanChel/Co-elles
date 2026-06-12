import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function SafeBadge({ text = "Profil Vérifié", size = 12 }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.success + '15' }]}>
      <MaterialCommunityIcons name="shield-check" size={size + 2} color={colors.success} />
      <Text style={[styles.text, { color: colors.success, fontSize: size }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 4,
  }
});
