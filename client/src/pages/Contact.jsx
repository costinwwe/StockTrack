import React, { useState } from 'react';
import "../styles/contact.scss";
import { FaUser, FaEnvelope, FaPhone, FaPaperPlane, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitStatus({
        submitted: true,
        success: false,
        message: 'Sending message...'
      });
      
      try {
        // In a real application, this would be an API call
        // await api.post('/api/contact', formData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSubmitStatus({
          submitted: true,
          success: true,
          message: 'Message sent successfully! We\'ll get back to you soon.'
        });
        
        // Reset form after successful submission
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } catch (error) {
        setSubmitStatus({
          submitted: true,
          success: false,
          message: 'Failed to send message. Please try again later.'
        });
      }
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Have questions or want to connect? Reach out to us using the form below or contact us directly.</p>
      </div>
      
      <div className="contact-content">
        <div className="contact-form-section">
          <div className="form-header">
            <h2>Send a Message</h2>
            <p>Fill out the form and we'll get back to you as soon as possible.</p>
          </div>
          
          {submitStatus.submitted && (
            <div className={`submit-status ${submitStatus.success ? 'success' : 'error'}`}>
              {submitStatus.message}
            </div>
          )}
          
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name <span className="required">*</span></label>
                <div className="input-with-icon">
                  <FaUser className="icon" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    className={errors.firstName ? 'error' : ''}
                  />
                </div>
                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name <span className="required">*</span></label>
                <div className="input-with-icon">
                  <FaUser className="icon" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    className={errors.lastName ? 'error' : ''}
                  />
                </div>
                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <div className="input-with-icon">
                  <FaEnvelope className="icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <div className="input-with-icon">
                  <FaPhone className="icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject <span className="required">*</span></label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is your message about?"
                className={errors.subject ? 'error' : ''}
              />
              {errors.subject && <div className="error-message">{errors.subject}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message <span className="required">*</span></label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                rows="5"
                className={errors.message ? 'error' : ''}
              ></textarea>
              {errors.message && <div className="error-message">{errors.message}</div>}
            </div>
            
            <button type="submit" className="submit-btn">
              <FaPaperPlane className="btn-icon" />
              Send Message
            </button>
          </form>
        </div>
        
        <div className="contact-info-section">
          <div className="info-header">
            <h2>Contact Information</h2>
            <p>You can also reach us using the following information:</p>
          </div>
          
          <div className="info-content">
            <div className="info-item">
              <FaMapMarkerAlt className="info-icon" />
              <div className="info-text">
                <h3>Address</h3>
                <p>123 Business Street, Suite 100<br />San Francisco, CA 94107</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaEnvelope className="info-icon" />
              <div className="info-text">
                <h3>Email</h3>
                <p><a href="mailto:contact@yourcompany.com">contact@yourcompany.com</a></p>
              </div>
            </div>
            
            <div className="info-item">
              <FaPhone className="info-icon" />
              <div className="info-text">
                <h3>Phone</h3>
                <p><a href="tel:+14151234567">(415) 123-4567</a></p>
              </div>
            </div>
          </div>
          
          <div className="social-links">
            <h3>Connect With Us</h3>
            <div className="social-icons">
              <a href="https://linkedin.com/company/yourcompany" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaLinkedin />
              </a>
              <a href="https://twitter.com/yourcompany" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaTwitter />
              </a>
              <a href="https://github.com/yourcompany" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaGithub />
              </a>
            </div>
          </div>
          
          <div className="map-container">
            <div className="map-placeholder">
              <div className="map-overlay">Interactive Map</div>
              {/* In a real application, replace this with an actual map component */}
              {/* <iframe src="https://www.google.com/maps/embed?..." title="Office Location"></iframe> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;