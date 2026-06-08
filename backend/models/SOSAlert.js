const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Une alerte doit être liée à une utilisatrice'],
    },
    location: {
      latitude: {
        type: Number,
        required: [true, 'La latitude est requise'],
      },
      longitude: {
        type: Number,
        required: [true, 'La longitude est requise'],
      },
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
