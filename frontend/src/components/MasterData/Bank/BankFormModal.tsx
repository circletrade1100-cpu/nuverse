import React, { useEffect, useState } from 'react';
import { X, Landmark } from 'lucide-react';
import type { BankFormData } from '../../../types/masterData';

interface BankFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BankFormData) => Promise<void>;
  isEdit?: boolean;
  initialData?: BankFormData;
}

const emptyForm: BankFormData = {
  namaBank: '',
  nomorRekening: '',
};

const BankFormModal: React.FC<BankFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit = false,
  initialData,
}) => {
  const [formData, setFormData] = useState<BankFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof BankFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ?? emptyForm);
      setErrors({});
    }
  }, [isOpen, initialData]);

  const resetForm = () => {
    setFormData(emptyForm);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BankFormData, string>> = {};

    if (!formData.namaBank.trim()) {
      newErrors.namaBank = 'Nama bank wajib diisi';
    }

    if (!formData.nomorRekening.trim()) {
      newErrors.nomorRekening = 'Nomor rekening wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      if (!isEdit) {
        resetForm();
      }
      onClose();
    } catch (error) {
      console.error('Gagal menyimpan data bank:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    if (!isEdit) {
      resetForm();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Landmark className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEdit ? 'Edit Data Bank' : 'Tambah Data Bank'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEdit ? 'Perbarui informasi bank' : 'Masukkan informasi bank baru'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Tutup modal bank"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Bank *
            </label>
            <input
              type="text"
              value={formData.namaBank}
              onChange={(event) => setFormData({ ...formData, namaBank: event.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.namaBank ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Contoh: Bank Mandiri"
              autoFocus
            />
            {errors.namaBank && <p className="text-sm text-red-500 mt-1">{errors.namaBank}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Rekening *
            </label>
            <input
              type="text"
              value={formData.nomorRekening}
              onChange={(event) => setFormData({ ...formData, nomorRekening: event.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.nomorRekening ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Contoh: 1234567890"
            />
            {errors.nomorRekening && (
              <p className="text-sm text-red-500 mt-1">{errors.nomorRekening}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankFormModal;

