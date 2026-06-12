import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import BrandLogo from '../../components/BrandLogo';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
      // Redirection gérée automatiquement par _layout si user change
      router.replace('/(tabs)/home');
    } catch (error) {
      setErrorMsg("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* LOGO AREA */}
        <View style={styles.logoContainer}>
          <BrandLogo size={140} style={{ marginBottom: SPACING.md }} />
          <Text style={[styles.tagline, { color: colors.textSecondary, fontFamily: 'Inter_400Regular', textAlign: 'center' }]}>
            Voyagez entre femmes en toute confiance.
          </Text>
        </View>

        {/* FORM AREA */}
        <View style={styles.formContainer}>
          {errorMsg ? <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text> : null}

          <CustomInput
            icon="email-outline"
            placeholder="Adresse email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <CustomInput
            icon="lock-outline"
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>

          <CustomButton 
            title="Se connecter" 
            onPress={handleLogin} 
            loading={loading} 
            style={{ marginTop: SPACING.md }}
          />

          {/* SECURITY TRUST BADGE */}
          <View style={styles.trustBadge}>
            <MaterialCommunityIcons name="lock-check" size={16} color={colors.success} />
            <Text style={[styles.trustText, { color: colors.textSecondary }]}>Connexion sécurisée et chiffrée</Text>
          </View>

        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Nouveau sur Co-Elles ? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={[styles.footerLink, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Créer un compte
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZES.hero,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONT_SIZES.body,
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontFamily: 'Inter_500Medium',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.caption,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  trustText: {
    fontSize: 12,
    marginLeft: 6,
    fontFamily: 'Inter_400Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Inter_400Regular',
  },
  footerLink: {
    fontSize: FONT_SIZES.body,
  },
});
