// services/apiService.js
import axios from 'axios';

// Backend URL - change this to your backend server address
const API_URL = process.env.NODE_ENV === 'production'
  ? '/api' // In production, use relative path
  : 'http://localhost:5000/api'


// Create the API instance with direct backend URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add authorization header with JWT token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error(`API Error: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.warn('Authentication failed');
      // Store the current path to redirect back after login
      localStorage.setItem('redirectPath', window.location.pathname);
    }
    
    return Promise.reject(error);
  }
);

// API service exports
const apiService = {
  // Projects endpoints
  projects: {
    getAll: () => api.get('/api/projects'),
    getById: (id) => api.get(`/api/projects/${id}`),
    create: (projectData) => api.post('/api/projects', projectData),
    update: (id, projectData) => api.put(`/api/projects/${id}`, projectData),
    delete: (id) => api.delete(`/api/projects/${id}`)
  },
  
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    me: () => api.get('/api/auth/me'),
    logout: () => api.post('/api/auth/logout')
  }
};

export default apiService;