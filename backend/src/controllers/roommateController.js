const User = require('../models/User');
const RoommateMatch = require('../models/RoommateMatch');
const { recomputeMatchesForUser } = require('../services/roommateService');
const mongoose = require('mongoose');

exports.getMatches = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    let totalCount = await RoommateMatch.countDocuments({ 
      $or: [{ studentA: currentUserId }, { studentB: currentUserId }] 
    });

    if (totalCount === 0) {
      await recomputeMatchesForUser(currentUserId);
      totalCount = await RoommateMatch.countDocuments({ 
        $or: [{ studentA: currentUserId }, { studentB: currentUserId }] 
      });
    }

    const pipeline = [
      { $match: { $or: [{ studentA: currentUserId }, { studentB: currentUserId }] } },
      { $addFields: { candidateId: { $cond: [{ $eq: ['$studentA', currentUserId] }, '$studentB', '$studentA'] } } },
      { $sort: { compatibilityScore: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $lookup: { 
          from: 'users', 
          localField: 'candidateId', 
          foreignField: '_id', 
          as: 'candidate',
          pipeline: [{ $project: { name: 1, email: 1, profileImage: 1, college: 1, preferredCity: 1, preferences: 1 } }] 
        } 
      },
      { $unwind: '$candidate' },
      { $project: { candidate: 1, compatibilityScore: 1, reasons: 1 } }
    ];

    const matches = await RoommateMatch.aggregate(pipeline);

    res.status(200).json({ 
      success: true, 
      data: matches,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("[DEBUG] Error in getMatches:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const oldCity = user.preferredCity;
    
    if (req.body.preferences) {
      user.preferences = { ...user.preferences, ...req.body.preferences };
    }
    if (req.body.isLookingForRoommate !== undefined) {
      user.isLookingForRoommate = req.body.isLookingForRoommate;
    }
    if (req.body.preferredCity !== undefined) {
      user.preferredCity = req.body.preferredCity;
    }
    await user.save();
    
    // If they changed cities or stopped looking, clean up stale matches
    if ((oldCity && req.body.preferredCity && oldCity !== req.body.preferredCity) || 
        req.body.isLookingForRoommate === false) {
      await RoommateMatch.deleteMany({
        $or: [{ studentA: user._id }, { studentB: user._id }]
      });
    }

    // Background recompute
    if (user.isLookingForRoommate && user.preferredCity) {
      recomputeMatchesForUser(user._id).catch(console.error);
    }

    res.status(200).json({ success: true, data: user.preferences, preferredCity: user.preferredCity });
  } catch (error) {
    console.error("[DEBUG] Error in updatePreferences:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

