const express = require('express');
const Trip = require('../models/Trip');
const protect = require('../middleware/auth');

const router = express.Router();

// Toutes les routes trips sont protégées
router.use(protect);

// ============================================
// POST /api/trips
// Créer un nouveau trajet
// ============================================
router.post('/', async (req, res) => {
  try {
    const { departureCity, arrivalCity, date, time, seats, price } = req.body;

    const trip = await Trip.create({
      driver: req.user._id,
      departureCity,
      arrivalCity,
      date,
      time,
      seats,
      price,
      passengers: [],
    });

    // Populate le driver avant de retourner
    await trip.populate('driver', 'firstName lastName');

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/trips
// Rechercher des trajets (query: departureCity, arrivalCity, date)
// ============================================
router.get('/', async (req, res) => {
  try {
    const { departureCity, arrivalCity, date } = req.query;

    // Construire le filtre dynamiquement (seuls les params fournis sont utilisés)
    const filter = {};
    if (departureCity) {
      filter.departureCity = { $regex: departureCity, $options: 'i' }; // Case insensitive
    }
    if (arrivalCity) {
      filter.arrivalCity = { $regex: arrivalCity, $options: 'i' };
    }
    if (date) {
      filter.date = date;
    }

    const trips = await Trip.find(filter)
      .populate('driver', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/trips/:id
// Détail d'un trajet spécifique
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('driver', 'firstName lastName email phone isKYCVerified')
      .populate('passengers', 'firstName lastName');

    if (!trip) {
      return res.status(404).json({ message: 'Trajet introuvable' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// POST /api/trips/:id/join
// Rejoindre un trajet existant
// ============================================
router.post('/:id/join', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trajet introuvable' });
    }

    // Vérifier que l'utilisatrice n'est pas la conductrice
    if (trip.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous êtes la conductrice de ce trajet' });
    }

    // Vérifier que l'utilisatrice n'est pas déjà passagère
    const alreadyJoined = trip.passengers.some(
      (passengerId) => passengerId.toString() === req.user._id.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Vous avez déjà rejoint ce trajet' });
    }

    // Vérifier qu'il reste des places
    if (trip.passengers.length >= trip.seats) {
      return res.status(400).json({ message: 'Ce trajet est complet — plus de places disponibles' });
    }

    // Ajouter la passagère
    trip.passengers.push(req.user._id);
    await trip.save();

    // Retourner le trajet mis à jour avec populate
    await trip.populate('driver', 'firstName lastName');
    await trip.populate('passengers', 'firstName lastName');

    res.json({ message: 'Trajet rejoint avec succès !', trip });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
