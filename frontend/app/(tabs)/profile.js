import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api, { API_BASE_URL } from '../../services/api';
import BrandHeader from '../../components/BrandHeader';
import BrandKYCBadge from '../../components/BrandKYCBadge';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [tripCount, setTripCount] = useState('-');
  const [avatarLoading, setAvatarLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshUser();
      
      // Récupérer le nombre de trajets proposés
      api.get('/bookings/my-trips')
        .then(res => setTripCount(res.data.length))
        .catch(() => setTripCount(0));
    }, [])
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  // Construire l'URL complète de l'avatar
  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    // L'avatar est stocké comme "/uploads/avatars/xxx.jpg"
    // On construit l'URL complète avec le base URL du serveur (sans /api)
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${user.avatar}`;
  };

  const handlePickAvatar = () => {
    Alert.alert(
      'Photo de profil',
      'Choisissez une option',
      [
        {
          text: 'Prendre une photo',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Depuis la galerie',
          onPress: () => pickImage('gallery'),
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const pickImage = async (source) => {
    try {
      let result;

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission requise', "Autorisez l'accès à l'appareil photo dans vos réglages.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission requise', "Autorisez l'accès à la galerie dans vos réglages.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur pick image:', error);
      Alert.alert('Erreur', "Impossible de sélectionner l'image.");
    }
  };

  const uploadAvatar = async (imageUri) => {
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });

      await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Rafraîchir les données utilisateur pour récupérer le nouvel avatar
      await refreshUser();
      Alert.alert('Succès ! 📸', 'Votre photo de profil a été mise à jour.');
    } catch (error) {
      console.error('Erreur upload avatar:', error);
      Alert.alert('Erreur', "Impossible de mettre à jour la photo de profil.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const avatarUrl = getAvatarUrl();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <BrandHeader title="Mon Profil" subtitle="Gérer mon compte" />
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: SPACING.md }]}>
        <View style={[styles.header, { paddingTop: 0, paddingBottom: SPACING.md }]}>
          
          {/* Avatar avec bouton d'édition */}
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8} style={styles.avatarWrapper}>
            {avatarLoading ? (
              <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primary }]}>
                <ActivityIndicator size="small" color="#FFF" />
              </View>
            ) : avatarUrl ? (
              <Image 
                source={{ uri: avatarUrl }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.avatarInitial}>
                  {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <MaterialCommunityIcons name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <BrandKYCBadge verified={user?.isKYCVerified} />
        </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="star" size={28} color={COLORS.accent} />
          <Text style={styles.statValue}>{user?.averageRating ? user.averageRating.toFixed(1) : '5.0'}</Text>
          <Text style={styles.statLabel}>{user?.ratingCount || 0} avis</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="car" size={28} color={COLORS.primary} />
          <Text style={styles.statValue}>{tripCount}</Text>
          <Text style={styles.statLabel}>Trajets</Text>
        </View>
      </View>

      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email-outline" size={24} color={COLORS.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Adresse Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="phone-outline" size={24} color={COLORS.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Numéro de téléphone</Text>
              <Text style={styles.infoValue}>{user?.phone || 'Non renseigné'}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        <Button 
          mode="outlined" 
          icon="shield-check-outline" 
          onPress={() => router.push('/(auth)/kyc')}
          style={styles.actionButton}
          textColor={COLORS.primary}
        >
          Refaire la vérification KYC
        </Button>

        <Button 
          mode="contained" 
          icon="logout" 
          onPress={handleLogout} 
          style={styles.logoutButton}
          buttonColor={COLORS.error}
        >
          Se déconnecter
        </Button>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: 80,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  // Avatar styles
  avatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
    elevation: 3,
  },
  name: {
    fontSize: FONT_SIZES.title,
    fontFamily: 'Inter_700Bold',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '22',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: SPACING.xs,
  },
  badgeText: {
    color: COLORS.success,
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 2,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoCard: {
    margin: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoTextContainer: {
    marginLeft: SPACING.md,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: SPACING.sm,
  },
  actionsContainer: {
    padding: SPACING.lg,
    marginTop: 'auto', // Pousse les boutons vers le bas
  },
  actionButton: {
    marginBottom: SPACING.md,
    borderColor: COLORS.primary,
  },
  logoutButton: {
    borderRadius: 8,
  }
});
