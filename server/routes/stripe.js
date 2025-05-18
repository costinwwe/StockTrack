const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createCheckoutSession,
  webhook,
  getSubscription,
  cancelSubscription
} = require('../controllers/stripeController');

// Public stripe webhook endpoint
router.post('/webhook', webhook);

// Protected routes
router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/subscription', protect, getSubscription);
router.post('/subscription/cancel', protect, cancelSubscription);

module.exports = router; 