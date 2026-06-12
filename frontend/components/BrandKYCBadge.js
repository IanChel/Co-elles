import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import BrandLogo from './BrandLogo';

export default function BrandKYCBadge({ verified }) {
  const { colors } = useTheme();

  if (!verified) {
    return (
      <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
        <MaterialCommunityIcons name="shield-alert-outline" size={16} color={colors.error} />
        <Text style={[styles.text, { color: colors.error }]}>Profil non vérifié</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
      <MaterialCommunityIcons name="shield-check" size={16} color={colors.primary} style={{ marginRight: 4 }} />
      <Text style={[styles.text, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
        Profil vérifié Co-Elles
      </Text>
      <MaterialCommunityIcons name="check-decagram" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.pill,
    marginTop: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZES.caption,
    marginLeft: SPACING.xs,
  }
});
