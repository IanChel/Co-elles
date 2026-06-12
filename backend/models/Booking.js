const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Le trajet est requis'],
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'La passagère est requise'],
    },
    seatsBooked: {
      type: Number,
      default: 1,
      min: [1, 'Minimum 1 place'],
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// Une passagère ne peut réserver qu'une seule fois le même trajet
bookingSchema.index({ trip: 1, passenger: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
