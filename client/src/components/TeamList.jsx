// src/components/collaboration/TeamList.jsx
import React from 'react';
import { FaUsers, FaUserPlus, FaPlus } from 'react-icons/fa';

const TeamList = ({ teams, onSelectTeam, onCreateTeam }) => {
  if (!teams.length) {
    return (
      <div className="empty-state">
        <FaUsers className="empty-icon" />
        <h3>No Teams Yet</h3>
        <p>Create a team to start collaborating with others</p>
        <button className="primary-button" onClick={onCreateTeam}>
          <FaPlus /> Create Your First Team
        </button>
      </div>
    );
  }

  return (
    <div className="team-list">
      <div className="team-list-header">
        <h2>My Teams</h2>
        <button className="small-button" onClick={onCreateTeam}>
          <FaPlus /> New Team
        </button>
      </div>
      
      <div className="team-grid">
        {teams.map(team => (
          <div 
            key={team._id} 
            className="team-card"
            onClick={() => onSelectTeam(team._id)}
          >
            <div className="team-card-header">
              <h3>{team.name}</h3>
              {team.isOwner && <span className="owner-badge">Owner</span>}
            </div>
            
            <p className="team-description">
              {team.description || 'No description provided'}
            </p>
            
            <div className="team-stats">
              <div className="stat">
                <span className="stat-value">{team.memberCount}</span>
                <span className="stat-label">Members</span>
              </div>
              <div className="stat">
                <span className="stat-value">{team.sharedProjectCount || 0}</span>
                <span className="stat-label">Projects</span>
              </div>
            </div>
            
            <div className="team-members-preview">
              {team.members.slice(0, 3).map(member => (
                <div key={member.user._id} className="member-avatar">
                  {member.user.profileImage ? (
                    <img 
                      src={`/uploads/${member.user.profileImage}`} 
                      alt={member.user.name} 
                      title={member.user.name}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {member.user.name.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
              
              {team.members.length > 3 && (
                <div className="member-count">
                  +{team.members.length - 3}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamList;