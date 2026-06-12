import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Avatar, Chip, ActivityIndicator, Button, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

export default function MyTripsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState('passenger'); // 'passenger' ou 'driver'
  const [bookings, setBookings] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      if (tab === 'passenger') {
        const res = await api.get('/bookings/my');
        setBookings(res.data);
      } else {
        const res = await api.get('/bookings/my-trips');
        setMyTrips(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [tab])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCancel = (bookingId) => {
    Alert.alert(
      'Annuler la réservation',
      'Êtes-vous sûre de vouloir annuler votre réservation ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/bookings/${bookingId}/cancel`);
              Alert.alert('Succès', 'Réservation annulée.');
              fetchData();
            } catch (error) {
              Alert.alert('Erreur', error.response?.data?.message || 'Impossible d\'annuler.');
            }
          },
        },
      ]
    );
  };

  // --- Rendu d'une réservation (onglet Passagère) ---
  const renderBooking = ({ item }) => {
    const trip = item.trip;
    if (!trip) return null;

    const isCancelled = item.status === 'cancelled';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/trip-details?id=${trip._id}`)}
      >
        <Card style={[styles.tripCard, isCancelled && styles.cancelledCard]} mode="elevated">
          <Card.Content>
            <View style={styles.tripHeader}>
              <View style={styles.citiesContainer}>
                <Text style={styles.cityText}>{trip.departureCity}</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.textSecondary} style={styles.arrow} />
                <Text style={styles.cityText}>{trip.arrivalCity}</Text>
              </View>
              <Text style={styles.priceText}>{trip.price} €</Text>
            </View>

            <View style={styles.dateTimeContainer}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color={COLORS.primary} />
              <Text style={styles.dateTimeText}>{trip.date} à {trip.time}</Text>
            </View>

            <View style={styles.tripFooter}>
              <View style={styles.driverInfo}>
                <Avatar.Icon size={28} icon="account" style={{ backgroundColor: COLORS.accent }} color="#FFF" />
                <Text style={styles.driverName}>{trip.driver?.firstName || 'Conductrice'}</Text>
                {trip.driver?.isKYCVerified && (
                  <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.success} style={{ marginLeft: 4 }} />
                )}
              </View>

              {isCancelled ? (
                <Chip icon="close-circle" textStyle={{ fontSize: 11, color: COLORS.error, fontWeight: 'bold' }} style={{ backgroundColor: COLORS.error + '22' }}>
                  Annulée
                </Chip>
              ) : (
                <Button
                  mode="outlined"
                  textColor={COLORS.error}
                  style={{ borderColor: COLORS.error }}
                  compact
                  onPress={() => handleCancel(item._id)}
                >
                  Annuler
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  // --- Rendu d'un trajet proposé (onglet Conductrice) ---
  const renderMyTrip = ({ item }) => {
    const passengerCount = item.passengers?.length || 0;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/trip-details?id=${item._id}`)}
      >
        <Card style={styles.tripCard} mode="elevated">
          <Card.Content>
            <View style={styles.tripHeader}>
              <View style={styles.citiesContainer}>
                <Text style={styles.cityText}>{item.departureCity}</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.textSecondary} style={styles.arrow} />
                <Text style={styles.cityText}>{item.arrivalCity}</Text>
              </View>
              <Text style={styles.priceText}>{item.price} €</Text>
            </View>

            <View style={styles.dateTimeContainer}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color={COLORS.primary} />
              <Text style={styles.dateTimeText}>{item.date} à {item.time}</Text>
            </View>

            <View style={styles.tripFooter}>
              <Chip icon="account-group" textStyle={styles.chipText} style={styles.seatsChip}>
                {passengerCount}/{item.seats} passagères
              </Chip>

              <Chip
                icon={item.status === 'open' ? 'check-circle' : item.status === 'full' ? 'close-circle' : 'clock-outline'}
                textStyle={{ fontSize: 11, fontWeight: 'bold', color: item.status === 'open' ? COLORS.success : item.status === 'full' ? COLORS.error : COLORS.textSecondary }}
                style={{ backgroundColor: item.status === 'open' ? COLORS.success + '22' : item.status === 'full' ? COLORS.error + '22' : COLORS.border }}
              >
                {item.status === 'open' ? 'Ouvert' : item.status === 'full' ? 'Complet' : item.status}
              </Chip>
            </View>

            {/* Liste des passagères */}
            {passengerCount > 0 && (
              <View style={styles.passengersSection}>
                {item.passengers.map((p, index) => (
                  <View key={p._id || index} style={styles.passengerRow}>
                    <Avatar.Icon size={24} icon="account" style={{ backgroundColor: COLORS.primaryLight }} color={COLORS.primary} />
                    <Text style={styles.passengerName}>{p.firstName} {p.lastName}</Text>
                    {p.phone ? <Text style={styles.passengerPhone}>📞 {p.phone}</Text> : null}
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const data = tab === 'passenger' ? bookings : myTrips;
  const renderFn = tab === 'passenger' ? renderBooking : renderMyTrip;
  const emptyIcon = tab === 'passenger' ? 'ticket-outline' : 'steering';
  const emptyText = tab === 'passenger'
    ? "Vous n'avez pas encore réservé de trajet."
    : "Vous n'avez pas encore proposé de trajet.";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Trajets</Text>
        <Text style={styles.subtitle}>Suivez vos réservations et trajets proposés</Text>
      </View>

      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            { value: 'passenger', label: '🎫 Passagère', style: tab === 'passenger' ? styles.activeTab : {} },
            { value: 'driver', label: '🚗 Conductrice', style: tab === 'driver' ? styles.activeTab : {} },
          ]}
          style={styles.segmented}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : data.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name={emptyIcon} size={64} color={COLORS.border} />
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={renderFn}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: SPACING.lg,
    paddingTop: 60,
    backgroundColor: COLORS.surface,
  },
  title: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, marginTop: 2 },

  tabContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  segmented: {},
  activeTab: { backgroundColor: COLORS.primaryLight },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  listContent: { padding: SPACING.md, paddingBottom: 100 },

  tripCard: { marginBottom: SPACING.md, backgroundColor: COLORS.surface, borderRadius: 12 },
  cancelledCard: { opacity: 0.6 },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  citiesContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cityText: { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', color: COLORS.text },
  arrow: { marginHorizontal: SPACING.sm },
  priceText: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.primary },

  dateTimeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  dateTimeText: { marginLeft: SPACING.xs, fontSize: FONT_SIZES.body, color: COLORS.textSecondary },

  tripFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm,
  },
  driverInfo: { flexDirection: 'row', alignItems: 'center' },
  driverName: { marginLeft: SPACING.sm, fontSize: FONT_SIZES.body, fontWeight: 'bold', color: COLORS.text },

  seatsChip: { backgroundColor: COLORS.primary + '22' },
  chipText: { fontSize: 12, color: COLORS.primary, fontWeight: 'bold' },

  passengersSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  passengerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  passengerName: { marginLeft: SPACING.sm, fontSize: FONT_SIZES.body, color: COLORS.text },
  passengerPhone: { marginLeft: 'auto', fontSize: FONT_SIZES.caption, color: COLORS.textSecondary },

  emptyText: { fontSize: FONT_SIZES.subtitle, color: COLORS.textSecondary, marginTop: SPACING.md, fontWeight: 'bold', textAlign: 'center' },
});
