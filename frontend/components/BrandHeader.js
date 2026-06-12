import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';
import BrandLogo from './BrandLogo';

export default function BrandHeader({ title, subtitle, rightComponent, showLogo = true, children }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.row}>
        {showLogo && (
          <View style={styles.logoContainer}>
            <BrandLogo size={60} style={styles.logo} />
          </View>
        )}
        <View style={styles.textContainer}>
          {title && <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>}
          {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>{subtitle}</Text>}
        </View>
        {rightComponent && <View style={styles.rightComponent}>{rightComponent}</View>}
      </View>
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: SPACING.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: SPACING.sm,
    // On compense le padding transparent de l'image
    marginTop: -10,
    marginBottom: -10,
    marginLeft: -10,
  },
  logo: {
    // Aucune marge additionnelle requise
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.subtitle, // Plus petit et élégant
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: FONT_SIZES.caption,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  rightComponent: {
    marginLeft: SPACING.md,
  },
  childrenContainer: {
    marginTop: SPACING.md,
  }
});
