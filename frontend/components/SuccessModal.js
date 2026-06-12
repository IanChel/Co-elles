import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import BrandLogo from './BrandLogo';

export default function SuccessModal({ visible, title, message, onClose }) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <Animated.View 
          entering={ZoomIn.duration(400)}
          style={[styles.modalContent, { backgroundColor: colors.surface }]}
        >
          <Animated.View entering={FadeIn.delay(200)}>
            <BrandLogo size={80} style={{ marginBottom: SPACING.md }} />
          </Animated.View>
          
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    width: '100%',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontFamily: 'Inter_700Bold',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  }
});
