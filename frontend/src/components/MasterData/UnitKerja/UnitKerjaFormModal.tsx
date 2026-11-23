import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import type { UnitKerjaFormData, UnitSekolah } from '../../../types/masterData';
import { unitSekolahService } from '../../../services/unitSekolahService';

interface UnitKerjaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UnitKerjaFormData) => Promise<void>;
  isEdit?: boolean;
  initialData?: UnitKerjaFormData;
}

const UnitKerjaFormModal: React.FC<UnitKerjaFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit = false,
  initialData,
}) => {
  const [formData, setFormData] = useState<UnitKerjaFormData>({
    kode: '',
    nama: '',
    deskripsi: '',
    status: 'Aktif',
    unitSekolahId: '',
  });
  const [errors, setErrors] = useState<Partial<UnitKerjaFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unitSekolahs, setUnitSekolahs] = useState<UnitSekolah[]>([]);

  // Load unit sekolah data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFormData(initialData);
      } else {
        resetForm();
      }
      setErrors({});
      loadUnitSekolahs();
    }
  }, [isOpen, isEdit, initialData]);

  const loadUnitSekolahs = async () => {
    try {
      const data = await unitSekolahService.getAllForDropdown();
      setUnitSekolahs(data);
    } catch (error) {
      console.error('Error loading unit sekolah:', error);
      setUnitSekolahs([]);
    }
  };

  const resetForm = () => {
    setFormData({
      kode: '',
      nama: '',
      deskripsi: '',
      status: 'Aktif',
      unitSekolahId: '',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UnitKerjaFormData> = {};

    if (!formData.kode.trim()) {
      newErrors.kode = 'Kode unit kerja harus diisi';
    }

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama unit kerja harus diisi';
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
              <div className="p-2 bg-violet-100 rounded-lg">
                <Building2 className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEdit ? 'Edit Unit Kerja' : 'Tambah Unit Kerja Baru'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEdit ? 'Perbarui informasi unit kerja' : 'Masukkan informasi unit kerja baru'}
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
                Kode Unit Kerja *
              </label>
              <input
                type="text"
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  errors.kode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan kode unit kerja"
              />
              {errors.kode && (
                <p className="text-red-500 text-sm mt-1">{errors.kode}</p>
              )}
            </div>

            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Unit Kerja *
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  errors.nama ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan nama unit kerja"
              />
              {errors.nama && (
                <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
              )}
            </div>

            {/* Unit Sekolah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Sekolah (Opsional)
              </label>
              <select
                value={formData.unitSekolahId || ''}
                onChange={(e) => setFormData({ ...formData, unitSekolahId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">-- Pilih Unit Sekolah --</option>
                {unitSekolahs.map((unitSekolah) => (
                  <option key={unitSekolah.id} value={unitSekolah.id}>
                    {unitSekolah.nama} ({unitSekolah.jenjang})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Pilih unit sekolah jika unit kerja ini terkait dengan sekolah tertentu
              </p>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={formData.deskripsi || ''}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Masukkan deskripsi unit kerja (opsional)"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
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
              className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

export default UnitKerjaFormModal;
