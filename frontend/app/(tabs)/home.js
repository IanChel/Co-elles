import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, ActivityIndicator, Chip, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTrips = async () => {
    try {
      setErrorMsg('');
      const response = await api.get('/trips');
      setTrips(response.data);
    } catch (error) {
      setErrorMsg("Impossible de charger les trajets. Vérifiez votre connexion.");
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // useFocusEffect permet de recharger les trajets à chaque fois qu'on affiche cet écran
  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  const renderTrip = ({ item }) => {
    const availableSeats = item.seats - item.passengers.length;
    const driverName = item.driver?.firstName || 'Conductrice';

    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => router.push(`/trip-details?id=${item._id}`)}>
        <Card style={styles.tripCard} mode="elevated">
          <Card.Content>
            {/* Header : Villes et Prix */}
            <View style={styles.tripHeader}>
              <View style={styles.citiesContainer}>
                <Text style={styles.cityText}>{item.departureCity}</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.textSecondary} style={styles.arrow} />
                <Text style={styles.cityText}>{item.arrivalCity}</Text>
              </View>
              <Text style={styles.priceText}>{item.price} €</Text>
            </View>

            {/* Date et Heure */}
            <View style={styles.dateTimeContainer}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color={COLORS.primary} />
              <Text style={styles.dateTimeText}>{item.date} à {item.time}</Text>
            </View>

            {/* Footer : Conductrice et Places */}
            <View style={styles.tripFooter}>
              <View style={styles.driverInfo}>
                <Avatar.Icon size={32} icon="account" style={{ backgroundColor: COLORS.accent }} color="#FFF" />
                <Text style={styles.driverName}>{driverName}</Text>
                {item.driver?.isKYCVerified && (
                  <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.success} style={{ marginLeft: 4 }} />
                )}
              </View>
              
              <Chip icon="seat-passenger" textStyle={styles.chipText} style={[styles.seatsChip, availableSeats === 0 && { backgroundColor: COLORS.error + '33' }]}>
                {availableSeats > 0 ? `${availableSeats} places libres` : 'Complet'}
              </Chip>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trajets disponibles</Text>
        <Text style={styles.subtitle}>Rejoignez une conductrice vérifiée</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : errorMsg ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Button mode="contained" onPress={fetchTrips} style={{ marginTop: SPACING.md }}>Réessayer</Button>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="car-off" size={64} color={COLORS.border} />
          <Text style={styles.emptyText}>Aucun trajet proposé pour le moment.</Text>
          <Text style={styles.emptySubText}>Soyez la première à publier un trajet !</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item._id}
          renderItem={renderTrip}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: 60, // Pour la barre de statut (sur mobile)
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100, // Espace pour la barre de navigation
  },
  tripCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  citiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityText: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  arrow: {
    marginHorizontal: SPACING.sm,
  },
  priceText: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateTimeText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverName: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seatsChip: {
    backgroundColor: COLORS.primary + '22',
  },
  chipText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    fontSize: FONT_SIZES.body,
  },
  emptyText: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  }
});
