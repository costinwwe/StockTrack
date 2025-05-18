// src/components/collaboration/CollaborationHub.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaProjectDiagram, FaShareAlt, FaPlus, 
  FaUserPlus, FaTrash, FaEdit, FaEye, FaComment
} from 'react-icons/fa';
import TeamList from '../components/TeamList';
import SharedProjects from '../components/SharedProjects';
import TeamDetail from '../components/TeamDetail';
import InviteModal from '../components/InviteModal';
import ShareProjectModal from '../components/ShareProjectModal';
import CreateTeamModal from '../components/CreateTeamModal';
import api from '../utils/api';
import '../styles/collaboration-hub.scss';

const CollaborationHub = () => {
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch teams
        const teamsResponse = await api.get('/api/teams');
        setTeams(teamsResponse.data.data);
        
        // Fetch shared projects
        const projectsResponse = await api.get('/api/shared-projects');
        setSharedProjects(projectsResponse.data.data);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load collaboration data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTeamSelect = async (teamId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/teams/${teamId}`);
      setSelectedTeam(response.data.data);
      setActiveTab('team-detail');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load team details');
      setLoading(false);
    }
  };

  const handleCreateTeam = async (teamData) => {
    try {
      setLoading(true);
      const response = await api.post('/api/teams', teamData);
      setTeams([...teams, response.data.data]);
      setShowCreateTeamModal(false);
      setLoading(false);
      // Select the newly created team
      handleTeamSelect(response.data.data._id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team');
      setLoading(false);
    }
  };

  const handleUpdateTeam = async (teamId, teamData) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/teams/${teamId}`, teamData);
      
      // Update teams list
      setTeams(teams.map(team => 
        team._id === teamId ? response.data.data : team
      ));
      
      // Update selected team if it's the one being edited
      if (selectedTeam && selectedTeam._id === teamId) {
        setSelectedTeam(response.data.data);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update team');
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      setLoading(true);
      await api.delete(`/api/teams/${teamId}`);
      
      // Remove team from list
      setTeams(teams.filter(team => team._id !== teamId));
      
      // If the deleted team was selected, go back to teams list
      if (selectedTeam && selectedTeam._id === teamId) {
        setSelectedTeam(null);
        setActiveTab('teams');
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete team');
      setLoading(false);
    }
  };

  const handleInviteUser = async (teamId, inviteData) => {
    try {
      setLoading(true);
      await api.post(`/api/teams/${teamId}/invite`, inviteData);
      
      // Refresh team data
      if (selectedTeam && selectedTeam._id === teamId) {
        const response = await api.get(`/api/teams/${teamId}`);
        setSelectedTeam(response.data.data);
      }
      
      setShowInviteModal(false);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send invitation');
      setLoading(false);
    }
  };

  const handleShareProject = async (projectId, shareData) => {
    try {
      setLoading(true);
      const response = await api.post(`/api/projects/${projectId}/share`, shareData);
      
      // Add to shared projects
      setSharedProjects([response.data.data, ...sharedProjects]);
      
      // Refresh team data if current team is the one we shared with
      if (selectedTeam && selectedTeam._id === shareData.teamId) {
        const teamResponse = await api.get(`/api/teams/${shareData.teamId}`);
        setSelectedTeam(teamResponse.data.data);
      }
      
      setShowShareModal(false);
      setSelectedProject(null);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share project');
      setLoading(false);
    }
  };

  const handleRemoveSharing = async (sharedProjectId) => {
    try {
      setLoading(true);
      await api.delete(`/api/shared-projects/${sharedProjectId}`);
      
      // Remove from shared projects list
      setSharedProjects(sharedProjects.filter(sp => sp._id !== sharedProjectId));
      
      // If we're in team detail, refresh team data
      if (selectedTeam) {
        const teamResponse = await api.get(`/api/teams/${selectedTeam._id}`);
        setSelectedTeam(teamResponse.data.data);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove sharing');
      setLoading(false);
    }
  };

  const handleViewSharedProject = (sharedProjectId) => {
    navigate(`/collaboration/shared-projects/${sharedProjectId}`);
  };

  if (loading && !teams.length && !sharedProjects.length) {
    return (
      <div className="collaboration-loading">
        <div className="spinner"></div>
        <p>Loading collaboration hub...</p>
      </div>
    );
  }

  return (
    <div className="collaboration-container">
      <header className="collaboration-header">
        <h1>Collaboration Hub</h1>
        <p>Manage teams and share projects with your collaborators</p>
        
        <div className="header-actions">
          <button 
            className="create-team-btn"
            onClick={() => setShowCreateTeamModal(true)}
          >
            <FaPlus /> Create Team
          </button>
          
          <button 
            className="share-project-btn"
            onClick={() => setShowShareModal(true)}
            disabled={!teams.length}
          >
            <FaShareAlt /> Share Project
          </button>
        </div>
      </header>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="collaboration-tabs">
        <button 
          className={`tab-button ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          <FaUsers /> My Teams
        </button>
        <button 
          className={`tab-button ${activeTab === 'shared' ? 'active' : ''}`}
          onClick={() => setActiveTab('shared')}
        >
          <FaProjectDiagram /> Shared Projects
        </button>
      </div>
      
      <div className="collaboration-content">
        {activeTab === 'teams' && (
          <TeamList 
            teams={teams}
            onSelectTeam={handleTeamSelect}
            onCreateTeam={() => setShowCreateTeamModal(true)}
          />
        )}
        
        {activeTab === 'team-detail' && selectedTeam && (
          <TeamDetail 
            team={selectedTeam}
            onUpdateTeam={handleUpdateTeam}
            onDeleteTeam={handleDeleteTeam}
            onInviteMember={() => setShowInviteModal(true)}
            onViewSharedProject={handleViewSharedProject}
            onBack={() => {
              setSelectedTeam(null);
              setActiveTab('teams');
            }}
          />
        )}
        
        {activeTab === 'shared' && (
          <SharedProjects 
            sharedProjects={sharedProjects}
            onView={handleViewSharedProject}
            onRemoveSharing={handleRemoveSharing}
          />
        )}
      </div>
      
      {/* Modals */}
      {showInviteModal && (
        <InviteModal 
          teamId={selectedTeam?._id}
          teamName={selectedTeam?.name}
          onInvite={handleInviteUser}
          onClose={() => setShowInviteModal(false)}
        />
      )}
      
      {showShareModal && (
        <ShareProjectModal 
          teams={teams}
          onShare={handleShareProject}
          onClose={() => setShowShareModal(false)}
          onSelectProject={(project) => setSelectedProject(project)}
          selectedProject={selectedProject}
        />
      )}
      
      {showCreateTeamModal && (
        <CreateTeamModal 
          onCreate={handleCreateTeam}
          onClose={() => setShowCreateTeamModal(false)}
        />
      )}
    </div>
  );
};

export default CollaborationHub;