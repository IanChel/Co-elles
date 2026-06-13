import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../services/api';

/**
 * Construit l'URL complète d'un avatar à partir du chemin relatif stocké en base.
 * @param {string} avatarPath - Ex: "/uploads/avatars/xxx.jpg"
 * @returns {string|null}
 */
export function getFullAvatarUrl(avatarPath) {
  if (!avatarPath) return null;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${avatarPath}`;
}

export default function UserAvatar({ name = "User", imageUrl, avatarPath, size = 48, verified = false }) {
  const { colors } = useTheme();

  // Priorité : imageUrl direct > avatarPath (depuis la BDD)
  const resolvedUrl = imageUrl || getFullAvatarUrl(avatarPath);

  return (
    <View style={styles.container}>
      <View style={[
        styles.avatar, 
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primaryLight }
      ]}>
        {resolvedUrl ? (
          <Image source={{ uri: resolvedUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
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
