import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactElement;
  roles?: string[]; // optional roles for future role-based guard
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, user, accessToken } = useAuth();
  const location = useLocation();

  console.log('RequireAuth - isAuthenticated:', isAuthenticated, 'user:', user, 'accessToken:', !!accessToken);

  if (!isAuthenticated) {
    console.log('RequireAuth - Redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;



