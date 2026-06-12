import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert, Share } from 'react-native';
import { Text, Button, ActivityIndicator, Snackbar, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import api from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import BrandHeader from '../../components/BrandHeader';

export default function SOSScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission GPS refusée.');
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (error) {
        setErrorMsg("Impossible de récupérer la position.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      setVisible(true); // Afficher le message de succès
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
            <Text style={{ marginTop: SPACING.md, color: COLORS.textSecondary }}>Recherche de votre position GPS...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="map-marker-off" size={48} color={COLORS.error} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : location ? (
          <View style={styles.radarContainer}>
            {/* Radar UI pour remplacer la carte native */}
            <View style={styles.radarCircle1}>
              <View style={styles.radarCircle2}>
                <View style={styles.radarCenter}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={40} color={COLORS.white} />
                </View>
              </View>
            </View>
            <Card style={styles.coordsCard}>
              <Card.Content>
                <Text style={styles.coordsTitle}>Position détectée et prête à être envoyée :</Text>
                <Text style={styles.coordsText}>Latitude: {location.latitude.toFixed(5)}</Text>
                <Text style={styles.coordsText}>Longitude: {location.longitude.toFixed(5)}</Text>
              </Card.Content>
            </Card>
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
              Copier Position
            </Button>
            <Button 
              icon="share-variant" 
              mode="contained" 
              onPress={handleShare}
              buttonColor={COLORS.primary}
              style={{ flex: 1, marginLeft: SPACING.sm }}
            >
              Partager Position
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
  header: { padding: SPACING.lg, paddingTop: 60, backgroundColor: COLORS.surface, elevation: 4, zIndex: 10 },
  title: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.error },
  subtitle: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, marginTop: 2 },
  mapContainer: { flex: 1, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  errorText: { color: COLORS.error, textAlign: 'center', marginTop: SPACING.sm, fontSize: FONT_SIZES.body },
  
  radarContainer: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  radarCircle1: { width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(244, 67, 54, 0.1)', justifyContent: 'center', alignItems: 'center' },
  radarCircle2: { width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(244, 67, 54, 0.3)', justifyContent: 'center', alignItems: 'center' },
  radarCenter: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.error, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  coordsCard: { marginTop: SPACING.xl, backgroundColor: 'rgba(255,255,255,0.9)', width: '80%' },
  coordsTitle: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4, textAlign: 'center' },
  coordsText: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },

  actionContainer: { padding: SPACING.xl, backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8, marginTop: -20 },
  warningText: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 22 },
  sosButton: { borderRadius: 30, elevation: 4 },
  sosButtonContent: { paddingVertical: 12, height: 60 }
});
