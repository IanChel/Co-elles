import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Charger le token au démarrage de l'app ---
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Erreur chargement auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Inscription ---
  const register = async (firstName, lastName, email, password, phone) => {
    try {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        phone,
      });

      const { token, ...userData } = response.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Erreur lors de l\'inscription';
      return { success: false, message };
    }
  };

  // --- Connexion ---
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      const { token, ...userData } = response.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Email ou mot de passe incorrect';
      return { success: false, message };
    }
  };

  // --- Déconnexion ---
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.log('Erreur déconnexion:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
