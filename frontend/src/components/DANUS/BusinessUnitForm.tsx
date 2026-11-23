import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { danusService, type BusinessUnit, type BusinessUnitFormData, type BusinessUnitFormDataUI } from '../../services/danusService';
import { userService } from '../../services/userService';
import SearchSelect from '../common/UI/SearchSelect';
import { toast } from 'react-hot-toast';

interface BusinessUnitFormProps {
  unit?: BusinessUnit;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const BusinessUnitForm: React.FC<BusinessUnitFormProps> = ({
  unit,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<BusinessUnitFormDataUI>({
    name: '',
    type: 'catering',
    manager_id: undefined,
    status: 'Aktif',
    description: '',
    monthly_budget: undefined
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [managers, setManagers] = useState<Array<{ id: number; name: string; email?: string }>>([]);
  const [jenisUnitUsaha, setJenisUnitUsaha] = useState<Array<{ id: number; name: string; value: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      fetchManagers();
      fetchTypes();
      
      if (unit) {
        setFormData({
          name: unit.name,
          type: unit.type,
          manager_id: unit.manager_id,
          status: unit.status === 'active' ? 'Aktif' : 'Nonaktif',
          description: unit.description || '',
          monthly_budget: unit.monthly_budget
        });
      } else {
        setFormData({
          name: '',
          type: 'catering',
          manager_id: undefined,
          status: 'Aktif',
          description: '',
          monthly_budget: undefined
        });
      }
      setErrors({});
    }
  }, [isOpen, unit]);

  const fetchManagers = async () => {
    try {
      console.log('🔄 Fetching managers from User Management...');
      // Fetch data dari User Management API
      const response = await userService.getUsers({
        status: 'Aktif'
      });
      
      console.log('📡 Full API response:', response);
      console.log('📊 Response data structure:', response.data);
      console.log('👥 Users array:', response.data);
      console.log('🔢 Total users received:', response.data?.length);
      
      if (response.data) {
        console.log('🔍 Processing each user...');
        
        // Log each user before filtering
        response.data.forEach((user: any, index: number) => {
          console.log(`👤 User ${index + 1}:`, {
            id: user.id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            roles: user.roles
          });
        });
        
        // Filter user yang bisa menjadi manager (lebih inklusif)
        const managementUsers = response.data.filter((user: any) => {
          const jabatan = user.profile?.jabatan?.toLowerCase() || '';
          const role = user.roles?.[0]?.name?.toLowerCase() || '';
          
          const jabatanMatch = jabatan.includes('kepala') ||
                 jabatan.includes('manajer') ||
                 jabatan.includes('manager') ||
                 jabatan.includes('super administrator') ||
                 jabatan.includes('administrator') ||
                 jabatan.includes('danus') ||
                 jabatan.includes('staff');
                 
          const roleMatch = role.includes('super') ||
                 role.includes('admin') ||
                 role.includes('manajer') ||
                 role.includes('kepala') ||
                 role.includes('danus') ||
                 role.includes('staff');
                 
          const isManager = jabatanMatch || roleMatch;
          
          console.log(`🔍 User ${user.name}: jabatan="${jabatan}", role="${role}", jabatanMatch=${jabatanMatch}, roleMatch=${roleMatch}, isManager=${isManager}`);
          
          return isManager;
        });
        
        console.log('✅ Filtered management users:', managementUsers.length);
        
        const managerOptions = managementUsers.map((user: any) => ({
          id: user.id,
          name: user.name || user.profile?.nama_lengkap || 'Nama tidak tersedia',
          email: user.email || ''
        }));
        
        console.log('✅ Final manager options:', managerOptions);
        setManagers(managerOptions);
      } else {
        console.warn('⚠️ No manager data received, using fallback');
        console.warn('Response structure:', response);
        setManagers([
          { id: 1, name: 'Super Administrator', email: 'admin@salam-annur.id' },
          { id: 2, name: 'Kepala Sekolah', email: 'kepala@salam-annur.id' }
        ]);
      }
    } catch (error) {
      console.error('❌ Error fetching managers:', error);
      console.error('Error details:', error);
      // Fallback ke data dummy jika API error
      setManagers([
        { id: 1, name: 'Super Administrator', email: 'admin@salam-annur.id' },
        { id: 2, name: 'Kepala Sekolah', email: 'kepala@salam-annur.id' }
      ]);
    }
  };

  const fetchTypes = async () => {
    try {
      console.log('🔄 Fetching business unit types...');
      // Use the DANUS API to get business unit types
      const response = await danusService.getBusinessUnitTypes();
      
      console.log('📡 Types response:', response);
      
      if (response.success && response.data) {
        const typeOptions = response.data.map((type: any, index: number) => ({
          id: index + 1,
          name: type.label,
          value: type.value
        }));
        
        console.log('✅ Type options:', typeOptions);
        setJenisUnitUsaha(typeOptions);
      } else {
        console.warn('⚠️ No type data received, using fallback');
        setJenisUnitUsaha([
          { id: 1, name: 'Catering', value: 'catering' },
          { id: 2, name: 'Kolam Renang', value: 'swimming_pool' },
          { id: 3, name: 'Kantin', value: 'canteen' },
          { id: 4, name: 'Usaha Lainnya', value: 'other' }
        ]);
      }
    } catch (error) {
      console.error('❌ Error fetching business unit types:', error);
      // Fallback ke data dummy jika API error
      setJenisUnitUsaha([
        { id: 1, name: 'Catering', value: 'catering' },
        { id: 2, name: 'Kolam Renang', value: 'swimming_pool' },
        { id: 3, name: 'Kantin', value: 'canteen' },
        { id: 4, name: 'Usaha Lainnya', value: 'other' }
      ]);
    }
  };

  const formatCurrencyInput = (value: number): string => {
    if (!value) return '';
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const parseCurrencyInput = (value: string): number => {
    if (!value) return 0;
    // Remove all non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d]/g, '');
    return parseInt(cleanValue) || 0;
  };

  const handleCurrencyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseCurrencyInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthly_budget' ? (value ? parseFloat(value) : undefined) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama unit usaha harus diisi';
    }

    if (!formData.type) {
      newErrors.type = 'Jenis unit usaha harus dipilih';
    }

    if (!formData.status) {
      newErrors.status = 'Status harus dipilih';
    }

    if (formData.monthly_budget !== undefined && formData.monthly_budget < 0) {
      newErrors.monthly_budget = 'Anggaran bulanan tidak boleh negatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Map status from Indonesian to English
      const submitData: BusinessUnitFormData = {
        name: formData.name,
        type: formData.type,
        manager_id: formData.manager_id,
        status: formData.status === 'Aktif' ? 'active' : 'inactive',
        description: formData.description,
        monthly_budget: formData.monthly_budget
      };
      
      console.log('📤 Submitting data:', submitData);
      
      let response;
      if (unit) {
        response = await danusService.updateBusinessUnit(unit.id, submitData);
      } else {
        response = await danusService.createBusinessUnit(submitData);
      }

      console.log('📡 Full API Response:', response);
      console.log('📊 Response success:', response?.success);
      console.log('📋 Response data:', response?.data);
      console.log('❌ Response errors:', response?.errors);
      console.log('💬 Response message:', response?.message);

      if (response.success) {
        // Show success toast
        toast.success(unit ? 'Unit usaha berhasil diperbarui!' : 'Unit usaha berhasil ditambahkan!', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: '#fff',
            fontWeight: '500'
          }
        });
        
        // Reset form data only if not editing
        if (!unit) {
          setFormData({
            name: '',
            type: 'catering',
            manager_id: undefined,
            status: 'Aktif',
            description: '',
            monthly_budget: undefined
          });
          setErrors({});
        }
        
        // Call onSave immediately to refresh the list
        console.log('🔄 Calling onSave to refresh list');
        onSave();
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 100);
      } else {
        // Handle API validation errors
        if (response.errors) {
          setErrors(response.errors);
          toast.error('Terdapat kesalahan pada form', {
            duration: 4000,
            position: 'top-right'
          });
        } else {
          toast.error(response.message || 'Terjadi kesalahan saat menyimpan data', {
            duration: 4000,
            position: 'top-right'
          });
        }
      }
    } catch (error) {
      console.error('Error saving business unit:', error);
      toast.error('Terjadi kesalahan saat menyimpan data', {
        duration: 4000,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {unit ? 'Edit Unit Usaha' : 'Tambah Unit Usaha'}
              </h3>
              <p className="text-blue-100 mt-1">
                {unit ? 'Ubah informasi unit usaha' : 'Tambahkan unit usaha baru'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Unit Usaha */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Unit Usaha *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-3 transition-all duration-200 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Masukkan nama unit usaha"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Jenis Unit Usaha */}
              <div>
                <SearchSelect
                  label="Jenis Unit Usaha"
                  options={jenisUnitUsaha}
                  value={jenisUnitUsaha.find(option => option.value === formData.type)?.id}
                  onChange={(value) => {
                    const selectedOption = jenisUnitUsaha.find(option => option.id === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      type: selectedOption?.value as 'catering' | 'swimming_pool' | 'canteen' | 'other' || 'catering'
                    }));
                  }}
                  placeholder="Pilih Jenis Unit Usaha"
                  required={true}
                  error={errors.type}
                  loading={jenisUnitUsaha.length === 0}
                />
              </div>

              {/* Manager */}
              <div>
                <SearchSelect
                  label="Manager"
                  options={managers}
                  value={formData.manager_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, manager_id: value }))}
                  placeholder="Pilih Manager dari Data Manajemen"
                  loading={managers.length === 0}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`block w-full border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-3 transition-all duration-200 ${
                    errors.status ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Tidak Aktif</option>
                </select>
                {errors.status && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.status}
                  </p>
                )}
              </div>

              {/* Anggaran Bulanan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Anggaran Bulanan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    type="text"
                    name="monthly_budget"
                    value={formData.monthly_budget ? formatCurrencyInput(formData.monthly_budget) : ''}
                    onChange={handleCurrencyInputChange}
                    className={`block w-full border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10 pr-4 py-3 transition-all duration-200 ${
                      errors.monthly_budget ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors.monthly_budget && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.monthly_budget}
                  </p>
                )}
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="block w-full border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-3 transition-all duration-200 hover:border-gray-400"
                placeholder="Masukkan deskripsi unit usaha"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 hover:shadow-md"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {unit ? 'Memperbarui...' : 'Menyimpan...'}
                  </div>
                ) : (
                  unit ? 'Perbarui' : 'Simpan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessUnitForm;
