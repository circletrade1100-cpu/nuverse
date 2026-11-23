import React from 'react';
import { useGuruAuth } from '../hooks/useGuruAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600">Memuat...</span>
      </div>
    </div>
  )
}) => {
  const { isAuthenticated, isLoading } = useGuruAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    // Redirect to login page
    window.location.href = '/guru/login';
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
