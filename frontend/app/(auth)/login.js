import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }
    setErrorMsg('');
    setLoading(true);
    
    const result = await login(email, password);
    
    if (!result.success) {
      setErrorMsg(result.message);
    } else {
      // Redirection explicite une fois connecté !
      router.replace('/(tabs)/home');
    }
    
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🚗 Co-Elles</Text>
      <Text style={styles.subtitle}>Sécurité & Solidarité</Text>

      <View style={styles.formContainer}>
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
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={COLORS.primary}
        >
          Se connecter
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/(auth)/register')}
          style={styles.linkButton}
          textColor={COLORS.primary}
        >
          Pas encore de compte ? S'inscrire
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SPACING.lg,
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
