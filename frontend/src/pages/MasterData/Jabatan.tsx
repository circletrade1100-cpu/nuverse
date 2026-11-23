import React, { useState, useEffect } from 'react';
import { Plus, Shield } from 'lucide-react';
import type { Jabatan, JabatanFormData } from '../../types/masterData';
import JabatanDataTable from '../../components/MasterData/Jabatan/JabatanDataTable';
import JabatanFormModal from '../../components/MasterData/Jabatan/JabatanFormModal';
import { jabatanService } from '../../services/jabatanService';
import { setTestToken } from '../../utils/auth';

// Mock data untuk demo
const mockJabatan: Jabatan[] = [
  {
    id: '1',
    kode: 'JB001',
    nama: 'Kepala Sekolah',
    level: 1,
    deskripsi: 'Pimpinan tertinggi sekolah',
    gajiPokok: 8000000,
    tunjangan: 2000000,
    status: 'Aktif',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    kode: 'JB002',
    nama: 'Wakil Kepala Sekolah',
    level: 2,
    deskripsi: 'Wakil pimpinan sekolah',
    gajiPokok: 7000000,
    tunjangan: 1500000,
    status: 'Aktif',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    kode: 'JB003',
    nama: 'Guru Utama',
    level: 3,
    deskripsi: 'Guru senior dengan pengalaman tinggi',
    gajiPokok: 6000000,
    tunjangan: 1200000,
    status: 'Aktif',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    kode: 'JB004',
    nama: 'Guru Madya',
    level: 4,
    deskripsi: 'Guru dengan pengalaman menengah',
    gajiPokok: 5000000,
    tunjangan: 1000000,
    status: 'Aktif',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    kode: 'JB005',
    nama: 'Guru Muda',
    level: 5,
    deskripsi: 'Guru pemula atau junior',
    gajiPokok: 4000000,
    tunjangan: 800000,
    status: 'Aktif',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    kode: 'JB006',
    nama: 'Staff Administrasi',
    level: 6,
    deskripsi: 'Tenaga administrasi sekolah',
    gajiPokok: 3500000,
    tunjangan: 500000,
    status: 'Aktif',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const JabatanPage: React.FC = () => {
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJabatan, setEditingJabatan] = useState<Jabatan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load jabatan data from API
  const loadJabatanData = async () => {
    try {
      setLoading(true);
      setError(null);

      const aggregatedData: Jabatan[] = [];
      const perPage = 100;
      let currentPage = 1;
      let lastPage = 1;
      let encounteredError = false;

      do {
        const response = await jabatanService.getAll({
          page: currentPage,
          per_page: perPage,
        });

        if (!response.success) {
          setError('Gagal memuat data jabatan');
          encounteredError = true;
          break;
        }

        aggregatedData.push(...response.data.data);
        lastPage = response.data.last_page;
        currentPage += 1;
      } while (currentPage <= lastPage);

      if (!aggregatedData.length) {
        if (!encounteredError) {
          setError('Tidak ada data jabatan tersedia');
        }
      } else {
        setJabatanList(aggregatedData);
        if (!encounteredError) {
          setError(null);
        }
      }
    } catch (err) {
      console.error('Error loading jabatan data:', err);
      setError('Terjadi kesalahan saat memuat data jabatan');
      // Fallback to mock data if API fails
      setJabatanList(mockJabatan);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set test token for API calls
    setTestToken();
    loadJabatanData();
  }, []);

  const handleAddJabatan = () => {
    setEditingJabatan(null);
    setIsFormModalOpen(true);
  };

  const handleEditJabatan = (jabatan: Jabatan) => {
    setEditingJabatan(jabatan);
    setIsFormModalOpen(true);
  };

  const handleDeleteJabatan = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data jabatan ini?')) {
      try {
        const response = await jabatanService.delete(id);
        
        if (response.success) {
          // Reload data after successful deletion
          await loadJabatanData();
        } else {
          alert('Gagal menghapus data jabatan');
        }
      } catch (err) {
        console.error('Error deleting jabatan:', err);
        alert('Terjadi kesalahan saat menghapus data jabatan');
      }
    }
  };

  const handleFormSubmit = async (formData: JabatanFormData) => {
    try {
      let response;
      
      if (editingJabatan) {
        response = await jabatanService.update(editingJabatan.id, formData);
      } else {
        response = await jabatanService.create(formData);
      }

      if (response.success) {
        await loadJabatanData();
        setIsFormModalOpen(false);
        setEditingJabatan(null);
      } else {
        throw new Error(response.message || 'Gagal menyimpan data jabatan');
      }
    } catch (err) {
      console.error('Error saving jabatan:', err);
      const apiError = err as Error & { errors?: Record<string, string[]> };
      if (!apiError.errors) {
        alert(apiError.message || 'Terjadi kesalahan saat menyimpan data jabatan');
      }
      throw err;
    }
  };

  const convertToFormData = (jabatan: Jabatan): JabatanFormData => ({
    kode: jabatan.kode,
    nama: jabatan.nama,
    level: jabatan.level,
    deskripsi: jabatan.deskripsi,
    gajiPokok: jabatan.gajiPokok,
    tunjangan: jabatan.tunjangan,
    status: jabatan.status
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={loadJabatanData}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
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
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="w-8 h-8 text-amber-600" />
              </div>
              Master Data Jabatan
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola data jabatan dengan level hierarki dan kompensasi
            </p>
          </div>
          
          <button
            onClick={handleAddJabatan}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Tambah Jabatan
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Jabatan</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {jabatanList.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {jabatanList.filter(item => item.status === 'Aktif').length}
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
                <p className="text-sm font-medium text-gray-500">Rata-rata Gaji</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0
                  }).format(
                    jabatanList.reduce((total, item) => total + item.gajiPokok, 0) / jabatanList.length || 0
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tidak Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {jabatanList.filter(item => item.status === 'Tidak Aktif').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <JabatanDataTable
          data={jabatanList}
          onEdit={handleEditJabatan}
          onDelete={handleDeleteJabatan}
        />

        {/* Form Modal */}
        <JabatanFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingJabatan(null);
          }}
          onSubmit={handleFormSubmit}
          isEdit={!!editingJabatan}
          initialData={editingJabatan ? convertToFormData(editingJabatan) : undefined}
        />
      </div>
    </div>
  );
};

export default JabatanPage;
