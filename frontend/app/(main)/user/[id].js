import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, Avatar, Card, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import api from '../../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../../constants/theme';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      // Pour l'instant, on récupère les avis qui ciblent cet utilisateur
      const resReviews = await api.get(`/reviews/user/${id}`);
      setReviews(resReviews.data);
      
      // On peut déduire quelques infos de base (dans un vrai système, on aurait une route GET /users/:id publique)
      if (resReviews.data.length > 0) {
        setUser(resReviews.data[0].reviewee); 
        // Note: Le backend ne populate pas "reviewee" dans notre route get reviews, 
        // on a juste populate 'reviewer'.
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [id])
  );

  const renderReview = ({ item }) => (
    <Card style={styles.reviewCard} mode="elevated">
      <Card.Content>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            <Avatar.Icon size={32} icon="account" style={{ backgroundColor: COLORS.primaryLight }} color={COLORS.primary} />
            <Text style={styles.reviewerName}>{item.reviewer?.firstName}</Text>
          </View>
          <View style={styles.ratingBox}>
            <MaterialCommunityIcons name="star" size={16} color={COLORS.accent} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        {item.comment ? (
          <Text style={styles.commentText}>"{item.comment}"</Text>
        ) : null}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.text} onPress={() => router.back()} style={styles.backButton} />
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          renderItem={renderReview}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.profileHeader}>
              <Avatar.Icon size={80} icon="account" style={styles.avatar} color="#FFF" />
              <Text style={styles.name}>Utilisatrice</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <MaterialCommunityIcons name="star" size={28} color={COLORS.accent} />
                  <Text style={styles.statValue}>5.0</Text>
                  <Text style={styles.statLabel}>{reviews.length} avis</Text>
                </View>
              </View>
              
              <Divider style={{ marginVertical: SPACING.lg }} />
              <Text style={styles.sectionTitle}>Avis reçus</Text>
              {reviews.length === 0 && (
                <Text style={styles.emptyText}>Aucun avis pour le moment.</Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 60,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.text },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: SPACING.md, paddingBottom: 40 },
  
  profileHeader: { alignItems: 'center', marginBottom: SPACING.md },
  avatar: { backgroundColor: COLORS.primary, marginBottom: SPACING.md },
  name: { fontSize: FONT_SIZES.hero, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
  },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  
  sectionTitle: { fontSize: FONT_SIZES.title, fontWeight: 'bold', alignSelf: 'flex-start', color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, fontStyle: 'italic', alignSelf: 'flex-start' },
  
  reviewCard: { marginBottom: SPACING.md, backgroundColor: COLORS.surface, borderRadius: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  reviewerInfo: { flexDirection: 'row', alignItems: 'center' },
  reviewerName: { marginLeft: SPACING.sm, fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', color: COLORS.text },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent + '22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: 'bold', color: COLORS.accent },
  commentText: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, fontStyle: 'italic', lineHeight: 20 },
});
