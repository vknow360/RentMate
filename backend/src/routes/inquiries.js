const express = require('express');
const { createInquiry, getOwnerInquiries, getStudentInquiries, updateInquiry } = require('../controllers/inquiryController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Student creates an inquiry
router.post('/', authorize('student'), createInquiry);

// Student gets their sent inquiries
router.get('/mine', authorize('student'), getStudentInquiries);

// Owner gets inquiries for their properties
router.get('/owner', authorize('owner'), getOwnerInquiries);

// Both owner and student can update/reply to inquiry
router.put('/:id', authorize('owner', 'student'), updateInquiry);

module.exports = router;
