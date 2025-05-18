import React, { useState, useEffect } from 'react';
import { FaUser, FaCamera, FaBuilding, FaPhone, FaMapMarkerAlt, FaBriefcase, FaEnvelope, FaLock, FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import '../styles/profile.scss';

const Profile = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Form data states
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    company: '',
    jobTitle: '',
    phoneNumber: ''
  });
  
  const [addressInfo, setAddressInfo] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required. Please log in.');
          setLoading(false);
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const res = await axios.get('/api/auth/me', config);
        const userData = res.data.data;
        
        setUser(userData);
        
        // Set form data from user data
        setPersonalInfo({
          name: userData.name || '',
          email: userData.email || '',
          company: userData.company || '',
          jobTitle: userData.jobTitle || '',
          phoneNumber: userData.phoneNumber || ''
        });
        
        setAddressInfo({
          street: userData.address?.street || '',
          city: userData.address?.city || '',
          state: userData.address?.state || '',
          zipCode: userData.address?.zipCode || '',
          country: userData.address?.country || ''
        });
        
        // Set profile image with the base URL
        if (userData.profileImage) {
          const baseUrl = 'http://localhost:5000'; // Your API server base URL
          const imageUrl = `${baseUrl}/uploads/${userData.profileImage}`;
          console.log("Image URL:", imageUrl); // For debugging
          setImagePreview(imageUrl);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load user data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSuccessMessage('');
    setError('');
  };
  
  // Handle personal info form change
  const handlePersonalInfoChange = (e) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle address info form change
  const handleAddressInfoChange = (e) => {
    setAddressInfo({
      ...addressInfo,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle password info form change
  const handlePasswordInfoChange = (e) => {
    setPasswordInfo({
      ...passwordInfo,
      [e.target.name]: e.target.value
    });
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };
  
  // Handle profile image change
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 1MB)
      if (file.size > 1000000) {
        setError('Image size should not exceed 1MB');
        return;
      }
      
      // Check file type
      const fileType = file.type.split('/')[0];
      if (fileType !== 'image') {
        setError('Please select an image file');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };
  
  // Handle personal info form submit
  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const res = await axios.put('/api/users/profile', personalInfo, config);
      
      // Update user state
      setUser(res.data.data);
      
      setSuccessMessage('Personal information updated successfully');
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to update personal information. Please try again.'
      );
      setLoading(false);
    }
  };
  
  // Handle address info form submit
  const handleAddressInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const updateData = {
        address: addressInfo
      };
      
      const res = await axios.put('/api/users/profile', updateData, config);
      
      // Update user state
      setUser(res.data.data);
      
      setSuccessMessage('Address information updated successfully');
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to update address information. Please try again.'
      );
      setLoading(false);
    }
  };
  
  // Handle profile image form submit
  const handleProfileImageSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileImage) {
      setError('Please select an image to upload');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('profileImage', profileImage);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const res = await axios.put('/api/users/profile', formData, config);
      
      // Update user state
      setUser(res.data.data);
      
      // Update the image preview with the new URL
      if (res.data.data.profileImage) {
        const baseUrl = 'http://localhost:5000';
        const imageUrl = `${baseUrl}/uploads/${res.data.data.profileImage}`;
        setImagePreview(imageUrl);
      }
      
      setSuccessMessage('Profile image updated successfully');
      setProfileImage(null);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to update profile image. Please try again.'
      );
      setLoading(false);
    }
  };
  
  // Handle password change form submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    // Check if passwords match
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const { confirmPassword, ...passwordData } = passwordInfo;
      
      await axios.put('/api/users/change-password', passwordData, config);
      
      setSuccessMessage('Password changed successfully');
      setPasswordInfo({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to change password. Please try again.'
      );
      setLoading(false);
    }
  };

  if (loading && !user.name) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>

      {error && <div className="profile-error">{error}</div>}
      {successMessage && <div className="profile-success">{successMessage}</div>}

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-container">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  onError={(e) => {
                    console.log("Image failed to load:", imagePreview); // Add debugging
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="%23718096"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';
                  }}
                />
              ) : (
                <div className="avatar-placeholder">
                  <FaUser />
                </div>
              )}
              <form onSubmit={handleProfileImageSubmit}>
                <div className="avatar-upload">
                  <label htmlFor="profile-image">
                    <FaCamera />
                  </label>
                  <input
                    type="file"
                    id="profile-image"
                    onChange={handleImageChange}
                    accept="image/*"
                    hidden
                  />
                </div>
                {profileImage && (
                  <button type="submit" className="upload-button">
                    <FaCheck /> Save Image
                  </button>
                )}
              </form>
            </div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>

          <div className="profile-nav">
            <button
              className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => handleTabChange('personal')}
            >
              <FaUser /> Personal Information
            </button>
            <button
              className={`nav-item ${activeTab === 'address' ? 'active' : ''}`}
              onClick={() => handleTabChange('address')}
            >
              <FaMapMarkerAlt /> Address
            </button>
            <button
              className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => handleTabChange('password')}
            >
              <FaLock /> Change Password
            </button>
          </div>
        </div>

        <div className="profile-details">
          {activeTab === 'personal' && (
            <div className="profile-tab-content">
              <h2>Personal Information</h2>
              <p>Update your personal details</p>

              <form onSubmit={handlePersonalInfoSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <FaUser className="form-icon" />
                    <input
                      type="text"
                      name="name"
                      value={personalInfo.name}
                      onChange={handlePersonalInfoChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <FaEnvelope className="form-icon" />
                    <input
                      type="email"
                      name="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Company</label>
                  <div className="input-with-icon">
                    <FaBuilding className="form-icon" />
                    <input
                      type="text"
                      name="company"
                      value={personalInfo.company}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Job Title</label>
                  <div className="input-with-icon">
                    <FaBriefcase className="form-icon" />
                    <input
                      type="text"
                      name="jobTitle"
                      value={personalInfo.jobTitle}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-with-icon">
                    <FaPhone className="form-icon" />
                    <input
                      type="text"
                      name="phoneNumber"
                      value={personalInfo.phoneNumber}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="save-button"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="profile-tab-content">
              <h2>Address Information</h2>
              <p>Update your address details</p>

              <form onSubmit={handleAddressInfoSubmit}>
                <div className="form-group">
                  <label>Street Address</label>
                  <div className="input-with-icon">
                    <FaMapMarkerAlt className="form-icon" />
                    <input
                      type="text"
                      name="street"
                      value={addressInfo.street}
                      onChange={handleAddressInfoChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={addressInfo.city}
                      onChange={handleAddressInfoChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>State/Province</label>
                    <input
                      type="text"
                      name="state"
                      value={addressInfo.state}
                      onChange={handleAddressInfoChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Postal/Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={addressInfo.zipCode}
                      onChange={handleAddressInfoChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={addressInfo.country}
                      onChange={handleAddressInfoChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="save-button"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="profile-tab-content">
              <h2>Change Password</h2>
              <p>Update your password</p>

              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="input-with-icon">
                    <FaLock className="form-icon" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordInfo.currentPassword}
                      onChange={handlePasswordInfoChange}
                      required
                    />
                    <div 
                      className="password-toggle" 
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-with-icon">
                    <FaLock className="form-icon" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordInfo.newPassword}
                      onChange={handlePasswordInfoChange}
                      required
                    />
                    <div 
                      className="password-toggle" 
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-with-icon">
                    <FaLock className="form-icon" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordInfo.confirmPassword}
                      onChange={handlePasswordInfoChange}
                      required
                    />
                    <div 
                      className="password-toggle" 
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                </div>

                <div className="password-requirements">
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li>Minimum 8 characters long</li>
                    <li>Include at least one uppercase letter</li>
                    <li>Include at least one lowercase letter</li>
                    <li>Include at least one number</li>
                    <li>Include at least one special character</li>
                  </ul>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="save-button"
                    disabled={loading}
                  >
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;