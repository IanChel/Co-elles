import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'GEOCODE_CACHE';
const memoryCache = new Map();

/**
 * Charge le cache persistant depuis AsyncStorage en mémoire.
 * Appelé une seule fois au démarrage.
 */
async function loadCacheFromStorage() {
  if (memoryCache.size > 0) return; // Déjà chargé
  try {
    const stored = await AsyncStorage.getItem(CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.entries(parsed).forEach(([key, value]) => {
        memoryCache.set(key, value);
      });
    }
  } catch (e) {
    console.warn('[Geocoding] Erreur chargement cache:', e);
  }
}

/**
 * Persiste le cache mémoire dans AsyncStorage.
 */
async function saveCacheToStorage() {
  try {
    const obj = Object.fromEntries(memoryCache);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('[Geocoding] Erreur sauvegarde cache:', e);
  }
}

/**
 * Convertit un nom de ville/adresse en coordonnées GPS.
 * Utilise un cache mémoire + AsyncStorage pour éviter les appels répétés.
 * 
 * @param {string} cityName - Le nom de la ville ou l'adresse
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export async function geocodeCity(cityName) {
  if (!cityName || typeof cityName !== 'string') return null;

  const normalizedKey = cityName.trim().toLowerCase();
  if (!normalizedKey) return null;

  // Charger le cache persistant si nécessaire
  await loadCacheFromStorage();

  // Vérifier le cache mémoire
  if (memoryCache.has(normalizedKey)) {
    const cached = memoryCache.get(normalizedKey);
    // On a mis null en cache si la ville n'a pas été trouvée — on ne retente pas
    return cached;
  }

  try {
    // Ajouter ", France" pour améliorer la précision du geocoding
    const searchQuery = `${cityName.trim()}, France`;
    const results = await Location.geocodeAsync(searchQuery);

    if (results && results.length > 0) {
      const coords = {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
      memoryCache.set(normalizedKey, coords);
      saveCacheToStorage(); // Fire-and-forget
      return coords;
    }

    // Ville non trouvée → mettre null en cache pour ne pas re-tenter
    memoryCache.set(normalizedKey, null);
    saveCacheToStorage();
    return null;
  } catch (error) {
    console.warn(`[Geocoding] Erreur pour "${cityName}":`, error);
    return null;
  }
}

/**
 * Vide le cache de géocodage (utile pour le debug).
 */
export async function clearGeocodeCache() {
  memoryCache.clear();
  await AsyncStorage.removeItem(CACHE_KEY);
}
