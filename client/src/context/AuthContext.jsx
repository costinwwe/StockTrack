import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // More robust authentication check
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      console.log("AuthContext init - Token found:", !!token);
      setIsAuthenticated(!!token);
      setLoading(false);
    };
    
    checkAuth();
    
    // Listen for storage events (if token is changed in another tab)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const login = (token) => {
    console.log("Login called with token:", !!token);
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log("Logout called");
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};