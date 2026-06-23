const express = require('express');
const { getMe, updateMe, updateAvatar } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/me', getMe);
router.put('/me', updateMe);
router.post('/me/avatar', updateAvatar);

module.exports = router;
