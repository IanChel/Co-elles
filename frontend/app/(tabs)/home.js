import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import CustomButton from '../../components/CustomButton';
import TripCard from '../../components/TripCard';
import SOSFloatingButton from '../../components/SOSFloatingButton';
import FilterBottomSheet from '../../components/FilterBottomSheet';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  
  const bottomSheetRef = useRef(null);
  
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [filters, setFilters] = useState({
    departure: '',
    arrival: '',
    date: null,
    minSeats: 1
  });

  const fetchTrips = async () => {
    try {
      setErrorMsg('');
      const response = await api.get('/trips');
      setTrips(response.data);
    } catch (error) {
      setErrorMsg("Impossible de charger les trajets. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };
  
  // Filtrage dynamique ultra-rapide côté client
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      // Sécurité : au cas où la ville est undefined
      const depCity = trip.departureCity || "";
      const arrCity = trip.arrivalCity || "";
      
      const matchDeparture = !filters.departure || depCity.toLowerCase().includes(filters.departure.toLowerCase());
      const matchArrival = !filters.arrival || arrCity.toLowerCase().includes(filters.arrival.toLowerCase());
      
      // Assouplissement de la date : on compare juste si la chaîne est incluse ou si la date correspond approximativement
      // (Car le backend peut renvoyer "DD/MM/YYYY" et le filter "YYYY-MM-DD")
      let matchDate = true;
      if (filters.date) {
        // Ex: filtres.date = "2026-06-12"
        const filterDateStr = filters.date; 
        const tripDateStr = trip.date || "";
        // Si trip.date = "12/06/2026", on peut reformer "2026-06-12" ou vérifier l'inclusion
        const [year, month, day] = filterDateStr.split('-');
        const formattedFilterFR = `${day}/${month}/${year}`;
        
        matchDate = tripDateStr === filterDateStr || tripDateStr === formattedFilterFR || tripDateStr.includes(formattedFilterFR);
      }
      
      const availableSeats = trip.seats - (trip.passengers?.length || 0);
      const matchSeats = availableSeats >= (filters.minSeats || 1);
      
      return matchDeparture && matchArrival && matchSeats && matchDate;
    });
  }, [trips, filters]);

  const openFilters = () => {
    bottomSheetRef.current?.expand();
  };

  const hasActiveFilters = filters.departure || filters.arrival || filters.date || filters.minSeats > 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Découvrez</Text>
        <Text style={[styles.subtitle, { color: colors.primary }]}>Votre prochain trajet 🚗</Text>
        
        {/* Barre de Recherche type Airbnb */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={[
            styles.searchBar, 
            { backgroundColor: colors.surface, borderColor: colors.border },
            !isDarkMode && SHADOWS.medium
          ]}
          onPress={openFilters}
        >
          <MaterialCommunityIcons name="magnify" size={24} color={colors.text} />
          <View style={styles.searchBarTextContainer}>
            <Text style={[styles.searchBarTitle, { color: colors.text }]}>
              {filters.departure || filters.arrival ? 
                `${filters.departure || 'Partout'} → ${filters.arrival || 'Partout'}` : 
                'Où allez-vous ?'}
            </Text>
            <Text style={[styles.searchBarSubtitle, { color: colors.textSecondary }]}>
              {filters.date ? new Date(filters.date).toLocaleDateString('fr-FR') : 'N\'importe quand'} • {filters.minSeats} place(s)
            </Text>
          </View>
          {hasActiveFilters && (
            <View style={[styles.activeFilterBadge, { backgroundColor: colors.primary }]} />
          )}
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : errorMsg ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
          <CustomButton title="Réessayer" onPress={fetchTrips} style={{ marginTop: SPACING.lg, width: 200 }} />
        </View>
      ) : filteredTrips.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={[styles.emptyCircle, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name={hasActiveFilters ? "filter-variant-remove" : "car-off"} size={60} color={colors.border} />
          </View>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {hasActiveFilters ? "Aucun résultat" : "Aucun trajet proposé"}
          </Text>
          <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
            {hasActiveFilters ? "Essayez de modifier vos filtres." : "Soyez la première à publier un trajet !"}
          </Text>
          {hasActiveFilters && (
            <CustomButton 
              title="Réinitialiser" 
              onPress={() => setFilters({ departure: '', arrival: '', date: null, minSeats: 1 })} 
              style={{ marginTop: SPACING.xl, width: 200 }} 
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TripCard 
              trip={item} 
              onPress={() => router.push(`/trip-details?id=${item._id}`)} 
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Bouton SOS Flottant persistant */}
      <SOSFloatingButton />

      {/* Bottom Sheet de Filtrage */}
      <FilterBottomSheet 
        bottomSheetRef={bottomSheetRef} 
        initialFilters={filters} 
        onApply={setFilters} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.hero,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: FONT_SIZES.title,
    fontFamily: 'Inter_600SemiBold',
    marginTop: -4,
    marginBottom: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  searchBarTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  searchBarTitle: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Inter_600SemiBold',
  },
  searchBarSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  activeFilterBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: SPACING.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: 100, // Espace pour tabs
  },
  errorText: {
    textAlign: 'center',
    fontSize: FONT_SIZES.body,
    fontFamily: 'Inter_500Medium',
  },
  emptyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.title,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySubText: {
    fontSize: FONT_SIZES.body,
    marginTop: SPACING.xs,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  }
});
