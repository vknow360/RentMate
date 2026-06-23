const express = require('express');
const { 
  getStats, 
  getUsers, 
  getUser,
  toggleUserVerification, 
  toggleSuspension,
  changeRole,
  deleteUser,
  getProperties, 
  togglePropertyVerification,
  deleteProperty,
  getInquiries,
  getReviews,
  deleteReview
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/verify', toggleUserVerification);
router.put('/users/:id/suspend', toggleSuspension);
router.put('/users/:id/role', changeRole);
router.delete('/users/:id', deleteUser);

router.get('/properties', getProperties);
router.put('/properties/:id/verify', togglePropertyVerification);
router.delete('/properties/:id', deleteProperty);

router.get('/inquiries', getInquiries);
router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
