import React, { useState, useRef, useEffect } from 'react';
import { 
  X, UserIcon, Camera, Eye, EyeOff, Briefcase, 
  GraduationCap, BookOpen, Phone, Lock, DollarSign 
} from 'lucide-react';
import type { GuruFormData } from '../../types/guru';
import { guruService } from '../../services/guruService';

interface GuruFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GuruFormData) => Promise<void>;
  initialData?: GuruFormData;
  isEdit?: boolean;
}

const GuruFormModal: React.FC<GuruFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<GuruFormData>({
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
    noTelepon: '',
    alamat: '',
    username: '',
    password: '',
    avatar: null,
    // Payroll fields
    gajiPokok: '0',
    tunjanganJabatan: '0',
    tunjanganMasaKerja: '0',
    waliKelas: '0',
    koordinator: '0',
    tatapMuka: '0',
    tMukaPengganti: '0',
    tunjKeluarga: '0',
    transport1: '0',
    transport2: '0',
    makan: '0',
    jamsostek: '0',
    overtime: '0',
    pramuka: '0',
    tunjLain: '0',
    ekskul: '0',
    bpjs: '0',
    bimbel: '0',
    insentifPengPramuka: '0',
    insentifPengEkskul: '0',
    insentifPengProyek: '0',
    insentifPengurusBimbel: '0',
    // Bank fields
    namaBank: '',
    noRekening: '',
    proyek: '0',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [jabatans, setJabatans] = useState<any[]>([]);
  const [unitSekolahs, setUnitSekolahs] = useState<any[]>([]);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load form data when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, isEdit:', isEdit);
      loadFormData(); // Load dropdowns
    }
  }, [isOpen]);

  // Populate form data when editing
  useEffect(() => {
    if (isOpen && isEdit && initialData) {
      console.log('=== EDIT MODE ===');
      console.log('isEdit:', isEdit);
      console.log('initialData received:', initialData);
      
      // Small delay to ensure form is ready
      setTimeout(() => {
        const populatedData = {
          namaLengkap: initialData.namaLengkap || '',
          jabatan: initialData.jabatan || '',
          nip: initialData.nip || '',
          status: initialData.status || 'Aktif',
          tmt: initialData.tmt || '',
          unitKerja: initialData.unitKerja || '',
          tempatLahir: initialData.tempatLahir || '',
          tanggalLahir: initialData.tanggalLahir || '',
          jenjangPendidikan: initialData.jenjangPendidikan || '',
          jurusan: initialData.jurusan || '',
          statusPernikahan: initialData.statusPernikahan || 'Belum Menikah',
          tugasTambahan: initialData.tugasTambahan || '',
          mapelDiampu: initialData.mapelDiampu || '',
          jamMengajar: initialData.jamMengajar || '',
          email: initialData.email || '',
          noTelepon: initialData.noTelepon || '',
          alamat: initialData.alamat || '',
          username: initialData.username || '',
          password: '', // Always empty for security
          avatar: null,
          // Payroll fields
          gajiPokok: initialData.gajiPokok || '0',
          tunjanganJabatan: initialData.tunjanganJabatan || '0',
          tunjanganMasaKerja: initialData.tunjanganMasaKerja || '0',
          waliKelas: initialData.waliKelas || '0',
          koordinator: initialData.koordinator || '0',
          tatapMuka: initialData.tatapMuka || '0',
          tMukaPengganti: initialData.tMukaPengganti || '0',
          tunjKeluarga: initialData.tunjKeluarga || '0',
          transport1: initialData.transport1 || '0',
          transport2: initialData.transport2 || '0',
          makan: initialData.makan || '0',
          jamsostek: initialData.jamsostek || '0',
          overtime: initialData.overtime || '0',
          pramuka: initialData.pramuka || '0',
          tunjLain: initialData.tunjLain || '0',
          ekskul: initialData.ekskul || '0',
          bpjs: initialData.bpjs || '0',
          bimbel: initialData.bimbel || '0',
          insentifPengPramuka: initialData.insentifPengPramuka || '0',
          insentifPengEkskul: initialData.insentifPengEkskul || '0',
          insentifPengProyek: initialData.insentifPengProyek || '0',
          insentifPengurusBimbel: initialData.insentifPengurusBimbel || '0',
          // Bank fields
          namaBank: initialData.namaBank || '',
          noRekening: initialData.noRekening || '',
          proyek: initialData.proyek || '0',
        };
        
        console.log('Setting form data to:', populatedData);
        setFormData(populatedData);
      }, 100);
    } else if (isOpen && !isEdit) {
      console.log('=== CREATE MODE ===');
      resetForm(); // Reset form for new entry
    }
  }, [isOpen, isEdit, initialData]);

  const loadFormData = async () => {
    try {
      setIsLoadingFormData(true);
      const response = await guruService.getFormData();
      if (response.success) {
        setJabatans(response.data.jabatans);
        setUnitSekolahs(response.data.unit_sekolahs);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoadingFormData(false);
    }
  };

  const resetForm = () => {
    console.log('=== RESETTING FORM ===');
    setFormData({
      namaLengkap: '', jabatan: '', nip: '', status: 'Aktif', tmt: '', unitKerja: '',
      tempatLahir: '', tanggalLahir: '', jenjangPendidikan: '', jurusan: '',
      statusPernikahan: 'Belum Menikah', tugasTambahan: '', mapelDiampu: '',
      jamMengajar: '', email: '', noTelepon: '', alamat: '', username: '',
      password: '', avatar: null,
      // Payroll fields
      gajiPokok: '0', tunjanganJabatan: '0', tunjanganMasaKerja: '0',
      waliKelas: '0', koordinator: '0', tatapMuka: '0', tMukaPengganti: '0',
      tunjKeluarga: '0', transport1: '0', transport2: '0', makan: '0',
      jamsostek: '0', overtime: '0', pramuka: '0', tunjLain: '0',
      ekskul: '0', bpjs: '0', bimbel: '0',
      insentifPengPramuka: '0', insentifPengEkskul: '0', insentifPengProyek: '0', insentifPengurusBimbel: '0',
      namaBank: '', noRekening: '', proyek: '0',
    });
    setAvatarPreview(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatRupiah = (value: string): string => {
    const numberString = value.replace(/[^\d]/g, '');
    if (!numberString) return '';
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePayrollInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = formatRupiah(value);
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, avatar: 'Format file harus JPG atau PNG' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'Ukuran file maksimal 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, avatar: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Nama lengkap wajib diisi';
    if (!formData.jabatan) newErrors.jabatan = 'Jabatan wajib dipilih';
    if (!formData.nip.trim()) newErrors.nip = 'NIP wajib diisi';
    if (!formData.unitKerja) newErrors.unitKerja = 'Unit kerja wajib dipilih';
    if (!formData.username.trim()) newErrors.username = 'Username wajib diisi';
    if (!isEdit && !formData.password.trim()) newErrors.password = 'Password wajib diisi';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
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
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  // Helper function for consistent input styling
  const inputClasses = (hasError: boolean) => 
    `w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 ${
      hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
    }`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <UserIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEdit ? 'Edit Data Guru' : 'Tambah Guru Baru'}
                </h2>
                <p className="text-blue-100 mt-1">
                  {isEdit ? 'Perbarui informasi data guru' : 'Lengkapi form untuk menambah guru baru'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Avatar Upload - Left Column */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Camera className="w-5 h-5 text-blue-600" />
                    </div>
                    Foto Profil
                  </h3>
                  
                  <div className="flex flex-col items-center">
                    <div 
                      className="relative w-40 h-40 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 border-3 border-dashed border-blue-300 flex items-center justify-center mb-4 group cursor-pointer overflow-hidden hover:from-blue-200 hover:to-blue-300 transition-all duration-300"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm text-blue-600 font-medium">Klik untuk upload</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Upload Foto Profil</p>
                      <p className="text-xs text-gray-500 mt-1">Maksimal 5MB • JPG, PNG</p>
                      {errors.avatar && (
                        <p className="text-sm text-red-600 mt-2">{errors.avatar}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields - Right Columns */}
              <div className="lg:col-span-3 space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      Informasi Pribadi
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        name="namaLengkap"
                        value={formData.namaLengkap}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.namaLengkap)}
                        placeholder="Masukkan nama lengkap"
                      />
                      {errors.namaLengkap && (
                        <p className="text-sm text-red-600 mt-1">{errors.namaLengkap}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NIP *
                      </label>
                      <input
                        type="text"
                        name="nip"
                        value={formData.nip}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.nip)}
                        placeholder="Masukkan NIP"
                      />
                      {errors.nip && (
                        <p className="text-sm text-red-600 mt-1">{errors.nip}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tempat Lahir
                      </label>
                      <input
                        type="text"
                        name="tempatLahir"
                        value={formData.tempatLahir}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.tempatLahir)}
                        placeholder="Masukkan tempat lahir"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Lahir
                      </label>
                      <input
                        type="date"
                        name="tanggalLahir"
                        value={formData.tanggalLahir}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.tanggalLahir)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status Pernikahan
                      </label>
                      <select
                        name="statusPernikahan"
                        value={formData.statusPernikahan}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.statusPernikahan)}
                      >
                        <option value="Belum Menikah">Belum Menikah</option>
                        <option value="Menikah">Menikah</option>
                        <option value="Janda/Duda">Janda/Duda</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Briefcase className="w-5 h-5 text-green-600" />
                      </div>
                      Informasi Kepegawaian
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jabatan *
                      </label>
                      {isLoadingFormData ? (
                        <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 animate-pulse">
                          <div className="h-5 bg-gray-200 rounded"></div>
                        </div>
                      ) : (
                        <select
                          name="jabatan"
                          value={formData.jabatan}
                          onChange={handleInputChange}
                          className={inputClasses(!!errors.jabatan)}
                        >
                          <option value="">Pilih Jabatan</option>
                          {jabatans.map((jabatan) => (
                            <option key={jabatan.id} value={jabatan.id}>
                              {jabatan.nama}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.jabatan && (
                        <p className="text-sm text-red-600 mt-1">{errors.jabatan}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Kerja *
                      </label>
                      {isLoadingFormData ? (
                        <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 animate-pulse">
                          <div className="h-5 bg-gray-200 rounded"></div>
                        </div>
                      ) : (
                        <select
                          name="unitKerja"
                          value={formData.unitKerja}
                          onChange={handleInputChange}
                          className={inputClasses(!!errors.unitKerja)}
                        >
                          <option value="">Pilih Unit Kerja</option>
                          {unitSekolahs.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.nama}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.unitKerja && (
                        <p className="text-sm text-red-600 mt-1">{errors.unitKerja}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.status)}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Non-Aktif">Non-Aktif</option>
                        <option value="Pensiun">Pensiun</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        TMT (Terhitung Mulai Tanggal)
                      </label>
                      <input
                        type="date"
                        name="tmt"
                        value={formData.tmt}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.tmt)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tugas Tambahan
                      </label>
                      <input
                        type="text"
                        name="tugasTambahan"
                        value={formData.tugasTambahan}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.tugasTambahan)}
                        placeholder="Masukkan tugas tambahan (jika ada)"
                      />
                    </div>
                  </div>
                </div>

                {/* Education Information */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                      </div>
                      Informasi Pendidikan
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenjang Pendidikan
                      </label>
                      <select
                        name="jenjangPendidikan"
                        value={formData.jenjangPendidikan}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.jenjangPendidikan)}
                      >
                        <option value="">Pilih Jenjang</option>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA/SMK">SMA/SMK</option>
                        <option value="D3">D3</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jurusan
                      </label>
                      <input
                        type="text"
                        name="jurusan"
                        value={formData.jurusan}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.jurusan)}
                        placeholder="Masukkan jurusan"
                      />
                    </div>
                  </div>
                </div>

                {/* Teaching Information */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <BookOpen className="w-5 h-5 text-orange-600" />
                      </div>
                      Informasi Mengajar
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mata Pelajaran Diampu
                      </label>
                      <input
                        type="text"
                        name="mapelDiampu"
                        value={formData.mapelDiampu}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.mapelDiampu)}
                        placeholder="Contoh: Matematika, Fisika"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Pisahkan dengan koma jika lebih dari satu
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jam Mengajar (per minggu)
                      </label>
                      <input
                        type="number"
                        name="jamMengajar"
                        value={formData.jamMengajar}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.jamMengajar)}
                        placeholder="24"
                        min="0"
                        max="168"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      Informasi Kontak
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.email)}
                        placeholder="contoh@email.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telepon
                      </label>
                      <input
                        type="tel"
                        name="noTelepon"
                        value={formData.noTelepon}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.noTelepon)}
                        placeholder="08123456789"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat
                      </label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.alamat)}
                        placeholder="Masukkan alamat lengkap"
                      />
                    </div>
                  </div>
                </div>

                {/* Login Information */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg mr-3">
                        <Lock className="w-5 h-5 text-red-600" />
                      </div>
                      Informasi Login
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={inputClasses(!!errors.username)}
                        placeholder="Masukkan username"
                      />
                      {errors.username && (
                        <p className="text-sm text-red-600 mt-1">{errors.username}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Username untuk login ke Dashboard Guru
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password {!isEdit && '*'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`${inputClasses(!!errors.password)} pr-12`}
                          placeholder={isEdit ? "••••••••" : "Masukkan password"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {isEdit ? (
                          <span className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Password sudah tersimpan. Isi hanya jika ingin mengubah.
                          </span>
                        ) : (
                          'Password untuk login ke Dashboard Guru'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payroll Information */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      Informasi Payroll
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gaji Pokok
                      </label>
                      <input
                        type="text"
                        name="gajiPokok"
                        value={formData.gajiPokok}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tunjangan Jabatan
                      </label>
                      <input
                        type="text"
                        name="tunjanganJabatan"
                        value={formData.tunjanganJabatan}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tunjangan Masa Kerja
                      </label>
                      <input
                        type="text"
                        name="tunjanganMasaKerja"
                        value={formData.tunjanganMasaKerja}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wali Kelas
                      </label>
                      <input
                        type="text"
                        name="waliKelas"
                        value={formData.waliKelas}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Koordinator
                      </label>
                      <input
                        type="text"
                        name="koordinator"
                        value={formData.koordinator}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tatap Muka
                      </label>
                      <input
                        type="text"
                        name="tatapMuka"
                        value={formData.tatapMuka}
                        onChange={handleInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        T. Muka Pengganti
                      </label>
                      <input
                        type="text"
                        name="tMukaPengganti"
                        value={formData.tMukaPengganti}
                        onChange={handleInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tunjangan Keluarga
                      </label>
                      <input
                        type="text"
                        name="tunjKeluarga"
                        value={formData.tunjKeluarga}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transport 1
                      </label>
                      <input
                        type="text"
                        name="transport1"
                        value={formData.transport1}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transport 2
                      </label>
                      <input
                        type="text"
                        name="transport2"
                        value={formData.transport2}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Makan
                      </label>
                      <input
                        type="text"
                        name="makan"
                        value={formData.makan}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jamsostek
                      </label>
                      <input
                        type="text"
                        name="jamsostek"
                        value={formData.jamsostek}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overtime
                      </label>
                      <input
                        type="text"
                        name="overtime"
                        value={formData.overtime}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pramuka
                      </label>
                      <input
                        type="text"
                        name="pramuka"
                        value={formData.pramuka}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tunjangan Lain
                      </label>
                      <input
                        type="text"
                        name="tunjLain"
                        value={formData.tunjLain}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ekskul
                      </label>
                      <input
                        type="text"
                        name="ekskul"
                        value={formData.ekskul}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        BPJS
                      </label>
                      <input
                        type="text"
                        name="bpjs"
                        value={formData.bpjs}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bimbel
                      </label>
                      <input
                        type="text"
                        name="bimbel"
                        value={formData.bimbel}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proyek
                      </label>
                      <input
                        type="text"
                        name="proyek"
                        value={formData.proyek}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insentif Peng. Pramuka
                      </label>
                      <input
                        type="text"
                        name="insentifPengPramuka"
                        value={formData.insentifPengPramuka}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insentif Peng. Ekskul
                      </label>
                      <input
                        type="text"
                        name="insentifPengEkskul"
                        value={formData.insentifPengEkskul}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insentif Peng. Proyek
                      </label>
                      <input
                        type="text"
                        name="insentifPengProyek"
                        value={formData.insentifPengProyek}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insentif Pengurus Bimbel
                      </label>
                      <input
                        type="text"
                        name="insentifPengurusBimbel"
                        value={formData.insentifPengurusBimbel}
                        onChange={handlePayrollInputChange}
                        className={inputClasses(false)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Informasi Bank */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-4 rounded-xl mb-6 border border-amber-200">
                    <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Informasi Bank
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Bank
                      </label>
                      <select
                        name="namaBank"
                        value={formData.namaBank}
                        onChange={handleInputChange}
                        className={inputClasses(false)}
                      >
                        <option value="">Pilih Bank</option>
                        <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                        <option value="BJB Syariah">BJB Syariah</option>
                        
                        <option value="Tunai">Tunai</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No Rekening Bank
                      </label>
                      <input
                        type="text"
                        name="noRekening"
                        value={formData.noRekening}
                        onChange={handleInputChange}
                        className={inputClasses(false)}
                        placeholder="Contoh: 1234567890"
                        disabled={formData.namaBank === 'Tunai'}
                      />
                      {formData.namaBank === 'Tunai' && (
                        <p className="text-xs text-gray-500 mt-1">Tidak perlu no rekening untuk pembayaran tunai</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-2xl -m-8 mt-8">
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg transition-all duration-200"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>
                    {isSubmitting 
                      ? (isEdit ? 'Menyimpan...' : 'Menambahkan...') 
                      : (isEdit ? 'Simpan Perubahan' : 'Tambah Guru')
                    }
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GuruFormModal;
