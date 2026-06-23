const Inquiry = require('../models/Inquiry');
const Notification = require('../models/Notification');
const Property = require('../models/Property');

exports.createInquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });

    const inquiry = await Inquiry.create({
      studentId: req.user._id,
      propertyId,
      ownerId: property.ownerId,
      messages: [{
        sender: 'student',
        text: message
      }]
    });

    // Create notification for owner
    await Notification.create({
      userId: property.ownerId,
      type: 'inquiry',
      message: `New inquiry for ${property.title} from ${req.user.name}`,
      relatedId: inquiry._id
    });

    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    console.error("[DEBUG] Error in inquiryController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOwnerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ ownerId: req.user._id })
      .populate('studentId', 'name email phone college profileImage preferences')
      .populate('propertyId', 'title')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    console.error("[DEBUG] Error in inquiryController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStudentInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ studentId: req.user._id })
      .populate('propertyId', 'title city locality')
      .populate('ownerId', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    console.error("[DEBUG] Error in inquiryController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateInquiry = async (req, res) => {
  try {
    const { status, response } = req.body;
    
    // Both student and owner can update/reply to an inquiry
    let inquiry = await Inquiry.findOne({ 
      _id: req.params.id, 
      $or: [{ ownerId: req.user._id }, { studentId: req.user._id }] 
    });
    
    if (!inquiry) return res.status(404).json({ success: false, error: 'Inquiry not found or unauthorized' });

    if (status && req.user.role === 'owner') {
      inquiry.status = status;
    }

    if (response) {
      // Migrate legacy string message/response to the new messages array
      if (inquiry.messages.length === 0 && inquiry.message) {
        inquiry.messages.push({ sender: 'student', text: inquiry.message, timestamp: inquiry.createdAt });
        if (inquiry.response) {
          inquiry.messages.push({ sender: 'owner', text: inquiry.response, timestamp: inquiry.respondedAt });
        }
      }

      inquiry.messages.push({
        sender: req.user.role === 'owner' ? 'owner' : 'student',
        text: response
      });
      // Automatically reopen inquiry if student replies to a closed/responded one
      if (req.user.role === 'student' && inquiry.status !== 'pending') {
        inquiry.status = 'pending';
      } else if (req.user.role === 'owner') {
        inquiry.status = 'responded';
      }
    }

    await inquiry.save();
    
    // Populate before returning to keep frontend state consistent
    const populatedInquiry = await Inquiry.findById(inquiry._id)
      .populate('studentId', 'name email phone college profileImage preferences')
      .populate('propertyId', 'title city locality')
      .populate('ownerId', 'name phone');

    res.status(200).json({ success: true, data: populatedInquiry });
  } catch (error) {
    console.error("[DEBUG] Error in inquiryController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

