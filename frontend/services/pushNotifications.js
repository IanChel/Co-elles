import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';

// Configuration locale des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Demande la permission et récupère le token Expo Push.
 * Ensuite, il l'envoie au backend pour l'associer à l'utilisatrice connectée.
 */
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Permission refusée pour les notifications push');
      return null;
    }

    try {
      // Pour utiliser projectId localement ou via Expo Go (récupéré depuis app.config.js / app.json)
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || '00000000-0000-4000-8000-000000000000';
      
      // Si c'est l'identifiant par défaut sans projet configuré, on simule un token pour éviter l'erreur réseau (EXPERIENCE_NOT_FOUND)
      if (projectId === '00000000-0000-4000-8000-000000000000') {
        console.log("⚠️ Aucune configuration EAS trouvée. Simulation du Token Push.");
        return "ExponentPushToken[mock-token-for-dev]";
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenData.data;

      // Envoyer le token au backend
      await api.post('/notifications/register', { token });
      console.log('✅ Token Push enregistré :', token);
      return token;
    } catch (error) {
      console.log('❌ Erreur récupération Push Token:', error);
      return null;
    }
  } else {
    console.log('⚠️ Les notifications push nécessitent un appareil physique.');
    return null;
  }
}
