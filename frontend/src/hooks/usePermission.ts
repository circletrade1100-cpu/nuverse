import { useAuth } from './useAuth';

type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'import';

/**
 * Permission utility hook for checking user access to modules and actions
 */
export const usePermission = () => {
  const { user } = useAuth();

  /**
   * Check if user has permission for a specific module and action
   */
  const hasPermission = (moduleName: string, action: PermissionAction = 'view'): boolean => {
    if (!user || !user.roles) return false;

    // Super admin has all permissions
    const isSuperAdmin = user.roles.some(role => 
      role.name.toLowerCase() === 'super admin' || 
      role.name.toLowerCase() === 'super_admin'
    );
    
    if (isSuperAdmin) return true;

    // Check if any role has the specific permission
    return user.roles.some(role => {
      if (!role.permissions) return false;
      
      // Check for specific module permission
      const permissionName = `${moduleName}.${action}`;
      return role.permissions.some(permission => 
        permission.name === permissionName ||
        permission.name.toLowerCase() === permissionName.toLowerCase()
      );
    });
  };

  /**
   * Check if user has view access to a module (basic access check)
   */
  const hasModuleAccess = (moduleName: string): boolean => {
    return hasPermission(moduleName, 'view');
  };

  /**
   * Check if user has any permission for a module
   */
  const hasAnyPermissionForModule = (moduleName: string): boolean => {
    if (!user || !user.roles) return false;

    // Super admin has all permissions
    const isSuperAdmin = user.roles.some(role => 
      role.name.toLowerCase() === 'super admin' || 
      role.name.toLowerCase() === 'super_admin'
    );
    
    if (isSuperAdmin) return true;

    // Check if user has any permission for the module
    return user.roles.some(role => {
      if (!role.permissions) return false;
      
      return role.permissions.some(permission => 
        permission.name.startsWith(`${moduleName}.`) ||
        permission.name.toLowerCase().startsWith(`${moduleName}.`.toLowerCase())
      );
    });
  };

  /**
   * Get all modules that user has access to
   */
  const getAccessibleModules = (): string[] => {
    if (!user || !user.roles) return [];

    // Super admin has access to all modules
    const isSuperAdmin = user.roles.some(role => 
      role.name.toLowerCase() === 'super admin' || 
      role.name.toLowerCase() === 'super_admin'
    );
    
    if (isSuperAdmin) {
      return [
        'tata-usaha', 'pemasukan', 'pengeluaran', 'payroll', 'sarpras', 
        'dana-usaha', 'parent', 'guru', 'divisi-unit', 'akuntansi', 
        'tagihan-siswa', 'master-data', 'user', 'rapbs', 'student', 'lpj'
      ];
    }

    const accessibleModules = new Set<string>();

    user.roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(permission => {
          const moduleName = permission.name.split('.')[0];
          if (moduleName) {
            accessibleModules.add(moduleName);
          }
        });
      }
    });

    return Array.from(accessibleModules);
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (roleName: string): boolean => {
    if (!user || !user.roles) return false;
    
    return user.roles.some(role => 
      role.name.toLowerCase() === roleName.toLowerCase() ||
      role.display_name.toLowerCase() === roleName.toLowerCase()
    );
  };

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = (): boolean => {
    return hasRole('super admin') || hasRole('super_admin') || hasRole('Super Admin');
  };

  /**
   * Get user's permissions for a specific module
   */
  const getModulePermissions = (moduleName: string): PermissionAction[] => {
    if (!user || !user.roles) return [];

    if (isSuperAdmin()) {
      return ['view', 'create', 'edit', 'delete', 'export', 'import'];
    }

    const permissions = new Set<PermissionAction>();

    user.roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(permission => {
          if (permission.name.startsWith(`${moduleName}.`)) {
            const action = permission.name.split('.')[1] as PermissionAction;
            if (action) {
              permissions.add(action);
            }
          }
        });
      }
    });

    return Array.from(permissions);
  };

  return {
    user,
    hasPermission,
    hasModuleAccess,
    hasAnyPermissionForModule,
    getAccessibleModules,
    hasRole,
    isSuperAdmin,
    getModulePermissions
  };
};

export default usePermission;
