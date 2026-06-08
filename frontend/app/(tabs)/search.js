import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Keyboard } from 'react-native';
import { Text, TextInput, Button, Card, Avatar, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

export default function SearchScreen() {
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [date, setDate] = useState('');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async () => {
    Keyboard.dismiss();
    setLoading(true);
    setErrorMsg('');
    setHasSearched(true);

    try {
      // Construction des paramètres dynamiquement pour l'URL
      // Seuls les champs remplis seront envoyés dans la requête
      const params = {};
      if (departureCity.trim()) params.departureCity = departureCity.trim();
      if (arrivalCity.trim()) params.arrivalCity = arrivalCity.trim();
      if (date.trim()) params.date = date.trim();

      const response = await api.get('/trips', { params });
      setResults(response.data);
    } catch (error) {
      setErrorMsg("Erreur lors de la recherche. Veuillez réessayer.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderTrip = ({ item }) => {
    const availableSeats = item.seats - item.passengers.length;
    const driverName = item.driver?.firstName || 'Conductrice';

    return (
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
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rechercher un trajet</Text>
        <Text style={styles.subtitle}>Trouvez votre covoiturage idéal</Text>
      </View>

      <View style={styles.searchForm}>
        <View style={styles.row}>
          <TextInput
            label="Départ"
            value={departureCity}
            onChangeText={setDepartureCity}
            mode="outlined"
            style={[styles.input, { flex: 1, marginRight: SPACING.xs }]}
            left={<TextInput.Icon icon="map-marker" color={COLORS.primary} />}
            theme={{ colors: { primary: COLORS.primary } }}
          />
          <TextInput
            label="Arrivée"
            value={arrivalCity}
            onChangeText={setArrivalCity}
            mode="outlined"
            style={[styles.input, { flex: 1, marginLeft: SPACING.xs }]}
            left={<TextInput.Icon icon="flag-checkered" color={COLORS.accent} />}
            theme={{ colors: { primary: COLORS.primary } }}
          />
        </View>
        <TextInput
          label="Date (optionnel, ex: 16/06)"
          value={date}
          onChangeText={setDate}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="calendar" />}
          theme={{ colors: { primary: COLORS.primary } }}
        />
        
        <Button 
          mode="contained" 
          onPress={handleSearch} 
          loading={loading}
          disabled={loading}
          buttonColor={COLORS.primary}
          style={styles.searchButton}
        >
          Rechercher
        </Button>
      </View>

      {/* RÉSULTATS */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : hasSearched && results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="magnify-close" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>Aucun trajet trouvé</Text>
            <Text style={styles.emptySubText}>Essayez de modifier votre recherche.</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item._id}
            renderItem={renderTrip}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
    paddingTop: 60, 
    backgroundColor: COLORS.surface,
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
  searchForm: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    paddingTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  input: {
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  searchButton: {
    marginTop: SPACING.sm,
    borderRadius: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
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
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    padding: SPACING.lg,
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
  }
});
