const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Review = require('../models/Review');
const User = require('../models/User');

// @route   POST /api/reviews
// @desc    Laisser un avis à une utilisatrice
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { revieweeId, tripId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (reviewerId === revieweeId) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous évaluer vous-même." });
    }

    // Vérifier si un avis existe déjà pour ce trajet par cet utilisateur vers cette personne
    const existingReview = await Review.findOne({ reviewer: reviewerId, reviewee: revieweeId, trip: tripId });
    if (existingReview) {
      return res.status(400).json({ message: "Vous avez déjà laissé un avis pour ce trajet." });
    }

    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      trip: tripId,
      rating,
      comment
    });

    // Mettre à jour la moyenne et le nombre d'avis du reviewee
    const reviewee = await User.findById(revieweeId);
    const newRatingCount = reviewee.ratingCount + 1;
    const newAverageRating = ((reviewee.averageRating * reviewee.ratingCount) + rating) / newRatingCount;

    reviewee.ratingCount = newRatingCount;
    reviewee.averageRating = newAverageRating;
    await reviewee.save();

    res.status(201).json({ message: "Avis enregistré avec succès", review });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la création de l'avis", error: error.message });
  }
});

// @route   GET /api/reviews/user/:id
// @desc    Obtenir tous les avis d'une utilisatrice
// @access  Private
router.get('/user/:id', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'firstName lastName')
      .populate('trip', 'departure arrival') // Optionnel si on veut afficher le nom du trajet
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des avis", error: error.message });
  }
});

module.exports = router;
