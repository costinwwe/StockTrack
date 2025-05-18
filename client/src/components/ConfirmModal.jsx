// src/components/collaboration/ConfirmModal.jsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ConfirmModal = ({ 
  title, 
  message, 
  confirmText, 
  cancelText, 
  onConfirm, 
  onCancel,
  danger 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container confirm-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <p className="confirm-message">{message}</p>
          
          <div className="confirm-actions">
            <button className="cancel-button" onClick={onCancel}>
              {cancelText || 'Cancel'}
            </button>
            <button 
              className={`confirm-button ${danger ? 'danger' : ''}`}
              onClick={onConfirm}
            >
              {confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;