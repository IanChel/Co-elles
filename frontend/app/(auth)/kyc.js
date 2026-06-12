import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import { API_BASE_URL } from '../../services/api';

export default function KYCScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [token, setToken] = useState(params.token || '');

  // Si on vient du profil, on n'a pas le token dans les paramètres, on va le chercher dans le stockage
  useEffect(() => {
    const fetchToken = async () => {
      if (!token) {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) setToken(storedToken);
      }
    };
    fetchToken();
  }, [token]);
  
  const [step, setStep] = useState(1); 
  // 1: Info, 2: ID Camera, 3: ID Confirm, 4: Selfie Camera, 5: Selfie Confirm, 6: Verifying, 7: Success
  const [fadeAnim] = useState(new Animated.Value(0));

  const [idImage, setIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const handleStart = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre appareil photo pour la vérification.');
      return;
    }
    setStep(2);
  };

  const takeIdPicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIdImage(result.assets[0].uri);
        setStep(3);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de lancer l'appareil photo.");
    }
  };

  const takeSelfiePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        cameraType: ImagePicker.CameraType.front,
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelfieImage(result.assets[0].uri);
        setStep(5);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de lancer l'appareil photo frontal.");
    }
  };

  const submitKYC = async () => {
    setStep(6);
    
    try {
      const formData = new FormData();
      
      formData.append('idCard', {
        uri: idImage,
        type: 'image/jpeg',
        name: 'idcard.jpg',
      });
      
      formData.append('selfie', {
        uri: selfieImage,
        type: 'image/jpeg',
        name: 'selfie.jpg',
      });

      const response = await fetch(`${API_BASE_URL}/kyc/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStep(7);
      } else {
        Alert.alert('Erreur de vérification', data.message || 'Impossible de vérifier l\'identité.');
        setStep(2);
        setIdImage(null);
        setSelfieImage(null);
      }
    } catch (error) {
      console.log('Erreur upload:', error);
      Alert.alert('Erreur', 'Une erreur réseau s\'est produite.');
      setStep(2);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.centerBox}>
            <MaterialCommunityIcons name="shield-check" size={80} color={COLORS.primary} style={styles.icon} />
            <Text style={styles.subtitle}>Sécurité avant tout</Text>
            <Text style={styles.description}>
              Co-Elles est 100% féminin et sécurisé. Avant de pouvoir utiliser l'application, nous devons procéder à une vérification d'identité avec votre pièce d'identité et un selfie.
            </Text>
            <Button mode="contained" onPress={handleStart} style={styles.button} buttonColor={COLORS.primary}>
              Démarrer la vérification
            </Button>
            <Button mode="text" onPress={() => router.push('/(auth)/login')} style={styles.linkButton} textColor={COLORS.textSecondary}>
              Plus tard (Retour)
            </Button>
          </View>
        );
      case 2:
        return (
          <View style={styles.centerBox}>
            <MaterialCommunityIcons name="card-account-details-outline" size={80} color={COLORS.primary} style={styles.icon} />
            <Text style={styles.subtitle}>Étape 1 : Pièce d'identité</Text>
            <Text style={styles.description}>
              Préparez votre carte d'identité ou votre passeport. Assurez-vous que la photo soit nette et sans reflet.
            </Text>
            <Button mode="contained" onPress={takeIdPicture} style={styles.button} icon="camera">
              Ouvrir l'appareil photo
            </Button>
          </View>
        );
      case 3:
        return (
          <View style={styles.centerBox}>
            <Text style={styles.subtitle}>Vérifiez l'image</Text>
            {idImage && <Image source={{ uri: idImage }} style={styles.previewImage} />}
            <Text style={styles.description}>Assurez-vous que votre nom et prénom soient bien lisibles pour l'analyse automatique.</Text>
            <Button mode="contained" onPress={() => setStep(4)} style={styles.button}>
              Continuer
            </Button>
            <Button mode="outlined" onPress={() => setStep(2)} style={[styles.button, { marginTop: 10 }]}>
              Reprendre la photo
            </Button>
          </View>
        );
      case 4:
        return (
          <View style={styles.centerBox}>
            <MaterialCommunityIcons name="face-recognition" size={80} color={COLORS.accent} style={styles.icon} />
            <Text style={styles.subtitle}>Étape 2 : Selfie</Text>
            <Text style={styles.description}>
              Nous allons maintenant prendre un selfie pour vérifier que c'est bien vous.
            </Text>
            <Button mode="contained" onPress={takeSelfiePicture} style={styles.button} buttonColor={COLORS.accent} icon="camera-front">
              Ouvrir la caméra frontale
            </Button>
          </View>
        );
      case 5:
        return (
          <View style={styles.centerBox}>
            <Text style={styles.subtitle}>Vérifiez votre selfie</Text>
            {selfieImage && <Image source={{ uri: selfieImage }} style={[styles.previewImage, { borderRadius: 150 }]} />}
            <Button mode="contained" onPress={submitKYC} style={styles.button}>
              Envoyer pour vérification
            </Button>
            <Button mode="outlined" onPress={() => setStep(4)} style={[styles.button, { marginTop: 10 }]}>
              Reprendre le selfie
            </Button>
          </View>
        );
      case 6:
        return (
          <View style={styles.centerBox}>
            <ActivityIndicator animating={true} color={COLORS.primary} size="large" />
            <Text style={[styles.subtitle, { marginTop: SPACING.lg }]}>Analyse en cours...</Text>
            <Text style={styles.description}>
              Nous extrayons les informations de votre pièce d'identité pour les comparer à votre profil. Cela prend quelques secondes.
            </Text>
          </View>
        );
      case 7:
        return (
          <View style={styles.centerBox}>
            <MaterialCommunityIcons name="check-decagram" size={80} color={COLORS.success} style={styles.icon} />
            <Text style={styles.subtitle}>Profil Vérifié !</Text>
            <Text style={styles.description}>
              L'analyse a confirmé votre identité. Vous êtes maintenant une membre certifiée de Co-Elles.
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
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', padding: SPACING.md },
  centerBox: { alignItems: 'center', padding: SPACING.md, width: '100%' },
  icon: { marginBottom: SPACING.md },
  subtitle: { fontSize: FONT_SIZES.title, color: COLORS.text, fontWeight: 'bold', marginBottom: SPACING.sm, textAlign: 'center' },
  description: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 22 },
  button: { width: '100%', borderRadius: 8, paddingVertical: 4 },
  linkButton: { marginTop: SPACING.md },
  previewImage: { width: 300, height: 400, borderRadius: 16, marginBottom: SPACING.xl, resizeMode: 'cover' },
});
