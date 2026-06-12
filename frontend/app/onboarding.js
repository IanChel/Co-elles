import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Animated } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Bienvenue sur Co-elles',
    description: 'Le covoiturage 100% féminin, pensé par des femmes, pour des femmes.',
    icon: 'car-side',
  },
  {
    id: '2',
    title: 'Sécurité avant tout',
    description: 'Toutes nos utilisatrices sont vérifiées (KYC) pour vous garantir un voyage serein.',
    icon: 'shield-check',
  },
  {
    id: '3',
    title: 'Prête pour le départ ?',
    description: 'Rejoignez notre communauté de confiance et voyagez l\'esprit léger.',
    icon: 'account-group',
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(auth)/login');
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons name={item.icon} size={100} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>{item.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>{item.description}</Text>
      </View>
    );
  };

  const Paginator = () => {
    return (
      <View style={styles.paginatorContainer}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i.toString()}
              style={[
                styles.dot,
                { width: dotWidth, opacity, backgroundColor: colors.primary },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flex: 3 }}>
        <FlatList
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <Paginator />

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={scrollToNext}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={colors.primary}
          labelStyle={{ fontFamily: 'Inter_600SemiBold', fontSize: 16 }}
        >
          {currentIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  paginatorContainer: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  footer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  button: {
    borderRadius: 30,
  },
  buttonContent: {
    height: 56,
  },
});
