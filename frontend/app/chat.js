import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import api from '../services/api';
import { connectSocket, getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function ChatScreen() {
  const { conversationId, recipientName } = useLocalSearchParams();
  const { user } = useAuth();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // --- Charger les messages et connecter Socket.io ---
  useEffect(() => {
    fetchMessages();

    const socket = connectSocket();

    // Rejoindre la salle de conversation
    socket.emit('joinConversation', conversationId);

    // Écouter les nouveaux messages en temps réel
    socket.on('newMessage', (message) => {
      // Ne pas ajouter si c'est notre propre message (déjà ajouté localement)
      if (message.sender?._id !== user?._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Écouter l'indicateur de frappe
    socket.on('userTyping', ({ userId }) => {
      if (userId !== user?._id) {
        setIsTyping(true);
      }
    });

    socket.on('userStopTyping', ({ userId }) => {
      if (userId !== user?._id) {
        setIsTyping(false);
      }
    });

    // Cleanup : quitter la salle quand on quitte l'écran
    return () => {
      socket.emit('leaveConversation', conversationId);
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('userStopTyping');
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/conversations/${conversationId}/messages`);
      setMessages(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Envoyer un message ---
  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    // Ajouter le message localement instantanément (optimistic update)
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      content: text,
      sender: { _id: user?._id, firstName: user?.firstName },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    // Signaler qu'on arrête de taper
    const socket = getSocket();
    if (socket) {
      socket.emit('stopTyping', { conversationId, userId: user?._id });
    }

    try {
      const res = await api.post(`/messages/conversations/${conversationId}/messages`, {
        content: text,
      });

      // Remplacer le message temporaire par le vrai message du serveur
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMessage._id ? res.data : m))
      );
    } catch (error) {
      console.log('Erreur envoi message:', error);
      // Retirer le message temporaire si erreur
      setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
    } finally {
      setSending(false);
    }
  };

  // --- Indicateur de frappe ---
  let typingTimeout = useRef(null);
  const handleTextChange = (text) => {
    setInputText(text);

    const socket = getSocket();
    if (socket) {
      socket.emit('typing', { conversationId, userId: user?._id });

      // Arrêter l'indicateur de frappe après 2 secondes d'inactivité
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('stopTyping', { conversationId, userId: user?._id });
      }, 2000);
    }
  };

  // --- Formater l'heure ---
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // --- Rendu d'un message ---
  const renderMessage = ({ item }) => {
    const isMe = item.sender?._id === user?._id;

    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        {!isMe && (
          <Avatar.Icon size={28} icon="account" style={{ backgroundColor: COLORS.accent, marginRight: 6 }} color="#FFF" />
        )}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.otherMessageTime]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <Avatar.Icon size={40} icon="account" style={{ backgroundColor: COLORS.accent }} color="#FFF" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{recipientName}</Text>
          {isTyping && <Text style={styles.typingText}>en train d'écrire...</Text>}
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <MaterialCommunityIcons name="hand-wave" size={48} color={COLORS.border} />
            <Text style={styles.emptyChatText}>Dites bonjour ! 👋</Text>
          </View>
        }
      />

      {/* Barre de saisie */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Écrire un message..."
          placeholderTextColor={COLORS.textSecondary}
          value={inputText}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
        >
          <MaterialCommunityIcons
            name="send"
            size={24}
            color={inputText.trim() ? '#FFF' : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: 60,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 4,
  },
  headerInfo: { marginLeft: SPACING.md },
  headerName: { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', color: COLORS.text },
  typingText: { fontSize: 12, color: COLORS.success, fontStyle: 'italic' },

  messagesList: { padding: SPACING.md, paddingBottom: SPACING.lg },

  messageRow: { flexDirection: 'row', marginBottom: SPACING.sm, alignItems: 'flex-end' },
  myMessageRow: { justifyContent: 'flex-end' },
  otherMessageRow: { justifyContent: 'flex-start' },

  bubble: { maxWidth: '75%', padding: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: 18 },
  myBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },

  messageText: { fontSize: FONT_SIZES.body, lineHeight: 20 },
  myMessageText: { color: '#FFF' },
  otherMessageText: { color: COLORS.text },

  messageTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  myMessageTime: { color: 'rgba(255,255,255,0.7)' },
  otherMessageTime: { color: COLORS.textSecondary },

  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyChatText: { fontSize: FONT_SIZES.subtitle, color: COLORS.textSecondary, marginTop: SPACING.md },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 30 : SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: { backgroundColor: COLORS.border },
});
