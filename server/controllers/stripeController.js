const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create checkout session
// @route   POST /api/stripe/create-checkout-session
// @access  Private
exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
  try {
    const { priceId, planType } = req.body;
    const userId = req.user.id;
    
    console.log('Creating checkout session for user:', userId);
    console.log('Plan type:', planType);

    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Determine the price ID based on environment and plan type
    let stripePriceId;
    switch (planType) {
      case 'monthly':
        stripePriceId = process.env.STRIPE_MONTHLY_PRICE_ID;
        break;
      case 'yearly':
        stripePriceId = process.env.STRIPE_YEARLY_PRICE_ID;
        break;
      default:
        return next(new ErrorResponse('Invalid plan type', 400));
    }
    
    console.log('Using Stripe Price ID:', stripePriceId);

    // Create or retrieve Stripe customer
    let customer;
    if (user.subscription && user.subscription.stripeCustomerId) {
      customer = user.subscription.stripeCustomerId;
      console.log('Using existing Stripe customer:', customer);
    } else {
      console.log('Creating new Stripe customer for:', user.email);
      const customerData = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id
        }
      });
      
      customer = customerData.id;
      console.log('Created new Stripe customer:', customer);
      
      // Update user with new Stripe customer ID
      if (!user.subscription) {
        user.subscription = {};
      }
      user.subscription.stripeCustomerId = customer;
      await user.save();
    }

    // Get the client URL from environment or default to localhost
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer: customer,
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment/cancel`,
      metadata: {
        userId: user.id,
        planType: planType
      },
    });

    console.log('Checkout session created:', session.id);
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return next(new ErrorResponse(`Stripe Error: ${error.message}`, 500));
  }
});

// @desc    Webhook for Stripe events
// @route   POST /api/stripe/webhook
// @access  Public
exports.webhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
      
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
      
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
      
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// @desc    Get subscription status
// @route   GET /api/stripe/subscription
// @access  Private
exports.getSubscription = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: user.subscription || { status: 'free', planType: 'none' }
  });
});

// @desc    Cancel subscription
// @route   POST /api/stripe/subscription/cancel
// @access  Private
exports.cancelSubscription = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Check if user has an active subscription
  if (!user.subscription || !user.subscription.stripeSubscriptionId) {
    return next(new ErrorResponse('No active subscription found', 400));
  }
  
  try {
    // Cancel the subscription at period end
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });
    
    // Update user model with cancellation status
    user.subscription.canceledAt = new Date();
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      data: user.subscription
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return next(new ErrorResponse(`Stripe Error: ${error.message}`, 500));
  }
});

// Helper functions for webhook events

// Handle checkout.session.completed
const handleCheckoutSessionCompleted = async (session) => {
  const { userId, planType } = session.metadata;
  
  if (userId && session.subscription) {
    const user = await User.findById(userId);
    
    if (user) {
      // Update subscription details
      user.subscription = {
        ...user.subscription,
        status: 'pro',
        planType: planType,
        startDate: new Date(),
        stripeSubscriptionId: session.subscription,
        paymentMethod: 'card'
      };
      
      await user.save();
      console.log(`User ${user.email} subscription updated to PRO`);
    }
  }
};

// Handle invoice.paid
const handleInvoicePaid = async (invoice) => {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const customerId = subscription.customer;
    
    // Find user by Stripe customer ID
    const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
    
    if (user) {
      // Extend subscription end date based on the billing cycle
      const endDate = new Date(subscription.current_period_end * 1000);
      
      user.subscription = {
        ...user.subscription,
        status: 'pro',
        endDate
      };
      
      await user.save();
      console.log(`Subscription renewed for user ${user.email} until ${endDate}`);
    }
  }
};

// Handle invoice.payment_failed
const handlePaymentFailed = async (invoice) => {
  if (invoice.subscription) {
    const customerId = invoice.customer;
    
    // Find user by Stripe customer ID
    const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
    
    if (user) {
      // No need to change status yet, as Stripe will retry payment
      // But you might want to notify the user
      console.log(`Payment failed for user ${user.email}`);
    }
  }
};

// Handle customer.subscription.deleted
const handleSubscriptionCanceled = async (subscription) => {
  const customerId = subscription.customer;
  
  // Find user by Stripe customer ID
  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
  
  if (user) {
    user.subscription = {
      ...user.subscription,
      status: 'canceled',
      canceledAt: new Date()
    };
    
    await user.save();
    console.log(`Subscription canceled for user ${user.email}`);
  }
};

// Handle customer.subscription.updated
const handleSubscriptionUpdated = async (subscription) => {
  const customerId = subscription.customer;
  
  // Find user by Stripe customer ID
  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
  
  if (user) {
    // Check if status changed
    if (subscription.status === 'active') {
      user.subscription = {
        ...user.subscription,
        status: 'pro',
        endDate: new Date(subscription.current_period_end * 1000)
      };
      console.log(`Subscription activated for user ${user.email}`);
    } else if (subscription.status === 'canceled') {
      user.subscription = {
        ...user.subscription,
        status: 'canceled',
        canceledAt: new Date()
      };
      console.log(`Subscription marked as canceled for user ${user.email}`);
    }
    
    await user.save();
  }
}; 