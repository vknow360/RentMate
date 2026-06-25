const mongoose = require('mongoose');

const roommateMatchSchema = new mongoose.Schema({
  studentA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  compatibilityScore: { type: Number, required: true }, // 0-100
  reasons: [{ type: String }],
  computedAt: { type: Date, default: Date.now }
});

// Ensure A.id < B.id so we don't have duplicate pairs (e.g. A-B and B-A)
roommateMatchSchema.index({ studentA: 1, studentB: 1 }, { unique: true });
roommateMatchSchema.index({ studentA: 1, compatibilityScore: -1 });
roommateMatchSchema.index({ studentB: 1, compatibilityScore: -1 });

module.exports = mongoose.model('RoommateMatch', roommateMatchSchema);
