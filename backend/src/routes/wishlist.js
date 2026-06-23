const express = require('express');
const { getWishlist, toggleWishlist, checkWishlist } = require('../controllers/wishlistController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorize('student'));

router.get('/', getWishlist);
router.post('/:propertyId', toggleWishlist);
router.get('/:propertyId/check', checkWishlist);

module.exports = router;
