import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

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
    const token = localStorage.getItem('token');
    if (token) {
      authService.getMe()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    return response;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (profileData) => {
    const updatedUser = await authService.updateProfile(profileData);
    setUser(updatedUser);
    return updatedUser;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isSeeker: user?.role === 'seeker',
    isRecruiter: user?.role === 'recruiter',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 