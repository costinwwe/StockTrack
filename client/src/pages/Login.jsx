import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClipboardCheck, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/auth.scss';
import axios from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', formData);
      
      // Store token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(res.data.data));
      
      // Redirect to dashboard with page refresh
      window.location.href = '/dashboard';
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <div className="logo-container">
            <div className="logo-icon">
              <FaClipboardCheck />
              <span className="logo-checkmark">✓</span>
            </div>
            <h1 className="auth-title">StockTrack</h1>
          </div>
          <h2 className="auth-subtitle">Log in to your account</h2>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon">
              <FaEnvelope />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
            />
          </div>

          <div className="form-group">
            <div className="input-icon">
              <FaLock />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <div 
              className="password-toggle" 
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?</p>
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </div>
      </div>

      <div className="auth-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-icon">
            <FaClipboardCheck />
          </div>
          <h2>Welcome Back!</h2>
          <p>
            Log in to manage your inventory, track stock levels, and optimize your supply chain with our powerful inventory management system.
          </p>
          <ul className="feature-list">
            <li>Real-time inventory tracking</li>
            <li>Comprehensive reporting</li>
            <li>Vendor management</li>
            <li>Low stock alerts</li>
            <li>Mobile access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;