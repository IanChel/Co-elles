import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Mon Profil</Text>
      <Text style={styles.subtitle}>En construction...</Text>

      <Button mode="contained" onPress={handleLogout} style={styles.logoutButton}>
        Se déconnecter
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
  }
});
