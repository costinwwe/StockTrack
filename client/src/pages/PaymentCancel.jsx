import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import '../styles/payment.scss';

const PaymentCancel = () => {
  return (
    <div className="payment-result-container cancel">
      <FaTimesCircle className="cancel-icon" />
      <h1>Payment Canceled</h1>
      
      <p className="message">
        Your payment process was canceled. No charges were made to your account.
      </p>
      
      <div className="action-buttons">
        <Link to="/get-pro" className="primary-button">
          <FaArrowLeft /> Try Again
        </Link>
        <Link to="/dashboard" className="secondary-button">
          Return to Dashboard <FaArrowRight />
        </Link>
      </div>
      
      <div className="help-section">
        <h3>Need Help?</h3>
        <p>
          If you're experiencing issues with the payment process or have questions about our subscription plans, 
          please don't hesitate to contact our support team.
        </p>
        <Link to="/contact" className="support-link">
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel; 