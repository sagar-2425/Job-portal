import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (role && user.role !== role) {
    // If user is admin, they can access everything
    if (user.role === 'admin') {
      return children;
    }
    // Otherwise, redirect based on user role
    if (user.role === 'seeker') {
      return <Navigate to="/dashboard/seeker" replace />;
    } else if (user.role === 'recruiter') {
      return <Navigate to="/dashboard/recruiter" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute; 