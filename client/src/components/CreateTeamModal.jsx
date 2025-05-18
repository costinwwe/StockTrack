// src/components/collaboration/CreateTeamModal.jsx
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const CreateTeamModal = ({ onCreate, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isValid, setIsValid] = useState(false);

  const validateForm = (name) => {
    return name.trim().length > 0;
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setName(name);
    setIsValid(validateForm(name));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isValid) {
      return;
    }
    
    onCreate({
      name,
      description
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container create-team-modal">
        <div className="modal-header">
          <h2>Create New Team</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Team Name</label>
              <input 
                type="text"
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter team name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter team description"
                rows="3"
              />
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="create-button"
                disabled={!isValid}
              >
                Create Team
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamModal;