import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ErrorBoundary from '../components/ui/ErrorBoundary';

const AuthLayout: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Allow email verification page even for authenticated users
  const isVerificationPage = location.pathname === '/verify-email';
  
  // If user is already authenticated, redirect to dashboard (except for verification page)
  if (isAuthenticated && !loading && !isVerificationPage) {
    return <Navigate to="/" replace />;
  }
  
  // If still checking authentication status, show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cuet-primary-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg p-4 transition-colors duration-300 overflow-y-auto">
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-5 bg-fixed" 
          style={{ backgroundImage: "url('https://itbi-cuet.com/wp-content/uploads/2024/01/download-2.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-cuet-primary-900/10 to-cuet-secondary-700/10 dark:from-cuet-primary-950/20 dark:to-black/20"></div>
      </div>
      <main className="w-full max-w-md z-10">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default AuthLayout;
