/**
 * Type definitions untuk Overtime API
 * Disesuaikan dengan struktur JSON dari backend Laravel
 */

// Guru interface dari backend
export interface Guru {
  id: number;
  nip: string;
  nama_lengkap: string;
  jabatan_id?: number;
  unit_sekolah_id?: number;
  email?: string;
  no_telepon?: string;
  status?: string;
  jabatan?: Jabatan;
  unit_sekolah?: UnitSekolah;
}

// Jabatan interface
export interface Jabatan {
  id: number;
  nama: string;
}

// Unit Sekolah interface
export interface UnitSekolah {
  id: number;
  nama: string;
  kode?: string;
  jenjang?: string;
}

// Overtime data dari backend
export interface OvertimeBackend {
  id: number;
  id_guru: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  durasi: number;
  jenis: string;
  deskripsi: string;
  status: 'pending' | 'approved' | 'rejected';
  tarif: number;
  total: number;
  supervisor?: string | null;
  disetujui_oleh?: number | null;
  tanggal_disetujui?: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  guru?: Guru;
  creator?: Guru;
  approver?: {
    id: number;
    name: string;
    email: string;
  };
}

// Paginated response dari backend
export interface OvertimePaginatedResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: OvertimeBackend[];
    total: number;
    per_page: number;
    last_page: number;
    from?: number;
    to?: number;
  };
}

// Query parameters untuk filter
export interface OvertimeQueryParams {
  start_date?: string;
  end_date?: string;
  status?: string;
  id_guru?: number;
  jenis?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export default {
  Guru,
  Jabatan,
  UnitSekolah,
  OvertimeBackend,
  OvertimePaginatedResponse,
  OvertimeQueryParams
};

