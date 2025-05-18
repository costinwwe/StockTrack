import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaSave, 
  FaImage, 
  FaSpinner, 
  FaTimes, 
  FaPlus, 
  FaMinus,
  FaUndo,
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaLink,
  FaHeading
} from 'react-icons/fa';
import "../styles/blog-editor.scss";

// Import React Quill if available in your project
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);
  
  // State for form data
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [customCategories, setCustomCategories] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  
  // State for async operations
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin and fetch post data if in edit mode
  useEffect(() => {
    const checkAdminStatus = async () => {
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

        const response = await axios.get('/api/auth/me', config);
        
        if (response.data && response.data.data) {
          const user = response.data.data;
          const adminCheck = 
            (user.role && user.role.toLowerCase() === 'admin') || 
            (user.isAdmin === true) ||
            (user.permissions && user.permissions.includes('admin'));
            
          setIsAdmin(adminCheck);
          
          if (!adminCheck) {
            // Redirect non-admin users
            navigate('/blog');
          }
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        navigate('/login');
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/blog/categories');
        if (response.data.success && response.data.categories) {
          setCustomCategories(response.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    const fetchPostData = async () => {
      if (!isEditMode) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/blog/${id}`);
        
        if (response.data.success) {
          const post = response.data.data;
          setTitle(post.title || '');
          setContent(post.content || '');
          setCategory(post.category || '');
          setTags(post.tags || []);
          
          if (post.coverImage) {
            setCoverImagePreview(post.coverImage);
          }
        } else {
          setError('Failed to load post data');
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching post data:', err);
        setError('Failed to load post data. Please try again later.');
        setIsLoading(false);
      }
    };

    checkAdminStatus();
    fetchCategories();
    fetchPostData();
  }, [id, isEditMode, navigate]);

  // Handle cover image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image is too large. Maximum size is 5MB.');
      return;
    }

    setCoverImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (tags.includes(newTag.trim())) {
      alert('This tag already exists!');
      return;
    }
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle category addition
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (customCategories.includes(newCategory.trim())) {
      setCategory(newCategory.trim());
    } else {
      setCustomCategories([...customCategories, newCategory.trim()]);
      setCategory(newCategory.trim());
    }
    setNewCategory('');
    setShowCategoryInput(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title for your blog post.');
      return;
    }
    
    if (!content.trim()) {
      alert('Please enter content for your blog post.');
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      };

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (category) formData.append('category', category);
      if (tags.length > 0) formData.append('tags', JSON.stringify(tags));
      if (coverImage) formData.append('coverImage', coverImage);

      let response;
      
      if (isEditMode) {
        response = await axios.put(`/api/blog/${id}`, formData, config);
      } else {
        response = await axios.post('/api/blog', formData, config);
      }

      if (response.data.success) {
        navigate(isEditMode ? `/blog/${id}` : `/blog/${response.data.data._id}`);
      } else {
        setError('Failed to save blog post');
        setIsSaving(false);
      }
    } catch (err) {
      console.error('Error saving blog post:', err);
      setError('Failed to save blog post. Please try again later.');
      setIsSaving(false);
    }
  };

  // For basic rich text elements
  const insertTextWithTags = (openTag, closeTag) => {
    const textarea = document.getElementById('blog-content');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    setContent(beforeText + openTag + selectedText + closeTag + afterText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + openTag.length + selectedText.length + closeTag.length,
        start + openTag.length + selectedText.length + closeTag.length
      );
    }, 0);
  };

  // Toolbar button handlers
  const handleBold = () => insertTextWithTags('<strong>', '</strong>');
  const handleItalic = () => insertTextWithTags('<em>', '</em>');
  const handleUnderline = () => insertTextWithTags('<u>', '</u>');
  const handleHeading = () => insertTextWithTags('<h2>', '</h2>');
  const handleUnorderedList = () => insertTextWithTags('<ul>\n  <li>', '</li>\n</ul>');
  const handleOrderedList = () => insertTextWithTags('<ol>\n  <li>', '</li>\n</ol>');
  const handleBlockquote = () => insertTextWithTags('<blockquote>', '</blockquote>');
  
  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const textarea = document.getElementById('blog-content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const linkText = selectedText || 'link text';
      
      insertTextWithTags(`<a href="${url}" target="_blank">`, '</a>');
    }
  };

  if (!isAdmin) {
    return null; // Don't render anything while checking admin status
  }

  return (
    <div className="blog-editor-container">
      <div className="blog-editor-header">
        <h1>{isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
        <button 
          className="save-btn" 
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? <FaSpinner className="spinner" /> : <FaSave />}
          {isSaving ? 'Saving...' : 'Save Post'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading post data...</p>
        </div>
      ) : (
        <form className="blog-editor-form" onSubmit={handleSubmit}>
          {/* Cover Image Section */}
          <div className="cover-image-section">
            {coverImagePreview ? (
              <div className="image-preview-container">
                <img src={coverImagePreview} alt="Cover Preview" className="image-preview" />
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={() => {
                    setCoverImage(null);
                    setCoverImagePreview('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div 
                className="image-upload-placeholder"
                onClick={() => fileInputRef.current.click()}
              >
                <FaImage />
                <p>Click to upload cover image</p>
                <span>(Recommended: 1200 x 600px, max 5MB)</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="blog-title">Title</label>
            <input
              type="text"
              id="blog-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog post title"
              required
            />
          </div>

          {/* Category Selection */}
          <div className="form-group">
            <label htmlFor="blog-category">Category</label>
            {showCategoryInput ? (
              <div className="category-input-group">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category"
                />
                <div className="category-input-actions">
                  <button 
                    type="button" 
                    className="add-btn"
                    onClick={handleAddCategory}
                  >
                    Add
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowCategoryInput(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="category-selection">
                <select
                  id="blog-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {customCategories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="new-category-btn"
                  onClick={() => setShowCategoryInput(true)}
                >
                  <FaPlus /> New
                </button>
              </div>
            )}
          </div>

          {/* Rich Text Toolbar */}
          <div className="rich-text-toolbar">
            <button type="button" onClick={handleBold} title="Bold">
              <FaBold />
            </button>
            <button type="button" onClick={handleItalic} title="Italic">
              <FaItalic />
            </button>
            <button type="button" onClick={handleUnderline} title="Underline">
              <FaUnderline />
            </button>
            <button type="button" onClick={handleHeading} title="Heading">
              <FaHeading />
            </button>
            <div className="toolbar-divider"></div>
            <button type="button" onClick={handleUnorderedList} title="Bullet List">
              <FaListUl />
            </button>
            <button type="button" onClick={handleOrderedList} title="Numbered List">
              <FaListOl />
            </button>
            <button type="button" onClick={handleBlockquote} title="Blockquote">
              <FaQuoteRight />
            </button>
            <button type="button" onClick={handleLink} title="Insert Link">
              <FaLink />
            </button>
          </div>

          {/* Content Textarea */}
          <div className="form-group">
            <label htmlFor="blog-content">Content</label>
            <textarea
              id="blog-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here..."
              rows={15}
              required
            />
            
            {/* Uncomment if you want to use React Quill instead */}
            {/* <ReactQuill 
              value={content} 
              onChange={setContent} 
              placeholder="Write your blog post content here..."
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  ['blockquote', 'code-block', 'link', 'image'],
                  ['clean']
                ],
              }}
            /> */}
          </div>

          {/* Tags Input */}
          <div className="form-group">
            <label htmlFor="blog-tags">Tags</label>
            <div className="tags-input-container">
              <div className="tags-display">
                {tags.map((tag, index) => (
                  <div key={index} className="tag-pill">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag-btn"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
              <div className="tags-input-group">
                <input
                  type="text"
                  id="blog-tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="add-tag-btn"
                  onClick={handleAddTag}
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/blog')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <FaSpinner className="spinner" /> Saving...
                </>
              ) : (
                <>
                  <FaSave /> {isEditMode ? 'Update Post' : 'Publish Post'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BlogEditor;