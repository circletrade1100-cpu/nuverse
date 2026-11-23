import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import type { UnitKelas, UnitKelasFormData } from '../../types/masterData';
import UnitKelasDataTable from '../../components/MasterData/UnitKelas/UnitKelasDataTable';
import UnitKelasFormModal from '../../components/MasterData/UnitKelas/UnitKelasFormModal';
import { unitKelasService } from '../../services/unitKelasService';


const UnitKelasPage: React.FC = () => {
  const [unitKelasList, setUnitKelasList] = useState<UnitKelas[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUnitKelas, setEditingUnitKelas] = useState<UnitKelas | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm] = useState('');
  const [statusFilter] = useState('');

  // Fetch data from API
  const fetchUnitKelas = async () => {
    try {
      setLoading(true);
      const response = await unitKelasService.getAll({
        search: searchTerm,
        status: statusFilter,
        per_page: 100 // Get all data for now
      });
      
      if (response.success) {
        setUnitKelasList(response.data.data);
      } else {
        toast.error('Gagal memuat data unit kelas');
      }
    } catch (error) {
      console.error('Error fetching unit kelas:', error);
      toast.error('Gagal memuat data unit kelas');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUnitKelas();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchUnitKelas();
  }, []);

  const handleAddUnitKelas = () => {
    setEditingUnitKelas(null);
    setIsFormModalOpen(true);
  };

  const handleEditUnitKelas = (unitKelas: UnitKelas) => {
    setEditingUnitKelas(unitKelas);
    setIsFormModalOpen(true);
  };

  const handleDeleteUnitKelas = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data unit kelas ini?')) {
      try {
        const response = await unitKelasService.delete(id);
        if (response.success) {
          toast.success('Unit kelas berhasil dihapus');
          fetchUnitKelas(); // Refresh data
        } else {
          toast.error('Gagal menghapus unit kelas');
        }
      } catch (error) {
        console.error('Error deleting unit kelas:', error);
        toast.error('Gagal menghapus unit kelas');
      }
    }
  };

  const handleFormSubmit = async (formData: UnitKelasFormData) => {
    try {
      if (editingUnitKelas) {
        // Update existing unit kelas
        const response = await unitKelasService.update(editingUnitKelas.id, formData);
        if (response.success) {
          toast.success('Unit kelas berhasil diperbarui');
          fetchUnitKelas(); // Refresh data
        } else {
          toast.error('Gagal memperbarui unit kelas');
        }
      } else {
        // Add new unit kelas
        const response = await unitKelasService.create(formData);
        if (response.success) {
          toast.success('Unit kelas berhasil ditambahkan');
          // Force refresh data immediately
          await fetchUnitKelas();
        } else {
          toast.error('Gagal menambahkan unit kelas');
        }
      }

      setIsFormModalOpen(false);
      setEditingUnitKelas(null);
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
        toast.error(editingUnitKelas ? 'Gagal memperbarui unit kelas' : 'Gagal menambahkan unit kelas');
      }
    }
  };

  const convertToFormData = (unitKelas: UnitKelas): UnitKelasFormData => ({
    kode: unitKelas.kode,
    nama: unitKelas.nama,
    tingkat: unitKelas.tingkat,
    kapasitas: unitKelas.kapasitas,
    waliKelas: unitKelas.waliKelas,
    unitSekolah: unitKelas.unitSekolah,
    unitSekolahId: unitKelas.unitSekolahId ? String(unitKelas.unitSekolahId) : '',
    status: unitKelas.status
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              Master Data Unit Kelas
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola data kelas berdasarkan tingkat dan rombongan belajar
            </p>
          </div>
          
          <button
            onClick={handleAddUnitKelas}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Tambah Unit Kelas
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Kelas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {unitKelasList.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Kapasitas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {unitKelasList.reduce((total, item) => total + item.kapasitas, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {unitKelasList.filter(item => item.status === 'Aktif').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tidak Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {unitKelasList.filter(item => item.status === 'Tidak Aktif').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <UnitKelasDataTable
          data={unitKelasList}
          onEdit={handleEditUnitKelas}
          onDelete={handleDeleteUnitKelas}
        />

        {/* Form Modal */}
        <UnitKelasFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingUnitKelas(null);
          }}
          onSubmit={handleFormSubmit}
          isEdit={!!editingUnitKelas}
          initialData={editingUnitKelas ? convertToFormData(editingUnitKelas) : undefined}
        />
      </div>
    </div>
  );
};

export default UnitKelasPage;
