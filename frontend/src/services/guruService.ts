import axios from 'axios';
import { API_BASE_URL } from './api';


// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interfaces for API responses
export interface Jabatan {
  id: number;
  nama: string;
  level: number;
}

export interface UnitSekolah {
  id: number;
  nama: string;
  jenjang: string;
}

export interface GuruFormDataResponse {
  success: boolean;
  data: {
    jabatans: Jabatan[];
    unit_sekolahs: UnitSekolah[];
  };
}

export interface GuruFormData {
  nama_lengkap: string;
  nip: string;
  jabatan_id: number;
  status: 'Aktif' | 'Non-Aktif' | 'Pensiun';
  tmt: string;
  unit_sekolah_id: number;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenjang_pendidikan: string;
  jurusan: string;
  status_pernikahan: 'Menikah' | 'Belum Menikah' | 'Janda/Duda';
  tugas_tambahan?: string;
  mapel_diampu?: string[];
  jam_mengajar?: number;
  email: string;
  no_telepon?: string;
  alamat?: string;
  username: string;
  password: string;
  avatar?: File | null;
  // Payroll fields
  gaji_pokok?: number;
  tunjangan_jabatan?: number;
  tunjangan_masa_kerja?: number;
  wali_kelas?: number;
  koordinator?: number;
  tatap_muka?: string | number;
  t_muka_pengganti?: string | number;
  tunj_keluarga?: number;
  transport1?: number;
  transport2?: number;
  makan?: number;
  jamsostek?: number;
  overtime?: number;
  pramuka?: number;
  tunj_lain?: number;
  ekskul?: number;
  bpjs?: number;
  bimbel?: number;
  proyek?: number;
  insentif_peng_pramuka?: number;
  insentif_peng_ekskul?: number;
  insentif_peng_proyek?: number;
  insentif_pengurus_bimbel?: number;
  // Bank fields
  nama_bank?: string;
  no_rekening?: string;
}

export interface ApiGuru {
  id: number;
  nama_lengkap: string;
  nip: string;
  jabatan_id: number;
  status: string;
  tmt: string;
  unit_sekolah_id: number;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenjang_pendidikan: string;
  jurusan: string;
  status_pernikahan: string;
  tugas_tambahan?: string;
  mapel_diampu?: string[];
  jam_mengajar?: number;
  email: string;
  no_telepon?: string;
  alamat?: string;
  avatar?: string;
  username?: string;
  masa_kerja?: string;
  jabatan?: Jabatan;
  unit_sekolah?: UnitSekolah;
  created_at: string;
  updated_at: string;
  // Payroll fields
  gaji_pokok?: number;
  tunjangan_jabatan?: number;
  tunjangan_masa_kerja?: number;
  wali_kelas?: number;
  koordinator?: number;
  tatap_muka?: string | number;
  t_muka_pengganti?: string | number;
  tunj_keluarga?: number;
  transport1?: number;
  transport2?: number;
  makan?: number;
  jamsostek?: number;
  overtime?: number;
  pramuka?: number;
  tunj_lain?: number;
  ekskul?: number;
  bpjs?: number;
  bimbel?: number;
  proyek?: number;
  insentif_peng_pramuka?: number;
  insentif_peng_ekskul?: number;
  insentif_peng_proyek?: number;
  insentif_pengurus_bimbel?: number;
  // Bank fields
  nama_bank?: string;
  no_rekening?: string;
}

export interface GuruListResponse {
  success: boolean;
  data: {
    data: ApiGuru[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface GuruResponse {
  success: boolean;
  data: ApiGuru;
  message?: string;
}

export interface GuruFilters {
  search?: string;
  status?: string;
  jabatan_id?: number;
  unit_sekolah_id?: number;
  page?: number;
  per_page?: number;
}

// Helper function to convert API data to frontend format
export const convertApiToFrontend = (apiData: ApiGuru) => ({
    id: apiData.id ? apiData.id.toString() : '',
    namaLengkap: apiData.nama_lengkap || '',
    jabatan: apiData.jabatan?.nama || '',
    jabatanId: apiData.jabatan_id ? apiData.jabatan_id.toString() : '',
    nip: apiData.nip || '',
    status: apiData.status as 'Aktif' | 'Non-Aktif' | 'Pensiun',
    tmt: apiData.tmt ? apiData.tmt.split('T')[0] : '', // Format date
    unitKerja: apiData.unit_sekolah?.nama || '',
    unitSekolahId: apiData.unit_sekolah_id ? apiData.unit_sekolah_id.toString() : '',
    masaKerja: apiData.masa_kerja || '',
    tempatLahir: apiData.tempat_lahir || '',
    tanggalLahir: apiData.tanggal_lahir ? apiData.tanggal_lahir.split('T')[0] : '', // Format date
    pendidikan: {
      jenjang: apiData.jenjang_pendidikan || '',
      jurusan: apiData.jurusan || '',
    },
    statusPernikahan: apiData.status_pernikahan as 'Menikah' | 'Belum Menikah' | 'Janda/Duda',
    tugasTambahan: apiData.tugas_tambahan || '',
    mapelDiampu: Array.isArray(apiData.mapel_diampu) ? apiData.mapel_diampu : (apiData.mapel_diampu ? [apiData.mapel_diampu] : []),
    jamMengajar: apiData.jam_mengajar || 0,
    email: apiData.email || '',
    noTelepon: apiData.no_telepon || '',
    alamat: apiData.alamat || '',
    username: apiData.username || '',
    avatar: apiData.avatar && apiData.avatar !== "0" && apiData.avatar !== "null" 
      ? `${import.meta.env.PROD ? 'https://nurverse.id/manajemen-annur/backend/public' : 'http://localhost:8001'}/storage/${apiData.avatar}` 
      : undefined,
    // Payroll fields
    gajiPokok: apiData.gaji_pokok || 0,
    tunjanganJabatan: apiData.tunjangan_jabatan || 0,
    tunjanganMasaKerja: apiData.tunjangan_masa_kerja || 0,
    waliKelas: apiData.wali_kelas || 0,
    koordinator: apiData.koordinator || 0,
    tatapMuka: String(apiData.tatap_muka || '0'),
    tMukaPengganti: String(apiData.t_muka_pengganti || '0'),
    tunjKeluarga: apiData.tunj_keluarga || 0,
    transport1: apiData.transport1 || 0,
    transport2: apiData.transport2 || 0,
    makan: apiData.makan || 0,
    jamsostek: apiData.jamsostek || 0,
    overtime: apiData.overtime || 0,
    pramuka: apiData.pramuka || 0,
    tunjLain: apiData.tunj_lain || 0,
    ekskul: apiData.ekskul || 0,
    bpjs: apiData.bpjs || 0,
    bimbel: apiData.bimbel || 0,
    proyek: apiData.proyek || 0,
    insentifPengPramuka: apiData.insentif_peng_pramuka || 0,
    insentifPengEkskul: apiData.insentif_peng_ekskul || 0,
    insentifPengProyek: apiData.insentif_peng_proyek || 0,
    insentifPengurusBimbel: apiData.insentif_pengurus_bimbel || 0,
    // Bank fields
    namaBank: apiData.nama_bank || '',
    noRekening: apiData.no_rekening || '',
});

export const guruService = {
  // Get form data for dropdowns
  async getFormData(): Promise<GuruFormDataResponse> {
    const response = await api.get('/master-data/guru-form-data');
    return response.data;
  },

  // Get all gurus with filters
  async getAll(filters: GuruFilters = {}): Promise<GuruListResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.jabatan_id) params.append('jabatan_id', filters.jabatan_id.toString());
    if (filters.unit_sekolah_id) params.append('unit_sekolah_id', filters.unit_sekolah_id.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    try {
      const response = await api.get(`/master-data/guru?${params.toString()}`);
      const data = response.data;
      
      // Convert avatar paths to full URLs
      if (data.success && data.data.data) {
        data.data.data = data.data.data.map(convertApiToFrontend);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching guru data:', error);
      return {
        success: false,
        data: {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0
        }
      };
    }
  },

  // Get single guru
  async getById(id: string): Promise<GuruResponse> {
    const response = await api.get(`/master-data/guru/${id}`);
    const data = response.data;
    
    // Convert avatar path to full URL
    if (data.success && data.data) {
      data.data = convertApiToFrontend(data.data);
    }
    
    return data;
  },

  // Create new guru
  async create(formDataInput: GuruFormData): Promise<GuruResponse> {
    const formData = new FormData();
    
    // Add form fields with proper mapping
    formData.append('nama_lengkap', formDataInput.nama_lengkap);
    formData.append('nip', formDataInput.nip);
    formData.append('jabatan_id', formDataInput.jabatan_id.toString());
    formData.append('status', formDataInput.status);
    formData.append('tmt', formDataInput.tmt);
    formData.append('unit_sekolah_id', formDataInput.unit_sekolah_id.toString());
    formData.append('tempat_lahir', formDataInput.tempat_lahir);
    formData.append('tanggal_lahir', formDataInput.tanggal_lahir ? new Date(formDataInput.tanggal_lahir).toISOString().split('T')[0] : '');
    formData.append('jenjang_pendidikan', formDataInput.jenjang_pendidikan);
    formData.append('jurusan', formDataInput.jurusan);
    formData.append('status_pernikahan', formDataInput.status_pernikahan);
    formData.append('email', formDataInput.email);
    formData.append('username', formDataInput.username);
    formData.append('password', formDataInput.password);
    
    if (formDataInput.tugas_tambahan) formData.append('tugas_tambahan', formDataInput.tugas_tambahan);
    if (formDataInput.mapel_diampu) {
      formDataInput.mapel_diampu.forEach((mapel: string, index: number) => {
        formData.append(`mapel_diampu[${index}]`, mapel);
      });
    }
    if (formDataInput.jam_mengajar) formData.append('jam_mengajar', formDataInput.jam_mengajar.toString());
    if (formDataInput.no_telepon) formData.append('no_telepon', formDataInput.no_telepon);
    if (formDataInput.alamat) formData.append('alamat', formDataInput.alamat);
    if (formDataInput.avatar) formData.append('avatar', formDataInput.avatar);
    
    // Add payroll fields
    if (formDataInput.gaji_pokok !== undefined) formData.append('gaji_pokok', formDataInput.gaji_pokok.toString());
    if (formDataInput.tunjangan_jabatan !== undefined) formData.append('tunjangan_jabatan', formDataInput.tunjangan_jabatan.toString());
    if (formDataInput.tunjangan_masa_kerja !== undefined) formData.append('tunjangan_masa_kerja', formDataInput.tunjangan_masa_kerja.toString());
    if (formDataInput.wali_kelas !== undefined) formData.append('wali_kelas', formDataInput.wali_kelas.toString());
    if (formDataInput.koordinator !== undefined) formData.append('koordinator', formDataInput.koordinator.toString());
    if (formDataInput.tatap_muka !== undefined) formData.append('tatap_muka', formDataInput.tatap_muka.toString());
    if (formDataInput.t_muka_pengganti !== undefined) formData.append('t_muka_pengganti', formDataInput.t_muka_pengganti.toString());
    if (formDataInput.tunj_keluarga !== undefined) formData.append('tunj_keluarga', formDataInput.tunj_keluarga.toString());
    if (formDataInput.transport1 !== undefined) formData.append('transport1', formDataInput.transport1.toString());
    if (formDataInput.transport2 !== undefined) formData.append('transport2', formDataInput.transport2.toString());
    if (formDataInput.makan !== undefined) formData.append('makan', formDataInput.makan.toString());
    if (formDataInput.jamsostek !== undefined) formData.append('jamsostek', formDataInput.jamsostek.toString());
    if (formDataInput.overtime !== undefined) formData.append('overtime', formDataInput.overtime.toString());
    if (formDataInput.pramuka !== undefined) formData.append('pramuka', formDataInput.pramuka.toString());
    if (formDataInput.tunj_lain !== undefined) formData.append('tunj_lain', formDataInput.tunj_lain.toString());
    if (formDataInput.ekskul !== undefined) formData.append('ekskul', formDataInput.ekskul.toString());
    if (formDataInput.bpjs !== undefined) formData.append('bpjs', formDataInput.bpjs.toString());
    if (formDataInput.bimbel !== undefined) formData.append('bimbel', formDataInput.bimbel.toString());
    if (formDataInput.proyek !== undefined) formData.append('proyek', formDataInput.proyek.toString());
    if (formDataInput.insentif_peng_pramuka !== undefined) formData.append('insentif_peng_pramuka', formDataInput.insentif_peng_pramuka.toString());
    if (formDataInput.insentif_peng_ekskul !== undefined) formData.append('insentif_peng_ekskul', formDataInput.insentif_peng_ekskul.toString());
    if (formDataInput.insentif_peng_proyek !== undefined) formData.append('insentif_peng_proyek', formDataInput.insentif_peng_proyek.toString());
    if (formDataInput.insentif_pengurus_bimbel !== undefined) formData.append('insentif_pengurus_bimbel', formDataInput.insentif_pengurus_bimbel.toString());
    
    // Add bank fields (allow empty strings)
    if (formDataInput.nama_bank !== undefined && formDataInput.nama_bank !== null) {
      formData.append('nama_bank', formDataInput.nama_bank);
    }
    
    if (formDataInput.no_rekening !== undefined && formDataInput.no_rekening !== null) {
      formData.append('no_rekening', formDataInput.no_rekening);
    }
    
    const response = await api.post('/master-data/guru', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const responseData = response.data;
    
    // Convert avatar path to full URL
    if (responseData.success && responseData.data) {
      responseData.data = convertApiToFrontend(responseData.data);
    }
    
    return responseData;
  },

  // Update guru
  async update(id: string, formDataInput: GuruFormData): Promise<GuruResponse> {
    const formData = new FormData();
    
    // Add form fields with proper mapping
    if (formDataInput.nama_lengkap) formData.append('nama_lengkap', formDataInput.nama_lengkap);
    if (formDataInput.nip) formData.append('nip', formDataInput.nip);
    if (formDataInput.jabatan_id) formData.append('jabatan_id', formDataInput.jabatan_id.toString());
    if (formDataInput.status) formData.append('status', formDataInput.status);
    if (formDataInput.tmt) formData.append('tmt', new Date(formDataInput.tmt).toISOString().split('T')[0]);
    if (formDataInput.unit_sekolah_id) formData.append('unit_sekolah_id', formDataInput.unit_sekolah_id.toString());
    if (formDataInput.tempat_lahir) formData.append('tempat_lahir', formDataInput.tempat_lahir);
    if (formDataInput.tanggal_lahir) formData.append('tanggal_lahir', new Date(formDataInput.tanggal_lahir).toISOString().split('T')[0]);
    if (formDataInput.jenjang_pendidikan) formData.append('jenjang_pendidikan', formDataInput.jenjang_pendidikan);
    if (formDataInput.jurusan) formData.append('jurusan', formDataInput.jurusan);
    if (formDataInput.status_pernikahan) formData.append('status_pernikahan', formDataInput.status_pernikahan);
    if (formDataInput.email) formData.append('email', formDataInput.email);
    if (formDataInput.username) formData.append('username', formDataInput.username);
    if (formDataInput.password) formData.append('password', formDataInput.password);
    if (formDataInput.tugas_tambahan) formData.append('tugas_tambahan', formDataInput.tugas_tambahan);
    if (formDataInput.mapel_diampu) {
      formDataInput.mapel_diampu.forEach((mapel: string, index: number) => {
        formData.append(`mapel_diampu[${index}]`, mapel);
      });
    }
    if (formDataInput.jam_mengajar) formData.append('jam_mengajar', formDataInput.jam_mengajar.toString());
    if (formDataInput.no_telepon) formData.append('no_telepon', formDataInput.no_telepon);
    if (formDataInput.alamat) formData.append('alamat', formDataInput.alamat);
    if (formDataInput.avatar) formData.append('avatar', formDataInput.avatar);
    
    // Add payroll fields
    if (formDataInput.gaji_pokok !== undefined) formData.append('gaji_pokok', formDataInput.gaji_pokok.toString());
    if (formDataInput.tunjangan_jabatan !== undefined) formData.append('tunjangan_jabatan', formDataInput.tunjangan_jabatan.toString());
    if (formDataInput.tunjangan_masa_kerja !== undefined) formData.append('tunjangan_masa_kerja', formDataInput.tunjangan_masa_kerja.toString());
    if (formDataInput.wali_kelas !== undefined) formData.append('wali_kelas', formDataInput.wali_kelas.toString());
    if (formDataInput.koordinator !== undefined) formData.append('koordinator', formDataInput.koordinator.toString());
    if (formDataInput.tatap_muka !== undefined) formData.append('tatap_muka', formDataInput.tatap_muka.toString());
    if (formDataInput.t_muka_pengganti !== undefined) formData.append('t_muka_pengganti', formDataInput.t_muka_pengganti.toString());
    if (formDataInput.tunj_keluarga !== undefined) formData.append('tunj_keluarga', formDataInput.tunj_keluarga.toString());
    if (formDataInput.transport1 !== undefined) formData.append('transport1', formDataInput.transport1.toString());
    if (formDataInput.transport2 !== undefined) formData.append('transport2', formDataInput.transport2.toString());
    if (formDataInput.makan !== undefined) formData.append('makan', formDataInput.makan.toString());
    if (formDataInput.jamsostek !== undefined) formData.append('jamsostek', formDataInput.jamsostek.toString());
    if (formDataInput.overtime !== undefined) formData.append('overtime', formDataInput.overtime.toString());
    if (formDataInput.pramuka !== undefined) formData.append('pramuka', formDataInput.pramuka.toString());
    if (formDataInput.tunj_lain !== undefined) formData.append('tunj_lain', formDataInput.tunj_lain.toString());
    if (formDataInput.ekskul !== undefined) formData.append('ekskul', formDataInput.ekskul.toString());
    if (formDataInput.bpjs !== undefined) formData.append('bpjs', formDataInput.bpjs.toString());
    if (formDataInput.bimbel !== undefined) formData.append('bimbel', formDataInput.bimbel.toString());
    if (formDataInput.proyek !== undefined) formData.append('proyek', formDataInput.proyek.toString());
    if (formDataInput.insentif_peng_pramuka !== undefined) formData.append('insentif_peng_pramuka', formDataInput.insentif_peng_pramuka.toString());
    if (formDataInput.insentif_peng_ekskul !== undefined) formData.append('insentif_peng_ekskul', formDataInput.insentif_peng_ekskul.toString());
    if (formDataInput.insentif_peng_proyek !== undefined) formData.append('insentif_peng_proyek', formDataInput.insentif_peng_proyek.toString());
    if (formDataInput.insentif_pengurus_bimbel !== undefined) formData.append('insentif_pengurus_bimbel', formDataInput.insentif_pengurus_bimbel.toString());
    
    // Add bank fields (allow empty strings)
    if (formDataInput.nama_bank !== undefined && formDataInput.nama_bank !== null) {
      formData.append('nama_bank', formDataInput.nama_bank);
    }
    
    if (formDataInput.no_rekening !== undefined && formDataInput.no_rekening !== null) {
      formData.append('no_rekening', formDataInput.no_rekening);
    }
    
    const response = await api.post(`/master-data/guru/${id}/update-with-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const responseData = response.data;
    
    // Convert avatar path to full URL
    if (responseData.success && responseData.data) {
      responseData.data = convertApiToFrontend(responseData.data);
    }
    
    return responseData;
  },

  // Delete guru
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/master-data/guru/${id}`);
    return response.data;
  },

  // Export guru data
  async export(filters: GuruFilters = {}): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.jabatan_id) params.append('jabatan_id', filters.jabatan_id.toString());
    if (filters.unit_sekolah_id) params.append('unit_sekolah_id', filters.unit_sekolah_id.toString());

    try {
      console.log('Starting export with filters:', filters);
      console.log('Export URL:', `/master-data/guru/export?${params.toString()}`);
      
      const response = await api.get(`/master-data/guru/export?${params.toString()}`, {
        responseType: 'blob',
      });

      console.log('Export response:', response);
      console.log('Response headers:', response.headers);

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'data_guru.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      console.log('Downloading file:', filename);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Export error details:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  async exportPdf(filters: GuruFilters = {}): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.jabatan_id) params.append('jabatan_id', filters.jabatan_id.toString());
    if (filters.unit_sekolah_id) params.append('unit_sekolah_id', filters.unit_sekolah_id.toString());

    try {
      console.log('Starting PDF export with filters:', filters);
      console.log('PDF Export URL:', `/master-data/guru/export-pdf?${params.toString()}`);
      
      const response = await api.get(`/master-data/guru/export-pdf?${params.toString()}`, {
        responseType: 'blob',
      });

      console.log('PDF Export response:', response);
      console.log('Response headers:', response.headers);

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'data_guru.html';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      console.log('Downloading PDF file:', filename);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('PDF Export completed successfully');
    } catch (error) {
      console.error('PDF Export error details:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  }
};

export default guruService;
