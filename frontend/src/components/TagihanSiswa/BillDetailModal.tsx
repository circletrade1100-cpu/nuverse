import React, { useState, useEffect, useRef } from 'react';
import { X, User, FileText, DollarSign, Calendar, CreditCard, Clock, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, RefreshCw, Printer } from 'lucide-react';
import KwitansiTemplate from '../TU/KwitansiTemplate';
import toast from 'react-hot-toast';

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
  period_month?: number;
  period_year?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  student?: {
    nama_lengkap: string;
    nisn?: string;
    unit_kelas?: string;
    unit_sekolah?: string;
  };
  bill_type?: {
    name: string;
    description?: string;
  };
}

interface Payment {
  id: string;
  student_bill_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'transfer' | 'qris' | 'credit_card';
  reference_number?: string;
  is_installment: boolean;
  installment_number: number;
  notes?: string;
  processed_by: string;
  processed_by_user?: {
    name: string;
  };
  created_at: string;
}

interface BillDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: StudentBill | null;
}

const BillDetailModal: React.FC<BillDetailModalProps> = ({
  isOpen,
  onClose,
  bill
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [printMode, setPrintMode] = useState<'bill' | 'payment'>('bill');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && bill) {
      console.log('🚀 Modal opened for bill ID:', bill.id);
      fetchPayments();
    }
  }, [isOpen, bill]);

  // Auto-refresh payments every 10 seconds when modal is open
  useEffect(() => {
    if (!isOpen || !bill) return;
    
    const interval = setInterval(() => {
      fetchPayments();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [isOpen, bill]);

  const fetchPayments = async () => {
    if (!bill) return;
    
    try {
      setLoading(true);
      // Add cache-busting parameter to force fresh data
      const timestamp = Date.now();
      const response = await fetch(`https://nurverse.id/api/master-data/pembayaran/bill/payments.php?bill_id=${bill.id}&t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('🔍 Payment data fetched:', data.data);
        console.log('📊 Payment count:', data.data?.length || 0);
        setPayments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      unpaid: { bg: 'bg-red-100', text: 'text-red-800', label: 'Belum Bayar', icon: AlertCircle },
      partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Cicilan', icon: Clock },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Lunas', icon: CheckCircle2 },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', label: 'Jatuh Tempo', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'transfer':
        return <CreditCard className="h-4 w-4" />;
      case 'qris':
        return <FileText className="h-4 w-4" />;
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      cash: 'Tunai',
      transfer: 'Transfer',
      qris: 'QRIS',
      credit_card: 'Kartu Kredit'
    };
    return methods[method as keyof typeof methods] || method;
  };

  // Handle print kwitansi
  const handlePrintKwitansi = (payment?: Payment) => {
    if (payment) {
      setSelectedPayment(payment);
      setPrintMode('payment');
    } else {
      setSelectedPayment(null);
      setPrintMode('bill');
    }
    setShowPrintPreview(true);
  };

  const handleActualPrint = () => {
    if (!printRef.current) return;
    
    // Get all styles from the document
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');
    
    // Get content and fix logo path for print
    let printContent = printRef.current.innerHTML;
    printContent = printContent.replace(
      /src="\/logo-annur\.png"/g,
      'src="https://nurverse.id/logo-annur.png"'
    );
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup diblokir. Izinkan popup untuk melakukan print.');
      return;
    }
    
    const receiptNumber = printMode === 'payment' && selectedPayment?.reference_number
      ? selectedPayment.reference_number
      : bill?.id ? `TGH-${bill.id}` : 'KWITANSI';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kwitansi - ${receiptNumber}</title>
          <meta charset="utf-8">
          <style>
            ${styles}
            @page {
              margin: 0.5cm;
              size: A4 landscape;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              background: white;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      // Close window after print dialog closes
      printWindow.addEventListener('afterprint', () => {
        printWindow.close();
      });
    }, 250);
  };

  // Generate kwitansi data
  const getKwitansiData = () => {
    if (!bill) return null;

    if (printMode === 'payment' && selectedPayment) {
      // Kwitansi untuk pembayaran tertentu
      const period = bill.period_month && bill.period_year 
        ? `${bill.period_month}/${bill.period_year}` 
        : '';
      const description = `Pembayaran ${bill.bill_type?.name || 'Tagihan'}${period ? ` - Periode ${period}` : ''} - ${bill.student?.nama_lengkap || ''}${selectedPayment.is_installment ? ` (Cicilan #${selectedPayment.installment_number})` : ''}`;
      
      return {
        nomorKwitansi: selectedPayment.reference_number || `PMT-${selectedPayment.id}`,
        tanggal: selectedPayment.payment_date,
        diterimaDari: bill.student?.nama_lengkap || '-',
        jumlah: selectedPayment.amount,
        untukPembayaran: bill.bill_type?.name || description,
        dibayarOleh: bill.student?.nama_lengkap || '-',
        kategori: bill.bill_type?.name || '',
        metodePembayaran: selectedPayment.payment_method === 'cash' ? 'cash' : selectedPayment.payment_method === 'transfer' ? 'transfer' : 'card',
        dibuatOleh: selectedPayment.processed_by_user?.name || 'System',
        disetujuiOleh: selectedPayment.processed_by_user?.name || '-'
      };
    } else {
      // Kwitansi untuk total tagihan
      const period = bill.period_month && bill.period_year 
        ? `${bill.period_month}/${bill.period_year}` 
        : '';
      const description = `Pembayaran ${bill.bill_type?.name || 'Tagihan'}${period ? ` - Periode ${period}` : ''} - ${bill.student?.nama_lengkap || ''}`;
      
      return {
        nomorKwitansi: `TGH-${bill.id}`,
        tanggal: bill.due_date,
        diterimaDari: bill.student?.nama_lengkap || '-',
        jumlah: bill.paid_amount || bill.total_amount,
        untukPembayaran: bill.bill_type?.name || description,
        dibayarOleh: bill.student?.nama_lengkap || '-',
        kategori: bill.bill_type?.name || '',
        metodePembayaran: 'cash',
        dibuatOleh: 'System',
        disetujuiOleh: '-'
      };
    }
  };

  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Detail Tagihan Siswa</h2>
              <p className="text-indigo-100 text-sm mt-1">Informasi lengkap tagihan dan riwayat pembayaran</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Bill Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Bill Details */}
              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Informasi Siswa</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Nama Lengkap</label>
                      <p className="text-lg font-bold text-gray-900">{bill.student?.nama_lengkap || 'N/A'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-600">NISN</label>
                        <p className="text-sm text-gray-900">{bill.student?.nisn || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Kelas</label>
                        <p className="text-sm text-gray-900">{bill.student?.unit_kelas || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {bill.student?.unit_sekolah && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Unit Sekolah</label>
                        <p className="text-sm text-gray-900">{bill.student.unit_sekolah}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bill Details */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Detail Tagihan</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Jenis Tagihan</label>
                      <p className="text-lg font-bold text-gray-900">{bill.bill_type?.name || 'N/A'}</p>
                      {bill.bill_type?.description && (
                        <p className="text-sm text-gray-600 mt-1">{bill.bill_type.description}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Periode</label>
                        <p className="text-sm text-gray-900">
                          {bill.period_month && bill.period_year 
                            ? `${bill.period_month}/${bill.period_year}`
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Status</label>
                        <div className="mt-1">{getStatusBadge(bill.status)}</div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Jatuh Tempo</label>
                      <p className="text-sm text-gray-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(bill.due_date)}
                      </p>
                    </div>
                    
                    {bill.notes && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Catatan</label>
                        <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">{bill.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Payment Summary */}
              <div className="space-y-6">
                {/* Amount Summary */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Ringkasan Pembayaran</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl border">
                      <span className="text-sm font-semibold text-gray-600">Total Tagihan</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(bill.total_amount)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl border">
                      <span className="text-sm font-semibold text-gray-600">Sudah Dibayar</span>
                      <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {formatCurrency(bill.paid_amount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl border">
                      <span className="text-sm font-semibold text-gray-600">Sisa Tagihan</span>
                      <span className={`text-lg font-bold flex items-center gap-1 ${
                        bill.remaining_amount > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {bill.remaining_amount > 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        {formatCurrency(bill.remaining_amount)}
                      </span>
                    </div>
                    
                    {bill.allow_installment && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-800">
                          <CreditCard className="h-4 w-4" />
                          <span className="text-sm font-medium">Pembayaran Cicilan Diizinkan</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Timeline */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Timeline Pembayaran</h3>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    Dibuat: {formatDate(bill.created_at)} | 
                    Diperbarui: {formatDate(bill.updated_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Riwayat Pembayaran</h3>
                    <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                      {payments.length} pembayaran
                    </span>
                  </div>
                  <button
                    onClick={fetchPayments}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Refresh data"
                  >
                    <RefreshCw className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Memuat riwayat pembayaran...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Belum ada riwayat pembayaran</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            {getPaymentMethodIcon(payment.payment_method)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(payment.amount)}
                              </span>
                              {payment.is_installment && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  Cicilan #{payment.installment_number}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getPaymentMethodLabel(payment.payment_method)} • {formatDate(payment.payment_date)}
                              {payment.reference_number && (
                                <span className="ml-2 text-gray-500">
                                  (Ref: {payment.reference_number})
                                </span>
                              )}
                            </div>
                            {payment.notes && (
                              <div className="text-xs text-gray-500 mt-1">{payment.notes}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <button
                            onClick={() => handlePrintKwitansi(payment)}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1"
                            title="Print Kwitansi"
                          >
                            <Printer className="h-3 w-3" />
                            Print Kwitansi
                          </button>
                          <div className="text-xs text-gray-500">
                            {payment.processed_by_user?.name || 'System'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(payment.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t flex justify-end gap-3">
          <button
            onClick={() => handlePrintKwitansi()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium flex items-center gap-2"
            disabled={!bill || bill.paid_amount === 0}
          >
            <Printer className="h-4 w-4" />
            Print Kwitansi Tagihan
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all font-medium"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && getKwitansiData() && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-4 text-white flex-shrink-0 flex justify-between items-center">
              <h2 className="text-xl font-bold">Preview Kwitansi</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleActualPrint}
                  className="px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 flex items-center gap-2 font-semibold text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold text-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
            
            {/* Template Preview - Scaled down */}
            <div className="flex-1 bg-gray-50 rounded-lg shadow-lg overflow-auto p-4 flex items-start justify-center">
              <div className="preview-scale-75 w-full max-w-4xl">
                <KwitansiTemplate
                  ref={printRef}
                  data={getKwitansiData()!}
                  showWatermark={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .preview-scale-75 {
          transform: scale(0.75);
          transform-origin: top center;
        }
        @media print {
          .preview-scale-75 {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default BillDetailModal;
