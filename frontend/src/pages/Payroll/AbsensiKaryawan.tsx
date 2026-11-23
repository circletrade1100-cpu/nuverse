import React, { useState, useEffect } from 'react';
import PayrollLayout from '../../components/Payroll/PayrollLayout';
import Card from '../../components/common/UI/Card';
import Button from '../../components/common/UI/Button';
import Modal from '../../components/common/UI/Modal';
import Table from '../../components/common/UI/Table';
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CameraIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

// Helper function to convert minutes to hours:minutes format
const formatTeachingHours = (minutes: number | string | null | undefined): string => {
  // Handle edge cases
  if (minutes === null || minutes === undefined || minutes === '' || isNaN(Number(minutes))) {
    return '0 Jam';
  }
  
  const numMinutes = Math.round(Number(minutes)); // Round to nearest integer
  
  if (numMinutes === 0) return '0 Jam';
  if (numMinutes < 0) return '0 Jam'; // Handle negative values
  
  const hours = Math.floor(numMinutes / 60);
  const remainingMinutes = Math.round(numMinutes % 60); // Round to integer
  
  if (hours === 0) {
    return `${remainingMinutes} Menit`;
  } else if (remainingMinutes === 0) {
    return `${hours} Jam`;
  } else {
    return `${hours} Jam ${remainingMinutes} Menit`;
  }
};

// Helper function untuk menghitung selisih waktu dari timeIn dan timeOut
const calculateTeachingDuration = (timeIn: string, timeOut: string): string => {
  // Jika salah satu waktu tidak ada atau bernilai '-', return '0 Jam'
  if (!timeIn || !timeOut || timeIn === '-' || timeOut === '-') {
    return '0 Jam';
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
    return '0 Jam';
  }
};

interface AbsensiRecord {
  id: string;
  tanggal: string;
  nip: string;
  nama: string;
  divisi: string;
  jamMasuk: string;
  jamKeluar: string;
  jamKerja: number;
  jamLembur: number;
  status: 'Hadir' | 'Terlambat' | 'Absen' | 'Izin' | 'Sakit';
  keterangan: string;
  lokasi?: string | null;
  foto?: string | null;
}

const AbsensiKaryawan: React.FC = () => {
  const [absensiData, setAbsensiData] = useState<AbsensiRecord[]>([]);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [unitSekolahList, setUnitSekolahList] = useState<string[]>([]);
  const [statusList, setStatusList] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AbsensiRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isLocationValid, setIsLocationValid] = useState(true);
  
  // Debug: Monitor isLocationValid changes
  useEffect(() => {
    console.log('isLocationValid changed to:', isLocationValid);
  }, [isLocationValid]);
  
  // Form state untuk input absensi
  const [inputForm, setInputForm] = useState({
    id_guru: '',
    tanggal: new Date().toISOString().split('T')[0],
    jam_masuk: '',
    jam_keluar: '',
    status: 'hadir',
    keterangan: '',
    jam_mengajar: 0,
    lokasi: '',
    foto: null as string | null
  });
  const [guruList, setGuruList] = useState<any[]>([]);
  const [loadingGuru, setLoadingGuru] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);
  const [total, setTotal] = useState(0);
  
  // Statistics state
  const [stats, setStats] = useState({
    totalKaryawan: 0,
    hadir: 0,
    terlambat: 0,
    tidakHadir: 0,
    totalJamLembur: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Helper function to map backend status to frontend status
  const mapBackendStatus = (status: string): 'Hadir' | 'Terlambat' | 'Absen' | 'Izin' | 'Sakit' => {
    const statusMap: {[key: string]: 'Hadir' | 'Terlambat' | 'Absen' | 'Izin' | 'Sakit'} = {
      'hadir': 'Hadir',
      'sakit': 'Sakit',
      'izin': 'Izin',
      'alpha': 'Absen'
    };
    return statusMap[status.toLowerCase()] || 'Absen';
  };

  // Helper function to calculate overtime hours
  const calculateOvertimeHours = (jamKerja: number): number => {
    const normalWorkHours = 8;
    return Math.max(0, jamKerja - normalWorkHours);
  };

  // Fetch statistics dari backend
  const fetchDailyStatistics = async (date: string) => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/absensi/statistics/daily?tanggal=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const result = await response.json();
      console.log('=== STATISTICS API RESPONSE ===');
      console.log('Statistics Result:', result);
      
      if (response.ok && result.success && result.data) {
        const statsData = result.data;
        setStats({
          totalKaryawan: statsData.total_karyawan || 0,
          hadir: statsData.hadir || 0,
          terlambat: statsData.terlambat || 0,
          tidakHadir: statsData.total_tidak_hadir || 0,
          totalJamLembur: statsData.total_jam_lembur || 0
        });
        console.log('Updated Stats:', {
          totalKaryawan: statsData.total_karyawan,
          hadir: statsData.hadir,
          terlambat: statsData.terlambat,
          tidakHadir: statsData.total_tidak_hadir,
          totalJamLembur: statsData.total_jam_lembur
        });
      } else {
        console.warn('Failed to fetch statistics:', result);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch data absensi dari backend
  const fetchAbsensiData = async (fromDate: string, toDate: string, page: number = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Build query parameters
      const params = new URLSearchParams({
        tanggal_mulai: fromDate,
        tanggal_akhir: toDate,
        page: page.toString(),
        per_page: perPage.toString()
      });
      
      // Add filter unit sekolah if selected
      if (selectedDivisi) {
        params.append('unit_sekolah', selectedDivisi);
      }
      
      // Add filter status if selected
      if (selectedStatus) {
        // Convert frontend status back to backend format
        const statusMap: {[key: string]: string} = {
          'Hadir': 'hadir',
          'Terlambat': 'hadir', // Terlambat is subset of hadir, handled separately
          'Absen': 'alpha',
          'Izin': 'izin',
          'Sakit': 'sakit'
        };
        const backendStatus = statusMap[selectedStatus] || selectedStatus.toLowerCase();
        params.append('status', backendStatus);
      }
      
      const response = await fetch(`${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/absensi?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const result = await response.json();
      console.log('=== ABSENSI API RESPONSE DEBUG ===');
      console.log('Full Result:', JSON.stringify(result, null, 2));
      console.log('Response OK:', response.ok);
      console.log('Result Keys:', Object.keys(result));
      console.log('Result Success:', result.success);
      console.log('Result Data:', result.data);
      console.log('Type of Result Data:', typeof result.data);
      console.log('Is Result Data Array?:', Array.isArray(result.data));
      
      let dataArray: any[] = [];
      let paginationInfo = {
        current_page: 1,
        last_page: 1,
        total: 0
      };
      
      // Handle berbagai format response
      if (response.ok) {
        if (result.success && result.data) {
          // Format: { success: true, data: { current_page, data: [], ... } }
          if (result.data.data && Array.isArray(result.data.data)) {
            console.log('Format 1: Paginated with success wrapper');
            dataArray = result.data.data;
            paginationInfo = {
              current_page: result.data.current_page || 1,
              last_page: result.data.last_page || 1,
              total: result.data.total || 0
            };
          }
          // Format: { success: true, data: [...] }
          else if (Array.isArray(result.data)) {
            console.log('Format 2: Direct array in data');
            dataArray = result.data;
            paginationInfo.total = result.data.length;
          }
        }
        // Format: Direct array
        else if (Array.isArray(result)) {
          console.log('Format 3: Direct array response');
          dataArray = result;
          paginationInfo.total = result.length;
        }
        // Format: { data: [...] } without success
        else if (result.data && Array.isArray(result.data)) {
          console.log('Format 4: data array without success');
          dataArray = result.data;
          paginationInfo.total = result.data.length;
        }
      }
      
      console.log('Data Array Length:', dataArray.length);
      console.log('Data Array:', dataArray);
      
      if (dataArray.length > 0) {
        // Transform data dari backend ke format yang diharapkan frontend
        const transformedData: AbsensiRecord[] = dataArray.map((item: any, index: number) => {
          console.log(`Processing item ${index}:`, item);
          console.log(`Item Guru ${index}:`, item.guru);
          console.log(`Item Guru Unit Sekolah ${index}:`, item.guru?.unit_sekolah);
          console.log(`Item Unit Sekolah Nama ${index}:`, item.guru?.unit_sekolah?.nama);
          console.log(`Item Foto ${index}:`, item.foto ? `Length: ${item.foto.length}` : 'No foto');
          
          // jam_masuk dan jam_keluar sudah dalam format HH:mm dari backend
          const jamMasukTime = item.jam_masuk || '-';
          const jamKeluarTime = item.jam_keluar || '-';
          
          // Gunakan jam_mengajar dari backend
          const jamKerja = item.jam_mengajar || 0;
          const jamLembur = calculateOvertimeHours(jamKerja);
          
          const unitSekolahNama = item.guru?.unit_sekolah?.nama || '';
          console.log(`Transformed unit sekolah for item ${index}:`, unitSekolahNama);
          
          // Gunakan nama_lokasi jika ada, fallback ke lokasi
          const lokasiText = item.nama_lokasi || item.lokasi || null;
          
          const transformed = {
            id: item.id?.toString() || '',
            tanggal: item.tanggal || fromDate,
            nip: item.guru?.nip || '',
            nama: item.guru?.nama_lengkap || '',
            divisi: unitSekolahNama,
            jamMasuk: jamMasukTime,
            jamKeluar: jamKeluarTime,
            jamKerja: jamKerja,
            jamLembur: jamLembur,
            status: mapBackendStatus(item.status || 'alpha'),
            keterangan: item.keterangan || '',
            lokasi: lokasiText,
            foto: item.foto || null
          };
          
          console.log(`Transformed item ${index}:`, transformed);
          console.log(`Transformed foto ${index}:`, transformed.foto ? `Length: ${transformed.foto.length}` : 'No foto');
          return transformed;
        });
        
        console.log('All Transformed Absensi Data:', transformedData);
        setAbsensiData(transformedData);
        
        // Update pagination info
        setCurrentPage(paginationInfo.current_page);
        setTotalPages(paginationInfo.last_page);
        setTotal(paginationInfo.total);
      } else {
        console.warn('No data found in response');
        console.warn('Full result structure:', result);
        setAbsensiData([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching absensi data:', error);
      setAbsensiData([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unit sekolah list from backend
  const fetchUnitSekolahList = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/guru?per_page=10000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success && result.data?.data) {
        const units = new Set<string>();
        result.data.data.forEach((guru: any) => {
          if (guru.unit_sekolah?.nama) {
            units.add(guru.unit_sekolah.nama);
          }
        });
        setUnitSekolahList(Array.from(units).sort());
      }
    } catch (error) {
      console.error('Error fetching unit sekolah list:', error);
    }
  };

  // Fetch status list from backend
  const fetchStatusList = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/absensi?per_page=10000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success && result.data?.data) {
        const statuses = new Set<string>();
        result.data.data.forEach((absensi: any) => {
          if (absensi.status) {
            const frontendStatus = mapBackendStatus(absensi.status);
            statuses.add(frontendStatus);
          }
        });
        setStatusList(Array.from(statuses).sort());
      }
    } catch (error) {
      console.error('Error fetching status list:', error);
      // Fallback to default statuses
      setStatusList(['Hadir', 'Terlambat', 'Absen', 'Izin', 'Sakit']);
    }
  };

  // Load unit sekolah and status list on mount
  useEffect(() => {
    fetchUnitSekolahList();
    fetchStatusList();
  }, []);

  // Load data saat component mount dan ketika filter berubah
  useEffect(() => {
    setCurrentPage(1);
    fetchAbsensiData(dateFrom, dateTo, 1);
    // Statistics can use dateFrom for single date queries if needed
    fetchDailyStatistics(dateFrom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, selectedDivisi, selectedStatus]);

  // Load data ketika page berubah
  useEffect(() => {
    if (currentPage > 1) {
      fetchAbsensiData(dateFrom, dateTo, currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const filteredAbsensi = absensiData.filter(record => {
    if (!record) {
      console.warn('Undefined record in filter');
      return false;
    }
    
    // Filter hanya untuk search karena divisi dan status sudah di-filter di backend
    const matchesSearch = !searchTerm || 
                         (record.nama && record.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (record.nip && record.nip.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Divisi dan status sudah di-filter di backend, jadi tidak perlu filter lagi di frontend
    // Hanya filter jika search term ada
    return matchesSearch;
  });

  console.log('=== FILTERED ABSENSI ===');
  console.log('Total absensiData:', absensiData.length);
  console.log('Total filteredAbsensi:', filteredAbsensi.length);
  console.log('Filtered Absensi Data:', filteredAbsensi);
  console.log('=== STATS FROM BACKEND ===');
  console.log('Stats:', stats);

  const getStatusBadge = (status: AbsensiRecord['status']) => {
    const colors = {
      'Hadir': 'bg-green-100 text-green-800 border-green-200',
      'Terlambat': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Absen': 'bg-red-100 text-red-800 border-red-200',
      'Izin': 'bg-blue-100 text-blue-800 border-blue-200',
      'Sakit': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const handleViewDetail = (record: AbsensiRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  // Handle export to Excel
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Build query parameters
      const params = new URLSearchParams({
        tanggal_mulai: dateFrom,
        tanggal_akhir: dateTo
      });
      
      // Add filter unit sekolah if selected
      if (selectedDivisi) {
        params.append('unit_sekolah', selectedDivisi);
      }
      
      // Add filter status if selected
      if (selectedStatus) {
        params.append('status', selectedStatus);
      }
      
      const response = await fetch(`${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/absensi/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.ms-excel'
        }
      });

      if (!response.ok) {
        throw new Error('Export gagal');
      }

      // Get blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `Absensi_${dateFrom}_to_${dateTo}.xls`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          // Replace .xlsx with .xls if present
          filename = filenameMatch[1].replace(/\.xlsx$/, '.xls');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data absensi berhasil diekspor ke Excel',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });
    } catch (error: any) {
      console.error('Error exporting absensi:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.message || 'Terjadi kesalahan saat export data',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch list guru untuk dropdown
  const fetchGuruList = async () => {
    setLoadingGuru(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/guru?per_page=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success && data.data && data.data.data) {
        setGuruList(data.data.data);
      }
    } catch (error) {
      console.error('Error fetching guru list:', error);
    } finally {
      setLoadingGuru(false);
    }
  };

  // Handle input change
  const handleInputChange = (field: string, value: string | number | null) => {
    setInputForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset location validity if lokasi field is manually changed
    if (field === 'lokasi') {
      // Check if it's a valid location (contains coordinates and school area info)
      const locationText = value as string;
      if (locationText.includes('Dalam area sekolah')) {
        setIsLocationValid(true);
      } else if (locationText.includes('Diluar area sekolah') || locationText.includes('Lat:')) {
        setIsLocationValid(false);
      }
    }
  };

  // Handle detect location
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (_position) => {
          //const { latitude, longitude } = _position.coords;
          
          const latitude = -6.3102478;
          const longitude = 107.1663329;
          // Reverse geocoding to get address (using a mock service)
          try {
            const address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
            
            // Check if location is within school radius (mock validation)
            const schoolLat = -6.3114078; // School coordinates
            const schoolLng = 107.1663329;
            const distance = calculateDistance(latitude, longitude, schoolLat, schoolLng);
            
            let locationText = address;
            let locationValid = true;
            
            if (distance <= 0.5) { // Within 500 meters
              locationText = `${address} (Dalam area sekolah ✓)`;
              locationValid = true;
            } else {
              locationText = `${address} (Diluar area sekolah - ${distance.toFixed(1)}km)`;
              locationValid = false;
            }
            
            console.log('=== LOCATION VALIDATION ===');
            console.log('Distance from school:', distance.toFixed(3), 'km');
            console.log('Location valid:', locationValid);
            console.log('Setting isLocationValid to:', locationValid);
            
            handleInputChange('lokasi', locationText);
            setIsLocationValid(locationValid);
            setIsDetectingLocation(false);
          } catch (error) {
            console.error('Error getting address:', error);
            handleInputChange('lokasi', `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
            setIsLocationValid(false); // Set invalid if error getting address
            setIsDetectingLocation(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocationValid(false); // Set invalid if GPS error
          setIsDetectingLocation(false);
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Gagal mengambil lokasi. Pastikan GPS aktif dan izinkan akses lokasi.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setIsLocationValid(false); // Set invalid if geolocation not supported
      setIsDetectingLocation(false);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Geolocation tidak didukung oleh browser ini.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
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

  // Handle take photo
  const handleTakePhoto = () => {
    setIsTakingPhoto(true);
    
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      } 
    })
    .then((stream) => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = 640;
      canvas.height = 480;
      
      video.addEventListener('loadedmetadata', () => {
        setTimeout(() => {
          if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            handleInputChange('foto', photoDataUrl);
            
            stream.getTracks().forEach(track => track.stop());
            setIsTakingPhoto(false);
          }
        }, 100);
      });
    })
    .catch((error) => {
      console.error('Error accessing camera:', error);
      setIsTakingPhoto(false);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal mengakses kamera. Pastikan izinkan akses kamera.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    });
  };

  const handleRetakePhoto = () => {
    handleInputChange('foto', null);
    handleTakePhoto();
  };

  // Handle submit input absensi
  const handleSubmitAbsensi = async () => {
    // Validate form
    if (!inputForm.id_guru) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Pilih guru terlebih dahulu!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    if (!inputForm.tanggal) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Tanggal harus diisi!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    if (inputForm.status === 'hadir' && (!inputForm.jam_masuk || !inputForm.jam_keluar)) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Jam masuk dan keluar harus diisi untuk status hadir!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Hitung jam mengajar dari selisih jam masuk dan keluar
      let jamMengajar = 0;
      if (inputForm.status === 'hadir' && inputForm.jam_masuk && inputForm.jam_keluar) {
        const [masukHour, masukMinute] = inputForm.jam_masuk.split(':').map(Number);
        const [keluarHour, keluarMinute] = inputForm.jam_keluar.split(':').map(Number);
        const masukInMinutes = masukHour * 60 + masukMinute;
        const keluarInMinutes = keluarHour * 60 + keluarMinute;
        const diffInMinutes = keluarInMinutes - masukInMinutes;
        jamMengajar = Math.max(0, Math.round(diffInMinutes / 60 * 10) / 10); // Round to 1 decimal
      }

      const submitData = {
        ...inputForm,
        jam_mengajar: jamMengajar
      };

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/absensi`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data absensi berhasil ditambahkan',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981'
        });
        
        // Reset form
        setInputForm({
          id_guru: '',
          tanggal: new Date().toISOString().split('T')[0],
          jam_masuk: '',
          jam_keluar: '',
          status: 'hadir',
          keterangan: '',
          jam_mengajar: 0,
          lokasi: '',
          foto: null
        });
        setIsLocationValid(true);
        
        // Close modal
        setShowInputModal(false);
        
        // Refresh data
        fetchAbsensiData(dateFrom, dateTo, currentPage);
        fetchDailyStatistics(dateFrom);
      } else {
        throw new Error(result.message || 'Gagal menyimpan data');
      }
    } catch (error: any) {
      console.error('Error submitting absensi:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.message || 'Terjadi kesalahan saat menyimpan data',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open input modal
  const handleOpenInputModal = () => {
    fetchGuruList();
    setInputForm(prev => ({
      ...prev,
      tanggal: dateFrom
    }));
    setIsLocationValid(true); // Reset location validation
    setShowInputModal(true);
  };

  // Cancel input modal
  const handleCancelInputModal = () => {
    setShowInputModal(false);
    setInputForm({
      id_guru: '',
      tanggal: new Date().toISOString().split('T')[0],
      jam_masuk: '',
      jam_keluar: '',
      status: 'hadir',
      keterangan: '',
      jam_mengajar: 0,
      lokasi: '',
      foto: null
    });
    setIsLocationValid(true);
  };

  const columns = [
    {
      key: 'nip',
      header: 'NIP',
      render: (_: any, record: AbsensiRecord) => {
        console.log('Rendering NIP for record:', record);
        return <div className="font-medium text-slate-900">{record?.nip || '-'}</div>;
      }
    },
    {
      key: 'nama',
      header: 'Nama Karyawan',
      render: (_: any, record: AbsensiRecord) => {
        console.log('Rendering Nama for record:', record);
        return (
          <div>
            <div className="font-medium text-slate-900">{record?.nama || '-'}</div>
            <div className="text-sm text-slate-500">{record?.divisi || '-'}</div>
          </div>
        );
      }
    },
    {
      key: 'waktu',
      header: 'Jam Masuk/Keluar',
      render: (_: any, record: AbsensiRecord) => {
        console.log('Rendering Waktu for record:', record);
        return (
          <div className="text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <ClockIcon className="w-3 h-3" />
              <span>Masuk: {record?.jamMasuk || '-'}</span>
            </div>
            <div className="flex items-center gap-1 text-red-600 mt-1">
              <ClockIcon className="w-3 h-3" />
              <span>Keluar: {record?.jamKeluar || '-'}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'jamKerja',
      header: 'Jam Kerja',
      render: (_: any, record: AbsensiRecord) => {
        console.log('Rendering Jam Kerja for record:', record);
        const jamKerjaDuration = calculateTeachingDuration(record.jamMasuk, record.jamKeluar);
        return (
          <div className="text-center">
            <div className="font-medium text-slate-900">{jamKerjaDuration}</div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, record: AbsensiRecord) => {
        console.log('Rendering Status for record:', record);
        return getStatusBadge(record?.status || 'Absen');
      }
    },
    {
      key: 'lokasi',
      header: 'Lokasi',
      render: (_: any, record: AbsensiRecord) => {
        console.log('Rendering Lokasi for record:', record);
        const lokasiText = record?.lokasi || '-';
        const isInSchoolArea = lokasiText.includes('Dalam area sekolah');
        const isOutOfSchoolArea = lokasiText.includes('Diluar area sekolah');
        
        return (
          <div className="text-sm max-w-xs">
            {lokasiText !== '-' ? (
              <div className="flex items-center gap-2">
                <MapPinIcon className={`w-4 h-4 flex-shrink-0 ${
                  isInSchoolArea ? 'text-emerald-600' : 
                  isOutOfSchoolArea ? 'text-red-600' : 
                  'text-slate-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className={`truncate ${
                    isInSchoolArea ? 'text-emerald-700 font-medium' : 
                    isOutOfSchoolArea ? 'text-red-700 font-medium' : 
                    'text-slate-600'
                  }`}>
                    {isInSchoolArea 
                      ? '✓ Dalam Area Sekolah'
                      : isOutOfSchoolArea
                      ? '✗ Diluar Area Sekolah'
                      : lokasiText.length > 50 
                        ? lokasiText.substring(0, 50) + '...'
                        : lokasiText
                    }
                  </div>
                  {!isInSchoolArea && !isOutOfSchoolArea && lokasiText.length > 50 && (
                    <div className="text-xs text-slate-500 mt-1" title={lokasiText}>
                      {lokasiText}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'keterangan',
      header: 'Keterangan',
      render: (_: any, record: AbsensiRecord) => {
        console.log('Rendering Keterangan for record:', record);
        return (
          <div className="text-sm text-slate-600 max-w-xs truncate">
            {record?.keterangan || '-'}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_: any, record: AbsensiRecord) => {
        console.log('Rendering Actions for record:', record);
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewDetail(record)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Lihat Detail"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Edit Absensi"
            >
              <DocumentTextIcon className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <PayrollLayout>
      <div className="space-y-8">
        {/* Modern Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Absensi Karyawan</h1>
              <p className="text-emerald-100 text-lg">Kelola dan pantau kehadiran karyawan secara real-time</p>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {loadingStats ? (
                    <div className="w-6 h-6 border-2 border-emerald-200 border-t-white rounded-full animate-spin mx-auto"></div>
                  ) : stats.totalKaryawan}
                </div>
                <div className="text-emerald-200 text-sm">Total Karyawan</div>
              </div>
              <div className="w-px h-12 bg-emerald-400"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {loadingStats ? (
                    <div className="w-6 h-6 border-2 border-emerald-200 border-t-white rounded-full animate-spin mx-auto"></div>
                  ) : stats.hadir}
                </div>
                <div className="text-emerald-200 text-sm">Hadir</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Date Selector */}
        <Card className="p-6 border-0 shadow-xl bg-white backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Filter Tanggal</h3>
                <p className="text-sm text-slate-600">Pilih tanggal untuk melihat data absensi</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Dari Tanggal:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 text-slate-900 transition-all duration-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Sampai Tanggal:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom}
                  className="px-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 text-slate-900 transition-all duration-200"
                />
              </div>
              <Button 
                onClick={handleOpenInputModal}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Input Absensi
              </Button>
              <Button 
                onClick={handleExport}
                disabled={isExporting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2 text-sm whitespace-nowrap"
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <ArrowDownTrayIcon className="w-4 h-4" />
                )}
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full inline-block">
            Periode: <span className="font-semibold">
              {new Date(dateFrom).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} 
              {dateFrom !== dateTo && ` - ${new Date(dateTo).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`}
            </span>
          </div>
        </Card>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">Total Karyawan</p>
                <p className="text-3xl font-bold text-blue-900">
                  {loadingStats ? (
                    <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                  ) : stats.totalKaryawan}
                </p>
                <p className="text-xs text-blue-600 mt-1">Terdaftar aktif</p>
              </div>
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <UsersIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">Hadir</p>
                <p className="text-3xl font-bold text-green-900">
                  {loadingStats ? (
                    <div className="w-6 h-6 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                  ) : stats.hadir}
                </p>
                <p className="text-xs text-green-600 mt-1">Karyawan hadir</p>
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircleIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 mb-1">Terlambat</p>
                <p className="text-3xl font-bold text-amber-900">
                  {loadingStats ? (
                    <div className="w-6 h-6 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
                  ) : stats.terlambat}
                </p>
                <p className="text-xs text-amber-600 mt-1">Datang terlambat</p>
              </div>
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ExclamationTriangleIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">Tidak Hadir</p>
                <p className="text-3xl font-bold text-red-900">
                  {loadingStats ? (
                    <div className="w-6 h-6 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                  ) : stats.tidakHadir}
                </p>
                <p className="text-xs text-red-600 mt-1">Absen hari ini</p>
              </div>
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <XCircleIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700 mb-1">Total Lembur</p>
                <p className="text-3xl font-bold text-purple-900">
                  {loadingStats ? (
                    <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                  ) : `${stats.totalJamLembur}h`}
                </p>
                <p className="text-xs text-purple-600 mt-1">Jam kerja extra</p>
              </div>
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ClockIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 border-0 shadow-xl bg-white backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative group">
                <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Cari karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 w-full sm:w-80 text-slate-900 placeholder-slate-400 transition-all duration-200 hover:border-slate-300"
                />
              </div>
              
              <select
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
                className="px-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 text-slate-900 bg-white hover:border-slate-300 transition-all duration-200 min-w-[160px]"
              >
                <option value="">Semua Unit</option>
                {unitSekolahList.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 text-slate-900 bg-white hover:border-slate-300 transition-all duration-200 min-w-[140px]"
              >
                <option value="">Semua Status</option>
                {statusList.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
              Menampilkan <span className="font-semibold text-emerald-800">{filteredAbsensi.length}</span> data absensi
            </div>
          </div>
          
          {/* Filter Status Info */}
          <div className="mt-6 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full text-sm font-medium">
                Pencarian: "{searchTerm}"
              </span>
            )}
            {selectedDivisi && (
              <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                Divisi: {selectedDivisi}
              </span>
            )}
            {selectedStatus && (
              <span className="text-amber-600 bg-amber-100 px-3 py-1 rounded-full text-sm font-medium">
                Status: {selectedStatus}
              </span>
            )}
            {(searchTerm || selectedDivisi || selectedStatus) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDivisi('');
                  setSelectedStatus('');
                }}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        </Card>

        {/* Enhanced Attendance Table */}
        <Card className="border-0 shadow-xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Data Absensi Karyawan</h3>
                <p className="text-sm text-slate-600">
                  {dateFrom === dateTo 
                    ? new Date(dateFrom).toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : `${new Date(dateFrom).toLocaleDateString('id-ID')} - ${new Date(dateTo).toLocaleDateString('id-ID')}`
                  } • 
                  <span className="font-medium text-emerald-600 ml-1">{filteredAbsensi.length} data</span>
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-600">Hadir</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-600">Terlambat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-slate-600">Absen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-600">Izin/Sakit</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Memuat data absensi...</p>
                </div>
              </div>
            ) : filteredAbsensi.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Tidak ada data absensi</p>
                  <p className="text-sm text-slate-500 mt-2">
                    {absensiData.length === 0 
                      ? 'Belum ada data untuk tanggal yang dipilih' 
                      : 'Tidak ada data yang sesuai dengan filter'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Total data: {absensiData.length}, Setelah filter: {filteredAbsensi.length}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {console.log('=== RENDERING TABLE ===', {
                  dataLength: filteredAbsensi.length,
                  data: filteredAbsensi,
                  columns: columns.map(c => c.key)
                })}
                <Table
                  data={filteredAbsensi}
                  columns={columns}
                />
              </>
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredAbsensi.length > 0 && totalPages > 1 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  Menampilkan <span className="font-semibold">{((currentPage - 1) * perPage) + 1}</span> - <span className="font-semibold">{Math.min(currentPage * perPage, total)}</span> dari <span className="font-semibold">{total}</span> data
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ««
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    «
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-emerald-500 text-white'
                              : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    »
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    »»
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Detail Modal - Modern Design */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title=""
        size="xl"
      >
        {selectedRecord && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col">
            {/* Modern Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 p-8 text-white relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <UsersIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Detail Absensi</h2>
                      <p className="text-emerald-100 text-sm">
                        {new Date(selectedRecord.tanggal).toLocaleDateString('id-ID', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Content - 2 Column Layout */}
            <div className="flex-1 overflow-y-auto p-8 pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-6">
                  
                  {/* Employee Info Card */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Informasi Karyawan</h3>
                        <p className="text-sm text-slate-600">Data personal dan identitas</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">NIP</label>
                          <p className="text-slate-900 font-semibold text-lg">{selectedRecord.nip}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama Lengkap</label>
                          <p className="text-slate-900 font-semibold text-lg">{selectedRecord.nama}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Divisi/Unit</label>
                        <p className="text-slate-900 font-semibold text-lg">{selectedRecord.divisi}</p>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Time Card */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Jam Kerja</h3>
                        <p className="text-sm text-slate-600">Rincian waktu kehadiran</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <ClockIcon className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">Jam Masuk</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{selectedRecord.jamMasuk}</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <ClockIcon className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-semibold text-red-700 uppercase tracking-wide">Jam Keluar</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{selectedRecord.jamKeluar || '-'}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <UsersIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Jam Kerja</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{calculateTeachingDuration(selectedRecord.jamMasuk, selectedRecord.jamKeluar)}</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                          <span className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Jam Lembur</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-600">{selectedRecord.jamLembur}h</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Keterangan</h3>
                        <p className="text-sm text-slate-600">Catatan dan informasi tambahan</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-slate-900 leading-relaxed font-medium">
                        {selectedRecord.keterangan || 'Tidak ada keterangan'}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  
                  {/* Photo Section */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <CameraIcon className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Foto Presensi</h3>
                        <p className="text-sm text-slate-600">Foto selfie saat absensi</p>
                      </div>
                    </div>
                    {selectedRecord.foto && selectedRecord.foto.trim() !== '' ? (
                      <div>
                        <div className="relative bg-slate-100 rounded-2xl p-4 border border-slate-200">
                          <img
                            src={selectedRecord.foto}
                            alt="Foto Presensi"
                            className="w-full h-80 object-cover rounded-xl shadow-lg"
                          />
                          <div className="absolute top-6 right-6">
                            <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                              ✓ Terverifikasi
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-slate-600 bg-slate-50 rounded-xl py-3">
                          <CameraIcon className="w-5 h-5" />
                          <span className="font-medium">Foto diambil saat absensi</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                        <div className="flex flex-col items-center justify-center">
                          <CameraIcon className="w-16 h-16 text-slate-300 mb-4" />
                          <p className="text-slate-500 font-semibold text-lg">Tidak ada foto presensi</p>
                          <p className="text-sm text-slate-400 mt-2 text-center">Foto tidak tersedia untuk absensi ini</p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>
              
              {/* Extra spacing for scroll */}
              <div className="h-8"></div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  ID Absensi: <span className="font-mono text-slate-700">{selectedRecord.id}</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Input Absensi Modal */}
      {showInputModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <PlusIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">Input Absensi Manual</h3>
                    <p className="text-emerald-100 text-sm">Input data kehadiran untuk karyawan</p>
                  </div>
                </div>
                <button 
                  onClick={handleCancelInputModal}
                  className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <XCircleIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Pilih Guru */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Pilih Guru <span className="text-red-500">*</span>
                </label>
                <select
                  value={inputForm.id_guru}
                  onChange={(e) => handleInputChange('id_guru', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-slate-900"
                  disabled={loadingGuru}
                >
                  <option value="">-- Pilih Guru --</option>
                  {guruList.map(guru => (
                    <option key={guru.id} value={guru.id}>
                      {guru.nip} - {guru.nama_lengkap}
                    </option>
                  ))}
                </select>
                {loadingGuru && (
                  <p className="text-xs text-slate-500 mt-1">Memuat data guru...</p>
                )}
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-slate-600" />
                  <span>Tanggal Absensi</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={inputForm.tanggal}
                  onChange={(e) => handleInputChange('tanggal', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-slate-900"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status Kehadiran <span className="text-red-500">*</span>
                </label>
                <select
                  value={inputForm.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-slate-900"
                >
                  <option value="hadir">Hadir</option>
                  <option value="sakit">Sakit</option>
                  <option value="izin">Izin</option>
                  <option value="alpha">Alpha</option>
                </select>
              </div>

              {/* Jam Masuk & Keluar - hanya untuk status hadir */}
              {inputForm.status === 'hadir' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-slate-600" />
                      <span>Jam Masuk</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={inputForm.jam_masuk}
                      onChange={(e) => handleInputChange('jam_masuk', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-slate-600" />
                      <span>Jam Keluar</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={inputForm.jam_keluar}
                      onChange={(e) => handleInputChange('jam_keluar', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Info Jam Mengajar - otomatis terhitung */}
              {inputForm.status === 'hadir' && inputForm.jam_masuk && inputForm.jam_keluar && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Jam Mengajar (Otomatis)</p>
                      <p className="text-xs text-blue-700 mt-1">
                        {(() => {
                          const [masukHour, masukMinute] = inputForm.jam_masuk.split(':').map(Number);
                          const [keluarHour, keluarMinute] = inputForm.jam_keluar.split(':').map(Number);
                          const masukInMinutes = masukHour * 60 + masukMinute;
                          const keluarInMinutes = keluarHour * 60 + keluarMinute;
                          const diffInMinutes = keluarInMinutes - masukInMinutes;
                          const hours = Math.max(0, Math.round(diffInMinutes / 60 * 10) / 10);
                          return `${hours} jam (dari ${inputForm.jam_masuk} - ${inputForm.jam_keluar})`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lokasi */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4 text-slate-600" />
                  <span>Lokasi Absensi</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputForm.lokasi}
                    onChange={(e) => handleInputChange('lokasi', e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-slate-900"
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
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <MapPinIcon className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">
                      {isDetectingLocation ? 'Detecting...' : 'Detect'}
                    </span>
                  </button>
                </div>
                {inputForm.lokasi && (
                  <p className="text-xs text-slate-600 mt-1">
                    {inputForm.lokasi.includes('Dalam area sekolah') ? (
                      <span className="text-emerald-600 font-medium">✓ Lokasi valid untuk absensi</span>
                    ) : inputForm.lokasi.includes('Diluar area sekolah') ? (
                      <span className="text-red-600 font-medium">❌ Diluar area sekolah - Absensi tidak dapat disimpan</span>
                    ) : (
                      <span className="text-slate-600">Lokasi terdeteksi</span>
                    )}
                  </p>
                )}
                {!isLocationValid && inputForm.lokasi && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    ⚠️ Lokasi berada di luar radius sekolah (max 0.5km). Silakan pindah ke area sekolah untuk melanjutkan.
                  </p>
                )}
              </div>

              {/* Foto Selfie */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                  <CameraIcon className="w-4 h-4 text-slate-600" />
                  <span>Foto Selfie</span>
                </label>
                {!inputForm.foto ? (
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    disabled={isTakingPhoto}
                    className="w-full px-4 py-12 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all flex flex-col items-center space-y-2 disabled:opacity-50"
                  >
                    {isTakingPhoto ? (
                      <>
                        <div className="w-8 h-8 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                        <span className="text-sm text-slate-600">Mengakses kamera...</span>
                      </>
                    ) : (
                      <>
                        <CameraIcon className="w-8 h-8 text-slate-400" />
                        <span className="text-sm text-slate-600">Tap untuk ambil foto selfie</span>
                        <span className="text-xs text-slate-500">Foto akan diambil dengan kamera depan</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={inputForm.foto}
                        alt="Foto Selfie"
                        className="w-full h-48 object-cover rounded-xl border-2 border-slate-200"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={handleRetakePhoto}
                          className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <CameraIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-emerald-600">
                      <CameraIcon className="w-4 h-4" />
                      <span>Foto berhasil diambil</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                  <DocumentTextIcon className="w-4 h-4 text-slate-600" />
                  <span>Keterangan</span>
                </label>
                <textarea
                  value={inputForm.keterangan}
                  onChange={(e) => handleInputChange('keterangan', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all resize-none text-slate-900"
                  placeholder={`Masukkan keterangan untuk ${inputForm.status}...`}
                />
              </div>

              {/* Debug Info */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-600 grid grid-cols-3 gap-2 text-center">
                  <div>Guru: {inputForm.id_guru ? '✓' : '✗'}</div>
                  <div>Lokasi: {isLocationValid ? '✓ Valid' : '✗ Invalid'}</div>
                  <div>Status: {isSubmitting ? 'Submitting...' : 'Ready'}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={handleCancelInputModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircleIcon className="w-5 h-5" />
                  <span>Batal</span>
                </button>
                <button 
                  onClick={() => {
                    console.log('=== BUTTON CLICK DEBUG ===');
                    console.log('isSubmitting:', isSubmitting);
                    console.log('inputForm.id_guru:', inputForm.id_guru);
                    console.log('isLocationValid:', isLocationValid);
                    console.log('Button should be disabled:', isSubmitting || !inputForm.id_guru || !isLocationValid);
                    handleSubmitAbsensi();
                  }}
                  disabled={isSubmitting || !inputForm.id_guru || !isLocationValid}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Simpan Absensi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PayrollLayout>
  );
};

export default AbsensiKaryawan;
