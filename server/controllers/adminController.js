const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { role } = req.body;
    
    // Find user by id and update
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update user subscription
// @route   PUT /api/admin/users/:id/subscription
// @access  Private/Admin
exports.updateUserSubscription = async (req, res) => {
  try {
    // Get subscription data from request body
    const { 
      status, 
      planType, 
      startDate, 
      endDate, 
      stripeCustomerId,
      stripeSubscriptionId,
      canceledAt 
    } = req.body;
    
    // Create subscription object with only provided fields
    const subscriptionUpdate = {};
    
    if (status) subscriptionUpdate['subscription.status'] = status;
    if (planType) subscriptionUpdate['subscription.planType'] = planType;
    if (startDate) subscriptionUpdate['subscription.startDate'] = startDate;
    if (endDate) subscriptionUpdate['subscription.endDate'] = endDate;
    if (stripeCustomerId) subscriptionUpdate['subscription.stripeCustomerId'] = stripeCustomerId;
    if (stripeSubscriptionId) subscriptionUpdate['subscription.stripeSubscriptionId'] = stripeSubscriptionId;
    if (canceledAt) subscriptionUpdate['subscription.canceledAt'] = canceledAt;
    
    // Find user by id and update subscription
    const user = await User.findByIdAndUpdate(
      req.params.id,
      subscriptionUpdate,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Find user by id
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account'
      });
    }
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 