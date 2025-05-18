// src/components/collaboration/SharedProjects.jsx
import React from 'react';
import { FaEye, FaTrash, FaComment, FaProjectDiagram } from 'react-icons/fa';

const SharedProjects = ({ sharedProjects, onView, onRemoveSharing }) => {
  if (!sharedProjects.length) {
    return (
      <div className="empty-state">
        <FaProjectDiagram className="empty-icon" />
        <h3>No Shared Projects</h3>
        <p>You don't have any shared projects yet</p>
      </div>
    );
  }

  return (
    <div className="shared-projects">
      <h2>Shared Projects</h2>
      
      <div className="projects-grid">
        {sharedProjects.map(shared => {
          const isOwner = shared.owner._id === localStorage.getItem('userId');
          
          return (
            <div key={shared._id} className="shared-project-card">
              <div className="project-header">
                <h3>{shared.project.name}</h3>
                <span className={`access-badge ${shared.accessLevel}`}>
                  {shared.accessLevel}
                </span>
              </div>
              
              <p className="project-description">
                {shared.project.description || 'No description provided'}
              </p>
              
              <div className="project-meta">
                <div className="team-info">
                  <span className="meta-label">Team:</span>
                  <span className="meta-value">{shared.team.name}</span>
                </div>
                
                <div className="shared-info">
                  {isOwner ? (
                    <span className="meta-value">You shared this</span>
                  ) : (
                    <>
                      <span className="meta-label">Shared by:</span>
                      <span className="meta-value">{shared.owner.name}</span>
                    </>
                  )}
                </div>
                
                <div className="date-info">
                  <span className="meta-label">Date:</span>
                  <span className="meta-value">
                    {new Date(shared.sharedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="project-actions">
                <button 
                  className="action-button view-button"
                  onClick={() => onView(shared._id)}
                >
                  <FaEye /> View
                </button>
                
                <button 
                  className="action-button comment-button"
                  onClick={() => onView(shared._id)}
                >
                  <FaComment /> Comment
                </button>
                
                {isOwner && (
                  <button 
                    className="action-button remove-button"
                    onClick={() => onRemoveSharing(shared._id)}
                  >
                    <FaTrash /> Remove Sharing
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SharedProjects;