const User = require('../models/User');
const RoommateMatch = require('../models/RoommateMatch');
const { computeCompatibility } = require('./gemini');

// Helper to normalize IDs so A is always lexicographically smaller than B
const getNormalizedPair = (id1, id2) => {
  const str1 = id1.toString();
  const str2 = id2.toString();
  return str1 < str2 ? [str1, str2] : [str2, str1];
};

exports.recomputeMatchesForUser = async (userId) => {
  try {
    const user = await User.findById(userId).select('preferences preferredCity isLookingForRoommate role');
    if (!user || user.role !== 'student' || !user.isLookingForRoommate || !user.preferredCity) {
      return; // Nothing to compute if not looking or no city
    }

    const candidates = await User.aggregate([
      { 
        $match: { 
          _id: { $ne: user._id }, 
          role: 'student', 
          isLookingForRoommate: true, 
          preferredCity: user.preferredCity 
        } 
      },
      { $project: { preferences: 1 } }
    ]);

    if (candidates.length === 0) return;

    const bulkOps = candidates.map(candidate => {
      const [studentA, studentB] = getNormalizedPair(user._id, candidate._id);
      const result = computeCompatibility(user.preferences || {}, candidate.preferences || {});
      
      return {
        updateOne: {
          filter: { studentA, studentB },
          update: {
            $set: {
              compatibilityScore: result.compatibilityScore,
              reasons: result.reasons,
              computedAt: new Date()
            }
          },
          upsert: true
        }
      };
    });

    if (bulkOps.length > 0) {
      await RoommateMatch.bulkWrite(bulkOps);
    }
  } catch (error) {
    console.error('Error in recomputeMatchesForUser:', error);
  }
};

exports.recomputeAllMatches = async () => {
  try {
    const cityGroups = await User.aggregate([
      { $match: { role: 'student', isLookingForRoommate: true, preferredCity: { $exists: true, $ne: null } } },
      { $group: { _id: '$preferredCity', students: { $push: { _id: '$_id', preferences: '$preferences' } } } }
    ]);

    const bulkOps = [];

    for (const group of cityGroups) {
      const students = group.students;
      for (let i = 0; i < students.length; i++) {
        for (let j = i + 1; j < students.length; j++) {
          const [studentA, studentB] = getNormalizedPair(students[i]._id, students[j]._id);
          const result = computeCompatibility(students[i].preferences || {}, students[j].preferences || {});
          
          bulkOps.push({
            updateOne: {
              filter: { studentA, studentB },
              update: {
                $set: {
                  compatibilityScore: result.compatibilityScore,
                  reasons: result.reasons,
                  computedAt: new Date()
                }
              },
              upsert: true
            }
          });
        }
      }
    }

    if (bulkOps.length > 0) {
      // Execute in batches to prevent memory/BSON size issues
      const batchSize = 1000;
      for (let i = 0; i < bulkOps.length; i += batchSize) {
        await RoommateMatch.bulkWrite(bulkOps.slice(i, i + batchSize));
      }
    }
  } catch (error) {
    console.error('Error in recomputeAllMatches:', error);
  }
};
