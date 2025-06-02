import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Assuming you'll create an AuthContext

const AuthRedirect = ({ children }) => {
  const { currentUser, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    // You might want to show a loading spinner here
    return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white text-xl">Authenticating...</div>;
  }

  if (currentUser && (location.pathname === '/login' || location.pathname === '/signup')) {
    // If user is logged in and tries to access login/signup, redirect to home
    return <Navigate to="/" replace />;
  }

  // If user is not logged in and tries to access a protected route (this HOC can be extended for that),
  // or if user is logged in and accessing a non-auth page, or not logged in and accessing auth pages, render children.
  return children;
};

export default AuthRedirect;