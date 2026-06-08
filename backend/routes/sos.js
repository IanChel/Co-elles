const express = require('express');
const SOSAlert = require('../models/SOSAlert');
const protect = require('../middleware/auth');

const router = express.Router();

// Toutes les routes SOS sont protégées
router.use(protect);

// ============================================
// POST /api/sos
// Déclencher une alerte SOS
// ============================================
router.post('/', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: 'La position GPS (latitude, longitude) est requise' });
    }

    const alert = await SOSAlert.create({
      user: req.user._id,
      location: { latitude, longitude },
    });

    // --- Simulation de notification ---
    console.log('──────────────────────────────────────────');
    console.log('🚨 ALERTE SOS DÉCLENCHÉE');
    console.log(`👤 Utilisatrice : ${req.user.firstName} ${req.user.lastName}`);
    console.log(`📍 Position : ${latitude}, ${longitude}`);
    console.log(`📞 Contact d'urgence : ${req.user.emergencyContact?.name || 'Non défini'} — ${req.user.emergencyContact?.phone || 'N/A'}`);
    console.log(`🕐 Heure : ${new Date().toLocaleString('fr-FR')}`);
    console.log('📨 SMS simulé envoyé au contact d\'urgence');
    console.log('──────────────────────────────────────────');

    res.status(201).json({
      message: 'Alerte SOS envoyée — votre contact d\'urgence a été notifié',
      alert,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
