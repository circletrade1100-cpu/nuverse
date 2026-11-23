import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  CreditCard,
  Receipt,
  Filter,
  Search,
  Eye,
  EyeOff,
  Download,
  Bell,
  Home,
  FileText,
  ScanLine,
  Activity,
  LogOut,
  History,
  X,
  Printer
} from 'lucide-react';
import { tokenManager } from '../../services/api';
import PaymentModal from '../../components/Dashboard-Parent/PaymentModal';
import KwitansiTemplate from '../../components/TU/KwitansiTemplate';
import toast, { Toaster } from 'react-hot-toast';

interface TagihanItem {
  id: string;
  bill_type_id: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  period_month?: number;
  period_year?: number;
  notes?: string;
  bill_type?: {
    id: string;
    name: string;
    description?: string;
  };
  created_at: string;
}

interface Payment {
  id: string;
  student_bill_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  is_installment: boolean;
  installment_number: number;
  notes: string;
  processed_by: {
    id: string;
    name: string;
  };
  created_at: string;
}

const Tagihan: React.FC = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('semua');
  const [isAnimated, setIsAnimated] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagihanData, setTagihanData] = useState<TagihanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<TagihanItem | null>(null);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [selectedBillForHistory, setSelectedBillForHistory] = useState<TagihanItem | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch tagihan dari API
  useEffect(() => {
    fetchTagihan();
  }, []);

  const fetchTagihan = async () => {
    try {
      setLoading(true);
      const token = tokenManager.getToken();
      
      if (!token) {
        console.error('Token tidak ditemukan');
        navigate('/parent/login');
        return;
      }
      
      console.log('🔄 Fetching tagihan from backend...');
      
      const response = await fetch('https://nurverse.id/api/student-auth/tagihan', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Data received:', data);
      
      if (data.success && data.data) {
        console.log(`📊 Total tagihan: ${data.data.length}`);
        setTagihanData(data.data);
      } else {
        console.error('❌ Failed to fetch tagihan:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching tagihan:', error);
      // Jika error 401, redirect ke login
      if (error instanceof Error && error.message.includes('401')) {
        tokenManager.removeToken();
        localStorage.removeItem('student_data');
        navigate('/parent/login');
      }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'unpaid': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'partial': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'unpaid': return <Clock className="w-4 h-4" />;
      case 'partial': return <AlertCircle className="w-4 h-4" />;
      case 'overdue': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Lunas';
      case 'unpaid': return 'Belum Bayar';
      case 'partial': return 'Cicilan';
      case 'overdue': return 'Terlambat';
      default: return status;
    }
  };

  const getPriorityColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'border-l-red-500';
      case 'unpaid': return 'border-l-orange-500';
      case 'partial': return 'border-l-yellow-500';
      case 'paid': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const filteredTagihan = tagihanData.filter(item => {
    // Filter by status
    const matchesStatus = selectedFilter === 'semua' || item.status === selectedFilter;
    
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      (item.bill_type?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const totalPending = tagihanData
    .filter(item => item.status === 'unpaid' || item.status === 'overdue' || item.status === 'partial')
    .reduce((sum, item) => sum + Number(item.remaining_amount || 0), 0);

  const totalTagihan = tagihanData.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);

  const statistik = {
    lunas: tagihanData.filter(item => item.status === 'paid').length,
    pending: tagihanData.filter(item => item.status === 'unpaid').length,
    partial: tagihanData.filter(item => item.status === 'partial').length,
    overdue: tagihanData.filter(item => item.status === 'overdue').length,
    total: tagihanData.length
  };

  // Smooth animation on mount
  useEffect(() => {
    setIsAnimated(true);
  }, []);

  const handlePaymentClick = (bill: TagihanItem) => {
    setSelectedBillForPayment(bill);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    fetchTagihan();
  };

  const handleHistoryClick = async (bill: TagihanItem) => {
    setSelectedBillForHistory(bill);
    setShowPaymentHistoryModal(true);
    await fetchPaymentHistory(bill.id);
  };

  const fetchPaymentHistory = async (billId: string) => {
    try {
      setLoadingHistory(true);
      const token = tokenManager.getToken();
      const response = await fetch(`https://nurverse.id/api/master-data/pembayaran/bill/payments.php?bill_id=${billId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setPaymentHistory(data.data || []);
      } else {
        toast.error('Gagal mengambil riwayat pembayaran');
        setPaymentHistory([]);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('Terjadi kesalahan saat mengambil riwayat pembayaran');
      setPaymentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Get payment method label
  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      'cash': 'Tunai',
      'transfer': 'Transfer',
      'qris': 'QRIS',
      'credit_card': 'Kartu Kredit',
      'midtrans': 'Midtrans'
    };
    return labels[method] || method;
  };

  // Handle print kwitansi
  const handlePrintKwitansi = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPrintPreview(true);
  };

  const handleActualPrint = () => {
    if (!printRef.current || !selectedPayment) return;
    
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
    
    const receiptNumber = selectedPayment.reference_number || `PMT-${selectedPayment.id}`;
    
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
    if (!selectedPayment || !selectedBillForHistory) return null;

    const period = selectedBillForHistory.period_month && selectedBillForHistory.period_year 
      ? `${selectedBillForHistory.period_month}/${selectedBillForHistory.period_year}` 
      : '';
    const description = `Pembayaran ${selectedBillForHistory.bill_type?.name || 'Tagihan'}${period ? ` - Periode ${period}` : ''}${selectedPayment.is_installment ? ` (Cicilan #${selectedPayment.installment_number})` : ''}`;
    
    return {
      nomorKwitansi: selectedPayment.reference_number || `PMT-${selectedPayment.id}`,
      tanggal: selectedPayment.payment_date,
      diterimaDari: 'Dari Orang Tua/Wali',
      jumlah: selectedPayment.amount,
      untukPembayaran: selectedBillForHistory.bill_type?.name || description,
      dibayarOleh: 'Dari Orang Tua/Wali',
      kategori: selectedBillForHistory.bill_type?.name || '',
      metodePembayaran: selectedPayment.payment_method === 'cash' ? 'cash' : selectedPayment.payment_method === 'transfer' ? 'transfer' : selectedPayment.payment_method === 'midtrans' ? 'transfer' : 'card',
      dibuatOleh: selectedPayment.processed_by?.name || 'System',
      disetujuiOleh: selectedPayment.processed_by?.name || '-'
    };
  };

  // Handle back navigation with animation
  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/parent/dashboard');
    }, 400);
  };

  return (
    <div className={`min-h-screen bg-gray-50 transition-all duration-500 ease-out ${
      isExiting 
        ? 'translate-x-full opacity-0' 
        : isAnimated 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
    }`}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 pt-12 pb-6 px-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleBack}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-white text-xl font-bold">Daftar Tagihan</h1>
                <p className="text-white/80 text-xs">Kelola pembayaran sekolah</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105">
                <Download className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={() => navigate('/parent/notifikasi')}
                className="relative w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105"
              >
                <Bell className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              </button>
            </div>
          </div>

          {/* Saldo Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-gray-600 text-xs font-medium mb-1">Total Tagihan</p>
                <div className="flex items-center space-x-2">
                  {showBalance ? (
                    <h2 className="text-xl font-bold text-gray-800">{formatCurrency(totalTagihan)}</h2>
                  ) : (
                    <h2 className="text-xl font-bold text-gray-800">Rp ••••••••</h2>
                  )}
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    {showBalance ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
                  </button>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {totalPending > 0 && (
              <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-800 font-bold text-sm">Total Sisa Tagihan</p>
                    <p className="text-orange-600 text-xs">Segera lakukan pembayaran</p>
                  </div>
                  <p className="text-orange-900 font-bold text-base">{formatCurrency(totalPending)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 mb-4">
        {/* Statistics */}
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-800">Statistik Tagihan</h3>
            <div className="w-6 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-1.5">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">{statistik.lunas}</p>
              <p className="text-xs text-gray-600 font-medium">Lunas</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-1.5">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">{statistik.pending}</p>
              <p className="text-xs text-gray-600 font-medium">Belum Bayar</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-1.5">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">{statistik.overdue}</p>
              <p className="text-xs text-gray-600 font-medium">Jatuh Tempo</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-1.5">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">{statistik.total}</p>
              <p className="text-xs text-gray-600 font-medium">Total</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari tagihan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 transition-all duration-300"
              />
            </div>
            <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors">
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['semua', 'unpaid', 'partial', 'paid', 'overdue'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all duration-300 ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xs font-semibold capitalize">
                  {filter === 'semua' ? 'Semua' : 
                   filter === 'unpaid' ? 'Belum Bayar' :
                   filter === 'partial' ? 'Cicilan' :
                   filter === 'paid' ? 'Lunas' :
                   filter === 'overdue' ? 'Jatuh Tempo' : filter}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tagihan List Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-bold text-gray-800">Daftar Tagihan</h3>
          <span className="text-xs text-gray-600 font-medium px-2.5 py-1 bg-gray-100 rounded-lg">{filteredTagihan.length} tagihan</span>
        </div>

        {/* Tagihan Cards */}
        <div className="space-y-3 pb-24">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTagihan.map((tagihan, index) => (
            <div 
              key={tagihan.id} 
              className={`group bg-white rounded-2xl border-l-4 ${getPriorityColor(tagihan.status)} shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideInRight 0.5s ease-out forwards'
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-base mb-1 leading-tight">{tagihan.bill_type?.name || 'Jenis Tagihan Tidak Diketahui'}</h4>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-1">{tagihan.notes || tagihan.bill_type?.description || '-'}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${getStatusColor(tagihan.status)}`}>
                          {getStatusIcon(tagihan.status)}
                          <span className="text-xs font-semibold capitalize">{getStatusLabel(tagihan.status)}</span>
                        </div>
                        {tagihan.period_month && tagihan.period_year && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                            {new Date(tagihan.period_year, tagihan.period_month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex flex-col">
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(tagihan.total_amount)}</p>
                    {tagihan.paid_amount > 0 && tagihan.status !== 'paid' && (
                      <p className="text-xs text-gray-600">Terbayar: {formatCurrency(tagihan.paid_amount)}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-600">Jatuh tempo: {formatDate(tagihan.due_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Tombol History - selalu tampil */}
                    <button 
                      onClick={() => handleHistoryClick(tagihan)}
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                      title="Riwayat Pembayaran"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    
                    {/* Tombol Bayar atau Status Lunas */}
                    {tagihan.status === 'unpaid' || tagihan.status === 'overdue' || tagihan.status === 'partial' ? (
                      <button 
                        onClick={() => handlePaymentClick(tagihan)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                      >
                        Bayar
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 rounded-xl border border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-bold">Lunas</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredTagihan.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-base">Tidak ada tagihan</h3>
              <p className="text-gray-600 text-xs">Belum ada tagihan sesuai filter yang dipilih</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button 
            onClick={handleBack}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors">
              <Home className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Home</span>
          </button>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-blue-600 font-medium">Tagihan</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg -mt-2">
              <ScanLine className="w-7 h-7 text-white" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/parent/notifikasi')}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Notifikasi</span>
          </button>
          <button 
            onClick={() => {
              tokenManager.removeToken();
              localStorage.removeItem('student_data');
              navigate('/parent/login');
            }}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <LogOut className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Payment Modal */}
      {selectedBillForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBillForPayment(null);
          }}
          bill={selectedBillForPayment}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Modal Riwayat Pembayaran */}
      {showPaymentHistoryModal && selectedBillForHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Riwayat Pembayaran</h3>
                  <p className="text-blue-100 text-sm">
                    {selectedBillForHistory.bill_type?.name || 'Jenis Tagihan Tidak Diketahui'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentHistoryModal(false);
                    setSelectedBillForHistory(null);
                    setPaymentHistory([]);
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {loadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Memuat riwayat pembayaran...</p>
                </div>
              ) : paymentHistory.length > 0 ? (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {formatCurrency(payment.amount)}
                              </h4>
                              {payment.is_installment && (
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                  Cicilan #{payment.installment_number}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <span className="font-medium">Metode:</span> {getPaymentMethodLabel(payment.payment_method)}
                            </p>
                            <p>
                              <span className="font-medium">Tanggal:</span> {formatDate(payment.payment_date)}
                            </p>
                            {payment.reference_number && (
                              <p>
                                <span className="font-medium">Referensi:</span> {payment.reference_number}
                              </p>
                            )}
                            {payment.notes && (
                              <p>
                                <span className="font-medium">Catatan:</span> {payment.notes}
                              </p>
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
                            {payment.processed_by?.name || 'System'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(payment.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Receipt className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">Belum ada riwayat pembayaran</h3>
                  <p className="text-gray-600 text-sm">Riwayat pembayaran akan muncul setelah melakukan pembayaran</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowPaymentHistoryModal(false);
                  setSelectedBillForHistory(null);
                  setPaymentHistory([]);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintPreview && selectedPayment && selectedBillForHistory && getKwitansiData() && (
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
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Tagihan;

