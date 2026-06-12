const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    // Les deux participantes de la conversation
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // Trajet lié (optionnel mais utile pour le contexte)
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    // Dernier message (pour l'affichage dans la liste des conversations)
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Conversation', conversationSchema);
