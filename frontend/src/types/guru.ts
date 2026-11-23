export interface Guru {
  id: string;
  namaLengkap: string;
  jabatan: string;
  jabatanId?: string;
  nip: string;
  status: 'Aktif' | 'Non-Aktif' | 'Pensiun';
  tmt: string; // Tanggal Mulai Tugas
  unitKerja: string;
  unitSekolahId?: string;
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
  email?: string;
  noTelepon?: string;
  alamat?: string;
  avatar?: string;
  username?: string;
  // Payroll fields
  gajiPokok?: number;
  tunjanganJabatan?: number;
  tunjanganMasaKerja?: number;
  waliKelas?: number;
  koordinator?: number;
  tatapMuka?: string;
  tMukaPengganti?: string;
  tunjKeluarga?: number;
  transport1?: number;
  transport2?: number;
  makan?: number;
  jamsostek?: number;
  overtime?: number;
  pramuka?: number;
  tunjLain?: number;
  ekskul?: number;
  bpjs?: number;
  bimbel?: number;
  proyek?: number;
  insentifPengPramuka?: number;
  insentifPengEkskul?: number;
  insentifPengProyek?: number;
  insentifPengurusBimbel?: number;
  // Bank fields
  namaBank?: string;
  noRekening?: string;
}

export interface GuruFormData {
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
  noTelepon: string;
  alamat: string;
  username: string;
  password: string;
  avatar?: File | null;
  // Payroll fields
  gajiPokok: string;
  tunjanganJabatan: string;
  tunjanganMasaKerja: string;
  waliKelas: string;
  koordinator: string;
  tatapMuka: string;
  tMukaPengganti: string;
  tunjKeluarga: string;
  transport1: string;
  transport2: string;
  makan: string;
  jamsostek: string;
  overtime: string;
  pramuka: string;
  tunjLain: string;
  ekskul: string;
  bpjs: string;
  bimbel: string;
  proyek: string;
  insentifPengPramuka: string;
  insentifPengEkskul: string;
  insentifPengProyek: string;
  insentifPengurusBimbel: string;
  // Bank fields
  namaBank: string;
  noRekening: string;
}

// Helper function to convert Guru to GuruFormData for editing
export const convertGuruToFormData = (guru: Guru): GuruFormData => {
  return {
    namaLengkap: guru.namaLengkap,
    jabatan: guru.jabatanId || guru.jabatan, // Use ID if available, fallback to name
    nip: guru.nip,
    status: guru.status,
    tmt: guru.tmt,
    unitKerja: guru.unitSekolahId || guru.unitKerja, // Use ID if available, fallback to name
    tempatLahir: guru.tempatLahir,
    tanggalLahir: guru.tanggalLahir,
    jenjangPendidikan: guru.pendidikan?.jenjang || '',
    jurusan: guru.pendidikan?.jurusan || '',
    statusPernikahan: guru.statusPernikahan,
    tugasTambahan: guru.tugasTambahan || '',
    mapelDiampu: Array.isArray(guru.mapelDiampu) ? guru.mapelDiampu.join(', ') : (guru.mapelDiampu || ''),
    jamMengajar: guru.jamMengajar?.toString() || '',
    email: guru.email || '',
    noTelepon: guru.noTelepon || '',
    alamat: guru.alamat || '',
    username: guru.username || '',
    password: '', // Keep empty for security, only fill when changing
    avatar: null,
    // Payroll fields
    gajiPokok: guru.gajiPokok?.toString() || '0',
    tunjanganJabatan: guru.tunjanganJabatan?.toString() || '0',
    tunjanganMasaKerja: guru.tunjanganMasaKerja?.toString() || '0',
    waliKelas: guru.waliKelas?.toString() || '0',
    koordinator: guru.koordinator?.toString() || '0',
    tatapMuka: guru.tatapMuka || '0',
    tMukaPengganti: guru.tMukaPengganti || '0',
    tunjKeluarga: guru.tunjKeluarga?.toString() || '0',
    transport1: guru.transport1?.toString() || '0',
    transport2: guru.transport2?.toString() || '0',
    makan: guru.makan?.toString() || '0',
    jamsostek: guru.jamsostek?.toString() || '0',
    overtime: guru.overtime?.toString() || '0',
    pramuka: guru.pramuka?.toString() || '0',
    tunjLain: guru.tunjLain?.toString() || '0',
    ekskul: guru.ekskul?.toString() || '0',
    bpjs: guru.bpjs?.toString() || '0',
    bimbel: guru.bimbel?.toString() || '0',
    proyek: guru.proyek?.toString() || '0',
    insentifPengPramuka: guru.insentifPengPramuka?.toString() || '0',
    insentifPengEkskul: guru.insentifPengEkskul?.toString() || '0',
    insentifPengProyek: guru.insentifPengProyek?.toString() || '0',
    insentifPengurusBimbel: guru.insentifPengurusBimbel?.toString() || '0',
    // Bank fields
    namaBank: guru.namaBank || '',
    noRekening: guru.noRekening || '',
  };
};

export interface GuruFilters {
  nama: string;
  nip: string;
  status?: string;
  unitKerja?: string;
}
