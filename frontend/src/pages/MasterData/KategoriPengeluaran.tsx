import React, { useState, useEffect } from 'react';
import { Plus, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import type { KategoriPengeluaran, KategoriPengeluaranFormData } from '../../services/kategoriPengeluaranService';
import KategoriPengeluaranDataTable from '../../components/MasterData/KategoriPengeluaran/KategoriPengeluaranDataTable';
import KategoriPengeluaranFormModal from '../../components/MasterData/KategoriPengeluaran/KategoriPengeluaranFormModal';
import { kategoriPengeluaranService } from '../../services/kategoriPengeluaranService';

const KategoriPengeluaranPage: React.FC = () => {
  const [kategoriList, setKategoriList] = useState<KategoriPengeluaran[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingKategori, setEditingKategori] = useState<KategoriPengeluaran | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch data from API
  const fetchKategoriPengeluaran = async () => {
    try {
      setLoading(true);
      const response = await kategoriPengeluaranService.getAll();
      
      if (response.success) {
        let filteredData = response.data;
        
        // Apply search filter
        if (searchTerm) {
          filteredData = filteredData.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        // Apply status filter
        if (statusFilter) {
          filteredData = filteredData.filter(item => 
            statusFilter === 'aktif' ? item.is_active : !item.is_active
          );
        }
        
        setKategoriList(filteredData);
      } else {
        toast.error('Gagal memuat data kategori pengeluaran');
      }
    } catch (error) {
      console.error('Error fetching kategori pengeluaran:', error);
      toast.error('Gagal memuat data kategori pengeluaran');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchKategoriPengeluaran();
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  // Load initial data
  useEffect(() => {
    fetchKategoriPengeluaran();
  }, []);

  const handleAddKategori = () => {
    setEditingKategori(null);
    setIsFormModalOpen(true);
  };

  const handleEditKategori = (kategori: KategoriPengeluaran) => {
    setEditingKategori(kategori);
    setIsFormModalOpen(true);
  };

  const handleDeleteKategori = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori pengeluaran ini?')) {
      return;
    }

    try {
      const response = await kategoriPengeluaranService.delete(id);
      if (response.success) {
        toast.success('Kategori pengeluaran berhasil dihapus');
        fetchKategoriPengeluaran(); // Refresh data
      } else {
        toast.error('Gagal menghapus kategori pengeluaran');
      }
    } catch (error) {
      console.error('Error deleting kategori pengeluaran:', error);
      toast.error('Gagal menghapus kategori pengeluaran');
    }
  };

  const handleFormSubmit = async (formData: KategoriPengeluaranFormData) => {
    try {
      if (editingKategori) {
        // Update existing kategori
        const response = await kategoriPengeluaranService.update(editingKategori.id, formData);
        if (response.success) {
          toast.success('Kategori pengeluaran berhasil diperbarui');
          fetchKategoriPengeluaran(); // Refresh data
        } else {
          toast.error('Gagal memperbarui kategori pengeluaran');
        }
      } else {
        // Add new kategori
        const response = await kategoriPengeluaranService.create(formData);
        if (response.success) {
          toast.success('Kategori pengeluaran berhasil ditambahkan');
          fetchKategoriPengeluaran(); // Refresh data
        } else {
          toast.error('Gagal menambahkan kategori pengeluaran');
        }
      }

      setIsFormModalOpen(false);
      setEditingKategori(null);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          Object.keys(errors).forEach(key => {
            toast.error(`${key}: ${errors[key][0]}`);
          });
        }
      } else {
        toast.error(editingKategori ? 'Gagal memperbarui kategori pengeluaran' : 'Gagal menambahkan kategori pengeluaran');
      }
    }
  };

  const convertToFormData = (kategori: KategoriPengeluaran): KategoriPengeluaranFormData => ({
    name: kategori.name,
    code: kategori.code,
    description: kategori.description,
    icon: kategori.icon,
    color: kategori.color,
    is_active: kategori.is_active
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
              Master Data Kategori Pengeluaran
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola kategori pengeluaran untuk transaksi keuangan
            </p>
          </div>
          
          <button
            onClick={handleAddKategori}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Tambah Kategori Pengeluaran
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Kategori</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {kategoriList.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {kategoriList.filter(item => item.is_active).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tidak Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {kategoriList.filter(item => !item.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Kategori Pengeluaran
              </label>
              <input
                type="text"
                placeholder="Cari berdasarkan nama, kode, atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <KategoriPengeluaranDataTable
          data={kategoriList}
          onEdit={handleEditKategori}
          onDelete={handleDeleteKategori}
        />

        {/* Form Modal */}
        <KategoriPengeluaranFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingKategori(null);
          }}
          onSubmit={handleFormSubmit}
          isEdit={!!editingKategori}
          initialData={editingKategori ? convertToFormData(editingKategori) : undefined}
        />
      </div>
    </div>
  );
};

export default KategoriPengeluaranPage;
