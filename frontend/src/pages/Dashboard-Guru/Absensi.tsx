import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuruAuth } from '../../hooks/useGuruAuth';
import { guruAuthService } from '../../services/guruAuthService';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  MapPin,
  QrCode,
  Users,
  ClockIcon,
  Printer,
  Download,
  Plus,
  CalendarDays,
  MessageSquare,
  X,
  Camera,
  MapPinIcon,
  Navigation,
  Image,
  RefreshCw
} from 'lucide-react';

// Helper function to convert minutes to hours:minutes format
const formatTeachingHours = (minutes: number | string | null | undefined): string => {
  // Handle edge cases
  if (minutes === null || minutes === undefined || minutes === '' || isNaN(Number(minutes))) {
    return '0 jam';
  }
  
  const numMinutes = Number(minutes);
  
  if (numMinutes === 0) return '0 jam';
  if (numMinutes < 0) return '0 jam'; // Handle negative values
  
  const hours = Math.floor(numMinutes / 60);
  const remainingMinutes = numMinutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} menit`;
  } else if (remainingMinutes === 0) {
    return `${hours} jam`;
  } else {
    return `${hours} jam ${remainingMinutes} menit`;
  }
};

// Helper function untuk menghitung selisih waktu dari timeIn dan timeOut
const calculateTeachingDuration = (timeIn: string, timeOut: string): string => {
  // Jika salah satu waktu tidak ada atau bernilai '-', return '0 jam'
  if (!timeIn || !timeOut || timeIn === '-' || timeOut === '-') {
    return '0 jam';
  }
  
  try {
    // Parse jam masuk
    const [inHour, inMinute] = timeIn.split(':').map(Number);
    // Parse jam keluar
    const [outHour, outMinute] = timeOut.split(':').map(Number);
    
    // Hitung total menit
    const inTotalMinutes = inHour * 60 + inMinute;
    const outTotalMinutes = outHour * 60 + outMinute;
    
    // Hitung selisih dalam menit
    const diffMinutes = Math.max(0, outTotalMinutes - inTotalMinutes);
    
    // Format menggunakan formatTeachingHours
    return formatTeachingHours(diffMinutes);
  } catch (error) {
    console.error('Error calculating teaching duration:', error);
    return '0 jam';
  }
};

const Absensi: React.FC = () => {
  const navigate = useNavigate();
  const { guru, isAuthenticated, isLoading: authLoading } = useGuruAuth();
  // Set default month to current month
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedFilter, setSelectedFilter] = useState('semua');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jamMasuk: '',
    jamKeluar: '',
    status: 'hadir',
    keterangan: '',
    jamMengajar: 0,
    lokasi: '',
    foto: null as string | null
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isLocationValid, setIsLocationValid] = useState(true); // Track if location is within school radius
  const [absensiData, setAbsensiData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [absensiHariIni, setAbsensiHariIni] = useState<any>(null); // Track today's attendance
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set()); // Track expanded items
  const [showPhotoModal, setShowPhotoModal] = useState(false); // Photo modal state
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null); // Selected photo for modal
  const [statistics, setStatistics] = useState({
    hadir: 0,
    sakit: 0,
    izin: 0,
    total_jam_mengajar: 0
  });

  // Auto-detect location and check today's attendance when manual form opens
  useEffect(() => {
    if (showManualForm) {
      if (!manualFormData.lokasi) {
        handleDetectLocation();
      }
      checkAbsensiHariIni();
    }
  }, [showManualForm]);

  // Load absensi data from backend
  useEffect(() => {
    if (guru?.id) {
      loadAbsensiData();
      loadStatistics();
    }
  }, [selectedMonth, selectedFilter, dateFrom, dateTo, guru?.id]);

  // Calculate statistics when absensiData changes
  useEffect(() => {
    if (absensiData.length > 0) {
      calculateStatisticsFromData();
    }
  }, [absensiData]);

  // Function to load absensi data from API
  const loadAbsensiData = async () => {
    if (!guru?.id) {
      console.log('Guru not authenticated, skipping data load');
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        id_guru: guru.id.toString(),
        per_page: '100'
      });

      // Prioritas filter tanggal custom
      if (dateFrom && dateTo) {
        // Jika ada filter tanggal custom, gunakan itu
        params.append('tanggal_mulai', dateFrom);
        params.append('tanggal_akhir', dateTo);
      } else if (dateFrom) {
        // Jika hanya ada tanggal dari, gunakan sampai akhir bulan
        const endOfMonth = new Date(dateFrom);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0); // Hari terakhir bulan
        params.append('tanggal_mulai', dateFrom);
        params.append('tanggal_akhir', endOfMonth.toISOString().split('T')[0]);
      } else if (dateTo) {
        // Jika hanya ada tanggal sampai, gunakan dari awal bulan
        const startOfMonth = new Date(dateTo);
        startOfMonth.setDate(1);
        params.append('tanggal_mulai', startOfMonth.toISOString().split('T')[0]);
        params.append('tanggal_akhir', dateTo);
      } else {
        // Jika tidak ada filter tanggal custom, gunakan filter bulan
        const [year, month] = selectedMonth.split('-');
        params.append('bulan', month);
        params.append('tahun', year);
      }

      if (selectedFilter !== 'semua') {
        params.append('status', selectedFilter);
      }

      const token = guruAuthService.getToken();
      const response = await fetch(`/api/master-data/absensi?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const result = await response.json();

      if (result.success) {
        // Transform data dari backend ke format yang digunakan di frontend
        const transformedData = result.data.data.map((item: any) => ({
          id: item.id,
          date: item.tanggal,
          status: item.status,
          timeIn: item.jam_masuk || '-',
          timeOut: item.jam_keluar || '-',
          keterangan: item.keterangan || '',
          mengajar: item.jam_mengajar || 0, // Keep as number for formatTeachingHours function
          lokasi: item.lokasi || '',
          nama_lokasi: item.nama_lokasi || '',
          foto: item.foto || null
        }));
        
        setAbsensiData(transformedData);
        console.log('Absensi data loaded:', transformedData);
      } else {
        console.error('Error loading absensi data:', result);
        setAbsensiData([]);
      }
    } catch (error) {
      console.error('Network error loading absensi data:', error);
      setAbsensiData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load statistics from API
  const loadStatistics = async () => {
    if (!guru?.id) {
      console.log('Guru not authenticated, skipping statistics load');
      return;
    }

    try {
      //const [year, month] = selectedMonth.split('-');
      const params = new URLSearchParams({
        id_guru: guru.id.toString()
        // bulan: month,
        // tahun: year
      });

      const token = guruAuthService.getToken();
      const response = await fetch(`/api/master-data/absensi/statistics/detailed?${params}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const result = await response.json();

      if (result.success) {
        // Konversi total_jam_mengajar dari JAM (decimal) ke MENIT untuk formatTeachingHours
        const statisticsInMinutes = {
          ...result.data,
          total_jam_mengajar: result.data.total_jam_mengajar ? Math.round(result.data.total_jam_mengajar * 60) : 0
        };
        setStatistics(statisticsInMinutes);
        console.log('Statistics loaded (converted to minutes):', statisticsInMinutes);
      } else {
        console.error('Error loading statistics:', result);
        // Fallback to calculated statistics from current data
        calculateStatisticsFromData();
      }
    } catch (error) {
      console.error('Network error loading statistics:', error);
      // Fallback to calculated statistics from current data
      calculateStatisticsFromData();
    }
  };

  // Function to calculate statistics from current data
  const calculateStatisticsFromData = () => {
    // Hitung total jam mengajar dalam MENIT dari selisih timeIn dan timeOut
    const totalMinutes = absensiData.reduce((total, item) => {
      if (item.timeIn && item.timeOut && item.timeIn !== '-' && item.timeOut !== '-') {
        try {
          const [inHour, inMinute] = item.timeIn.split(':').map(Number);
          const [outHour, outMinute] = item.timeOut.split(':').map(Number);
          const inTotalMinutes = inHour * 60 + inMinute;
          const outTotalMinutes = outHour * 60 + outMinute;
          const diffMinutes = Math.max(0, outTotalMinutes - inTotalMinutes);
          return total + diffMinutes;
        } catch (error) {
          console.error('Error calculating duration for item:', item, error);
          return total;
        }
      }
      return total;
    }, 0);

    const calculatedStats = {
      hadir: absensiData.filter(item => item.status === 'hadir').length,
      sakit: absensiData.filter(item => item.status === 'sakit').length,
      izin: absensiData.filter(item => item.status === 'izin').length,
      total_jam_mengajar: totalMinutes // Dalam MENIT untuk formatTeachingHours
    };
    setStatistics(calculatedStats);
    console.log('Statistics calculated from data:', calculatedStats);
  };

  // Function to check today's attendance
  const checkAbsensiHariIni = async () => {
    if (!guru?.id) {
      console.log('Guru not authenticated, skipping today attendance check');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const params = new URLSearchParams({
        id_guru: guru.id.toString(),
        tanggal: today
      });

      const token = guruAuthService.getToken();
      const response = await fetch(`/api/master-data/absensi?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const result = await response.json();

      if (result.success && result.data.data.length > 0) {
        const todayAbsensi = result.data.data[0];
        setAbsensiHariIni(todayAbsensi);
        console.log('Absensi hari ini ditemukan:', todayAbsensi);
      } else {
        setAbsensiHariIni(null);
        console.log('Belum ada absensi hari ini');
      }
    } catch (error) {
      console.error('Error checking today attendance:', error);
      setAbsensiHariIni(null);
    }
  };

  // Function to refresh all data
  const refreshAllData = async () => {
    if (guru?.id) {
      await Promise.all([
        loadAbsensiData(),
        loadStatistics()
      ]);
    }
  };

  // Use statistics from state (loaded from backend)
  const statistik = statistics;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir': return 'text-green-600 bg-green-100';
      case 'sakit': return 'text-yellow-600 bg-yellow-100';
      case 'izin': return 'text-blue-600 bg-blue-100';
      case 'alpha': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hadir': return <CheckCircle className="w-4 h-4" />;
      case 'sakit': return <AlertCircle className="w-4 h-4" />;
      case 'izin': return <Clock className="w-4 h-4" />;
      case 'alpha': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()]
    };
  };

  const filteredData = absensiData
    .filter(item => selectedFilter === 'semua' || item.status === selectedFilter)
    .filter(item => {
      if (!searchQuery) return true;
      const dateInfo = formatDate(item.date);
      return (
        item.date.includes(searchQuery) ||
        dateInfo.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dateInfo.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const handleQRScan = () => {
    navigate('/guru/qr-scan');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const currentDate = new Date().toLocaleDateString('id-ID');
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const [year, month] = selectedMonth.split('-');
      const monthName = monthNames[parseInt(month) - 1];
      
      // Data guru dari backend
      const namaGuru = guru?.nama_lengkap || '-';
      const nipGuru = guru?.nip || '-';
      const jabatanGuru = guru?.jabatan?.nama || '-';
      const unitSekolah = guru?.unit_sekolah?.nama || 'SIT ANNUR CIKARANG BARU';
      const mataPelajaran = guru?.mapel_diampu || jabatanGuru || '-';
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Absensi - ${monthName} ${year}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
            .school-info { margin-bottom: 20px; }
            .teacher-info { background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-item { text-align: center; padding: 10px; background: #F1F5F9; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #CBD5E1; padding: 12px; text-align: left; }
            th { background: #4F46E5; color: white; font-weight: bold; }
            tr:nth-child(even) { background: #F8FAFC; }
            .status-hadir { color: #059669; font-weight: bold; }
            .status-sakit { color: #D97706; font-weight: bold; }
            .status-izin { color: #2563EB; font-weight: bold; }
            .status-alpha { color: #DC2626; font-weight: bold; }
            .footer { margin-top: 40px; text-align: right; }
            .signature { margin-top: 60px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LAPORAN ABSENSI GURU</h1>
            <h2>${unitSekolah.toUpperCase()}</h2>
            <p>Periode: ${monthName} ${year}</p>
          </div>
          
          <div class="school-info">
            <strong>Alamat:</strong> Jl. Kelinci Raya No.1 Blok R7, Jayamukti, Kec. Cikarang Pusat, Kabupaten Bekasi, Jawa Barat 17530<br>
            <strong>Telepon:</strong> (021) 1234-5678<br>
            <strong>Email:</strong> info@sit-annur.sch.id
          </div>
          
          <div class="teacher-info">
            <h3>Informasi Guru</h3>
            <p><strong>Nama:</strong> ${namaGuru}</p>
            <p><strong>NIP:</strong> ${nipGuru}</p>
            <p><strong>Jabatan/Mata Pelajaran:</strong> ${mataPelajaran}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Hari</th>
                <th>Status</th>
                <th>Jam Masuk</th>
                <th>Jam Keluar</th>
                <th>Jam Mengajar</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((item, index) => {
                const dateInfo = formatDate(item.date);
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${new Date(item.date).toLocaleDateString('id-ID')}</td>
                    <td>${dateInfo.day}</td>
                    <td class="status-${item.status}">${item.status.toUpperCase()}</td>
                    <td>${item.timeIn}</td>
                    <td>${item.timeOut}</td>
                    <td>${calculateTeachingDuration(item.timeIn, item.timeOut)}</td>
                    <td>${item.keterangan}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Dicetak pada: ${currentDate}</p>
            
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExportPDF = () => {
    // Simulate PDF export
    alert('Fitur export PDF sedang dalam pengembangan. Silakan gunakan print dan save as PDF.');
  };

  const handleManualFormChange = (field: string, value: string | number | null) => {
    setManualFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Jika jamMasuk berubah, sync jamKeluar juga agar sama
      if (field === 'jamMasuk' && prev.status === 'hadir') {
        updated.jamKeluar = value as string;
      }
      
      return updated;
    });
  };

  const handleSubmitManualAttendance = async () => {
    // Validate form
    if (!manualFormData.tanggal) {
      alert('Tanggal harus diisi!');
      return;
    }

    // Jika belum ada absensi hari ini, hanya perlu jam masuk
    if (manualFormData.status === 'hadir' && !absensiHariIni && !manualFormData.jamMasuk) {
      alert('Jam masuk harus diisi!');
      return;
    }

    // Validasi jamKeluar: untuk absensi manual harus sama dengan jamMasuk
    // Jika sudah ada absensi hari ini, jamMasuk dari database, jika belum ada dari form
    const jamMasukForValidation = absensiHariIni ? absensiHariIni.jam_masuk : manualFormData.jamMasuk;
    if (manualFormData.status === 'hadir' && absensiHariIni && !jamMasukForValidation) {
      alert('Jam keluar harus diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      // Validasi apakah guru sudah login
      if (!guru?.id) {
        alert('Anda belum login. Silakan login terlebih dahulu.');
        return;
      }

      // Helper function untuk memastikan format waktu selalu H:i:s
      const formatTimeToHIS = (time: string | null | undefined): string | null => {
        if (!time) return null;
        const timeStr = time.toString().trim();
        if (!timeStr) return null;
        
        // Jika sudah dalam format H:i:s, return as is
        if (timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
          return timeStr;
        }
        
        // Jika dalam format H:i, tambahkan :00
        if (timeStr.match(/^\d{1,2}:\d{2}$/)) {
          return `${timeStr}:00`;
        }
        
        // Jika format tidak valid, return null
        return null;
      };

      // Untuk absensi manual, jamKeluar harus sama dengan jamMasuk
      const jamMasuk = absensiHariIni ? absensiHariIni.jam_masuk : manualFormData.jamMasuk;
      const jamKeluarFinal = manualFormData.status === 'hadir' && jamMasuk 
        ? jamMasuk 
        : manualFormData.jamKeluar;
      
      // Hitung jam mengajar dari selisih jam masuk dan keluar
      let jamMengajar = 0;
      if (manualFormData.status === 'hadir') {
        if (jamMasuk && jamKeluarFinal) {
          const [masukHour, masukMinute] = jamMasuk.split(':').map(Number);
          const [keluarHour, keluarMinute] = jamKeluarFinal.split(':').map(Number);
          const masukInMinutes = masukHour * 60 + masukMinute;
          const keluarInMinutes = keluarHour * 60 + keluarMinute;
          const diffInMinutes = keluarInMinutes - masukInMinutes;
          jamMengajar = Math.max(0, Math.min(1440, Math.floor(diffInMinutes))); // Return in minutes as integer, ensure positive and max 24 hours
        }
      }

      // Format data untuk API backend
      const attendanceData: any = {
        status: manualFormData.status,
        keterangan: (manualFormData.keterangan || (manualFormData.status === 'hadir' ? 'Manual input' : `${manualFormData.status} - Manual input`)).substring(0, 2000), // Limit to 2000 chars
        lokasi: (manualFormData.lokasi || '').substring(0, 500) // Limit to 500 chars
      };

      // Jika belum ada absensi hari ini, kirim jam masuk (POST - format H:i:s)
      if (!absensiHariIni) {
        attendanceData.id_guru = guru.id;
        attendanceData.tanggal = manualFormData.tanggal;
        attendanceData.jam_masuk = manualFormData.status === 'hadir' ? formatTimeToHIS(manualFormData.jamMasuk) : null;
        attendanceData.jam_keluar = null;
        attendanceData.jam_mengajar = 0; // Integer for new entry (no teaching hours yet)
        attendanceData.foto = manualFormData.foto || null; // Include foto for new entry
      } else {
        // Jika sudah ada, update jam keluar (PUT - format H:i:s dengan detik)
        // Jangan kirim id_guru dan tanggal untuk update, hanya field yang perlu diupdate
        // jamKeluar harus sama dengan jamMasuk untuk absensi manual
        attendanceData.jam_keluar = manualFormData.status === 'hadir' ? formatTimeToHIS(jamKeluarFinal) : null;
        attendanceData.jam_mengajar = Math.max(0, Math.min(1440, Math.floor(jamMengajar))); // Ensure integer, positive, and max 24 hours
        // Jangan kirim foto saat update (foto hanya untuk absen masuk)
      }

      console.log('Sending attendance data:', attendanceData);

      // Kirim data ke API backend
      const token = guruAuthService.getToken();
      const url = absensiHariIni ? `/api/master-data/absensi/${absensiHariIni.id}` : '/api/master-data/absensi';
      const method = absensiHariIni ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(attendanceData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('Absensi berhasil disimpan:', result.data);
        
        // Reset form dan close modal
        setManualFormData({
          tanggal: new Date().toISOString().split('T')[0],
          jamMasuk: '',
          jamKeluar: '',
          status: 'hadir',
          keterangan: '',
          jamMengajar: 0,
          lokasi: '',
          foto: null
        });
        setShowManualForm(false);
        setAbsensiHariIni(null);
        
        const message = absensiHariIni ? 'Absensi keluar berhasil dicatat!' : 'Absensi masuk berhasil dicatat!';
        alert(message);
        
        // Refresh data absensi dan statistik setelah berhasil menyimpan
        await loadAbsensiData();
        await loadStatistics();
        
      } else {
        console.error('Error saving attendance:', result);
        alert(`Gagal menyimpan absensi: ${result.message || 'Terjadi kesalahan'}`);
      }

    } catch (error) {
      console.error('Network error:', error);
      alert('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelManualForm = () => {
    setShowManualForm(false);
    setManualFormData({
      tanggal: new Date().toISOString().split('T')[0],
      jamMasuk: '',
      jamKeluar: '',
      status: 'hadir',
      keterangan: '',
      jamMengajar: 0,
      lokasi: '',
      foto: null
    });
    setIsLocationValid(true); // Reset location validation
    setAbsensiHariIni(null); // Reset today's attendance check
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (_position) => {
          //const { latitude, longitude } = _position.coords;
          
          // lat lon lokasi terdekat (for testing)
          const latitude = -6.3102478;
          const longitude = 107.1663329;
          // Reverse geocoding to get address (using a mock service)
          try {
            // In real app, you would use a proper geocoding service
            const address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
            
            // Check if location is within school radius (mock validation)
            const schoolLat = -6.3114078;//6.2088; // Example: Jakarta coordinates
            const schoolLng = 107.1663329;
            const distance = calculateDistance(latitude, longitude, schoolLat, schoolLng);
            
            let locationText = address;
            if (distance <= 0.5) { // Within 500 meters
              locationText = `${address} (Dalam area sekolah ✓)`;
              setIsLocationValid(true);
            } else {
              locationText = `${address} (Diluar area sekolah - ${distance.toFixed(1)}km)`;
              setIsLocationValid(false);
            }
            
            handleManualFormChange('lokasi', locationText);
            setIsDetectingLocation(false);
          } catch (error) {
            console.error('Error getting address:', error);
            handleManualFormChange('lokasi', `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
            setIsDetectingLocation(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsDetectingLocation(false);
          alert('Gagal mengambil lokasi. Pastikan GPS aktif dan izinkan akses lokasi.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setIsDetectingLocation(false);
      alert('Geolocation tidak didukung oleh browser ini.');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleTakePhoto = () => {
    setIsTakingPhoto(true);
    
    // Request camera access
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user', // Front camera for selfie
        width: { ideal: 320 }, // Reduced size for smaller file
        height: { ideal: 240 }
      } 
    })
    .then((stream) => {
      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Create canvas for photo capture
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas size (smaller for reduced file size)
      canvas.width = 320;
      canvas.height = 240;
      
      // Wait for video to load and capture frame
      video.addEventListener('loadedmetadata', () => {
        setTimeout(() => {
          if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Compress more aggressively (0.3 quality for smaller file size)
            const photoDataUrl = canvas.toDataURL('image/jpeg', 0.3);
            
            handleManualFormChange('foto', photoDataUrl);
            
            // Stop camera stream
            stream.getTracks().forEach(track => track.stop());
            setIsTakingPhoto(false);
          }
        }, 100);
      });
    })
    .catch((error) => {
      console.error('Error accessing camera:', error);
      setIsTakingPhoto(false);
      alert('Gagal mengakses kamera. Pastikan izinkan akses kamera.');
    });
  };

  const handleRetakePhoto = () => {
    handleManualFormChange('foto', null);
    handleTakePhoto();
  };

  // Toggle expand item
  const toggleExpandItem = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Open photo modal
  const handleViewPhoto = (photoUrl: string | null) => {
    if (photoUrl) {
      setSelectedPhoto(photoUrl);
      setShowPhotoModal(true);
    }
  };

  // Close photo modal
  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  // Show loading jika masih loading authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Memuat data guru...</p>
        </div>
      </div>
    );
  }

  // Redirect jika tidak authenticated
  if (!isAuthenticated || !guru) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-4">Anda belum login atau session telah expired.</p>
          <button 
            onClick={() => navigate('/guru/login')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Login Sekarang
          </button>
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
            <h1 className="text-white text-xl font-semibold">Absensi & Kehadiran</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={refreshAllData}
              disabled={isLoading}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handlePrint}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              title="Print Laporan"
            >
              <Printer className="w-5 h-5 text-white" />
            </button>
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <Calendar className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Teacher Info */}
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">
                {guru?.nama_lengkap ? guru.nama_lengkap.split(' ').map(n => n[0]).join('').substring(0, 2) : 'GU'}
              </span>
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {guru?.nama_lengkap || 'Loading...'}
              </h3>
              <p className="text-green-100 text-sm">
                {guru?.jabatan?.nama || 'Guru'} - {guru?.unit_sekolah?.nama || 'MI An-Nur'}
              </p>
              <p className="text-green-200 text-xs">
                NIP: {guru?.nip || 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {/* Quick Action - QR Scanner */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Absen Hari Ini</h3>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleQRScan}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-shadow"
            >
              <QrCode className="w-6 h-6" />
              <span className="font-semibold">Scan Absensi</span>
            </button>
            <button 
              onClick={() => setShowManualForm(true)}
              className="w-14 h-14 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors"
              title="Absen Manual"
            >
              <Plus className="w-6 h-6 text-green-600" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4 text-green-600" />
                <span>Masuk: <strong>--:--</strong></span>
              </div>
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4 text-orange-600" />
                <span>Keluar: <strong>--:--</strong></span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-green-600 font-medium">Absen Manual</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                statistik.hadir
              )}
            </p>
            <p className="text-xs text-gray-600">Hadir</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                statistik.sakit
              )}
            </p>
            <p className="text-xs text-gray-600">Sakit</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                statistik.izin
              )}
            </p>
            <p className="text-xs text-gray-600">Izin</p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Filter & Pencarian</h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleExportPDF}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg flex items-center space-x-2 text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button 
                onClick={handlePrint}
                className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg flex items-center space-x-2 text-sm font-medium hover:bg-indigo-200 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari tanggal, status, atau keterangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="semua">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="sakit">Sakit</option>
              <option value="izin">Izin</option>
              <option value="alpha">Alpha</option>
            </select>
            
            {/* Filter Tanggal Custom */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-600 font-medium whitespace-nowrap">Dari:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={dateTo || undefined}
                  className="px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-500 border-0"
                  placeholder="Pilih tanggal"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-600 font-medium whitespace-nowrap">Sampai:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom || undefined}
                  className="px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-500 border-0"
                  placeholder="Pilih tanggal"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-xl text-sm hover:bg-red-200 transition-colors"
                  title="Reset Filter Tanggal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Attendance List - Modern Professional Design */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 sm:px-6 py-4 border-b border-green-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Riwayat Absensi</h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {dateFrom && dateTo ? (
                    <>
                      Data absensi dari <span className="font-semibold text-green-700">
                        {new Date(dateFrom).toLocaleDateString('id-ID', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span> sampai <span className="font-semibold text-green-700">
                        {new Date(dateTo).toLocaleDateString('id-ID', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </>
                  ) : dateFrom ? (
                    <>
                      Data absensi dari <span className="font-semibold text-green-700">
                        {new Date(dateFrom).toLocaleDateString('id-ID', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span> sampai akhir bulan
                    </>
                  ) : dateTo ? (
                    <>
                      Data absensi dari awal bulan sampai <span className="font-semibold text-green-700">
                        {new Date(dateTo).toLocaleDateString('id-ID', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </>
                  ) : (
                    <>
                      Daftar kehadiran dan aktivitas harian - {(() => {
                        const [year, month] = selectedMonth.split('-');
                        const monthNames = [
                          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                        ];
                        return `${monthNames[parseInt(month) - 1]} ${year}`;
                      })()}
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-green-200">
                  <span className="text-sm font-semibold text-green-700">{filteredData.length}</span>
                  <span className="text-xs text-gray-600 ml-1">record</span>
                </div>
                {isLoading && (
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <RefreshCw className="w-4 h-4 animate-spin text-green-600" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content - Mobile First */}
          <div className="p-3 sm:p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
                  </div>
                  <p className="text-gray-600 font-medium">Memuat data absensi...</p>
                  <p className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar</p>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-700 mb-1">Belum Ada Data</h4>
                  <p className="text-sm text-gray-500">Tidak ada data absensi untuk periode yang dipilih</p>
                  <p className="text-xs text-gray-400 mt-2">Coba pilih bulan lain atau ubah filter</p>
                </div>
              </div>
            ) : (
              /* Mobile-First Responsive Container */
              <div className="space-y-3">
                {filteredData.map((item, index) => {
                  const dateInfo = formatDate(item.date);
                  return (
                    <div 
                      key={index} 
                      className="group relative bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-green-300 transition-all duration-300"
                    >
                      {/* Mobile Layout */}
                      <div className="block sm:hidden">
                        <div className="p-3">
                          {/* Header dengan tanggal dan status */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-center min-w-[50px]">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{dateInfo.day}</p>
                              <div className="relative">
                                <p className="text-2xl font-bold text-gray-900 leading-none">{dateInfo.date}</p>
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                              </div>
                              <p className="text-xs font-semibold text-gray-600 mt-1 uppercase">{dateInfo.month}</p>
                            </div>
                            
                            <button 
                              onClick={() => toggleExpandItem(index)}
                              className="w-8 h-8 bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg flex items-center justify-center transition-all duration-300"
                              aria-label="Toggle details"
                            >
                              <ChevronDown className={`w-4 h-4 text-gray-400 hover:text-green-600 transition-all duration-300 ${expandedItems.has(index) ? 'rotate-180' : ''}`} />
                            </button>
                          </div>

                          {/* Status dan waktu */}
                          <div className="space-y-2 mb-3">
                            <div className="flex flex-wrap gap-2">
                              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg ${getStatusColor(item.status)} shadow-sm`}>
                                {getStatusIcon(item.status)}
                                <span className="text-xs font-bold capitalize">{item.status}</span>
                              </div>
                              
                              {item.timeIn !== '-' && (
                                <div className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs font-semibold">{item.timeIn}</span>
                                  <span className="text-xs">→</span>
                                  <span className="text-xs font-semibold">{item.timeOut}</span>
                                </div>
                              )}
                            </div>

                            {/* Keterangan */}
                            {item.keterangan && (
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-700 leading-relaxed">{item.keterangan}</p>
                              </div>
                            )}
                          </div>

                          {/* Info cards - stacked */}
                          <div className="space-y-2">
                            {/* Jam Mengajar */}
                            <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 rounded-lg px-2 py-2">
                              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Users className="w-3 h-3 text-purple-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-purple-600 font-medium">Jam Mengajar</p>
                                <p className="text-sm font-bold text-purple-900 truncate">{calculateTeachingDuration(item.timeIn, item.timeOut)}</p>
                              </div>
                            </div>

                            {/* Foto */}
                            {item.foto ? (
                              <button
                                onClick={() => handleViewPhoto(item.foto)}
                                className="w-full flex items-center space-x-2 bg-green-50 border border-green-200 hover:bg-green-100 hover:border-green-300 rounded-lg px-2 py-2 transition-all"
                              >
                                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Image className="w-3 h-3 text-green-600" />
                                </div>
                                <div className="min-w-0 flex-1 text-left">
                                  <p className="text-xs text-green-600 font-medium">Foto Selfie</p>
                                  <p className="text-sm font-bold text-green-900">Klik Lihat</p>
                                </div>
                              </button>
                            ) : (
                              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2">
                                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Image className="w-3 h-3 text-gray-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500 font-medium">Foto Selfie</p>
                                  <p className="text-sm font-bold text-gray-600">-</p>
                                </div>
                              </div>
                            )}

                            {/* Lokasi */}
                            {(item.lokasi || item.nama_lokasi) && (
                              <div className="flex items-center space-x-2 bg-orange-50 border border-orange-200 rounded-lg px-2 py-2">
                                <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <MapPin className="w-3 h-3 text-orange-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-orange-600 font-medium">Lokasi Absensi</p>
                                  {item.nama_lokasi && (
                                    <p className="text-xs font-semibold text-orange-900 truncate">{item.nama_lokasi}</p>
                                  )}
                                  {/* {item.lokasi && (
                                    <p className="text-xs text-orange-700 truncate mt-0.5">{item.lokasi}</p>
                                  )} */}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Desktop/Tablet Layout */}
                      <div className="hidden sm:block">
                        <div className="flex items-start p-4">
                          {/* Date Column - dengan border accent */}
                          <div className="relative">
                            <div className="text-center min-w-[70px] pr-4">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{dateInfo.day}</p>
                              <div className="relative">
                                <p className="text-3xl font-bold text-gray-900 leading-none">{dateInfo.date}</p>
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                              </div>
                              <p className="text-xs font-semibold text-gray-600 mt-2 uppercase">{dateInfo.month}</p>
                            </div>
                            {/* Vertical Divider */}
                            <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                          </div>
                          
                          {/* Content Column */}
                          <div className="flex-1 pl-4 pr-2">
                            {/* Status Badge */}
                            <div className="flex items-center flex-wrap gap-2 mb-3">
                              <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${getStatusColor(item.status)} shadow-sm`}>
                                {getStatusIcon(item.status)}
                                <span className="text-sm font-bold capitalize">{item.status}</span>
                              </div>
                              
                              {item.timeIn !== '-' && (
                                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm font-semibold">{item.timeIn}</span>
                                  <span className="text-xs">→</span>
                                  <span className="text-sm font-semibold">{item.timeOut}</span>
                                </div>
                              )}
                            </div>

                            {/* Keterangan */}
                            {item.keterangan && (
                              <div className="mb-3 flex items-start space-x-2">
                                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-700 leading-relaxed">{item.keterangan}</p>
                              </div>
                            )}

                            {/* Info Grid - Modern Layout */}
                            <div className="grid grid-cols-2 gap-2">
                              {/* Jam Mengajar */}
                              <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Users className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-purple-600 font-medium">Jam Mengajar</p>
                                  <p className="text-sm font-bold text-purple-900 truncate">{calculateTeachingDuration(item.timeIn, item.timeOut)}</p>
                                </div>
                              </div>

                              {/* Foto - Clickable */}
                              {item.foto ? (
                                <button
                                  onClick={() => handleViewPhoto(item.foto)}
                                  className="flex items-center space-x-2 bg-green-50 border border-green-200 hover:bg-green-100 hover:border-green-300 rounded-lg px-3 py-2 transition-all w-full"
                                >
                                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Image className="w-4 h-4 text-green-600" />
                                  </div>
                                  <div className="min-w-0 flex-1 text-left">
                                    <p className="text-xs text-green-600 font-medium">Foto Selfie</p>
                                    <p className="text-sm font-bold text-green-900">Klik Lihat</p>
                                  </div>
                                </button>
                              ) : (
                                <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Image className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 font-medium">Foto Selfie</p>
                                    <p className="text-sm font-bold text-gray-600">-</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Lokasi - Full Width */}
                            {(item.lokasi || item.nama_lokasi) && (
                              <div className="mt-2 flex items-center space-x-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <MapPin className="w-4 h-4 text-orange-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-orange-600 font-medium mb-0.5">Lokasi Absensi</p>
                                  {item.nama_lokasi && (
                                    <p className="text-sm font-semibold text-orange-900 truncate">{item.nama_lokasi}</p>
                                  )}
                                  {/* {item.lokasi && (
                                    <p className="text-xs text-orange-700 truncate mt-0.5">{item.lokasi}</p>
                                  )} */}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Expand Button */}
                          <div className="flex items-center pl-2">
                            <button 
                              onClick={() => toggleExpandItem(index)}
                              className="w-10 h-10 bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                              aria-label="Toggle details"
                            >
                              <ChevronDown className={`w-5 h-5 text-gray-400 group-hover:text-green-600 transition-all duration-300 ${expandedItems.has(index) ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details Section */}
                      {expandedItems.has(index) && (
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-gray-200 bg-gray-50/50 transition-all duration-300">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {/* Detail Information */}
                            <div className="space-y-2">
                              <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Detail Informasi</h5>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm space-y-1 sm:space-y-0">
                                <span className="text-gray-600">Tanggal:</span>
                                <span className="font-semibold text-gray-900 text-xs sm:text-sm">{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm space-y-1 sm:space-y-0">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-semibold px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                                  {item.status.toUpperCase()}
                                </span>
                              </div>
                              
                              {item.timeIn !== '-' && (
                                <>
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm space-y-1 sm:space-y-0">
                                    <span className="text-gray-600">Jam Masuk:</span>
                                    <span className="font-semibold text-blue-700">{item.timeIn}</span>
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm space-y-1 sm:space-y-0">
                                    <span className="text-gray-600">Jam Keluar:</span>
                                    <span className="font-semibold text-orange-700">{item.timeOut}</span>
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm space-y-1 sm:space-y-0">
                                    <span className="text-gray-600">Total Mengajar:</span>
                                    <span className="font-semibold text-purple-700">{calculateTeachingDuration(item.timeIn, item.timeOut)}</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-2">
                              <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Informasi Tambahan</h5>
                              
                              {/* {item.lokasi && (
                                <div className="text-xs sm:text-sm">
                                  <span className="text-gray-600 block mb-1">Lokasi:</span>
                                  <span className="font-medium text-gray-900 text-xs break-all">{item.lokasi}</span>
                                </div>
                              )} */}
                              
                              {item.nama_lokasi && (
                                <div className="text-xs sm:text-sm mt-2">
                                  <span className="text-gray-600 block mb-1">Nama Lokasi:</span>
                                  <span className="font-medium text-gray-900 text-xs break-all">{item.nama_lokasi}</span>
                                </div>
                              )}
                              
                              {item.keterangan && (
                                <div className="text-xs sm:text-sm">
                                  <span className="text-gray-600 block mb-1">Keterangan:</span>
                                  <span className="font-medium text-gray-900 text-xs">{item.keterangan}</span>
                                </div>
                              )}

                              {item.foto && (
                                <div className="mt-3">
                                  <button
                                    onClick={() => handleViewPhoto(item.foto)}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm"
                                  >
                                    <Image className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="font-semibold">Lihat Foto Selfie</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bottom Accent Line */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-6 mx-4 max-w-sm w-full">
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-indigo-600 border-dashed rounded-2xl flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Scanning QR Code</h3>
              <p className="text-gray-600 text-sm mb-4">Arahkan kamera ke QR Code absensi</p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowQRScanner(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    setShowQRScanner(false);
                    setShowManualForm(true);
                  }}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium"
                >
                  Manual Input
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Attendance Form Modal */}
      {showManualForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    {absensiHariIni ? (
                      <Clock className="w-6 h-6 text-white" />
                    ) : (
                      <Plus className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">
                      {absensiHariIni ? 'Absen Keluar' : 'Absen Masuk'}
                    </h3>
                    <p className="text-green-100 text-sm">
                      {absensiHariIni ? 'Catat jam keluar untuk hari ini' : 'Input jam masuk untuk hari ini'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleCancelManualForm}
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
                  <span>Tanggal Absensi</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={manualFormData.tanggal}
                  onChange={(e) => handleManualFormChange('tanggal', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status Kehadiran <span className="text-red-500">*</span>
                </label>
                <select
                  value={manualFormData.status}
                  onChange={(e) => handleManualFormChange('status', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                >
                  <option value="hadir">Hadir</option>
                  <option value="sakit">Sakit</option>
                  <option value="izin">Izin</option>
                  <option value="alpha">Alpha</option>
                </select>
              </div>

              {/* Jam Masuk & Keluar - hanya untuk status hadir */}
              {manualFormData.status === 'hadir' && (
                <div>
                  {/* Jika belum ada absensi hari ini, tampilkan input jam masuk */}
                  {!absensiHariIni ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span>Jam Masuk</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={manualFormData.jamMasuk}
                        onChange={(e) => handleManualFormChange('jamMasuk', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                      />
                      <p className="text-xs text-gray-600 mt-1">Input jam masuk untuk absensi hari ini</p>
                    </div>
                  ) : (
                    /* Jika sudah ada absensi, tampilkan info jam masuk dan input jam keluar */
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-green-700 mb-2 flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Jam Masuk (Sudah Tercatat)</span>
                        </label>
                        <div className="text-2xl font-bold text-green-900">
                          {absensiHariIni.jam_masuk}
                        </div>
                        <p className="text-xs text-green-700 mt-1">Absensi masuk sudah tercatat hari ini</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span>Jam Keluar</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={absensiHariIni?.jam_masuk || manualFormData.jamMasuk || ''}
                          readOnly
                          disabled
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">Jam keluar mengikuti jam masuk yang sudah tercatat</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Info Jam Mengajar - otomatis terhitung */}
              {manualFormData.status === 'hadir' && (
                <>
                  {/* Tampilkan hanya jika jam keluar sudah diisi */}
                  {manualFormData.jamKeluar && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900">Jam Mengajar (Otomatis)</p>
                          <p className="text-xs text-blue-700 mt-1">
                            {(() => {
                              const jamMasuk = absensiHariIni ? absensiHariIni.jam_masuk : manualFormData.jamMasuk;
                              const jamKeluar = manualFormData.jamKeluar;
                              
                              if (jamMasuk && jamKeluar) {
                                const [masukHour, masukMinute] = jamMasuk.split(':').map(Number);
                                const [keluarHour, keluarMinute] = jamKeluar.split(':').map(Number);
                                const masukInMinutes = masukHour * 60 + masukMinute;
                                const keluarInMinutes = keluarHour * 60 + keluarMinute;
                                const diffInMinutes = keluarInMinutes - masukInMinutes;
                                const hours = Math.max(0, Math.round(diffInMinutes / 60 * 10) / 10);
                                return `${hours} jam (dari ${jamMasuk} - ${jamKeluar})`;
                              }
                              return 'Menghitung...';
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Lokasi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4 text-gray-600" />
                  <span>Lokasi Absensi</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={manualFormData.lokasi}
                    onChange={(e) => handleManualFormChange('lokasi', e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                    placeholder="Lokasi akan terdeteksi otomatis..."
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl flex items-center space-x-2 transition-colors"
                  >
                    {isDetectingLocation ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">
                      {isDetectingLocation ? 'Detecting...' : 'Detect'}
                    </span>
                  </button>
                </div>
                {manualFormData.lokasi && (
                  <div className="mt-1">
                    <p className="text-xs text-gray-600">
                      {manualFormData.lokasi.includes('Dalam area sekolah') ? (
                        <span className="text-green-600 font-medium">✓ Lokasi valid untuk absensi</span>
                      ) : manualFormData.lokasi.includes('Diluar area sekolah') ? (
                        <span className="text-orange-600 font-medium">⚠ Diluar area sekolah</span>
                      ) : (
                        <span className="text-gray-600">Lokasi terdeteksi</span>
                      )}
                    </p>
                    {!isLocationValid && (
                      <p className="text-xs text-red-600 font-medium mt-1 bg-red-50 p-2 rounded-lg">
                        ⚠ Anda tidak dapat melakukan absensi karena berada diluar area sekolah (radius &gt; 0.5 km)
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Foto Selfie */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-gray-600" />
                  <span>Foto Selfie</span>
                </label>
                {!manualFormData.foto ? (
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    disabled={isTakingPhoto}
                    className="w-full px-4 py-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all flex flex-col items-center space-y-2 disabled:opacity-50"
                  >
                    {isTakingPhoto ? (
                      <>
                        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                        <span className="text-sm text-gray-600">Mengakses kamera...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">Tap untuk ambil foto selfie</span>
                        <span className="text-xs text-gray-500">Foto akan diambil dengan kamera depan</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={manualFormData.foto}
                        alt="Foto Selfie"
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={handleRetakePhoto}
                          className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-green-600">
                      <Image className="w-4 h-4" />
                      <span>Foto berhasil diambil</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <span>Keterangan</span>
                </label>
                <textarea
                  value={manualFormData.keterangan}
                  onChange={(e) => handleManualFormChange('keterangan', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all resize-none"
                  placeholder={`Masukkan keterangan untuk ${manualFormData.status}...`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={handleCancelManualForm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Batal</span>
                </button>
                <button 
                  onClick={handleSubmitManualAttendance}
                  disabled={isSubmitting || !isLocationValid}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center space-x-2"
                  title={!isLocationValid ? 'Tidak dapat absen karena lokasi diluar area sekolah' : ''}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : !isLocationValid ? (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      <span>{absensiHariIni ? 'Absen Keluar' : 'Absen Masuk'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>{absensiHariIni ? 'Absen Keluar' : 'Absen Masuk'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={handleClosePhotoModal}
        >
          <div className="relative max-w-4xl w-full">
            {/* Close Button */}
            <button 
              onClick={handleClosePhotoModal}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Photo Container */}
            <div 
              className="bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Foto Selfie Absensi</h3>
                    <p className="text-green-100 text-sm">Klik diluar untuk menutup</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50">
                <img 
                  src={selectedPhoto} 
                  alt="Foto Selfie Absensi" 
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              </div>

              <div className="px-6 py-4 bg-white border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Image className="w-4 h-4" />
                    <span>Foto diambil saat absensi</span>
                  </div>
                  <button
                    onClick={handleClosePhotoModal}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Absensi;
