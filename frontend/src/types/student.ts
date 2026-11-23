export interface Student {
  id: string;
  namaLengkap: string;
  namaPanggilan: string;
  tempatLahir: string;
  tanggalLahir: string;
  namaIbu: string;
  namaAyah: string;
  nomorHP: string;
  alamat: string;
  email: string;
  unitSekolah: string;
  unitKelas: string;
  nisn: string;
  password: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentFormData {
  namaLengkap: string;
  namaPanggilan: string;
  tempatLahir: string;
  tanggalLahir: string;
  namaIbu: string;
  namaAyah: string;
  nomorHP: string;
  alamat: string;
  email: string;
  unitSekolah: string;
  unitKelas: string;
  nisn: string;
  password: string;
  avatar?: File | null;
}

export interface StudentFilters {
  nama: string;
  unitSekolah?: string;
  unitKelas?: string;
}
