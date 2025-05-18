// src/components/collaboration/ShareProjectModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';
import api from '../utils/api';

const ShareProjectModal = ({ 
  teams, 
  onShare, 
  onClose, 
  onSelectProject,
  selectedProject 
}) => {
  const [teamId, setTeamId] = useState('');
  const [accessLevel, setAccessLevel] = useState('view');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/projects');
        setProjects(response.data.data);
        setFilteredProjects(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        project => project.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [searchTerm, projects]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedProject || !teamId) {
      return;
    }
    
    onShare(selectedProject._id, {
      teamId,
      accessLevel
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container share-project-modal">
        <div className="modal-header">
          <h2>Share Project with Team</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="project-selection">
            <h3>Select a Project</h3>
            
            <div className="search-input">
              <FaSearch className="search-icon" />
              <input 
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {loading ? (
              <div className="loading-projects">Loading projects...</div>
            ) : (
              <div className="project-list">
                {filteredProjects.length === 0 ? (
                  <div className="no-projects">No projects found</div>
                ) : (
                  filteredProjects.map(project => (
                    <div 
                      key={project._id}
                      className={`project-item ${selectedProject && selectedProject._id === project._id ? 'selected' : ''}`}
                      onClick={() => onSelectProject(project)}
                    >
                      <h4>{project.name}</h4>
                      <p>{project.description || 'No description'}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="share-form">
            <div className="form-group">
              <label htmlFor="team">Select Team</label>
              <select 
                id="team"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                required
              >
                <option value="">Select a team</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="access">Access Level</label>
              <select 
                id="access"
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
              >
                <option value="view">View Only</option>
                <option value="comment">Can Comment</option>
                <option value="edit">Can Edit</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="share-button"
                disabled={!selectedProject || !teamId}
              >
                Share Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareProjectModal;