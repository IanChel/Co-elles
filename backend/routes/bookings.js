const express = require('express');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const protect = require('../middleware/auth');

const router = express.Router();

// Toutes les routes bookings sont protégées
router.use(protect);

// ============================================
// POST /api/bookings
// Réserver une place sur un trajet
// ============================================
router.post('/', async (req, res) => {
  try {
    const { tripId } = req.body;

    // 1. Vérifier que le trajet existe
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trajet introuvable.' });
    }

    // 2. Vérifier que le trajet est ouvert
    if (trip.status !== 'open') {
      return res.status(400).json({ message: 'Ce trajet n\'est plus disponible.' });
    }

    // 3. Vérifier que l'utilisatrice n'est pas la conductrice
    if (trip.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas réserver votre propre trajet.' });
    }

    // 4. Vérifier qu'elle n'a pas déjà réservé
    const existingBooking = await Booking.findOne({
      trip: tripId,
      passenger: req.user._id,
      status: 'confirmed',
    });
    if (existingBooking) {
      return res.status(400).json({ message: 'Vous avez déjà réservé ce trajet.' });
    }

    // 5. Vérifier qu'il reste des places
    const confirmedBookings = await Booking.countDocuments({
      trip: tripId,
      status: 'confirmed',
    });
    if (confirmedBookings >= trip.seats) {
      return res.status(400).json({ message: 'Ce trajet est complet, plus de places disponibles.' });
    }

    // 6. Créer la réservation
    const booking = await Booking.create({
      trip: tripId,
      passenger: req.user._id,
    });

    // 7. Ajouter la passagère au trajet
    trip.passengers.push(req.user._id);

    // 8. Si le trajet est complet, changer son status
    if (trip.passengers.length >= trip.seats) {
      trip.status = 'full';
    }
    await trip.save();

    // 9. Populate et retourner
    await booking.populate('trip');
    await booking.populate('passenger', 'firstName lastName');

    res.status(201).json({
      message: 'Réservation confirmée ! 🎉',
      booking,
    });
  } catch (error) {
    // Gestion du doublon via l'index unique
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Vous avez déjà réservé ce trajet.' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/bookings/my
// Voir mes réservations (en tant que passagère)
// ============================================
router.get('/my', async (req, res) => {
  try {
    const bookings = await Booking.find({
      passenger: req.user._id,
    })
      .populate({
        path: 'trip',
        populate: { path: 'driver', select: 'firstName lastName isKYCVerified' },
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/bookings/my-trips
// Voir les trajets que j'ai proposés (en tant que conductrice)
// avec le détail des passagères qui ont réservé
// ============================================
router.get('/my-trips', async (req, res) => {
  try {
    const myTrips = await Trip.find({ driver: req.user._id })
      .populate('passengers', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json(myTrips);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// PUT /api/bookings/:id/cancel
// Annuler ma réservation
// ============================================
router.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Réservation introuvable.' });
    }

    // Vérifier que c'est bien la passagère qui annule
    if (booking.passenger.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez annuler que vos propres réservations.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cette réservation est déjà annulée.' });
    }

    // Annuler la réservation
    booking.status = 'cancelled';
    await booking.save();

    // Retirer la passagère du trajet et rouvrir le trajet
    const trip = await Trip.findById(booking.trip);
    if (trip) {
      trip.passengers = trip.passengers.filter(
        (p) => p.toString() !== req.user._id.toString()
      );
      // Rouvrir le trajet s'il était complet
      if (trip.status === 'full') {
        trip.status = 'open';
      }
      await trip.save();
    }

    res.json({ message: 'Réservation annulée avec succès.', booking });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
