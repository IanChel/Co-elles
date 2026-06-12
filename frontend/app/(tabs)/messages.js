import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Avatar, ActivityIndicator, Badge, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  // Trouver l'autre participante (pas moi)
  const getOtherParticipant = (participants) => {
    return participants?.find((p) => p._id !== user?._id);
  };

  // Formater la date du dernier message
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Maintenant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const renderConversation = ({ item }) => {
    const other = getOtherParticipant(item.participants);
    if (!other) return null;

    const tripLabel = item.trip
      ? `${item.trip.departureCity} → ${item.trip.arrivalCity}`
      : null;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          router.push(`/chat?conversationId=${item._id}&recipientName=${other.firstName} ${other.lastName}`)
        }
      >
        <View style={styles.conversationRow}>
          <Avatar.Icon
            size={50}
            icon="account"
            style={{ backgroundColor: COLORS.accent }}
            color="#FFF"
          />

          <View style={styles.conversationInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {other.firstName} {other.lastName}
              </Text>
              {other.isKYCVerified && (
                <MaterialCommunityIcons name="check-decagram" size={14} color={COLORS.success} style={{ marginLeft: 4 }} />
              )}
            </View>

            {tripLabel && (
              <Text style={styles.tripLabel} numberOfLines={1}>
                🚗 {tripLabel}
              </Text>
            )}

            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage || 'Aucun message pour le moment'}
            </Text>
          </View>

          <Text style={styles.time}>{formatTime(item.lastMessageAt)}</Text>
        </View>
        <Divider />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Vos conversations avec les conductrices</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="chat-outline" size={64} color={COLORS.border} />
          <Text style={styles.emptyText}>Aucune conversation</Text>
          <Text style={styles.emptySubText}>
            Réservez un trajet pour discuter avec la conductrice !
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderConversation}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: SPACING.lg,
    paddingTop: 60,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, marginTop: 2 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  emptyText: { fontSize: FONT_SIZES.subtitle, color: COLORS.textSecondary, marginTop: SPACING.md, fontWeight: 'bold' },
  emptySubText: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, marginTop: SPACING.xs, textAlign: 'center' },

  listContent: { paddingBottom: 100 },

  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  conversationInfo: { flex: 1, marginLeft: SPACING.md },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', color: COLORS.text },
  tripLabel: { fontSize: 11, color: COLORS.primary, marginTop: 2 },
  lastMessage: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary, marginTop: 2 },
  time: { fontSize: FONT_SIZES.caption, color: COLORS.textSecondary, marginLeft: SPACING.sm },
});
