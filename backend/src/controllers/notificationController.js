const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // limit to recent 50
      
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("[DEBUG] Error in notificationController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    console.error("[DEBUG] Error in notificationController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === 'all') {
      await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    } else {
      await Notification.findOneAndUpdate({ _id: id, userId: req.user._id }, { isRead: true });
    }
    
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error("[DEBUG] Error in notificationController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

