import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Transaction } from '../../services/divisiUnitService';
import divisiUnitService from '../../services/divisiUnitService';
import unitKerjaService from '../../services/unitKerjaService';
import toast from 'react-hot-toast';

// Fungsi format rupiah
function formatRupiah(value: string | number): string {
  let numberString = String(value).replace(/[^\d]/g, '');
  if (!numberString) return '';
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  transaction?: Transaction | null;
  type: 'income' | 'expense';
  fundingSourceType?: 'regular' | 'bos' | 'other';
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  type,
  fundingSourceType
}) => {
  const [formData, setFormData] = useState({
    unit_kerja_id: '',
    funding_source_id: '',
    transaction_type: type,
    amount: '',
    description: '',
    transaction_date: '',
    reference_number: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [fundingSources, setFundingSources] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchDivisions();
      fetchFundingSources();
    }
  }, [isOpen]);

  const fetchDivisions = async () => {
    try {
      const response = await unitKerjaService.getAll({ per_page: 100 });
      const data = response.data.data;
      console.log('Unit Kerja data:', data);
      setDivisions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching unit kerja:', error);
      setDivisions([]);
      toast.error('Gagal memuat data unit kerja');
    }
  };

  const fetchFundingSources = async () => {
    try {
      const response = await divisiUnitService.getFundingSources();
      // Handle paginated response: data.data.data or non-paginated: data.data
      const data = response.data.data?.data || response.data.data;
      console.log('Funding sources data:', data);
      setFundingSources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching funding sources:', error);
      setFundingSources([]);
      toast.error('Gagal memuat data sumber dana');
    }
  };

  useEffect(() => {
    if (transaction) {
      setFormData({
        unit_kerja_id: transaction.unit_kerja_id.toString(),
        funding_source_id: transaction.funding_source_id.toString(),
        transaction_type: transaction.transaction_type,
        amount: transaction.amount.toString(),
        description: transaction.description || '',
        transaction_date: transaction.transaction_date,
        reference_number: transaction.reference_number
      });
    } else {
      setFormData({
        unit_kerja_id: '',
        funding_source_id: '',
        transaction_type: type,
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        reference_number: `REF-${Date.now()}`
      });
    }
  }, [transaction, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle input change untuk format rupiah
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^\d]/g, '');
    setFormData(prev => ({ ...prev, amount: numericValue }));
    // Clear error when user types
    if (errors.amount) {
      setErrors((prev: any) => ({ ...prev, amount: '' }));
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.unit_kerja_id) newErrors.unit_kerja_id = 'Unit Kerja harus dipilih';
    if (!formData.funding_source_id) newErrors.funding_source_id = 'Sumber dana harus dipilih';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Jumlah harus lebih dari 0';
    }
    if (!formData.transaction_date) newErrors.transaction_date = 'Tanggal harus diisi';
    if (!formData.reference_number) newErrors.reference_number = 'No. Referensi harus diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      unit_kerja_id: '',
      funding_source_id: '',
      transaction_type: type,
      amount: '',
      description: '',
      transaction_date: '',
      reference_number: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Division */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Unit Kerja <span className="text-red-500">*</span>
              </label>
              <select
                name="unit_kerja_id"
                value={formData.unit_kerja_id}
                onChange={handleChange}
                className={`w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 text-black ${
                  errors.unit_kerja_id ? 'border-red-500' : ''
                }`}
              >
                <option value="">Pilih Unit Kerja</option>
                {Array.isArray(divisions) && divisions.length > 0 ? (
                  divisions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.nama} ({div.kode})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading...</option>
                )}
              </select>
              {errors.unit_kerja_id && (
                <p className="text-red-500 text-xs mt-1">{errors.unit_kerja_id}</p>
              )}
            </div>

            {/* Funding Source */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Sumber Dana <span className="text-red-500">*</span>
              </label>
              <select
                name="funding_source_id"
                value={formData.funding_source_id}
                onChange={handleChange}
                className={`w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 text-black ${
                  errors.funding_source_id ? 'border-red-500' : ''
                }`}
              >
                <option value="">Pilih Sumber Dana</option>
                {Array.isArray(fundingSources) && fundingSources.length > 0 ? (
                  fundingSources.map((fs) => (
                    <option key={fs.id} value={fs.id}>
                      {fs.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading...</option>
                )}
              </select>
              {errors.funding_source_id && (
                <p className="text-red-500 text-xs mt-1">{errors.funding_source_id}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Jumlah (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="amount"
                value={formatRupiah(formData.amount)}
                onChange={handleAmountChange}
                className={`w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 text-black ${
                  errors.amount ? 'border-red-500' : ''
                }`}
                placeholder="Masukkan jumlah..."
              />
              {formData.amount && (
                <p className="text-xs text-green-600 mt-1">
                  Rp {formatRupiah(formData.amount)}
                </p>
              )}
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Transaction Date */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Tanggal Transaksi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleChange}
                className={`w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 text-black [color-scheme:light] ${
                  errors.transaction_date ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '20px 20px',
                  paddingRight: '40px'
                }}
              />
              {errors.transaction_date && (
                <p className="text-red-500 text-xs mt-1">{errors.transaction_date}</p>
              )}
            </div>

            {/* Reference Number */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-black mb-2">
                No. Referensi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reference_number"
                value={formData.reference_number}
                onChange={handleChange}
                className={`w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 text-black ${
                  errors.reference_number ? 'border-red-500' : ''
                }`}
                placeholder="REF-..."
              />
              {errors.reference_number && (
                <p className="text-red-500 text-xs mt-1">{errors.reference_number}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-black mb-2">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 resize-none text-black"
                placeholder="Deskripsi transaksi..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : transaction ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;

