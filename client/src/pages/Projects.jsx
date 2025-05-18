import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/projects.scss';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/projects');
      console.log('API Response:', response);
      
      // Extract projects array from response based on structure
      let projectsData = [];
      
      if (response.data.data && Array.isArray(response.data.data)) {
        projectsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (response.data.projects && Array.isArray(response.data.projects)) {
        projectsData = response.data.projects;
      } else if (response.data.success && Array.isArray(response.data.data)) {
        projectsData = response.data.data;
      }
      
      setProjects(projectsData);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const projectName = prompt('Enter project name:');
      if (!projectName) return;

      const newProject = {
        name: projectName,
        description: 'New project created'
      };

      const response = await api.post('/api/projects', newProject);
      console.log('Project created:', response.data);
      
      // Refresh projects list
      fetchProjects();
      
      // Navigate to the new project if created successfully
      if (response.data && (response.data.data || response.data)) {
        const projectId = response.data.data ? response.data.data._id : response.data._id;
        navigate(`/project/${projectId}`);
      }
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    // Stop the event from propagating to the Link component
    e.preventDefault();
    e.stopPropagation();
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/projects/${projectId}`);
      
      // Update the UI by removing the deleted project
      setProjects(projects.filter(project => (project._id || project.id) !== projectId));
      
      // Show success message
      alert('Project deleted successfully');
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="projects-container">
        <h2>My Projects</h2>
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-container">
        <h2>My Projects</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h2>My Projects</h2>
        <button className="create-project-btn" onClick={handleCreateProject}>
          + Create New Project
        </button>
      </div>
      
      {!projects || projects.length === 0 ? (
        <div className="no-projects">
          <p>No projects found</p>
          <button className="create-project-btn" onClick={handleCreateProject}>
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => {
            const projectId = project._id || project.id;
            return (
              <Link 
                to={`/project/${projectId}`} 
                key={projectId} 
                className="project-card"
              >
                <div className="project-info">
                  <h3>{project.name}</h3>
                  <p className="project-description">{project.description || 'No description'}</p>
                  <div className="project-meta">
                    <span className="project-date">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className="project-tables">
                      {project.tables ? project.tables.length : 0} tables
                    </span>
                  </div>
                  <button 
                    className="delete-project-btn" 
                    onClick={(e) => handleDeleteProject(projectId, e)}
                  >
                    Delete Project
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;