// src/components/collaboration/ProjectComments.jsx
import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const ProjectComments = ({ comments, onAddComment, canComment }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      return;
    }
    
    onAddComment(commentText);
    setCommentText('');
  };

  return (
    <div className="project-comments">
      {comments.length === 0 ? (
        <div className="no-comments">
          <p>No comments yet</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment._id} className="comment-item">
              <div className="comment-avatar">
                {comment.user.profileImage ? (
                  <img 
                    src={`/uploads/${comment.user.profileImage}`} 
                    alt={comment.user.name} 
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {comment.user.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.user.name}</span>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="comment-text">{comment.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {canComment && (
        <div className="comment-form-container">
          <form onSubmit={handleSubmit} className="comment-form">
            <div className="comment-input">
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows="2"
              />
            </div>
            <button 
              type="submit" 
              className="submit-comment"
              disabled={!commentText.trim()}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
      
      {!canComment && (
        <div className="comment-restricted">
          <p>You don't have permission to comment on this project</p>
        </div>
      )}
    </div>
  );
};

export default ProjectComments;