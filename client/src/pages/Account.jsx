import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEdit, FaCreditCard, FaKey, FaRocket } from 'react-icons/fa';
import axios from '../utils/api';
import '../styles/account.scss';

const Account = () => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user profile
        const userResponse = await axios.get('/api/users/me');
        setUser(userResponse.data.data);
        
        // Get subscription details
        const subResponse = await axios.get('/api/stripe/subscription');
        setSubscription(subResponse.data.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load your account information. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.')) {
      return;
    }

    setCancelLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/stripe/subscription/cancel');
      setSubscription(response.data.data);
      setMessage({
        type: 'success',
        text: 'Your subscription has been cancelled and will end at the end of your current billing period.'
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to cancel subscription. Please try again.'
      });
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="account-container loading">
        <div className="spinner"></div>
        <p>Loading your account information...</p>
      </div>
    );
  }

  return (
    <div className="account-container">
      <h1>Your Account</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="account-sections">
        {/* Profile Section */}
        <div className="account-section">
          <div className="section-header">
            <FaUser className="section-icon" />
            <h2>Profile Information</h2>
          </div>
          <div className="section-content">
            {user && (
              <div className="profile-info">
                <div className="profile-image">
                  <img 
                    src={user.profileImage ? `/uploads/${user.profileImage}` : '/default-avatar.png'} 
                    alt={user.name} 
                  />
                </div>
                <div className="profile-details">
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span className="value">{user.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{user.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Role:</span>
                    <span className="value">{user.role}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Member Since:</span>
                    <span className="value">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
            <Link to="/edit-profile" className="action-button">
              <FaEdit /> Edit Profile
            </Link>
          </div>
        </div>
        
        {/* Subscription Section */}
        <div className="account-section">
          <div className="section-header">
            <FaRocket className="section-icon" />
            <h2>Subscription</h2>
          </div>
          <div className="section-content">
            {subscription && (
              <div className="subscription-info">
                <div className="subscription-status">
                  <div className={`status-badge ${subscription.status}`}>
                    {subscription.status === 'pro' ? 'PRO' : 
                     subscription.status === 'canceled' ? 'CANCELED' : 'FREE'}
                  </div>
                </div>
                <div className="subscription-details">
                  {subscription.status === 'pro' && (
                    <>
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
                      {subscription.canceledAt && (
                        <div className="detail-item">
                          <span className="label">Canceled on:</span>
                          <span className="value">{new Date(subscription.canceledAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {subscription.status === 'free' && (
                    <p className="subscription-message">
                      You are currently on the free plan. Upgrade to PRO to access premium features.
                    </p>
                  )}
                  
                  {subscription.status === 'canceled' && (
                    <p className="subscription-message">
                      Your subscription has been canceled and will end on {new Date(subscription.endDate).toLocaleDateString()}.
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {subscription?.status === 'pro' && !subscription.canceledAt && (
              <button 
                className="action-button danger"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Processing...' : 'Cancel Subscription'}
              </button>
            )}
            
            {(subscription?.status === 'free' || subscription?.status === 'canceled') && (
              <Link to="/get-pro" className="action-button primary">
                <FaCreditCard /> Upgrade to PRO
              </Link>
            )}
          </div>
        </div>
        
        {/* Security Section */}
        <div className="account-section">
          <div className="section-header">
            <FaKey className="section-icon" />
            <h2>Security</h2>
          </div>
          <div className="section-content">
            <p>
              Keep your account secure by regularly updating your password and enabling two-factor authentication if available.
            </p>
            <Link to="/change-password" className="action-button">
              Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account; 