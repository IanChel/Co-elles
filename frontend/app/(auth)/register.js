import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🚗 Co-Elles</Text>
      <Text style={styles.subtitle}>Créer un compte</Text>

      {/* TODO J2 : Remplacer par le vrai formulaire */}
      <Text style={styles.placeholder}>Écran Inscription — à implémenter</Text>

      <Button mode="contained" onPress={() => router.push('/(auth)/kyc')} style={styles.button}>
        Passer au KYC
      </Button>
      
      <Button mode="text" onPress={() => router.back()} style={styles.backButton}>
        Retour à la connexion
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  logo: {
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  placeholder: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  button: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    width: '100%',
  },
  backButton: {
    marginTop: SPACING.sm,
  }
});
