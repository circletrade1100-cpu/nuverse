import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuruAuth } from '../../hooks/useGuruAuth';
import { guruAuthService } from '../../services/guruAuthService';
import { 
  ArrowLeft, 
  Edit,
  Camera,
  User,
  Mail,
  GraduationCap,
  Award,
  BookOpen,
  Clock,
  Settings,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  Save,
  X,
  RefreshCw
} from 'lucide-react';

const Profil: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useGuruAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('pribadi');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Informasi Pribadi
    namaLengkap: '',
    nip: '',
    tempatLahir: '',
    tanggalLahir: '',
    statusPernikahan: '',
    
    // Informasi Kepegawaian
    jabatan: '',
    unitKerja: '',
    tmt: '',
    status: '',
    tugasTambahan: '',
    
    // Informasi Pendidikan
    jenjangPendidikan: '',
    jurusan: '',
    
    // Informasi Mengajar
    mapelDiampu: [] as string[],
    jamMengajar: 0,
    
    // Contact Info
    email: '',
    phone: '',
    alamat: '',
    avatar: ''
  });

  // Load profile data from backend
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      // Menggunakan guruAuthService.getProfile() yang sudah ada
      const profile = await guruAuthService.getProfile();
      console.log('Profile data:', profile);

      if (profile) {
        const data = profile;
        setFormData({
          namaLengkap: data.nama_lengkap || '',
          nip: data.nip || '',
          tempatLahir: data.tempat_lahir || '',
          tanggalLahir: data.tanggal_lahir || '',
          statusPernikahan: data.status_pernikahan || '',
          jabatan: data.jabatan?.nama || '',
          unitKerja: data.unit_sekolah?.nama || '',
          tmt: data.tmt || '',
          status: data.status || '',
          tugasTambahan: data.tugas_tambahan || '',
          jenjangPendidikan: data.jenjang_pendidikan || '',
          jurusan: data.jurusan || '',
          mapelDiampu: data.mapel_diampu ? (typeof data.mapel_diampu === 'string' ? data.mapel_diampu.split(',').map((m: string) => m.trim()) : data.mapel_diampu) : [],
          jamMengajar: data.jam_mengajar || 0,
          email: data.email || '',
          phone: data.no_telepon || '',
          alamat: data.alamat || '',
          avatar: data.avatar || ''
        });
      } else {
        console.error('Error loading profile: No profile data returned');
      }
    } catch (error) {
      console.error('Network error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMasaKerja = (tmtDate: string): string => {
    const tmt = new Date(tmtDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - tmt.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
    
    if (diffYears > 0) {
      return diffMonths > 0 ? `${diffYears} tahun ${diffMonths} bulan` : `${diffYears} tahun`;
    } else {
      return `${diffMonths} bulan`;
    }
  };

  const masaKerja = calculateMasaKerja(formData.tmt);

  const statsData = [
    { label: 'Masa Kerja', value: masaKerja, icon: Clock, color: 'bg-blue-500' },
    { label: 'Jam Mengajar', value: `${formData.jamMengajar} Jam/Minggu`, icon: BookOpen, color: 'bg-green-500' },
    { label: 'Mata Pelajaran', value: Array.isArray(formData.mapelDiampu) ? formData.mapelDiampu.join(', ') : (formData.mapelDiampu || '-'), icon: GraduationCap, color: 'bg-purple-500' },
    { label: 'Status', value: formData.status, icon: Award, color: 'bg-orange-500' }
  ];

  const tabsData = [
    { id: 'pribadi', label: 'Pribadi', icon: User },
    { id: 'kepegawaian', label: 'Kepegawaian', icon: Award },
    { id: 'pendidikan', label: 'Pendidikan', icon: GraduationCap },
    { id: 'mengajar', label: 'Mengajar', icon: BookOpen },
    { id: 'kontak', label: 'Kontak', icon: Mail }
  ];

  const handleInputChange = (field: string, value: string | string[] | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const profileData = {
        nama_lengkap: formData.namaLengkap,
        email: formData.email,
        no_telepon: formData.phone,
        alamat: formData.alamat
      };

      const updatedProfile = await guruAuthService.updateProfile(profileData);

      if (updatedProfile) {
        alert('Profil berhasil diperbarui!');
        setIsEditing(false);
        // Reload profile data
        await loadProfileData();
      } else {
        alert('Gagal memperbarui profil');
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert('Terjadi kesalahan saat menyimpan profil: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload data to revert changes
    loadProfileData();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/guru/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Redirect anyway if logout fails
      navigate('/guru/login');
    }
  };

  // State untuk form password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async () => {
    // Validasi
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Semua field password harus diisi!');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Password baru minimal 6 karakter!');
      return;
    }

    try {
      const passwordData = {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        new_password_confirmation: passwordForm.confirmPassword
      };

      const result = await guruAuthService.changePassword(passwordData);

      if (result.success) {
        alert('Password berhasil diubah!');
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert('Gagal mengubah password: ' + (result.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      alert('Terjadi kesalahan saat mengubah password: ' + (error.message || 'Unknown error'));
    }
  };

  const renderFormField = (label: string, field: string, type: string = 'text', options?: string[], isRequired?: boolean) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isEditing ? (
        <div>
          {type === 'select' && options ? (
            <select
              value={formData[field as keyof typeof formData] as string}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : type === 'date' ? (
            <input
              type="date"
              value={formData[field as keyof typeof formData] as string}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : type === 'number' ? (
            <input
              type="number"
              value={formData[field as keyof typeof formData] as number}
              onChange={(e) => handleInputChange(field, parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              max="40"
            />
          ) : (
            <input
              type={type}
              value={formData[field as keyof typeof formData] as string}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={`Masukkan ${label.toLowerCase()}`}
            />
          )}
        </div>
      ) : (
        <div className="bg-gray-50 px-3 py-2 rounded-lg">
          {field === 'tanggalLahir' || field === 'tmt' ? (
            <p className="text-gray-800">{new Date(formData[field as keyof typeof formData] as string).toLocaleDateString('id-ID')}</p>
          ) : field === 'jamMengajar' ? (
            <div className="flex items-center justify-between">
              <p className="text-gray-800">{formData[field]} jam/minggu</p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                formData.jamMengajar >= 24 ? 'bg-green-100 text-green-700' :
                formData.jamMengajar >= 18 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {formData.jamMengajar >= 24 ? 'Full Time' : formData.jamMengajar >= 18 ? 'Part Time' : 'Minimal'}
              </span>
            </div>
          ) : field === 'mapelDiampu' ? (
            <div className="flex flex-wrap gap-1">
              {(formData[field] as string[]).map((mapel, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {mapel}
                </span>
              ))}
            </div>
          ) : field === 'status' || field === 'statusPernikahan' ? (
            <div className="flex items-center justify-between">
              <p className="text-gray-800">{formData[field as keyof typeof formData] as string}</p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                field === 'status' ? (
                  formData.status === 'Aktif' ? 'bg-green-100 text-green-700' :
                  formData.status === 'Non-Aktif' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                ) : (
                  formData.statusPernikahan === 'Menikah' ? 'bg-green-100 text-green-700' :
                  formData.statusPernikahan === 'Belum Menikah' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                )
              }`}>
                {formData[field as keyof typeof formData] as string}
              </span>
            </div>
          ) : (
            <p className="text-gray-800">{formData[field as keyof typeof formData] as string}</p>
          )}
        </div>
      )}
    </div>
  );

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Simple Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/guru/dashboard')}
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white text-xl font-bold">Profil Guru</h1>
              <p className="text-white/80 text-sm">Kelola informasi personal</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={loadProfileData}
              disabled={isLoading}
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              {isEditing ? <X className="w-5 h-5 text-white" /> : <Edit className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <span className="text-green-600 font-bold text-xl">{getInitials(formData.namaLengkap)}</span>
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-white text-lg font-bold">{formData.namaLengkap || 'Loading...'}</h2>
                <p className="text-white/80 text-sm">{formData.jabatan || '-'}</p>
                <p className="text-white/70 text-xs">{formData.tugasTambahan || '-'} {formData.nip ? `• NIP: ${formData.nip}` : ''}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {formData.unitKerja && (
                    <span className="px-2 py-1 bg-white/20 rounded-full text-white text-xs">
                      {formData.unitKerja}
                    </span>
                  )}
                  {formData.status && (
                    <span className="px-2 py-1 bg-green-500/80 rounded-full text-white text-xs">
                      {formData.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 -mt-2">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className="font-semibold text-gray-800 text-sm">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Clean Tab Navigation */}
        <div className="bg-white rounded-xl p-1 shadow-sm mb-6">
          <div className="grid grid-cols-5 gap-1">
            {tabsData.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 px-2 py-3 rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Edit Controls */}
        {isEditing && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <div className="flex space-x-3">
              <button 
                onClick={handleCancel}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Batal</span>
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          {/* Tab Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                {(() => {
                  const currentTab = tabsData.find(tab => tab.id === activeTab);
                  if (currentTab) {
                    const IconComponent = currentTab.icon;
                    return <IconComponent className="w-5 h-5 text-green-600" />;
                  }
                  return null;
                })()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {activeTab === 'pribadi' && 'Informasi Pribadi'}
                  {activeTab === 'kepegawaian' && 'Informasi Kepegawaian'}
                  {activeTab === 'pendidikan' && 'Informasi Pendidikan'}
                  {activeTab === 'mengajar' && 'Informasi Mengajar'}
                  {activeTab === 'kontak' && 'Informasi Kontak'}
                </h3>
                <p className="text-sm text-gray-600">
                  {activeTab === 'pribadi' && 'Data personal dan identitas diri'}
                  {activeTab === 'kepegawaian' && 'Data kepegawaian dan status kerja'}
                  {activeTab === 'pendidikan' && 'Riwayat pendidikan dan kualifikasi'}
                  {activeTab === 'mengajar' && 'Detail mata pelajaran dan beban mengajar'}
                  {activeTab === 'kontak' && 'Data kontak dan komunikasi'}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'pribadi' && (
              <div className="grid grid-cols-1 gap-4">
                {renderFormField('Nama Lengkap', 'namaLengkap', 'text', undefined, true)}
                {renderFormField('NIP', 'nip')}
                {renderFormField('Tempat Lahir', 'tempatLahir')}
                {renderFormField('Tanggal Lahir', 'tanggalLahir', 'date')}
                {renderFormField('Status Pernikahan', 'statusPernikahan', 'select', ['Belum Menikah', 'Menikah', 'Cerai'])}
              </div>
            )}

            {activeTab === 'kepegawaian' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {renderFormField('Jabatan', 'jabatan', 'select', ['Guru Utama', 'Guru Madya', 'Guru Muda', 'Guru Pertama'])}
                  {renderFormField('Unit Kerja', 'unitKerja')}
                  {renderFormField('TMT (Tanggal Mulai Tugas)', 'tmt', 'date')}
                  {renderFormField('Status', 'status', 'select', ['Aktif', 'Non-Aktif', 'Pensiun'])}
                  {renderFormField('Tugas Tambahan', 'tugasTambahan')}
                </div>
                {!isEditing && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Masa Kerja</p>
                        <p className="text-green-600 text-sm">{masaKerja}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pendidikan' && (
              <div className="grid grid-cols-1 gap-4">
                {renderFormField('Jenjang Pendidikan', 'jenjangPendidikan', 'select', ['D3', 'S1', 'S2', 'S3'])}
                {renderFormField('Jurusan', 'jurusan')}
              </div>
            )}

            {activeTab === 'mengajar' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Mata Pelajaran yang Diampu</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={Array.isArray(formData.mapelDiampu) ? formData.mapelDiampu.join(', ') : (formData.mapelDiampu || '-')}
                      onChange={(e) => handleInputChange('mapelDiampu', e.target.value.split(', '))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Contoh: Matematika, IPA"
                    />
                  ) : (
                    <div className="bg-gray-50 px-3 py-2 rounded-lg">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(formData.mapelDiampu) ? formData.mapelDiampu.map((mapel, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {mapel}
                          </span>
                        )) : <span className="text-gray-500">{formData.mapelDiampu || 'Tidak ada'}</span>}
                      </div>
                    </div>
                  )}
                </div>
                {renderFormField('Jam Mengajar per Minggu', 'jamMengajar', 'number')}
              </div>
            )}

            {activeTab === 'kontak' && (
              <div className="grid grid-cols-1 gap-4">
                {renderFormField('Email', 'email', 'email')}
                {renderFormField('Nomor Telepon', 'phone', 'tel')}
              </div>
            )}
          </div>
        </div>

        {/* Settings Menu */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <span>Pengaturan Akun</span>
          </h3>
          
          <div className="space-y-2">
            {[
              { icon: Settings, title: 'Pengaturan Umum', color: 'text-gray-600', onClick: () => {} },
              { icon: Bell, title: 'Notifikasi', color: 'text-blue-600', onClick: () => {} },
              { icon: Shield, title: 'Keamanan & Privasi', color: 'text-green-600', onClick: () => {} },
              { icon: LogOut, title: 'Keluar dari Akun', color: 'text-red-600', onClick: handleLogout }
            ].map((item, index) => (
              <button 
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-medium text-gray-800">{item.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span>Keamanan Akun</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Password Lama</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password lama"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  type="button"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Password Baru</label>
              <input
                type="password"
                placeholder="Masukkan password baru (min. 6 karakter)"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Konfirmasi Password</label>
              <input
                type="password"
                placeholder="Konfirmasi password baru"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <button 
              onClick={handlePasswordChange}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Ubah Password</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;