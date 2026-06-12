const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// --- Charger les variables d'environnement ---
dotenv.config();

// --- Connexion à MongoDB ---
connectDB();

const app = express();

// --- Créer le serveur HTTP et attacher Socket.io ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Autorise toutes les connexions (pour le dev)
    methods: ['GET', 'POST'],
  },
});

// Rendre io accessible dans les routes via req.app.get('io')
app.set('io', io);

// --- Middlewares globaux ---
app.use(cors());
app.use(express.json());

// --- Route de santé (health check) ---
app.get('/', (req, res) => {
  res.json({
    message: 'API Co-Elles opérationnelle 🚗',
    version: '2.0.0',
  });
});

// --- Montage des routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/reviews', require('./routes/reviews'));

// --- Socket.io : Gestion des connexions en temps réel ---
io.on('connection', (socket) => {
  console.log(`🔌 Nouvelle connexion Socket.io : ${socket.id}`);

  // Rejoindre une salle de conversation
  socket.on('joinConversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`📨 ${socket.id} a rejoint la conversation ${conversationId}`);
  });

  // Quitter une salle de conversation
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`👋 ${socket.id} a quitté la conversation ${conversationId}`);
  });

  // Écouter l'événement "typing" (en train d'écrire)
  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('userTyping', { userId });
  });

  // Écouter l'événement "stopTyping"
  socket.on('stopTyping', ({ conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('userStopTyping', { userId });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Déconnexion Socket.io : ${socket.id}`);
  });
});

// --- Démarrage du serveur ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur Co-Elles démarré sur le port ${PORT}`);
  console.log(`🔌 Socket.io prêt pour les connexions temps réel`);
});
