import React, { useState, useEffect } from 'react';
import { Plus, Shield, Users, Settings } from 'lucide-react';
import type { Role, RoleFormData } from '../../types/role';
import RoleDataTable from '../../components/MasterData/Role/RoleDataTable';
import RoleFormModal from '../../components/MasterData/Role/RoleFormModal';
import { roleService } from '../../services/roleService';
import toast, { Toaster } from 'react-hot-toast';

// Mock data untuk demo
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Akses penuh ke seluruh sistem',
    isActive: true,
    isSystemRole: true,
    modulePermissions: [
      {
        moduleName: 'tata-usaha',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      },
      {
        moduleName: 'pemasukan',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      },
      {
        moduleName: 'pengeluaran',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      },
      {
        moduleName: 'payroll',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      },
      {
        moduleName: 'sarpras',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      },
      {
        moduleName: 'dana-usaha',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      },
      {
        moduleName: 'parent',
        permissions: { view: true, edit: true }
      },
      {
        moduleName: 'guru',
        permissions: { view: true, create: true, edit: true, export: true }
      },
      {
        moduleName: 'student',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      },
      {
        moduleName: 'divisi-unit',
        permissions: { view: true, create: true, edit: true, delete: true }
      },
      {
        moduleName: 'akuntansi',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      },
      {
        moduleName: 'master-data',
        permissions: { view: true, create: true, edit: true, delete: true, import: true, export: true }
      },
      {
        moduleName: 'user',
        permissions: { view: true, create: true, edit: true, delete: true, import: true, export: true }
      },
      {
        moduleName: 'rapbs',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userCount: 1
  },
  {
    id: '2',
    name: 'Admin Tata Usaha',
    description: 'Administrator untuk modul Tata Usaha',
    isActive: true,
    isSystemRole: false,
    modulePermissions: [
      {
        moduleName: 'tata-usaha',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      },
      {
        moduleName: 'pemasukan',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      },
      {
        moduleName: 'pengeluaran',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      },
      {
        moduleName: 'master-data',
        permissions: { view: true, edit: true }
      },
      {
        moduleName: 'user',
        permissions: { view: true }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userCount: 3
  },
  {
    id: '3',
    name: 'Admin Payroll',
    description: 'Administrator untuk modul Payroll dan Penggajian',
    isActive: true,
    isSystemRole: false,
    modulePermissions: [
      {
        moduleName: 'payroll',
        permissions: { view: true, create: true, edit: true, delete: true, export: true }
      },
      {
        moduleName: 'master-data',
        permissions: { view: true, edit: true }
      },
      {
        moduleName: 'user',
        permissions: { view: true }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userCount: 2
  },
  {
    id: '4',
    name: 'Guru',
    description: 'Role untuk guru dengan akses terbatas',
    isActive: true,
    isSystemRole: false,
    modulePermissions: [
      {
        moduleName: 'guru',
        permissions: { view: true, create: true, edit: true, export: true }
      },
      {
        moduleName: 'parent',
        permissions: { view: true }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userCount: 25
  },
  {
    id: '5',
    name: 'Staff',
    description: 'Role untuk staff umum dengan akses minimal',
    isActive: true,
    isSystemRole: false,
    modulePermissions: [
      {
        moduleName: 'sarpras',
        permissions: { view: true, create: true, edit: true }
      },
      {
        moduleName: 'master-data',
        permissions: { view: true }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userCount: 8
  }
];

const RolePage: React.FC = () => {
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  // Load roles from API
  const loadRoles = async () => {
    try {
      setLoading(true);
      const roles = await roleService.getRoles();
      setRoleList(roles);
    } catch (error: any) {
      console.error('Error loading roles:', error);
      toast.error(error.message || 'Failed to load roles');
      // Fallback to mock data if API fails
      setRoleList(mockRoles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleAddRole = () => {
    setEditingRole(null);
    setIsFormModalOpen(true);
  };

  const handleEditRole = async (role: Role) => {
    try {
      // Fetch detailed role data with permissions from API
      const detailedRole = await roleService.getRoleById(role.id);
      setEditingRole(detailedRole);
      setIsFormModalOpen(true);
    } catch (error: any) {
      console.error('Error fetching role details:', error);
      toast.error(error.message || 'Failed to load role details');
      // Fallback to using the role data we have
      setEditingRole(role);
      setIsFormModalOpen(true);
    }
  };

  const handleDeleteRole = async (id: string) => {
    const role = roleList.find(r => r.id === id);
    
    if (role?.isSystemRole) {
      toast.error('Role sistem tidak dapat dihapus!');
      return;
    }

    if (role?.userCount && role.userCount > 0) {
      toast.error(`Role ini digunakan oleh ${role.userCount} user dan tidak dapat dihapus!`);
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus role ini?')) {
      try {
        await roleService.deleteRole(id);
        setRoleList(roleList.filter(item => item.id !== id));
        toast.success('Role berhasil dihapus');
      } catch (error: any) {
        console.error('Error deleting role:', error);
        toast.error(error.message || 'Failed to delete role');
      }
    }
  };

  const handleFormSubmit = async (formData: RoleFormData) => {
    try {
      if (editingRole) {
        // Update existing role
        const updatedRole = await roleService.updateRole(editingRole.id, formData);
        setRoleList(roleList.map(item => 
          item.id === editingRole.id ? updatedRole : item
        ));
        toast.success('Role berhasil diupdate');
      } else {
        // Add new role
        const newRole = await roleService.createRole(formData);
        setRoleList([...roleList, newRole]);
        toast.success('Role berhasil ditambahkan');
      }

      setIsFormModalOpen(false);
      setEditingRole(null);
    } catch (error: any) {
      console.error('Error submitting role:', error);
      toast.error(error.message || 'Failed to save role');
      // Don't close modal on error so user can retry
    }
  };

  const convertToFormData = (role: Role): RoleFormData => ({
    name: role.name,
    description: role.description,
    isActive: role.isActive,
    modulePermissions: role.modulePermissions
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              Master Data Role & Permission
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola role dan hak akses pengguna pada modul aplikasi
            </p>
          </div>
          
          <button
            onClick={handleAddRole}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Tambah Role
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Role</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {roleList.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Role Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {roleList.filter(item => item.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Role Sistem</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {roleList.filter(item => item.isSystemRole).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total User</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {roleList.reduce((total, role) => total + (role.userCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <RoleDataTable
          data={roleList}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
        />

        {/* Form Modal */}
        <RoleFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingRole(null);
          }}
          onSubmit={handleFormSubmit}
          isEdit={!!editingRole}
          initialData={editingRole ? convertToFormData(editingRole) : undefined}
        />
      </div>
    </div>
    </>
  );
};

export default RolePage;
