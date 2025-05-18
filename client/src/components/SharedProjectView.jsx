// src/components/collaboration/SharedProjectView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaComment, FaEye, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import api from '../../utils/api';
import ProjectComments from './ProjectComments';

const SharedProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sharedProject, setSharedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchSharedProject = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/shared-projects/${id}`);
        setSharedProject(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load shared project');
        setLoading(false);
      }
    };
    
    fetchSharedProject();
  }, [id]);

  const handleAddComment = async (text) => {
    try {
      const response = await api.post(`/api/shared-projects/${id}/comments`, { text });
      
      // Add new comment to the list
      setSharedProject({
        ...sharedProject,
        comments: [...sharedProject.comments, response.data.data]
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="shared-project-loading">
        <div className="spinner"></div>
        <p>Loading shared project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/collaboration')}>
          Back to Collaboration Hub
        </button>
      </div>
    );
  }

  if (!sharedProject) {
    return (
      <div className="not-found-container">
        <h2>Shared Project Not Found</h2>
        <p>The shared project you're looking for doesn't exist or you don't have access to it.</p>
        <button onClick={() => navigate('/collaboration')}>
          Back to Collaboration Hub
        </button>
      </div>
    );
  }

  const userAccessLevel = sharedProject.sharedWith.find(
    s => s.user._id === localStorage.getItem('userId')
  )?.accessLevel || 'view';

  const isOwner = sharedProject.owner._id === localStorage.getItem('userId');
  const canComment = isOwner || ['comment', 'edit'].includes(userAccessLevel);

  return (
    <div className="shared-project-view">
      <div className="project-view-header">
        <button className="back-button" onClick={() => navigate('/collaboration')}>
          <FaArrowLeft /> Back to Collaboration
        </button>
        
        <div className="project-title">
          <h1>{sharedProject.project.name}</h1>
          <span className={`access-badge ${isOwner ? 'owner' : userAccessLevel}`}>
            {isOwner ? 'Owner' : userAccessLevel.charAt(0).toUpperCase() + userAccessLevel.slice(1)}
          </span>
        </div>
        
        <p className="project-description">
          {sharedProject.project.description || 'No description provided'}
        </p>
        
        <div className="project-meta">
          <div className="meta-item">
            <FaUsers className="meta-icon" />
            <span>Shared with {sharedProject.team.name} team</span>
          </div>
          <div className="meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span>Shared on {new Date(sharedProject.sharedAt).toLocaleDateString()}</span>
          </div>
          <div className="meta-item">
            <FaEye className="meta-icon" />
            <span>{sharedProject.views.length} views</span>
          </div>
        </div>
      </div>
      
      <div className="project-view-tabs">
        <button 
          className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Project Details
        </button>
        <button 
          className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments ({sharedProject.comments.length})
        </button>
      </div>
      
      <div className="project-view-content">
        {activeTab === 'details' && (
          <div className="project-details">
            <div className="project-content">
              {/* Render project content here */}
              <div className="project-data">
                {/* This would render the actual project data */}
                <h3>Project Content</h3>
                <p>
                  This is where the actual project content would be displayed.
                  For demonstration purposes, we're showing placeholder content.
                </p>
                <div className="placeholder-content">
                  <div className="placeholder-block"></div>
                  <div className="placeholder-block"></div>
                  <div className="placeholder-block"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'comments' && (
          <ProjectComments 
            comments={sharedProject.comments}
            onAddComment={handleAddComment}
            canComment={canComment}
          />
        )}
      </div>
    </div>
  );
};

export default SharedProjectView;