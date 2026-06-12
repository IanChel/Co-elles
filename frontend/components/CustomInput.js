import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

export default function CustomInput({ 
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false, 
  keyboardType = 'default',
  autoCapitalize = 'none',
  style
}) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[
      styles.container, 
      { backgroundColor: colors.inputBackground },
      isFocused && { borderColor: colors.primary, borderWidth: 1.5 },
      !isFocused && { borderColor: 'transparent', borderWidth: 1.5 },
      style
    ]}>
      {icon && (
        <MaterialCommunityIcons 
          name={icon} 
          size={22} 
          color={isFocused ? colors.primary : colors.textSecondary} 
          style={styles.icon}
        />
      )}
      
      <TextInput
        style={[
          styles.input, 
          { color: colors.text, fontFamily: 'Inter_500Medium' }
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {secureTextEntry && (
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
          <MaterialCommunityIcons 
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
            size={22} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    height: '100%',
  },
  eyeIcon: {
    padding: SPACING.xs,
  }
});
