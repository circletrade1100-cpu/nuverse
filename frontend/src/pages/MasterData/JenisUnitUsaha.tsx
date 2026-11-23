import React, { useState, useEffect } from 'react';
import { Plus, Building2, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jenisUnitUsahaService from '../../services/jenisUnitUsahaService';
import type { JenisUnitUsaha } from '../../services/jenisUnitUsahaService';
import JenisUnitUsahaForm from '../../components/MasterData/JenisUnitUsahaForm';

const JenisUnitUsahaPage: React.FC = () => {
  const [jenisUnitUsahaList, setJenisUnitUsahaList] = useState<JenisUnitUsaha[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJenisUnitUsaha, setEditingJenisUnitUsaha] = useState<JenisUnitUsaha | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  // Fetch data from API
  const fetchJenisUnitUsaha = async (page = 1) => {
    try {
      console.log('🔄 fetchJenisUnitUsaha called with page:', page);
      setLoading(true);
      const response = await jenisUnitUsahaService.getAll({
        page,
        per_page: pagination.per_page,
        search: searchTerm,
        status: statusFilter
      });
      
      console.log('📡 Response received:', response);
      
      if (response.success) {
        console.log('✅ Setting data:', response.data.data);
        setJenisUnitUsahaList(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total
        });
      } else {
        console.error('❌ Response not successful:', response);
        toast.error('Gagal memuat data jenis unit usaha');
      }
    } catch (error) {
      console.error('❌ Error fetching jenis unit usaha:', error);
      toast.error('Gagal memuat data jenis unit usaha');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJenisUnitUsaha(1);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  // Load initial data
  useEffect(() => {
    fetchJenisUnitUsaha(1);
  }, []);

  const handleAddJenisUnitUsaha = () => {
    setEditingJenisUnitUsaha(null);
    setIsFormModalOpen(true);
  };

  const handleEditJenisUnitUsaha = (jenisUnitUsaha: JenisUnitUsaha) => {
    setEditingJenisUnitUsaha(jenisUnitUsaha);
    setIsFormModalOpen(true);
  };

  const handleDeleteJenisUnitUsaha = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data jenis unit usaha ini?')) {
      return;
    }

    try {
      const response = await jenisUnitUsahaService.delete(id);
      if (response.success) {
        toast.success('Jenis unit usaha berhasil dihapus');
        fetchJenisUnitUsaha(pagination.current_page); // Refresh data
      } else {
        toast.error('Gagal menghapus jenis unit usaha');
      }
    } catch (error: any) {
      console.error('Error deleting jenis unit usaha:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus jenis unit usaha');
    }
  };

  const handleFormSubmit = () => {
    setIsFormModalOpen(false);
    setEditingJenisUnitUsaha(null);
    fetchJenisUnitUsaha(pagination.current_page); // Refresh data
  };

  const handlePageChange = (page: number) => {
    fetchJenisUnitUsaha(page);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Aktif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Tidak Aktif
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jenis Unit Usaha</h1>
            <p className="text-gray-600">Kelola data jenis unit usaha</p>
          </div>
        </div>
        <button
          onClick={handleAddJenisUnitUsaha}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Jenis Unit Usaha
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari kode atau nama jenis unit usaha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            Total: {pagination.total} data
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : jenisUnitUsahaList.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter
                ? 'Tidak ada data yang sesuai dengan filter'
                : 'Belum ada jenis unit usaha yang ditambahkan'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode Unit Usaha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Jenis Unit Usaha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jenisUnitUsahaList.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(pagination.current_page - 1) * pagination.per_page + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.kode_unit_usaha}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.nama_jenis_unit_usaha}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditJenisUnitUsaha(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJenisUnitUsaha(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selanjutnya
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan{' '}
                      <span className="font-medium">
                        {(pagination.current_page - 1) * pagination.per_page + 1}
                      </span>{' '}
                      sampai{' '}
                      <span className="font-medium">
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                      </span>{' '}
                      dari{' '}
                      <span className="font-medium">{pagination.total}</span>{' '}
                      hasil
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sebelumnya
                      </button>
                      {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.current_page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Selanjutnya
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      <JenisUnitUsahaForm
        jenisUnitUsaha={editingJenisUnitUsaha}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingJenisUnitUsaha(null);
        }}
        onSave={handleFormSubmit}
      />
    </div>
  );
};

export default JenisUnitUsahaPage;
