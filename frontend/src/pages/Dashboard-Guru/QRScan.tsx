import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuruAuth } from '../../hooks/useGuruAuth';
import { guruAuthService } from '../../services/guruAuthService';
import GlobalPageWrapper from '../../components/GlobalPageWrapper';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Camera, MapPin, Clock, CheckCircle, X, RotateCcw, Home } from 'lucide-react';
import toast from 'react-hot-toast';

// Mapping Unit Sekolah ke Koordinat Lokasi
interface UnitLocation {
  nama: string;
  nama_lokasi: string; // Nama lokasi yang akan disimpan ke database
  lat: number;
  lng: number;
  radius: number; // dalam meter
}

// Mapping Unit Sekolah ke Koordinat Lokasi
// Untuk mendapatkan koordinat dari URL Google Maps:
// 1. Buka URL Google Maps yang diberikan
// 2. Klik kanan pada lokasi yang ditandai
// 3. Pilih "What's here?" atau "Ada apa di sini?"
// 4. Copy koordinat (lat, lng) yang muncul
// Atau gunakan tools online seperti: https://www.google.com/maps -> Klik kanan -> "What's here?"

const UNIT_LOCATIONS: Record<string, UnitLocation> = {
  'TKIT': {
    nama: 'TKIT',
    nama_lokasi: 'TKIT ANNUR',
    // TODO: Update koordinat dari URL: https://maps.app.goo.gl/tJUF2VYhgcMyRh7H9?g_st=iw
    lat: -6.3099147, // Koordinat latitude (perlu disesuaikan)
    //-6.311929, // Koordinat latitude (perlu disesuaikan)
    lng: 107.1658775, // Koordinat longitude (perlu disesuaikan)
    //107.166916, // Koordinat longitude (perlu disesuaikan)
    radius: 200 // 100 meter radius - toleransi jarak dari lokasi unit
  },
  'Tata Usaha': {
    nama: 'Tata Usaha',
    // Dipakai juga untuk unit kerja "TU Islam Annur" (satu area — lihat validateLocation)
    nama_lokasi: 'TU ANNUR PUSAT',
    // TODO: -6.3099147,107.1658775 Update koordinat dari URL: https://maps.app.goo.gl/tJUF2VYhgcMyRh7H9?g_st=iw
    lat: -6.3099147, // Koordinat latitude (perlu disesuaikan)
    lng: 107.1658775, // Koordinat longitude (perlu disesuaikan)
    radius: 200 // 20 meter radius - toleransi jarak dari lokasi unit
  },
  'Daycare': {
    nama: 'Daycare',
    nama_lokasi: 'Daycare Annur Pusat',
    // TODO: -6.3099147,107.1658775 Update koordinat dari URL: https://maps.app.goo.gl/tJUF2VYhgcMyRh7H9?g_st=iw
    lat: -6.3099147, // Koordinat latitude (perlu disesuaikan)
    lng: 107.1658775, // Koordinat longitude (perlu disesuaikan)
    radius: 200 // 20 meter radius - toleransi jarak dari lokasi unit
  },
  'Divisi': {
    nama: 'Divisi',
    nama_lokasi: 'Divisi Annur Pusat',
    // TODO: -6.3099147,107.1658775 Update koordinat dari URL: https://maps.app.goo.gl/tJUF2VYhgcMyRh7H9?g_st=iw
    lat: -6.3099147, // Koordinat latitude (perlu disesuaikan)
    lng: 107.1658775, // Koordinat longitude (perlu disesuaikan)
    radius: 200 // 20 meter radius - toleransi jarak dari lokasi unit
  },
  'SDIT': {
    nama: 'SDIT',
    nama_lokasi: 'SDIT Annur',
    // TODO: Update koordinat dari URL: https://maps.app.goo.gl/maLA2VyemXxXX6eE8?g_st=iw
    lat: -6.309948, //-6.269167, // Koordinat latitude (perlu disesuaikan)
    lng: 107.166074, // Koordinat longitude (perlu disesuaikan)
    radius: 200
  },
  'SMPIT': {
    nama: 'SMPIT',
    nama_lokasi: 'SMPIT Annur',
    // TODO: Update koordinat dari URL: https://maps.app.goo.gl/cdXFBHDnhsBXpLE87?g_st=iw
    lat: -6.311854, // Koordinat latitude (perlu disesuaikan)
    lng: 107.166901, // Koordinat longitude (perlu disesuaikan)
    radius: 200
  },
  'SMAIT': {
    nama: 'SMAIT',
    nama_lokasi: 'SMAIT Annur',
    // TODO: Update koordinat dari URL: https://maps.app.goo.gl/vSyausdDdGCfKaRf8?g_st=iw
    lat: -6.312543, // Koordinat latitude (perlu disesuaikan)
    lng: 107.167354, // Koordinat longitude (perlu disesuaikan)
    radius: 200
  }
};

// Fungsi untuk menghitung jarak antara dua koordinat (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Radius bumi dalam meter
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Jarak dalam meter
};

const QRScan: React.FC = () => {
  const { guru } = useGuruAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [validLocation, setValidLocation] = useState<{nama: string, nama_lokasi: string, distance: number} | null>(null);
  const [isLocationValid, setIsLocationValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attendanceMode, setAttendanceMode] = useState<'masuk' | 'keluar' | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState<{
    sudah_masuk: boolean;
    sudah_keluar: boolean;
    jam_masuk: string | null;
    jam_keluar: string | null;
  }>({
    sudah_masuk: false,
    sudah_keluar: false,
    jam_masuk: null,
    jam_keluar: null
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Validasi lokasi berdasarkan unit sekolah guru
  const validateLocation = React.useCallback((lat: number, lng: number): {valid: boolean, location?: {nama: string, nama_lokasi: string, distance: number}} => {
    if (!guru?.unit_sekolah?.nama) {
      return { valid: false };
    }

    const unitSekolahNama = guru.unit_sekolah.nama;
    
    // Cari mapping unit sekolah yang cocok
    let matchedLocation: UnitLocation | null = null;
    
    // Cek berdasarkan nama unit sekolah (bisa mengandung "Tata Usaha", "TU Islam ...", "TKIT", "SDIT", "SMPIT", "SMAIT", "Daycare", "Divisi")
    // TU Islam Annur: satu area dengan titik Tata Usaha / TU Annur Pusat
    if (
      unitSekolahNama.includes('TU Islam') ||
      unitSekolahNama.includes('Islam Annur') ||
      unitSekolahNama.includes('Tata Usaha')
    ) {
      matchedLocation = UNIT_LOCATIONS['Tata Usaha'];
    } else if (unitSekolahNama.includes('Daycare')) {
      matchedLocation = UNIT_LOCATIONS['Daycare'];
    } else if (unitSekolahNama.includes('Divisi')) {
      matchedLocation = UNIT_LOCATIONS['Divisi'];
    } else if (unitSekolahNama.includes('TKIT')) {
      matchedLocation = UNIT_LOCATIONS['TKIT'];
    } else if (unitSekolahNama.includes('SDIT')) {
      matchedLocation = UNIT_LOCATIONS['SDIT'];
    } else if (unitSekolahNama.includes('SMPIT')) {
      matchedLocation = UNIT_LOCATIONS['SMPIT'];
    } else if (unitSekolahNama.includes('SMAIT')) {
      matchedLocation = UNIT_LOCATIONS['SMAIT'];
    }

    if (!matchedLocation) {
      console.warn('Unit sekolah tidak ditemukan di mapping:', unitSekolahNama);
      return { valid: false };
    }

    // Hitung jarak dari lokasi saat ini ke lokasi unit sekolah
    const distance = calculateDistance(lat, lng, matchedLocation.lat, matchedLocation.lng);
    
    // Valid jika dalam radius yang ditentukan
    const valid = distance <= matchedLocation.radius;
    
    // Debug logging untuk validasi lokasi
    console.log('Validasi Lokasi:', {
      unitSekolah: unitSekolahNama,
      matchedLocation: matchedLocation.nama,
      koordinatUnit: { lat: matchedLocation.lat, lng: matchedLocation.lng },
      koordinatUser: { lat, lng },
      jarak: Math.round(distance),
      radius: matchedLocation.radius,
      valid: valid
    });
    
    return {
      valid,
      location: {
        nama: matchedLocation.nama,
        nama_lokasi: matchedLocation.nama_lokasi,
        distance: Math.round(distance)
      }
    };
  }, [guru?.unit_sekolah?.nama]);

  // Get current location and validate
  useEffect(() => {
    if (!navigator.geolocation || !guru?.unit_sekolah?.nama) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Validasi lokasi
        const validation = validateLocation(latitude, longitude);
        
        setLocation({
          lat: latitude,
          lng: longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        });

        if (validation.valid && validation.location) {
          setValidLocation(validation.location);
          setIsLocationValid(true);
        } else {
          setValidLocation(null);
          setIsLocationValid(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.');
        // Set default location jika gagal
        setLocation({
          lat: -6.225920,
          lng: 106.807296,
          address: 'Lokasi tidak tersedia'
        });
        setValidLocation(null);
        setIsLocationValid(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [guru?.unit_sekolah?.nama, validateLocation]);

  // Fetch attendance status for today
  const fetchAttendanceStatus = async () => {
    if (!guru?.id) return;
    
    setIsLoadingStatus(true);
    try {
      console.log('Mengambil status absensi hari ini untuk guru ID:', guru.id);
      
      const token = guruAuthService.getToken();
      const response = await fetch(`/api/master-data/absensi/today?id_guru=${guru.id}&_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const result = await response.json();
      console.log('API Response getTodayAttendance:', result);

      if (result.success && result.data) {
        const todayAbsensi = result.data;
        setAttendanceStatus({
          sudah_masuk: !!todayAbsensi.jam_masuk,
          sudah_keluar: !!todayAbsensi.jam_keluar,
          jam_masuk: todayAbsensi.jam_masuk,
          jam_keluar: todayAbsensi.jam_keluar
        });
        console.log('Absensi hari ini ditemukan:', todayAbsensi);
        console.log('Status yang di-set:', {
          sudah_masuk: !!todayAbsensi.jam_masuk,
          sudah_keluar: !!todayAbsensi.jam_keluar,
          jam_masuk: todayAbsensi.jam_masuk,
          jam_keluar: todayAbsensi.jam_keluar
        });
      } else {
        setAttendanceStatus({
          sudah_masuk: false,
          sudah_keluar: false,
          jam_masuk: null,
          jam_keluar: null
        });
        console.log('Belum ada absensi hari ini');
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
      // Set status to false on error
      setAttendanceStatus({
        sudah_masuk: false,
        sudah_keluar: false,
        jam_masuk: null,
        jam_keluar: null
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };


  // Fetch attendance status when component mounts
  useEffect(() => {
    if (guru?.id) {
      // Force refresh dengan delay untuk memastikan cache ter-clear
      setTimeout(() => {
        fetchAttendanceStatus();
      }, 100);
    }
  }, [guru?.id]);

  // Fungsi mengambil foto dengan countdown preparation
  const handleTakePhoto = () => {
    setIsPreparingPhoto(true);
    setCountdown(5); // Start countdown from 3 seconds
    
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
      
      // Wait for video to load first
      video.addEventListener('loadedmetadata', () => {
        // Start countdown timer
        let countdownValue = 5;
        const countdownTimer = setInterval(() => {
          countdownValue--;
          setCountdown(countdownValue);
          
          if (countdownValue <= 0) {
            clearInterval(countdownTimer);
            setIsPreparingPhoto(false);
            setIsTakingPhoto(true);
            
            // Take photo after countdown
            setTimeout(() => {
              if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                // Compress more (0.5 quality instead of 0.8)
                const photoDataUrl = canvas.toDataURL('image/jpeg', 0.5);
                
                setCapturedImage(photoDataUrl);
                toast.success('Foto berhasil diambil!');
                
                // Stop camera stream
                stream.getTracks().forEach(track => track.stop());
                setIsTakingPhoto(false);
              }
            }, 100);
          }
        }, 1000);
      });
    })
    .catch((error) => {
      console.error('Error accessing camera:', error);
      setIsPreparingPhoto(false);
      setIsTakingPhoto(false);
      setCountdown(0);
      toast.error('Gagal mengakses kamera. Pastikan izinkan akses kamera.');
    });
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    handleTakePhoto();
  };

  const handleCancelPhoto = () => {
    setIsPreparingPhoto(false);
    setIsTakingPhoto(false);
    setCountdown(0);
    toast.success('Pengambilan foto dibatalkan');
  };

  const selectPhotoFromGallery = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitAttendance = async (mode: 'masuk' | 'keluar') => {
    if (!capturedImage) {
      toast.error('Silakan ambil foto terlebih dahulu');
      return;
    }

    if (!location) {
      toast.error('Lokasi tidak tersedia');
      return;
    }

    // Validasi lokasi harus sesuai dengan unit sekolah guru
    if (!isLocationValid || !validLocation) {
      toast.error(`Lokasi Anda tidak sesuai dengan Unit Sekolah Anda. Silakan absen di lokasi ${guru?.unit_sekolah?.nama || 'Unit Sekolah Anda'}.`);
      return;
    }

    // Re-validasi lokasi sebelum submit (untuk memastikan masih valid)
    const reValidation = validateLocation(location.lat, location.lng);
    if (!reValidation.valid || !reValidation.location) {
      toast.error('Lokasi Anda tidak valid. Pastikan Anda berada di lokasi Unit Sekolah yang benar.');
      return;
    }

    setIsLoading(true);

    try {
      // Get current time for accurate check-in time using Jakarta timezone
      const now = new Date();
      // Gunakan pendekatan yang lebih sederhana
      const currentTime = now.toTimeString().split(' ')[0]; // Format: HH:mm:ss
      
      // Ambil nama_lokasi dari validLocation atau reValidation
      const namaLokasi = validLocation?.nama_lokasi || reValidation.location?.nama_lokasi || '';
      
      // Kirim data presensi dengan foto dan lokasi
      const attendanceData: any = {
        id_guru: guru?.id,
        lokasi: `${location.lat},${location.lng} - ${location.address}`,
        foto: capturedImage, // Kirim foto sebagai base64 string
        latitude: location.lat,
        longitude: location.lng,
        nama_lokasi: namaLokasi // Nama lokasi untuk disimpan ke database
      };
      
      // Hanya set jam_masuk untuk mode masuk, bukan untuk mode keluar
      if (mode === 'masuk') {
        attendanceData.jam_masuk = currentTime; // Send accurate check-in time
      }

      // Gunakan endpoint yang berbeda untuk masuk dan keluar
      let apiUrl = '';
      
      if (mode === 'masuk') {
        // Untuk absen masuk, gunakan endpoint mobile-checkin yang lebih robust
        apiUrl = '/api/master-data/absensi/mobile-checkin';
        // Remove fields that are not needed for mobile-checkin endpoint
        delete attendanceData.tanggal;
        delete attendanceData.status;
        delete attendanceData.jam_keluar;
        delete attendanceData.jam_mengajar;
        delete attendanceData.keterangan;
        // Keep jam_masuk as it contains the accurate check-in time
      } else {
        // Untuk absen keluar, hapus jam_masuk agar tidak meng-overwrite jam masuk asli
        delete attendanceData.jam_masuk;
        
        // Untuk absen keluar, gunakan endpoint today yang lebih reliable
        const token = guruAuthService.getToken();
        const checkResponse = await fetch(`/api/master-data/absensi/today?id_guru=${guru?.id}&_t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        const checkResult = await checkResponse.json();
        console.log('Check absensi untuk keluar:', checkResult);
        
        // Validasi: harus ada data absensi dan harus ada jam_masuk
        if (!checkResult.success || !checkResult.data) {
          throw new Error('Tidak ada absensi masuk hari ini. Silakan absen masuk terlebih dahulu.');
        }

        const todayAbsensi = checkResult.data;
        
        // Cek apakah ada jam_masuk (penting untuk validasi)
        if (!todayAbsensi.jam_masuk) {
          throw new Error('Tidak ada absensi masuk hari ini. Silakan absen masuk terlebih dahulu.');
        }

        // Cek apakah sudah keluar
        if (todayAbsensi.jam_keluar) {
          throw new Error('Anda sudah melakukan absen keluar hari ini.');
        }

        const absensiId = todayAbsensi.id;
        const existingKeterangan = todayAbsensi.keterangan || '';
        const existingJamMasuk = todayAbsensi.jam_masuk;
        apiUrl = `/api/master-data/absensi/${absensiId}`;
        
        // Get current time for accurate check-out time using Jakarta timezone
        const checkoutTime = new Date();
        attendanceData.jam_keluar = checkoutTime.toTimeString().split(' ')[0]; // Format: HH:mm:ss
        
        // Calculate teaching hours from check-in and check-out time (in minutes)
        let jamMengajar = 0;
        if (existingJamMasuk && attendanceData.jam_keluar) {
          const [masukHour, masukMinute, masukSecond] = existingJamMasuk.split(':').map(Number);
          const [keluarHour, keluarMinute, keluarSecond] = attendanceData.jam_keluar.split(':').map(Number);
          
          // Convert to total minutes including seconds (more precise calculation)
          const masukInMinutes = masukHour * 60 + masukMinute + (masukSecond / 60);
          const keluarInMinutes = keluarHour * 60 + keluarMinute + (keluarSecond / 60);
          const diffInMinutes = keluarInMinutes - masukInMinutes;
          
          // If check-out time is same as check-in, assume minimum 1 minute of teaching
          if (diffInMinutes <= 0) {
            jamMengajar = 1; // Minimum 1 minute
          } else {
            jamMengajar = Math.max(1, Math.round(diffInMinutes)); // At least 1 minute, round to integer
          }
        }
        attendanceData.jam_mengajar = jamMengajar;
        
        // Gabungkan keterangan masuk dengan keterangan keluar
        attendanceData.keterangan = existingKeterangan ? 
          `${existingKeterangan} | Presensi keluar via QR Scan` : 
          'Presensi masuk via QR Scan | Presensi keluar via QR Scan';
      }

      console.log('Sending attendance data:', attendanceData);
      console.log('API URL:', apiUrl);
      console.log('Token available:', !!localStorage.getItem('guru_token'));
      console.log('Guru ID:', guru?.id);
      console.log('Guru data:', guru);
      console.log('Time format check:', {
        jam_masuk: attendanceData.jam_masuk,
        jam_keluar: attendanceData.jam_keluar,
        mode: mode,
        keterangan: attendanceData.keterangan,
        expected_format: 'H:i (e.g., 14:30)'
      });

      const token = guruAuthService.getToken();
      const apiResponse = await fetch(apiUrl, {
        method: mode === 'masuk' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json'
        },
        body: JSON.stringify(attendanceData)
      });

      // Check if response is ok and content type is JSON
      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      const contentType = apiResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await apiResponse.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error('Server mengembalikan response yang tidak valid');
      }

      const result = await apiResponse.json();

      if (result.success) {
        toast.success(`Absen ${mode} berhasil!`);
        setAttendanceMode(null);
        setCapturedImage(null);
        // Refresh attendance status after successful submission
        await fetchAttendanceStatus();
        // Delay untuk memastikan data terupdate di database
        setTimeout(() => {
          navigate('/guru/dashboard');
        }, 1000);
      } else {
        toast.error(result.message || `Gagal absen ${mode}`);
      }
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      
      // Handle specific error types
      if (error.message.includes('HTTP error! status: 404')) {
        toast.error('Endpoint API tidak ditemukan. Silakan hubungi administrator.');
      } else if (error.message.includes('HTTP error! status: 500')) {
        toast.error('Terjadi kesalahan server. Silakan coba lagi nanti.');
      } else if (error.message.includes('Server mengembalikan response yang tidak valid')) {
        toast.error('Server mengembalikan response yang tidak valid. Periksa koneksi internet.');
      } else if (error.message.includes('Failed to fetch')) {
        toast.error('Gagal terhubung ke server. Periksa koneksi internet.');
      } else {
        toast.error(`Terjadi kesalahan: ${error.message || 'Gagal mengirim data'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!guru) {
    return (
      <ProtectedRoute>
        <GlobalPageWrapper>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat...</p>
            </div>
          </div>
        </GlobalPageWrapper>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <GlobalPageWrapper>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/guru/dashboard')}
                className="text-white hover:text-green-200"
              >
                <Home className="w-6 h-6" />
              </button>
              <div className="text-center">
                <h1 className="text-white text-xl font-bold">Presensi</h1>
                <p className="text-green-100 text-sm">{guru.nama_lengkap}</p>
              </div>
              <div className="w-6"></div>
            </div>
          </header>

          {/* Date and Time */}
          <div className="px-4 py-4 bg-white border-b">
            <div className="text-center">
              <p className="text-gray-600 text-sm">{formatDate(currentTime)}</p>
              <p className="text-2xl font-bold text-gray-800">{formatTime(currentTime)}</p>
            </div>
          </div>

          {/* Location */}
          <div className="px-4 py-3 bg-white border-b">
            <div className="flex items-center space-x-2">
              <MapPin className={`w-5 h-5 ${isLocationValid ? 'text-green-600' : 'text-red-600'}`} />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Lokasi Saat Ini</p>
                {validLocation && isLocationValid ? (
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      ✓ {validLocation.nama}
                    </p>
                    <p className="text-xs text-gray-500">
                      Jarak: {validLocation.distance} meter dari lokasi unit
                    </p>
                  </div>
                ) : location ? (
                  <div>
                    <p className="text-sm font-medium text-red-700">
                      ⚠ Lokasi tidak sesuai dengan Unit Sekolah Anda
                    </p>
                    <p className="text-xs text-gray-500">
                      {location.address}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Silakan absen di lokasi {guru?.unit_sekolah?.nama || 'Unit Sekolah Anda'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-gray-800">
                    Mendapatkan lokasi...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Status */}
          {!isLoadingStatus && (
            <div className="px-4 py-3 bg-white border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      attendanceStatus.sudah_masuk ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      Masuk: {attendanceStatus.jam_masuk || 'Belum'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      attendanceStatus.sudah_keluar ? 'bg-orange-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      Keluar: {attendanceStatus.jam_keluar || 'Belum'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    console.log('Manual refresh triggered');
                    // Clear state terlebih dahulu
                    setAttendanceStatus({
                      sudah_masuk: false,
                      sudah_keluar: false,
                      jam_masuk: null,
                      jam_keluar: null
                    });
                    // Force refresh
                    setTimeout(() => {
                      fetchAttendanceStatus();
                    }, 200);
                  }}
                  className="text-blue-600 text-sm hover:text-blue-800 font-semibold"
                >
                  🔄 Refresh
                </button>
              </div>
              {/* Debug Info */}
              <div className="mt-2 text-xs text-gray-500">
                Tanggal hari ini: {new Date().toLocaleDateString('en-CA')} | 
                Status: {attendanceStatus.sudah_masuk ? 'Sudah masuk' : 'Belum masuk'} / 
                {attendanceStatus.sudah_keluar ? 'Sudah keluar' : 'Belum keluar'}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="px-4 py-6">
            {!attendanceMode ? (
              /* Mode Selection */
              <div className="space-y-4">
                <div className="text-center mb-8">
                  <Camera className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Pilih Mode Presensi</h2>
                  <p className="text-gray-600">Silakan pilih jenis presensi yang akan dilakukan</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => setAttendanceMode('masuk')}
                    disabled={attendanceStatus.sudah_masuk || isLoadingStatus || !isLocationValid}
                    className={`p-6 rounded-xl shadow-lg transition-colors ${
                      attendanceStatus.sudah_masuk || isLoadingStatus || !isLocationValid
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <Clock className="w-8 h-8" />
                      <div className="text-left">
                        <p className="text-lg font-bold">Absen Masuk</p>
                        <p className="text-sm opacity-90">
                          {!isLocationValid 
                            ? 'Lokasi tidak sesuai dengan Unit Sekolah Anda'
                            : attendanceStatus.sudah_masuk 
                            ? `Sudah absen masuk (${attendanceStatus.jam_masuk})`
                            : 'Mulai bekerja hari ini'
                          }
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setAttendanceMode('keluar')}
                    disabled={attendanceStatus.sudah_keluar || isLoadingStatus || !attendanceStatus.sudah_masuk || !isLocationValid}
                    className={`p-6 rounded-xl shadow-lg transition-colors ${
                      attendanceStatus.sudah_keluar || isLoadingStatus || !attendanceStatus.sudah_masuk || !isLocationValid
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <Clock className="w-8 h-8" />
                      <div className="text-left">
                        <p className="text-lg font-bold">Absen Keluar</p>
                        <p className="text-sm opacity-90">
                          {!isLocationValid
                            ? 'Lokasi tidak sesuai dengan Unit Sekolah Anda'
                            : attendanceStatus.sudah_keluar
                            ? `Sudah absen keluar (${attendanceStatus.jam_keluar})`
                            : attendanceStatus.sudah_masuk
                            ? 'Selesai bekerja hari ini'
                            : 'Belum absen masuk hari ini'
                          }
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* Camera Mode */
              <div className="space-y-6">
                {/* Mode Header */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Absen {attendanceMode === 'masuk' ? 'Masuk' : 'Keluar'}
                  </h2>
                  <p className="text-gray-600">Ambil foto selfie untuk presensi</p>
                </div>

                {/* Photo Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {!capturedImage ? (
                    /* Photo Capture Button */
                    <div className="p-8">
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Ambil Foto Selfie</h3>
                        <p className="text-gray-600 mb-6">Klik tombol di bawah untuk mengambil foto selfie untuk presensi</p>
                        
                        <button
                          type="button"
                          onClick={handleTakePhoto}
                          disabled={isTakingPhoto || isPreparingPhoto}
                          className="w-full px-8 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all flex flex-col items-center space-y-2 disabled:opacity-50"
                        >
                          {isPreparingPhoto ? (
                            <>
                              <div className="relative">
                                <div className="w-20 h-20 border-4 border-green-200 rounded-full"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-3xl font-bold text-green-600">{countdown}</span>
                                </div>
                              </div>
                              <span className="text-sm text-gray-600">Bersiap-siap...</span>
                              <span className="text-xs text-gray-500">Foto akan diambil dalam {countdown} detik</span>
                            </>
                          ) : isTakingPhoto ? (
                            <>
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                              <span className="text-sm text-gray-600">Mengambil foto...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-gray-400" />
                              <span className="text-sm text-gray-600">Tap untuk ambil foto selfie</span>
                              <span className="text-xs text-gray-500">Foto akan diambil dengan kamera depan</span>
                            </>
                          )}
                        </button>
                        
                        <div className="mt-6 flex justify-center space-x-4">
                          {isPreparingPhoto ? (
                            <button
                              onClick={handleCancelPhoto}
                              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                            >
                              <X className="w-5 h-5" />
                              <span>Batal</span>
                            </button>
                          ) : (
                            <button
                              onClick={selectPhotoFromGallery}
                              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                            >
                              <RotateCcw className="w-5 h-5" />
                              <span>Pilih dari Galeri</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Captured Photo */
                    <div className="relative">
                      <img
                        src={capturedImage}
                        alt="Captured photo"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={handleRetakePhoto}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Photo Controls */}
                      <div className="p-4 bg-gray-50">
                        <div className="flex justify-center space-x-4">
                          <button
                            onClick={handleRetakePhoto}
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                          >
                            <RotateCcw className="w-5 h-5" />
                            <span>Ambil Ulang</span>
                          </button>
                          <button
                            onClick={() => submitAttendance(attendanceMode)}
                            disabled={isLoading}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {isLoading ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                              <CheckCircle className="w-5 h-5" />
                            )}
                            <span>{isLoading ? 'Mengirim...' : `Absen ${attendanceMode === 'masuk' ? 'Masuk' : 'Keluar'}`}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Button */}
                <button
                  onClick={() => setAttendanceMode(null)}
                  className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
                >
                  Kembali
                </button>
              </div>
            )}
          </div>


          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* Bottom Padding */}
          <div className="h-20"></div>
        </div>
      </GlobalPageWrapper>
    </ProtectedRoute>
  );
};

export default QRScan;
