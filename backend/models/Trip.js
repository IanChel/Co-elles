const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Un trajet doit avoir une conductrice'],
    },
    departureCity: {
      type: String,
      required: [true, 'La ville de départ est requise'],
      trim: true,
    },
    arrivalCity: {
      type: String,
      required: [true, "La ville d'arrivée est requise"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'La date est requise'],
    },
    time: {
      type: String,
      required: [true, "L'heure est requise"],
    },
    seats: {
      type: Number,
      required: [true, 'Le nombre de places est requis'],
      min: [1, 'Minimum 1 place'],
      max: [4, 'Maximum 4 places'],
    },
    price: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'full', 'completed', 'cancelled'],
      default: 'open',
    },
    passengers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', tripSchema);
