import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, GraduationCap, Building, Shield, Lock, Eye, EyeOff, School } from 'lucide-react';
import type { 
  UserType, 
  Parent,
  Guru,
  Manajemen
} from '../../types/user';
import { unitKerjaService } from '../../services/unitKerjaService';
import type { UnitKerja } from '../../types/masterData';
import { jabatanService, type Jabatan } from '../../services/jabatanService';
import { roleService } from '../../services/roleService';
import type { Role as RoleType } from '../../types/role';

interface DynamicUserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  userType: UserType;
  isEdit?: boolean;
  initialData?: Parent | Guru | Manajemen | null;
}

const DynamicUserFormModal: React.FC<DynamicUserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userType,
  isEdit = false,
  initialData
}) => {
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Master Data state
  const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
  const [unitSekolahList, setUnitSekolahList] = useState<any[]>([]);
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
  const [roleList, setRoleList] = useState<RoleType[]>([]);
  const [masterDataLoading, setMasterDataLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        // Saat edit, kosongkan field password untuk keamanan
        setFormData({
          ...initialData,
          password: '',
          confirmPassword: ''
        });
      } else {
        // Reset form untuk user baru
        switch (userType) {
          case 'parents':
            setFormData({
              nisn: '',
              namaOrangTua: '',
              namaAnak: '',
              status: 'Aktif',
              email: '',
              noTelepon: '',
              password: '',
              confirmPassword: ''
            });
            break;
          case 'guru':
            setFormData({
              nip: '',
              namaLengkap: '',
              jabatan: '',
              status: 'Aktif',
              mapelDiampu: '',
              jamMengajar: '',
              email: '',
              password: '',
              confirmPassword: ''
            });
            break;
          case 'manajemen':
            setFormData({
              nip: '',
              namaLengkap: '',
              jabatan: '',
              unitKerja: '',
              role: '',
              status: 'Aktif',
              email: '',
              password: '',
              confirmPassword: ''
            });
            break;
        }
      }
      setErrors({});
      
      // Load master data for management and guru forms
      if (userType === 'manajemen' || userType === 'guru') {
        loadMasterData();
      }
    }
  }, [isOpen, isEdit, initialData, userType]);

  const loadMasterData = async () => {
    setMasterDataLoading(true);
    try {
      const promises = [];
      
      // Load Unit Kerja for management forms
      if (userType === 'manajemen') {
        promises.push(
          unitKerjaService.getAll({ status: 'Aktif' }).then(response => {
            if (response.success) {
              setUnitKerjaList(response.data.data);
            }
          })
        );
        
        // Load Unit Sekolah
        promises.push(
          fetch('https://nurverse.id/api/master-data/unit-sekolahs?status=Aktif&per_page=100')
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                setUnitSekolahList(data.data.data || []);
              }
            })
            .catch(error => {
              console.error('Error loading unit sekolah:', error);
            })
        );
        
        // Load Roles for management forms
        promises.push(
          roleService.getRoles().then(roles => {
            setRoleList(roles.filter(role => role.isActive));
          })
        );
      }
      
      // Load Jabatan for both management and guru forms
      promises.push(
        jabatanService.getAll({ status: 'Aktif' }).then(response => {
          if (response.success) {
            setJabatanList(response.data.data);
          }
        })
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setMasterDataLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error untuk field yang diubah
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validasi umum untuk semua user type
    if (!formData.email?.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validasi password
    if (!isEdit) {
      // Validasi untuk user baru - password wajib
      if (!formData.password?.trim()) {
        newErrors.password = 'Password wajib diisi';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }

      if (!formData.confirmPassword?.trim()) {
        newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Password tidak cocok';
      }
    } else {
      // Validasi untuk edit - password opsional, tapi jika diisi harus valid
      if (formData.password?.trim()) {
        if (formData.password.length < 6) {
          newErrors.password = 'Password minimal 6 karakter';
        }

        if (!formData.confirmPassword?.trim()) {
          newErrors.confirmPassword = 'Konfirmasi password wajib diisi jika mengubah password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Password tidak cocok';
        }
      } else if (formData.confirmPassword?.trim()) {
        // Jika konfirmasi password diisi tapi password kosong
        newErrors.password = 'Password harus diisi jika ingin mengubah password';
      }
    }

    switch (userType) {
      case 'parents':
        if (!formData.nisn?.trim()) newErrors.nisn = 'NISN wajib diisi';
        if (!formData.namaOrangTua?.trim()) newErrors.namaOrangTua = 'Nama Orang Tua wajib diisi';
        if (!formData.namaAnak?.trim()) newErrors.namaAnak = 'Nama Anak wajib diisi';
        break;
      case 'guru':
        if (!formData.nip?.trim()) newErrors.nip = 'NIP wajib diisi';
        if (!formData.namaLengkap?.trim()) newErrors.namaLengkap = 'Nama Lengkap wajib diisi';
        if (!formData.jabatan?.trim()) newErrors.jabatan = 'Jabatan wajib diisi';
        break;
      case 'manajemen':
        if (!formData.nip?.trim()) newErrors.nip = 'NIP wajib diisi';
        if (!formData.namaLengkap?.trim()) newErrors.namaLengkap = 'Nama Lengkap wajib diisi';
        if (!formData.jabatan?.trim()) newErrors.jabatan = 'Jabatan wajib diisi';
        if (!formData.unitKerja?.trim()) newErrors.unitKerja = 'Unit Kerja wajib diisi';
        if (!formData.role?.trim()) newErrors.role = 'Role wajib diisi';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function untuk render password fields
  const renderPasswordFields = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isEdit ? 'Password Baru (Opsional)' : 'Password'} 
            {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password || ''}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder={isEdit ? "Kosongkan jika tidak ingin mengubah password" : "Masukkan password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          {isEdit && (
            <p className="text-gray-500 text-sm mt-1">
              Kosongkan field ini jika tidak ingin mengubah password
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isEdit ? 'Konfirmasi Password Baru' : 'Konfirmasi Password'} 
            {!isEdit && <span className="text-red-500">*</span>}
            {isEdit && formData.password && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword || ''}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder={isEdit ? "Konfirmasi password baru" : "Konfirmasi password"}
              disabled={isEdit && !formData.password}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isEdit && !formData.password}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          {isEdit && (
            <p className="text-gray-500 text-sm mt-1">
              Wajib diisi jika mengubah password
            </p>
          )}
        </div>
      </div>
    );
  };

  const getModalConfig = () => {
    switch (userType) {
      case 'parents':
        return {
          title: isEdit ? 'Edit Data Orang Tua' : 'Tambah Data Orang Tua',
          icon: User,
          color: 'blue'
        };
      case 'guru':
        return {
          title: isEdit ? 'Edit Data Guru' : 'Tambah Data Guru',
          icon: GraduationCap,
          color: 'green'
        };
      case 'manajemen':
        return {
          title: isEdit ? 'Edit Data Manajemen' : 'Tambah Data Manajemen',
          icon: Shield,
          color: 'purple'
        };
      default:
        return {
          title: 'Form User',
          icon: User,
          color: 'blue'
        };
    }
  };

  const renderFormFields = () => {
    switch (userType) {
      case 'parents':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NISN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nisn || ''}
                  onChange={(e) => handleInputChange('nisn', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.nisn ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Masukkan NISN"
                />
                {errors.nisn && <p className="text-red-500 text-sm mt-1">{errors.nisn}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status || 'Aktif'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Orang Tua <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.namaOrangTua || ''}
                onChange={(e) => handleInputChange('namaOrangTua', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.namaOrangTua ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Masukkan nama orang tua"
              />
              {errors.namaOrangTua && <p className="text-red-500 text-sm mt-1">{errors.namaOrangTua}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Anak <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.namaAnak || ''}
                onChange={(e) => handleInputChange('namaAnak', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.namaAnak ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Masukkan nama anak"
              />
              {errors.namaAnak && <p className="text-red-500 text-sm mt-1">{errors.namaAnak}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="email@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  No. Telepon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.noTelepon || ''}
                    onChange={(e) => handleInputChange('noTelepon', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="08123456789"
                  />
                </div>
              </div>
            </div>

            {/* Password Fields */}
            {renderPasswordFields()}
          </>
        );

      case 'guru':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NIP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nip || ''}
                  onChange={(e) => handleInputChange('nip', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.nip ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Masukkan NIP"
                />
                {errors.nip && <p className="text-red-500 text-sm mt-1">{errors.nip}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status || 'Aktif'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                  <option value="Pensiun">Pensiun</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.namaLengkap || ''}
                onChange={(e) => handleInputChange('namaLengkap', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  errors.namaLengkap ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Masukkan nama lengkap"
              />
              {errors.namaLengkap && <p className="text-red-500 text-sm mt-1">{errors.namaLengkap}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jabatan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.jabatan || ''}
                onChange={(e) => handleInputChange('jabatan', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  errors.jabatan ? 'border-red-500' : 'border-gray-200'
                }`}
                disabled={masterDataLoading}
              >
                <option value="">Pilih Jabatan</option>
                {jabatanList.map((jabatan) => (
                  <option key={jabatan.id} value={jabatan.nama}>
                    {jabatan.nama}
                  </option>
                ))}
              </select>
              {masterDataLoading && <p className="text-gray-500 text-sm mt-1">Memuat data jabatan...</p>}
              {errors.jabatan && <p className="text-red-500 text-sm mt-1">{errors.jabatan}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  value={formData.mapelDiampu || ''}
                  onChange={(e) => handleInputChange('mapelDiampu', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Matematika, IPA"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jam Mengajar/Minggu
                </label>
                <input
                  type="number"
                  value={formData.jamMengajar || ''}
                  onChange={(e) => handleInputChange('jamMengajar', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="24"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="email@sekolah.ac.id"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password Fields */}
            {renderPasswordFields()}
          </>
        );

      case 'manajemen':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NIP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nip || ''}
                  onChange={(e) => handleInputChange('nip', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.nip ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Masukkan NIP"
                />
                {errors.nip && <p className="text-red-500 text-sm mt-1">{errors.nip}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status || 'Aktif'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
            </div>

            {/* Nama Lengkap - Full Width */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.namaLengkap || ''}
                  onChange={(e) => handleInputChange('namaLengkap', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.namaLengkap ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              {errors.namaLengkap && <p className="text-red-500 text-sm mt-1">{errors.namaLengkap}</p>}
            </div>

            {/* Email - Full Width */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="email@sekolah.ac.id"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Jabatan & Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jabatan || ''}
                  onChange={(e) => handleInputChange('jabatan', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.jabatan ? 'border-red-500' : 'border-gray-200'
                  }`}
                  disabled={masterDataLoading}
                >
                  <option value="">Pilih Jabatan</option>
                  {jabatanList.map((jabatan) => (
                    <option key={jabatan.id} value={jabatan.nama}>
                      {jabatan.nama}
                    </option>
                  ))}
                </select>
                {masterDataLoading && <p className="text-gray-500 text-sm mt-1">Memuat data jabatan...</p>}
                {errors.jabatan && <p className="text-red-500 text-sm mt-1">{errors.jabatan}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.role || ''}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.role ? 'border-red-500' : 'border-gray-200'
                    }`}
                    disabled={masterDataLoading}
                  >
                    <option value="">Pilih Role</option>
                    {roleList.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                {masterDataLoading && <p className="text-gray-500 text-sm mt-1">Memuat data role...</p>}
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>
            </div>

            {/* Unit Kerja & Unit Sekolah */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit Kerja <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.unitKerja || ''}
                    onChange={(e) => handleInputChange('unitKerja', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.unitKerja ? 'border-red-500' : 'border-gray-200'
                    }`}
                    disabled={masterDataLoading}
                  >
                    <option value="">Pilih Unit Kerja</option>
                    {unitKerjaList.map((unitKerja) => (
                      <option key={unitKerja.id} value={unitKerja.nama}>
                        {unitKerja.nama}
                      </option>
                    ))}
                  </select>
                </div>
                {masterDataLoading && <p className="text-gray-500 text-sm mt-1">Memuat data unit kerja...</p>}
                {errors.unitKerja && <p className="text-red-500 text-sm mt-1">{errors.unitKerja}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit Sekolah
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.unitSekolah || ''}
                    onChange={(e) => handleInputChange('unitSekolah', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.unitSekolah ? 'border-red-500' : 'border-gray-200'
                    }`}
                    disabled={masterDataLoading}
                  >
                    <option value="">Pilih Unit Sekolah</option>
                    {unitSekolahList.map((unitSekolah) => (
                      <option key={unitSekolah.id} value={unitSekolah.nama}>
                        {unitSekolah.nama} ({unitSekolah.jenjang})
                      </option>
                    ))}
                  </select>
                </div>
                {masterDataLoading && <p className="text-gray-500 text-sm mt-1">Memuat data unit sekolah...</p>}
                {errors.unitSekolah && <p className="text-red-500 text-sm mt-1">{errors.unitSekolah}</p>}
              </div>
            </div>

            {/* Password Fields */}
            {renderPasswordFields()}
          </>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const config = getModalConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${
          config.color === 'blue' ? 'from-blue-500 to-blue-600' :
          config.color === 'green' ? 'from-green-500 to-green-600' :
          'from-purple-500 to-purple-600'
        } px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">{config.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderFormFields()}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 text-white rounded-xl font-medium transition-all ${
                  config.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                  config.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-purple-600 hover:bg-purple-700'
                } ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
              >
                {isLoading ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DynamicUserFormModal;
