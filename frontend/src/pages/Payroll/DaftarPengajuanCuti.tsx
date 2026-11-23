import React, { useState, useEffect } from 'react';
import Button from '../../components/common/UI/Button';
import Modal from '../../components/common/UI/Modal';
import Table from '../../components/common/UI/Table';
import {
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { cutiService, type Cuti } from '../../services/cutiService';

interface PengajuanCuti {
  id: number;
  nip: string;
  nama: string;
  divisi: string;
  jabatan: string;
  jenisCuti: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jumlahHari: number;
  alasan: string;
  status: 'pending' | 'approved' | 'rejected';
  tanggalPengajuan: string;
  prioritas: 'Normal' | 'Urgent';
  sisaCutiTahunan: number;
  approvedBy?: string;
  keterangan?: string;
}

const DaftarPengajuanCuti: React.FC = () => {
  const [pengajuanData, setPengajuanData] = useState<PengajuanCuti[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewKeterangan, setReviewKeterangan] = useState('');
  const [stats, setStats] = useState({
    totalPengajuan: 0,
    menungguReview: 0,
    diproses: 0,
    urgent: 0
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
  const [selectedPrioritas, setSelectedPrioritas] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanCuti | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'review'>('view');

  // Load data on component mount and when filters/page change
  useEffect(() => {
    loadPengajuanData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, pagination.currentPage]);

  const loadPengajuanData = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔄 Loading pengajuan cuti data...');
      
      // Fetch data from API
      const [cutiResponse, statsData] = await Promise.all([
        cutiService.getAllCutiAdmin({
          status: selectedStatus || undefined,
          sort_by: 'created_at',
          sort_order: 'desc',
          per_page: pagination.perPage,
          page: pagination.currentPage
        }),
        cutiService.getStatisticsAdmin()
      ]);

      console.log('📡 API Response:', cutiResponse);
      console.log('📊 Stats Data:', statsData);

      // Validate response structure
      if (!cutiResponse || !cutiResponse.data) {
        console.warn('⚠️ Invalid response structure:', cutiResponse);
        setPengajuanData([]);
        setStats({
          totalPengajuan: 0,
          menungguReview: 0,
          diproses: 0,
          urgent: 0
        });
        return;
      }

      // Handle both paginated and non-paginated responses
      const cutiArray = Array.isArray(cutiResponse.data) 
        ? cutiResponse.data 
        : (cutiResponse.data.data || []);

      console.log('📦 Cuti Array:', cutiArray);

      // Transform API data
      const transformedData: PengajuanCuti[] = cutiArray.map((cuti: Cuti) => {
        // Determine priority based on cuti type or date
        const daysDiff = Math.ceil((new Date(cuti.tanggal_mulai).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        const isUrgent = cuti.jenis === 'Cuti Sakit' || daysDiff < 7;

        return {
          id: cuti.id,
          nip: cuti.guru?.nip || '-',
          nama: cuti.guru?.nama_lengkap || 'Unknown',
          divisi: cuti.guru?.jabatan?.nama || '-',
          jabatan: cuti.guru?.jabatan?.nama || '-',
          jenisCuti: cuti.jenis,
          tanggalMulai: cuti.tanggal_mulai,
          tanggalSelesai: cuti.tanggal_selesai,
          jumlahHari: cuti.durasi,
          alasan: cuti.alasan,
          status: cuti.status,
          tanggalPengajuan: cuti.created_at,
          prioritas: isUrgent ? 'Urgent' : 'Normal',
          sisaCutiTahunan: 12, // Default, could be calculated from other data
          approvedBy: cuti.approver?.name,
          keterangan: cuti.pengganti || undefined
        };
      });

      console.log('✅ Transformed Data:', transformedData);

      setPengajuanData(transformedData);
      
      // Update pagination dari backend response
      setPagination({
        currentPage: cutiResponse.data.current_page || 1,
        lastPage: cutiResponse.data.last_page || 1,
        perPage: cutiResponse.data.per_page || 15,
        total: cutiResponse.data.total || 0
      });
      
      // Update stats - semua dari backend
      setStats({
        totalPengajuan: statsData?.total || 0,
        menungguReview: statsData?.pending || 0,
        diproses: statsData?.approved || 0, // Disetujui (yang sudah diproses)
        urgent: transformedData.filter(p => p.prioritas === 'Urgent' && p.status === 'pending').length
      });
    } catch (error: any) {
      console.error('❌ Error loading pengajuan data:', error);
      console.error('Error details:', error.message, error.stack);
      setPengajuanData([]);
      setStats({
        totalPengajuan: 0,
        menungguReview: 0,
        diproses: 0,
        urgent: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPengajuan = pengajuanData.filter(record => {
    const matchesSearch = record.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.nip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivisi = !selectedDivisi || record.divisi === selectedDivisi;
    const matchesPrioritas = !selectedPrioritas || record.prioritas === selectedPrioritas;
    
    return matchesSearch && matchesDivisi && matchesPrioritas;
  });

  const getStatusBadge = (status: PengajuanCuti['status']) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    
    const labels = {
      'pending': 'Menunggu Review',
      'approved': 'Disetujui',
      'rejected': 'Ditolak'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPrioritasBadge = (prioritas: PengajuanCuti['prioritas']) => {
    return prioritas === 'Urgent' ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
        Urgent
      </span>
    ) : null;
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

  const handleOpenModal = (mode: 'view' | 'review', pengajuan: PengajuanCuti) => {
    setModalMode(mode);
    setSelectedPengajuan(pengajuan);
    setReviewKeterangan('');
    setIsModalOpen(true);
  };

  const handleProcessDecision = async (pengajuanId: number, approved: boolean) => {
    if (!window.confirm(`Apakah Anda yakin ingin ${approved ? 'menyetujui' : 'menolak'} pengajuan cuti ini?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      
      if (approved) {
        await cutiService.approveCutiAdmin(pengajuanId, reviewKeterangan);
      } else {
        await cutiService.rejectCutiAdmin(pengajuanId);
      }

      // Reload data
      await loadPengajuanData();
      setIsModalOpen(false);
      setReviewKeterangan('');
      alert(`Pengajuan cuti berhasil ${approved ? 'disetujui' : 'ditolak'}!`);
    } catch (error: any) {
      console.error('Error processing decision:', error);
      alert(error.message || `Gagal ${approved ? 'menyetujui' : 'menolak'} pengajuan. Silakan coba lagi.`);
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
      key: 'nama',
      header: 'Info Karyawan',
      render: (_: any, record: PengajuanCuti) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900">{record.nama}</div>
            <div className="text-sm text-slate-500">{record.nip} • {record.jabatan}</div>
            <div className="text-xs text-slate-400">{record.divisi}</div>
          </div>
        </div>
      )
    },
    {
      key: 'jenisCuti',
      header: 'Detail Cuti',
      render: (_: any, record: PengajuanCuti) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            {getJenisCutiBadge(record.jenisCuti)}
            {getPrioritasBadge(record.prioritas)}
          </div>
          <div className="text-sm text-slate-600">
            <div>{new Date(record.tanggalMulai).toLocaleDateString('id-ID')} -</div>
            <div>{new Date(record.tanggalSelesai).toLocaleDateString('id-ID')}</div>
            <div className="text-xs text-slate-500 mt-1">
              {record.jumlahHari} hari • Sisa: {record.sisaCutiTahunan} hari
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'alasan',
      header: 'Alasan',
      render: (_: any, record: PengajuanCuti) => (
        <div className="text-sm text-slate-600 max-w-xs">
          <div className="truncate">{record.alasan}</div>
        </div>
      )
    },
    {
      key: 'tanggalPengajuan',
      header: 'Tgl Pengajuan',
      render: (_: any, record: PengajuanCuti) => (
        <div className="text-sm text-slate-600">
          <div>{new Date(record.tanggalPengajuan).toLocaleDateString('id-ID')}</div>
          <div className="text-xs text-slate-500">
            {Math.ceil((new Date().getTime() - new Date(record.tanggalPengajuan).getTime()) / (1000 * 3600 * 24))} hari lalu
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, record: PengajuanCuti) => getStatusBadge(record.status)
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (_: any, record: PengajuanCuti) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal('view', record)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {record.status === 'pending' && (
            <button
              onClick={() => handleOpenModal('review', record)}
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Review & Proses"
            >
              <DocumentTextIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl lg:rounded-3xl border border-amber-100/60 shadow-sm">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        <div className="relative p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <DocumentTextIcon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 tracking-tight">
                  Daftar Pengajuan Cuti
                </h1>
                <p className="text-sm lg:text-base text-slate-600 mt-1 leading-relaxed">
                  Review dan proses pengajuan cuti dari karyawan dengan sistem yang efisien
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 text-xs lg:text-sm text-slate-500">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>Update Real-time</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <div className="flex items-center gap-1 text-xs lg:text-sm text-slate-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>Proses Cepat</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Total Pengajuan */}
        <div className="group relative bg-white rounded-2xl lg:rounded-3xl border border-slate-200/60 p-6 lg:p-7 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                <DocumentTextIcon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Aktif</span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Pengajuan</h3>
              <p className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{stats.totalPengajuan}</p>
              <p className="text-xs text-slate-500">Seluruh periode</p>
            </div>
          </div>
        </div>

        {/* Menunggu Review */}
        <div className="group relative bg-white rounded-2xl lg:rounded-3xl border border-slate-200/60 p-6 lg:p-7 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-yellow-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
                <ClockIcon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              {stats.menungguReview > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full animate-pulse">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                  <span>Perlu Review</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Menunggu Review</h3>
              <p className="text-2xl lg:text-3xl font-bold text-amber-600 tracking-tight">{stats.menungguReview}</p>
              <p className="text-xs text-slate-500">Butuh perhatian</p>
            </div>
          </div>
        </div>

        {/* Sedang Diproses */}
        <div className="group relative bg-white rounded-2xl lg:rounded-3xl border border-slate-200/60 p-6 lg:p-7 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform duration-300">
                <CalendarDaysIcon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              {stats.diproses > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-cyan-700 bg-cyan-100 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></div>
                  <span>Dalam Proses</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Sedang Diproses</h3>
              <p className="text-2xl lg:text-3xl font-bold text-cyan-600 tracking-tight">{stats.diproses}</p>
              <p className="text-xs text-slate-500">Dalam tahap review</p>
            </div>
          </div>
        </div>

        {/* Prioritas Urgent */}
        <div className="group relative bg-white rounded-2xl lg:rounded-3xl border border-slate-200/60 p-6 lg:p-7 hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-rose-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform duration-300">
                <ExclamationTriangleIcon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              {stats.urgent > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full animate-pulse">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span>Urgent</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Prioritas Urgent</h3>
              <p className="text-2xl lg:text-3xl font-bold text-red-600 tracking-tight">{stats.urgent}</p>
              <p className="text-xs text-slate-500">Butuh tindakan cepat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          {/* Search Bar */}
          <div className="relative w-full lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari karyawan, NIP, atau alasan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all duration-200 text-sm placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative">
              <select
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 cursor-pointer hover:border-slate-300"
              >
                <option value="">🏢 Semua Divisi</option>
                <option value="Akademik">📚 Akademik</option>
                <option value="Administrasi">📋 Administrasi</option>
                <option value="Keuangan">💰 Keuangan</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset ke halaman 1
                }}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 cursor-pointer hover:border-slate-300"
              >
                <option value="">📊 Semua Status</option>
                <option value="pending">⏳ Menunggu Review</option>
                <option value="approved">✅ Disetujui</option>
                <option value="rejected">❌ Ditolak</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={selectedPrioritas}
                onChange={(e) => setSelectedPrioritas(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 cursor-pointer hover:border-slate-300"
              >
                <option value="">🎯 Semua Prioritas</option>
                <option value="Normal">📝 Normal</option>
                <option value="Urgent">🚨 Urgent</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Filter Indicator */}
          {(searchTerm || selectedDivisi || selectedStatus || selectedPrioritas) && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="font-medium">Filter Aktif</span>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDivisi('');
                  setSelectedStatus('');
                  setSelectedPrioritas('');
                }}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-slate-50/50">
          <div className="px-6 lg:px-8 py-6 lg:py-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                  Pengajuan Cuti
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm text-slate-600">
                    Halaman <span className="font-semibold text-slate-900">{pagination.currentPage}</span> dari <span className="font-semibold text-slate-900">{pagination.lastPage}</span> • Total <span className="font-semibold text-slate-900">{pagination.total}</span> pengajuan
                  </p>
                  {filteredPengajuan.length !== pengajuanData.length && (
                    <div className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                      </svg>
                      <span>Difilter</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button 
                  onClick={loadPengajuanData}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-amber-500/25 disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 lg:py-20">
              <ArrowPathIcon className="w-12 h-12 text-amber-600 animate-spin mb-4" />
              <p className="text-slate-500">Memuat data pengajuan...</p>
            </div>
          ) : filteredPengajuan.length > 0 ? (
            <Table
              data={filteredPengajuan}
              columns={columns}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 lg:py-20">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-100 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-6">
                <DocumentTextIcon className="w-8 h-8 lg:w-10 lg:h-10 text-slate-400" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-slate-900 mb-2">Tidak ada data pengajuan</h3>
              <p className="text-slate-500 text-center max-w-md">
                {searchTerm || selectedDivisi || selectedStatus || selectedPrioritas 
                  ? 'Tidak ada pengajuan yang sesuai dengan filter yang dipilih. Coba ubah kriteria pencarian.'
                  : 'Belum ada pengajuan cuti yang masuk. Data akan muncul ketika ada karyawan yang mengajukan cuti.'
                }
              </p>
              {(searchTerm || selectedDivisi || selectedStatus || selectedPrioritas) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDivisi('');
                    setSelectedStatus('');
                    setSelectedPrioritas('');
                  }}
                  className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors text-sm font-medium"
                >
                  Reset Filter
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {!isLoading && pagination.lastPage > 1 && (
          <div className="px-6 py-4 border-t border-slate-200/60 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Menampilkan <span className="font-semibold">{((pagination.currentPage - 1) * pagination.perPage) + 1}</span> - <span className="font-semibold">{Math.min(pagination.currentPage * pagination.perPage, pagination.total)}</span> dari <span className="font-semibold">{pagination.total}</span> data
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
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
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pagination.currentPage === pageNum
                            ? 'bg-amber-500 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.lastPage}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for View/Review */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'review' ? 'Review Pengajuan Cuti' : 'Detail Pengajuan Cuti'
        }
        size="lg"
      >
        {selectedPengajuan && (
          <div className="space-y-6">
            {modalMode === 'review' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                  <h4 className="font-medium text-amber-800">Review Pengajuan Cuti</h4>
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  Silakan review pengajuan cuti dari {selectedPengajuan.nama} dan berikan keputusan.
                </p>
              </div>
            )}
            
            {/* Employee Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIP</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedPengajuan.nip}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Karyawan</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedPengajuan.nama}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jabatan</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedPengajuan.jabatan}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Divisi</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedPengajuan.divisi}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sisa Cuti Tahunan</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedPengajuan.sisaCutiTahunan} hari</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prioritas</label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  {getPrioritasBadge(selectedPengajuan.prioritas) || 
                    <span className="text-sm text-slate-600">Normal</span>
                  }
                </div>
              </div>
            </div>
            
            {/* Cuti Details */}
            <div className="border-t pt-6">
              <h4 className="font-medium text-slate-900 mb-4">Detail Cuti</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Cuti</label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    {getJenisCutiBadge(selectedPengajuan.jenisCuti)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    {getStatusBadge(selectedPengajuan.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                  <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">
                    {new Date(selectedPengajuan.tanggalMulai).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai</label>
                  <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">
                    {new Date(selectedPengajuan.tanggalSelesai).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Hari</label>
                  <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedPengajuan.jumlahHari} hari</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Pengajuan</label>
                  <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">
                    {new Date(selectedPengajuan.tanggalPengajuan).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Alasan Cuti</label>
                <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg min-h-[80px]">
                  {selectedPengajuan.alasan}
                </p>
              </div>
              
              {selectedPengajuan.keterangan && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
                  <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg min-h-[60px]">
                    {selectedPengajuan.keterangan}
                  </p>
                </div>
              )}
            </div>
            
            {modalMode === 'review' && selectedPengajuan.status === 'pending' && (
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Guru Pengganti (Opsional)</label>
                <textarea
                  rows={3}
                  value={reviewKeterangan}
                  onChange={(e) => setReviewKeterangan(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50"
                  placeholder="Masukkan nama guru pengganti jika ada..."
                />
                
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={() => handleProcessDecision(selectedPengajuan.id, true)}
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
                        Setujui Pengajuan
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleProcessDecision(selectedPengajuan.id, false)}
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
                        Tolak Pengajuan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DaftarPengajuanCuti;
