export interface User {
  id: string;
  namaLengkap: string;
  jabatan: string;
  nip: string;
  status: 'Aktif' | 'Non-Aktif' | 'Pensiun';
  tmt: string; // Tanggal Mulai Tugas
  unitKerja: string;
  masaKerja: string;
  tempatLahir: string;
  tanggalLahir: string;
  pendidikan: {
    jenjang: string;
    jurusan: string;
  };
  statusPernikahan: 'Menikah' | 'Belum Menikah' | 'Janda/Duda';
  tugasTambahan?: string;
  mapelDiampu?: string[];
  jamMengajar?: number;
  avatar?: string;
  role?: string; // Add role field
}

export interface UserFormData {
  namaLengkap: string;
  jabatan: string;
  nip: string;
  status: 'Aktif' | 'Non-Aktif' | 'Pensiun';
  tmt: string;
  unitKerja: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenjangPendidikan: string;
  jurusan: string;
  statusPernikahan: 'Menikah' | 'Belum Menikah' | 'Janda/Duda';
  tugasTambahan: string;
  mapelDiampu: string;
  jamMengajar: string;
  email: string;
  password: string;
  avatar?: File | null;
}

export interface UserFilters {
  nama: string;
  nip: string;
  status?: string;
  unitKerja?: string;
  role?: string;
  jabatan?: string;
  search?: string;
}

// Interface untuk Parents
export interface Parent {
  id: string;
  nisn: string;
  namaOrangTua: string;
  namaAnak: string;
  status: 'Aktif' | 'Non-Aktif';
  email?: string;
  noTelepon?: string;
}

// Interface untuk Guru
export interface Guru {
  id: string;
  nip: string;
  namaLengkap: string;
  jabatan: string;
  status: 'Aktif' | 'Non-Aktif' | 'Pensiun';
  mapelDiampu?: string[];
  jamMengajar?: number;
  email?: string;
}

// Interface untuk Manajemen
export interface Manajemen {
  id: string;
  nip: string;
  namaLengkap: string;
  jabatan: string;
  unitKerja: string;
  role: string;
  status: 'Aktif' | 'Non-Aktif';
  email?: string;
}

export type UserType = 'parents' | 'guru' | 'manajemen';

export interface TabStats {
  total: number;
  aktif: number;
  nonAktif: number;
  pensiun?: number;
}

// Form Data Interfaces
export interface ParentFormData {
  nisn: string;
  namaOrangTua: string;
  namaAnak: string;
  status: 'Aktif' | 'Non-Aktif';
  email?: string;
  noTelepon?: string;
}

export interface GuruFormData {
  nip: string;
  namaLengkap: string;
  jabatan: string;
  status: 'Aktif' | 'Non-Aktif' | 'Pensiun';
  mapelDiampu?: string;
  jamMengajar?: string;
  email?: string;
}

export interface ManajemenFormData {
  nip: string;
  namaLengkap: string;
  jabatan: string;
  unitKerja: string;
  role: string;
  status: 'Aktif' | 'Non-Aktif';
  email?: string;
}