import React, { useState, useEffect } from 'react';
import { Plus, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import type { UnitSekolah, UnitSekolahFormData } from '../../types/masterData';
import UnitSekolahDataTable from '../../components/MasterData/UnitSekolah/UnitSekolahDataTable';
import UnitSekolahFormModal from '../../components/MasterData/UnitSekolah/UnitSekolahFormModal';
import { unitSekolahService } from '../../services/unitSekolahService';


const UnitSekolahPage: React.FC = () => {
  const [unitSekolahList, setUnitSekolahList] = useState<UnitSekolah[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUnitSekolah, setEditingUnitSekolah] = useState<UnitSekolah | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('');

  // Fetch data from API
  const fetchUnitSekolah = async () => {
    try {
      setLoading(true);
      const response = await unitSekolahService.getAll({
        search: searchTerm,
        status: statusFilter,
        jenjang: jenjangFilter,
        per_page: 100 // Get all data for now
      });
      
      if (response.success) {
        setUnitSekolahList(response.data.data);
      } else {
        toast.error('Gagal memuat data unit sekolah');
      }
    } catch (error) {
      console.error('Error fetching unit sekolah:', error);
      toast.error('Gagal memuat data unit sekolah');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUnitSekolah();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, jenjangFilter]);

  // Initial load
  useEffect(() => {
    fetchUnitSekolah();
  }, []);

  const handleAddUnitSekolah = () => {
    setEditingUnitSekolah(null);
    setIsFormModalOpen(true);
  };

  const handleEditUnitSekolah = (unitSekolah: UnitSekolah) => {
    setEditingUnitSekolah(unitSekolah);
    setIsFormModalOpen(true);
  };

  const handleDeleteUnitSekolah = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data unit sekolah ini?')) {
      try {
        const response = await unitSekolahService.delete(id);
        if (response.success) {
          toast.success('Unit sekolah berhasil dihapus');
          fetchUnitSekolah(); // Refresh data
        } else {
          toast.error('Gagal menghapus unit sekolah');
        }
      } catch (error) {
        console.error('Error deleting unit sekolah:', error);
        toast.error('Gagal menghapus unit sekolah');
      }
    }
  };

  const handleFormSubmit = async (formData: UnitSekolahFormData) => {
    try {
      if (editingUnitSekolah) {
        // Update existing unit sekolah
        const response = await unitSekolahService.update(editingUnitSekolah.id, formData);
        if (response.success) {
          toast.success('Unit sekolah berhasil diperbarui');
          fetchUnitSekolah(); // Refresh data
        } else {
          toast.error('Gagal memperbarui unit sekolah');
        }
      } else {
        // Add new unit sekolah
        const response = await unitSekolahService.create(formData);
        if (response.success) {
          toast.success('Unit sekolah berhasil ditambahkan');
          fetchUnitSekolah(); // Refresh data
        } else {
          toast.error('Gagal menambahkan unit sekolah');
        }
      }

      setIsFormModalOpen(false);
      setEditingUnitSekolah(null);
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
        toast.error(editingUnitSekolah ? 'Gagal memperbarui unit sekolah' : 'Gagal menambahkan unit sekolah');
      }
    }
  };

  const convertToFormData = (unitSekolah: UnitSekolah): UnitSekolahFormData => ({
    kode: unitSekolah.kode,
    nama: unitSekolah.nama,
    jenjang: unitSekolah.jenjang,
    alamat: unitSekolah.alamat,
    kepalaSekolah: unitSekolah.kepalaSekolah,
    status: unitSekolah.status
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              Master Data Unit Sekolah
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola data unit sekolah berdasarkan jenjang pendidikan
            </p>
          </div>
          
          <button
            onClick={handleAddUnitSekolah}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Tambah Unit Sekolah
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Unit Sekolah
              </label>
              <input
                type="text"
                placeholder="Cari berdasarkan kode, nama, atau kepala sekolah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Jenjang
              </label>
              <select
                value={jenjangFilter}
                onChange={(e) => setJenjangFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Jenjang</option>
                <option value="TK">TK</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="SMK">SMK</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Unit</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {unitSekolahList.length}
                </p>
              </div>
            </div>
          </div>

          {['TK', 'SD', 'SMP'].map((jenjang) => (
            <div key={jenjang} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">{jenjang}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {unitSekolahList.filter(item => item.jenjang === jenjang).length}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Table */}
        <UnitSekolahDataTable
          data={unitSekolahList}
          onEdit={handleEditUnitSekolah}
          onDelete={handleDeleteUnitSekolah}
        />

        {/* Form Modal */}
        <UnitSekolahFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingUnitSekolah(null);
          }}
          onSubmit={handleFormSubmit}
          isEdit={!!editingUnitSekolah}
          initialData={editingUnitSekolah ? convertToFormData(editingUnitSekolah) : undefined}
        />
      </div>
    </div>
  );
};

export default UnitSekolahPage;
