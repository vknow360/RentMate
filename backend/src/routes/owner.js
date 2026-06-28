const express = require('express');
const { getOwnerAnalytics } = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/owner/analytics - Protected to owners only
router.get('/analytics', authenticate, authorize('owner'), getOwnerAnalytics);

module.exports = router;
