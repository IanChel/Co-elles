import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

export default function CreateTripScreen() {
  const router = useRouter();

  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('3');
  const [price, setPrice] = useState('15');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleCreateTrip = async () => {
    if (!departureCity || !arrivalCity || !date || !time || !seats || !price) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }
    setErrorMsg('');
    setLoading(true);
    setSuccessMsg(false);

    try {
      await api.post('/trips', {
        departureCity,
        arrivalCity,
        date,
        time,
        seats: parseInt(seats, 10),
        price: parseFloat(price)
      });
      
      setSuccessMsg(true);
      // Réinitialiser le formulaire
      setDepartureCity('');
      setArrivalCity('');
      setDate('');
      setTime('');
      
      // Rediriger vers l'accueil après 2 secondes
      setTimeout(() => {
        router.push('/(tabs)/home');
      }, 2000);

    } catch (error) {
      setErrorMsg("Erreur lors de la création du trajet. Vérifiez votre connexion.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Proposer un trajet</Text>
      <Text style={styles.subtitle}>Partagez votre route en toute sécurité avec d'autres femmes.</Text>

      <View style={styles.formCard}>
        <TextInput
          label="Ville de départ"
          value={departureCity}
          onChangeText={setDepartureCity}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="map-marker" color={COLORS.primary} />}
          theme={{ colors: { primary: COLORS.primary } }}
        />

        <TextInput
          label="Ville d'arrivée"
          value={arrivalCity}
          onChangeText={setArrivalCity}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="flag-checkered" color={COLORS.accent} />}
          theme={{ colors: { primary: COLORS.primary } }}
        />

        <View style={styles.row}>
          <TextInput
            label="Date (ex: 16/06)"
            value={date}
            onChangeText={setDate}
            mode="outlined"
            style={[styles.input, { flex: 1, marginRight: SPACING.sm }]}
            left={<TextInput.Icon icon="calendar" />}
            theme={{ colors: { primary: COLORS.primary } }}
          />
          <TextInput
            label="Heure (ex: 08:30)"
            value={time}
            onChangeText={setTime}
            mode="outlined"
            style={[styles.input, { flex: 1, marginLeft: SPACING.sm }]}
            left={<TextInput.Icon icon="clock-outline" />}
            theme={{ colors: { primary: COLORS.primary } }}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            label="Places (1-4)"
            value={seats}
            onChangeText={setSeats}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, { flex: 1, marginRight: SPACING.sm }]}
            left={<TextInput.Icon icon="seat-passenger" />}
            theme={{ colors: { primary: COLORS.primary } }}
          />
          <TextInput
            label="Prix total (€)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, { flex: 1, marginLeft: SPACING.sm }]}
            left={<TextInput.Icon icon="currency-eur" />}
            theme={{ colors: { primary: COLORS.primary } }}
          />
        </View>

        {errorMsg ? (
          <HelperText type="error" visible={!!errorMsg} style={styles.feedbackText}>
            {errorMsg}
          </HelperText>
        ) : null}

        {successMsg ? (
          <HelperText type="info" visible={successMsg} style={[styles.feedbackText, { color: COLORS.success }]}>
            Trajet publié avec succès ! Redirection...
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleCreateTrip}
          loading={loading}
          disabled={loading || successMsg}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={COLORS.primary}
        >
          Publier le trajet
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    marginTop: SPACING.sm,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  feedbackText: {
    fontSize: 14,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  }
});
