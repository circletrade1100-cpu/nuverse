import React, { useState, useEffect } from 'react';
import { Plus, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { UnitKerja, UnitKerjaFormData, UnitSekolah } from '../../types/masterData';
import UnitKerjaDataTable from '../../components/MasterData/UnitKerja/UnitKerjaDataTable';
import UnitKerjaFormModal from '../../components/MasterData/UnitKerja/UnitKerjaFormModal';
import { unitKerjaService } from '../../services/unitKerjaService';
import { unitSekolahService } from '../../services/unitSekolahService';

const UnitKerjaPage: React.FC = () => {
  const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUnitKerja, setEditingUnitKerja] = useState<UnitKerja | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [unitSekolahs, setUnitSekolahs] = useState<UnitSekolah[]>([]);

  // Fetch data from API
  const fetchUnitKerja = async () => {
    try {
      setLoading(true);
      const response = await unitKerjaService.getAll({
        search: searchTerm,
        status: statusFilter,
        per_page: 100 // Get all data for now
      });
      
      if (response.success) {
        setUnitKerjaList(response.data.data);
      } else {
        toast.error('Gagal memuat data unit kerja');
      }
    } catch (error) {
      console.error('Error fetching unit kerja:', error);
      toast.error('Gagal memuat data unit kerja');
    } finally {
      setLoading(false);
    }
  };

  // Load unit sekolah data
  const fetchUnitSekolahs = async () => {
    try {
      const data = await unitSekolahService.getAllForDropdown();
      setUnitSekolahs(data);
    } catch (error) {
      console.error('Error loading unit sekolah:', error);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUnitKerja();
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  // Load initial data
  useEffect(() => {
    fetchUnitSekolahs();
  }, []);

  const handleAddUnitKerja = () => {
    setEditingUnitKerja(null);
    setIsFormModalOpen(true);
  };

  const handleEditUnitKerja = (unitKerja: UnitKerja) => {
    setEditingUnitKerja(unitKerja);
    setIsFormModalOpen(true);
  };

  const handleDeleteUnitKerja = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data unit kerja ini?')) {
      return;
    }

    try {
      const response = await unitKerjaService.delete(id);
      if (response.success) {
        toast.success('Unit kerja berhasil dihapus');
        fetchUnitKerja(); // Refresh data
      } else {
        toast.error('Gagal menghapus unit kerja');
      }
    } catch (error) {
      console.error('Error deleting unit kerja:', error);
      toast.error('Gagal menghapus unit kerja');
    }
  };

  const handleFormSubmit = async (formData: UnitKerjaFormData) => {
    try {
      if (editingUnitKerja) {
        // Update existing unit kerja
        const response = await unitKerjaService.update(editingUnitKerja.id, formData);
        if (response.success) {
          toast.success('Unit kerja berhasil diperbarui');
          fetchUnitKerja(); // Refresh data
        } else {
          toast.error('Gagal memperbarui unit kerja');
        }
      } else {
        // Add new unit kerja
        const response = await unitKerjaService.create(formData);
        if (response.success) {
          toast.success('Unit kerja berhasil ditambahkan');
          fetchUnitKerja(); // Refresh data
        } else {
          toast.error('Gagal menambahkan unit kerja');
        }
      }

      setIsFormModalOpen(false);
      setEditingUnitKerja(null);
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
        toast.error(editingUnitKerja ? 'Gagal memperbarui unit kerja' : 'Gagal menambahkan unit kerja');
      }
    }
  };

  const convertToFormData = (unitKerja: UnitKerja): UnitKerjaFormData => ({
    kode: unitKerja.kode,
    nama: unitKerja.nama,
    deskripsi: unitKerja.deskripsi,
    status: unitKerja.status,
    unitSekolahId: unitKerja.unitSekolahId
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
              <div className="p-2 bg-violet-100 rounded-lg">
                <Building2 className="w-8 h-8 text-violet-600" />
              </div>
              Master Data Unit Kerja
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola data unit kerja dalam organisasi
            </p>
          </div>
          
          <button
            onClick={handleAddUnitKerja}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Tambah Unit Kerja
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Building2 className="w-5 h-5 text-violet-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Unit Kerja</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {unitKerjaList.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {unitKerjaList.filter(item => item.status === 'Aktif').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Building2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tidak Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {unitKerjaList.filter(item => item.status === 'Tidak Aktif').length}
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
                Cari Unit Kerja
              </label>
              <input
                type="text"
                placeholder="Cari berdasarkan kode, nama, atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <UnitKerjaDataTable
          data={unitKerjaList}
          unitSekolahs={unitSekolahs}
          onEdit={handleEditUnitKerja}
          onDelete={handleDeleteUnitKerja}
        />

        {/* Form Modal */}
        <UnitKerjaFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingUnitKerja(null);
          }}
          onSubmit={handleFormSubmit}
          isEdit={!!editingUnitKerja}
          initialData={editingUnitKerja ? convertToFormData(editingUnitKerja) : undefined}
        />
      </div>
    </div>
  );
};

export default UnitKerjaPage;
