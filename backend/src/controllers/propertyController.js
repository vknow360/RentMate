const Property = require('../models/Property');
const { uploadToCloudinary } = require('../services/cloudinary');

exports.getProperties = async (req, res) => {
  try {
    const { city, nearestCollege, minRent, maxRent, type, sharingType, amenities, page = 1, limit = 12, owner } = req.query;
    
    let query = {};

    // For owner viewing their own listings
    if (owner === 'me' && req.user && req.user.role === 'owner') {
      query.ownerId = req.user._id;
    } else {
      // Normal search requires properties to be verified
      query.isVerified = true;
      
      if (city) query.city = { $regex: city, $options: 'i' };
      if (nearestCollege) query.nearestCollege = { $regex: nearestCollege, $options: 'i' };
      if (minRent || maxRent) {
        query.rent = {};
        if (minRent) query.rent.$gte = Number(minRent);
        if (maxRent) query.rent.$lte = Number(maxRent);
      }
      if (type) query.propertyType = type;
      if (sharingType) query.sharingType = sharingType;
      if (amenities) {
        const amenitiesList = amenities.split(',').map(a => a.trim());
        query.amenities = { $all: amenitiesList };
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const properties = await Property.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
      
    const total = await Property.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      data: { properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } 
    });
  } catch (error) {
    console.error("[DEBUG] Error in propertyController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('ownerId', 'name email phone');
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error("[DEBUG] Error in propertyController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const propertyData = { ...req.body, ownerId: req.user._id, isVerified: false };
    const property = await Property.create(propertyData);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    console.error("[DEBUG] Error in propertyController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    
    if (property.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this property' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error("[DEBUG] Error in propertyController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    if (property.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this property' });
    }

    await property.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error("[DEBUG] Error in propertyController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No images provided' });
    }

    const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
    const uploadedUrls = await Promise.all(uploadPromises);

    property.images.push(...uploadedUrls);
    await property.save();

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error("[DEBUG] Error in propertyController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

