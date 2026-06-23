const express = require('express');
const { getMatches, updatePreferences } = require('../controllers/roommateController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorize('student'));

router.get('/matches', getMatches);
router.post('/preferences', updatePreferences);

module.exports = router;
