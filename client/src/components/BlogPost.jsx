import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FaEdit, 
  FaTrash, 
  FaArrowLeft, 
  FaSpinner, 
  FaClock, 
  FaUser, 
  FaTag, 
  FaHeart,
  FaRegHeart,
  FaShare,
  FaComment,
  FaReply,
  FaPaperPlane
} from 'react-icons/fa';
import "../styles/blog-post.scss";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentReplies, setCommentReplies] = useState({});
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Scroll to comments if URL has #comments hash
    if (location.hash === '#comments') {
      setTimeout(() => {
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }

    // Check if user is admin and get user info
    checkUserStatus();
    // Fetch blog post
    fetchPost();
    // Reset confirmDelete if user navigates back to this page
    setConfirmDelete(false);
  }, [id, location.hash]);

  // Check if user is admin and get user info
  const checkUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get('/api/auth/me', config);
      if (response.data && response.data.data) {
        const user = response.data.data;
        setCurrentUser(user);
        setIsAdmin(
          (user.role && user.role.toLowerCase() === 'admin') || 
          (user.isAdmin === true) ||
          (user.permissions && user.permissions.includes('admin'))
        );
      }
    } catch (err) {
      console.error('Error checking user status:', err);
    }
  };

  // Fetch blog post
  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/blog/${id}`);
      
      if (response.data.success) {
        const postData = response.data.data;
        setPost(postData);
        setLikeCount(postData.likes || 0);
        setIsLiked(postData.isLiked || false);
        
        // Fetch related posts if category exists
        if (postData.category) {
          fetchRelatedPosts(postData.category, postData._id);
        }
        
        // Fetch comments
        fetchComments(postData._id);
      } else {
        setError('Failed to load blog post');
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError('Failed to load blog post. Please try again later.');
      setIsLoading(false);
    }
  };

  // Fetch related posts
  const fetchRelatedPosts = async (category, currentPostId) => {
    try {
      const response = await axios.get(`/api/blog/related/${category}?exclude=${currentPostId}`);
      if (response.data.success) {
        setRelatedPosts(response.data.data.slice(0, 3)); // Limit to 3 related posts
      }
    } catch (err) {
      console.error('Error fetching related posts:', err);
    }
  };

  // Fetch comments
  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`/api/blog/${postId}/comments`);
      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  // Handle post deletion
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.delete(`/api/blog/${id}`, config);
      navigate('/blog');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Handle like button click
  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to like posts.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`/api/blog/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setIsLiked(response.data.isLiked);
        setLikeCount(response.data.likes);
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Handle share button click
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to comment.');
      navigate('/login');
      return;
    }

    try {
      setSubmittingComment(true);
      
      const response = await axios.post(`/api/blog/${id}/comments`, 
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setComments([response.data.data, ...comments]);
        setNewComment('');
      }
      
      setSubmittingComment(false);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setSubmittingComment(false);
    }
  };

  // Handle reply to comment
  const handleReply = async (commentId) => {
    const replyText = commentReplies[commentId];
    if (!replyText || !replyText.trim()) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to reply.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`/api/blog/${id}/comments/${commentId}/replies`, 
        { content: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Update comments with the new reply
        const updatedComments = comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), response.data.data]
            };
          }
          return comment;
        });
        
        setComments(updatedComments);
        
        // Clear the reply input
        setCommentReplies({
          ...commentReplies,
          [commentId]: ''
        });
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
    }
  };

  // Toggle reply form visibility
  const toggleReplyForm = (commentId) => {
    setCommentReplies({
      ...commentReplies,
      [commentId]: commentReplies[commentId] || ''
    });
  };

  if (isLoading) {
    return (
      <div className="blog-post-container">
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post-container">
        <div className="error-container">
          <p>{error || 'Blog post not found'}</p>
          <Link to="/blog" className="back-link">
            <FaArrowLeft /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-container">
      <div className="blog-post-header">
        <Link to="/blog" className="back-link">
          <FaArrowLeft /> Back to Blog
        </Link>
        
        {isAdmin && (
          <div className="admin-actions">
            <Link to={`/blog/edit/${id}`} className="edit-btn">
              <FaEdit /> Edit
            </Link>
            <button 
              className={`delete-btn ${confirmDelete ? 'confirm' : ''}`} 
              onClick={handleDelete}
            >
              <FaTrash /> {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      <article className="blog-post">
        {post.coverImage && (
          <div className="blog-post-image">
            <img src={post.coverImage} alt={post.title} />
            {post.category && (
              <span className="blog-post-category">{post.category}</span>
            )}
          </div>
        )}

        <div className="blog-post-content">
          <h1>{post.title}</h1>
          
          <div className="blog-post-meta">
            <div className="meta-item">
              <FaClock /> {formatDate(post.createdAt)}
            </div>
            {post.author && (
              <div className="meta-item">
                <FaUser /> {post.author.name}
              </div>
            )}
            {post.category && (
              <div className="meta-item">
                <FaTag /> {post.category}
              </div>
            )}
            {post.views !== undefined && (
              <div className="meta-item views">
                {post.views} views
              </div>
            )}
          </div>
          
          <div className="blog-post-social">
            <button 
              className={`blog-social-btn like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />} {likeCount}
            </button>
            
            <a 
              href="#comments-section" 
              className="blog-social-btn comment-btn"
            >
              <FaComment /> {comments.length}
            </a>
            
            <button 
              className="blog-social-btn share-btn"
              onClick={handleShare}
            >
              <FaShare /> Share
            </button>
          </div>
          
          <div 
            className="blog-post-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {post.tags && post.tags.length > 0 && (
            <div className="blog-post-tags">
              {post.tags.map((tag, index) => (
                <Link key={index} to={`/blog?tag=${tag}`} className="tag">
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Comments Section */}
      <div id="comments-section" className="comments-section">
        <h3 className="comments-title">Comments ({comments.length})</h3>
        
        {/* Comment Form */}
        <div className="comment-form-container">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={currentUser ? "Write a comment..." : "Please log in to comment"}
              disabled={!currentUser || submittingComment}
              required
            />
            <button 
              type="submit" 
              className="submit-comment-btn"
              disabled={!currentUser || submittingComment}
            >
              {submittingComment ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
            </button>
          </form>
        </div>
        
        {/* Comments List */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment._id} className="comment">
                <div className="comment-header">
                  <div className="comment-user">
                    <div className="user-avatar">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{comment.user.name}</span>
                      <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="comment-content">
                  {comment.content}
                </div>
                
                <div className="comment-actions">
                  <button 
                    className="reply-btn"
                    onClick={() => toggleReplyForm(comment._id)}
                  >
                    <FaReply /> Reply
                  </button>
                </div>
                
                {/* Reply Form */}
                {commentReplies[comment._id] !== undefined && (
                  <div className="reply-form-container">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleReply(comment._id);
                      }} 
                      className="reply-form"
                    >
                      <textarea
                        value={commentReplies[comment._id]}
                        onChange={(e) => setCommentReplies({
                          ...commentReplies,
                          [comment._id]: e.target.value
                        })}
                        placeholder={currentUser ? "Write a reply..." : "Please log in to reply"}
                        disabled={!currentUser}
                        required
                      />
                      <div className="reply-form-actions">
                        <button 
                          type="button" 
                          className="cancel-reply-btn"
                          onClick={() => setCommentReplies({
                            ...commentReplies,
                            [comment._id]: undefined
                          })}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="submit-reply-btn"
                          disabled={!currentUser}
                        >
                          Reply
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="comment-replies">
                    {comment.replies.map(reply => (
                      <div key={reply._id} className="reply">
                        <div className="reply-header">
                          <div className="reply-user">
                            <div className="user-avatar small">
                              {reply.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                              <span className="user-name">{reply.user.name}</span>
                              <span className="reply-time">{timeAgo(reply.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="reply-content">
                          {reply.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="related-posts">
          <h3>Related Posts</h3>
          <div className="related-posts-grid">
            {relatedPosts.map(relatedPost => (
              <Link to={`/blog/${relatedPost._id}`} key={relatedPost._id} className="related-post-card">
                {relatedPost.coverImage && (
                  <div className="related-post-image">
                    <img src={relatedPost.coverImage} alt={relatedPost.title} />
                  </div>
                )}
                <div className="related-post-info">
                  <h4>{relatedPost.title}</h4>
                  <span className="related-post-date">{formatDate(relatedPost.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPost;