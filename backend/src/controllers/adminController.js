const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalProperties, totalInquiries] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Inquiry.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: { totalUsers, totalProperties, totalInquiries }
    });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleUserVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    if (!['student', 'owner', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User permanently deleted' });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('ownerId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.togglePropertyVerification = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });

    property.isVerified = !property.isVerified;
    await property.save();

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });

    await property.deleteOne();
    res.status(200).json({ success: true, message: 'Property deleted by admin' });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('studentId', 'name email')
      .populate('propertyId', 'title city')
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('studentId', 'name email')
      .populate('propertyId', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });

    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted by admin' });
  } catch (error) {
    console.error("[DEBUG] Error in adminController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

