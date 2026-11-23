import React, { useState, useEffect } from 'react';
import { X, GraduationCap } from 'lucide-react';
import type { UnitSekolahFormData } from '../../../types/masterData';

interface UnitSekolahFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UnitSekolahFormData) => Promise<void>;
  isEdit?: boolean;
  initialData?: UnitSekolahFormData;
}

const UnitSekolahFormModal: React.FC<UnitSekolahFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit = false,
  initialData,
}) => {
  const [formData, setFormData] = useState<UnitSekolahFormData>({
    kode: '',
    nama: '',
    jenjang: 'PAUD',
    alamat: '',
    kepalaSekolah: '',
    status: 'Aktif',
  });
  const [errors, setErrors] = useState<Partial<UnitSekolahFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      kode: '',
      nama: '',
      jenjang: 'PAUD',
      alamat: '',
      kepalaSekolah: '',
      status: 'Aktif',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UnitSekolahFormData> = {};

    if (!formData.kode.trim()) {
      newErrors.kode = 'Kode unit sekolah harus diisi';
    }

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama unit sekolah harus diisi';
    }

    if (!formData.alamat.trim()) {
      newErrors.alamat = 'Alamat harus diisi';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEdit ? 'Edit Unit Sekolah' : 'Tambah Unit Sekolah Baru'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEdit ? 'Perbarui informasi unit sekolah' : 'Masukkan informasi unit sekolah baru'}
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
          <div className="space-y-6">
            {/* Kode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Unit Sekolah *
              </label>
              <input
                type="text"
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.kode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan kode unit sekolah"
              />
              {errors.kode && (
                <p className="text-red-500 text-sm mt-1">{errors.kode}</p>
              )}
            </div>

            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Unit Sekolah *
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nama ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan nama unit sekolah"
              />
              {errors.nama && (
                <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
              )}
            </div>

            {/* Jenjang */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenjang Pendidikan *
              </label>
              <select
                value={formData.jenjang}
                onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PAUD">PAUD</option>
                <option value="TK">TK</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="SMK">SMK</option>
              </select>
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat *
              </label>
              <textarea
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.alamat ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan alamat lengkap sekolah"
              />
              {errors.alamat && (
                <p className="text-red-500 text-sm mt-1">{errors.alamat}</p>
              )}
            </div>

            {/* Kepala Sekolah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.kepalaSekolah || ''}
                onChange={(e) => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama kepala sekolah (opsional)"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Tidak Aktif' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

export default UnitSekolahFormModal;
