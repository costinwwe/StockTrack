import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardCheck, FaBox, FaChartLine, FaArrowRight } from 'react-icons/fa';
import "../styles/hero.scss"

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/projects');
  };

  const handleWatchDemo = () => {
    navigate('/tutorial');
  };

  return (
    <div className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-heading">
            <h1>
              <span className="accent">Manage</span> your inventory
              <br />with <span className="accent">confidence</span>
            </h1>
            <p>Track, organize, and optimize your stock levels with our powerful inventory management system</p>
            
            <div className="hero-cta">
              <button className="primary-btn" onClick={handleGetStarted}>
                Get Started <FaArrowRight className="btn-icon" />
              </button>
              <button className="secondary-btn" onClick={handleWatchDemo}>
                Watch Demo
              </button>
            </div>
          </div>
          
          {/* Rest of the component remains the same */}
          <div className="hero-graphic">
            <div className="clipboard-graphic">
              <div className="clipboard-header"></div>
              <div className="clipboard-body">
                <div className="checklist-item">
                  <div className="check-icon">✓</div>
                  <div className="item-text">Product Management</div>
                </div>
                <div className="checklist-item">
                  <div className="check-icon">✓</div>
                  <div className="item-text">Stock Tracking</div>
                </div>
                <div className="checklist-item">
                  <div className="check-icon">✓</div>
                  <div className="item-text">Vendor Integration</div>
                </div>
                <div className="checklist-item active">
                  <div className="check-icon">✓</div>
                  <div className="item-text">Real-time Analytics</div>
                </div>
                <div className="checklist-item">
                  <div className="check-icon">✓</div>
                  <div className="item-text">Mobile Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="feature-shells">
          <div className="feature-shell active">
            <div className="shell-icon red">
              <FaClipboardCheck />
            </div>
            <div className="shell-text">
              <span className="shell-title">Track</span> inventory
            </div>
          </div>
          
          <div className="feature-shell">
            <div className="shell-icon purple">
              <FaBox />
            </div>
            <div className="shell-text">
              <span className="shell-title">Manage</span> orders
            </div>
          </div>
          
          <div className="feature-shell">
            <div className="shell-icon purple">
              <FaChartLine />
            </div>
            <div className="shell-text">
              <span className="shell-title">Analyze</span> performance
            </div>
          </div>
          
          <div className="feature-shell">
            <div className="shell-icon purple">
              <FaArrowRight />
            </div>
            <div className="shell-text">
              <span className="shell-title">Try</span> for free
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;