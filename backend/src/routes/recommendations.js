const express = require('express');
const { getRecommendations } = require('../controllers/recommendationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/recommendations — student only
router.get('/', authenticate, authorize('student'), getRecommendations);

module.exports = router;
