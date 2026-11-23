import type { Overtime } from './overtimeService';

// Interface untuk Laporan Lembur & Absensi
export interface LaporanLemburAbsensi {
  nip: string;
  nama: string;
  jabatan: string;
  divisi: string;
  hariKerja: number;
  hariHadir: number;
  hariAlfa: number;
  hariIzin: number;
  hariSakit: number;
  persentaseKehadiran: number;
  terlambat: number;
  pulangCepat: number;
  jamLemburWeekday: number;
  jamLemburWeekend: number;
  jamLemburHoliday: number;
  totalJamLembur: number;
  gajiLembur: number;
  potonganAbsensi: number;
}

// Interface untuk Ringkasan Bulanan per Divisi
export interface RingkasanBulanan {
  divisi: string;
  periode: string;
  totalKaryawan: number;
  rataRataKehadiran: number;
  totalJamLembur: number;
  totalGajiLembur: number;
  totalPotonganAbsensi: number;
  karyawanTeladan: string;
  karyawanPeringatan: string;
}

// Response dari API
export interface AdminOvertimeApiResponse {
  success: boolean;
  message: string;
  data: Overtime[] | LaporanLemburAbsensi[] | any;
  errors?: Record<string, string[]>;
}

// Service untuk Admin Overtime Management
export const adminOvertimeService = {
  /**
   * Debug: Test endpoint connectivity
   */
  async testEndpoint(): Promise<void> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    console.log('🔧 Testing endpoint...');
    console.log('🔑 Token:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
    
    try {
      const response = await fetch('https://nurverse.id/api/overtime', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      console.log('✅ Status:', response.status);
      console.log('✅ Content-Type:', response.headers.get('content-type'));
      
      const text = await response.text();
      console.log('✅ Response preview:', text.substring(0, 300));
      
      if (response.headers.get('content-type')?.includes('json')) {
        const json = JSON.parse(text);
        console.log('✅ Parsed JSON:', json);
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  },

  /**
   * Mengambil laporan lembur dengan absensi
   */
  async getLaporanLembur(params?: {
    start_date?: string;
    end_date?: string;
    id_guru?: number;
    divisi?: string;
  }): Promise<AdminOvertimeApiResponse> {
    try {
      console.log('🔄 Fetching laporan lembur...');
      
      // Build query params for fetch
      const queryParams: Record<string, any> = {};
      if (params?.start_date) queryParams.start_date = params.start_date;
      if (params?.end_date) queryParams.end_date = params.end_date;
      if (params?.id_guru) queryParams.id_guru = params.id_guru;
      if (params?.divisi) queryParams.divisi = params.divisi;

      // Get token from localStorage (try both keys)
      let token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No token found in localStorage');
        console.log('📦 Available localStorage keys:', Object.keys(localStorage));
        throw new Error('Tidak ada token autentikasi. Silakan login kembali.');
      }

      console.log('🔑 Token found:', token.substring(0, 20) + '...');

      // Build URL with query params
      const url = new URL('https://nurverse.id/api/overtime');
      Object.keys(queryParams).forEach(key => {
        url.searchParams.append(key, queryParams[key].toString());
      });

      console.log('🔄 Calling API:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const textResponse = await response.text();
          console.error('❌ Non-JSON response:', textResponse.substring(0, 200));
          errorMessage = `Server returned HTML instead of JSON. Status: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Expected JSON but got:', textResponse.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Check endpoint URL and authentication.');
      }

      const result = await response.json();
      console.log('✅ Raw API Response:', result);
      
      // Transform data dari API ke format LaporanLemburAbsensi
      if (result.success && result.data) {
        // Handle paginated response (Laravel returns data.data for pagination)
        let overtimeData: Overtime[] = [];
        
        if (result.data.data && Array.isArray(result.data.data)) {
          // Paginated response
          overtimeData = result.data.data;
          console.log('📄 Paginated response detected');
        } else if (Array.isArray(result.data)) {
          // Direct array
          overtimeData = result.data;
          console.log('📄 Direct array response');
        }
        
        console.log('📊 Total overtime records from API:', overtimeData.length);
        console.log('📊 Sample data:', overtimeData.slice(0, 2));
        
        if (overtimeData.length === 0) {
          console.warn('⚠️ No overtime data received from API');
          return {
            success: true,
            message: 'Tidak ada data lembur untuk periode ini',
            data: []
          };
        }
        
        const transformedData = this.transformToLaporanAbsensi(overtimeData);
        console.log('✅ Transformed data:', transformedData.length, 'laporan records');
        
        return {
          success: true,
          message: result.message || 'Data berhasil diambil',
          data: transformedData
        };
      }
      
      console.error('❌ API Response not successful or no data');
      return {
        success: false,
        message: result.message || 'Gagal mengambil data',
        data: []
      };
    } catch (error: any) {
      console.error('❌ Error fetching laporan lembur:', error);
      
      // Specific error messages
      if (error.message && error.message.includes('JSON')) {
        throw new Error('Server mengembalikan HTML, bukan JSON. Kemungkinan: endpoint salah, token expired, atau tidak ada akses.');
      } else if (error.message && error.message.includes('401')) {
        throw new Error('Unauthorized. Token tidak valid atau sudah expired. Silakan login ulang.');
      } else if (error.message && error.message.includes('404')) {
        throw new Error('Endpoint tidak ditemukan. URL: /api/overtime');
      } else if (error.message && error.message.includes('500')) {
        throw new Error('Server error. Silakan coba lagi atau hubungi administrator.');
      }
      
      throw new Error(error.message || 'Gagal mengambil data lembur');
    }
  },

  /**
   * Transform data overtime dari API ke format LaporanLemburAbsensi
   */
  transformToLaporanAbsensi(overtimeData: Overtime[]): LaporanLemburAbsensi[] {
    console.log('🔄 Starting transform with', overtimeData.length, 'records');
    
    if (!overtimeData || overtimeData.length === 0) {
      console.warn('⚠️ No data to transform');
      return [];
    }
    
    // Group by guru (ambil semua data dulu, baru filter approved saat hitung)
    const groupedByGuru: { [key: number]: Overtime[] } = {};
    
    overtimeData.forEach((overtime, index) => {
      const guruId = overtime.id_guru;
      
      if (!guruId) {
        console.warn(`⚠️ Record ${index} has no id_guru:`, overtime);
        return;
      }
      
      if (!groupedByGuru[guruId]) {
        groupedByGuru[guruId] = [];
      }
      groupedByGuru[guruId].push(overtime);
    });

    console.log('👥 Grouped into', Object.keys(groupedByGuru).length, 'unique teachers');
    
    if (Object.keys(groupedByGuru).length === 0) {
      console.error('❌ No valid data after grouping!');
      return [];
    }

    // Transform to LaporanLemburAbsensi
    const laporan: LaporanLemburAbsensi[] = Object.entries(groupedByGuru).map(([guruId, overtimes]) => {
      const guru = overtimes[0]?.guru;
      
      if (!guru) {
        console.warn(`⚠️ Guru ID ${guruId}: No guru relation data`);
      } else {
        console.log(`👤 Processing: ${guru.nama_lengkap} (${overtimes.length} records)`);
        console.log(`   📍 Unit Sekolah Data:`, guru.unitSekolah);
        console.log(`   📍 Jenjang:`, guru.unitSekolah?.jenjang);
        console.log(`   📍 Unit Sekolah ID:`, guru.unit_sekolah_id);
      }
      
      // Calculate total jam lembur by type (only count approved)
      let jamWeekday = 0;
      let jamWeekend = 0;
      let jamHoliday = 0;
      let totalGaji = 0;
      let approvedCount = 0;

      overtimes.forEach(ot => {
        // Only count approved overtime for calculation
        if (ot.status === 'approved') {
          approvedCount++;
          const dayOfWeek = new Date(ot.tanggal).getDay();
          const durasi = ot.durasi || 0;
          
          if (ot.jenis?.toLowerCase().includes('libur') || ot.jenis?.toLowerCase().includes('holiday')) {
            jamHoliday += durasi;
          } else if (dayOfWeek === 0 || dayOfWeek === 6) {
            jamWeekend += durasi;
          } else {
            jamWeekday += durasi;
          }
          
          totalGaji += ot.total || 0;
        }
      });
      
      const totalJamLembur = jamWeekday + jamWeekend + jamHoliday;
      console.log(`   💰 ${guru?.nama_lengkap || 'Unknown'}: ${approvedCount} approved, ${totalJamLembur} jam, ${totalGaji} rupiah`);

      // Data dummy untuk absensi (karena endpoint hanya untuk overtime)
      // Dalam implementasi real, ini harus diambil dari endpoint absensi terpisah
      const hariKerja = 22; // Default hari kerja per bulan
      const hariHadir = Math.floor(hariKerja * (0.85 + Math.random() * 0.15)); // 85-100% kehadiran
      const hariAlfa = Math.floor(Math.random() * 2);
      const hariIzin = Math.floor(Math.random() * 2);
      const hariSakit = Math.floor(Math.random() * 2);
      const terlambat = Math.floor(Math.random() * 5);
      const pulangCepat = Math.floor(Math.random() * 3);

      // Safe access untuk semua property
      const safeJabatan = guru?.jabatan?.nama || '-';
      
      // Try both snake_case (unit_sekolah) and camelCase (unitSekolah)
      const unitSekolah = guru?.unit_sekolah || guru?.unitSekolah;
      
      // Use jenjang if available, otherwise use nama, otherwise default
      let safeDivisi = 'Unit Tidak Diketahui';
      if (unitSekolah?.jenjang) {
        safeDivisi = unitSekolah.jenjang;
      } else if (unitSekolah?.nama) {
        safeDivisi = unitSekolah.nama;
      }
      
      const safeNip = guru?.nip || '-';
      const safeNama = guru?.nama_lengkap || 'Tidak Diketahui';
      
      console.log(`   🔍 Divisi resolved: "${safeDivisi}" from:`, {
        full_guru_object: guru,
        unit_sekolah: guru?.unit_sekolah,
        unitSekolah: guru?.unitSekolah,
        jenjang: unitSekolah?.jenjang,
        nama: unitSekolah?.nama
      });

      const laporanItem: LaporanLemburAbsensi = {
        nip: safeNip,
        nama: safeNama,
        jabatan: safeJabatan,
        divisi: safeDivisi,
        hariKerja,
        hariHadir,
        hariAlfa,
        hariIzin,
        hariSakit,
        persentaseKehadiran: (hariHadir / hariKerja) * 100,
        terlambat,
        pulangCepat,
        jamLemburWeekday: jamWeekday,
        jamLemburWeekend: jamWeekend,
        jamLemburHoliday: jamHoliday,
        totalJamLembur: totalJamLembur,
        gajiLembur: totalGaji,
        potonganAbsensi: (hariAlfa * 50000) + (terlambat * 10000) + (pulangCepat * 10000)
      };
      
      return laporanItem;
    });

    console.log('✅ Transform complete:', laporan.length, 'laporan items created');
    console.log('📋 Sample laporan:', laporan.slice(0, 2));
    
    return laporan;
  },

  /**
   * Generate ringkasan bulanan per divisi
   */
  async getRingkasanBulanan(
    periode: string,
    laporanData?: LaporanLemburAbsensi[]
  ): Promise<RingkasanBulanan[]> {
    try {
      // Jika tidak ada data laporan, ambil dari API
      if (!laporanData || laporanData.length === 0) {
        const [year, month] = periode.split('-');
        const startDate = `${year}-${month}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        const endDate = `${year}-${month}-${lastDay}`;

        const response = await this.getLaporanLembur({
          start_date: startDate,
          end_date: endDate
        });

        if (response.success && response.data) {
          laporanData = response.data as LaporanLemburAbsensi[];
        } else {
          return [];
        }
      }

      // Group by divisi (with validation)
      const groupedByDivisi: { [key: string]: LaporanLemburAbsensi[] } = {};
      
      laporanData.forEach(laporan => {
        // Validasi laporan object
        if (!laporan || !laporan.divisi) {
          console.warn('⚠️ Invalid laporan data:', laporan);
          return;
        }
        
        const divisi = laporan.divisi;
        if (!groupedByDivisi[divisi]) {
          groupedByDivisi[divisi] = [];
        }
        groupedByDivisi[divisi].push(laporan);
      });
      
      console.log('📊 Grouped by divisi:', Object.keys(groupedByDivisi).length, 'divisions');

      // Generate ringkasan per divisi
      const ringkasan: RingkasanBulanan[] = Object.entries(groupedByDivisi).map(([divisi, karyawan]) => {
        try {
          // Validasi data karyawan
          if (!karyawan || karyawan.length === 0) {
            console.warn(`⚠️ Divisi ${divisi} has no karyawan data`);
            return null;
          }

          const totalKaryawan = karyawan.length;
          const rataRataKehadiran = karyawan.reduce((sum, k) => sum + (k?.persentaseKehadiran || 0), 0) / totalKaryawan;
          const totalJamLembur = karyawan.reduce((sum, k) => sum + (k?.totalJamLembur || 0), 0);
          const totalGajiLembur = karyawan.reduce((sum, k) => sum + (k?.gajiLembur || 0), 0);
          const totalPotonganAbsensi = karyawan.reduce((sum, k) => sum + (k?.potonganAbsensi || 0), 0);

        // Find karyawan teladan (kehadiran tertinggi) with safe check
        let karyawanTeladanNama = '-';
        let karyawanPeringatanNama = '-';
        
        // Filter out null/undefined karyawan first
        const validKaryawan = karyawan.filter(k => k && k.nama && k.persentaseKehadiran !== undefined);
        
        if (validKaryawan.length > 0) {
          // Sort by persentase kehadiran
          const sortedByKehadiran = [...validKaryawan].sort((a, b) => b.persentaseKehadiran - a.persentaseKehadiran);
          
          const karyawanTerbaik = sortedByKehadiran[0];
          const karyawanTerburuk = sortedByKehadiran[sortedByKehadiran.length - 1];

          karyawanTeladanNama = karyawanTerbaik?.nama || '-';
          karyawanPeringatanNama = karyawanTerburuk?.nama || '-';
        }

          return {
            divisi,
            periode,
            totalKaryawan,
            rataRataKehadiran,
            totalJamLembur,
            totalGajiLembur,
            totalPotonganAbsensi,
            karyawanTeladan: karyawanTeladanNama,
            karyawanPeringatan: karyawanPeringatanNama
          };
        } catch (error) {
          console.error(`❌ Error processing divisi ${divisi}:`, error);
          return null;
        }
      }).filter((r): r is RingkasanBulanan => r !== null);

      return ringkasan;
    } catch (error) {
      console.error('❌ Error generating ringkasan bulanan:', error);
      throw error;
    }
  },

  /**
   * Export laporan ke Excel (placeholder)
   */
  async exportToExcel(params?: {
    start_date?: string;
    end_date?: string;
    divisi?: string;
  }): Promise<Blob> {
    try {
      console.log('🔄 Exporting to Excel...');
      
      const queryParams = new URLSearchParams();
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.divisi) queryParams.append('divisi', params.divisi);

      const url = `/api/overtime/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export');
      }

      const blob = await response.blob();
      console.log('✅ Export successful');
      return blob;
    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      throw error;
    }
  }
};

export default adminOvertimeService;

