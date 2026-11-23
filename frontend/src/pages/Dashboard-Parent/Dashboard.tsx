import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Eye, 
  EyeOff,
  ChevronRight, 
  ArrowUpRight,
  Send,
  CreditCard,
  Smartphone,
  ScanLine,
  MessageCircle,
  Receipt,
  Banknote,
  ShoppingBag,
  Home,
  FileText,
  Activity,
  LogOut,
  Headphones
} from 'lucide-react';
import { studentAuthService } from '../../services/studentAuthService';
import type { StudentProfile } from '../../services/studentAuthService';
import { tokenManager } from '../../services/api';
import NotificationPrompt from '../../components/Dashboard-Parent/NotificationPrompt';
import { cmsParentService } from '../../services/cmsParentService';
import type { Banner } from '../../types/cmsParent';

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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [tagihanData, setTagihanData] = useState<TagihanItem[]>([]);
  const [totalPending, setTotalPending] = useState(0);
  const [loadingTagihan, setLoadingTagihan] = useState(true);
  const [bannerData, setBannerData] = useState<Banner[]>([]);
  
  // Get student data from localStorage
  useEffect(() => {
    const data = studentAuthService.getStoredStudentData();
    if (data) {
      setStudentData(data);
    } else {
      // Redirect to login if no data found
      navigate('/parent/login');
    }
  }, [navigate]);

  // Fetch tagihan dari backend
  useEffect(() => {
    fetchTagihan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch banners dari CMS
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await cmsParentService.getPublicBanners();
      if (response.success && response.data && response.data.length > 0) {
        setBannerData(response.data);
      } else {
        // Fallback ke default banners jika tidak ada data dari CMS
        setBannerData([{
          id: 0,
          title: "Selamat Datang",
          subtitle: "Portal Orang Tua Siswa",
          image_path: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=500&h=300&fit=crop",
          button_text: "Lihat Info",
          button_link: "",
          bg_color: "from-blue-600 to-purple-600",
          is_active: true,
          sort_order: 0,
          created_at: "",
          updated_at: ""
        }]);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      // Fallback ke default banners jika gagal fetch
      setBannerData([{
        id: 0,
        title: "Selamat Datang",
        subtitle: "Portal Orang Tua Siswa",
        image_path: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=500&h=300&fit=crop",
        button_text: "",
        button_link: "",
        bg_color: "from-blue-600 to-purple-600",
        is_active: true,
        sort_order: 0,
        created_at: "",
        updated_at: ""
      }]);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://nurverse.id/storage/${path}`;
  };

  const fetchTagihan = async () => {
    try {
      setLoadingTagihan(true);
      const token = tokenManager.getToken();
      
      if (!token) {
        console.error('Token tidak ditemukan');
        navigate('/parent/login');
        return;
      }
      
      console.log('🔄 Fetching tagihan for dashboard...');
      
      const response = await fetch('https://nurverse.id/api/student-auth/tagihan', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Dashboard tagihan response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dashboard tagihan data received:', data);
      
      if (data.success && data.data) {
        setTagihanData(data.data);
        
        // Hitung total tagihan yang belum lunas
        const pending = data.data
          .filter((item: TagihanItem) => 
            item.status === 'unpaid' || 
            item.status === 'partial' || 
            item.status === 'overdue'
          )
          .reduce((sum: number, item: TagihanItem) => 
            sum + Number(item.remaining_amount || 0), 0
          );
        
        setTotalPending(pending);
        console.log(`💰 Total tagihan pending: Rp ${pending.toLocaleString('id-ID')}`);
      }
    } catch (error) {
      console.error('❌ Error fetching tagihan:', error);
      if (error instanceof Error && error.message.includes('401')) {
        tokenManager.removeToken();
        localStorage.removeItem('student_data');
        navigate('/parent/login');
      }
    } finally {
      setLoadingTagihan(false);
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const userInfo = {
    name: studentData?.nama_lengkap || "User",
    balance: totalPending
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (bannerData.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerData.length]);

  const quickMenuItems = [
    { id: 1, title: "Absensi", icon: Send, route: "/parent/absensi" },
    { id: 2, title: "Keuangan", icon: CreditCard, route: "/parent/keuangan", disabled: true },
    { id: 3, title: "Biodata", icon: Smartphone, route: "/parent/biodata" },
    { id: 4, title: "Akademik", icon: ArrowUpRight, route: "/parent/kalender", disabled: true }
  ];

  const serviceItems = [
    { id: 1, title: "Komunikasi", icon: MessageCircle, route: "/parent/komunikasi", hasNotification: false, disabled: true },
    { id: 2, title: "Infaq", icon: Receipt, route: "/parent/tagihan", hasNotification: false, disabled: true },
    { id: 3, title: "Kalender", icon: Banknote, route: "/parent/kalender", hasNotification: false, disabled: true },
    { id: 4, title: "Pengumuman", icon: ShoppingBag, route: "/parent/news", hasNotification: true, disabled: true }
  ];

  // Handle navigation to Tagihan with animation
  const handleNavigateToTagihan = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/parent/tagihan');
    }, 300);
  };

  return (
    <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isLoggingOut || isNavigating ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}`}>
      {/* Notification Prompt untuk Mobile */}
      <NotificationPrompt />
      
      {/* Header dengan background gradien sunset */}
      <div className="bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 pt-12 pb-6 px-4 relative overflow-hidden">
        {/* Ilustrasi gedung */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 left-0 w-full h-32">
            <div className="absolute bottom-0 left-8 w-12 h-20 bg-purple-800 rounded-t-lg"></div>
            <div className="absolute bottom-0 left-24 w-16 h-24 bg-purple-900 rounded-t-lg"></div>
            <div className="absolute bottom-0 left-44 w-14 h-18 bg-purple-800 rounded-t-lg"></div>
            <div className="absolute bottom-0 right-8 w-20 h-28 bg-purple-900 rounded-t-lg"></div>
            <div className="absolute bottom-0 right-32 w-12 h-16 bg-purple-800 rounded-t-lg"></div>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            {/* Logo dan sapaan */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <img 
                  src="/logo-annur.png" 
                  alt="Logo Annur" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <p className="text-white text-lg font-medium">{getGreeting()},</p>
                <p className="text-white text-lg font-medium">{userInfo.name}</p>
              </div>
            </div>
            
            {/* Notifikasi dan Pusat Bantuan */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  setIsNavigating(true);
                  setTimeout(() => {
                    navigate('/parent/notifikasi');
                  }, 300);
                }}
                className="relative w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
              >
                <Bell className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
              </button>
              <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Headphones className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Saldo Card Floating */}
      <div className="px-4 -mt-4 mb-6">
        <div className="bg-blue-700 rounded-2xl p-5 shadow-lg relative overflow-hidden" style={{backgroundColor: '#0047BA'}}>
          <div className="relative z-10">
            <p className="text-white/80 text-sm mb-2">Total Tagihan Belum Lunas</p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {loadingTagihan ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-white text-lg">Memuat...</span>
                  </div>
                ) : (
                  <>
                    <span className="text-white text-2xl font-bold">
                      {showBalance ? formatCurrency(userInfo.balance) : '••••••••'}
                    </span>
                    <button 
                      onClick={() => setShowBalance(!showBalance)}
                      className="w-6 h-6 text-white/80 hover:text-white transition-colors"
                    >
                      {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </>
                )}
              </div>
            </div>
            {!loadingTagihan && (
              <div className="flex items-center justify-between">
                <div className="text-white/70 text-xs">
                  {tagihanData.filter(t => t.status === 'unpaid' || t.status === 'partial' || t.status === 'overdue').length} tagihan aktif
                </div>
                <button 
                  onClick={() => navigate('/parent/tagihan')}
                  className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
                >
                  <span className="text-sm">Cek Detail</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Menu Horizontal */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          {quickMenuItems.map((item) => (
            <button 
              key={item.id}
              disabled={item.disabled}
              className={`bg-white rounded-xl p-4 shadow-sm text-center transition-shadow ${
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-md'
              }`}
              onClick={() => !item.disabled && navigate(item.route)}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                item.disabled ? 'bg-gray-100' : 'bg-blue-100'
              }`}>
                <item.icon className={`w-6 h-6 ${item.disabled ? 'text-gray-400' : 'text-blue-600'}`} />
              </div>
              <p className={`text-xs font-bold ${item.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                {item.title}
              </p>
            </button>
          ))}
        </div>
      </div>



      {/* Service Grid */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          {serviceItems.map((item) => (
            <button 
              key={item.id}
              disabled={item.disabled}
              className={`bg-white rounded-xl p-4 shadow-sm text-center relative transition-shadow ${
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-md'
              }`}
              onClick={() => !item.disabled && navigate(item.route)}
            >
              {item.hasNotification && !item.disabled && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                item.disabled ? 'bg-gray-100' : 'bg-blue-100'
              }`}>
                <item.icon className={`w-6 h-6 ${item.disabled ? 'text-gray-400' : 'text-blue-600'}`} />
              </div>
              <p className={`text-xs font-bold leading-tight ${item.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                {item.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Banner Carousel */}
      <div className="px-4 mb-24">
        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {bannerData.map((banner) => (
                <div key={banner.id} className="w-full flex-shrink-0">
                  <div className="relative aspect-video bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${getImageUrl(banner.image_path)})` }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${banner.bg_color} opacity-80`}></div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                      <div>
                        <h3 className="text-white text-xl font-bold mb-2 leading-tight">
                          {banner.title}
                        </h3>
                        {banner.subtitle && (
                          <p className="text-white/90 text-sm leading-relaxed">
                            {banner.subtitle}
                          </p>
                        )}
                      </div>
                      {banner.button_text && (
                        <div className="flex justify-end">
                          <button 
                            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl border border-white/30 hover:bg-white/30 transition-colors"
                            onClick={() => banner.button_link && window.open(banner.button_link, '_blank')}
                          >
                            {banner.button_text}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Dots */}
          <div className="flex justify-center space-x-2 mt-4">
            {bannerData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-blue-600 font-medium">Home</span>
          </div>
          <button 
            onClick={handleNavigateToTagihan}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Tagihan</span>
          </button>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg -mt-2">
              <ScanLine className="w-7 h-7 text-white" />
            </div>
          </div>
          <button 
            onClick={() => {
              setIsNavigating(true);
              setTimeout(() => {
                navigate('/parent/notifikasi');
              }, 300);
            }}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Notifikasi</span>
          </button>
          <button 
            onClick={() => {
              setIsLoggingOut(true);
              // Smooth transition delay
              setTimeout(() => {
                // Clear local storage and token using tokenManager
                tokenManager.removeToken();
                localStorage.removeItem('student_data');
                // Redirect to login
                navigate('/parent/login');
              }, 300);
            }}
            disabled={isLoggingOut}
            className="flex flex-col items-center space-y-1 transition-opacity duration-300"
          >
            <div className={`w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center transition-transform duration-300 ${isLoggingOut ? 'scale-95 opacity-50' : ''}`}>
              <LogOut className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium">{isLoggingOut ? 'Keluar...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

