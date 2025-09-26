const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadUserAvatar } = require('../middleware/userUploadMiddleware');

router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, uploadUserAvatar.single('profile_image'), userController.updateProfile);
router.patch('/me', authMiddleware, uploadUserAvatar.single('profile_image'), userController.updateProfile);

module.exports = router;
