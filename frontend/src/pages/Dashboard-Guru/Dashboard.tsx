import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuruAuth } from '../../hooks/useGuruAuth';
import GlobalPageWrapper from '../../components/GlobalPageWrapper';
import ProtectedRoute from '../../components/ProtectedRoute';
import { guruPayrollService, type PayrollData } from '../../services/guruPayrollService';
import { HeaderSkeleton, DashboardCardSkeleton, StatsSkeleton } from '../../components/SkeletonLoader';
import { User, Eye, EyeOff, Clock, FileText, MessageCircle, Megaphone, Calendar, Timer, ShoppingBag, Home, QrCode } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { guru } = useGuruAuth();
  const navigate = useNavigate();
  const [showSalary, setShowSalary] = useState(false);
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [loadingPayroll, setLoadingPayroll] = useState(true);

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  };
  
  // Navigation handlers
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handlePayrollDetail = () => {
    navigate('/guru/payroll');
  };

  const handleWorkshopRegister = () => {
    // Bisa diarahkan ke halaman workshop atau external link
    window.open('https://workshop.example.com', '_blank');
  };

  // Fetch payroll data for dashboard
  useEffect(() => {
    const fetchPayrollData = async () => {
      if (!guru?.id) {
        setLoadingPayroll(false);
        return;
      }

      try {
        setLoadingPayroll(true);
        const payroll = await guruPayrollService.getGuruPayroll();
        setPayrollData(payroll);
      } catch (error) {
        console.error('Error fetching payroll data for dashboard:', error);
      } finally {
        setLoadingPayroll(false);
      }
    };

    fetchPayrollData();
  }, [guru?.id]);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };


  // Loading state untuk skeleton
  if (!guru) {
    return (
      <ProtectedRoute>
        <GlobalPageWrapper>
          <div className="min-h-screen bg-gray-50">
            <HeaderSkeleton />
            <div className="p-6 space-y-6">
              <StatsSkeleton />
              <div className="grid grid-cols-1 gap-6">
                <DashboardCardSkeleton />
                <DashboardCardSkeleton />
              </div>
            </div>
          </div>
        </GlobalPageWrapper>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <GlobalPageWrapper>
        <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-400 to-green-600"></div>
          </div>
          
          <div className="relative px-4 py-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">YPI</span>
                </div>
                <div>
                  <p className="text-green-100 text-sm">{getGreeting()},</p>
                  <h1 className="text-white text-xl font-semibold">{guru?.nama_lengkap}</h1>
                  <p className="text-green-100 text-sm">{guru?.jabatan?.nama || 'Guru'} - {guru?.unit_sekolah?.nama || 'MI An-Nur'}</p>
                </div>
              </div>
              
            </div>
          </div>
        </header>

        {/* Payroll Card */}
        <div className="px-4 -mt-4 relative z-10">
          <div className="bg-green-800 rounded-xl p-4 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-100 text-sm">Total Gaji Bulan Ini</p>
                <div className="flex items-center space-x-2 mt-1">
                  {loadingPayroll ? (
                    <div className="h-8 w-32 bg-green-700 animate-pulse rounded"></div>
                  ) : (
                    <>
                      <span className="text-white text-2xl font-bold">
                        {payrollData ? (
                          showSalary ? formatCurrency(payrollData.gaji_bersih) : '••••••••'
                        ) : (
                          'Belum ada data'
                        )}
                      </span>
                      {payrollData && (
                        <button 
                          onClick={() => setShowSalary(!showSalary)}
                          className="text-green-200 hover:text-white"
                        >
                          {showSalary ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={handlePayrollDetail}
                className="text-green-100 text-sm hover:text-white"
              >
                Lihat Detail Payroll →
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-4 py-6">
          {/* Functional Icons Grid */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-4 gap-4">
              {/* Row 1 */}
              <button 
                onClick={() => handleNavigation('/guru/absensi')}
                className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-gray-700 text-center">Absensi</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('/guru/payroll')}
                className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-gray-700 text-center">Payroll</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('/guru/komunikasi')}
                className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-gray-700 text-center">Komunikasi</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('/guru/pengumuman')}
                className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 transition-colors relative"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-gray-700 text-center">Pengumuman</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              {/* Row 2 */}
              <button 
                onClick={() => handleNavigation('/guru/cuti')}
                className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-gray-700 text-center">Cuti</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('/guru/lembur')}
                className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Timer className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-gray-700 text-center">Lembur</span>
              </button>
              
              <div className="flex flex-col items-center space-y-2 p-3 rounded-lg opacity-50 cursor-not-allowed">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-xs text-gray-400 text-center">Kalender</span>
                <span className="text-xs text-gray-300 text-center">(Coming Soon)</span>
              </div>
              
              <div className="flex flex-col items-center space-y-2 p-3 rounded-lg opacity-50 cursor-not-allowed">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-xs text-gray-400 text-center">Rapor Digital</span>
                <span className="text-xs text-gray-300 text-center">(Coming Soon)</span>
              </div>
            </div>
          </div>

          {/* Promotional Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative z-10">
              <h3 className="text-white text-xl font-bold mb-2">Workshop Guru Terbaru</h3>
              <p className="text-purple-100 text-sm mb-4">Pelatihan metode pembelajaran digital modern</p>
              <button 
                onClick={handleWorkshopRegister}
                className="bg-purple-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors"
              >
                Daftar Sekarang
              </button>
            </div>
            {/* Background Image Effect */}
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-30">
              <div className="w-full h-full bg-gradient-to-tl from-white to-transparent rounded-full"></div>
            </div>
          </div>

          {/* Pagination Indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around items-center">
            <button 
              onClick={() => handleNavigation('/guru/dashboard')}
              className="flex flex-col items-center space-y-1 py-2"
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-green-500 font-medium">Home</span>
            </button>
            
            <button 
              onClick={() => handleNavigation('/guru/absensi')}
              className="flex flex-col items-center space-y-1 py-2"
            >
              <Clock className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">Absensi</span>
            </button>
            
            <button 
              onClick={() => handleNavigation('/guru/qr-scan')}
              className="flex flex-col items-center space-y-1 py-2"
            >
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
            </button>
            
            <button 
              onClick={() => handleNavigation('/guru/payroll')}
              className="flex flex-col items-center space-y-1 py-2"
            >
              <FileText className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">Payroll</span>
            </button>
            
            <button 
              onClick={() => handleNavigation('/guru/profil')}
              className="flex flex-col items-center space-y-1 py-2"
            >
              <User className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">Profil</span>
            </button>
          </div>
        </div>

        {/* Add bottom padding to prevent content from being hidden behind navigation */}
        <div className="h-20">        </div>
      </div>
      </GlobalPageWrapper>
    </ProtectedRoute>
  );
};

export default Dashboard;