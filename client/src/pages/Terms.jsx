import React, { useState } from 'react';
import '../styles/terms.scss';

const Terms = () => {
  const [accepted, setAccepted] = useState(false);
  
  const handleAcceptTerms = () => {
    setAccepted(true);
    // You can store this acceptance in localStorage or your backend
    localStorage.setItem('termsAccepted', 'true');
  };

  return (
    <div className="terms-container">
      <div className="terms-header">
        <h1>Terms and Conditions</h1>
        <p className="terms-last-updated">Last Updated: May 15, 2025</p>
      </div>
      
      <div className="terms-content">
        <section className="terms-section">
          <h2>1. Introduction</h2>
          <p>Welcome to our StockTrack Inventory Management System. By accessing or using our service, you agree to be bound by these Terms and Conditions.</p>
        </section>

        <section className="terms-section">
          <h2>2. Definitions</h2>
          <p>"Service" refers to the Inventory Management System application.</p>
          <p>"User", "You" and "Your" refers to the individual or organization accessing or using the Service.</p>
          <p>"Company", "We", "Us", and "Our" refers to the providers of this Service.</p>
          <p>"Inventory Data" refers to all information entered, uploaded, or processed through the Service related to inventory items, stock levels, transactions, and related metadata.</p>
        </section>

        <section className="terms-section">
          <h2>3. Use of Service</h2>
          <p>Our StockTrack Inventory Management System is designed to help you track, manage, and optimize your inventory. You agree to use this service only for legitimate business purposes and in accordance with all applicable laws and regulations.</p>
          
          <h3>3.1 Account Responsibilities</h3>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.</p>
          
          <h3>3.2 Accurate Information</h3>
          <p>You agree to provide accurate, current, and complete information when using our Service. Inaccurate data may result in inventory discrepancies for which we cannot be held liable.</p>
        </section>

        <section className="terms-section">
          <h2>4. Data Management</h2>
          <p>We understand the critical nature of inventory data to your business operations.</p>
          
          <h3>4.1 Data Ownership</h3>
          <p>You retain all rights to your Inventory Data. We do not claim ownership over any of your data entered into the system.</p>
          
          <h3>4.2 Data Security</h3>
          <p>We implement reasonable security measures to protect your data. However, no system is perfectly secure, and you acknowledge this inherent risk.</p>
          
          <h3>4.3 Backups</h3>
          <p>While we maintain regular backups of the system, you are advised to export and maintain your own backup copies of critical inventory data.</p>
        </section>

        <section className="terms-section">
          <h2>5. Service Limitations</h2>
          <p>Our Inventory Management System is provided "as is" and "as available." We do not guarantee that the service will be uninterrupted, timely, secure, or error-free.</p>
          
          <h3>5.1 System Maintenance</h3>
          <p>Periodic maintenance will be performed to ensure optimal system performance. We will attempt to schedule maintenance during off-peak hours when possible.</p>
        </section>

        <section className="terms-section">
          <h2>6. Liability Limitations</h2>
          <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.</p>
          <p>This includes but is not limited to: lost profits, lost data, or business interruption.</p>
        </section>

        <section className="terms-section">
          <h2>7. Termination</h2>
          <p>We reserve the right to suspend or terminate your access to the Service for violation of these Terms or for any other reason at our sole discretion.</p>
          <p>Upon termination, you will be provided with an opportunity to export your data within a reasonable timeframe.</p>
        </section>

        <section className="terms-section">
          <h2>8. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. We will provide notice of significant changes through the Service or via email.</p>
          <p>Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.</p>
        </section>

        <section className="terms-section">
          <h2>9. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>Email: support@stocktrack.com</p>
          <p>Phone: (555) 123-4567</p>
        </section>
      </div>

      {!accepted && (
        <div className="terms-acceptance">
          <div className="terms-checkbox-container">
            <input 
              type="checkbox" 
              id="accept-terms" 
              onChange={() => setAccepted(!accepted)}
              checked={accepted}
            />
            <label htmlFor="accept-terms">I have read and agree to the Terms and Conditions</label>
          </div>
          <button 
            className={`terms-accept-button ${!accepted ? 'disabled' : ''}`}
            onClick={handleAcceptTerms}
            disabled={!accepted}
          >
            Accept and Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default Terms;