// controllers/userController.js
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      email,
      company,
      jobTitle,
      phoneNumber,
      address
    } = req.body;

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (company) updateFields.company = company;
    if (jobTitle) updateFields.jobTitle = jobTitle;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    
    // Handle address fields
    if (address) {
      updateFields.address = {};
      if (address.street) updateFields.address.street = address.street;
      if (address.city) updateFields.address.city = address.city;
      if (address.state) updateFields.address.state = address.state;
      if (address.zipCode) updateFields.address.zipCode = address.zipCode;
      if (address.country) updateFields.address.country = address.country;
    }

    // Update profile image if uploaded
    if (req.file) {
      updateFields.profileImage = req.file.filename;

      // Delete old profile image if it's not the default
      const user = await User.findById(req.user.id);
      if (user.profileImage && user.profileImage !== 'default-avatar.png') {
        const oldImagePath = path.join(__dirname, '../uploads', user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if passwords are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Delete profile image if not default
    if (user.profileImage && user.profileImage !== 'default-avatar.png') {
      const imagePath = path.join(__dirname, '../uploads', user.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete user
    await user.remove();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};