import React, { useState, useEffect } from 'react';
import { Plus, Users, UserPlus, GraduationCap, Shield } from 'lucide-react';
import type { User, UserType, TabStats } from '../types/user';
import UniversalDataTable from '../components/User/UniversalDataTable';
import UserImportModal from '../components/User/UserImportModal';
import DynamicUserFormModal from '../components/User/DynamicUserFormModal';
import UserDetailModal from '../components/User/UserDetailModal';
import { useUsers } from '../hooks/useUsers';
import { userService } from '../services/userService';

// Using real API data now - mock data removed

const UserPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UserType>('parents');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Use API hooks
  const {
    users: apiUsers,
    isLoading: loading,
    pagination,
    setFilters,
    setPage,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers
  } = useUsers();

  // Apply search and status filters
  useEffect(() => {
    const newFilters: any = {};
    if (searchTerm) {
      newFilters.search = searchTerm;
    }
    if (statusFilter) {
      newFilters.status = statusFilter;
    }
    setFilters(newFilters);
  }, [searchTerm, statusFilter, setFilters]);

  // Convert API users to frontend format
  const convertApiUsersToFrontendFormat = (users: any[]): User[] => {
    console.log('Converting API users:', users);
    const converted = users.map(user => {
      const convertedUser = userService.convertToFrontendUser(user);
      console.log('Original user:', user);
      console.log('Converted user:', convertedUser);
      return convertedUser;
    });
    console.log('All converted users:', converted);
    return converted;
  };

  // Helper functions
  const getCurrentData = () => {
    // Convert API users to frontend format
    const frontendUsers = convertApiUsersToFrontendFormat(apiUsers);
    
    // Debug: Log untuk melihat data yang diterima
    console.log('Total API users:', apiUsers.length);
    console.log('Frontend users after conversion:', frontendUsers.length);
    console.log('Active tab:', activeTab);
    console.log('Sample user data:', frontendUsers[0]);
    
    // Filter data berdasarkan kategori tab
    const filteredUsers = frontendUsers.filter(user => {
      console.log('Filtering user:', user.namaLengkap, 'Role:', (user as any).role, 'Jabatan:', user.jabatan);
      
      switch (activeTab) {
        case 'parents':
          // Filter untuk parents - untuk sementara tampilkan data kosong karena belum ada data parents
          // TODO: Tambahkan data parents di database dengan role yang sesuai
          console.log('Parents tab - no data available yet');
          return false;
          
        case 'guru':
          // Filter untuk guru - untuk sementara tampilkan data kosong karena belum ada data guru
          // TODO: Tambahkan data guru di database dengan role yang sesuai
          console.log('Guru tab - no data available yet');
          return false;
          
        case 'manajemen':
          // Filter untuk manajemen - berdasarkan role dan jabatan yang ada di database
          const isManajemen = ((user as any).role && (
            (user as any).role.toLowerCase().includes('super') ||
            (user as any).role.toLowerCase().includes('administrator') ||
            (user as any).role.toLowerCase().includes('staff') ||
            (user as any).role.toLowerCase().includes('tata usaha') ||
            (user as any).role.toLowerCase().includes('payroll') ||
            (user as any).role.toLowerCase().includes('danus') ||
            (user as any).role.toLowerCase().includes('accounting')
          )) || (user.jabatan && (
            user.jabatan.toLowerCase().includes('kepala') ||
            user.jabatan.toLowerCase().includes('super') ||
            user.jabatan.toLowerCase().includes('administrator') ||
            user.jabatan.toLowerCase().includes('staff') ||
            user.jabatan.toLowerCase().includes('tu') ||
            user.jabatan.toLowerCase().includes('payroll') ||
            user.jabatan.toLowerCase().includes('danus') ||
            user.jabatan.toLowerCase().includes('accounting')
          ));
          console.log('Is manajemen:', isManajemen, 'for user:', user.namaLengkap);
          return isManajemen;
          
        default:
          return true;
      }
    });
    
    console.log('Filtered users for', activeTab, ':', filteredUsers.length);
    return filteredUsers;
  };

  const getCurrentStats = (): TabStats => {
    const data = getCurrentData();
    const total = data.length;
    const aktif = data.filter((item: any) => item.status === 'Aktif').length;
    const nonAktif = data.filter((item: any) => item.status === 'Non-Aktif').length;
    const pensiun = activeTab === 'guru' ? data.filter((item: any) => item.status === 'Pensiun').length : undefined;
    
    return { total, aktif, nonAktif, pensiun };
  };

  const getTabConfig = () => {
    return [
      {
        id: 'parents',
        label: 'Parents',
        icon: UserPlus,
        description: 'Data Orang Tua Siswa'
      },
      {
        id: 'guru',
        label: 'Guru',
        icon: GraduationCap,
        description: 'Data Guru & Tenaga Pengajar'
      },
      {
        id: 'manajemen',
        label: 'Manajemen',
        icon: Shield,
        description: 'Data Staff & Manajemen'
      }
    ];
  };

  const handleImportExcel = async (file: File) => {
    // Simulate import process
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // In real implementation, this would parse the Excel file and update the users
        console.log('Importing file:', file.name);
        
        // For demo, we'll just show success
        resolve();
      }, 2000);
    });
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data user ini?')) {
      console.log('Deleting user:', userId);
      await deleteUser(userId);
    }
  };

  const handleViewUser = (user: any) => {
    setViewingUser(user);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingUser) {
        // Update existing user
        console.log('Updating user:', editingUser.id);
        const success = await updateUser(editingUser.id, formData);
        if (success) {
          setIsFormModalOpen(false);
          setEditingUser(null);
        }
      } else {
        // Create new user
        console.log('Creating new user:', formData);
        const success = await createUser(formData);
        if (success) {
          setIsFormModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Memuat data...</span>
        </div>
      </div>
    );
  }

  const stats = getCurrentStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Page Header */}
        <div className="mb-8">
          {/* Header Background with Gradient */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            </div>
            
            <div className="relative px-8 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      Manajemen User
                    </h1>
                    <p className="text-blue-100 text-lg">
                      Kelola data pengguna dan informasi kepegawaian dengan mudah
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-blue-700 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300"
                  >
                    <span>Import Excel</span>
                  </button>
                  
                  <button
                    onClick={handleAddUser}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah User</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
            <div className="grid grid-cols-3 gap-2">
              {getTabConfig().map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as UserType)}
                    className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <div className="text-left">
                      <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {tab.label}
                      </div>
                      <div className={`text-sm ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total User</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    ↗ +12% dari bulan lalu
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-green-100 rounded-full opacity-20"></div>
          </div>
          
          <div className="group relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">User Aktif</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.aktif}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {stats.total > 0 ? Math.round((stats.aktif / stats.total) * 100) : 0}% dari total
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-blue-100 rounded-full opacity-20"></div>
          </div>
          
          <div className="group relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Non-Aktif</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.nonAktif}</p>
                  <p className="text-xs text-amber-600 font-medium mt-1">
                    Perlu perhatian khusus
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-amber-100 rounded-full opacity-20"></div>
          </div>
          
          {stats.pensiun !== undefined && (
            <div className="group relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-slate-50 opacity-50"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Pensiun</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pensiun}</p>
                    <p className="text-xs text-gray-600 font-medium mt-1">
                      Alumni berpengalaman
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gray-100 rounded-full opacity-20"></div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, NIP, atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
                <option value="Pensiun">Pensiun</option>
              </select>
              
              <button
                onClick={() => refreshUsers()}
                disabled={loading}
                className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <UniversalDataTable
          type={activeTab}
          data={getCurrentData()}
          onView={handleViewUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Menampilkan {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} dari {pagination.total} data
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1 || loading}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === pagination.currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      disabled={loading}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      } disabled:opacity-50`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.lastPage || loading}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        <UserImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportExcel}
        />

        {/* Dynamic User Form Modal */}
        <DynamicUserFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleFormSubmit}
          userType={activeTab}
          isEdit={!!editingUser}
          initialData={editingUser}
        />

        {/* User Detail Modal */}
        <UserDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setViewingUser(null);
          }}
          user={viewingUser}
          userType={activeTab}
        />
      </div>
    </div>
  );
};

export default UserPage;
