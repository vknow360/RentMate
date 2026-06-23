const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'owner', 'admin'], required: true },
  phone: String,
  college: String, // required if role === 'student'
  isVerified: { type: Boolean, default: false },
  verificationDocUrl: String,
  profileImage: String,
  preferences: {
    sleepSchedule: { type: String, enum: ['early_bird', 'night_owl', 'flexible'] },
    studyHabits: { type: String, enum: ['quiet_focused', 'group_study', 'flexible'] },
    foodPreference: { type: String, enum: ['veg', 'non_veg', 'vegan', 'eggetarian'] },
    smoking: { type: Boolean, default: false },
    cleanliness: { type: Number, min: 1, max: 5 },
    socialType: { type: String, enum: ['introvert', 'extrovert', 'balanced'] },
    noiseTolerance: { type: Number, min: 1, max: 5 },
    budget: Number,
    moveInDate: Date,
    bio: String
  },
  isLookingForRoommate: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
