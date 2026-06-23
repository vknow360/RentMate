const express = require('express');
const { 
  getProperties, 
  getPropertyById, 
  createProperty, 
  updateProperty, 
  deleteProperty, 
  uploadImages 
} = require('../controllers/propertyController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../services/cloudinary');

const router = express.Router();

// Public routes (with optional auth logic inside for owner=me)
// To support optional auth, we use a custom middleware
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // try to authenticate, if fail just continue as unauthenticated
    try {
      await new Promise((resolve) => {
        authenticate(req, res, () => {
          resolve();
        });
      });
    } catch(e) {}
  }
  next();
};

router.get('/', optionalAuth, getProperties);
router.get('/:id', getPropertyById);

// Protected routes
router.use(authenticate);

router.post('/', authorize('owner'), createProperty);
router.put('/:id', authorize('owner', 'admin'), updateProperty);
router.delete('/:id', authorize('owner', 'admin'), deleteProperty);
router.post('/:id/images', authorize('owner'), upload.array('images', 5), uploadImages);

module.exports = router;
