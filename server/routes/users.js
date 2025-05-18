// routes/users.js
const express = require('express');
const router = express.Router();
const { 
  updateProfile, 
  changePassword, 
  deleteAccount 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadProfileImage } = require('../middleware/upload');

// Update user profile
router.put(
  '/profile', 
  protect, 
  uploadProfileImage, 
  updateProfile
);

// Change password
router.put(
  '/change-password', 
  protect, 
  changePassword
);

// Delete account
router.delete(
  '/account', 
  protect, 
  deleteAccount
);

module.exports = router;