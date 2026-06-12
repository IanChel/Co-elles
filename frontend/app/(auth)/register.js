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

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { colors } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !phone || !email || !password) {
      setErrorMsg("Veuillez remplir tous les champs");
      return;
    }
    
    setLoading(true);
    setErrorMsg('');

    try {
      await register(email, password, { firstName, lastName, phone });
      router.replace('/(tabs)/home');
    } catch (error) {
      setErrorMsg("Une erreur est survenue lors de l'inscription");
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
          <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}>
            <MaterialCommunityIcons name="shield-account" size={50} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            Rejoignez-nous
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
            Créez votre compte en 2 minutes.
          </Text>
        </View>

        {/* FORM AREA */}
        <View style={styles.formContainer}>
          {errorMsg ? <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text> : null}

          <View style={styles.row}>
            <View style={styles.flex1}>
              <CustomInput
                icon="account-outline"
                placeholder="Prénom"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View style={{ width: SPACING.md }} />
            <View style={styles.flex1}>
              <CustomInput
                placeholder="Nom"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <CustomInput
            icon="phone-outline"
            placeholder="Numéro de téléphone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

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

          <CustomButton 
            title="Créer mon compte" 
            onPress={handleRegister} 
            loading={loading} 
            style={{ marginTop: SPACING.md }}
          />

        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Déjà membre ? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={[styles.footerLink, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Se connecter
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
    marginBottom: SPACING.xl,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZES.title,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONT_SIZES.body,
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontFamily: 'Inter_500Medium',
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
