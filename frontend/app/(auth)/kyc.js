import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ActivityIndicator, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

export default function KYCScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1); 
  // 1: Info, 2: Upload ID, 3: Selfie, 4: Verifying, 5: Success
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const handleSimulateIDUpload = () => {
    setStep(3);
  };

  const handleSimulateSelfieUpload = () => {
    setStep(4);
    // Simuler le délai de vérification biométrique
    setTimeout(() => {
      setStep(5);
    }, 3500);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <MaterialCommunityIcons name="shield-check" size={80} color={COLORS.primary} style={styles.icon} />
            <Text style={styles.subtitle}>Sécurité avant tout</Text>
            <Text style={styles.description}>
              Co-Elles est 100% féminin et sécurisé. Avant de pouvoir utiliser l'application, nous devons procéder à une vérification d'identité en deux étapes.
            </Text>
            <Button mode="contained" onPress={() => setStep(2)} style={styles.button} buttonColor={COLORS.primary}>
              Démarrer la vérification
            </Button>
            <Button mode="text" onPress={() => router.push('/(auth)/login')} style={styles.linkButton} textColor={COLORS.textSecondary}>
              Plus tard (Retour)
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <MaterialCommunityIcons name="card-account-details-outline" size={80} color={COLORS.primary} style={styles.icon} />
            <Text style={styles.subtitle}>Étape 1 : Pièce d'identité</Text>
            <Text style={styles.description}>
              Prenez en photo votre passeport, carte d'identité ou carte de séjour. L'image doit être claire et lisible.
            </Text>
            
            <Card style={styles.mockUploadCard} onPress={handleSimulateIDUpload}>
              <Card.Content style={styles.cardContent}>
                <MaterialCommunityIcons name="camera-plus" size={40} color={COLORS.textSecondary} />
                <Text style={styles.cardText}>[MOCK] Scanner la pièce d'identité</Text>
              </Card.Content>
            </Card>
          </>
        );
      case 3:
        return (
          <>
            <MaterialCommunityIcons name="face-recognition" size={80} color={COLORS.accent} style={styles.icon} />
            <Text style={styles.subtitle}>Étape 2 : Selfie de sécurité</Text>
            <Text style={styles.description}>
              Placez votre visage dans le cadre pour prouver que vous êtes bien la personne sur le document.
            </Text>
            
            <Card style={[styles.mockUploadCard, { borderColor: COLORS.accent }]} onPress={handleSimulateSelfieUpload}>
              <Card.Content style={styles.cardContent}>
                <MaterialCommunityIcons name="camera-front" size={40} color={COLORS.textSecondary} />
                <Text style={styles.cardText}>[MOCK] Prendre le selfie</Text>
              </Card.Content>
            </Card>
          </>
        );
      case 4:
        return (
          <View style={styles.centerBox}>
            <ActivityIndicator animating={true} color={COLORS.primary} size="large" />
            <Text style={[styles.subtitle, { marginTop: SPACING.lg }]}>Analyse biométrique...</Text>
            <Text style={styles.description}>
              Comparaison de votre selfie avec votre pièce d'identité via nos algorithmes sécurisés.
            </Text>
          </View>
        );
      case 5:
        return (
          <View style={styles.centerBox}>
            <MaterialCommunityIcons name="check-decagram" size={80} color={COLORS.success} style={styles.icon} />
            <Text style={styles.subtitle}>Profil Vérifié !</Text>
            <Text style={styles.description}>
              Tout correspond. Vous êtes maintenant une membre certifiée de la communauté Co-Elles.
            </Text>
            <Button mode="contained" onPress={() => router.push('/(auth)/login')} style={styles.button} buttonColor={COLORS.success}>
              Me connecter
            </Button>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderStep()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  icon: {
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.title,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    lineHeight: 22,
  },
  button: {
    marginTop: SPACING.md,
    width: '100%',
    borderRadius: 8,
    paddingVertical: 4,
  },
  linkButton: {
    marginTop: SPACING.md,
  },
  mockUploadCard: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
    marginTop: SPACING.md,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    textAlign: 'center',
  },
  centerBox: {
    alignItems: 'center',
    width: '100%',
  }
});
