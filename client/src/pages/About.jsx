import React from 'react';
import { me } from '../assets/assets';
import Footer from "../components/Footer"
import '../styles/about.scss';

const About = () => {
  return (
    <div>
      <div className="about-container">
      <section className="about-hero">
        <h1>About StockTrack</h1>
        <p className="about-subtitle">Simplifying inventory management for businesses of all sizes</p>
      </section>

      <section className="about-description">
        <h2>Our Mission</h2>
                      <p>
          StockTrack was created with a simple mission: to eliminate the daily hassle of inventory management.
          We believe that businesses should spend less time counting stock and more time growing their operations.
        </p>
        
        <h2>What We Offer</h2>
        <div className="about-features">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Tracking</h3>
            <p>Monitor stock levels across multiple locations with instant updates and alerts</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Automated Reordering</h3>
            <p>Set custom thresholds and let the system automatically generate purchase orders</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Access</h3>
            <p>Manage your inventory on the go with our responsive design</p>
          </div>
        </div>

        <h2>Why Choose Us?</h2>
        <p>
          Unlike complex enterprise solutions that require extensive training,
          StockEase was designed with simplicity in mind. Our intuitive interface means
          you can get started right away, saving you both time and money.
        </p>
        <p>
          Whether you're a small retail shop or a growing warehouse operation,
          StockEase adapts to your needs and grows with your business.
        </p>
      </section>

      <section className="about-developer">
        <h2>Meet the Developer</h2>
        <div className="developer-card">
          <div className="developer-image">
            <img src={me} alt="Developer" />
          </div>
          <div className="developer-info">
            <h3>Sole Developer & Founder</h3>
            <p>
              StockTrack was built from the ground up by a single developer with a passion for creating
              efficient business solutions. After witnessing the frustration of manual inventory management
              firsthand, I decided to build a tool that would solve these problems once and for all.
            </p>
            <p>
              Every feature in StockTrack comes from direct feedback from business owners and inventory managers.
              This isn't just software—it's a solution designed by someone who understands your challenges.
            </p>
            <div className="developer-contact">
              <a href="mailto:developer@stocktrack.com" className="contact-button">Get in Touch</a>
              <div className="social-links">
                <a href="#" className="social-link">LinkedIn</a>
                <a href="#" className="social-link">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial">
          <p>"Since implementing StockTrack, we've reduced inventory discrepancies by 94% and saved 15 hours every week on manual counts."</p>
          <cite>— Sarah J., Retail Manager</cite>
        </div>
      </section>
    </div>
    <Footer></Footer>
    </div>
  );
};

export default About;