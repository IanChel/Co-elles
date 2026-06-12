import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function UserAvatar({ name = "User", imageUrl, size = 48, verified = false }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[
        styles.avatar, 
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primaryLight }
      ]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
        ) : (
          <Text style={[styles.initial, { color: colors.primary, fontSize: size * 0.4 }]}>
            {name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      
      {verified && (
        <View style={[
          styles.badge, 
          { backgroundColor: colors.success, borderColor: colors.surface }
        ]}>
          <MaterialCommunityIcons name="shield-check" size={size * 0.25} color="#FFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initial: {
    fontFamily: 'Inter_700Bold',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    borderWidth: 2,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
