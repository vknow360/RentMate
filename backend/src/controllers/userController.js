const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("[DEBUG] Error in userController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, phone, preferences, isLookingForRoommate } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (typeof isLookingForRoommate !== 'undefined') {
      user.isLookingForRoommate = isLookingForRoommate;
    }
    
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user._id).select('-password');

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("[DEBUG] Error in userController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Placeholder for Avatar update (Multer + Cloudinary will be added later)
exports.updateAvatar = async (req, res) => {
  try {
    // Expecting the middleware to attach the uploaded URL to req.body.profileImage
    if (req.body.profileImage) {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: req.body.profileImage },
        { new: true, runValidators: true }
      ).select('-password');
      res.status(200).json({ success: true, data: user });
    } else {
      res.status(400).json({ success: false, error: 'No image provided' });
    }
  } catch (error) {
    console.error("[DEBUG] Error in userController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

