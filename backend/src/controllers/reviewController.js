const Review = require('../models/Review');
const Property = require('../models/Property');

exports.createReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    
    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });

    // Ensure student hasn't already reviewed
    const existingReview = await Review.findOne({ propertyId, studentId: req.user._id });
    if (existingReview) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this property' });
    }

    const review = await Review.create({
      propertyId,
      studentId: req.user._id,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error("[DEBUG] Error in reviewController.js:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this property' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const reviews = await Review.find({ propertyId })
      .populate('studentId', 'name profileImage')
      .sort({ createdAt: -1 });

    // Calculate average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = sum / reviews.length;
    }

    res.status(200).json({ 
      success: true, 
      data: { 
        reviews, 
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length
      } 
    });
  } catch (error) {
    console.error("[DEBUG] Error in reviewController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

