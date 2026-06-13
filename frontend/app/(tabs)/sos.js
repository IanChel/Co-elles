import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Alert, Share, Linking, Platform } from 'react-native';
import { Text, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import MapView, { Marker } from 'react-native-maps';
import api from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import BrandHeader from '../../components/BrandHeader';

export default function SOSScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Animation pulsante pour le marqueur SOS
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Lancer la pulsation dès qu'on a la position
  useEffect(() => {
    if (location) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.6,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [location]);

  const requestLocationPermission = async () => {
    setLoading(true);
    setErrorMsg(null);
    setPermissionDenied(false);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setErrorMsg('Permission GPS refusée. Activez la localisation dans vos réglages.');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation.coords);
    } catch (error) {
      setErrorMsg("Impossible de récupérer la position. Vérifiez votre GPS.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (location) {
      await Clipboard.setStringAsync(`${location.latitude}, ${location.longitude}`);
      Alert.alert("Position copiée !", "Les coordonnées ont été copiées dans le presse-papiers.");
    }
  };

  const handleShare = async () => {
    if (location) {
      try {
        await Share.share({
          message: `📍 Je suis ici ! Voici ma position exacte :\nLatitude: ${location.latitude}\nLongitude: ${location.longitude}\n\nLien Maps: https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`,
        });
      } catch (error) {
        Alert.alert("Erreur", "Impossible de partager la position.");
      }
    }
  };

  const openInMaps = () => {
    if (!location) return;
    const { latitude, longitude } = location;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
    });
    Linking.openURL(url).catch(() => {
      // Fallback vers Google Maps web
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
    });
  };

  const handleSOS = async () => {
    if (!location) {
      Alert.alert("Position introuvable", "Impossible d'envoyer l'alerte sans votre position GPS.");
      return;
    }

    setSosLoading(true);
    try {
      await api.post('/sos', {
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setVisible(true);
    } catch (error) {
      Alert.alert("Erreur", "L'alerte n'a pas pu être envoyée.");
      console.log(error);
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BrandHeader title="Urgence SOS 🚨" subtitle="Votre sécurité est notre priorité." />

      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.error} />
            <Text style={{ marginTop: SPACING.md, color: COLORS.textSecondary }}>
              Recherche de votre position GPS...
            </Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="map-marker-off" size={48} color={COLORS.error} />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Button
              mode="contained"
              onPress={permissionDenied ? () => Linking.openSettings() : requestLocationPermission}
              style={{ marginTop: SPACING.lg }}
              buttonColor={COLORS.primary}
              icon={permissionDenied ? 'cog' : 'refresh'}
            >
              {permissionDenied ? 'Ouvrir les réglages' : 'Réessayer'}
            </Button>
          </View>
        ) : location ? (
          <View style={{ flex: 1 }}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Ma position"
                description="Vous êtes ici"
              >
                <View style={styles.markerContainer}>
                  <Animated.View
                    style={[
                      styles.markerPulse,
                      { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({
                        inputRange: [1, 1.6],
                        outputRange: [0.6, 0],
                      })},
                    ]}
                  />
                  <View style={styles.markerDot}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#FFF" />
                  </View>
                </View>
              </Marker>
            </MapView>

            {/* Overlay en bas de la carte avec les coordonnées */}
            <View style={styles.coordsOverlay}>
              <View style={styles.coordsRow}>
                <MaterialCommunityIcons name="crosshairs-gps" size={16} color={COLORS.error} />
                <Text style={styles.coordsText}>
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </Text>
              </View>
              <Button
                mode="text"
                compact
                onPress={openInMaps}
                textColor={COLORS.primary}
                icon="open-in-new"
                labelStyle={{ fontSize: 12 }}
              >
                Ouvrir dans Maps
              </Button>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.actionContainer}>
        <Text style={styles.warningText}>
          En cas de danger, appuyez sur ce bouton. Votre position exacte sera immédiatement transmise à votre contact d'urgence et aux autorités.
        </Text>
        
        {location && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
            <Button 
              icon="content-copy" 
              mode="outlined" 
              onPress={copyToClipboard}
              textColor={COLORS.primary}
              style={{ flex: 1, marginRight: SPACING.sm, borderColor: COLORS.primary }}
            >
              Copier
            </Button>
            <Button 
              icon="share-variant" 
              mode="contained" 
              onPress={handleShare}
              buttonColor={COLORS.primary}
              style={{ flex: 1, marginLeft: SPACING.sm }}
            >
              Partager
            </Button>
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleSOS}
          loading={sosLoading}
          disabled={loading || !location || sosLoading}
          style={styles.sosButton}
          contentStyle={styles.sosButtonContent}
          buttonColor={COLORS.error}
          icon="alert-decagram"
        >
          DÉCLENCHER SOS
        </Button>
      </View>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={5000}
        style={{ backgroundColor: COLORS.success }}
      >
        Alerte envoyée avec succès à votre contact d'urgence !
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: { flex: 1, backgroundColor: '#F0F0F0' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  errorText: { color: COLORS.error, textAlign: 'center', marginTop: SPACING.sm, fontSize: FONT_SIZES.body },

  // Marqueur personnalisé avec pulsation
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  markerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.error,
  },
  markerDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },

  // Overlay coordonnées
  coordsOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordsText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 6,
  },

  actionContainer: { padding: SPACING.xl, backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8, marginTop: -20 },
  warningText: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 22 },
  sosButton: { borderRadius: 30, elevation: 4 },
  sosButtonContent: { paddingVertical: 12, height: 60 }
});
