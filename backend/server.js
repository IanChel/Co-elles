const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// --- Charger les variables d'environnement ---
dotenv.config();

// --- Connexion à MongoDB ---
connectDB();

const app = express();

// --- Middlewares globaux ---
app.use(cors());
app.use(express.json());

// --- Route de santé (health check) ---
app.get('/', (req, res) => {
  res.json({
    message: 'API Co-Elles opérationnelle 🚗',
    version: '1.0.0',
  });
});

// --- Montage des routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/sos', require('./routes/sos'));

// --- Démarrage du serveur ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Co-Elles démarré sur le port ${PORT}`);
});
