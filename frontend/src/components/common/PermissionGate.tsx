import React from 'react';
import { usePermission } from '../../hooks/usePermission';

interface PermissionGateProps {
  children: React.ReactNode;
  module: string;
  action?: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'import';
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
  modules?: string[]; // For checking multiple modules
}

/**
 * Component to conditionally render content based on user permissions
 */
const PermissionGate: React.FC<PermissionGateProps> = ({ 
  children, 
  module, 
  action = 'view',
  fallback = null,
  requireAll = false,
  modules = []
}) => {
  const { hasPermission, hasModuleAccess, isSuperAdmin } = usePermission();

  // Super admin has access to everything
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  let hasAccess = false;

  if (modules.length > 0) {
    // Check multiple modules
    if (requireAll) {
      hasAccess = modules.every(mod => 
        action === 'view' ? hasModuleAccess(mod) : hasPermission(mod, action)
      );
    } else {
      hasAccess = modules.some(mod => 
        action === 'view' ? hasModuleAccess(mod) : hasPermission(mod, action)
      );
    }
  } else {
    // Check single module
    hasAccess = action === 'view' 
      ? hasModuleAccess(module) 
      : hasPermission(module, action);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
