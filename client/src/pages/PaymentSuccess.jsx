import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import axios from '../utils/api';
import '../styles/payment.scss';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Fetch the user's subscription status
    const fetchSubscription = async () => {
      try {
        const response = await axios.get('/api/stripe/subscription');
        setSubscription(response.data.data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="payment-result-container loading">
        <div className="spinner"></div>
        <p>Processing your payment...</p>
      </div>
    );
  }

  return (
    <div className="payment-result-container success">
      <FaCheckCircle className="success-icon" />
      <h1>Payment Successful!</h1>
      
      {subscription && (
        <div className="subscription-details">
          <h2>Your PRO Subscription</h2>
          <div className="detail-item">
            <span className="label">Status:</span>
            <span className="value">{subscription.status}</span>
          </div>
          <div className="detail-item">
            <span className="label">Plan:</span>
            <span className="value">{subscription.planType}</span>
          </div>
          {subscription.startDate && (
            <div className="detail-item">
              <span className="label">Started:</span>
              <span className="value">{new Date(subscription.startDate).toLocaleDateString()}</span>
            </div>
          )}
          {subscription.endDate && (
            <div className="detail-item">
              <span className="label">Renews on:</span>
              <span className="value">{new Date(subscription.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}
      
      <p className="thank-you-message">
        Thank you for upgrading to StockTrack PRO! You now have access to all premium features.
      </p>
      
      <div className="action-buttons">
        <Link to="/dashboard" className="primary-button">
          Go to Dashboard <FaArrowRight />
        </Link>
        <Link to="/account" className="secondary-button">
          Manage Subscription
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess; 