import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Remplace localhost par ton IP locale pour tester sur appareil physique
// Trouve-la avec: ipconfig (Windows) ou ifconfig (Mac/Linux)
// Exemple: 'http://192.168.1.42:5000/api'
export const API_BASE_URL = 'http://172.20.10.2:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Intercepteur : ajoute le JWT à chaque requête ---
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Erreur lecture token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Intercepteur de réponse : log les erreurs proprement ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log(`❌ API ${error.response.status}:`, error.response.data?.message);
    } else if (error.request) {
      console.log('❌ Pas de réponse du serveur — vérifie que le backend tourne');
    }
    return Promise.reject(error);
  }
);

export default api;
