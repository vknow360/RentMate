const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ studentId: req.user._id })
      .populate({
        path: 'propertyId',
        match: { isVerified: true } // optional, ensure property is verified
      })
      .sort({ createdAt: -1 });

    // Filter out items where the property was deleted or unverified
    const properties = wishlistItems
      .filter(item => item.propertyId !== null)
      .map(item => item.propertyId);

    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error("[DEBUG] Error in wishlistController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const existingItem = await Wishlist.findOne({ studentId: req.user._id, propertyId });

    if (existingItem) {
      // Remove from wishlist
      await existingItem.deleteOne();
      res.status(200).json({ success: true, message: 'Removed from wishlist' });
    } else {
      // Add to wishlist
      await Wishlist.create({ studentId: req.user._id, propertyId });
      res.status(201).json({ success: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    console.error("[DEBUG] Error in wishlistController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.checkWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const existingItem = await Wishlist.findOne({ studentId: req.user._id, propertyId });
    res.status(200).json({ success: true, data: { inWishlist: !!existingItem } });
  } catch (error) {
    console.error("[DEBUG] Error in wishlistController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

