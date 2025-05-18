// src/components/collaboration/TeamDetail.jsx
import React, { useState } from 'react';
import { FaArrowLeft, FaEdit, FaTrash, FaUserPlus, FaShareAlt, FaEye } from 'react-icons/fa';
import EditTeamModal from './EditTeamModal';
import ConfirmModal from './ConfirmModal';

const TeamDetail = ({ 
  team, 
  onUpdateTeam, 
  onDeleteTeam, 
  onInviteMember, 
  onViewSharedProject,
  onBack 
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('members');

  const isOwner = team.owner._id === localStorage.getItem('userId');
  const isAdmin = team.members.some(member => 
    member.user._id === localStorage.getItem('userId') && member.role === 'admin'
  );

  return (
    <div className="team-detail">
      <div className="team-detail-header">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft />
        </button>
        
        <h2>{team.name}</h2>
        
        {team.description && <p className="team-description">{team.description}</p>}
        
        <div className="team-actions">
          {(isOwner || isAdmin) && (
            <>
              <button className="action-button" onClick={() => setShowEditModal(true)}>
                <FaEdit /> Edit Team
              </button>
              <button className="action-button invite-button" onClick={onInviteMember}>
                <FaUserPlus /> Invite Member
              </button>
            </>
          )}
          
          {isOwner && (
            <button className="action-button delete-button" onClick={() => setShowDeleteModal(true)}>
              <FaTrash /> Delete Team
            </button>
          )}
        </div>
      </div>
      
      <div className="team-detail-tabs">
        <button 
          className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button 
          className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Shared Projects
        </button>
      </div>
      
      <div className="team-detail-content">
        {activeTab === 'members' && (
          <div className="members-list">
            <div className="list-header">
              <h3>Team Members</h3>
              {(isOwner || isAdmin) && (
                <button className="small-button" onClick={onInviteMember}>
                  <FaUserPlus /> Invite
                </button>
              )}
            </div>
            
            <div className="member-grid">
              {team.members.map(member => (
                <div key={member.user._id} className="member-card">
                  <div className="member-avatar">
                    {member.user.profileImage ? (
                      <img 
                        src={`/uploads/${member.user.profileImage}`} 
                        alt={member.user.name} 
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {member.user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="member-info">
                    <h4>{member.user.name}</h4>
                    <p className="member-email">{member.user.email}</p>
                    <p className="member-role">
                      <span className={`role-badge ${member.role}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      {member.user._id === team.owner._id && (
                        <span className="owner-indicator">(Owner)</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'projects' && (
          <div className="shared-projects-list">
            <div className="list-header">
              <h3>Shared Projects</h3>
            </div>
            
            {!team.sharedProjects || team.sharedProjects.length === 0 ? (
              <div className="empty-state">
                <FaShareAlt className="empty-icon" />
                <h3>No Shared Projects</h3>
                <p>No projects have been shared with this team yet</p>
              </div>
            ) : (
              <div className="project-grid">
                {team.sharedProjects.map(shared => (
                  <div key={shared._id} className="project-card">
                    <h4>{shared.project.name}</h4>
                    <p className="project-description">
                      {shared.project.description || 'No description provided'}
                    </p>
                    
                    <div className="project-meta">
                      <div className="shared-by">
                        <span className="meta-label">Shared by:</span>
                        <span className="meta-value">{shared.sharedBy.name}</span>
                      </div>
                      <div className="shared-date">
                        <span className="meta-label">Date:</span>
                        <span className="meta-value">
                          {new Date(shared.sharedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="access-level">
                        <span className="meta-label">Access:</span>
                        <span className={`access-badge ${shared.accessLevel}`}>
                          {shared.accessLevel}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="view-button"
                      onClick={() => onViewSharedProject(shared._id)}
                    >
                      <FaEye /> View Project
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showEditModal && (
        <EditTeamModal 
          team={team}
          onUpdate={(teamData) => {
            onUpdateTeam(team._id, teamData);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}
      
      {showDeleteModal && (
        <ConfirmModal
          title="Delete Team"
          message={`Are you sure you want to delete the team "${team.name}"? This action cannot be undone.`}
          confirmText="Delete Team"
          cancelText="Cancel"
          onConfirm={() => {
            onDeleteTeam(team._id);
            setShowDeleteModal(false);
          }}
          onCancel={() => setShowDeleteModal(false)}
          danger
        />
      )}
    </div>
  );
};

export default TeamDetail;