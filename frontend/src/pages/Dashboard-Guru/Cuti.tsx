import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Filter,
  Search,
  Download,
  AlertCircle,
  CalendarDays,
  X,
  Save,
  UserCheck,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';
import { cutiService, type Cuti, type CutiStatistics } from '../../services/cutiService';
import { guruAuthService } from '../../services/guruAuthService';

const CutiComponent: React.FC = () => {
  const navigate = useNavigate();
  const [showCutiForm, setShowCutiForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCutiId, setEditingCutiId] = useState<number | null>(null);
  const [cutiData, setCutiData] = useState<Cuti[]>([]);
  const [cutiStats, setCutiStats] = useState<CutiStatistics>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    total_hari: 0
  });
  const [guruData, setGuruData] = useState<any>(null);
  const [cutiFormData, setCutiFormData] = useState({
    jenis: 'Cuti Tahunan',
    tanggal_mulai: '',
    tanggal_selesai: '',
    alasan: '',
    pengganti: ''
  });

  // Fetch data guru dan cuti saat komponen dimount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get guru data
      const guru = guruAuthService.getGuruData();
      if (!guru) {
        console.warn('No guru data found, redirecting to login');
        navigate('/guru/login');
        return;
      }
      setGuruData(guru);

      console.log('🔄 Loading cuti data for guru:', guru.nama_lengkap);

      // Load cuti data and statistics
      const [cutiResponse, stats] = await Promise.all([
        cutiService.getMyCuti({
          status: selectedFilter !== 'semua' ? selectedFilter : undefined,
          sort_by: 'created_at',
          sort_order: 'desc',
          per_page: 100
        }),
        cutiService.getStatistics()
      ]);

      console.log('📡 Cuti response:', cutiResponse);
      console.log('📊 Stats:', stats);

      // Validate response structure
      if (!cutiResponse || !cutiResponse.data) {
        console.warn('⚠️ Invalid response structure');
        setCutiData([]);
        setCutiStats({
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          total_hari: 0
        });
        return;
      }

      // Handle both paginated and non-paginated responses
      const cutiArray = Array.isArray(cutiResponse.data) 
        ? cutiResponse.data 
        : (cutiResponse.data.data || []);

      console.log('📦 Cuti Array:', cutiArray, 'Length:', cutiArray.length);

      setCutiData(cutiArray);
      setCutiStats(stats || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        total_hari: 0
      });
    } catch (error: any) {
      console.error('❌ Error loading cuti data:', error);
      console.error('Error details:', error.message, error.stack);
      // Set empty data instead of showing alert
      setCutiData([]);
      setCutiStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        total_hari: 0
      });
    } finally {
      setIsLoading(false);
    }
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

  const handleFormChange = (field: string, value: string) => {
    setCutiFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitCuti = async () => {
    // Validation
    if (!cutiFormData.tanggal_mulai || !cutiFormData.tanggal_selesai || !cutiFormData.alasan) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (editingCutiId) {
        // Update existing cuti
        await cutiService.updateCuti(editingCutiId, cutiFormData);
        alert('Data cuti berhasil diperbarui!');
      } else {
        // Create new cuti
        await cutiService.createCuti(cutiFormData);
        alert('Pengajuan cuti berhasil dikirim!');
      }
      
      // Reset form and reload data
      handleCancelForm();
      await loadData();
    } catch (error: any) {
      console.error('Error submitting cuti:', error);
      alert(error.message || 'Gagal mengajukan cuti. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCuti = (cuti: Cuti) => {
    setEditingCutiId(cuti.id);
    setCutiFormData({
      jenis: cuti.jenis,
      tanggal_mulai: cuti.tanggal_mulai,
      tanggal_selesai: cuti.tanggal_selesai,
      alasan: cuti.alasan,
      pengganti: cuti.pengganti || ''
    });
    setShowCutiForm(true);
  };

  const handleDeleteCuti = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengajuan cuti ini?')) {
      return;
    }

    try {
      await cutiService.deleteCuti(id);
      alert('Data cuti berhasil dihapus!');
      await loadData();
    } catch (error: any) {
      console.error('Error deleting cuti:', error);
      alert(error.message || 'Gagal menghapus cuti. Pastikan status masih pending.');
    }
  };

  const handleCancelForm = () => {
    setShowCutiForm(false);
    setEditingCutiId(null);
    setCutiFormData({
      jenis: 'Cuti Tahunan',
      tanggal_mulai: '',
      tanggal_selesai: '',
      alasan: '',
      pengganti: ''
    });
  };

  const filteredData = cutiData.filter(item => {
    if (!searchQuery) return true;
    return (
      item.jenis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alasan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.pengganti && item.pengganti.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const currentDate = new Date().toLocaleDateString('id-ID');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Cuti Guru</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-item { text-align: center; padding: 10px; background: #F1F5F9; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #CBD5E1; padding: 12px; text-align: left; }
            th { background: #4F46E5; color: white; font-weight: bold; }
            tr:nth-child(even) { background: #F8FAFC; }
            .status-approved { color: #059669; font-weight: bold; }
            .status-pending { color: #D97706; font-weight: bold; }
            .status-rejected { color: #DC2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LAPORAN CUTI GURU</h1>
            <h2>SIT ANNUR CIKARANG BARU</h2>
            <p>Tahun Ajaran 2024/2025</p>
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <h4>Total Cuti</h4>
              <p style="font-size: 24px; color: #4F46E5; margin: 5px 0;">${cutiStats.total}</p>
            </div>
            <div class="stat-item">
              <h4>Disetujui</h4>
              <p style="font-size: 24px; color: #059669; margin: 5px 0;">${cutiStats.approved}</p>
            </div>
            <div class="stat-item">
              <h4>Total Hari</h4>
              <p style="font-size: 24px; color: #D97706; margin: 5px 0;">${cutiStats.total_hari}</p>
            </div>
            <div class="stat-item">
              <h4>Pending</h4>
              <p style="font-size: 24px; color: #DC2626; margin: 5px 0;">${cutiStats.pending}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Jenis Cuti</th>
                <th>Tanggal Mulai</th>
                <th>Tanggal Selesai</th>
                <th>Durasi</th>
                <th>Status</th>
                <th>Alasan</th>
                <th>Guru Pengganti</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.jenis}</td>
                  <td>${new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</td>
                  <td>${new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}</td>
                  <td>${item.durasi} hari</td>
                  <td class="status-${item.status}">${getStatusText(item.status).toUpperCase()}</td>
                  <td>${item.alasan}</td>
                  <td>${item.pengganti || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 40px; text-align: right;">
            <p>Dicetak pada: ${currentDate}</p>
            <div style="margin-top: 60px;">
              <p>Cikarang, ${currentDate}</p>
              <p>Kepala Sekolah</p>
              <br><br><br>
              <p>_________________________</p>
              <p>Dr. Ahmad Wijaya, M.Pd</p>
              <p>NIP: 196512121990031003</p>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Show loading screen on initial load
  if (isLoading && !guruData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data cuti...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-white text-xl font-semibold">Manajemen Cuti</h1>
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
              onClick={() => setShowCutiForm(true)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              title="Ajukan Cuti"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Teacher Info */}
        {guruData && (
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">
                  {guruData.nama_lengkap?.substring(0, 2).toUpperCase() || 'GR'}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{guruData.nama_lengkap}</h3>
                <p className="text-green-100 text-sm">
                  {guruData.jabatan?.nama || 'Guru'} - SIT ANNUR
                </p>
                <p className="text-green-200 text-xs">NIP: {guruData.nip}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 -mt-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{cutiStats.total}</p>
            <p className="text-xs text-gray-600">Total Cuti</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{cutiStats.approved}</p>
            <p className="text-xs text-gray-600">Disetujui</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{cutiStats.total_hari}</p>
            <p className="text-xs text-gray-600">Total Hari</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{cutiStats.pending}</p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>
        </div>

        {/* Quick Action */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
          <button 
            onClick={() => setShowCutiForm(true)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-6 h-6" />
            <span className="font-semibold">Ajukan Cuti Baru</span>
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
                placeholder="Cari jenis cuti, alasan, atau pengganti..."
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

        {/* Riwayat Cuti */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Riwayat Cuti</h3>
            <span className="text-sm text-gray-600">{filteredData.length} record</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada data cuti</p>
              <button
                onClick={() => setShowCutiForm(true)}
                className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Ajukan Cuti Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredData.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs text-gray-600">Mulai</p>
                    <p className="text-sm font-bold text-gray-800">{new Date(item.tanggal_mulai).getDate()}</p>
                    <p className="text-xs text-gray-600">{new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { month: 'short' })}</p>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="text-xs font-medium">{getStatusText(item.status)}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{item.jenis}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{item.alasan}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Durasi: {item.durasi} hari</span>
                      {item.pengganti && <span>Pengganti: {item.pengganti}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}
                    </p>
                    
                    {/* Action buttons for pending status */}
                    {item.status === 'pending' && (
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => handleEditCuti(item)}
                          className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCuti(item.id)}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Pengajuan Cuti Modal */}
      {showCutiForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    {editingCutiId ? <FileText className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">
                      {editingCutiId ? 'Edit Cuti' : 'Ajukan Cuti'}
                    </h3>
                    <p className="text-green-100 text-sm">
                      {editingCutiId ? 'Ubah data pengajuan cuti' : 'Form pengajuan cuti baru'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleCancelForm}
                  disabled={isSubmitting}
                  className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Jenis Cuti */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jenis Cuti <span className="text-red-500">*</span>
                </label>
                <select
                  value={cutiFormData.jenis}
                  onChange={(e) => handleFormChange('jenis', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all disabled:opacity-50"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan</option>
                  <option value="Cuti Sakit">Cuti Sakit</option>
                  <option value="Cuti Melahirkan">Cuti Melahirkan</option>
                  <option value="Cuti Besar">Cuti Besar</option>
                  <option value="Cuti Alasan Penting">Cuti Alasan Penting</option>
                  <option value="Izin Tidak Masuk">Izin Tidak Masuk</option>
                </select>
              </div>

              {/* Tanggal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <CalendarDays className="w-4 h-4 text-gray-600" />
                    <span>Tanggal Mulai</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={cutiFormData.tanggal_mulai}
                    onChange={(e) => handleFormChange('tanggal_mulai', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <CalendarDays className="w-4 h-4 text-gray-600" />
                    <span>Tanggal Selesai</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={cutiFormData.tanggal_selesai}
                    onChange={(e) => handleFormChange('tanggal_selesai', e.target.value)}
                    disabled={isSubmitting}
                    min={cutiFormData.tanggal_mulai}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Alasan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span>Alasan Cuti</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cutiFormData.alasan}
                  onChange={(e) => handleFormChange('alasan', e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all resize-none disabled:opacity-50"
                  placeholder="Jelaskan alasan pengajuan cuti..."
                />
              </div>

              {/* Guru Pengganti */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-gray-600" />
                  <span>Guru Pengganti (Opsional)</span>
                </label>
                <input
                  type="text"
                  value={cutiFormData.pengganti}
                  onChange={(e) => handleFormChange('pengganti', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all disabled:opacity-50"
                  placeholder="Nama guru pengganti (jika ada)"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={handleCancelForm}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  <span>Batal</span>
                </button>
                <button 
                  onClick={handleSubmitCuti}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{editingCutiId ? 'Update Cuti' : 'Ajukan Cuti'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CutiComponent;
