const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const protect = require('../middleware/auth');

const router = express.Router();

// Toutes les routes messages sont protégées
router.use(protect);

// ============================================
// GET /api/conversations
// Liste de mes conversations
// ============================================
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'firstName lastName isKYCVerified')
      .populate('trip', 'departureCity arrivalCity date')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// POST /api/conversations
// Créer ou récupérer une conversation avec un autre utilisateur
// ============================================
router.post('/conversations', async (req, res) => {
  try {
    const { recipientId, tripId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'Le destinataire est requis.' });
    }

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous envoyer un message à vous-même.' });
    }

    // Chercher si une conversation existe déjà entre ces deux utilisatrices
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
    })
      .populate('participants', 'firstName lastName isKYCVerified')
      .populate('trip', 'departureCity arrivalCity date');

    if (!conversation) {
      // Créer une nouvelle conversation
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        trip: tripId || null,
      });
      await conversation.populate('participants', 'firstName lastName isKYCVerified');
      if (tripId) {
        await conversation.populate('trip', 'departureCity arrivalCity date');
      }
    }

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/conversations/:id/messages
// Récupérer les messages d'une conversation
// ============================================
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    // Vérifier que l'utilisatrice fait partie de la conversation
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable.' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation.' });
    }

    // Marquer les messages non lus comme lus
    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user._id },
        read: false,
      },
      { read: true }
    );

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: 1 }); // Du plus ancien au plus récent

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// POST /api/conversations/:id/messages
// Envoyer un message (fallback REST si Socket.io déconnecté)
// ============================================
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le message ne peut pas être vide.' });
    }

    // Vérifier que l'utilisatrice fait partie de la conversation
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable.' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    // Créer le message
    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      content: content.trim(),
    });

    // Mettre à jour la conversation
    conversation.lastMessage = content.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    await message.populate('sender', 'firstName lastName');

    // Émettre le message en temps réel via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${req.params.id}`).emit('newMessage', message);
    }

    // --- Envoi de notification Push ---
    const recipientId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    if (recipientId) {
      const recipientUser = await require('../models/User').findById(recipientId);
      if (recipientUser && recipientUser.expoPushToken) {
        const { sendPushNotifications } = require('../services/notifications');
        await sendPushNotifications([
          {
            to: recipientUser.expoPushToken,
            title: `Nouveau message de ${req.user.firstName}`,
            body: content.trim(),
            data: { url: `/chat?conversationId=${conversation._id}&recipientName=${req.user.firstName}` },
          },
        ]);
      }
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
