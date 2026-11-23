import axios from 'axios';
import type { Role as RoleType, RoleFormData, ModulePermission } from '../types/role';
import { API_BASE_URL } from './api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Backend Role interface (snake_case from API)
interface ApiRole {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  is_system: boolean;
  permissions_count: number;
  users_count: number;
  created_at: string;
  updated_at: string;
  permissions?: Array<{
    id: number;
    name: string;
    display_name: string;
  }>;
}

// Frontend Role interface (matches types/role.ts)
interface FrontendRole extends RoleType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isSystemRole: boolean;
  modulePermissions: ModulePermission[];
  createdAt: string;
  updatedAt: string;
  userCount?: number;
}

class RoleService {
  /**
   * Convert API role to frontend format
   */
  private convertApiToFrontend(apiRole: ApiRole): FrontendRole {
    return {
      id: apiRole.id.toString(),
      name: apiRole.display_name || apiRole.name,
      description: apiRole.description,
      isActive: apiRole.is_active,
      isSystemRole: apiRole.is_system,
      modulePermissions: this.convertPermissionsToModules(apiRole.permissions || []),
      createdAt: apiRole.created_at,
      updatedAt: apiRole.updated_at,
      userCount: apiRole.users_count || 0
    };
  }

  /**
   * Convert backend permissions to module permissions format
   */
  private convertPermissionsToModules(permissions: Array<{id: number, name: string, display_name: string}>): ModulePermission[] {
    // Menggunakan modul yang sama seperti yang didefinisikan di types/role.ts
    const modules = [
      'tata-usaha', 'pemasukan', 'pengeluaran', 'payroll', 'sarpras', 
      'dana-usaha', 'parent', 'guru', 'student', 'divisi-unit', 'akuntansi', 
      'tagihan-siswa', 'master-data', 'user', 'rapbs'
    ];

    return modules.map(moduleName => ({
      moduleName,
      permissions: {
        view: permissions.some(p => p.name === `${moduleName}.view`),
        create: permissions.some(p => p.name === `${moduleName}.create`),
        edit: permissions.some(p => p.name === `${moduleName}.edit`),
        delete: permissions.some(p => p.name === `${moduleName}.delete`),
        export: permissions.some(p => p.name === `${moduleName}.export`),
        import: permissions.some(p => p.name === `${moduleName}.import`)
      }
    }));
  }

  /**
   * Convert module permissions to backend permission IDs
   */
  private async convertModulePermissionsToIds(modulePermissions: ModulePermission[]): Promise<number[]> {
    try {
      const allPermissions = await this.getPermissions();
      const permissionIds: number[] = [];

      console.log('3. Module permissions to convert:', modulePermissions);
      console.log('4. All available permissions count:', allPermissions.length);

      modulePermissions.forEach(module => {
        Object.entries(module.permissions).forEach(([action, enabled]) => {
          if (enabled) {
            const permissionName = `${module.moduleName}.${action}`;
            const permission = allPermissions.find(p => 
              p.name === permissionName || 
              p.name.toLowerCase() === permissionName.toLowerCase()
            );
            
            if (permission) {
              permissionIds.push(permission.id);
              console.log(`✓ Found: ${permissionName} -> ID: ${permission.id}`);
            } else {
              console.warn(`✗ Not found: ${permissionName}`);
            }
          }
        });
      });
      
      console.log('5. Final permission IDs to send:', permissionIds);
      return permissionIds;
    } catch (error) {
      console.error('Error converting module permissions to IDs:', error);
      return [];
    }
  }

  /**
   * Convert frontend role data to API format
   */
  private async convertFrontendToApi(roleData: RoleFormData): Promise<{
    name: string;
    display_name: string;
    description?: string;
    is_active: boolean;
    permissions?: number[];
  }> {
    const permissionIds = await this.convertModulePermissionsToIds(roleData.modulePermissions);
    
    return {
      name: roleData.name.toLowerCase().replace(/\s+/g, '_'),
      display_name: roleData.name,
      description: roleData.description,
      is_active: roleData.isActive,
      permissions: permissionIds
    };
  }

  /**
   * Get all roles
   */
  async getRoles(): Promise<FrontendRole[]> {
    try {
      const response = await api.get<{
        success: boolean;
        data: ApiRole[];
      }>('/roles');

      if (response.data.success) {
        return response.data.data.map(role => this.convertApiToFrontend(role));
      }

      throw new Error('Failed to fetch roles');
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      throw new Error('Failed to fetch roles');
    }
  }

  /**
   * Get specific role by ID with permissions
   */
  async getRoleById(id: string): Promise<FrontendRole> {
    try {
      const response = await api.get<{
        success: boolean;
        data: ApiRole;
      }>(`/roles/${id}`);

      if (response.data.success) {
        return this.convertApiToFrontend(response.data.data);
      }

      throw new Error('Failed to fetch role');
    } catch (error: any) {
      console.error('Error fetching role by ID:', error);
      throw new Error('Failed to fetch role');
    }
  }

  /**
   * Create new role
   */
  async createRole(roleData: RoleFormData): Promise<FrontendRole> {
    try {
      const apiData = await this.convertFrontendToApi(roleData);
      
      const response = await api.post<{
        success: boolean;
        data: ApiRole;
        message: string;
      }>('/roles', apiData);

      if (response.data.success) {
        return this.convertApiToFrontend(response.data.data);
      }

      throw new Error(response.data.message || 'Failed to create role');
    } catch (error: any) {
      console.error('Error creating role:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create role');
    }
  }

  /**
   * Update role
   */
  async updateRole(id: string, roleData: RoleFormData): Promise<FrontendRole> {
    try {
      console.log('=== DEBUG UPDATE ROLE ===');
      console.log('1. Original roleData:', roleData);
      
      const apiData = await this.convertFrontendToApi(roleData);
      console.log('2. API data to send:', apiData);
      
      const response = await api.put<{
        success: boolean;
        data: ApiRole;
        message: string;
      }>(`/roles/${id}`, apiData);

      if (response.data.success) {
        return this.convertApiToFrontend(response.data.data);
      }

      throw new Error(response.data.message || 'Failed to update role');
    } catch (error: any) {
      console.error('Error updating role:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to update role');
    }
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    try {
      const response = await api.delete<{
        success: boolean;
        message: string;
      }>(`/roles/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete role');
      }
    } catch (error: any) {
      console.error('Error deleting role:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete role');
    }
  }

  /**
   * Get permissions (for future use)
   */
  async getPermissions(): Promise<Array<{id: number, name: string, display_name: string}>> {
    try {
      const response = await api.get<{
        success: boolean;
        data: Array<{id: number, name: string, display_name: string}>;
      }>('/permissions');

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to fetch permissions');
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch permissions');
    }
  }
}

export const roleService = new RoleService();
export default roleService;
