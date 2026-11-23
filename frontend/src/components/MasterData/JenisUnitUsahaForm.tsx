import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import jenisUnitUsahaService from '../../services/jenisUnitUsahaService';
import type { JenisUnitUsaha, JenisUnitUsahaFormData } from '../../services/jenisUnitUsahaService';

interface JenisUnitUsahaFormProps {
  jenisUnitUsaha?: JenisUnitUsaha;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const JenisUnitUsahaForm: React.FC<JenisUnitUsahaFormProps> = ({
  jenisUnitUsaha,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<JenisUnitUsahaFormData>({
    kode_unit_usaha: '',
    nama_jenis_unit_usaha: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (jenisUnitUsaha) {
        setFormData({
          kode_unit_usaha: jenisUnitUsaha.kode_unit_usaha,
          nama_jenis_unit_usaha: jenisUnitUsaha.nama_jenis_unit_usaha,
          status: jenisUnitUsaha.status
        });
      } else {
        setFormData({
          kode_unit_usaha: '',
          nama_jenis_unit_usaha: '',
          status: 'active'
        });
      }
      setErrors({});
    }
  }, [isOpen, jenisUnitUsaha]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.kode_unit_usaha.trim()) {
      newErrors.kode_unit_usaha = 'Kode unit usaha harus diisi';
    } else if (formData.kode_unit_usaha.length > 10) {
      newErrors.kode_unit_usaha = 'Kode unit usaha maksimal 10 karakter';
    }

    if (!formData.nama_jenis_unit_usaha.trim()) {
      newErrors.nama_jenis_unit_usaha = 'Nama jenis unit usaha harus diisi';
    } else if (formData.nama_jenis_unit_usaha.length > 100) {
      newErrors.nama_jenis_unit_usaha = 'Nama jenis unit usaha maksimal 100 karakter';
    }

    if (!formData.status) {
      newErrors.status = 'Status harus dipilih';
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
      if (jenisUnitUsaha) {
        await jenisUnitUsahaService.update(jenisUnitUsaha.id, formData);
        toast.success('Jenis unit usaha berhasil diperbarui');
      } else {
        await jenisUnitUsahaService.create(formData);
        toast.success('Jenis unit usaha berhasil ditambahkan');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving jenis unit usaha:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {jenisUnitUsaha ? 'Edit Jenis Unit Usaha' : 'Tambah Jenis Unit Usaha'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Kode Unit Usaha */}
            <div>
              <label htmlFor="kode_unit_usaha" className="block text-sm font-medium text-gray-700 mb-1">
                Kode Unit Usaha <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="kode_unit_usaha"
                name="kode_unit_usaha"
                value={formData.kode_unit_usaha}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.kode_unit_usaha ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan kode unit usaha"
                maxLength={10}
              />
              {errors.kode_unit_usaha && (
                <p className="mt-1 text-sm text-red-600">{errors.kode_unit_usaha}</p>
              )}
            </div>

            {/* Nama Jenis Unit Usaha */}
            <div>
              <label htmlFor="nama_jenis_unit_usaha" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Jenis Unit Usaha <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama_jenis_unit_usaha"
                name="nama_jenis_unit_usaha"
                value={formData.nama_jenis_unit_usaha}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nama_jenis_unit_usaha ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan nama jenis unit usaha"
                maxLength={100}
              />
              {errors.nama_jenis_unit_usaha && (
                <p className="mt-1 text-sm text-red-600">{errors.nama_jenis_unit_usaha}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : (jenisUnitUsaha ? 'Update' : 'Simpan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JenisUnitUsahaForm;
