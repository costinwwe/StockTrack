import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPlus, 
  FaSearch, 
  FaSpinner, 
  FaFilter, 
  FaHeart, 
  FaComment, 
  FaShare
} from 'react-icons/fa';
import "../styles/blog.scss";

const Blog = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Parse query parameters for filtering
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    const tagParam = queryParams.get('tag');
    const pageParam = queryParams.get('page');
    const searchParam = queryParams.get('search');
    
    if (categoryParam) setSelectedCategory(categoryParam);
    if (pageParam) setPage(parseInt(pageParam, 10));
    if (searchParam) setSearchTerm(searchParam);
    
    // Check if user is admin
    checkUserStatus();
    
    // Fetch blog posts and categories
    fetchCategories();
    fetchPosts(pageParam || 1, categoryParam, searchParam, tagParam);
  }, [location.search]);

  // Check if user is admin
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

  // Fetch blog categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/blog/categories');
      if (response.data.success && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch blog posts
  const fetchPosts = async (pageNum = 1, category = '', search = '', tag = '') => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = `/api/blog?page=${pageNum}`;
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${search}`;
      if (tag) url += `&tag=${tag}`;
      
      console.log('Fetching posts from:', url);
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        console.log('Posts fetched successfully:', response.data);
        setPosts(response.data.data);
        
        // Handle pagination data
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
        } else {
          setTotalPages(Math.ceil(response.data.count / 10)); // Assume 10 posts per page as default
        }
      } else {
        setError('Failed to fetch blog posts');
        setPosts([]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Unable to fetch blog posts. Please try again later.');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/blog?search=${searchTerm}`);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    navigate(category ? `/blog?category=${category}` : '/blog');
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    
    let url = `/blog?page=${newPage}`;
    if (selectedCategory) url += `&category=${selectedCategory}`;
    if (searchTerm) url += `&search=${searchTerm}`;
    
    navigate(url);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Generate excerpt from content
  const generateExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle quick like function (toggle)
  const handleLike = async (postId, e) => {
    e.preventDefault(); // Prevent navigation to blog post page
    e.stopPropagation(); // Prevent event bubbling
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to like posts.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`/api/blog/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Update the posts list with the updated like count and isLiked status
        setPosts(posts.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                likes: response.data.likes ? 
                  (typeof response.data.likes === 'number' ? 
                    // Handle if backend returns a count instead of the array
                    Array(response.data.likes).fill(1) : 
                    response.data.likes) : 
                  (post.likes || []),
                isLiked: response.data.isLiked 
              } 
            : post
        ));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Handle share function
  const handleShare = (postId, title, e) => {
    e.preventDefault(); // Prevent navigation to blog post page
    e.stopPropagation(); // Prevent event bubbling
    
    if (navigator.share) {
      navigator.share({
        title: title,
        url: `${window.location.origin}/blog/${postId}`
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support navigator.share
      const url = `${window.location.origin}/blog/${postId}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blog</h1>
        <div className="blog-controls">
          <form className="search-container" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FaSearch className="search-icon" />
            </button>
          </form>
          
          <div className="filter-container">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="category-filter"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
            <FaFilter className="filter-icon" />
          </div>
          
          {isAdmin && (
            <Link to="/blog/new" className="create-post-btn">
              <FaPlus /> New Post
            </Link>
          )}
        </div>
        
        {error && (
          <div className="development-notice">
            <p>{error}</p>
            {isAdmin && (
              <p>
                As an admin, you can still use the blog editor to see how the UI works.
              </p>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading blog posts...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="no-posts">
          <h2>No blog posts found</h2>
          {isAdmin && (
            <p>
              Get started by <Link to="/blog/new">creating your first post</Link>.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="blog-grid">
            {filteredPosts.map((post) => (
              <div key={post._id} className="blog-card-wrapper">
                <Link to={`/blog/${post._id}`} className="blog-card">
                  {post.coverImage && (
                    <div className="blog-image">
                      <img src={post.coverImage} alt={post.title} />
                      {post.category && (
                        <span className="blog-category">{post.category}</span>
                      )}
                    </div>
                  )}
                  <div className="blog-content">
                    <h2>{post.title}</h2>
                    <div className="blog-meta">
                      <span className="blog-date">{formatDate(post.createdAt)}</span>
                      {post.author && post.author.name && <span className="blog-author">by {post.author.name}</span>}
                    </div>
                    <p className="blog-excerpt">{generateExcerpt(post.content)}</p>
                    <span className="read-more">Read More</span>
                  </div>
                </Link>
                
                <div className="blog-social-actions">
                  <button 
                    className={`social-action-btn like-btn ${post.isLiked ? 'liked' : ''}`}
                    onClick={(e) => handleLike(post._id, e)}
                    title="Like this post"
                  >
                    <FaHeart /> <span>{Array.isArray(post.likes) ? post.likes.length : (post.likes || 0)}</span>
                  </button>
                  
                  <Link 
                    to={`/blog/${post._id}#comments`}
                    className="social-action-btn comment-btn"
                    title="View comments"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaComment /> <span>{Array.isArray(post.comments) ? post.comments.length : (post.comments || 0)}</span>
                  </Link>
                  
                  <button
                    className="social-action-btn share-btn"
                    onClick={(e) => handleShare(post._id, post.title, e)}
                    title="Share this post"
                  >
                    <FaShare />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 1}
                className="pagination-btn prev-btn"
              >
                Previous
              </button>
              
              <div className="pagination-numbers">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`pagination-number ${page === i + 1 ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page === totalPages}
                className="pagination-btn next-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Blog;