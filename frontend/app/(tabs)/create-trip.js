import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import BrandHeader from '../../components/BrandHeader';
import SuccessModal from '../../components/SuccessModal';
import SOSFloatingButton from '../../components/SOSFloatingButton';

export default function CreateTripScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('3');
  const [price, setPrice] = useState('15');
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePublish = () => {
    // Afficher la modale de succès
    setShowSuccess(true);
    
    // Redirection après publication
    setTimeout(() => {
      setShowSuccess(false);
      router.push('/(tabs)/home');
    }, 2500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader title="Proposer un trajet" subtitle="Partagez votre route en toute sécurité avec d'autres femmes." />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: SPACING.md }]} showsVerticalScrollIndicator={false}>

        {/* TRIP CARD */}
        <View style={[
          styles.card, 
          { backgroundColor: colors.surface },
          !isDarkMode && SHADOWS.light
        ]}>
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Itinéraire</Text>

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

        </View>

        {/* DATE & TIME CARD */}
        <View style={[
          styles.card, 
          { backgroundColor: colors.surface },
          !isDarkMode && SHADOWS.light
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Horaire</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <CustomInput
                icon="calendar-month-outline"
                placeholder="Date"
                value={date}
                onChangeText={setDate}
                style={{ marginBottom: 0 }}
              />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <CustomInput
                icon="clock-outline"
                placeholder="Heure"
                value={time}
                onChangeText={setTime}
                style={{ marginBottom: 0 }}
              />
            </View>
          </View>
        </View>

        {/* DETAILS CARD */}
        <View style={[
          styles.card, 
          { backgroundColor: colors.surface },
          !isDarkMode && SHADOWS.light
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Détails</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Places libres</Text>
              <CustomInput
                icon="seat-passenger"
                placeholder="3"
                value={seats}
                onChangeText={setSeats}
                keyboardType="numeric"
                style={{ marginBottom: 0 }}
              />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Prix par place</Text>
              <CustomInput
                icon="currency-eur"
                placeholder="15"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={{ marginBottom: 0 }}
              />
            </View>
          </View>
        </View>

        <CustomButton 
          title="Publier le trajet" 
          onPress={handlePublish} 
          style={{ marginTop: SPACING.xl, marginBottom: SPACING.xxl }}
        />

      </ScrollView>
      
      {/* Bouton SOS Flottant persistant */}
      <SOSFloatingButton />
      
      <SuccessModal 
        visible={showSuccess} 
        title="Trajet publié" 
        message="Votre trajet a été ajouté avec succès." 
        onClose={() => setShowSuccess(false)} 
      />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingTop: 60,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.hero,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Inter_400Regular',
    marginTop: SPACING.xs,
    lineHeight: 22,
  },
  card: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
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
  row: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
    marginLeft: 4,
  }
});
