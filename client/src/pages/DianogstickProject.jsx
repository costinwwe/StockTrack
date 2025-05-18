import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaSync } from 'react-icons/fa';

// Create axios instance with auth token
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Add auth interceptor
api.interceptors.request.use(
  (config) => {
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

const DiagnosticProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching project with ID: ${id}`);
        const res = await api.get(`/projects/${id}`);
        
        // Log the full response for debugging
        console.log('API Response:', res);
        console.log('Response data:', JSON.stringify(res.data, null, 2));
        
        setResponse(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project:', err);
        
        let errorMessage = 'Error fetching project: ' + (err.message || 'Unknown error');
        
        if (err.response) {
          console.error('Error response:', err.response);
          errorMessage = `Server error: ${err.response.status} - ${err.response.statusText}`;
          console.log('Response data:', JSON.stringify(err.response.data, null, 2));
        } else if (err.request) {
          console.error('Error request:', err.request);
          errorMessage = 'No response received from server';
        }
        
        setError(errorMessage);
        setLoading(false);
        
        if (err.response?.status === 401) {
          setIsAuthenticated(false);
        }
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    // Re-trigger the effect
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  if (loading) {
    return (
      <div className="diagnostic-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading project data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="diagnostic-container">
        <div className="error-box">
          <h2>Authentication Required</h2>
          <p>You need to be logged in to access this project.</p>
          <button onClick={() => navigate('/login')}>Log In</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="diagnostic-container">
        <div className="error-box">
          <h2>Error Loading Project</h2>
          <p>{error}</p>
          <div className="buttons">
            <button onClick={handleRetry}>
              <FaSync /> Retry
            </button>
            <button onClick={() => navigate('/projects')}>
              <FaArrowLeft /> Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="diagnostic-container">
      <div className="header">
        <button className="back-btn" onClick={() => navigate('/projects')}>
          <FaArrowLeft /> Back to Projects
        </button>
        <h2>Project Diagnostic</h2>
      </div>
      
      <div className="content">
        <h3>API Response Data</h3>
        <div className="response-data">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
        
        <div className="debug-info">
          <h3>Response Structure</h3>
          <ul>
            <li><strong>Response Type:</strong> {typeof response}</li>
            {response && (
              <>
                <li>
                  <strong>Has 'data' property:</strong> {response.data !== undefined ? 'Yes' : 'No'}
                  {response.data && (
                    <ul>
                      <li><strong>data type:</strong> {typeof response.data}</li>
                    </ul>
                  )}
                </li>
                <li>
                  <strong>Has 'success' property:</strong> {response.success !== undefined ? 'Yes' : 'No'}
                  {response.success !== undefined && (
                    <ul>
                      <li><strong>success value:</strong> {String(response.success)}</li>
                    </ul>
                  )}
                </li>
                <li><strong>Has 'tables' property:</strong> {response.tables !== undefined ? 'Yes' : 'No'}</li>
                <li><strong>Has 'project' property:</strong> {response.project !== undefined ? 'Yes' : 'No'}</li>
                <li><strong>Has '_id' property:</strong> {response._id !== undefined ? 'Yes' : 'No'}</li>
                <li><strong>Has 'name' property:</strong> {response.name !== undefined ? 'Yes' : 'No'}</li>
              </>
            )}
          </ul>
          
          <h3>API Endpoint</h3>
          <p><code>/api/projects/{id}</code></p>
          
          <h3>Recommendation</h3>
          <p>
            After examining the response structure, we can create a customized Project component
            that handles this specific API response format. Please provide your API controller
            code if the structure isn't clear from this diagnostic.
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .diagnostic-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eaeaea;
        }
        
        .header h2 {
          margin: 0 0 0 20px;
        }
        
        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f0f0f0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .back-btn:hover {
          background: #e0e0e0;
        }
        
        .content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }
        
        .response-data {
          background: #f5f5f5;
          border-radius: 4px;
          padding: 15px;
          overflow: auto;
          max-height: 300px;
          margin-bottom: 20px;
          border: 1px solid #e0e0e0;
        }
        
        pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: monospace;
          font-size: 13px;
        }
        
        .debug-info {
          background: #f9f9f9;
          border-radius: 4px;
          padding: 15px;
          border: 1px solid #e0e0e0;
        }
        
        .debug-info h3 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .debug-info ul {
          margin: 0 0 15px 0;
          padding-left: 20px;
        }
        
        .error-box {
          background: #fff8f8;
          border: 1px solid #ffcece;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          max-width: 500px;
          margin: 50px auto;
        }
        
        .error-box h2 {
          color: #e53e3e;
          margin-top: 0;
        }
        
        .buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }
        
        .buttons button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .buttons button:first-child {
          background: #3182ce;
          color: white;
        }
        
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: #3182ce;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default DiagnosticProject;