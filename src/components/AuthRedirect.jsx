import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Assuming you'll create an AuthContext

const AuthRedirect = ({ children }) => {
  const { currentUser, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    // You might want to show a loading spinner here while authentication status is being determined
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">Loading...</div>;
  }

  // If user is logged in and tries to access login/signup, redirect to home
  if (currentUser && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to="/profile" replace />;
  }

  // If user is NOT logged in and tries to access any other route wrapped by AuthRedirect,
  // redirect them to the login page.
  if (!currentUser && location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/' && location.pathname !== '/privacy-policy' && location.pathname !== '/terms-of-service' && location.pathname !== '/tools') {
       return <Navigate to="/login" replace />;
  }

  // Otherwise, render the children (the protected route component)
  return children;
};

export default AuthRedirect;