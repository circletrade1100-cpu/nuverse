import React, { useState } from 'react';
import Button from '../common/UI/Button';
import { 
  UserIcon, 
  BriefcaseIcon, 
  PhoneIcon
} from '@heroicons/react/24/outline';

interface Employee {
  id?: string;
  nama: string;
  nipy: string;
  tmt: string;
  masaKerja: string;
  tempatLahir: string;
  tanggalLahir: string;
  statusPernikahan: string;
  pendidikanTitle: string;
  pendidikanJurusan: string;
  avatar?: File | null;
  statusKerja: string;
  jabatan: string;
  tugasTambahan: string;
  mapelMaster: string;
  jamMengajar: string;
  unit: string;
  telepon: string;
  email: string;
  namaBank: string;
  nomorRekening: string;
  fileKTP?: File | null;
  fileIjazah?: File | null;
  fileSK?: File | null;
}

interface EmployeeFormProps {
  initialData?: Partial<Employee>;
  onSubmit: (data: Employee) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

interface FormErrors {
  [key: string]: string;
}

const EmployeeFormFixed: React.FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode
}) => {
  const [formData, setFormData] = useState<Employee>({
    nama: initialData?.nama || '',
    nipy: initialData?.nipy || '',
    tmt: initialData?.tmt || '',
    masaKerja: initialData?.masaKerja || '',
    tempatLahir: initialData?.tempatLahir || '',
    tanggalLahir: initialData?.tanggalLahir || '',
    statusPernikahan: initialData?.statusPernikahan || '',
    pendidikanTitle: initialData?.pendidikanTitle || '',
    pendidikanJurusan: initialData?.pendidikanJurusan || '',
    avatar: initialData?.avatar || null,
    statusKerja: initialData?.statusKerja || '',
    jabatan: initialData?.jabatan || '',
    tugasTambahan: initialData?.tugasTambahan || '',
    mapelMaster: initialData?.mapelMaster || '',
    jamMengajar: initialData?.jamMengajar || '',
    unit: initialData?.unit || '',
    telepon: initialData?.telepon || '',
    email: initialData?.email || '',
    namaBank: initialData?.namaBank || '',
    nomorRekening: initialData?.nomorRekening || '',
    fileKTP: initialData?.fileKTP || null,
    fileIjazah: initialData?.fileIjazah || null,
    fileSK: initialData?.fileSK || null
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Options for dropdowns
  const statusPernikahanOptions = [
    { value: 'belum-menikah', label: 'Belum Menikah' },
    { value: 'menikah', label: 'Menikah' },
    { value: 'cerai', label: 'Cerai' }
  ];

  const pendidikanOptions = [
    { value: 'sma', label: 'SMA/SMK' },
    { value: 'd3', label: 'Diploma III' },
    { value: 's1', label: 'Sarjana (S1)' },
    { value: 's2', label: 'Magister (S2)' },
    { value: 's3', label: 'Doktor (S3)' }
  ];

  const statusKerjaOptions = [
    { value: 'tetap', label: 'Tetap' },
    { value: 'kontrak', label: 'Kontrak' },
    { value: 'honorer', label: 'Honorer' },
    { value: 'magang', label: 'Magang' }
  ];

  const jabatanOptions = [
    { value: 'kepala-sekolah', label: 'Kepala Sekolah' },
    { value: 'wakil-kepala', label: 'Wakil Kepala Sekolah' },
    { value: 'guru', label: 'Guru' },
    { value: 'wali-kelas', label: 'Wali Kelas' },
    { value: 'staff-tu', label: 'Staff TU' },
    { value: 'bendahara', label: 'Bendahara' }
  ];

  const unitOptions = [
    { value: 'manajemen', label: 'Manajemen' },
    { value: 'umum', label: 'Umum' },
    { value: 'daycare', label: 'Daycare' },
    { value: 'sd', label: 'SD' },
    { value: 'smp', label: 'SMP' },
    { value: 'sma', label: 'SMA' }
  ];

  const bankOptions = [
    { value: 'bca', label: 'Bank Central Asia (BCA)' },
    { value: 'mandiri', label: 'Bank Mandiri' },
    { value: 'bni', label: 'Bank Negara Indonesia (BNI)' },
    { value: 'bri', label: 'Bank Rakyat Indonesia (BRI)' },
    { value: 'cimb', label: 'CIMB Niaga' },
    { value: 'danamon', label: 'Bank Danamon' },
    { value: 'permata', label: 'Bank Permata' }
  ];

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nama || formData.nama.length < 3) {
      newErrors.nama = 'Nama wajib diisi minimal 3 karakter';
    }
    if (!formData.nipy) {
      newErrors.nipy = 'NIPY wajib diisi';
    }
    if (!formData.tanggalLahir) {
      newErrors.tanggalLahir = 'Tanggal lahir wajib diisi';
    }
    if (!formData.statusKerja) {
      newErrors.statusKerja = 'Status kerja wajib dipilih';
    }
    if (!formData.jabatan) {
      newErrors.jabatan = 'Jabatan wajib dipilih';
    }
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof Employee, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleFileChange = (field: 'avatar' | 'fileKTP' | 'fileIjazah' | 'fileSK', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  return (
    <div className="space-y-8 max-h-[85vh] overflow-y-auto pr-2">
      {/* Data Pribadi Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Data Pribadi</h3>
              <p className="text-blue-100">Informasi personal karyawan</p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {/* Avatar Upload */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-4">📸 Avatar Professional</label>
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center overflow-hidden shadow-xl border-4 border-white">
                  {formData.avatar ? (
                    <img 
                      src={URL.createObjectURL(formData.avatar)} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-slate-400" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  accept=".jpg,.jpeg"
                  onChange={(e) => handleFileChange('avatar', e.target.files?.[0] || null)}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  📸 Upload Foto
                </label>
                {formData.avatar && (
                  <button
                    type="button"
                    onClick={() => handleFileChange('avatar', null)}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    🗑️ Hapus Foto
                  </button>
                )}
                <p className="text-xs text-slate-500 text-center">JPG, JPEG • Max 5MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                👤 Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => handleChange('nama', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white ${
                  errors.nama ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                }`}
                placeholder="Masukkan nama lengkap"
              />
              {errors.nama && <p className="text-red-500 text-xs mt-2">⚠️ {errors.nama}</p>}
            </div>

            {/* NIPY */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                🆔 NIPY <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nipy}
                onChange={(e) => handleChange('nipy', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white ${
                  errors.nipy ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                }`}
                placeholder="Nomor Induk Pegawai Yayasan"
              />
              {errors.nipy && <p className="text-red-500 text-xs mt-2">⚠️ {errors.nipy}</p>}
            </div>

            {/* TMT */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">📅 TMT</label>
              <input
                type="date"
                value={formData.tmt}
                onChange={(e) => handleChange('tmt', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
              />
            </div>

            {/* Masa Kerja */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">⏳ Masa Kerja</label>
              <input
                type="text"
                value={formData.masaKerja}
                onChange={(e) => handleChange('masaKerja', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
                placeholder="Contoh: 5 tahun 2 bulan"
              />
            </div>

            {/* Tempat Lahir */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">🌍 Tempat Lahir</label>
              <input
                type="text"
                value={formData.tempatLahir}
                onChange={(e) => handleChange('tempatLahir', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
                placeholder="Masukkan tempat lahir"
              />
            </div>

            {/* Tanggal Lahir */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                🎂 Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tanggalLahir}
                onChange={(e) => handleChange('tanggalLahir', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white ${
                  errors.tanggalLahir ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              />
              {errors.tanggalLahir && <p className="text-red-500 text-xs mt-2">⚠️ {errors.tanggalLahir}</p>}
            </div>

            {/* Status Pernikahan */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">💍 Status Pernikahan</label>
              <select
                value={formData.statusPernikahan}
                onChange={(e) => handleChange('statusPernikahan', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
              >
                <option value="">Pilih Status Pernikahan</option>
                {statusPernikahanOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Pendidikan Terakhir */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">🎓 Pendidikan Terakhir</label>
              <select
                value={formData.pendidikanTitle}
                onChange={(e) => handleChange('pendidikanTitle', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
              >
                <option value="">Pilih Pendidikan</option>
                {pendidikanOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Jurusan */}
            <div className="lg:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-slate-700">📚 Jurusan</label>
              <input
                type="text"
                value={formData.pendidikanJurusan}
                onChange={(e) => handleChange('pendidikanJurusan', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
                placeholder="Jurusan pendidikan"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kepegawaian Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <BriefcaseIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Kepegawaian</h3>
              <p className="text-green-100">Data jabatan dan status kerja</p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Kerja */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                👔 Status Kerja <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.statusKerja}
                onChange={(e) => handleChange('statusKerja', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white ${
                  errors.statusKerja ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <option value="">Pilih Status Kerja</option>
                {statusKerjaOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.statusKerja && <p className="text-red-500 text-xs mt-2">⚠️ {errors.statusKerja}</p>}
            </div>

            {/* Jabatan */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                🏆 Jabatan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.jabatan}
                onChange={(e) => handleChange('jabatan', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white ${
                  errors.jabatan ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <option value="">Pilih Jabatan</option>
                {jabatanOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.jabatan && <p className="text-red-500 text-xs mt-2">⚠️ {errors.jabatan}</p>}
            </div>

            {/* Tugas Tambahan */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">➕ Tugas Tambahan</label>
              <input
                type="text"
                value={formData.tugasTambahan}
                onChange={(e) => handleChange('tugasTambahan', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
                placeholder="Masukkan tugas tambahan"
              />
            </div>

            {/* Mapel Master */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">📖 Mapel Master</label>
              <input
                type="text"
                value={formData.mapelMaster}
                onChange={(e) => handleChange('mapelMaster', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
                placeholder="Masukkan mata pelajaran"
              />
            </div>

            {/* Jam Mengajar */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">🕐 Jam Mengajar</label>
              <input
                type="number"
                value={formData.jamMengajar}
                onChange={(e) => handleChange('jamMengajar', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
                placeholder="Jam per minggu"
              />
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">🏢 Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
              >
                <option value="">Pilih Unit</option>
                {unitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Kontak & Bank Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-violet-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <PhoneIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Kontak & Bank</h3>
              <p className="text-purple-100">Data kontak dan rekening bank</p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nomor Handphone */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">📱 Nomor Handphone</label>
              <input
                type="tel"
                value={formData.telepon}
                onChange={(e) => handleChange('telepon', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            {/* Alamat Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                📧 Alamat Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                }`}
                placeholder="nama@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-2">⚠️ {errors.email}</p>}
            </div>

            {/* Nama Bank */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">🏦 Nama Bank</label>
              <select
                value={formData.namaBank}
                onChange={(e) => handleChange('namaBank', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
              >
                <option value="">Pilih Bank</option>
                {bankOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Nomor Rekening */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">💳 Nomor Rekening</label>
              <input
                type="text"
                value={formData.nomorRekening}
                onChange={(e) => handleChange('nomorRekening', e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium text-slate-900 bg-white border-slate-200 hover:border-slate-300"
                placeholder="Nomor rekening bank"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Sticky Footer */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200/50 mt-8 -mx-8 px-8 py-6 flex items-center justify-end gap-4 rounded-b-3xl">
        <Button
          onClick={onCancel}
          className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all duration-200 font-semibold border-2 border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl"
        >
          ❌ Batal
        </Button>
        <Button
          onClick={handleSubmit}
          className="px-10 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-900 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 font-semibold"
        >
          {mode === 'create' ? '✅ Simpan Data' : '🔄 Update Data'}
        </Button>
      </div>
    </div>
  );
};

export default EmployeeFormFixed;
