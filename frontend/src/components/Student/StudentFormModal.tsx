import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, User as UserIcon, School, Users, Camera, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import type { StudentFormData, Student } from '../../types/student';
import type { UnitSekolah, UnitKelas } from '../../types/masterData';
import { unitSekolahService } from '../../services/unitSekolahService';
import { unitKelasService } from '../../services/unitKelasService';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: StudentFormData) => Promise<Student>;
  isEdit?: boolean;
  initialData?: Partial<StudentFormData>;
  editingStudent?: Student; // Add this for avatar URL
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit = false,
  initialData,
  editingStudent,
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    namaLengkap: initialData?.namaLengkap || '',
    namaPanggilan: initialData?.namaPanggilan || '',
    tempatLahir: initialData?.tempatLahir || '',
    tanggalLahir: initialData?.tanggalLahir || '',
    namaIbu: initialData?.namaIbu || '',
    namaAyah: initialData?.namaAyah || '',
    nomorHP: initialData?.nomorHP || '',
    alamat: initialData?.alamat || '',
    email: initialData?.email || '',
    unitSekolah: initialData?.unitSekolah || '',
    unitKelas: initialData?.unitKelas || '',
    nisn: initialData?.nisn || '',
    password: initialData?.password || '',
    avatar: null,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unitSekolahs, setUnitSekolahs] = useState<UnitSekolah[]>([]);
  const [unitKelasList, setUnitKelasList] = useState<UnitKelas[]>([]);
  const [loadingUnitData, setLoadingUnitData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Debug states
  const [showDebugPanel, setShowDebugPanel] = useState(false); // Disable debug by default
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [submitSteps, setSubmitSteps] = useState<{step: string, status: 'pending' | 'loading' | 'success' | 'error', message?: string}[]>([]);
  const [keepModalOpen, setKeepModalOpen] = useState(false);
  const [autoCloseTimer, setAutoCloseTimer] = useState<number | null>(null);
  const [lastApiResponse, setLastApiResponse] = useState<any>(null);

  // Debug helper functions
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-10)); // Keep last 10 logs
  };

  const updateSubmitStep = (step: string, status: 'pending' | 'loading' | 'success' | 'error', message?: string) => {
    setSubmitSteps(prev => {
      const existingIndex = prev.findIndex(s => s.step === step);
      const newStep = { step, status, message };
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newStep;
        return updated;
      }
      return [...prev, newStep];
    });
  };

  // Load master data when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, loading master data...');
      loadMasterData();
    }
  }, [isOpen]);

  // Handle initialData changes (for edit mode)
  useEffect(() => {
    if (isOpen && isEdit && initialData) {
      console.log('Setting form data for edit mode:', initialData);
      setFormData({
        namaLengkap: initialData.namaLengkap || '',
        namaPanggilan: initialData.namaPanggilan || '',
        tempatLahir: initialData.tempatLahir || '',
        tanggalLahir: initialData.tanggalLahir || '',
        namaIbu: initialData.namaIbu || '',
        namaAyah: initialData.namaAyah || '',
        nomorHP: initialData.nomorHP || '',
        alamat: initialData.alamat || '',
        email: initialData.email || '',
        unitSekolah: initialData.unitSekolah || '',
        unitKelas: initialData.unitKelas || '',
        nisn: initialData.nisn || '',
        password: initialData.password || '',
        avatar: null, // Don't populate file input
      });

      // Set avatar preview if exists
      if (editingStudent?.avatar) {
        console.log('Setting avatar preview:', editingStudent.avatar);
        setAvatarPreview(editingStudent.avatar);
      } else {
        setAvatarPreview(null);
      }
    } else if (isOpen && !isEdit) {
      // Reset form for add mode
      console.log('Resetting form for add mode');
      setFormData({
        namaLengkap: '',
        namaPanggilan: '',
        tempatLahir: '',
        tanggalLahir: '',
        namaIbu: '',
        namaAyah: '',
        nomorHP: '',
        alamat: '',
        email: '',
        unitSekolah: '',
        unitKelas: '',
        nisn: '',
        password: '',
        avatar: null,
      });
      setAvatarPreview(null);
    }
  }, [isOpen, isEdit, initialData]);

  // Load unit kelas when unit sekolah changes
  useEffect(() => {
    if (formData.unitSekolah && unitSekolahs.length > 0) {
      console.log('Loading unit kelas because unit sekolah changed to:', formData.unitSekolah);
      loadUnitKelas(formData.unitSekolah);
    } else {
      setUnitKelasList([]);
      // Clear unit kelas if unit sekolah is cleared (but not during edit mode initial load)
      if (!formData.unitSekolah && !isEdit) {
        setFormData(prev => ({ ...prev, unitKelas: '' }));
      }
    }
  }, [formData.unitSekolah, unitSekolahs]);

  const loadMasterData = async () => {
    setLoadingUnitData(true);
    try {
      // Load unit sekolah
      const response = await unitSekolahService.getAll({ per_page: 100 });
      console.log('Unit Sekolah Response:', response); // Debug
      
      if (response.success && response.data?.data) {
        setUnitSekolahs(response.data.data);
      } else {
        console.warn('No unit sekolah data found');
        setUnitSekolahs([]);
      }
    } catch (error) {
      console.error('Error loading master data:', error);
      setUnitSekolahs([]);
    } finally {
      setLoadingUnitData(false);
    }
  };

  const loadUnitKelas = async (unitSekolahJenjang: string) => {
    try {
      console.log('Loading unit kelas for jenjang:', unitSekolahJenjang);
      console.log('Available unit sekolahs:', unitSekolahs);
      
      // Find unit sekolah by jenjang
      const selectedUnitSekolah = Array.isArray(unitSekolahs) ? 
        unitSekolahs.find(us => us.jenjang === unitSekolahJenjang) : 
        null;
      
      console.log('Selected unit sekolah:', selectedUnitSekolah);
      
      if (selectedUnitSekolah) {
        const unitKelasData = await unitKelasService.getByUnitSekolah(selectedUnitSekolah.id);
        console.log('Unit kelas data:', unitKelasData);
        setUnitKelasList(Array.isArray(unitKelasData) ? unitKelasData : []);
      } else {
        console.warn('No unit sekolah found for jenjang:', unitSekolahJenjang);
        setUnitKelasList([]);
      }
    } catch (error) {
      console.error('Error loading unit kelas:', error);
      setUnitKelasList([]);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (field: keyof StudentFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Add debug log for field changes
    const displayValue = value instanceof File ? `File: ${value.name}` : String(value);
    addDebugLog(`Field "${field}" changed to: ${displayValue}`);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
      addDebugLog(`Cleared error for field "${field}"`);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔥 Avatar upload handler triggered');
    console.log('📂 Files in input:', event.target.files);
    
    const file = event.target.files?.[0];
    if (file) {
      console.log('📸 Avatar file selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
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
      
      setFormData(prev => {
        console.log('🔄 Setting avatar in formData:', file.name);
        return { ...prev, avatar: file };
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
        console.log('🖼️ Avatar preview created');
      };
      reader.readAsDataURL(file);
      
      // Clear error
      setErrors(prev => ({ ...prev, avatar: '' }));
    } else {
      console.log('❌ No file selected in upload handler');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Nama lengkap wajib diisi';
    if (!formData.namaPanggilan.trim()) newErrors.namaPanggilan = 'Nama panggilan wajib diisi';
    if (!formData.tempatLahir.trim()) newErrors.tempatLahir = 'Tempat lahir wajib diisi';
    if (!formData.tanggalLahir) newErrors.tanggalLahir = 'Tanggal lahir wajib diisi';
    if (!formData.namaIbu.trim()) newErrors.namaIbu = 'Nama ibu wajib diisi';
    if (!formData.namaAyah.trim()) newErrors.namaAyah = 'Nama ayah wajib diisi';
    if (!formData.nomorHP.trim()) newErrors.nomorHP = 'Nomor HP wajib diisi';
    if (!formData.alamat.trim()) newErrors.alamat = 'Alamat wajib diisi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    if (!formData.unitSekolah.trim()) newErrors.unitSekolah = 'Unit sekolah wajib diisi';
    if (!formData.unitKelas.trim()) newErrors.unitKelas = 'Unit kelas wajib diisi';
    if (!formData.nisn.trim()) newErrors.nisn = 'NISN wajib diisi';
    if (!formData.password.trim()) newErrors.password = 'Password wajib diisi';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Phone validation (Indonesian format)
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (formData.nomorHP && !phoneRegex.test(formData.nomorHP.replace(/\s/g, ''))) {
      newErrors.nomorHP = 'Format nomor HP tidak valid (contoh: 08123456789)';
    }

    // NISN validation (10 digits)
    if (formData.nisn && !/^\d{10}$/.test(formData.nisn)) {
      newErrors.nisn = 'NISN harus 10 digit angka';
    }

    // Password validation (minimum 6 characters)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset submit steps
    setSubmitSteps([]);
    
    addDebugLog('🚀 Form submit started');
    updateSubmitStep('Form Submit', 'loading');
    
    console.log('Form submitted with data:', formData);
    console.log('📋 Avatar in formData:', formData.avatar ? 
      `File: ${formData.avatar.name} (${formData.avatar.size} bytes)` : 
      'No avatar selected'
    );
    
    updateSubmitStep('Validation', 'loading');
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      addDebugLog('❌ Form validation failed');
      updateSubmitStep('Validation', 'error', `Errors: ${Object.keys(errors).join(', ')}`);
      return;
    }

    addDebugLog('✅ Form validation passed');
    updateSubmitStep('Validation', 'success');
    updateSubmitStep('API Call', 'loading');
    
    console.log('Form validation passed, submitting...');
    setIsSubmitting(true);
    
    try {
      addDebugLog('📡 Calling API with form data...');
      console.log('Calling onSubmit with form data:', formData);
      
      const result = await onSubmit(formData);
      
      // Capture API response for debugging
      setLastApiResponse(result);
      addDebugLog('✅ Form submitted successfully!');
      addDebugLog(`📋 Response: ${result && typeof result === 'object' ? JSON.stringify(result).substring(0, 100) + '...' : 'No response data'}`);
      updateSubmitStep('API Call', 'success', 'Data saved successfully');
      updateSubmitStep('Complete', 'success');
      
      console.log('Form submitted successfully');
      
      if (showDebugPanel) {
        // Show success message but don't auto-close in debug mode
        addDebugLog('🎉 SUCCESS! Data submitted to API');
        addDebugLog('🔍 DEBUG MODE: Modal stays open for investigation');
        addDebugLog('📊 Check if data appears in list without refresh');
        addDebugLog('🔄 Manually refresh page to verify database persistence');
        addDebugLog('📌 Modal pinned automatically for debugging');
      } else {
        // Normal mode: close modal automatically after success
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      }
      
    } catch (error: any) {
      console.error('Error submitting form:', error);
      addDebugLog(`❌ Submit error: ${error.message}`);
      updateSubmitStep('API Call', 'error', error.message);
      
      // Show more detailed error to user if needed
      if (error.message) {
        console.error('Error message:', error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    addDebugLog('🧹 Resetting form to initial state');
    setFormData({
      namaLengkap: '',
      namaPanggilan: '',
      tempatLahir: '',
      tanggalLahir: '',
      namaIbu: '',
      namaAyah: '',
      nomorHP: '',
      alamat: '',
      email: '',
      unitSekolah: '',
      unitKelas: '',
      nisn: '',
      password: '',
      avatar: null,
    });
    setAvatarPreview(null);
    setErrors({});
    setShowPassword(false);
    setSubmitSteps([]);
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
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEdit ? 'Edit Data Murid' : 'Tambah Murid Baru'}
                </h2>
                <p className="text-emerald-100">
                  {isEdit ? 'Perbarui informasi murid' : 'Masukkan informasi murid baru'}
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
          {/* Debug Panel */}
          {showDebugPanel && (
            <div className="mb-6 p-4 bg-gray-900 text-green-400 rounded-xl font-mono text-xs max-h-40 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-300 font-semibold">🐛 Debug Panel</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setKeepModalOpen(!keepModalOpen);
                      if (keepModalOpen && autoCloseTimer) {
                        clearTimeout(autoCloseTimer);
                        setAutoCloseTimer(null);
                        addDebugLog('📌 Modal pinned - auto-close disabled');
                      } else if (!keepModalOpen) {
                        addDebugLog('📍 Modal unpinned - will auto-close on success');
                      }
                    }}
                    className={`px-2 py-1 rounded text-xs ${
                      keepModalOpen 
                        ? 'text-yellow-300 bg-yellow-800/30' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title={keepModalOpen ? 'Unpin modal' : 'Pin modal (prevent auto-close)'}
                  >
                    {keepModalOpen ? '📌' : '📍'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDebugPanel(false)}
                    className="text-gray-400 hover:text-white px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {/* Field Count & Validation Status */}
              <div className="mb-2 text-yellow-300">
                Fields: {Object.keys(formData).filter(key => formData[key as keyof StudentFormData]).length}/13 filled | 
                Errors: {Object.keys(errors).length} |
                Status: {isSubmitting ? '⏳ Submitting...' : submitSteps.some(s => s.status === 'success') ? '✅ Success - Modal Locked' : '🟡 Ready'}
              </div>
              
              {/* Submit Steps */}
              {submitSteps.length > 0 && (
                <div className="mb-2">
                  <div className="text-blue-300 font-semibold">Submit Process:</div>
                  {submitSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 ml-2">
                      <span className={
                        step.status === 'loading' ? 'text-yellow-400' :
                        step.status === 'success' ? 'text-green-400' :
                        step.status === 'error' ? 'text-red-400' : 'text-gray-400'
                      }>
                        {step.status === 'loading' ? '⏳' :
                         step.status === 'success' ? '✅' :
                         step.status === 'error' ? '❌' : '⏸️'}
                      </span>
                      <span>{step.step}</span>
                      {step.message && <span className="text-gray-300">- {step.message}</span>}
                    </div>
                  ))}
                </div>
              )}
              
              {/* API Response */}
              {lastApiResponse && (
                <div className="mb-2">
                  <div className="text-blue-300 font-semibold">Last API Response:</div>
                  <div className="text-gray-300 text-xs bg-gray-800 p-2 rounded max-h-20 overflow-y-auto">
                    <pre>{JSON.stringify(lastApiResponse, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              {/* Manual Diagnostic Tools */}
              {submitSteps.some(s => s.status === 'success') && (
                <div className="mb-2 p-2 bg-blue-900/30 rounded">
                  <div className="text-blue-300 font-semibold mb-2">🔧 Diagnostic Tools:</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        addDebugLog('🔄 Manual refresh - checking if data persisted...');
                        window.location.reload();
                      }}
                      className="px-2 py-1 bg-blue-700 text-white rounded text-xs hover:bg-blue-600"
                    >
                      🔄 Refresh Page
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        addDebugLog('📋 Opening new tab to check data...');
                        window.open(window.location.href, '_blank');
                      }}
                      className="px-2 py-1 bg-green-700 text-white rounded text-xs hover:bg-green-600"
                    >
                      📋 New Tab
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(lastApiResponse, null, 2));
                        addDebugLog('📎 API response copied to clipboard');
                      }}
                      className="px-2 py-1 bg-purple-700 text-white rounded text-xs hover:bg-purple-600"
                    >
                      📎 Copy Response
                    </button>
                  </div>
                </div>
              )}
              
              {/* Debug Logs */}
              <div className="space-y-1">
                {debugLogs.map((log, index) => (
                  <div key={index} className="text-gray-300">{log}</div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Avatar Upload - Left Column */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-emerald-600" />
                  Foto Murid
                </h3>
                
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-20 h-20 text-emerald-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white p-3 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110"
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
                    <p className="text-sm font-medium text-gray-700">Upload foto murid</p>
                    <p className="text-xs text-gray-500 mt-1">Maksimal 5MB, format JPG/PNG</p>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🎯 "Pilih File" button clicked');
                        console.log('📎 File input ref:', fileInputRef.current);
                        fileInputRef.current?.click();
                      }}
                      className="mt-3 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
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
              <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <UserIcon className="w-6 h-6 mr-3 text-emerald-600" />
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
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 ${
                        errors.namaLengkap ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-emerald-300'
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Panggilan *
                    </label>
                    <input
                      type="text"
                      value={formData.namaPanggilan}
                      onChange={(e) => handleInputChange('namaPanggilan', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 ${
                        errors.namaPanggilan ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-emerald-300'
                      }`}
                      placeholder="Masukkan nama panggilan"
                    />
                    {errors.namaPanggilan && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.namaPanggilan}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tempat Lahir *
                    </label>
                    <input
                      type="text"
                      value={formData.tempatLahir}
                      onChange={(e) => handleInputChange('tempatLahir', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 ${
                        errors.tempatLahir ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-emerald-300'
                      }`}
                      placeholder="Kota tempat lahir"
                    />
                    {errors.tempatLahir && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.tempatLahir}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Lahir *
                    </label>
                    <input
                      type="date"
                      value={formData.tanggalLahir}
                      onChange={(e) => handleInputChange('tanggalLahir', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 ${
                        errors.tanggalLahir ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-emerald-300'
                      }`}
                    />
                    {errors.tanggalLahir && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.tanggalLahir}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Family Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-blue-600" />
                  Informasi Keluarga
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Ibu *
                    </label>
                    <input
                      type="text"
                      value={formData.namaIbu}
                      onChange={(e) => handleInputChange('namaIbu', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.namaIbu ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-300'
                      }`}
                      placeholder="Nama lengkap ibu"
                    />
                    {errors.namaIbu && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.namaIbu}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Ayah *
                    </label>
                    <input
                      type="text"
                      value={formData.namaAyah}
                      onChange={(e) => handleInputChange('namaAyah', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.namaAyah ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-300'
                      }`}
                      placeholder="Nama lengkap ayah"
                    />
                    {errors.namaAyah && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.namaAyah}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Phone className="w-6 h-6 mr-3 text-purple-600" />
                  Informasi Kontak
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nomor HP *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={formData.nomorHP}
                        onChange={(e) => handleInputChange('nomorHP', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                          errors.nomorHP ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-300'
                        }`}
                        placeholder="08123456789"
                      />
                    </div>
                    {errors.nomorHP && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.nomorHP}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                          errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-300'
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alamat *
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      <textarea
                        value={formData.alamat}
                        onChange={(e) => handleInputChange('alamat', e.target.value)}
                        rows={3}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none ${
                          errors.alamat ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-300'
                        }`}
                        placeholder="Alamat lengkap tempat tinggal"
                      />
                    </div>
                    {errors.alamat && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.alamat}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <School className="w-6 h-6 mr-3 text-orange-600" />
                  Informasi Sekolah
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit Sekolah *
                    </label>
                    <select
                      value={formData.unitSekolah}
                      onChange={(e) => handleInputChange('unitSekolah', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                        errors.unitSekolah ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-orange-300'
                      }`}
                      disabled={loadingUnitData}
                    >
                      <option value="">
                        {loadingUnitData ? 'Memuat data...' : 'Pilih Unit Sekolah'}
                      </option>
                      {Array.isArray(unitSekolahs) && unitSekolahs.map((unitSekolah) => (
                        <option key={unitSekolah.id} value={unitSekolah.jenjang}>
                          {unitSekolah.nama} ({unitSekolah.jenjang})
                        </option>
                      ))}
                    </select>
                    {errors.unitSekolah && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.unitSekolah}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit Kelas *
                    </label>
                    <select
                      value={formData.unitKelas}
                      onChange={(e) => handleInputChange('unitKelas', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                        errors.unitKelas ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-orange-300'
                      }`}
                      disabled={!formData.unitSekolah || !Array.isArray(unitKelasList) || unitKelasList.length === 0}
                    >
                      <option value="">
                        {!formData.unitSekolah 
                          ? 'Pilih Unit Sekolah terlebih dahulu' 
                          : !Array.isArray(unitKelasList) || unitKelasList.length === 0 
                          ? 'Belum ada kelas tersedia'
                          : 'Pilih Unit Kelas'
                        }
                      </option>
                      {Array.isArray(unitKelasList) && unitKelasList
                        .filter(kelas => kelas.status === 'Aktif')
                        .map((kelas) => (
                        <option key={kelas.id} value={kelas.nama}>
                          {kelas.nama} ({kelas.tingkat}) - Kapasitas: {kelas.kapasitas}
                        </option>
                      ))}
                    </select>
                    {errors.unitKelas && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.unitKelas}
                      </p>
                    )}
                    {formData.unitSekolah && (!Array.isArray(unitKelasList) || unitKelasList.length === 0) && (
                      <p className="text-sm text-amber-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">ℹ</span>
                        Belum ada unit kelas yang tersedia untuk {formData.unitSekolah}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Login Information */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-indigo-600" />
                  Informasi Login
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NISN *
                    </label>
                    <input
                      type="text"
                      value={formData.nisn}
                      onChange={(e) => handleInputChange('nisn', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                        errors.nisn ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                      }`}
                      placeholder="10 digit NISN"
                      maxLength={10}
                    />
                    {errors.nisn && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.nisn}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Nomor Induk Siswa Nasional (10 digit)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                          errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
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
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-gray-200">
            {/* Debug Toggle Button */}
            {!showDebugPanel && (
              <button
                type="button"
                onClick={() => setShowDebugPanel(true)}
                className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🐛 Show Debug
              </button>
            )}
            
            <div className="flex items-center space-x-4">
              <button
              type="button"
              onClick={handleClose}
              className="px-8 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl hover:from-emerald-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {isSubmitting && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>
                {isSubmitting 
                  ? (isEdit ? 'Menyimpan...' : 'Menambahkan...') 
                  : (isEdit ? 'Simpan Perubahan' : 'Tambah Murid')
                }
              </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;
