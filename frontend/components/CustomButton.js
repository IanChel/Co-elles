import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CustomButton({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  icon = null,
  style
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress} 
      disabled={disabled || loading}
      style={[
        styles.shadowContainer, 
        SHADOWS.medium, 
        { shadowColor: colors.primary },
        (disabled || loading) && styles.disabled,
        style
      ]}
    >
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            {icon && <MaterialCommunityIcons name={icon} size={20} color="#FFFFFF" style={styles.icon} />}
            <Text style={styles.title}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    borderRadius: BORDER_RADIUS.full,
    marginVertical: SPACING.sm,
  },
  gradient: {
    flexDirection: 'row',
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.body,
    fontFamily: 'Inter_600SemiBold',
  },
  icon: {
    marginRight: SPACING.sm,
  },
  disabled: {
    opacity: 0.6,
  }
});
