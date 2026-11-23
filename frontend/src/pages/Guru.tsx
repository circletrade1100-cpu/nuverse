import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Guru, GuruFormData } from '../types/guru';
import { convertGuruToFormData } from '../types/guru';
import { guruService } from '../services/guruService';
import type { GuruFormData as ServiceGuruFormData } from '../services/guruService';
import { unitSekolahService } from '../services/unitSekolahService';
import type { UnitSekolah } from '../types/masterData';
import GuruDataTable from '../components/Guru/GuruDataTable';
import GuruImportModal from '../components/Guru/GuruImportModal';
import GuruFormModal from '../components/Guru/GuruFormModal';
import GuruDetailModal from '../components/Guru/GuruDetailModal';


const GuruPage: React.FC = () => {
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    aktif: 0,
    nonAktif: 0,
    pensiun: 0
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0
  });

  // Filter state untuk backend filtering
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    unit_sekolah_id: ''
  });

  // Unit sekolah data for dropdown
  const [unitSekolahs, setUnitSekolahs] = useState<UnitSekolah[]>([]);

  // Helper function to convert component GuruFormData to service GuruFormData
  const convertToServiceFormData = (formData: GuruFormData): ServiceGuruFormData => {
    
    return {
      nama_lengkap: formData.namaLengkap,
      nip: formData.nip,
      jabatan_id: parseInt(formData.jabatan),
      status: formData.status,
      tmt: formData.tmt,
      unit_sekolah_id: parseInt(formData.unitKerja),
      tempat_lahir: formData.tempatLahir,
      tanggal_lahir: formData.tanggalLahir,
      jenjang_pendidikan: formData.jenjangPendidikan,
      jurusan: formData.jurusan,
      status_pernikahan: formData.statusPernikahan,
      tugas_tambahan: formData.tugasTambahan,
      mapel_diampu: formData.mapelDiampu ? formData.mapelDiampu.split(',').map(m => m.trim()) : [],
      jam_mengajar: parseInt(formData.jamMengajar) || 0,
      email: formData.email,
      no_telepon: formData.noTelepon,
      alamat: formData.alamat,
      username: formData.username,
      password: formData.password,
      avatar: formData.avatar,
      // Payroll fields - convert string to number
      gaji_pokok: parseInt(formData.gajiPokok.replace(/\./g, '')) || 0,
      tunjangan_jabatan: parseInt(formData.tunjanganJabatan.replace(/\./g, '')) || 0,
      tunjangan_masa_kerja: parseInt(formData.tunjanganMasaKerja.replace(/\./g, '')) || 0,
      wali_kelas: parseInt(formData.waliKelas.replace(/\./g, '')) || 0,
      koordinator: parseInt(formData.koordinator.replace(/\./g, '')) || 0,
      tatap_muka: formData.tatapMuka || '0',
      t_muka_pengganti: formData.tMukaPengganti || '0',
      tunj_keluarga: parseInt(formData.tunjKeluarga.replace(/\./g, '')) || 0,
      transport1: parseInt(formData.transport1.replace(/\./g, '')) || 0,
      transport2: parseInt(formData.transport2.replace(/\./g, '')) || 0,
      makan: parseInt(formData.makan.replace(/\./g, '')) || 0,
      jamsostek: parseInt(formData.jamsostek.replace(/\./g, '')) || 0,
      overtime: parseInt(formData.overtime.replace(/\./g, '')) || 0,
      pramuka: parseInt(formData.pramuka.replace(/\./g, '')) || 0,
      tunj_lain: parseInt(formData.tunjLain.replace(/\./g, '')) || 0,
      ekskul: parseInt(formData.ekskul.replace(/\./g, '')) || 0,
      bpjs: parseInt(formData.bpjs.replace(/\./g, '')) || 0,
      bimbel: parseInt(formData.bimbel.replace(/\./g, '')) || 0,
      proyek: parseInt(formData.proyek.replace(/\./g, '')) || 0,
      insentif_peng_pramuka: parseInt(formData.insentifPengPramuka.replace(/\./g, '')) || 0,
      insentif_peng_ekskul: parseInt(formData.insentifPengEkskul.replace(/\./g, '')) || 0,
      insentif_peng_proyek: parseInt(formData.insentifPengProyek.replace(/\./g, '')) || 0,
      insentif_pengurus_bimbel: parseInt(formData.insentifPengurusBimbel.replace(/\./g, '')) || 0,
      // Bank fields - ensure not undefined/null
      nama_bank: formData.namaBank || '',
      no_rekening: formData.noRekening || '',
    };
  };

  useEffect(() => {
    fetchGurus(1);
    fetchStats();
    fetchUnitSekolahs();
  }, []);

  const fetchGurus = async (page: number = 1, filterParams?: any) => {
    try {
      setLoading(true);
      // Gunakan filter params yang diberikan, atau gunakan state filters
      const params = filterParams || filters;
      const response = await guruService.getAll({ 
        page, 
        per_page: 10,
        search: params.search || undefined,
        status: params.status || undefined,
        unit_sekolah_id: params.unit_sekolah_id || undefined
      });
      
      if (response.success) {
        setGurus(response.data.data as any); // Data sudah di-convert di service
        setPagination({
          currentPage: response.data.current_page,
          lastPage: response.data.last_page,
          perPage: response.data.per_page,
          total: response.data.total
        });
      } else {
        console.error('API failed to fetch gurus');
        setGurus([]);
        toast.error('Gagal mengambil data guru dari backend');
      }
    } catch (error) {
      console.error('Error fetching gurus:', error);
      setGurus([]);
      toast.error('Gagal mengambil data guru dari backend');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Fetch data dengan filter baru, mulai dari page 1
    fetchGurus(1, newFilters);
  };

  const handleResetFilters = () => {
    const emptyFilters = { search: '', status: '', unit_sekolah_id: '' };
    setFilters(emptyFilters);
    fetchGurus(1, emptyFilters);
  };

  const fetchStats = async () => {
    try {
      // Fetch all data without pagination to get accurate stats
      const response = await guruService.getAll({ per_page: 10000 });
      
      if (response.success) {
        const allGurus = response.data.data as any[];
        setStats({
          total: response.data.total,
          aktif: allGurus.filter((g: any) => g.status === 'Aktif').length,
          nonAktif: allGurus.filter((g: any) => g.status === 'Non-Aktif').length,
          pensiun: allGurus.filter((g: any) => g.status === 'Pensiun').length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleImportExcel = async (file: File) => {
    // Simulate import process
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // In real implementation, this would parse the Excel file and update the gurus
        console.log('Importing file:', file.name);
        
        // For demo, we'll just show success
        resolve();
      }, 2000);
    });
  };

  const handleAddGuru = () => {
    setEditingGuru(null);
    setIsFormModalOpen(true);
  };

  const handleEditGuru = (guru: Guru) => {
    setEditingGuru(guru);
    setIsFormModalOpen(true);
  };

  const handleDeleteGuru = async (guruId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
      try {
        const response = await guruService.delete(guruId);
        if (response.success) {
          toast.success('Data guru berhasil dihapus');
          fetchGurus(pagination.currentPage); // Refresh data
          fetchStats(); // Refresh stats
        } else {
          toast.error('Gagal menghapus data guru');
        }
      } catch (error) {
        console.error('Error deleting guru:', error);
        toast.error('Gagal menghapus data guru');
      }
    }
  };

  const handleViewGuru = (guru: Guru) => {
    setSelectedGuru(guru);
    setIsDetailModalOpen(true);
  };

  const handleExportGuru = async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Anda harus login terlebih dahulu');
        return;
      }

      console.log('Exporting guru data...');
      await guruService.export({});
      toast.success('Data guru berhasil diekspor');
    } catch (error) {
      console.error('Export error:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast.error('Session expired. Silakan login kembali');
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki izin untuk mengekspor data');
      } else {
        toast.error('Gagal mengekspor data guru: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleExportPdf = async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Anda harus login terlebih dahulu');
        return;
      }

      console.log('Exporting guru data to PDF...');
      await guruService.exportPdf({});
      toast.success('Data guru berhasil diekspor ke PDF');
    } catch (error) {
      console.error('PDF Export error:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast.error('Session expired. Silakan login kembali');
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki izin untuk mengekspor data');
      } else {
        toast.error('Gagal mengekspor data guru ke PDF: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleFormSubmit = async (formData: GuruFormData) => {
    try {
      const serviceFormData = convertToServiceFormData(formData);
      
      if (editingGuru) {
        // Update existing guru
        const response = await guruService.update(editingGuru.id, serviceFormData);
        if (response.success) {
          toast.success('Data guru berhasil diperbarui');
          fetchGurus(pagination.currentPage); // Refresh data
          fetchStats(); // Refresh stats
        } else {
          toast.error('Gagal memperbarui data guru');
        }
      } else {
        // Add new guru
        const response = await guruService.create(serviceFormData);
        if (response.success) {
          toast.success('Data guru berhasil ditambahkan');
          fetchGurus(1); // Refresh data, go to first page
          fetchStats(); // Refresh stats
        } else {
          toast.error('Gagal menambahkan data guru');
        }
      }
      
      setIsFormModalOpen(false);
      setEditingGuru(null);
    } catch (error: any) {
      console.error('Error saving guru:', error);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          Object.keys(errors).forEach(key => {
            toast.error(`${key}: ${errors[key][0]}`);
          });
        }
      } else {
        toast.error(editingGuru ? 'Gagal memperbarui data guru' : 'Gagal menambahkan data guru');
      }
      throw error;
    }
  };


  const handleEditFromDetail = (guru: Guru) => {
    console.log('=== EDIT FROM DETAIL ===');
    console.log('Original guru data:', guru);
    
    const convertedData = convertGuruToFormData(guru);
    console.log('Converted form data:', convertedData);
    
    setEditingGuru(guru);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const fetchUnitSekolahs = async () => {
    try {
      const unitSekolahsData = await unitSekolahService.getAllForDropdown();
      setUnitSekolahs(unitSekolahsData);
    } catch (error) {
      console.error('Error fetching unit sekolah:', error);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Guru</h1>
                <p className="text-gray-600">Kelola data guru dan informasi kepegawaian</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                <span>Import Excel</span>
              </button>
              
              <button
                onClick={handleAddGuru}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Guru</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Guru</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Guru Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.aktif}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Non-Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.nonAktif}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pensiun</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pensiun}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <GuruDataTable
          gurus={gurus}
          onImportExcel={handleImportExcel}
          onEditGuru={handleEditGuru}
          onDeleteGuru={handleDeleteGuru}
          onViewGuru={handleViewGuru}
          onExportGuru={handleExportGuru}
          onExportPdf={handleExportPdf}
          pagination={pagination}
          onPageChange={fetchGurus}
          unitSekolahs={unitSekolahs}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Import Modal */}
        <GuruImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportExcel}
        />

        {/* Guru Form Modal */}
        <GuruFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingGuru(null);
          }}
          onSubmit={handleFormSubmit}
          isEdit={!!editingGuru}
          initialData={editingGuru ? convertGuruToFormData(editingGuru) : undefined}
        />

        {/* Guru Detail Modal */}
        <GuruDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedGuru(null);
          }}
          guru={selectedGuru}
          onEdit={handleEditFromDetail}
        />
      </div>
    </div>
  );
};

export default GuruPage;
