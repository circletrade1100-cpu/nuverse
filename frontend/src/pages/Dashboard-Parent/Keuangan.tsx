import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Receipt,
  Filter,
  Search,
  Home,
  FileText,
  QrCode,
  MessageCircle,
  User,
  FileIcon,
  Hash,
  Bell
} from 'lucide-react';

interface TagihanItem {
  id: number;
  nama: string;
  kode: string;
  jumlah: number;
  status: 'lunas' | 'pending' | 'overdue';
  deadline: string;
  tanggalBayar?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface OutstandingItem {
  id: number;
  nama: string;
  kode: string;
  jumlah: number;
  status: 'outstanding' | 'resolved';
  tanggal: string;
  category: string;
}

const Keuangan: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tagihan' | 'outstanding' | 'laporan'>('tagihan');
  const [selectedFilter, setSelectedFilter] = useState('semua');
  const [isAnimating, setIsAnimating] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger animation on component mount
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigation = (path: string) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 150);
  };

  const tagihanData: TagihanItem[] = [
    {
      id: 1,
      nama: 'SPP Februari 2024',
      kode: 'SPP-FEB-2024-001',
      jumlah: 500000,
      status: 'pending',
      deadline: '2024-02-10',
      category: 'akademik',
      priority: 'high'
    },
    {
      id: 2,
      nama: 'Uang Kegiatan OSIS',
      kode: 'UKG-OSIS-2024-002',
      jumlah: 150000,
      status: 'pending',
      deadline: '2024-02-15',
      category: 'kegiatan',
      priority: 'medium'
    },
    {
      id: 3,
      nama: 'SPP Januari 2024',
      kode: 'SPP-JAN-2024-003',
      jumlah: 500000,
      status: 'lunas',
      deadline: '2024-01-10',
      tanggalBayar: '2024-01-08',
      category: 'akademik',
      priority: 'high'
    },
    {
      id: 4,
      nama: 'Biaya Praktek Lab',
      kode: 'LAB-PRAK-2024-004',
      jumlah: 100000,
      status: 'overdue',
      deadline: '2024-01-25',
      category: 'akademik',
      priority: 'high'
    }
  ];

  const outstandingData: OutstandingItem[] = [
    {
      id: 1,
      nama: 'Kelebihan Bayar SPP',
      kode: 'OUT-SPP-2024-001',
      jumlah: 50000,
      status: 'outstanding',
      tanggal: '2024-01-15',
      category: 'akademik'
    },
    {
      id: 2,
      nama: 'Refund Biaya Kegiatan',
      kode: 'OUT-KEG-2024-002',
      jumlah: 25000,
      status: 'resolved',
      tanggal: '2024-01-20',
      category: 'kegiatan'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lunas': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'outstanding': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'lunas': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <XCircle className="w-4 h-4" />;
      case 'outstanding': return <AlertCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
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

  const groupByMonth = (data: any[]) => {
    const grouped = data.reduce((acc, item) => {
      const date = new Date(item.deadline || item.tanggal);
      const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          items: [],
          total: 0
        };
      }
      
      acc[monthYear].items.push(item);
      acc[monthYear].total += item.jumlah;
      
      return acc;
    }, {});
    
    return Object.entries(grouped).map(([month, data]: [string, any]) => ({
      month,
      ...data
    }));
  };

  const filteredTagihan = tagihanData.filter(item => {
    if (selectedFilter === 'semua') return true;
    return item.status === selectedFilter;
  });

  const filteredOutstanding = outstandingData.filter(item => {
    if (selectedFilter === 'semua') return true;
    return item.status === selectedFilter;
  });

  const groupedTagihan = groupByMonth(filteredTagihan);
  const groupedOutstanding = groupByMonth(filteredOutstanding);

  const renderTagihanContent = () => (
    <div className="space-y-6">
      {groupedTagihan.map((group, index) => (
        <div 
          key={index} 
          className={`bg-white rounded-3xl p-6 shadow-xl border border-gray-100 transition-all duration-200 ease-out ${
            isAnimating ? 'transform translate-x-20 opacity-0' : 'transform translate-x-0 opacity-100'
          }`}
          style={{ transitionDelay: `${200 + index * 50}ms` }}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">{group.month}</h3>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(group.total)}</span>
          </div>
          
          <div className="space-y-4">
            {group.items.map((tagihan: TagihanItem) => (
              <div key={tagihan.id} className="group bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{tagihan.nama}</h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 font-mono">{tagihan.kode}</span>
                      </div>
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border ${getStatusColor(tagihan.status)}`}>
                        {getStatusIcon(tagihan.status)}
                        <span className="text-xs font-medium capitalize">{tagihan.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800 mb-2">{formatCurrency(tagihan.jumlah)}</p>
                    <p className="text-xs text-gray-600">
                      Deadline: {formatDate(tagihan.deadline)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderOutstandingContent = () => (
    <div className="space-y-6">
      {groupedOutstanding.map((group, index) => (
        <div 
          key={index} 
          className={`bg-white rounded-3xl p-6 shadow-xl border border-gray-100 transition-all duration-200 ease-out ${
            isAnimating ? 'transform translate-x-20 opacity-0' : 'transform translate-x-0 opacity-100'
          }`}
          style={{ transitionDelay: `${200 + index * 50}ms` }}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">{group.month}</h3>
            <span className="text-lg font-bold text-green-600">{formatCurrency(group.total)}</span>
          </div>
          
          <div className="space-y-4">
            {group.items.map((outstanding: OutstandingItem) => (
              <div key={outstanding.id} className="group bg-gradient-to-r from-green-50 to-white rounded-2xl p-4 border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{outstanding.nama}</h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 font-mono">{outstanding.kode}</span>
                      </div>
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border ${getStatusColor(outstanding.status)}`}>
                        {getStatusIcon(outstanding.status)}
                        <span className="text-xs font-medium capitalize">{outstanding.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800 mb-2">{formatCurrency(outstanding.jumlah)}</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(outstanding.tanggal)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderLaporanContent = () => (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="font-bold text-gray-800 mb-2">Laporan Keuangan</h3>
        <p className="text-gray-600 text-sm">Fitur laporan akan segera tersedia</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 transition-all duration-300 ease-out ${
      isAnimating ? 'transform translate-x-full opacity-0' : 
      isExiting ? 'transform -translate-x-full opacity-0' : 
      'transform translate-x-0 opacity-100'
    }`}>
      {/* Header */}
      <div className={`bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 pt-16 pb-8 px-6 relative overflow-hidden transition-all duration-200 delay-50 ease-out ${
        isAnimating ? 'transform translate-x-8 opacity-0' : 
        isExiting ? 'transform -translate-x-8 opacity-0' : 
        'transform translate-x-0 opacity-100'
      }`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleNavigation('/parent/dashboard')}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-white text-2xl font-bold">Catatan Keuangan</h1>
                <p className="text-white/80 text-sm font-medium">Kelola keuangan sekolah</p>
              </div>
            </div>
            <button 
              onClick={() => handleNavigation('/parent/notifikasi')}
              className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
            >
              <Bell className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className={`bg-white/20 backdrop-blur-sm rounded-3xl p-2 mb-6 transition-all duration-200 delay-75 ease-out ${
            isAnimating ? 'transform translate-x-6 opacity-0' : 'transform translate-x-0 opacity-100'
          }`}>
            <div className="flex items-center">
              <button
                onClick={() => setActiveTab('tagihan')}
                className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === 'tagihan'
                    ? 'bg-white text-blue-700 shadow-lg'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Tagihan
              </button>
              <button
                onClick={() => setActiveTab('outstanding')}
                className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === 'outstanding'
                    ? 'bg-white text-blue-700 shadow-lg'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Outstanding
              </button>
              <button
                onClick={() => setActiveTab('laporan')}
                className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === 'laporan'
                    ? 'bg-white text-blue-700 shadow-lg'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Laporan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6">
        {/* Filters */}
        {(activeTab === 'tagihan' || activeTab === 'outstanding') && (
          <div className={`bg-white rounded-3xl p-6 shadow-xl border border-gray-100 mb-6 transition-all duration-200 delay-100 ease-out ${
            isAnimating ? 'transform translate-x-12 opacity-0' : 
            isExiting ? 'transform -translate-x-12 opacity-0' : 
            'transform translate-x-0 opacity-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Filter & Pencarian</h3>
            </div>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Cari ${activeTab}...`}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
                />
              </div>
              <button className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-200">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center space-x-3 overflow-x-auto">
              {activeTab === 'tagihan' 
                ? ['semua', 'pending', 'lunas', 'overdue'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 ${
                        selectedFilter === filter
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-sm font-medium capitalize">{filter}</span>
                    </button>
                  ))
                : ['semua', 'outstanding', 'resolved'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 ${
                        selectedFilter === filter
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-sm font-medium capitalize">{filter}</span>
                    </button>
                  ))
              }
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`mb-20 transition-all duration-200 delay-150 ease-out ${
          isAnimating ? 'transform translate-x-16 opacity-0' : 
          isExiting ? 'transform -translate-x-16 opacity-0' : 
          'transform translate-x-0 opacity-100'
        }`}>
          {activeTab === 'tagihan' && renderTagihanContent()}
          {activeTab === 'outstanding' && renderOutstandingContent()}
          {activeTab === 'laporan' && renderLaporanContent()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/60 px-6 py-4 shadow-2xl transition-all duration-200 delay-200 ease-out ${
        isAnimating ? 'transform translate-y-full opacity-0' : 
        isExiting ? 'transform translate-y-full opacity-0' : 
        'transform translate-y-0 opacity-100'
      }`}>
        <div className="flex justify-around items-center max-w-sm mx-auto">
          <button 
            onClick={() => handleNavigation('/parent/dashboard')}
            className="flex flex-col items-center space-y-2"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-colors">
              <Home className="w-6 h-6 text-gray-400 hover:text-blue-600" />
            </div>
            <span className="text-xs text-gray-400 font-medium hover:text-blue-600">Home</span>
          </button>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-blue-600 font-bold">Keuangan</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <QrCode className="w-7 h-7 text-white" />
            </div>
          </div>
          <button 
            onClick={() => handleNavigation('/parent/notifikasi')}
            className="flex flex-col items-center space-y-2"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Notifikasi</span>
          </button>
          <button 
            onClick={() => handleNavigation('/parent/login')}
            className="flex flex-col items-center space-y-2"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Keuangan;