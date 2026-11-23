import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { rapbsService } from '../../services/rapbsService';
import type { RAPBSRealization, RealizationFormData, RAPBSPlan } from '../../types/rapbs';

const formatAmountDisplay = (value: number | string) => {
  const numericValue =
    typeof value === 'number'
      ? value
      : Number(value.toString().replace(/\./g, '').replace(',', '.')) || 0;
  if (!numericValue) return '';
  return numericValue.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface RealizationFormProps {
  realization?: RAPBSRealization;
  onClose: () => void;
  onSave: () => void;
}

const RealizationForm: React.FC<RealizationFormProps> = ({ realization, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<RAPBSPlan[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<RealizationFormData>({
    rapbs_plan_id: realization?.rapbs_plan_id || 0,
    transaction_date: realization?.transaction_date || new Date().toISOString().split('T')[0],
    amount: realization?.amount || 0,
    description: realization?.description || '',
    vendor_name: realization?.vendor_name || '',
    payment_method: realization?.payment_method || 'transfer',
    reference_number: realization?.reference_number || '',
  });
  const [amountDisplay, setAmountDisplay] = useState(
    realization?.amount ? formatAmountDisplay(realization.amount) : ''
  );

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      console.log('Loading plans with status: approved');
      const response = await rapbsService.getPlans({ status: 'approved', per_page: 100 });
      console.log('Plans response:', response);
      
      if (response.success && response.data) {
        const plansData = response.data.data || [];
        console.log('Loaded plans:', plansData.length, plansData);
        setPlans(plansData);
        
        if (plansData.length === 0) {
          console.warn('No approved plans found. Trying without status filter...');
          // Fallback: try without status filter jika tidak ada approved plans
          const fallbackResponse = await rapbsService.getPlans({ per_page: 100 });
          if (fallbackResponse.success && fallbackResponse.data) {
            const fallbackPlans = fallbackResponse.data.data || [];
            console.log('Fallback plans:', fallbackPlans.length);
            setPlans(fallbackPlans);
          }
        }
      } else {
        console.warn('Response success is false or data is missing:', response);
        setPlans([]);
      }
    } catch (error: any) {
      console.error('Error loading plans:', error);
      console.error('Error details:', error.response?.data || error.message);
      setPlans([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('rapbs_plan_id', formData.rapbs_plan_id.toString());
      formDataToSend.append('transaction_date', formData.transaction_date);
      formDataToSend.append('amount', formData.amount.toString());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('vendor_name', formData.vendor_name);
      formDataToSend.append('payment_method', formData.payment_method);
      if (formData.reference_number) {
        formDataToSend.append('reference_number', formData.reference_number);
      }

      // Append multiple files
      selectedFiles.forEach((file) => {
        formDataToSend.append('documents[]', file);
      });

      if (realization) {
        await rapbsService.updateRealization(realization.id, formData);
      } else {
        await rapbsService.createRealizationWithFiles(formDataToSend);
      }
      onSave();
    } catch (error) {
      console.error('Error saving realization:', error);
      alert('Gagal menyimpan realisasi');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rapbs_plan_id' ? Number(value) : value,
    }));
  };

  const handleAmountInput = (rawValue: string) => {
    // treat dot as thousand separator and force comma for decimal
    const normalizedInput = rawValue.replace(/\./g, '');
    const sanitized = normalizedInput.replace(/[^0-9,]/g, '');
    const [integerPartRaw, decimalPartRaw] = sanitized.split(',');
    const integerPart = integerPartRaw || '';
    const decimalPart = decimalPartRaw ?? '';
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const limitedDecimal = decimalPart.slice(0, 2);

    const displayValue =
      decimalPartRaw !== undefined ? `${formattedInteger},${limitedDecimal}` : formattedInteger;

    const normalizedNumberString =
      integerPart === '' && !limitedDecimal
        ? ''
        : `${integerPart || '0'}${limitedDecimal ? `.${limitedDecimal}` : ''}`;
    const numericValue = normalizedNumberString ? Number(normalizedNumberString) : 0;

    setAmountDisplay(displayValue);
    setFormData((prev) => ({
      ...prev,
      amount: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  useEffect(() => {
    if (realization?.amount) {
      setAmountDisplay(formatAmountDisplay(realization.amount));
    } else {
      setAmountDisplay('');
    }
  }, [realization?.amount]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            {realization ? 'Edit Realisasi' : 'Tambah Realisasi'}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-500 rounded-lg p-1 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Rencana RAPBS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rencana RAPBS <span className="text-red-500">*</span>
              </label>
              <select
                name="rapbs_plan_id"
                value={formData.rapbs_plan_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Pilih Rencana</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title} - Rp {plan.planned_amount.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal Transaksi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Transaksi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  name="amount"
                  value={amountDisplay}
                  onChange={(e) => handleAmountInput(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Masukkan deskripsi transaksi"
              />
            </div>

            {/* Nama Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Vendor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleChange}
                required
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Masukkan nama vendor"
              />
            </div>

            {/* Metode Pembayaran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembayaran <span className="text-red-500">*</span>
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="cash">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="check">Cek</option>
              </select>
            </div>

            {/* Nomor Referensi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Referensi
              </label>
              <input
                type="text"
                name="reference_number"
                value={formData.reference_number}
                onChange={handleChange}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Masukkan nomor referensi (opsional)"
              />
            </div>

            {/* Multiple File Upload */}
            {!realization && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dokumen Pendukung
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: PDF, JPG, PNG (Max 10MB per file)
                </p>
                
                {/* File List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700 truncate flex-1">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : realization ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RealizationForm;

