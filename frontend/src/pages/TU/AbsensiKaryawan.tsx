import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  QrCodeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Table from '../../components/common/UI/Table';
import Modal from '../../components/common/UI/Modal';
import Button from '../../components/common/UI/Button';
import TULayout from '../../components/TU/TULayout';
import { useAttendance } from '../../hooks/useTU';
import toast from 'react-hot-toast';

interface AttendanceLog {
  id: string;
  userId: string;
  employeeName: string;
  checkIn: string;
  checkOut?: string;
  location: string;
  status: 'present' | 'late' | 'absent' | 'sick' | 'leave';
  notes?: string;
  date: string;
}

interface ManualAttendanceForm {
  employeeName: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'leave' | 'sick' | 'absent';
  location: string;
}

const AbsensiKaryawan: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManualAttendanceModalOpen, setIsManualAttendanceModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceLog | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [manualAttendanceForm, setManualAttendanceForm] = useState<ManualAttendanceForm>({
    employeeName: '',
    checkIn: '',
    checkOut: '',
    status: 'present',
    location: 'Kantor TU'
  });

  // API hooks
  const {
    attendanceLogs,
    myAttendance,
    isLoading,
    checkIn,
    checkOut,
    fetchMyAttendance
  } = useAttendance();

  // Load data
  useEffect(() => {
    fetchMyAttendance(viewMode);
  }, [fetchMyAttendance, viewMode, selectedDate]);

  // Convert API data to frontend format
  const convertApiAttendanceData = (apiLogs: any[]): AttendanceLog[] => {
    return apiLogs.map(log => ({
      id: log.id.toString(),
      userId: log.user_id.toString(),
      employeeName: log.user?.name || 'Unknown',
      checkIn: log.check_in ? new Date(log.check_in).toLocaleTimeString('id-ID') : '',
      checkOut: log.check_out ? new Date(log.check_out).toLocaleTimeString('id-ID') : '',
      location: log.location || 'Kantor TU',
      status: log.status,
      notes: log.notes || '',
      date: new Date(log.created_at).toISOString().split('T')[0]
    }));
  };

  // Use API data instead of mock data
  const attendanceData: AttendanceLog[] = convertApiAttendanceData(attendanceLogs);

  const todayStats = {
    present: attendanceData.filter(log => log.status === 'present').length,
    late: attendanceData.filter(log => log.status === 'late').length,
    absent: attendanceData.filter(log => log.status === 'absent').length,
    sick: attendanceData.filter(log => log.status === 'sick').length,
    leave: attendanceData.filter(log => log.status === 'leave').length,
    total: attendanceData.length
  };

  const stats = [
    {
      title: 'Hadir',
      value: todayStats.present,
      total: todayStats.total,
      icon: UsersIcon,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Terlambat',
      value: todayStats.late,
      total: todayStats.total,
      icon: ClockIcon,
      color: 'amber',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Sakit',
      value: todayStats.sick,
      total: todayStats.total,
      icon: UsersIcon,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Izin',
      value: todayStats.leave,
      total: todayStats.total,
      icon: CalendarDaysIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    }
  ];

  const columns = [
    {
      header: 'Karyawan',
      key: 'employeeName',
      render: (value: string, row: AttendanceLog) => (
        <div>
          <p className="font-semibold text-slate-800">{value}</p>
          <p className="text-xs text-slate-500 font-mono">{row.userId}</p>
        </div>
      )
    },
    {
      header: 'Check In',
      key: 'checkIn',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-slate-400" />
          <span className="font-mono text-sm">{value || '-'}</span>
        </div>
      )
    },
    {
      header: 'Check Out',
      key: 'checkOut',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-slate-400" />
          <span className="font-mono text-sm">{value || '-'}</span>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (value: string) => {
        const statusConfig = {
          present: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Hadir' },
          late: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Terlambat' },
          absent: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Tidak Hadir' },
          sick: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Sakit' },
          leave: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Izin' }
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      header: 'Lokasi',
      key: 'location',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">{value === '-' ? '-' : 'Kantor TU'}</span>
        </div>
      )
    },
    {
      header: 'Aksi',
      key: 'id',
      render: (_: string, row: AttendanceLog) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleView(row)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => console.log('Edit attendance:', row)}
            className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Handlers dipindahkan ke bawah dengan implementasi API

  const handleManualAttendanceSubmit = () => {
    // Validasi form
    if (!manualAttendanceForm.employeeName || !manualAttendanceForm.checkIn) {
      alert('Nama karyawan dan check in wajib diisi');
      return;
    }

    // Simulasi simpan data
    console.log('Manual attendance submitted:', manualAttendanceForm);
    
    // Reset form dan tutup modal
    setManualAttendanceForm({
      employeeName: '',
      checkIn: '',
      checkOut: '',
      status: 'present',
      location: 'Kantor TU'
    });
    setIsManualAttendanceModalOpen(false);
  };

  const handleFormChange = (field: keyof ManualAttendanceForm, value: string) => {
    setManualAttendanceForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // API Handlers untuk check-in/out
  const handleCheckIn = async () => {
    try {
      await checkIn('Kantor TU', 'Check-in reguler');
      toast.success('Check-in berhasil!');
      fetchMyAttendance(viewMode); // Refresh data
    } catch (error) {
      console.error('Error check-in:', error);
      toast.error('Gagal check-in. Silakan coba lagi.');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut('Check-out reguler');
      toast.success('Check-out berhasil!');
      fetchMyAttendance(viewMode); // Refresh data
    } catch (error) {
      console.error('Error check-out:', error);
      toast.error('Gagal check-out. Silakan coba lagi.');
    }
  };

  const handleView = (log: AttendanceLog) => {
    setSelectedAttendance(log);
    setIsModalOpen(true);
  };

  return (
    <TULayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Absensi Karyawan</h1>
          <p className="text-slate-600 mt-1">Manajemen kehadiran dan rekap absensi karyawan TU</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button 
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => setIsManualAttendanceModalOpen(true)}
          >
            <PlusIcon className="w-4 h-4" />
            Absen Manual
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        {[
          { key: 'daily', label: 'Harian' },
          { key: 'weekly', label: 'Mingguan' },
          { key: 'monthly', label: 'Bulanan' }
        ].map((mode) => (
          <button
            key={mode.key}
            onClick={() => setViewMode(mode.key as any)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              viewMode === mode.key
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const percentage = ((stat.value / stat.total) * 100).toFixed(0);
          
          return (
            <div key={index} className={`p-6 rounded-2xl border-2 ${stat.bgColor} ${stat.borderColor}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <span className={`text-xs font-semibold ${stat.textColor}`}>{percentage}%</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wide">{stat.title}</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}/{stat.total}</p>
            </div>
          );
        })}
      </div>

      {/* QR Code Absen Online */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Absen Online</h2>
          <div className="flex items-center gap-2">
            <QrCodeIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-blue-600">QR Code / GPS</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col items-center p-8 bg-slate-50 rounded-xl">
            <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center border-2 border-slate-200 mb-4">
              <QrCodeIcon className="w-24 h-24 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Scan QR Code untuk Absen</h3>
            <p className="text-sm text-slate-600 text-center">Karyawan dapat scan QR Code ini untuk melakukan absensi masuk/keluar</p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-slate-800 mb-2">Fitur Absen Online:</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  QR Code scanning untuk validasi lokasi
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  GPS tracking untuk memastikan lokasi
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Real-time notification ke admin
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Auto-generate laporan kehadiran
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h4 className="font-semibold text-slate-800 mb-2">Aturan Absensi:</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• Jam masuk: 07:30 - 08:00 WIB</li>
                <li>• Jam keluar: 15:30 - 16:00 WIB</li>
                <li>• Toleransi keterlambatan: 15 menit</li>
                <li>• Radius GPS: 50 meter dari sekolah</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800">Log Aktivitas Absensi</h2>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
              <CalendarDaysIcon className="w-4 h-4" />
              Rekap Mingguan
            </Button>
            <Button variant="outline" className="border-green-300 text-green-600 hover:bg-green-50">
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Memuat data absensi...</p>
          </div>
        ) : attendanceData.length > 0 ? (
          <Table columns={columns} data={attendanceData} />
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum Ada Data Absensi</h3>
            <p className="text-slate-600 mb-4">Belum ada data absensi untuk tanggal yang dipilih.</p>
          </div>
        )}
      </div>

      {/* Manual Attendance Modal */}
      <Modal
        isOpen={isManualAttendanceModalOpen}
        onClose={() => setIsManualAttendanceModalOpen(false)}
        title="Absen Manual Karyawan"
        size="lg"
      >
        <div className="modal-form-container">
          <div className="modal-form-content space-y-6">
            {/* Header Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-800 mb-1 sm:mb-2 text-sm sm:text-base">Pencatatan Absensi Manual</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Gunakan fitur ini untuk mencatat absensi karyawan secara manual jika terjadi kendala teknis atau kasus khusus.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 sm:space-y-6">
              {/* Nama Karyawan */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <UsersIcon className="w-4 h-4 text-slate-500" />
                  Nama Karyawan
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualAttendanceForm.employeeName}
                  onChange={(e) => handleFormChange('employeeName', e.target.value)}
                  placeholder="Masukkan nama lengkap karyawan"
                  className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700 placeholder-slate-400 shadow-sm text-sm sm:text-base"
                />
              </div>

              {/* Check In & Check Out */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <ClockIcon className="w-4 h-4 text-slate-500" />
                    Waktu Masuk
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={manualAttendanceForm.checkIn}
                    onChange={(e) => handleFormChange('checkIn', e.target.value)}
                    className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700 shadow-sm text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <ClockIcon className="w-4 h-4 text-slate-500" />
                    Waktu Keluar
                  </label>
                  <input
                    type="time"
                    value={manualAttendanceForm.checkOut}
                    onChange={(e) => handleFormChange('checkOut', e.target.value)}
                    className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700 shadow-sm text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Status Kehadiran */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CalendarDaysIcon className="w-4 h-4 text-slate-500" />
                  Status Kehadiran
                </label>
                <div className="relative">
                  <select
                    value={manualAttendanceForm.status}
                    onChange={(e) => handleFormChange('status', e.target.value as ManualAttendanceForm['status'])}
                    className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700 shadow-sm appearance-none cursor-pointer text-sm sm:text-base"
                  >
                    <option value="present">🟢 Hadir</option>
                    <option value="leave">🔵 Izin</option>
                    <option value="sick">🟠 Cuti</option>
                    <option value="absent">🔴 Alpha</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Lokasi */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <MapPinIcon className="w-4 h-4 text-slate-500" />
                  Lokasi Absensi
                </label>
                <input
                  type="text"
                  value={manualAttendanceForm.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  placeholder="Contoh: Kantor TU, Ruang Kelas A1, dll"
                  className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700 placeholder-slate-400 shadow-sm text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Fixed at bottom */}
          <div className="modal-buttons-fixed">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsManualAttendanceModalOpen(false)}
              className="w-full sm:w-auto px-4 py-3 sm:px-6 text-slate-600 border-slate-300 hover:bg-slate-50 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
            >
              Batal
            </Button>
            <Button 
              className="w-full sm:w-auto px-4 py-3 sm:px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base" 
              onClick={handleManualAttendanceSubmit}
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Simpan Absensi
            </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detail Absensi"
        size="lg"
      >
        {selectedAttendance && (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-800 mb-3">Informasi Karyawan</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nama</label>
                  <p className="text-slate-900 font-semibold">{selectedAttendance.employeeName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">ID Karyawan</label>
                  <p className="text-slate-900 font-mono">{selectedAttendance.userId}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Check In</label>
                <p className="text-slate-900 font-mono">{selectedAttendance.checkIn || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Check Out</label>
                <p className="text-slate-900 font-mono">{selectedAttendance.checkOut || '-'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Lokasi</label>
              <p className="text-slate-900">{selectedAttendance.location}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Status</label>
              <p className="text-slate-900 capitalize">{selectedAttendance.status}</p>
            </div>

            {selectedAttendance.notes && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Catatan</label>
                <p className="text-slate-900">{selectedAttendance.notes}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <PencilIcon className="w-4 h-4" />
                Edit Absensi
              </Button>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </TULayout>
  );
};

export default AbsensiKaryawan;
