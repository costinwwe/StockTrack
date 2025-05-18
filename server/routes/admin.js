const express = require('express');
const router = express.Router();
const { 
  getUsers,
  updateUser,
  deleteUser,
  updateUserSubscription
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

router.route('/users/:id/subscription')
  .put(updateUserSubscription);

module.exports = router; 