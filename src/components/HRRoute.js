import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HRRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || (user?.role !== 'hrteam' && user?.role !== 'admin')) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default HRRoute;