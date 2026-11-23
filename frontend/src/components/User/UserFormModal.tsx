import React, { useState, useRef } from 'react';
import { X, Upload, User as UserIcon, GraduationCap, Briefcase, Clock, Camera, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import type { UserFormData } from '../../types/user';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => void;
  isEdit?: boolean;
  initialData?: Partial<UserFormData>;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit = false,
  initialData,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    namaLengkap: initialData?.namaLengkap || '',
    jabatan: initialData?.jabatan || '',
    nip: initialData?.nip || '',
    status: initialData?.status || 'Aktif',
    tmt: initialData?.tmt || '',
    unitKerja: initialData?.unitKerja || '',
    tempatLahir: initialData?.tempatLahir || '',
    tanggalLahir: initialData?.tanggalLahir || '',
    jenjangPendidikan: initialData?.jenjangPendidikan || '',
    jurusan: initialData?.jurusan || '',
    statusPernikahan: initialData?.statusPernikahan || 'Belum Menikah',
    tugasTambahan: initialData?.tugasTambahan || '',
    mapelDiampu: initialData?.mapelDiampu || '',
    jamMengajar: initialData?.jamMengajar || '',
    email: initialData?.email || '',
    password: initialData?.password || '',
    avatar: null,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof UserFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: 'File harus berupa gambar' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'Ukuran file maksimal 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, avatar: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      setErrors(prev => ({ ...prev, avatar: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Nama lengkap wajib diisi';
    if (!formData.jabatan.trim()) newErrors.jabatan = 'Jabatan wajib diisi';
    if (!formData.nip.trim()) newErrors.nip = 'NIP wajib diisi';
    if (!formData.unitKerja.trim()) newErrors.unitKerja = 'Unit kerja wajib diisi';
    if (!formData.tempatLahir.trim()) newErrors.tempatLahir = 'Tempat lahir wajib diisi';
    if (!formData.tanggalLahir) newErrors.tanggalLahir = 'Tanggal lahir wajib diisi';
    if (!formData.tmt) newErrors.tmt = 'TMT wajib diisi';
    if (!formData.jenjangPendidikan.trim()) newErrors.jenjangPendidikan = 'Jenjang pendidikan wajib diisi';
    if (!formData.jurusan.trim()) newErrors.jurusan = 'Jurusan wajib diisi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    if (!formData.password.trim()) newErrors.password = 'Password wajib diisi';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Password validation (minimum 6 characters)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    // NIP validation (18 digits)
    if (formData.nip && !/^\d{18}$/.test(formData.nip)) {
      newErrors.nip = 'NIP harus 18 digit angka';
    }

    // Jam mengajar validation (if provided)
    if (formData.jamMengajar && (isNaN(Number(formData.jamMengajar)) || Number(formData.jamMengajar) < 0)) {
      newErrors.jamMengajar = 'Jam mengajar harus berupa angka positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      namaLengkap: '',
      jabatan: '',
      nip: '',
      status: 'Aktif',
      tmt: '',
      unitKerja: '',
      tempatLahir: '',
      tanggalLahir: '',
      jenjangPendidikan: '',
      jurusan: '',
      statusPernikahan: 'Belum Menikah',
      tugasTambahan: '',
      mapelDiampu: '',
      jamMengajar: '',
      email: '',
      password: '',
      avatar: null,
    });
    setAvatarPreview(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    onClose();
    if (!isEdit) resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEdit ? 'Edit User' : 'Tambah User Baru'}
                </h2>
                <p className="text-blue-100">
                  {isEdit ? 'Perbarui informasi pengguna' : 'Masukkan informasi pengguna baru'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Enhanced Form Content */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Avatar Upload - Left Column */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-blue-600" />
                  Foto Profil
                </h3>
                
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-20 h-20 text-blue-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  
                  <div className="text-center mt-4">
                    <p className="text-sm font-medium text-gray-700">Upload foto profil</p>
                    <p className="text-xs text-gray-500 mt-1">Maksimal 5MB, format JPG/PNG</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Pilih File
                    </button>
                  </div>
                  
                  {errors.avatar && (
                    <p className="text-sm text-red-600 mt-2 text-center">{errors.avatar}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Form Fields - Right Columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* Enhanced Personal Information */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <UserIcon className="w-6 h-6 mr-3 text-blue-600" />
                  Informasi Pribadi
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={formData.namaLengkap}
                      onChange={(e) => handleInputChange('namaLengkap', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.namaLengkap ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-300'
                      }`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.namaLengkap && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.namaLengkap}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIP *
                    </label>
                    <input
                      type="text"
                      value={formData.nip}
                      onChange={(e) => handleInputChange('nip', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.nip ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="18 digit NIP"
                      maxLength={18}
                    />
                    {errors.nip && (
                      <p className="text-sm text-red-600 mt-1">{errors.nip}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempat Lahir *
                    </label>
                    <input
                      type="text"
                      value={formData.tempatLahir}
                      onChange={(e) => handleInputChange('tempatLahir', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.tempatLahir ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Kota tempat lahir"
                    />
                    {errors.tempatLahir && (
                      <p className="text-sm text-red-600 mt-1">{errors.tempatLahir}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Lahir *
                    </label>
                    <input
                      type="date"
                      value={formData.tanggalLahir}
                      onChange={(e) => handleInputChange('tanggalLahir', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.tanggalLahir ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.tanggalLahir && (
                      <p className="text-sm text-red-600 mt-1">{errors.tanggalLahir}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status Pernikahan
                    </label>
                    <select
                      value={formData.statusPernikahan}
                      onChange={(e) => handleInputChange('statusPernikahan', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Belum Menikah">Belum Menikah</option>
                      <option value="Menikah">Menikah</option>
                      <option value="Janda/Duda">Janda/Duda</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Enhanced Employment Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-green-600" />
                  Informasi Kepegawaian
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jabatan *
                    </label>
                    <input
                      type="text"
                      value={formData.jabatan}
                      onChange={(e) => handleInputChange('jabatan', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.jabatan ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Contoh: Guru Muda"
                    />
                    {errors.jabatan && (
                      <p className="text-sm text-red-600 mt-1">{errors.jabatan}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Kerja *
                    </label>
                    <input
                      type="text"
                      value={formData.unitKerja}
                      onChange={(e) => handleInputChange('unitKerja', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.unitKerja ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Contoh: SMP Negeri 1"
                    />
                    {errors.unitKerja && (
                      <p className="text-sm text-red-600 mt-1">{errors.unitKerja}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TMT (Tanggal Mulai Tugas) *
                    </label>
                    <input
                      type="date"
                      value={formData.tmt}
                      onChange={(e) => handleInputChange('tmt', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.tmt ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.tmt && (
                      <p className="text-sm text-red-600 mt-1">{errors.tmt}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Non-Aktif">Non-Aktif</option>
                      <option value="Pensiun">Pensiun</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tugas Tambahan
                    </label>
                    <input
                      type="text"
                      value={formData.tugasTambahan}
                      onChange={(e) => handleInputChange('tugasTambahan', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Koordinator Matematika"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Education Information */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <GraduationCap className="w-6 h-6 mr-3 text-purple-600" />
                  Informasi Pendidikan
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenjang Pendidikan *
                    </label>
                    <select
                      value={formData.jenjangPendidikan}
                      onChange={(e) => handleInputChange('jenjangPendidikan', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.jenjangPendidikan ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Pilih Jenjang</option>
                      <option value="D3">D3</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                    {errors.jenjangPendidikan && (
                      <p className="text-sm text-red-600 mt-1">{errors.jenjangPendidikan}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jurusan *
                    </label>
                    <input
                      type="text"
                      value={formData.jurusan}
                      onChange={(e) => handleInputChange('jurusan', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.jurusan ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Contoh: Pendidikan Matematika"
                    />
                    {errors.jurusan && (
                      <p className="text-sm text-red-600 mt-1">{errors.jurusan}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Teaching Information */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-amber-600" />
                  Informasi Mengajar
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Pelajaran yang Diampu
                    </label>
                    <input
                      type="text"
                      value={formData.mapelDiampu}
                      onChange={(e) => handleInputChange('mapelDiampu', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Matematika, Fisika (pisahkan dengan koma)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Pisahkan dengan koma jika lebih dari satu mata pelajaran
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jam Mengajar per Minggu
                    </label>
                    <input
                      type="number"
                      value={formData.jamMengajar}
                      onChange={(e) => handleInputChange('jamMengajar', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.jamMengajar ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Contoh: 24"
                      min="0"
                    />
                    {errors.jamMengajar && (
                      <p className="text-sm text-red-600 mt-1">{errors.jamMengajar}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Login Information */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-indigo-600" />
                  Informasi Login
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                          errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-300'
                        }`}
                        placeholder="contoh@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                          errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-300'
                        }`}
                        placeholder="Masukkan password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.password}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Password minimal 6 karakter
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Form Actions */}
          <div className="flex items-center justify-end space-x-4 mt-10 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {isSubmitting && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>
                {isSubmitting 
                  ? (isEdit ? 'Menyimpan...' : 'Menambahkan...') 
                  : (isEdit ? 'Simpan Perubahan' : 'Tambah User')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
