import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle2, User, FileText, Clock } from 'lucide-react';

interface StudentBill {
  id: string;
  student_id: string;
  bill_type_id: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  allow_installment: boolean;
  student?: {
    nama_lengkap: string;
    nisn?: string;
    unit_kelas?: string;
  };
  bill_type?: {
    name: string;
  };
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
  bill: StudentBill | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  bill
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    is_installment: false,
    notes: ''
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen && bill) {
      // Reset form when modal opens
      setFormData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: '',
        is_installment: false,
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen, bill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bill) return;
    
    // Validation
    const newErrors: any = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Jumlah pembayaran harus lebih dari 0';
    }
    
    if (parseFloat(formData.amount) > bill.remaining_amount) {
      newErrors.amount = 'Jumlah pembayaran melebihi sisa tagihan';
    }
    
    if (!formData.payment_date) {
      newErrors.payment_date = 'Pilih tanggal pembayaran';
    }
    
    if (!formData.payment_method) {
      newErrors.payment_method = 'Pilih metode pembayaran';
    }

    if (formData.payment_method === 'transfer' && !formData.reference_number) {
      newErrors.reference_number = 'Nomor referensi diperlukan untuk transfer';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data for submission
    const submitData = {
      student_bill_id: bill.id,
      amount: parseFloat(formData.amount),
      payment_date: formData.payment_date,
      payment_method: formData.payment_method,
      reference_number: formData.reference_number || null,
      is_installment: formData.is_installment,
      notes: formData.notes || null
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Proses Pembayaran</h2>
              <p className="text-green-100 mt-1">Konfirmasi pembayaran tagihan siswa</p>
            </div>
            <button
              onClick={onClose}
              className="text-green-100 hover:text-white hover:bg-green-700 p-2 rounded-full transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Bill Info */}
          <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Informasi Tagihan</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Siswa */}
            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <label className="text-sm font-semibold text-gray-600">Siswa</label>
              </div>
              <p className="text-lg font-bold text-gray-900">{bill.student?.nama_lengkap || 'N/A'}</p>
              {bill.student?.unit_kelas && (
                <p className="text-sm text-gray-500 mt-1">{bill.student.unit_kelas}</p>
              )}
            </div>

            {/* Jenis Tagihan */}
            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <label className="text-sm font-semibold text-gray-600">Jenis Tagihan</label>
              </div>
              <p className="text-lg font-bold text-gray-900">{bill.bill_type?.name || 'N/A'}</p>
            </div>

            {/* Total Tagihan */}
            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <label className="text-sm font-semibold text-gray-600">Total Tagihan</label>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(bill.total_amount)}</p>
            </div>

            {/* Sudah Dibayar */}
            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-orange-200 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-orange-600" />
                </div>
                <label className="text-sm font-semibold text-gray-600">Sudah Dibayar</label>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(bill.paid_amount)}</p>
            </div>

            {/* Sisa Tagihan */}
            <div className="bg-white p-4 rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <label className="text-sm font-semibold text-blue-700">Sisa Tagihan</label>
              </div>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(bill.remaining_amount)}</p>
            </div>

            {/* Jatuh Tempo */}
            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-red-200 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-red-600" />
                </div>
                <label className="text-sm font-semibold text-gray-600">Jatuh Tempo</label>
              </div>
              <p className="text-lg font-bold text-gray-900">{new Date(bill.due_date).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 bg-gray-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Detail Pembayaran</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Payment Amount */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <label className="text-lg font-semibold text-gray-900">
                  Jumlah Pembayaran
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={formData.amount ? new Intl.NumberFormat('id-ID').format(parseFloat(formData.amount) || 0) : ''}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                    handleInputChange('amount', numericValue);
                  }}
                  placeholder={`Maksimal ${formatCurrency(bill.remaining_amount)}`}
                  className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all text-gray-900 placeholder-gray-400 ${
                    errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-500 font-semibold">Rp</span>
                </div>
              </div>
              
              {formData.amount && parseFloat(formData.amount) > 0 && (
                <p className="text-sm text-green-600 mt-2 font-semibold">
                  {formatCurrency(parseFloat(formData.amount))}
                </p>
              )}
              
              {errors.amount && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.amount}</span>
                </div>
              )}
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('amount', Math.floor(bill.remaining_amount * 0.25).toString())}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('amount', Math.floor(bill.remaining_amount * 0.5).toString())}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('amount', Math.floor(bill.remaining_amount * 0.75).toString())}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
                >
                  75%
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('amount', bill.remaining_amount.toString())}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-lg"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Payment Date & Method - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Date */}
              <div className="bg-white p-6 rounded-xl border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <label className="text-lg font-semibold text-gray-900">
                    Tanggal Pembayaran
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => handleInputChange('payment_date', e.target.value)}
                  className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-900 ${
                    errors.payment_date ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.payment_date && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.payment_date}</span>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-xl border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                  </div>
                  <label className="text-lg font-semibold text-gray-900">
                    Metode Pembayaran
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
                <select
                  value={formData.payment_method}
                  onChange={(e) => handleInputChange('payment_method', e.target.value)}
                  className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all text-gray-900 bg-white ${
                    errors.payment_method ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="cash" className="text-gray-900">Tunai</option>
                  <option value="transfer" className="text-gray-900">Transfer Bank</option>
                  <option value="qris" className="text-gray-900">QRIS</option>
                  <option value="credit_card" className="text-gray-900">Kartu Kredit</option>
                </select>
                {errors.payment_method && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.payment_method}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reference Number (for transfer) */}
            {(formData.payment_method === 'transfer' || formData.payment_method === 'qris') && (
              <div className="bg-white p-6 rounded-xl border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-orange-600" />
                  </div>
                  <label className="text-lg font-semibold text-gray-900">
                    Nomor Referensi
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => handleInputChange('reference_number', e.target.value)}
                  placeholder="Masukkan nomor referensi pembayaran"
                  className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400 ${
                    errors.reference_number ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.reference_number && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.reference_number}</span>
                  </div>
                )}
              </div>
            )}

            {/* Allow Installment */}
            {bill.allow_installment && (
              <div className="bg-white p-6 rounded-xl border-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_installment"
                    checked={formData.is_installment}
                    onChange={(e) => handleInputChange('is_installment', e.target.checked)}
                    className="h-5 w-5 text-green-600 focus:ring-2 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_installment" className="text-lg font-semibold text-gray-900 cursor-pointer">
                    Tandai sebagai pembayaran cicilan
                  </label>
                </div>
                <p className="text-sm text-gray-600 mt-2 ml-8">
                  Centang jika ini adalah pembayaran cicilan (tidak lunas)
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-gray-600" />
                </div>
                <label className="text-lg font-semibold text-gray-900">
                  Catatan <span className="text-gray-400">(Opsional)</span>
                </label>
              </div>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Tambahkan catatan pembayaran jika diperlukan..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-100 focus:border-gray-400 transition-all text-gray-900 placeholder-gray-400 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg"
              >
                Proses Pembayaran
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
