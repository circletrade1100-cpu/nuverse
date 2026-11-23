// Types untuk Master Data
export interface UnitKerja {
  id: string;
  kode: string;
  nama: string;
  deskripsi?: string;
  status: 'Aktif' | 'Tidak Aktif';
  unitSekolahId?: string; // Optional reference to unit sekolah
  createdAt: string;
  updatedAt: string;
}

export interface UnitSekolah {
  id: string;
  kode: string;
  nama: string;
  jenjang: 'PAUD' | 'TK' | 'SD' | 'SMP' | 'SMA' | 'SMK';
  alamat: string;
  kepalaSekolah?: string;
  status: 'Aktif' | 'Tidak Aktif';
  createdAt: string;
  updatedAt: string;
}

export interface UnitKelas {
  id: string;
  kode: string;
  nama: string;
  tingkat: string;
  kapasitas: number;
  waliKelas?: string;
  unitSekolah: string;
  unitSekolahId?: string;
  status: 'Aktif' | 'Tidak Aktif';
  createdAt: string;
  updatedAt: string;
}

export interface Jabatan {
  id: string;
  kode: string;
  nama: string;
  level: number;
  deskripsi?: string;
  gajiPokok: number;
  tunjangan: number;
  status: 'Aktif' | 'Tidak Aktif';
  createdAt: string;
  updatedAt: string;
}

export interface Bank {
  id: string;
  namaBank: string;
  nomorRekening: string;
  createdAt: string;
  updatedAt: string;
}

// Form Data Types
export interface UnitKerjaFormData {
  kode: string;
  nama: string;
  deskripsi?: string;
  status: 'Aktif' | 'Tidak Aktif';
  unitSekolahId?: string; // Optional reference to unit sekolah
}

export interface BankFormData {
  namaBank: string;
  nomorRekening: string;
}

export interface UnitSekolahFormData {
  kode: string;
  nama: string;
  jenjang: 'PAUD' | 'TK' | 'SD' | 'SMP' | 'SMA' | 'SMK';
  alamat: string;
  kepalaSekolah?: string;
  status: 'Aktif' | 'Tidak Aktif';
}

export interface UnitKelasFormData {
  kode: string;
  nama: string;
  tingkat: string;
  kapasitas: number;
  waliKelas?: string;
  unitSekolah: string;
  unitSekolahId?: string;
  status: 'Aktif' | 'Tidak Aktif';
}

export interface UnitKelasFilters {
  kode: string;
  nama: string;
  tingkat: string;
  unitSekolah: string;
  status: string;
}

export interface JabatanFormData {
  kode: string;
  nama: string;
  level: number;
  deskripsi?: string;
  gajiPokok: number;
  tunjangan: number;
  status: 'Aktif' | 'Tidak Aktif';
}

// Filter Types
export interface UnitKerjaFilters {
  kode: string;
  nama: string;
  status: string;
}

export interface UnitSekolahFilters {
  kode: string;
  nama: string;
  jenjang: string;
  status: string;
}

export interface UnitKelasFilters {
  kode: string;
  nama: string;
  tingkat: string;
  unitSekolah: string;
  status: string;
}

export interface JabatanFilters {
  kode: string;
  nama: string;
  level: string;
  status: string;
}

export interface BankFilters {
  namaBank: string;
  nomorRekening: string;
}
