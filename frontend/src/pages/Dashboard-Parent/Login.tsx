import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock, School, X, Headphones, CreditCard, Wallet, ArrowRightLeft, QrCode } from 'lucide-react';
import { studentAuthService } from '../../services/studentAuthService';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await studentAuthService.login({
        nisn,
        password,
      });

      if (response.success && response.data) {
        console.log('✅ Login berhasil:', response.data.student);
        
        // Start transition animation
        setIsTransitioning(true);
        
        // Close modal with animation
        setIsModalAnimating(false);
        setTimeout(() => {
          setShowLoginModal(false);
        }, 300);
        
        // Navigate to parent dashboard with smooth fade
        setTimeout(() => {
          navigate('/parent/dashboard');
        }, 800);
      } else {
        setErrorMessage(response.message || 'Login gagal. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
    setErrorMessage('');
    // Small delay to ensure modal is rendered before animation
    setTimeout(() => setIsModalAnimating(true), 50);
  };

  const closeLoginModal = () => {
    setIsModalAnimating(false);
    setErrorMessage('');
    setTimeout(() => setShowLoginModal(false), 300);
  };

  // Check if already logged in
  useEffect(() => {
    if (studentAuthService.isLoggedIn()) {
      navigate('/parent/dashboard');
    }
  }, [navigate]);

  // Handle modal backdrop click
  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeLoginModal();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showLoginModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLoginModal]);

  return (
    <div className={`min-h-screen bg-blue-600 relative overflow-hidden transition-opacity duration-700 ${
      isTransitioning ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-10 w-32 h-32 border border-white/30 rounded-full"></div>
        <div className="absolute bottom-40 left-8 w-24 h-24 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 right-4 w-16 h-16 border border-white/25 rounded-full"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col max-w-md mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center p-4 pt-12">
          {/* Language Selector */}
          <button className="bg-white/20 backdrop-blur-lg rounded-full px-4 py-2 flex items-center gap-2 border border-white/30">
            <div className="w-6 h-4 bg-red-500 relative rounded-sm overflow-hidden">
              <div className="w-full h-1/2 bg-red-500"></div>
              <div className="w-full h-1/2 bg-white"></div>
            </div>
            <span className="text-white font-medium text-sm">ID</span>
          </button>

          {/* Logo */}
          <div className="text-center">
            <h1 className="text-white text-2xl font-bold">YPI ANNUR</h1>
            <p className="text-white/80 text-xs">Cikarang Baru</p>
          </div>

          {/* Contact Us */}
          <button className="bg-white/20 backdrop-blur-lg rounded-full p-3 border border-white/30">
            <Headphones className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Banner Section */}
        <div className="px-6 mt-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-white text-xl font-bold mb-2 leading-tight">
              Memperingati HUT RI Ke-80<br />
              Republik Indonesia
            </h2>
          </div>

          {/* Kemendagri Logo Section */}
          <div className="relative mx-auto w-80 h-64">
            {/* Main Oval Background */}
            <div className="w-full h-full bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/30 flex items-center justify-center relative overflow-hidden">
              
              {/* Background Decorations */}
              <div className="absolute inset-0">
                {/* Trees */}
                <div className="absolute bottom-0 left-4 w-8 h-12 bg-green-500 rounded-t-full"></div>
                <div className="absolute bottom-0 right-4 w-8 h-12 bg-green-500 rounded-t-full"></div>
                <div className="absolute bottom-0 left-12 w-6 h-10 bg-green-600 rounded-t-full"></div>
                <div className="absolute bottom-0 right-12 w-6 h-10 bg-green-600 rounded-t-full"></div>
                
                {/* City Silhouette */}
                <div className="absolute bottom-0 left-20 right-20 h-8 bg-gray-300 rounded-t-lg"></div>
                <div className="absolute bottom-0 left-24 w-4 h-12 bg-gray-400 rounded-t-sm"></div>
                <div className="absolute bottom-0 right-24 w-3 h-10 bg-gray-400 rounded-t-sm"></div>
                
                {/* Fireworks */}
                <div className="absolute top-4 left-8 text-blue-400 text-lg">✨</div>
                <div className="absolute top-6 right-8 text-yellow-400 text-sm">🎆</div>
                <div className="absolute top-8 left-1/4 text-orange-400 text-xs">💥</div>
                <div className="absolute top-4 right-1/4 text-pink-400 text-lg">🎇</div>
                
                {/* Clouds */}
                <div className="absolute top-6 left-16 w-8 h-4 bg-gray-200 rounded-full opacity-60"></div>
                <div className="absolute top-8 right-16 w-6 h-3 bg-gray-200 rounded-full opacity-60"></div>
                
                {/* Green Ground */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-green-400 rounded-b-3xl"></div>
              </div>

              {/* Kemendagri Shield */}
              <div className="relative z-10 w-24 h-32 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 rounded-lg border-4 border-yellow-500 flex flex-col items-center justify-center shadow-lg">
                {/* Star */}
                <div className="text-yellow-400 text-xl mb-1">⭐</div>
                
                {/* Garuda */}
                <div className="w-16 h-16 bg-red-500 rounded-full relative mb-2 border-2 border-white flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">YPI</span>
                    </div>
                  </div>
                </div>
                
                {/* Rice and Cotton */}
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-yellow-300 text-xs">🌾</div>
                  <div className="text-white text-xs">🌿</div>
                </div>
                
                {/* Banner */}
                <div className="bg-yellow-500 px-2 py-1 rounded text-xs">
                  <div className="text-blue-900 font-bold text-[6px] leading-tight text-center">
                    ANNUR
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fast Menu Section */}
        <div className="px-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-white font-semibold text-xl">Fast Menu</span>
            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">i</span>
            </div>
          </div>

          {/* Menu Icons - Horizontal Scroll */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex flex-col items-center min-w-[80px]">
              <div className="w-16 h-16 bg-slate-100 rounded-lg p-3 mb-2 shadow-sm flex items-center justify-center">
                <QrCode className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-white text-sm font-medium text-center">ABSENSI</span>
            </div>
            
            <div className="flex flex-col items-center min-w-[80px]">
              <div className="w-16 h-16 bg-slate-100 rounded-lg p-3 mb-2 shadow-sm flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-white text-sm font-medium text-center">TAGIHAN</span>
            </div>
            
            <div className="flex flex-col items-center min-w-[80px]">
              <div className="w-16 h-16 bg-slate-100 rounded-lg p-3 mb-2 shadow-sm flex items-center justify-center">
                <Wallet className="w-8 h-8 text-green-500" />
              </div>
              <span className="text-white text-sm font-medium text-center">INVOICE</span>
            </div>
            
            <div className="flex flex-col items-center min-w-[80px]">
              <div className="w-16 h-16 bg-slate-100 rounded-lg p-3 mb-2 shadow-sm flex items-center justify-center">
                <div className="w-8 h-6 bg-teal-500 rounded text-white text-xs flex items-center justify-center font-bold">B</div>
              </div>
              <span className="text-white text-sm font-medium text-center">INFAQ</span>
            </div>
            
            <div className="flex flex-col items-center min-w-[80px]">
              <div className="w-16 h-16 bg-slate-100 rounded-lg p-3 mb-2 shadow-sm flex items-center justify-center">
                <ArrowRightLeft className="w-8 h-8 text-blue-500" />
              </div>
              <span className="text-white text-sm font-medium text-center">TRANSAKSI</span>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center mt-4">
            <div className="flex gap-2">
              <div className="w-6 h-1 bg-blue-300 rounded-full"></div>
              <div className="w-2 h-1 bg-white/40 rounded-full"></div>
              <div className="w-2 h-1 bg-white/40 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Bottom Login Section */}
        <div className="p-6 pb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={openLoginModal}
              className="flex-1 bg-white hover:bg-gray-50 text-blue-600 font-bold py-4 rounded-xl transition-all duration-200 transform active:scale-[0.98] shadow-xl text-lg border border-gray-200"
            >
              Login
            </button>
            
            {/* Face ID Button */}
            <button className="w-14 h-14 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center shadow-xl transition-all duration-200 border border-gray-200">
              <div className="w-8 h-8 border-2 border-blue-600 rounded-lg border-dashed flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 120" className="w-full h-20 text-white/5">
          <path
            d="M0,60 C240,100 480,100 720,60 C960,20 1200,20 1440,60 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center animate-fadeIn">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <div className="text-white text-xl font-semibold mb-2 animate-pulse">
              Login Berhasil!
            </div>
            <div className="text-white/80 text-sm">
              Mengarahkan ke Dashboard...
            </div>
          </div>
        </div>
      )}

      {/* Login Modal - Swipe Up */}
      {showLoginModal && (
        <div 
          className={`fixed inset-0 z-50 flex items-end justify-center transition-all duration-300 ease-out ${
            isModalAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
          }`}
          onClick={handleModalBackdropClick}
        >
          <div 
            className={`w-full max-w-md bg-white rounded-t-3xl shadow-2xl transform transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
              isModalAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-90'
            }`}
            style={{ maxHeight: '85vh' }}
          >
            {/* Modal Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <School className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Portal Orang Tua</h3>
                  <p className="text-sm text-gray-500">Annur Management System</p>
                </div>
              </div>
              <button
                onClick={closeLoginModal}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Tab Navigation */}
              <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-3 px-4 font-semibold text-sm rounded-lg transition-all duration-200 ${
                    activeTab === 'login'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-3 px-4 font-semibold text-sm rounded-lg transition-all duration-200 ${
                    activeTab === 'register'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Batalkan
                </button>
              </div>

              {activeTab === 'login' ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                      {errorMessage}
                    </div>
                  )}

                  {/* NISN Field */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Masukkan NISN"
                        value={nisn}
                        onChange={(e) => setNisn(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={!nisn || !password || isLoading}
                    className={`w-full font-semibold py-4 rounded-2xl transition-all duration-200 transform active:scale-[0.98] shadow-lg mt-6 ${
                      nisn && password && !isLoading
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Memproses...</span>
                      </div>
                    ) : isTransitioning ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Menuju Dashboard...</span>
                      </div>
                    ) : (
                      nisn && password ? 'Masuk ke Dashboard' : 'Login'
                    )}
                  </button>

                  {/* Forgot Password */}
                  <div className="text-center pt-4">
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
                    >
                      Lupa Username/Password?
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Batalkan Login</h3>
                  <p className="text-gray-600 mb-6">Apakah Anda yakin ingin membatalkan proses login?</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveTab('login')}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors duration-200"
                    >
                      Kembali
                    </button>
                    <button 
                      onClick={closeLoginModal}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl transition-colors duration-200"
                    >
                      Ya, Batalkan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
