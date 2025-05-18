import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaClipboardCheck, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaInstagram,
  FaChevronRight,
  FaArrowRight
} from 'react-icons/fa';
import "../styles/footer.scss";

const Footer = () => {
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally handle the newsletter signup
    console.log(`Newsletter signup for: ${email}`);
    setEmail('');
    // Add success message logic here
  };

  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-logo">
            <Link to="/">
              <div className="logo-container">
                <div className="logo-icon">
                  <FaClipboardCheck />
                  <span className="logo-checkmark">✓</span>
                </div>
                <span className="logo-text">StockTrack</span>
              </div>
            </Link>
            <p className="footer-description">
              Powerful inventory management software that helps businesses of all sizes track, manage, and optimize their stock levels.
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-link-column">
              <h3>Product</h3>
              <ul>
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/integrations">Integrations</Link></li>
                <li><Link to="/mobile-app">Mobile App</Link></li>
                <li><Link to="/api">API</Link></li>
              </ul>
            </div>
            
            <div className="footer-link-column">
              <h3>Resources</h3>
              <ul>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/knowledge-base">Knowledge Base</Link></li>
                <li><Link to="/webinars">Webinars</Link></li>
                <li><Link to="/tutorials">Tutorials</Link></li>
                <li><Link to="/support">Support</Link></li>
              </ul>
            </div>
            
            <div className="footer-link-column">
              <h3>Company</h3>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/partners">Partners</Link></li>
                <li><Link to="/legal">Legal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-newsletter">
            <h3>Stay Updated</h3>
            <p>Subscribe to our newsletter for tips, product updates, and inventory management insights.</p>
            <form onSubmit={handleSubmit} className="newsletter-form">
              <div className="form-group">
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Your email address" 
                  required
                />
                <button type="submit">
                  <FaArrowRight />
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="footer-middle">
          <div className="contact-info">
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>support@stocktrack.com</span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>123 Inventory St, Suite 456, San Francisco, CA 94107</span>
            </div>
          </div>
          
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-legal">
            <p>&copy; {currentYear} StockTrack. All rights reserved.</p>
            <div className="legal-links">
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;