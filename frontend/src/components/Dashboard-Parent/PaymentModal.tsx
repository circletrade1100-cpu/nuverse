import React, { useState } from 'react';
import { X, CreditCard, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { tokenManager } from '../../services/api';

interface TagihanItem {
  id: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  billType?: {
    name: string;
  };
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: TagihanItem;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, bill, onSuccess }) => {
  const [paymentMode, setPaymentMode] = useState<'full' | 'installment'>('full');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('bca');
  const [loading, setLoading] = useState(false);

  const formatRupiah = (value: string) => {
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      if (paymentMode === 'installment') {
        const amount = Number(customAmount);
        
        if (!amount || amount < 10000) {
          toast.error('Minimal pembayaran Rp 10.000');
          setLoading(false);
          return;
        }
        
        if (amount > bill.remaining_amount) {
          toast.error('Jumlah melebihi sisa tagihan');
          setLoading(false);
          return;
        }
      }

      const token = tokenManager.getToken();
      const payload: any = { bank: selectedBank };

      if (paymentMode === 'installment') {
        payload.amount = Number(customAmount);
      }
      
      const response = await fetch(`https://nurverse.id/api/student-auth/bills/${bill.id}/payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        (window as any).snap.pay(data.data.snap_token, {
          onSuccess: () => {
            toast.success('Pembayaran berhasil!');
            onClose();
            onSuccess();
          },
          onPending: () => {
            toast('Menunggu pembayaran...', { icon: '⏳' });
            onClose();
          },
          onError: () => {
            toast.error('Pembayaran gagal');
          },
        });
      } else {
        toast.error(data.message || 'Gagal membuat pembayaran');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pembayaran Tagihan</h2>
          <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-2">{bill.billType?.name}</h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">Total:</span> Rp {bill.total_amount.toLocaleString('id-ID')}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Terbayar:</span> Rp {bill.paid_amount.toLocaleString('id-ID')}
            </p>
            <p className="text-blue-800 font-bold text-base">
              <span>Sisa:</span> Rp {bill.remaining_amount.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Metode Pembayaran</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMode('full')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMode === 'full' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className={`w-6 h-6 mb-2 ${paymentMode === 'full' ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className="font-semibold text-sm">Bayar Lunas</p>
              <p className="text-xs text-gray-600 mt-1">Rp {bill.remaining_amount.toLocaleString('id-ID')}</p>
            </button>
            
            <button
              onClick={() => setPaymentMode('installment')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMode === 'installment' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Wallet className={`w-6 h-6 mb-2 ${paymentMode === 'installment' ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className="font-semibold text-sm">Cicilan</p>
              <p className="text-xs text-gray-600 mt-1">Nominal bebas</p>
            </button>
          </div>
        </div>

        {paymentMode === 'installment' && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nominal Pembayaran</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">Rp</span>
              <input
                type="text"
                value={formatRupiah(customAmount)}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none text-lg font-semibold"
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Minimal: Rp 10.000 • Maksimal: Rp {bill.remaining_amount.toLocaleString('id-ID')}
            </p>
            {customAmount && Number(customAmount) > 0 && (
              <p className="text-sm text-blue-700 mt-2 font-medium">
                Sisa setelah bayar: Rp {Math.max(0, bill.remaining_amount - Number(customAmount)).toLocaleString('id-ID')}
              </p>
            )}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Pilih Bank</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { code: 'bca', name: 'BCA' },
              { code: 'bni', name: 'BNI' },
              { code: 'bri', name: 'BRI' },
              { code: 'mandiri', name: 'Mandiri' }
            ].map((bank) => (
              <button
                key={bank.code}
                onClick={() => setSelectedBank(bank.code)}
                className={`p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                  selectedBank === bank.code
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {bank.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || (paymentMode === 'installment' && !customAmount)}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

