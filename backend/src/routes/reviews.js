const express = require('express');
const { createReview, getPropertyReviews } = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Publicly accessible route to get reviews
router.get('/property/:propertyId', getPropertyReviews);

// Protected routes
router.use(authenticate);
router.post('/', authorize('student'), createReview);

module.exports = router;
