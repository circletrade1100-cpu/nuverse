import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Timer,
  User,
  MapPin,
  Filter,
  Search,
  Download,
  AlertCircle,
  CalendarDays,
  X,
  Save,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { overtimeService, type Overtime, type OvertimeStatistics } from '../../services/overtimeService';
import { guruAuthService, type GuruProfile } from '../../services/guruAuthService';
import { toast } from 'react-hot-toast';

const Lembur: React.FC = () => {
  const navigate = useNavigate();
  const [showLemburForm, setShowLemburForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentGuru, setCurrentGuru] = useState<GuruProfile | null>(null);
  const [lemburData, setLemburData] = useState<Overtime[]>([]);
  const [lemburStats, setLemburStats] = useState<OvertimeStatistics>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    total_jam: 0,
    total_pendapatan: 0,
    bulan_ini: 0,
    tahun_ini: 0
  });
  const [lemburFormData, setLemburFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jamMulai: '',
    jamSelesai: '',
    jenisKegiatan: 'mengajar',
    deskripsi: '',
    lokasi: '',
    supervisor: '',
    tarif: '0'
  });

  // Load guru data saat component mount
  useEffect(() => {
    const guruData = guruAuthService.getGuruData();
    if (guruData) {
      setCurrentGuru(guruData);
      console.log('👤 Current logged in guru:', guruData.nama_lengkap, `(ID: ${guruData.id})`);
    } else {
      toast.error('Data guru tidak ditemukan. Silakan login kembali.');
      navigate('/guru/login');
    }
  }, [navigate]);

  // Fetch data lembur dan statistics
  useEffect(() => {
    if (currentGuru) {
      fetchOvertimeData();
      fetchStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, currentGuru]);

  const fetchOvertimeData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching overtime data for guru:', currentGuru?.nama_lengkap, `(ID: ${currentGuru?.id})`);
      
      const params = selectedFilter !== 'semua' ? { status: selectedFilter } : {};
      const response = await overtimeService.getMyOvertime(params);
      
      if (response.success && response.data) {
        console.log('✅ Overtime data loaded:', response.data.data.length, 'records');
        setLemburData(response.data.data);
      }
    } catch (error: any) {
      console.error('❌ Error fetching overtime data:', error);
      
      if (error?.response?.status === 401) {
        toast.error('Sesi login habis. Silakan login kembali.');
        guruAuthService.clearAuthData();
        navigate('/guru/login');
      } else {
        toast.error('Gagal memuat data lembur');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      console.log('📈 Fetching statistics for guru ID:', currentGuru?.id);
      
      const response = await overtimeService.getStatistics();
      if (response.success && response.data) {
        console.log('✅ Statistics loaded:', response.data);
        setLemburStats(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
    }
  };

  // Map jenis kegiatan untuk backend
  const mapJenisKegiatan = (jenis: string): string => {
    const mapping: { [key: string]: string } = {
      'mengajar': 'Mengajar Tambahan',
      'rapat': 'Rapat Koordinasi',
      'ekstra': 'Kegiatan Ekstra',
      'admin': 'Tugas Administrasi',
      'event': 'Event Sekolah',
      'lainnya': 'Lainnya'
    };
    return mapping[jenis] || jenis;
  };

  // Generate initial dari nama
  const getInitials = (name: string): string => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Disetujui';
      case 'pending': return 'Menunggu';
      case 'rejected': return 'Ditolak';
      default: return 'Unknown';
    }
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startTime = new Date(`2024-01-01 ${start}`);
    const endTime = new Date(`2024-01-01 ${end}`);
    const diffMs = endTime.getTime() - startTime.getTime();
    return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
  };

  const handleFormChange = (field: string, value: string) => {
    setLemburFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitLembur = async () => {
    // Validation
    if (!lemburFormData.tanggal || !lemburFormData.jamMulai || !lemburFormData.jamSelesai || !lemburFormData.deskripsi || !lemburFormData.tarif) {
      toast.error('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    const duration = calculateDuration(lemburFormData.jamMulai, lemburFormData.jamSelesai);
    if (duration <= 0) {
      toast.error('Jam selesai harus lebih besar dari jam mulai!');
      return;
    }

    try {
      setLoading(true);
      
      // Get current guru from guruAuthService
      const guruData = guruAuthService.getGuruData();
      
      if (!guruData || !guruData.id) {
        toast.error('Data guru tidak ditemukan. Silakan login kembali.');
        guruAuthService.clearAuthData();
        navigate('/guru/login');
        return;
      }

      const overtimeData = {
        id_guru: guruData.id,
        tanggal: lemburFormData.tanggal,
        jam_mulai: lemburFormData.jamMulai,
        jam_selesai: lemburFormData.jamSelesai,
        jenis: mapJenisKegiatan(lemburFormData.jenisKegiatan),
        deskripsi: lemburFormData.deskripsi,
        tarif: parseInt(lemburFormData.tarif),
        supervisor: lemburFormData.supervisor || undefined
      };

      console.log('📝 Submitting overtime for guru:', guruData.nama_lengkap, `(ID: ${guruData.id})`);
      console.log('📋 Overtime data:', overtimeData);
      
      const response = await overtimeService.createOvertime(overtimeData);
      
      if (response.success) {
        toast.success('Data lembur berhasil dicatat!');
        
        // Reset form
        setLemburFormData({
          tanggal: new Date().toISOString().split('T')[0],
          jamMulai: '',
          jamSelesai: '',
          jenisKegiatan: 'mengajar',
          deskripsi: '',
          lokasi: '',
          supervisor: '',
          tarif: '0'
        });
        setShowLemburForm(false);
        
        // Refresh data
        fetchOvertimeData();
        fetchStatistics();
      }
    } catch (error: any) {
      console.error('Error submitting overtime:', error);
      const errorMessage = error?.response?.data?.message || 'Gagal menyimpan data lembur';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowLemburForm(false);
    setLemburFormData({
      tanggal: new Date().toISOString().split('T')[0],
      jamMulai: '',
      jamSelesai: '',
      jenisKegiatan: 'mengajar',
      deskripsi: '',
      lokasi: '',
      supervisor: '',
      tarif: '0'
    });
  };

  const filteredData = lemburData.filter(item => {
    if (!searchQuery) return true;
    return (
      item.jenis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.supervisor && item.supervisor.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const currentDate = new Date().toLocaleDateString('id-ID');
      const guruNama = currentGuru?.nama_lengkap || 'Guru';
      const guruNIP = currentGuru?.nip || '-';
      const unitSekolah = currentGuru?.unit_sekolah?.nama || 'SIT ANNUR CIKARANG BARU';
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Lembur Guru</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #7C3AED; padding-bottom: 20px; }
            .guru-info { text-align: center; margin-bottom: 20px; background: #F1F5F9; padding: 15px; border-radius: 8px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-item { text-align: center; padding: 10px; background: #F1F5F9; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #CBD5E1; padding: 12px; text-align: left; }
            th { background: #7C3AED; color: white; font-weight: bold; }
            tr:nth-child(even) { background: #F8FAFC; }
            .status-approved { color: #059669; font-weight: bold; }
            .status-pending { color: #D97706; font-weight: bold; }
            .status-rejected { color: #DC2626; font-weight: bold; }
            .total-row { background: #E5E7EB; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LAPORAN LEMBUR GURU</h1>
            <h2>${unitSekolah}</h2>
            <p>Bulan: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
          </div>
          
          <div class="guru-info">
            <h3 style="margin: 5px 0;">Nama: ${guruNama}</h3>
            <p style="margin: 5px 0; color: #666;">NIP: ${guruNIP}</p>
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <h4>Total Jam Lembur</h4>
              <p style="font-size: 24px; color: #7C3AED; margin: 5px 0;">${lemburStats.total_jam}</p>
            </div>
            <div class="stat-item">
              <h4>Lembur Bulan Ini</h4>
              <p style="font-size: 24px; color: #059669; margin: 5px 0;">${lemburStats.bulan_ini}</p>
            </div>
            <div class="stat-item">
              <h4>Total Pendapatan</h4>
              <p style="font-size: 24px; color: #D97706; margin: 5px 0;">Rp ${lemburStats.total_pendapatan.toLocaleString()}</p>
            </div>
            <div class="stat-item">
              <h4>Pending Approval</h4>
              <p style="font-size: 24px; color: #DC2626; margin: 5px 0;">${lemburStats.pending}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Jam Mulai</th>
                <th>Jam Selesai</th>
                <th>Durasi</th>
                <th>Jenis Kegiatan</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>Tarif/Jam</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                  <td>${item.jam_mulai}</td>
                  <td>${item.jam_selesai}</td>
                  <td>${item.durasi} jam</td>
                  <td>${item.jenis}</td>
                  <td>${item.deskripsi}</td>
                  <td class="status-${item.status}">${getStatusText(item.status).toUpperCase()}</td>
                  <td>Rp ${item.tarif.toLocaleString()}</td>
                  <td>Rp ${item.total.toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4">TOTAL</td>
                <td>${filteredData.reduce((sum, item) => sum + item.durasi, 0)} jam</td>
                <td colspan="4"></td>
                <td>Rp ${filteredData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 40px;">
            <div style="display: flex; justify-content: space-between;">
              <div style="text-align: left; width: 45%;">
                <p>Dicetak oleh:</p>
                <p style="font-weight: bold; margin-top: 60px;">_________________________</p>
                <p style="font-weight: bold;">${guruNama}</p>
                <p>NIP: ${guruNIP}</p>
              </div>
              <div style="text-align: right; width: 45%;">
                <p>Cikarang, ${currentDate}</p>
                <p>Mengetahui,</p>
                <p>Kepala Sekolah</p>
                <p style="font-weight: bold; margin-top: 60px;">_________________________</p>
                <p style="font-weight: bold;">(.....................)</p>
                <p>NIP: ........................</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/guru/dashboard')}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-white text-xl font-semibold">Manajemen Lembur</h1>
                
              </div>
            </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrint}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              title="Print Laporan"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={() => setShowLemburForm(true)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              title="Catat Lembur"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Teacher Info */}
        {currentGuru && (
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              {currentGuru.avatar ? (
                <img 
                  src={currentGuru.avatar} 
                  alt={currentGuru.nama_lengkap}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">
                    {getInitials(currentGuru.nama_lengkap)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-white font-semibold">{currentGuru.nama_lengkap}</h3>
                <p className="text-green-100 text-sm">
                  {currentGuru.jabatan?.nama || 'Guru'} - {currentGuru.unit_sekolah?.nama || 'SIT ANNUR'}
                </p>
                <p className="text-green-200 text-xs">NIP: {currentGuru.nip || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 -mt-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Timer className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{lemburStats.total_jam}</p>
            <p className="text-xs text-gray-600">Total Jam</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{lemburStats.bulan_ini}</p>
            <p className="text-xs text-gray-600">Bulan Ini</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-sm font-bold text-gray-800">Rp {(lemburStats.total_pendapatan / 1000).toFixed(0)}K</p>
            <p className="text-xs text-gray-600">Pendapatan</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{lemburStats.pending}</p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>
        </div>

        {/* Quick Action */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
          <button 
            onClick={() => setShowLemburForm(true)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-6 h-6" />
            <span className="font-semibold">Catat Lembur Baru</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Filter & Pencarian</h3>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari jenis kegiatan, deskripsi, atau supervisor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
              />
            </div>
            <button 
              onClick={() => setSearchQuery('')}
              className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              title="Clear Search"
            >
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="semua">Semua Status</option>
              <option value="approved">Disetujui</option>
              <option value="pending">Menunggu</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Riwayat Lembur */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Riwayat Lembur</h3>
            <span className="text-sm text-gray-600">{filteredData.length} record</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada data lembur</p>
              </div>
            ) : (
              filteredData.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-center min-w-[60px]">
                  <p className="text-xs text-gray-600">Tanggal</p>
                  <p className="text-sm font-bold text-gray-800">{new Date(item.tanggal).getDate()}</p>
                  <p className="text-xs text-gray-600">{new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })}</p>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="text-xs font-medium">{getStatusText(item.status)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{item.jenis}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{item.deskripsi}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Durasi: {item.durasi} jam</span>
                    <span>Supervisor: {item.supervisor}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {item.jam_mulai} - {item.jam_selesai}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-green-600">Rp {item.total.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">({item.tarif.toLocaleString()}/jam)</span>
                    </div>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Form Pencatatan Lembur Modal */}
      {showLemburForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">Catat Lembur</h3>
                    <p className="text-green-100 text-sm">Form pencatatan jam lembur</p>
                  </div>
                </div>
                <button 
                  onClick={handleCancelForm}
                  className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4 text-gray-600" />
                  <span>Tanggal Lembur</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={lemburFormData.tanggal}
                  onChange={(e) => handleFormChange('tanggal', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                />
              </div>

              {/* Waktu */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>Jam Mulai</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={lemburFormData.jamMulai}
                    onChange={(e) => handleFormChange('jamMulai', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>Jam Selesai</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={lemburFormData.jamSelesai}
                    onChange={(e) => handleFormChange('jamSelesai', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Durasi Display */}
              {lemburFormData.jamMulai && lemburFormData.jamSelesai && (
                <div className="bg-green-50 p-3 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Durasi: {calculateDuration(lemburFormData.jamMulai, lemburFormData.jamSelesai)} jam
                    </span>
                  </div>
                </div>
              )}

              {/* Jenis Kegiatan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  <span>Jenis Kegiatan</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={lemburFormData.jenisKegiatan}
                  onChange={(e) => handleFormChange('jenisKegiatan', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                >
                  <option value="mengajar">Mengajar Tambahan</option>
                  <option value="rapat">Rapat Koordinasi</option>
                  <option value="ekstra">Kegiatan Ekstra</option>
                  <option value="admin">Tugas Administrasi</option>
                  <option value="event">Event Sekolah</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi Kegiatan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={lemburFormData.deskripsi}
                  onChange={(e) => handleFormChange('deskripsi', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all resize-none"
                  placeholder="Jelaskan detail kegiatan lembur..."
                />
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span>Lokasi</span>
                </label>
                <input
                  type="text"
                  value={lemburFormData.lokasi}
                  onChange={(e) => handleFormChange('lokasi', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                  placeholder="Ruang kelas, laboratorium, dll"
                />
              </div>

              {/* Supervisor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span>Supervisor/Penanggung Jawab</span>
                </label>
                <input
                  type="text"
                  value={lemburFormData.supervisor}
                  onChange={(e) => handleFormChange('supervisor', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                  placeholder="Nama supervisor atau koordinator"
                />
              </div>


              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={handleCancelForm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Batal</span>
                </button>
                <button 
                  onClick={handleSubmitLembur}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Simpan Lembur</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lembur;
