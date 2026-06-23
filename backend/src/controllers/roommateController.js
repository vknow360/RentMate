const User = require('../models/User');
const RoommateMatch = require('../models/RoommateMatch');
const { evaluateCompatibility } = require('../services/gemini');

// Helper to normalize IDs so A is always lexicographically smaller than B
const getNormalizedPair = (id1, id2) => {
  const str1 = id1.toString();
  const str2 = id2.toString();
  return str1 < str2 ? [str1, str2] : [str2, str1];
};

exports.getMatches = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all other students looking for roommate
    const candidates = await User.find({
      _id: { $ne: currentUserId },
      role: 'student',
      isLookingForRoommate: true
    }).select('name email phone profileImage preferences college isLookingForRoommate');

    const matches = [];

    for (const candidate of candidates) {
      const [studentA, studentB] = getNormalizedPair(currentUserId, candidate._id);
      
      // Check cache
      let match = await RoommateMatch.findOne({ studentA, studentB });
      
      // If no cache or older than 30 days, compute
      if (!match || (new Date() - match.computedAt) > 30 * 24 * 60 * 60 * 1000) {
        // Load full user data for pref comparison
        const userA = await User.findById(studentA).select('preferences');
        const userB = await User.findById(studentB).select('preferences');
        
        const result = await evaluateCompatibility(userA, userB);
        
        if (match) {
          match.compatibilityScore = result.compatibilityScore;
          match.reasons = result.reasons;
          match.computedAt = new Date();
          await match.save();
        } else {
          match = await RoommateMatch.create({
            studentA,
            studentB,
            compatibilityScore: result.compatibilityScore,
            reasons: result.reasons
          });
        }
      }

      matches.push({
        candidate,
        compatibilityScore: match.compatibilityScore,
        reasons: match.reasons
      });
    }

    // Sort by score descending
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    console.error("[DEBUG] Error in roommateController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.preferences) {
      user.preferences = { ...user.preferences, ...req.body.preferences };
    }
    if (req.body.isLookingForRoommate !== undefined) {
      user.isLookingForRoommate = req.body.isLookingForRoommate;
    }
    await user.save();
    
    // Invalidate old matches where this user was involved
    await RoommateMatch.deleteMany({
      $or: [{ studentA: user._id }, { studentB: user._id }]
    });

    res.status(200).json({ success: true, data: user.preferences });
  } catch (error) {
    console.error("[DEBUG] Error in roommateController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

