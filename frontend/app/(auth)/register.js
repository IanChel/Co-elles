import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !phone) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }
    setErrorMsg('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        phone
      });
      
      // Si l'inscription réussit, on a un JWT, on redirige vers le KYC
      if (response.data.token) {
        // Optionnel : on pourrait connecter l'utilisateur ici via AuthContext
        // mais le flow demande de passer au KYC d'abord.
        router.push('/(auth)/kyc');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMsg("Données invalides ou utilisateur existant.");
      } else {
        setErrorMsg("Erreur lors de l'inscription. Le serveur est-il allumé ?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.logo}>🚗 Co-Elles</Text>
        <Text style={styles.subtitle}>Rejoignez la communauté</Text>

        <View style={styles.formContainer}>
          <TextInput
            label="Prénom"
            value={firstName}
            onChangeText={setFirstName}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: COLORS.primary } }}
          />
          <TextInput
            label="Nom"
            value={lastName}
            onChangeText={setLastName}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: COLORS.primary } }}
          />
          <TextInput
            label="Numéro de téléphone"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            theme={{ colors: { primary: COLORS.primary } }}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            theme={{ colors: { primary: COLORS.primary } }}
          />
          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            theme={{ colors: { primary: COLORS.primary } }}
          />

          {errorMsg ? (
            <HelperText type="error" visible={!!errorMsg} style={styles.errorText}>
              {errorMsg}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor={COLORS.primary}
          >
            S'inscrire
          </Button>

          <Button
            mode="text"
            onPress={() => router.push('/(auth)/login')}
            style={styles.linkButton}
            textColor={COLORS.primary}
          >
            Déjà un compte ? Se connecter
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingTop: 60, // Espace pour la status bar si besoin
  },
  logo: {
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  button: {
    marginTop: SPACING.md,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: 14,
  }
});
