import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaUserEdit, 
  FaUserShield, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaCheck,
  FaTimes,
  FaSave,
  FaCrown,
  FaRocket,
  FaCreditCard,
  FaCalendarAlt,
  FaBook,
  FaPlus,
  FaEdit,
  FaSort,
  FaQuestionCircle
} from 'react-icons/fa';
import api from '../utils/api';
import '../styles/admin.scss';

const Admin = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [editingUser, setEditingUser] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [confirmAction, setConfirmAction] = useState({ show: false, id: null, action: '', type: '' });
  
  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    videoUrl: '',
    content: '',
    order: 0
  });

  // FAQ form state
  const [faqs, setFaqs] = useState([]);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    order: 0
  });
  const [editingFaq, setEditingFaq] = useState(null);

  // Check if current user is admin
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const res = await api.get('/api/auth/me');
        setCurrentUser(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching current user:', err);
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Fetch users
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const res = await api.get('/api/admin/users');
          setUsers(res.data.data);
          setLoading(false);
        } catch (err) {
          setError('Error fetching users. Please try again.');
          setLoading(false);
        }
      };
      
      fetchUsers();
    }
  }, [currentUser]);

  // Fetch lessons
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      const fetchLessons = async () => {
        try {
          setLoading(true);
          const res = await api.get('/api/lessons');
          setLessons(res.data);
          setLoading(false);
        } catch (err) {
          setError('Error fetching lessons. Please try again.');
          setLoading(false);
        }
      };
      
      fetchLessons();
    }
  }, [currentUser]);

  // Fetch FAQs
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      const fetchFaqs = async () => {
        try {
          console.log('Admin: Fetching FAQs...');
          const res = await api.get('/api/faqs');
          console.log('Admin: FAQs response:', res.data);
          setFaqs(res.data);
        } catch (err) {
          console.error('Admin: Error fetching FAQs:', err);
          setError('Error fetching FAQs. Please try again.');
        }
      };
      
      fetchFaqs();
    }
  }, [currentUser]);

  // Filter users based on search term, role filter, and subscription filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesSubscription = 
      subscriptionFilter === 'all' || 
      (subscriptionFilter === 'pro' && user.subscription?.status === 'pro') ||
      (subscriptionFilter === 'free' && (!user.subscription || user.subscription.status === 'free')) ||
      (subscriptionFilter === 'canceled' && user.subscription?.status === 'canceled');
    
    return matchesSearch && matchesRole && matchesSubscription;
  });

  // Handle role change
  const handleRoleChange = (userId, newRole) => {
    setUsers(
      users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  // Save user changes
  const saveUserChanges = async (userId) => {
    try {
      const userToUpdate = users.find(user => user._id === userId);
      
      await api.put(`/api/admin/users/${userId}`, {
        role: userToUpdate.role
      });
      
      setEditingUser(null);
      // Show success message or feedback
    } catch (err) {
      setError('Error updating user. Please try again.');
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      setConfirmAction({ show: false, id: null, action: '', type: '' });
      // Show success message
    } catch (err) {
      setError('Error deleting user. Please try again.');
      setConfirmAction({ show: false, id: null, action: '', type: '' });
    }
  };

  // Grant PRO subscription to a user
  const grantProSubscription = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/subscription`, {
        status: 'pro',
        planType: 'monthly',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
      
      // Update local state
      setUsers(
        users.map(user => 
          user._id === userId ? { 
            ...user, 
            subscription: {
              ...user.subscription,
              status: 'pro',
              planType: 'monthly',
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            } 
          } : user
        )
      );
      
      setConfirmAction({ show: false, id: null, action: '', type: '' });
    } catch (err) {
      setError('Error granting PRO subscription. Please try again.');
      setConfirmAction({ show: false, id: null, action: '', type: '' });
    }
  };

  // Revoke PRO subscription
  const revokeProSubscription = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/subscription`, {
        status: 'free',
        planType: 'none',
        endDate: new Date()
      });
      
      // Update local state
      setUsers(
        users.map(user => 
          user._id === userId ? { 
            ...user, 
            subscription: {
              ...user.subscription,
              status: 'free',
              planType: 'none',
              endDate: new Date()
            } 
          } : user
        )
      );
      
      setConfirmAction({ show: false, id: null, action: '', type: '' });
    } catch (err) {
      setError('Error revoking PRO subscription. Please try again.');
      setConfirmAction({ show: false, id: null, action: '', type: '' });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  // Handle lesson form changes
  const handleLessonFormChange = (e) => {
    const { name, value } = e.target;
    setLessonForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add or edit lesson
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await api.put(`/api/lessons/${editingLesson._id}`, lessonForm);
      } else {
        await api.post('/api/lessons', lessonForm);
      }
      setLessonForm({ title: '', videoUrl: '', content: '', order: 0 });
      setEditingLesson(null);
      // Refresh lessons
      const res = await api.get('/api/lessons');
      setLessons(res.data);
    } catch (err) {
      setError('Error saving lesson. Please try again.');
    }
  };

  // Delete lesson
  const handleDeleteLesson = async (id) => {
    try {
      await api.delete(`/api/lessons/${id}`);
      setLessons(lessons.filter(lesson => lesson._id !== id));
      setConfirmAction({ show: false, id: null, action: '', type: '' });
    } catch (err) {
      setError('Error deleting lesson. Please try again.');
    }
  };

  // Start editing lesson
  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      videoUrl: lesson.videoUrl || '',
      content: lesson.content || '',
      order: lesson.order
    });
  };

  // Handle FAQ form changes
  const handleFaqFormChange = (e) => {
    const { name, value } = e.target;
    setFaqForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add or edit FAQ
  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await api.put(`/api/faqs/${editingFaq._id}`, faqForm);
      } else {
        await api.post('/api/faqs', faqForm);
      }
      setFaqForm({ question: '', answer: '', order: 0 });
      setEditingFaq(null);
      // Refresh FAQs
      const res = await api.get('/api/faqs');
      setFaqs(res.data);
    } catch (err) {
      console.error('Error saving FAQ:', err);
      setError('Error saving FAQ. Please try again.');
    }
  };

  // Delete FAQ
  const handleDeleteFaq = async (id) => {
    try {
      await api.delete(`/api/faqs/${id}`);
      setFaqs(faqs.filter(faq => faq._id !== id));
      setConfirmAction({ show: false, id: null, action: '', type: '' });
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      setError('Error deleting FAQ. Please try again.');
    }
  };

  // Start editing FAQ
  const handleEditFaq = (faq) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      order: faq.order
    });
  };

  // If user is not admin, redirect to home
  if (!loading && (!currentUser || currentUser.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-branding">
          <FaUserShield className="admin-icon" />
          <h2>Admin Panel</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers /> Users
          </button>
          <button 
            className={`nav-item ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            <FaBook /> Lessons
          </button>
          <button 
            className={`nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <FaCrown /> Subscriptions
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaUserShield /> Admin Settings
          </button>
          <button 
            className={`nav-item ${activeTab === 'faqs' ? 'active' : ''}`}
            onClick={() => setActiveTab('faqs')}
          >
            <FaQuestionCircle /> FAQs
          </button>
        </nav>
      </div>
      
      <div className="admin-content">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-user">
            <span>Logged in as: </span>
            <strong>{currentUser.name}</strong>
            <span className="admin-badge">Admin</span>
          </div>
        </header>

        {error && <div className="admin-error">{error}</div>}
        
        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>User Management</h2>
              <div className="section-actions">
                <div className="search-container">
                  <FaSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="filter-container">
                  <FaFilter className="filter-icon" />
                  <select 
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Users</option>
                    <option value="admin">Admins</option>
                    <option value="manager">Managers</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.company || '—'}</td>
                        <td>
                          {editingUser === user._id ? (
                            <select 
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                            </select>
                          ) : (
                            <span className={`role-badge ${user.role}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingUser === user._id ? (
                            <div className="action-buttons">
                              <button 
                                className="action-button save"
                                onClick={() => saveUserChanges(user._id)}
                              >
                                <FaSave />
                              </button>
                              <button 
                                className="action-button cancel"
                                onClick={() => setEditingUser(null)}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button 
                                className="action-button edit"
                                onClick={() => setEditingUser(user._id)}
                              >
                                <FaUserEdit />
                              </button>
                              <button 
                                className="action-button delete"
                                onClick={() => setConfirmAction({ 
                                  show: true, 
                                  id: user._id, 
                                  action: 'delete',
                                  type: 'user'
                                })}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-results">
                        {searchTerm || roleFilter !== 'all' ? 
                          'No users match your search criteria.' : 
                          'No users found in the system.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'lessons' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Lesson Management</h2>
              <div className="section-actions">
                <div className="search-container">
                  <FaSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search lessons..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleLessonSubmit} className="lesson-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={lessonForm.title}
                  onChange={handleLessonFormChange}
                  required
                  placeholder="Enter lesson title"
                />
              </div>
              <div className="form-group">
                <label>Video URL</label>
                <input
                  type="text"
                  name="videoUrl"
                  value={lessonForm.videoUrl}
                  onChange={handleLessonFormChange}
                  placeholder="Enter YouTube video URL"
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  name="content"
                  value={lessonForm.content}
                  onChange={handleLessonFormChange}
                  rows={4}
                  placeholder="Enter lesson content"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingLesson ? <FaSave /> : <FaPlus />}
                  {editingLesson ? 'Update Lesson' : 'Add Lesson'}
                </button>
                {editingLesson && (
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => {
                      setEditingLesson(null);
                      setLessonForm({ title: '', videoUrl: '', content: '', order: 0 });
                    }}
                  >
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="lessons-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Title</th>
                    <th>Video</th>
                    <th>Content</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length > 0 ? (
                    lessons
                      .filter(lesson => 
                        lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(lesson => (
                        <tr key={lesson._id}>
                          <td>{lesson.order}</td>
                          <td>{lesson.title}</td>
                          <td>
                            {lesson.videoUrl ? (
                              <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer">
                                View Video
                              </a>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            {lesson.content ? (
                              <div className="content-preview">
                                {lesson.content.substring(0, 50)}...
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-button edit"
                                onClick={() => handleEditLesson(lesson)}
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="action-button delete"
                                onClick={() => setConfirmAction({ 
                                  show: true, 
                                  id: lesson._id, 
                                  action: 'delete',
                                  type: 'lesson'
                                })}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-results">
                        No lessons found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'subscriptions' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Subscription Management</h2>
              <div className="section-actions">
                <div className="search-container">
                  <FaSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="filter-container">
                  <FaFilter className="filter-icon" />
                  <select 
                    value={subscriptionFilter}
                    onChange={(e) => setSubscriptionFilter(e.target.value)}
                  >
                    <option value="all">All Subscriptions</option>
                    <option value="pro">PRO Users</option>
                    <option value="free">Free Users</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="subscription-table-container">
              <table className="users-table subscription-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Plan</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`subscription-badge ${user.subscription?.status || 'free'}`}>
                            {user.subscription?.status === 'pro' ? 'PRO' : 
                             user.subscription?.status === 'canceled' ? 'Canceled' : 'Free'}
                          </span>
                        </td>
                        <td>{user.subscription?.planType || 'None'}</td>
                        <td>{formatDate(user.subscription?.startDate)}</td>
                        <td>{formatDate(user.subscription?.endDate)}</td>
                        <td>
                          <div className="action-buttons">
                            {(!user.subscription || user.subscription.status !== 'pro') ? (
                              <button 
                                className="action-button grant"
                                title="Grant PRO Access"
                                onClick={() => setConfirmAction({ 
                                  show: true, 
                                  id: user._id, 
                                  action: 'grant',
                                  type: 'user'
                                })}
                              >
                                <FaCrown />
                              </button>
                            ) : (
                              <button 
                                className="action-button revoke"
                                title="Revoke PRO Access"
                                onClick={() => setConfirmAction({ 
                                  show: true, 
                                  id: user._id, 
                                  action: 'revoke',
                                  type: 'user'
                                })}
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-results">
                        {searchTerm || subscriptionFilter !== 'all' ? 
                          'No users match your search criteria.' : 
                          'No users found in the system.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="subscription-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaCrown />
                </div>
                <div className="stat-content">
                  <h3>PRO Users</h3>
                  <p className="stat-number">
                    {users.filter(user => user.subscription?.status === 'pro').length}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-content">
                  <h3>Free Users</h3>
                  <p className="stat-number">
                    {users.filter(user => !user.subscription || user.subscription.status === 'free').length}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FaCalendarAlt />
                </div>
                <div className="stat-content">
                  <h3>Monthly Plans</h3>
                  <p className="stat-number">
                    {users.filter(user => user.subscription?.planType === 'monthly').length}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FaCalendarAlt />
                </div>
                <div className="stat-content">
                  <h3>Yearly Plans</h3>
                  <p className="stat-number">
                    {users.filter(user => user.subscription?.planType === 'yearly').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="admin-section">
            <h2>Admin Settings</h2>
            <p>Advanced settings for the admin panel will be implemented in a future update.</p>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>FAQ Management</h2>
              <div className="section-actions">
                <div className="search-container">
                  <FaSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search FAQs..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleFaqSubmit} className="faq-form">
              <div className="form-group">
                <label>Question *</label>
                <input
                  type="text"
                  name="question"
                  value={faqForm.question}
                  onChange={handleFaqFormChange}
                  required
                  placeholder="Enter FAQ question"
                />
              </div>
              <div className="form-group">
                <label>Answer *</label>
                <textarea
                  name="answer"
                  value={faqForm.answer}
                  onChange={handleFaqFormChange}
                  required
                  rows={4}
                  placeholder="Enter FAQ answer"
                />
              </div>
              <div className="form-group">
                <label>Order</label>
                <input
                  type="number"
                  name="order"
                  value={faqForm.order}
                  onChange={handleFaqFormChange}
                  placeholder="Enter display order"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingFaq ? <FaSave /> : <FaPlus />}
                  {editingFaq ? 'Update FAQ' : 'Add FAQ'}
                </button>
                {editingFaq && (
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => {
                      setEditingFaq(null);
                      setFaqForm({ question: '', answer: '', order: 0 });
                    }}
                  >
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="faqs-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Question</th>
                    <th>Answer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.length > 0 ? (
                    faqs
                      .filter(faq => 
                        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .sort((a, b) => a.order - b.order)
                      .map(faq => (
                        <tr key={faq._id}>
                          <td>{faq.order}</td>
                          <td>{faq.question}</td>
                          <td>
                            <div className="content-preview">
                              {faq.answer.substring(0, 100)}...
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-button edit"
                                onClick={() => handleEditFaq(faq)}
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="action-button delete"
                                onClick={() => setConfirmAction({ 
                                  show: true, 
                                  id: faq._id, 
                                  action: 'delete',
                                  type: 'faq'
                                })}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-results">
                        No FAQs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      {confirmAction.show && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Action</h3>
            <p>
              {confirmAction.action === 'delete' && confirmAction.type === 'lesson' && 
                'Are you sure you want to delete this lesson? This action cannot be undone.'}
              {confirmAction.action === 'delete' && confirmAction.type === 'user' && 
                'Are you sure you want to delete this user? This action cannot be undone.'}
              {confirmAction.action === 'delete' && confirmAction.type === 'faq' && 
                'Are you sure you want to delete this FAQ? This action cannot be undone.'}
              {confirmAction.action === 'grant' && 
                'Are you sure you want to grant PRO subscription to this user?'}
              {confirmAction.action === 'revoke' && 
                'Are you sure you want to revoke PRO subscription from this user?'}
            </p>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setConfirmAction({ show: false, id: null, action: '', type: '' })}
              >
                <FaTimes /> Cancel
              </button>
              <button 
                className="confirm-button"
                onClick={() => {
                  if (confirmAction.action === 'delete') {
                    if (confirmAction.type === 'lesson') {
                      handleDeleteLesson(confirmAction.id);
                    } else if (confirmAction.type === 'user') {
                      deleteUser(confirmAction.id);
                    } else if (confirmAction.type === 'faq') {
                      handleDeleteFaq(confirmAction.id);
                    }
                  } else if (confirmAction.action === 'grant') {
                    grantProSubscription(confirmAction.id);
                  } else if (confirmAction.action === 'revoke') {
                    revokeProSubscription(confirmAction.id);
                  }
                }}
              >
                <FaCheck /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 