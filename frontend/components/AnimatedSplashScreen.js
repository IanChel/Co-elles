import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  runOnJS,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from './BrandLogo';

export default function AnimatedSplashScreen({ onFinish }) {
  const { colors } = useTheme();
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Séquence : Scale de 0.9 à 1.0 (fluide), puis léger délai, puis fade out complet
    scale.value = withSequence(
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withDelay(800, withTiming(1.1, { duration: 400 }))
    );

    opacity.value = withDelay(
      1000, 
      withTiming(0, { duration: 400 }, (finished) => {
        if (finished && onFinish) {
          runOnJS(onFinish)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={animatedStyle}>
        <BrandLogo size={220} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});
