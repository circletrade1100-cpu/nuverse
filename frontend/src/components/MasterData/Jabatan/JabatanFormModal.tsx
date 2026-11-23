import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import type { JabatanFormData } from '../../../types/masterData';

interface JabatanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JabatanFormData) => Promise<void>;
  isEdit?: boolean;
  initialData?: JabatanFormData;
}

const JabatanFormModal: React.FC<JabatanFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit = false,
  initialData,
}) => {
  const [formData, setFormData] = useState<JabatanFormData>({
    kode: '',
    nama: '',
    level: 1,
    deskripsi: '',
    gajiPokok: 0,
    tunjangan: 0,
    status: 'Aktif',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof JabatanFormData, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
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
      level: 1,
      deskripsi: '',
      gajiPokok: 0,
      tunjangan: 0,
      status: 'Aktif',
    });
    setErrors({});
    setGeneralError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof JabatanFormData, string>> = {};

    if (!formData.kode.trim()) {
      newErrors.kode = 'Kode jabatan harus diisi';
    }

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama jabatan harus diisi';
    }

    if (!formData.level || formData.level <= 0) {
      newErrors.level = 'Level harus lebih dari 0';
    }

    if (!formData.gajiPokok || formData.gajiPokok <= 0) {
      newErrors.gajiPokok = 'Gaji pokok harus lebih dari 0';
    }

    if (formData.tunjangan < 0) {
      newErrors.tunjangan = 'Tunjangan tidak boleh negatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setGeneralError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      if (!isEdit) resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      const apiError = error as Error & { errors?: Record<string, string[]> };
      if (apiError.errors) {
        const backendErrors: Partial<Record<keyof JabatanFormData, string>> = {};
        if (apiError.errors.kode?.length) backendErrors.kode = apiError.errors.kode[0];
        if (apiError.errors.nama?.length) backendErrors.nama = apiError.errors.nama[0];
        if (apiError.errors.level?.length) backendErrors.level = apiError.errors.level[0];
        if (apiError.errors.gaji_pokok?.length) backendErrors.gajiPokok = apiError.errors.gaji_pokok[0];
        if (apiError.errors.tunjangan?.length) backendErrors.tunjangan = apiError.errors.tunjangan[0];
        if (apiError.errors.status?.length) backendErrors.status = apiError.errors.status[0];
        setErrors((prev) => ({ ...prev, ...backendErrors }));
      }
      if (!apiError.errors && apiError.message) {
        setGeneralError(apiError.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    if (!isEdit) resetForm();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const parseCurrency = (value: string) => {
    return parseInt(value.replace(/[^0-9]/g, '')) || 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEdit ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEdit ? 'Perbarui informasi jabatan' : 'Masukkan informasi jabatan baru'}
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
            {generalError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {generalError}
              </div>
            )}
            {/* Row 1: Kode & Nama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Jabatan *
                </label>
                <input
                  type="text"
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.kode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan kode jabatan"
                />
                {errors.kode && (
                  <p className="text-red-500 text-sm mt-1">{errors.kode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Jabatan *
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.nama ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama jabatan"
                />
                {errors.nama && (
                  <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
                )}
              </div>
            </div>

            {/* Row 2: Level & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.level ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value={1}>Level 1 (Tertinggi)</option>
                  <option value={2}>Level 2</option>
                  <option value={3}>Level 3</option>
                  <option value={4}>Level 4</option>
                  <option value={5}>Level 5</option>
                  <option value={6}>Level 6 (Terendah)</option>
                </select>
                {errors.level && (
                  <p className="text-red-500 text-sm mt-1">{errors.level}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Tidak Aktif' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Masukkan deskripsi jabatan (opsional)"
              />
            </div>

            {/* Row 3: Gaji Pokok & Tunjangan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gaji Pokok *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                  <input
                    type="text"
                    value={formatCurrency(formData.gajiPokok)}
                    onChange={(e) => setFormData({ ...formData, gajiPokok: parseCurrency(e.target.value) })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.gajiPokok ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors.gajiPokok && (
                  <p className="text-red-500 text-sm mt-1">{errors.gajiPokok}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tunjangan
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                  <input
                    type="text"
                    value={formatCurrency(formData.tunjangan)}
                    onChange={(e) => setFormData({ ...formData, tunjangan: parseCurrency(e.target.value) })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.tunjangan ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors.tunjangan && (
                  <p className="text-red-500 text-sm mt-1">{errors.tunjangan}</p>
                )}
              </div>
            </div>

            {/* Total Gaji (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Gaji
              </label>
              <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg">
                <span className="text-gray-700 font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0
                  }).format(formData.gajiPokok + formData.tunjangan)}
                </span>
              </div>
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
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

export default JabatanFormModal;
