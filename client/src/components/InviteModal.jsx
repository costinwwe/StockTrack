// src/components/collaboration/InviteModal.jsx
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const InviteModal = ({ teamId, teamName, onInvite, onClose }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isValid, setIsValid] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmail(email);
    setIsValid(validateEmail(email));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isValid) {
      return;
    }
    
    onInvite(teamId, {
      email,
      role
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container invite-modal">
        <div className="modal-header">
          <h2>Invite to {teamName}</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter email address"
                required
              />
              {email && !isValid && (
                <p className="validation-error">Please enter a valid email address</p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select 
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="invite-button"
                disabled={!isValid}
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;