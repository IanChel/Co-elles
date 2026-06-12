import React, { useMemo, useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';

export default function FilterBottomSheet({ bottomSheetRef, initialFilters, onApply }) {
  const { colors } = useTheme();
  const snapPoints = useMemo(() => ['70%', '90%'], []);
  
  const [departure, setDeparture] = useState(initialFilters?.departure || '');
  const [arrival, setArrival] = useState(initialFilters?.arrival || '');
  const [date, setDate] = useState(initialFilters?.date ? new Date(initialFilters.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [minSeats, setMinSeats] = useState(initialFilters?.minSeats || 1);

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleApply = () => {
    onApply({
      departure,
      arrival,
      date: date.toISOString().split('T')[0],
      minSeats
    });
    bottomSheetRef.current?.close();
  };

  const handleReset = () => {
    setDeparture('');
    setArrival('');
    setDate(new Date());
    setMinSeats(1);
    onApply({
      departure: '',
      arrival: '',
      date: null,
      minSeats: 1
    });
    bottomSheetRef.current?.close();
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Filtrer les trajets</Text>
        
        {/* Destination Inputs */}
        <View style={styles.inputWrapper}>
          <View style={styles.timeline}>
            <View style={[styles.timelineDot, { borderColor: colors.primary }]} />
            <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
            <View style={[styles.timelineDot, { backgroundColor: colors.primary, borderColor: colors.primary }]} />
          </View>
          <View style={styles.inputs}>
            <CustomInput
              placeholder="Ville de départ"
              value={departure}
              onChangeText={setDeparture}
              style={styles.transparentInput}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <CustomInput
              placeholder="Ville d'arrivée"
              value={arrival}
              onChangeText={setArrival}
              style={styles.transparentInput}
            />
          </View>
        </View>

        {/* Date Picker */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Date de départ</Text>
        {Platform.OS === 'ios' ? (
          <View style={styles.iosDatePicker}>
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.dateButton, { backgroundColor: colors.inputBackground }]}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialCommunityIcons name="calendar" size={24} color={colors.primary} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {date.toLocaleDateString('fr-FR')}
            </Text>
          </TouchableOpacity>
        )}
        
        {showDatePicker && Platform.OS !== 'ios' && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Seats Stepper */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Places disponibles</Text>
        <View style={[styles.stepperContainer, { backgroundColor: colors.inputBackground }]}>
          <TouchableOpacity 
            style={[styles.stepperButton, { backgroundColor: colors.surface }]}
            onPress={() => setMinSeats(Math.max(1, minSeats - 1))}
          >
            <MaterialCommunityIcons name="minus" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.stepperText, { color: colors.text }]}>{minSeats}+ place(s)</Text>
          <TouchableOpacity 
            style={[styles.stepperButton, { backgroundColor: colors.surface }]}
            onPress={() => setMinSeats(Math.min(8, minSeats + 1))}
          >
            <MaterialCommunityIcons name="plus" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={[styles.resetText, { color: colors.textSecondary }]}>Réinitialiser</Text>
          </TouchableOpacity>
          <CustomButton title="Appliquer les filtres" onPress={handleApply} style={styles.applyButton} />
        </View>

      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontFamily: 'Inter_700Bold',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Inter_600SemiBold',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timeline: {
    width: 30,
    alignItems: 'center',
    paddingVertical: 20,
    marginRight: SPACING.sm,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  inputs: {
    flex: 1,
  },
  transparentInput: {
    backgroundColor: 'transparent',
    marginBottom: 0,
    height: 50,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.xs,
  },
  iosDatePicker: {
    alignSelf: 'flex-start',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  dateText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.body,
    fontFamily: 'Inter_500Medium',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperText: {
    fontSize: FONT_SIZES.subtitle,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: SPACING.xl,
  },
  resetButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  resetText: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Inter_600SemiBold',
  },
  applyButton: {
    flex: 2,
    marginBottom: 0,
  }
});
