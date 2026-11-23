import { phpApiMethods } from './api';

// Types untuk Payroll berdasarkan response dari backend
export interface PayrollGuru {
  id: number;
  nama_lengkap: string;
  nip: string;
  email: string;
  jabatan: {
    id: number;
    nama: string;
  };
}

export interface PayrollPeriode {
  bulan: string;
  tahun: string;
  status: string;
}

export interface PayrollTunjangan {
  jabatan: number;
  masa_kerja: number;
  wali_kelas: number;
  koordinator: number;
  tatap_muka: number;
  t_muka_pengganti: number;
  tunj_keluarga: number;
  transport1: number;
  transport2: number;
  makan: number;
  jamsostek: number;
  overtime: number;
  pramuka: number;
  tunj_lain: number;
  ekskul: number;
  bpjs: number;
  bimbel: number;
  proyek: number;
  insentif_peng_pramuka: number;
  insentif_peng_ekskul: number;
  insentif_peng_proyek: number;
  total: number;
}

export interface PayrollPotongan {
  nama_potongan: string;
  jumlah: number;
}

export interface PayrollData {
  id?: string;
  guru: PayrollGuru;
  periode: PayrollPeriode;
  gaji_pokok: number;
  tunjangan: PayrollTunjangan;
  potongan: PayrollPotongan[];
  total_potongan: number;
  gaji_bersih: number;
  created_date: string;
  created_by: string;
}

export interface PayrollHistoryItem {
  id: number | null;
  periode: string;
  periode_bulan: string;
  periode_tahun: string;
  gaji_pokok: number;
  total_gaji: number;
  total_potongan: number;
  gaji_bersih: number;
  status: string;
  created_date: string;
}

export interface GuruTHRData {
  id: number;
  guru_id: number;
  nama_lengkap: string;
  nip?: string | null;
  jabatan?: string | null;
  unit_sekolah?: string | null;
  unit_sekolah_nama?: string | null;
  masa_kerja_tahun: number;
  gaji_pokok: number;
  tunjangan_jabatan: number;
  masa_kerja_rupiah: number;
  jumlah_tatap_muka: number;
  tatap_muka_rupiah: number;
  total_rupiah: number;
  keterangan_rupiah: number;
  tahun: number;
  nama_bank?: string | null;
  no_rekening?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollApiResponse {
  success: boolean;
  message: string;
  data: PayrollData;
}

export interface PayrollHistoryApiResponse {
  success: boolean;
  message: string;
  data: PayrollHistoryItem[];
}

// Service functions untuk Guru Payroll
export const guruPayrollService = {
  /**
   * Mengambil data payroll terbaru untuk guru yang sedang login
   */
  async getGuruPayroll(): Promise<PayrollData | null> {
    try {
      console.log('🔄 Fetching payroll data for authenticated guru');
      
      const response = await phpApiMethods.get<PayrollData>(
        `/master-data/payroll/guru/my-payroll`
      );
      
      console.log('✅ Payroll data fetched successfully:', response);
      return response || null;
    } catch (error) {
      console.error('❌ Error fetching guru payroll:', error);
      return null;
    }
  },

  /**
   * Mengambil riwayat payroll untuk guru yang sedang login
   * Data diurutkan berdasarkan periode terbaru
   */
  async getGuruPayrollHistory(): Promise<PayrollHistoryItem[]> {
    try {
      console.log('🔄 Fetching payroll history for authenticated guru');
      
      const responseData = await phpApiMethods.get<PayrollHistoryItem[]>(
        `/master-data/payroll/guru/my-history`
      );
      
      console.log('✅ Payroll history fetched successfully:', responseData);
      console.log('Response data type:', typeof responseData);
      console.log('Response data length:', Array.isArray(responseData) ? responseData.length : 'Not an array');
      console.log('Response data content:', responseData);
      
      return responseData || [];
    } catch (error) {
      console.error('❌ Error fetching guru payroll history:', error);
      throw error;
    }
  },

  /**
   * Mengambil data THR tahun tertentu untuk guru yang sedang login
   */
  async getGuruTHR(tahun = new Date().getFullYear()): Promise<GuruTHRData | null> {
    try {
      console.log('🔄 Fetching THR data for authenticated guru');

      const response = await phpApiMethods.get<GuruTHRData | null>(
        `/master-data/payroll/guru/my-thr`,
        { tahun }
      );

      console.log('✅ THR data fetched successfully:', response);
      return response || null;
    } catch (error) {
      console.error('❌ Error fetching guru THR:', error);
      return null;
    }
  },

  /**
   * Mengambil detail slip THR untuk guru yang sedang login
   */
  async getGuruTHRSlip(id: number | string): Promise<GuruTHRData | null> {
    try {
      console.log('🔄 Fetching THR slip for authenticated guru');

      const response = await phpApiMethods.get<GuruTHRData>(
        `/master-data/payroll/guru/my-thr-slip/${id}`
      );

      console.log('✅ THR slip fetched successfully:', response);
      return response || null;
    } catch (error) {
      console.error('❌ Error fetching guru THR slip:', error);
      throw error;
    }
  },

  /**
   * Mengambil data payroll dan riwayat secara bersamaan
   */
  async getGuruPayrollWithHistory(): Promise<{
    payrollData: PayrollData | null;
    historyData: PayrollHistoryItem[];
  }> {
    try {
      console.log('🔄 Fetching complete payroll data for authenticated guru');
      
      const [payrollResponse, historyResponse] = await Promise.all([
        this.getGuruPayroll().catch(() => null), // Return null jika tidak ada data
        this.getGuruPayrollHistory().catch(() => []) // Return empty array jika error
      ]);
      
      console.log('✅ Complete payroll data fetched successfully');
      return {
        payrollData: payrollResponse,
        historyData: historyResponse
      };
    } catch (error) {
      console.error('❌ Error fetching complete payroll data:', error);
      throw error;
    }
  },

  /**
   * Format data payroll untuk komponen UI
   */
  formatPayrollForUI(payrollData: PayrollData) {
    return {
      gajiPokok: payrollData.gaji_pokok,
      tunjangan: {
        jabatan: payrollData.tunjangan.jabatan,
        masa_kerja: payrollData.tunjangan.masa_kerja,
        wali_kelas: payrollData.tunjangan.wali_kelas,
        koordinator: payrollData.tunjangan.koordinator,
        tatap_muka: payrollData.tunjangan.tatap_muka,
        t_muka_pengganti: payrollData.tunjangan.t_muka_pengganti,
        tunj_keluarga: payrollData.tunjangan.tunj_keluarga,
        transport1: payrollData.tunjangan.transport1,
        transport2: payrollData.tunjangan.transport2,
        makan: payrollData.tunjangan.makan,
        jamsostek: payrollData.tunjangan.jamsostek,
        overtime: payrollData.tunjangan.overtime,
        pramuka: payrollData.tunjangan.pramuka,
        tunj_lain: payrollData.tunjangan.tunj_lain,
        ekskul: payrollData.tunjangan.ekskul,
        bpjs: payrollData.tunjangan.bpjs,
        bimbel: payrollData.tunjangan.bimbel,
        proyek: payrollData.tunjangan.proyek,
        insentif_peng_pramuka: payrollData.tunjangan.insentif_peng_pramuka,
        insentif_peng_ekskul: payrollData.tunjangan.insentif_peng_ekskul,
        insentif_peng_proyek: payrollData.tunjangan.insentif_peng_proyek
      },
      potongan: payrollData.potongan.reduce((acc, item) => {
        acc[item.nama_potongan.toLowerCase().replace(/\s+/g, '_')] = item.jumlah;
        return acc;
      }, {} as Record<string, number>),
      totalGaji: payrollData.gaji_pokok + payrollData.tunjangan.total,
      totalTunjangan: payrollData.tunjangan.total,
      totalPotongan: payrollData.total_potongan,
      netSalary: payrollData.gaji_bersih,
      periode: payrollData.periode,
      guru: payrollData.guru,
      created_date: payrollData.created_date,
      created_by: payrollData.created_by
    };
  },

  /**
   * Format riwayat gaji untuk komponen UI
   */
  formatHistoryForUI(historyData: PayrollHistoryItem[]) {
    return historyData.map(item => ({
      id: item.id,
      bulan: item.periode,
      periode_bulan: item.periode_bulan,
      periode_tahun: item.periode_tahun,
      gaji: item.gaji_bersih,
      status: item.status,
      tanggal: new Date(item.created_date).toLocaleDateString('id-ID'),
      metode: 'Transfer Bank', // Default method
      gaji_pokok: item.gaji_pokok,
      total_gaji: item.total_gaji,
      total_potongan: item.total_potongan,
      gaji_bersih: item.gaji_bersih,
      created_date: item.created_date
    }));
  }
};

export default guruPayrollService;
