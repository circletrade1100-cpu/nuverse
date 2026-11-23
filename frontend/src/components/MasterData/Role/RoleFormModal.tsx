import React, { useState, useEffect } from 'react';
import { X, Shield, Check } from 'lucide-react';
import type { RoleFormData, ModulePermission } from '../../../types/role';
import { 
  PERMISSION_LABELS, 
  createDefaultModulePermissions,
  getModulesByCategory,
  CATEGORY_LABELS
} from '../../../types/role';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => Promise<void>;
  isEdit?: boolean;
  initialData?: RoleFormData;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit = false,
  initialData,
}) => {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    isActive: true,
    modulePermissions: createDefaultModulePermissions(),
  });
  const [errors, setErrors] = useState<Partial<RoleFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('core');

  const modulesByCategory = getModulesByCategory();

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFormData(initialData);
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, isEdit, initialData]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true,
      modulePermissions: createDefaultModulePermissions(),
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RoleFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama role harus diisi';
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
      if (!isEdit) resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    if (!isEdit) resetForm();
  };

  const updateModulePermission = (moduleName: string, permission: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      modulePermissions: prev.modulePermissions.map(mp => 
        mp.moduleName === moduleName
          ? {
              ...mp,
              permissions: {
                ...mp.permissions,
                [permission]: value
              }
            }
          : mp
      )
    }));
  };

  const toggleAllPermissionsForModule = (moduleName: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      modulePermissions: prev.modulePermissions.map(mp => 
        mp.moduleName === moduleName
          ? {
              ...mp,
              permissions: Object.keys(mp.permissions).reduce((acc, key) => {
                acc[key as keyof typeof mp.permissions] = value;
                return acc;
              }, {} as typeof mp.permissions)
            }
          : mp
      )
    }));
  };

  const getModulePermission = (moduleName: string): ModulePermission | undefined => {
    return formData.modulePermissions.find(mp => mp.moduleName === moduleName);
  };

  const hasAnyPermission = (moduleName: string): boolean => {
    const modulePermission = getModulePermission(moduleName);
    return modulePermission ? Object.values(modulePermission.permissions).some(p => p) : false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEdit ? 'Edit Role' : 'Tambah Role Baru'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEdit ? 'Perbarui informasi role dan permission' : 'Buat role baru dengan pengaturan permission'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Role *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama role"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.isActive.toString()}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Tidak Aktif</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Masukkan deskripsi role (opsional)"
              />
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Permission</h3>
            
            {/* Category Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveTab(category)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === category
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Permission Matrix */}
            <div className="space-y-6">
              {modulesByCategory[activeTab]?.map((module) => {
                const modulePermission = getModulePermission(module.name);
                const hasPermissions = hasAnyPermission(module.name);

                return (
                  <div key={module.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${hasPermissions ? 'bg-purple-100' : 'bg-gray-100'}`}>
                          <Shield className={`w-5 h-5 ${hasPermissions ? 'text-purple-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{module.displayName}</h4>
                          <p className="text-sm text-gray-500">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => toggleAllPermissionsForModule(module.name, true)}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                        >
                          Pilih Semua
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAllPermissionsForModule(module.name, false)}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                        >
                          Hapus Semua
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {module.defaultPermissions.map((permission) => {
                        const isChecked = modulePermission?.permissions[permission] || false;
                        return (
                          <label
                            key={permission}
                            className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-purple-50 border-purple-200'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => updateModulePermission(module.name, permission, e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isChecked
                                ? 'bg-purple-600 border-purple-600'
                                : 'border-gray-300'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm font-medium ${
                              isChecked ? 'text-purple-700' : 'text-gray-700'
                            }`}>
                              {PERMISSION_LABELS[permission]}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isEdit ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleFormModal;
