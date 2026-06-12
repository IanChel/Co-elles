const express = require('express');
const protect = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// ============================================
// POST /api/notifications/register
// Enregistrer le token push Expo de l'utilisatrice
// ============================================
router.post('/register', protect, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token push requis.' });
    }

    // Mettre à jour l'utilisateur avec son nouveau token
    req.user.expoPushToken = token;
    await req.user.save();

    res.json({ message: 'Token push enregistré avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
