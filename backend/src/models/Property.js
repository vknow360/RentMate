const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  rent: { type: Number, required: true },
  deposit: Number,
  city: { type: String, required: true },
  locality: String,
  nearestCollege: String,
  latitude: Number,
  longitude: Number,
  propertyType: { type: String, enum: ['PG', 'Hostel', 'Apartment', 'Shared Room'] },
  sharingType: { type: String, enum: ['single', 'double', 'triple', 'dormitory'] },
  amenities: [{ type: String }],
  images: [{ type: String }],
  vacancyStatus: { type: String, enum: ['available', 'full'], default: 'available' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for search performance
propertySchema.index({ city: 1, nearestCollege: 1, rent: 1, isVerified: 1 });

module.exports = mongoose.model('Property', propertySchema);
