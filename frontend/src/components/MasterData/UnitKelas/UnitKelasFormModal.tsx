import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import type { UnitKelasFormData, UnitSekolah } from '../../../types/masterData';
import { unitSekolahService } from '../../../services/unitSekolahService';

interface UnitKelasFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UnitKelasFormData) => Promise<void>;
  isEdit?: boolean;
  initialData?: UnitKelasFormData;
}

const UnitKelasFormModal: React.FC<UnitKelasFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit = false,
  initialData,
}) => {
  const [formData, setFormData] = useState<UnitKelasFormData>({
    kode: '',
    nama: '',
    tingkat: '',
    kapasitas: 0,
    waliKelas: '',
    unitSekolah: '',
    unitSekolahId: '',
    status: 'Aktif',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unitSekolahs, setUnitSekolahs] = useState<UnitSekolah[]>([]);
  const [loadingUnitSekolahs, setLoadingUnitSekolahs] = useState(true);

  // Load unit sekolah data
  const fetchUnitSekolahs = async () => {
    try {
      setLoadingUnitSekolahs(true);
      const data = await unitSekolahService.getAllForDropdown();
      setUnitSekolahs(data);
    } catch (error) {
      console.error('Error loading unit sekolah:', error);
    } finally {
      setLoadingUnitSekolahs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUnitSekolahs();
      if (isEdit && initialData) {
        setFormData({
          ...initialData,
          unitSekolahId: initialData.unitSekolahId ? String(initialData.unitSekolahId) : ''
        });
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
      tingkat: '',
      kapasitas: 0,
      waliKelas: '',
      unitSekolah: '',
      unitSekolahId: '',
      status: 'Aktif',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.kode.trim()) {
      newErrors.kode = 'Kode kelas harus diisi';
    }

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama kelas harus diisi';
    }

    if (!formData.tingkat.trim()) {
      newErrors.tingkat = 'Tingkat harus diisi';
    }


    if (!formData.kapasitas || formData.kapasitas <= 0) {
      newErrors.kapasitas = 'Kapasitas harus lebih dari 0';
    }

    // Convert to string first, then check if empty
    const unitSekolahIdStr = formData.unitSekolahId ? String(formData.unitSekolahId) : '';
    if (!unitSekolahIdStr || unitSekolahIdStr.trim() === '') {
      newErrors.unitSekolah = 'Unit sekolah harus dipilih';
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEdit ? 'Edit Unit Kelas' : 'Tambah Unit Kelas Baru'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEdit ? 'Perbarui informasi unit kelas' : 'Masukkan informasi unit kelas baru'}
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
            {/* Row 1: Kode & Nama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Kelas *
                </label>
                <input
                  type="text"
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.kode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan kode kelas"
                />
                {errors.kode && (
                  <p className="text-red-500 text-sm mt-1">{errors.kode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kelas *
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.nama ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama kelas"
                />
                {errors.nama && (
                  <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
                )}
              </div>
            </div>

            {/* Row 2: Tingkat */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tingkat *
                </label>
                <input
                  type="text"
                  value={formData.tingkat}
                  onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.tingkat ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Contoh: 1, 7, 10"
                />
                {errors.tingkat && (
                  <p className="text-red-500 text-sm mt-1">{errors.tingkat}</p>
                )}
              </div>
            </div>

            {/* Row 3: Kapasitas & Unit Sekolah */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapasitas *
                </label>
                <input
                  type="number"
                  value={formData.kapasitas}
                  onChange={(e) => setFormData({ ...formData, kapasitas: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.kapasitas ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jumlah siswa maksimal"
                  min="1"
                />
                {errors.kapasitas && (
                  <p className="text-red-500 text-sm mt-1">{errors.kapasitas}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Sekolah *
                </label>
                <select
                  value={formData.unitSekolahId ? String(formData.unitSekolahId) : ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedUnitSekolah = unitSekolahs.find(us => String(us.id) === selectedId);
                    setFormData({ 
                      ...formData, 
                      unitSekolahId: selectedId,
                      unitSekolah: selectedUnitSekolah?.nama || ''
                    });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.unitSekolah ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loadingUnitSekolahs}
                >
                  <option value="">Pilih Unit Sekolah</option>
                  {unitSekolahs.map((unitSekolah) => (
                    <option key={unitSekolah.id} value={unitSekolah.id}>
                      {unitSekolah.nama}
                    </option>
                  ))}
                </select>
                {loadingUnitSekolahs && (
                  <p className="text-sm text-gray-500 mt-1">Memuat unit sekolah...</p>
                )}
                {errors.unitSekolah && (
                  <p className="text-red-500 text-sm mt-1">{errors.unitSekolah}</p>
                )}
              </div>
            </div>

            {/* Wali Kelas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wali Kelas
              </label>
              <input
                type="text"
                value={formData.waliKelas || ''}
                onChange={(e) => setFormData({ ...formData, waliKelas: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan nama wali kelas (opsional)"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

export default UnitKelasFormModal;
