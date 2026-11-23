import React, { useState, useEffect } from 'react';
import Card from '../../components/common/UI/Card';
import Button from '../../components/common/UI/Button';
import Modal from '../../components/common/UI/Modal';
import Table from '../../components/common/UI/Table';
import {
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { cutiService, type Cuti } from '../../services/cutiService';

interface CutiRecord {
  id: number;
  nip: string;
  nama: string;
  divisi: string;
  jenisCuti: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jumlahHari: number;
  alasan: string;
  status: 'pending' | 'approved' | 'rejected';
  tanggalPengajuan: string;
  approvedBy?: string;
  keterangan?: string;
}

const CutiKaryawan: React.FC = () => {
  const [cutiData, setCutiData] = useState<CutiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cutiStats, setCutiStats] = useState({
    totalPengajuan: 0,
    pending: 0,
    disetujui: 0,
    ditolak: 0,
    totalHariCuti: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedJenisCuti, setSelectedJenisCuti] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCuti, setSelectedCuti] = useState<CutiRecord | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'approve'>('create');
  const [keterangan, setKeterangan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadCutiData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, selectedJenisCuti, pagination.currentPage]);

  const loadCutiData = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔄 Loading cuti karyawan data...');
      
      // Fetch data and statistics from API
      const [cutiResponse, stats] = await Promise.all([
        cutiService.getAllCutiAdmin({
          status: selectedStatus || undefined,
          jenis: selectedJenisCuti || undefined,
          sort_by: 'created_at',
          sort_order: 'desc',
          per_page: pagination.perPage,
          page: pagination.currentPage
        }),
        cutiService.getStatisticsAdmin()
      ]);

      console.log('📡 API Response:', cutiResponse);
      console.log('📊 Stats Data:', stats);

      // Validate response structure
      if (!cutiResponse || !cutiResponse.data) {
        console.warn('⚠️ Invalid response structure:', cutiResponse);
        setCutiData([]);
        setCutiStats({
          totalPengajuan: 0,
          pending: 0,
          disetujui: 0,
          ditolak: 0,
          totalHariCuti: 0
        });
        return;
      }

      // Handle both paginated and non-paginated responses
      const cutiArray = Array.isArray(cutiResponse.data) 
        ? cutiResponse.data 
        : (cutiResponse.data.data || []);

      console.log('📦 Cuti Array:', cutiArray);

      // Transform API data to match CutiRecord interface
      const transformedData: CutiRecord[] = cutiArray.map((cuti: Cuti) => ({
        id: cuti.id,
        nip: cuti.guru?.nip || '-',
        nama: cuti.guru?.nama_lengkap || 'Unknown',
        divisi: cuti.guru?.jabatan?.nama || '-',
        jenisCuti: cuti.jenis,
        tanggalMulai: cuti.tanggal_mulai,
        tanggalSelesai: cuti.tanggal_selesai,
        jumlahHari: cuti.durasi,
        alasan: cuti.alasan,
        status: cuti.status,
        tanggalPengajuan: cuti.created_at,
        approvedBy: cuti.approver?.name,
        keterangan: cuti.pengganti || undefined
      }));

      console.log('✅ Transformed Data:', transformedData);

      setCutiData(transformedData);
      
      // Update pagination dari backend response
      setPagination({
        currentPage: cutiResponse.data.current_page || 1,
        lastPage: cutiResponse.data.last_page || 1,
        perPage: cutiResponse.data.per_page || 15,
        total: cutiResponse.data.total || 0
      });
      
      setCutiStats({
        totalPengajuan: stats?.total || 0,
        pending: stats?.pending || 0,
        disetujui: stats?.approved || 0,
        ditolak: stats?.rejected || 0,
        totalHariCuti: stats?.total_hari || 0
      });
    } catch (error: any) {
      console.error('❌ Error loading cuti data:', error);
      console.error('Error details:', error.message, error.stack);
      setCutiData([]);
      setCutiStats({
        totalPengajuan: 0,
        pending: 0,
        disetujui: 0,
        ditolak: 0,
        totalHariCuti: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCuti = cutiData.filter(record => {
    const matchesSearch = record.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.nip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivisi = !selectedDivisi || record.divisi === selectedDivisi;
    
    return matchesSearch && matchesDivisi;
  });

  const getStatusBadge = (status: CutiRecord['status']) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    
    const labels = {
      'pending': 'Menunggu',
      'approved': 'Disetujui',
      'rejected': 'Ditolak'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getJenisCutiBadge = (jenis: string) => {
    const colors: Record<string, string> = {
      'Cuti Tahunan': 'bg-blue-100 text-blue-800',
      'Cuti Sakit': 'bg-red-100 text-red-800',
      'Cuti Melahirkan': 'bg-pink-100 text-pink-800',
      'Cuti Menikah': 'bg-purple-100 text-purple-800',
      'Cuti Khusus': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[jenis] || 'bg-slate-100 text-slate-800'}`}>
        {jenis}
      </span>
    );
  };

  const handleOpenModal = (mode: 'create' | 'view' | 'approve', cuti?: CutiRecord) => {
    setModalMode(mode);
    setSelectedCuti(cuti || null);
    setKeterangan('');
    setIsModalOpen(true);
  };

  const handleApprove = async (cutiId: number, approved: boolean) => {
    if (!window.confirm(`Apakah Anda yakin ingin ${approved ? 'menyetujui' : 'menolak'} pengajuan cuti ini?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      
      if (approved) {
        await cutiService.approveCutiAdmin(cutiId, keterangan);
      } else {
        await cutiService.rejectCutiAdmin(cutiId);
      }

      // Reload data
      await loadCutiData();
      setIsModalOpen(false);
      alert(`Pengajuan cuti berhasil ${approved ? 'disetujui' : 'ditolak'}!`);
    } catch (error: any) {
      console.error('Error processing approval:', error);
      alert(error.message || `Gagal ${approved ? 'menyetujui' : 'menolak'} cuti. Silakan coba lagi.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columns = [
    {
      key: 'nip',
      header: 'NIP',
      render: (record: CutiRecord) => (
        <div className="font-medium text-slate-900">{record.nip}</div>
      )
    },
    {
      key: 'nama',
      header: 'Nama Karyawan',
      render: (record: CutiRecord) => (
        <div>
          <div className="font-medium text-slate-900">{record.nama}</div>
          <div className="text-sm text-slate-500">{record.divisi}</div>
        </div>
      )
    },
    {
      key: 'jenisCuti',
      header: 'Jenis Cuti',
      render: (record: CutiRecord) => getJenisCutiBadge(record.jenisCuti)
    },
    {
      key: 'periode',
      header: 'Periode Cuti',
      render: (record: CutiRecord) => (
        <div className="text-sm">
          <div>{new Date(record.tanggalMulai).toLocaleDateString('id-ID')} -</div>
          <div>{new Date(record.tanggalSelesai).toLocaleDateString('id-ID')}</div>
          <div className="text-xs text-slate-500 mt-1">{record.jumlahHari} hari</div>
        </div>
      )
    },
    {
      key: 'alasan',
      header: 'Alasan',
      render: (record: CutiRecord) => (
        <div className="text-sm text-slate-600 max-w-xs truncate">
          {record.alasan}
        </div>
      )
    },
    {
      key: 'tanggalPengajuan',
      header: 'Tgl Pengajuan',
      render: (record: CutiRecord) => (
        <div className="text-sm text-slate-600">
          {new Date(record.tanggalPengajuan).toLocaleDateString('id-ID')}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (record: CutiRecord) => getStatusBadge(record.status)
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (record: CutiRecord) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal('view', record)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {record.status === 'pending' && (
            <>
              <button
                onClick={() => handleOpenModal('approve', record)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Proses Persetujuan"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDaysIcon className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Manajemen Cuti Karyawan</h3>
              <p className="text-sm text-slate-600">Kelola pengajuan dan persetujuan cuti karyawan</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={loadCutiData}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => handleOpenModal('create')}
              className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Ajukan Cuti
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Pengajuan</p>
                <p className="text-2xl font-bold text-slate-900">{cutiStats.totalPengajuan}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Menunggu</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-600">{cutiStats.pending}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Disetujui</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{cutiStats.disetujui}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ditolak</p>
              <p className="text-xl md:text-2xl font-bold text-red-600">{cutiStats.ditolak}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XMarkIcon className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Hari</p>
              <p className="text-xl md:text-2xl font-bold text-amber-600">{cutiStats.totalHariCuti}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-amber-600">H</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative w-full lg:w-64">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto lg:flex lg:gap-4">
            <select
              value={selectedDivisi}
              onChange={(e) => setSelectedDivisi(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Semua Divisi</option>
              <option value="Akademik">Akademik</option>
              <option value="Administrasi">Administrasi</option>
              <option value="Keuangan">Keuangan</option>
            </select>
            
            <select
              value={selectedJenisCuti}
              onChange={(e) => {
                setSelectedJenisCuti(e.target.value);
                setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset ke halaman 1
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Semua Jenis Cuti</option>
              <option value="Cuti Tahunan">Cuti Tahunan</option>
              <option value="Cuti Sakit">Cuti Sakit</option>
              <option value="Cuti Melahirkan">Cuti Melahirkan</option>
              <option value="Cuti Menikah">Cuti Menikah</option>
              <option value="Cuti Khusus">Cuti Khusus</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset ke halaman 1
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Cuti Table */}
      <Card>
        <div className="p-4 md:p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Daftar Pengajuan Cuti</h3>
          <p className="text-sm text-slate-600 mt-1">
            {isLoading ? 'Memuat data...' : `Halaman ${pagination.currentPage} dari ${pagination.lastPage} • Total ${pagination.total} pengajuan`}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <ArrowPathIcon className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
                <p className="text-slate-500">Memuat data cuti...</p>
              </div>
            </div>
          ) : filteredCuti.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDaysIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Belum ada data pengajuan cuti</p>
            </div>
          ) : (
            <Table
              data={filteredCuti}
              columns={columns}
            />
          )}
        </div>
        
        {/* Pagination */}
        {!isLoading && pagination.lastPage > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Halaman <span className="font-semibold">{pagination.currentPage}</span> dari <span className="font-semibold">{pagination.lastPage}</span> • Total <span className="font-semibold">{pagination.total}</span> data
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                
                {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                  let pageNum;
                  if (pagination.lastPage <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.lastPage - 2) {
                    pageNum = pagination.lastPage - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        pagination.currentPage === pageNum
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.lastPage}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal for Create/View/Approve */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'create' ? 'Ajukan Cuti Baru' :
          modalMode === 'approve' ? 'Proses Persetujuan Cuti' :
          'Detail Pengajuan Cuti'
        }
        size="lg"
      >
        <div className="space-y-6">
          {modalMode === 'view' && selectedCuti ? (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIP</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedCuti.nip}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Karyawan</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedCuti.nama}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Divisi</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedCuti.divisi}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Cuti</label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  {getJenisCutiBadge(selectedCuti.jenisCuti)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">
                  {new Date(selectedCuti.tanggalMulai).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">
                  {new Date(selectedCuti.tanggalSelesai).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Hari</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedCuti.jumlahHari} hari</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  {getStatusBadge(selectedCuti.status)}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Alasan Cuti</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg min-h-[80px]">{selectedCuti.alasan}</p>
              </div>
              {selectedCuti.keterangan && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan dari HRD</label>
                  <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg min-h-[60px]">{selectedCuti.keterangan}</p>
                </div>
              )}
            </div>
          ) : modalMode === 'approve' && selectedCuti ? (
            // Approve Mode
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                  <h4 className="font-medium text-amber-800">Proses Persetujuan Cuti</h4>
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  Silakan review pengajuan cuti dari {selectedCuti.nama} dan berikan keputusan Anda.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Karyawan:</span>
                  <p className="text-slate-900">{selectedCuti.nama} ({selectedCuti.nip})</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Jenis Cuti:</span>
                  <p className="text-slate-900">{selectedCuti.jenisCuti}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Periode:</span>
                  <p className="text-slate-900">
                    {new Date(selectedCuti.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(selectedCuti.tanggalSelesai).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Durasi:</span>
                  <p className="text-slate-900">{selectedCuti.jumlahHari} hari</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alasan Cuti</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedCuti.alasan}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Guru Pengganti (Opsional)</label>
                <textarea
                  rows={3}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50"
                  placeholder="Masukkan nama guru pengganti jika ada..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleApprove(selectedCuti.id, true)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Setujui Cuti
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleApprove(selectedCuti.id, false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Tolak Cuti
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Create Mode - Form would go here
            <div className="text-center py-12">
              <p className="text-slate-500">Form untuk mengajukan cuti baru akan ditambahkan di sini.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CutiKaryawan;
