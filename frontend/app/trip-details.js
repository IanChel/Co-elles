import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, Platform, Dimensions } from 'react-native';
import { Text, Button, Card, Avatar, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { geocodeCity } from '../services/geocoding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const mapRef = useRef(null);

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [isDriver, setIsDriver] = useState(false);

  // Coordonnées pour la carte
  const [departureCoords, setDepartureCoords] = useState(null);
  const [arrivalCoords, setArrivalCoords] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  // Géocoder les villes une fois le trajet chargé
  useEffect(() => {
    if (trip) {
      loadCoordinates();
    }
  }, [trip]);

  // Ajuster le zoom une fois la carte prête ET les coordonnées disponibles
  useEffect(() => {
    if (mapReady && departureCoords && arrivalCoords && mapRef.current) {
      // Petit délai pour s'assurer que la carte est vraiment rendue (surtout Android)
      setTimeout(() => {
        mapRef.current.fitToCoordinates(
          [departureCoords, arrivalCoords],
          {
            edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
            animated: true,
          }
        );
      }, 100);
    }
  }, [mapReady, departureCoords, arrivalCoords]);

  const loadCoordinates = async () => {
    if (trip?.departureCity) {
      const depCoords = await geocodeCity(trip.departureCity);
      setDepartureCoords(depCoords);
    }
    if (trip?.arrivalCity) {
      const arrCoords = await geocodeCity(trip.arrivalCity);
      setArrivalCoords(arrCoords);
    }
  };

  const fetchTripDetails = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);

      // Vérifier si l'utilisatrice actuelle est la conductrice
      setIsDriver(response.data.driver?._id === user?._id);

      // Vérifier si l'utilisatrice est déjà passagère
      const isPassenger = response.data.passengers?.some(
        (p) => p._id === user?._id
      );
      setAlreadyBooked(isPassenger);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le trajet.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    Alert.alert(
      'Confirmer la réservation',
      `Voulez-vous réserver une place sur ce trajet pour ${trip.price} € ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réserver',
          onPress: async () => {
            setBookingLoading(true);
            try {
              await api.post('/bookings', { tripId: id });
              Alert.alert('Succès ! 🎉', 'Votre place est réservée.');
              setAlreadyBooked(true);
              fetchTripDetails(); // Rafraîchir
            } catch (error) {
              Alert.alert('Erreur', error.response?.data?.message || 'Impossible de réserver.');
            } finally {
              setBookingLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleContact = async () => {
    try {
      const res = await api.post('/messages/conversations', {
        recipientId: trip.driver._id,
        tripId: id,
      });
      const driverName = `${trip.driver.firstName} ${trip.driver.lastName}`;
      router.push(`/chat?conversationId=${res.data._id}&recipientName=${driverName}`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir la conversation.');
      console.log(error);
    }
  };

  const openRouteInMaps = () => {
    if (!departureCoords || !arrivalCoords) return;
    const origin = `${departureCoords.latitude},${departureCoords.longitude}`;
    const destination = `${arrivalCoords.latitude},${arrivalCoords.longitude}`;
    
    const url = Platform.select({
      ios: `maps:0,0?saddr=${origin}&daddr=${destination}`,
      android: `google.navigation:q=${destination}&origin=${origin}`,
    });
    
    Linking.openURL(url).catch(() => {
      // Fallback Google Maps web
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
      );
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={{ color: COLORS.error, marginTop: SPACING.md }}>Trajet introuvable.</Text>
      </View>
    );
  }

  const availableSeats = trip.seats - (trip.passengers?.length || 0);
  const isFull = availableSeats <= 0;
  const hasMapData = departureCoords && arrivalCoords;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* En-tête du trajet */}
      <View style={styles.header}>
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <MaterialCommunityIcons name="circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.routeCity}>{trip.departureCity}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <MaterialCommunityIcons name="map-marker" size={18} color={COLORS.accent} />
            <Text style={styles.routeCity}>{trip.arrivalCity}</Text>
          </View>
        </View>
        <Text style={styles.priceTag}>{trip.price} €</Text>
      </View>

      {/* Mini-carte du trajet */}
      {hasMapData && (
        <View style={styles.mapCard}>
          <MapView
            ref={mapRef}
            style={styles.map}
            onMapReady={() => setMapReady(true)}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            initialRegion={{
              latitude: (departureCoords.latitude + arrivalCoords.latitude) / 2,
              longitude: (departureCoords.longitude + arrivalCoords.longitude) / 2,
              latitudeDelta: Math.abs(departureCoords.latitude - arrivalCoords.latitude) * 2 || 0.5,
              longitudeDelta: Math.abs(departureCoords.longitude - arrivalCoords.longitude) * 2 || 0.5,
            }}
          >
            {/* Marqueur départ */}
            <Marker
              coordinate={departureCoords}
              title={trip.departureCity}
              description="Point de départ"
            >
              <View style={styles.mapMarker}>
                <MaterialCommunityIcons name="circle" size={14} color={COLORS.success} />
              </View>
            </Marker>

            {/* Marqueur arrivée */}
            <Marker
              coordinate={arrivalCoords}
              title={trip.arrivalCity}
              description="Destination"
            >
              <View style={styles.mapMarker}>
                <MaterialCommunityIcons name="map-marker" size={22} color={COLORS.error} />
              </View>
            </Marker>

            {/* Ligne entre les deux points */}
            <Polyline
              coordinates={[departureCoords, arrivalCoords]}
              strokeColor={COLORS.primary}
              strokeWidth={3}
              lineDashPattern={[10, 6]}
            />
          </MapView>

          {/* Bouton "Ouvrir dans Maps" en overlay */}
          <Button
            mode="contained"
            compact
            onPress={openRouteInMaps}
            style={styles.openMapsButton}
            buttonColor={COLORS.primary}
            icon="navigation-variant"
            labelStyle={{ fontSize: 12 }}
          >
            Itinéraire
          </Button>
        </View>
      )}

      {/* Infos du trajet */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={22} color={COLORS.primary} />
            <Text style={styles.infoText}>{trip.date}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={22} color={COLORS.primary} />
            <Text style={styles.infoText}>{trip.time}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="seat-passenger" size={22} color={isFull ? COLORS.error : COLORS.success} />
            <Text style={[styles.infoText, isFull && { color: COLORS.error }]}>
              {isFull ? 'Complet — 0 place restante' : `${availableSeats} place${availableSeats > 1 ? 's' : ''} disponible${availableSeats > 1 ? 's' : ''}`}
            </Text>
          </View>
          {trip.description ? (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="text-box-outline" size={22} color={COLORS.primary} />
                <Text style={styles.infoText}>{trip.description}</Text>
              </View>
            </>
          ) : null}
        </Card.Content>
      </Card>

      {/* Conductrice */}
      <Card style={styles.driverCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Conductrice</Text>
          <View style={styles.driverRow}>
            <Avatar.Icon size={48} icon="account" style={{ backgroundColor: COLORS.accent }} color="#FFF" />
            <View style={styles.driverInfo}>
              <View style={styles.driverNameRow}>
                <Text style={styles.driverName}>
                  {trip.driver?.firstName} {trip.driver?.lastName}
                </Text>
                {trip.driver?.isKYCVerified && (
                  <MaterialCommunityIcons name="check-decagram" size={18} color={COLORS.success} style={{ marginLeft: 6 }} />
                )}
              </View>
              <Text style={styles.driverEmail}>{trip.driver?.email}</Text>
              {trip.driver?.phone ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="phone" size={16} color={COLORS.primary} />
                  <Text style={[styles.driverPhone, { marginLeft: 4 }]}>{trip.driver.phone}</Text>
                </View>
              ) : null}
            </View>
          </View>
          {!isDriver && (
            <Button
              mode="outlined"
              icon="chat"
              onPress={handleContact}
              textColor={COLORS.primary}
              style={{ marginTop: SPACING.md, borderColor: COLORS.primary }}
            >
              Contacter la conductrice
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Passagères */}
      {trip.passengers && trip.passengers.length > 0 && (
        <Card style={styles.passengersCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Passagères ({trip.passengers.length}/{trip.seats})</Text>
            {trip.passengers.map((p, index) => (
              <View key={p._id || index} style={styles.passengerRow}>
                <Avatar.Icon size={32} icon="account" style={{ backgroundColor: COLORS.primaryLight }} color={COLORS.primary} />
                <Text style={styles.passengerName}>{p.firstName} {p.lastName}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Bouton d'action */}
      <View style={styles.actionContainer}>
        {isDriver ? (
          <Chip icon="steering" style={styles.driverChip} textStyle={{ color: COLORS.primary, fontWeight: 'bold' }}>
            Vous êtes la conductrice de ce trajet
          </Chip>
        ) : alreadyBooked ? (
          <Button mode="contained" disabled style={styles.bookedButton} buttonColor={COLORS.success} icon="check-circle">
            Déjà réservé ✓
          </Button>
        ) : isFull ? (
          <Button mode="contained" disabled style={styles.fullButton} buttonColor={COLORS.textSecondary} icon="close-circle">
            Trajet complet
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleBooking}
            loading={bookingLoading}
            disabled={bookingLoading}
            style={styles.bookButton}
            contentStyle={styles.bookButtonContent}
            buttonColor={COLORS.primary}
            icon="ticket-confirmation"
          >
            Réserver ma place — {trip.price} €
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    paddingTop: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  routeContainer: { flex: 1 },
  routePoint: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  routeLine: { width: 2, height: 20, backgroundColor: COLORS.border, marginLeft: 8 },
  routeCity: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.text, marginLeft: SPACING.sm },
  priceTag: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Mini-carte
  mapCard: {
    margin: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: COLORS.surface,
  },
  map: {
    width: '100%',
    height: 200,
  },
  mapMarker: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 4,
    elevation: 3,
  },
  openMapsButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderRadius: 20,
    elevation: 4,
  },

  infoCard: { margin: SPACING.md, backgroundColor: COLORS.surface, borderRadius: 12, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  infoText: { marginLeft: SPACING.md, fontSize: FONT_SIZES.body, color: COLORS.text, flex: 1 },
  divider: { marginVertical: 2 },

  driverCard: { marginHorizontal: SPACING.md, marginBottom: SPACING.md, backgroundColor: COLORS.surface, borderRadius: 12, elevation: 2 },
  sectionTitle: { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', color: COLORS.primary, marginBottom: SPACING.md },
  driverRow: { flexDirection: 'row', alignItems: 'center' },
  driverInfo: { marginLeft: SPACING.md, flex: 1 },
  driverNameRow: { flexDirection: 'row', alignItems: 'center' },
  driverName: { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', color: COLORS.text },
  driverEmail: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, marginTop: 2 },
  driverPhone: { fontSize: FONT_SIZES.body, color: COLORS.text, marginTop: 4 },

  passengersCard: { marginHorizontal: SPACING.md, marginBottom: SPACING.md, backgroundColor: COLORS.surface, borderRadius: 12, elevation: 2 },
  passengerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  passengerName: { marginLeft: SPACING.sm, fontSize: FONT_SIZES.body, color: COLORS.text, fontWeight: '500' },

  actionContainer: { padding: SPACING.lg },
  bookButton: { borderRadius: 30, elevation: 4 },
  bookButtonContent: { paddingVertical: 10, height: 56 },
  bookedButton: { borderRadius: 30 },
  fullButton: { borderRadius: 30 },
  driverChip: { backgroundColor: COLORS.primaryLight, alignSelf: 'center' },
});
