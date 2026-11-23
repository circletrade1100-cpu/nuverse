import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module: string;
  action?: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'import';
  fallbackPath?: string;
}

/**
 * Component to protect routes based on user permissions
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  module, 
  action = 'view',
  fallbackPath = '/dashboard'
}) => {
  const { hasPermission, hasModuleAccess, isSuperAdmin } = usePermission();

  // Super admin has access to everything
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // Check if user has the required permission
  const hasAccess = action === 'view' 
    ? hasModuleAccess(module) 
    : hasPermission(module, action);

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
