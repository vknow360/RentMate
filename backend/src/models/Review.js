const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// A student can only leave one review per property
reviewSchema.index({ propertyId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
