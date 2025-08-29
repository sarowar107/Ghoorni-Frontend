import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  // If still loading auth state, don't redirect yet - show nothing or a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cuet-primary-900"></div>
      </div>
    );
  }

  // Only redirect if not authenticated and finished loading
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.map(role => role.toLowerCase()).includes(user.role.toLowerCase())) {
    // Redirect to a 'not-authorized' page or dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
