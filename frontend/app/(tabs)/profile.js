import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Avatar, Card, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import { useFocusEffect, useRouter } from 'expo-router';
import api from '../../services/api';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [tripCount, setTripCount] = useState('-');

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon="account" style={styles.avatar} color="#FFF" />
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        {user?.isKYCVerified ? (
          <View style={styles.badgeContainer}>
            <MaterialCommunityIcons name="check-decagram" size={20} color={COLORS.success} />
            <Text style={styles.badgeText}>Profil Vérifié</Text>
          </View>
        ) : (
          <View style={styles.badgeContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color={COLORS.error} />
            <Text style={[styles.badgeText, { color: COLORS.error }]}>Non vérifié</Text>
          </View>
        )}
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
  avatar: {
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
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
