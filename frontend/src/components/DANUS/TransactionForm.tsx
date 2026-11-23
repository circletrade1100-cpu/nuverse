import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { danusService, type BusinessTransaction, type BusinessTransactionFormData, type BusinessUnit } from '../../services/danusService';

interface TransactionFormProps {
  transaction?: BusinessTransaction;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<BusinessTransactionFormData>({
    business_unit_id: 0,
    transaction_type: 'income',
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchBusinessUnits();
      
      if (transaction) {
        setFormData({
          business_unit_id: transaction.business_unit_id,
          transaction_type: transaction.transaction_type,
          amount: transaction.amount,
          description: transaction.description,
          transaction_date: transaction.transaction_date,
          payment_method: transaction.payment_method,
          reference_number: transaction.reference_number || '',
          notes: transaction.notes || ''
        });
      } else {
        setFormData({
          business_unit_id: 0,
          transaction_type: 'income',
          amount: 0,
          description: '',
          transaction_date: new Date().toISOString().split('T')[0],
          payment_method: 'cash',
          reference_number: '',
          notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, transaction]);

  const fetchBusinessUnits = async () => {
    try {
      const response = await danusService.getBusinessUnits({ per_page: 100 });
      if (response.success) {
        setBusinessUnits(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching business units:', error);
    }
  };

  const formatCurrencyInput = (value: number): string => {
    if (!value) return '';
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const parseCurrencyInput = (value: string): number => {
    if (!value) return 0;
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
      [name]: name === 'amount' || name === 'business_unit_id' ? 
        (value ? parseFloat(value) : 0) : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.business_unit_id || formData.business_unit_id === 0) {
      newErrors.business_unit_id = 'Unit usaha harus dipilih';
    }

    if (!formData.transaction_type) {
      newErrors.transaction_type = 'Jenis transaksi harus dipilih';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Jumlah harus diisi dan lebih dari 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi harus diisi';
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Tanggal transaksi harus diisi';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Metode pembayaran harus dipilih';
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
      if (transaction) {
        await danusService.updateTransaction(transaction.id, formData);
      } else {
        await danusService.createTransaction(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
              </h3>
              <p className="text-blue-100 mt-1">
                {transaction ? 'Ubah informasi transaksi' : 'Tambahkan transaksi baru'}
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Information */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Informasi Dasar
                </h4>
                <p className="text-sm text-gray-600 mt-1">Data utama transaksi</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Unit Usaha */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Unit Usaha <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="business_unit_id"
                    value={formData.business_unit_id}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.business_unit_id ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <option value={0}>Pilih Unit Usaha</option>
                    {businessUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                  {errors.business_unit_id && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.business_unit_id}
                    </p>
                  )}
                </div>

                {/* Jenis Transaksi */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Jenis Transaksi <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="transaction_type"
                    value={formData.transaction_type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.transaction_type ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                  </select>
                  {errors.transaction_type && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.transaction_type}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Financial Information */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Informasi Keuangan
                </h4>
                <p className="text-sm text-gray-600 mt-1">Detail pembayaran dan nominal</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Jumlah */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">Rp</span>
                    </div>
                    <input
                      type="text"
                      name="amount"
                      value={formData.amount ? formatCurrencyInput(formData.amount) : ''}
                      onChange={handleCurrencyInputChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="0"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* Metode Pembayaran */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Metode Pembayaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.payment_method ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <option value="cash">Tunai</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="credit_card">Kartu Kredit</option>
                    <option value="debit_card">Kartu Debit</option>
                    <option value="other">Lainnya</option>
                  </select>
                  {errors.payment_method && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.payment_method}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Additional Information */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Informasi Tambahan
                </h4>
                <p className="text-sm text-gray-600 mt-1">Detail dan referensi transaksi</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tanggal Transaksi */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tanggal Transaksi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.transaction_date ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                  {errors.transaction_date && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.transaction_date}
                    </p>
                  )}
                </div>

                {/* Nomor Referensi */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nomor Referensi
                  </label>
                  <input
                    type="text"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="Masukkan nomor referensi"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Masukkan deskripsi transaksi"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Catatan */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Catatan
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                  placeholder="Masukkan catatan tambahan"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 hover:shadow-md"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </div>
                ) : (
                  transaction ? 'Update' : 'Simpan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;