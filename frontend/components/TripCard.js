import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import UserAvatar from './UserAvatar';

export default function TripCard({ trip, onPress }) {
  const { colors, isDarkMode } = useTheme();

  if (!trip) return null;

  const availableSeats = trip.seats - (trip.passengers?.length || 0);
  const driverName = trip.driver?.firstName || 'Conductrice';
  const driverVerified = trip.driver?.isKYCVerified || false;

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress}
      style={[
        styles.tripCard, 
        { backgroundColor: colors.surface },
        !isDarkMode && SHADOWS.light 
      ]}
    >
      {/* Header : Villes et Prix */}
      <View style={styles.tripHeader}>
        <View style={styles.citiesContainer}>
          <Text style={[styles.cityText, { color: colors.text }]}>{trip.departureCity}</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.textSecondary} style={styles.arrow} />
          <Text style={[styles.cityText, { color: colors.text }]}>{trip.arrivalCity}</Text>
        </View>
        <View style={[styles.priceTag, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.priceText, { color: colors.primary }]}>{trip.price} €</Text>
        </View>
      </View>

      {/* Date et Heure */}
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateBadge}>
          <MaterialCommunityIcons name="calendar-month-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.dateTimeText, { color: colors.textSecondary }]}>{trip.date}</Text>
        </View>
        <View style={styles.dateBadge}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.dateTimeText, { color: colors.textSecondary }]}>{trip.time}</Text>
        </View>
      </View>

      {/* Footer : Conductrice et Places */}
      <View style={[styles.tripFooter, { borderTopColor: colors.border }]}>
        <View style={styles.driverInfo}>
          <View style={styles.avatarContainer}>
            <UserAvatar name={driverName} avatarPath={trip.driver?.avatar} verified={driverVerified} size={40} />
          </View>
          <View>
            <Text style={[styles.driverName, { color: colors.text }]}>{driverName}</Text>
            <Text style={[styles.driverRating, { color: colors.textSecondary }]}>
              ⭐ 4.9 (12 avis)
            </Text>
          </View>
        </View>
        
        <View style={[
          styles.seatsBadge, 
          availableSeats === 0 ? { backgroundColor: colors.error + '22' } : { backgroundColor: colors.success + '22' }
        ]}>
          <Text style={[
            styles.seatsText, 
            availableSeats === 0 ? { color: colors.error } : { color: colors.success }
          ]}>
            {availableSeats > 0 ? `${availableSeats} places` : 'Complet'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tripCard: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  citiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityText: {
    fontSize: FONT_SIZES.subtitle,
    fontFamily: 'Inter_600SemiBold',
  },
  arrow: {
    marginHorizontal: SPACING.sm,
  },
  priceTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  priceText: {
    fontSize: FONT_SIZES.subtitle,
    fontFamily: 'Inter_700Bold',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  dateTimeText: {
    marginLeft: 6,
    fontSize: FONT_SIZES.caption,
    fontFamily: 'Inter_500Medium',
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: SPACING.md,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  driverName: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Inter_600SemiBold',
  },
  driverRating: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  seatsBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  seatsText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  }
});
