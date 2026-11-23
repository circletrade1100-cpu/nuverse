import React, { useState, useMemo } from 'react';
import { Search, Filter, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Shield, Lock, Users } from 'lucide-react';
import type { Role, RoleFilters } from '../../../types/role';
import { getModuleDisplayName } from '../../../types/role';

interface RoleDataTableProps {
  data: Role[];
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
}

const RoleDataTable: React.FC<RoleDataTableProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
  const [filters, setFilters] = useState<RoleFilters>({
    name: '',
    isActive: '',
    isSystemRole: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);

  // Filter data berdasarkan kriteria
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesName = item.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesActive = !filters.isActive || item.isActive.toString() === filters.isActive;
      const matchesSystemRole = !filters.isSystemRole || item.isSystemRole.toString() === filters.isSystemRole;
      
      return matchesName && matchesActive && matchesSystemRole;
    });
  }, [data, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setFilters({
      name: '',
      isActive: '',
      isSystemRole: '',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPermissionCount = (role: Role) => {
    return role.modulePermissions.reduce((count, module) => {
      return count + Object.values(module.permissions).filter(permission => permission).length;
    }, 0);
  };

  const handleViewPermissions = (role: Role) => {
    setViewingRole(role);
  };

  const closePermissionModal = () => {
    setViewingRole(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Data Role</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredData.length} dari {data.length} role
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Role
                  </label>
                  <input
                    type="text"
                    placeholder="Cari nama role..."
                    value={filters.name}
                    onChange={(e) => setFilters({...filters, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.isActive}
                    onChange={(e) => setFilters({...filters, isActive: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Semua Status</option>
                    <option value="true">Aktif</option>
                    <option value="false">Tidak Aktif</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Role
                  </label>
                  <select
                    value={filters.isSystemRole}
                    onChange={(e) => setFilters({...filters, isSystemRole: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="true">Role Sistem</option>
                    <option value="false">Role Custom</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Bersihkan Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${item.isSystemRole ? 'bg-red-100' : 'bg-purple-100'}`}>
                        <Shield className={`w-4 h-4 ${item.isSystemRole ? 'text-red-600' : 'text-purple-600'}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Dibuat: {formatDate(item.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {item.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.isSystemRole
                        ? 'bg-red-100 text-red-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.isSystemRole ? (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Sistem
                        </>
                      ) : (
                        'Custom'
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 font-medium">
                        {getPermissionCount(item)} permission
                      </span>
                      <button
                        onClick={() => handleViewPermissions(item)}
                        className="ml-2 text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Lihat
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {item.userCount || 0} user
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewPermissions(item)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Lihat Permission"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Edit"
                        disabled={item.isSystemRole}
                      >
                        <Edit className={`w-4 h-4 ${item.isSystemRole ? 'opacity-50 cursor-not-allowed' : ''}`} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Hapus"
                        disabled={item.isSystemRole || (item.userCount && item.userCount > 0)}
                      >
                        <Trash2 className={`w-4 h-4 ${
                          item.isSystemRole || (item.userCount && item.userCount > 0) 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 py-1 text-sm font-medium">
                {currentPage} dari {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
            <p className="text-gray-500">
              {data.length === 0 
                ? 'Belum ada role yang ditambahkan'
                : 'Tidak ada role yang sesuai dengan filter'}
            </p>
          </div>
        )}
      </div>

      {/* Permission Detail Modal */}
      {viewingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Permission: {viewingRole.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {viewingRole.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closePermissionModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {viewingRole.modulePermissions.map((modulePermission) => (
                  <div key={modulePermission.moduleName} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {getModuleDisplayName(modulePermission.moduleName)}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(modulePermission.permissions).map(([permission, allowed]) => (
                        <span
                          key={permission}
                          className={`px-2 py-1 text-xs rounded-full ${
                            allowed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleDataTable;
