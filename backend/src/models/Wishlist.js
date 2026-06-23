const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  createdAt: { type: Date, default: Date.now }
});

wishlistSchema.index({ studentId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
