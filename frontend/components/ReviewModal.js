import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import api from '../services/api';

export default function ReviewModal({ visible, onClose, trip, revieweeId, revieweeName, onReviewSubmitted, onPostpone }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setLoading(true);
    try {
      await api.post('/reviews', {
        revieweeId,
        tripId: trip._id,
        rating,
        comment
      });
      onReviewSubmitted();
    } catch (error) {
      console.log('Erreur lors de la soumission de l\'avis', error);
      // Même en cas d'erreur (ex: avis déjà laissé), on ferme la modale pour l'instant
      onReviewSubmitted(); 
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IconButton
          key={i}
          icon={i <= rating ? "star" : "star-outline"}
          iconColor={COLORS.accent}
          size={40}
          onPress={() => setRating(i)}
          style={styles.starButton}
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Évaluer {revieweeName}</Text>
          <Text style={styles.subtitle}>Comment s'est passé votre trajet avec elle ?</Text>
          
          {renderStars()}

          <TextInput
            style={styles.input}
            placeholder="Laissez un petit commentaire (optionnel)"
            placeholderTextColor={COLORS.textSecondary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />

          <Button 
            mode="contained" 
            onPress={handleSubmit} 
            loading={loading}
            disabled={rating === 0 || loading}
            style={styles.submitButton}
            buttonColor={COLORS.primary}
          >
            Envoyer l'avis
          </Button>
          
          <Button 
            mode="text" 
            onPress={onPostpone} 
            textColor={COLORS.textSecondary}
            style={styles.postponeButton}
          >
            Plus tard
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  starButton: {
    margin: 0,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: SPACING.xl,
  },
  submitButton: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 6,
  },
  postponeButton: {
    width: '100%',
    marginTop: SPACING.sm,
  }
});
