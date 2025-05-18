import React, { useState } from 'react';
import { FaCheck, FaTimes, FaCreditCard, FaLock, FaRocket } from 'react-icons/fa';
import axios from '../utils/api';
import stripePromise from '../utils/stripeClient';
import '../styles/getpro.scss';

const GetPro = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const plans = {
    monthly: {
      name: 'Monthly',
      price: '$9.99',
      priceId: 'price_1RBD73HVuHqtfaXfQDQDTLpk',
      billingCycle: 'per month',
      features: [
        'Unlimited inventory items',
        'Advanced reporting',
        'API access',
        'Team collaboration',
        'Priority support',
        'Custom branding'
      ]
    },
    yearly: {
      name: 'Yearly',
      price: '$99.99',
      priceId: 'price_1RBD7KHVuHqtfaXfv77UInw2',
      billingCycle: 'per year',
      savings: '16% savings',
      features: [
        'Unlimited inventory items',
        'Advanced reporting',
        'API access',
        'Team collaboration',
        'Priority support',
        'Custom branding',
        'Bulk import/export',
        'Dedicated account manager'
      ]
    }
  };

  const handleSubscribe = async (planType) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call backend to create a checkout session using axios
      const response = await axios.post('/api/stripe/create-checkout-session', {
        priceId: plans[planType].priceId,
        planType
      });

      // Get session ID from the response
      const { sessionId } = response.data;
      console.log('Received session ID:', sessionId);

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({
        sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="get-pro-container">
      <div className="pro-header">
        <FaRocket className="pro-icon" />
        <h1>Upgrade to StockTrack PRO</h1>
        <p>Access premium features and take your inventory management to the next level</p>
      </div>

      <div className="pricing-toggle">
        <button 
          className={`toggle-button ${selectedPlan === 'monthly' ? 'active' : ''}`}
          onClick={() => setSelectedPlan('monthly')}
        >
          Monthly
        </button>
        <button 
          className={`toggle-button ${selectedPlan === 'yearly' ? 'active' : ''}`}
          onClick={() => setSelectedPlan('yearly')}
        >
          Yearly
          <span className="savings-badge">{plans.yearly.savings}</span>
        </button>
      </div>

      <div className="pricing-container">
        {/* Free Plan */}
        <div className="pricing-card">
          <div className="card-header">
            <h2>Free</h2>
            <div className="price">
              <span className="amount">$0</span>
              <span className="period">forever</span>
            </div>
          </div>
          <div className="card-content">
            <ul className="features-list">
              <li><FaCheck className="check-icon" /> Basic inventory tracking</li>
              <li><FaCheck className="check-icon" /> Up to 100 items</li>
              <li><FaCheck className="check-icon" /> Email support</li>
              <li><FaTimes className="x-icon" /> Advanced reporting</li>
              <li><FaTimes className="x-icon" /> API access</li>
              <li><FaTimes className="x-icon" /> Team collaboration</li>
            </ul>
            <button className="current-plan-button">Current Plan</button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="pricing-card pro">
          <div className="card-header">
            <div className="pro-badge">PRO</div>
            <h2>{plans[selectedPlan].name}</h2>
            <div className="price">
              <span className="amount">{plans[selectedPlan].price}</span>
              <span className="period">{plans[selectedPlan].billingCycle}</span>
            </div>
          </div>
          <div className="card-content">
            <ul className="features-list">
              {plans[selectedPlan].features.map((feature, index) => (
                <li key={index}><FaCheck className="check-icon" /> {feature}</li>
              ))}
            </ul>
            <button 
              className="upgrade-button"
              onClick={() => handleSubscribe(selectedPlan)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Upgrade Now'}
              {!loading && <FaCreditCard className="card-icon" />}
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      </div>

      <div className="security-info">
        <FaLock className="lock-icon" />
        <p>Secure payment processing by Stripe. Your payment information is never stored on our servers.</p>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Can I cancel at any time?</h3>
            <p>Yes, you can cancel your subscription at any time. After cancellation, you'll continue to have PRO access until the end of your current billing period.</p>
          </div>
          <div className="faq-item">
            <h3>How do I upgrade or downgrade?</h3>
            <p>You can manage your subscription from your account settings. Changes to your plan will take effect at the end of your current billing cycle.</p>
          </div>
          <div className="faq-item">
            <h3>Is there a trial period?</h3>
            <p>We don't offer a trial for PRO, but our Free plan lets you experience the core features indefinitely.</p>
          </div>
          <div className="faq-item">
            <h3>What payment methods are accepted?</h3>
            <p>We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment provider, Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetPro;