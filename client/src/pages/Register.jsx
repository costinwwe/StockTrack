import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClipboardCheck, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBuilding } from 'react-icons/fa';
import axios from '../utils/api';
import '../styles/auth.scss';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ''
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Check password strength when password field changes
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';

    // Length check
    if (password.length >= 8) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Set message based on score
    if (score === 0 || score === 1) {
      message = 'Weak';
    } else if (score === 2 || score === 3) {
      message = 'Medium';
    } else {
      message = 'Strong';
    }

    setPasswordStrength({ score, message });
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

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check password strength
    if (passwordStrength.score < 3) {
      setError('Please create a stronger password');
      setLoading(false);
      return;
    }

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      
      const res = await axios.post('/api/auth/register', registerData);
      
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
          <h2 className="auth-subtitle">Create your account</h2>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon">
              <FaUser />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
          </div>

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
              <FaBuilding />
            </div>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company Name (Optional)"
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

          {formData.password && (
            <div className={`password-strength ${passwordStrength.message.toLowerCase()}`}>
              <div className="strength-bar">
                <div 
                  className="strength-indicator" 
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                ></div>
              </div>
              <span>{passwordStrength.message} Password</span>
            </div>
          )}

          <div className="form-group">
            <div className="input-icon">
              <FaLock />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </div>
      </div>

      <div className="auth-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-icon">
            <FaClipboardCheck />
          </div>
          <h2>Get Started Today!</h2>
          <p>
            Join thousands of businesses that use StockTrack to streamline their inventory management process and boost productivity.
          </p>
          <ul className="feature-list">
            <li>Easy setup and onboarding</li>
            <li>Powerful dashboard</li>
            <li>Customizable reports</li>
            <li>Cloud-based access</li>
            <li>Dedicated support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;