// src/contexts/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token and load profile
  useEffect(() => {
    async function initialize() {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        try {
          // Validate token and fetch profile
          await apiService.validateToken(token);
          const profileRes = await apiService.getUserProfile();
          setUser(profileRes.data);
        } catch {
          localStorage.removeItem('jwt_token');
          setUser(null);
        }
      }
      setLoading(false);
    }
    initialize();
  }, []);

  // Login: call backend, store token, load profile
  const login = async (username, password) => {
    const res = await apiService.login(username, password);
    const { accessToken } = res.data;
    localStorage.setItem('jwt_token', accessToken);
    const profileRes = await apiService.getUserProfile();
    setUser(profileRes.data);
  };

  // Logout: clear token and user
  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  const value = { user, loading, login, logout };

  // While loading auth state, don’t render children
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
