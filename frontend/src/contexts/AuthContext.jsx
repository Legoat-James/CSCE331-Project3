import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '../api/authAPI.js';
import apiClient from '../api/client_config.js';

const AuthContext = createContext();

/* For managing authentication state across the application */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Call the backend to actually kill the session cookie
    try {
        await apiClient('/api/employee/logout', {
            method: 'POST'
        });
    } catch (err) {
        console.error('Logout error:', err);
    }
    
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};