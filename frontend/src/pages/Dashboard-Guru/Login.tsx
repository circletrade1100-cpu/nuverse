import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock, School, X, Headphones, CreditCard, Wallet, ArrowRightLeft, QrCode } from 'lucide-react';
import { guruAuthService, type GuruLoginCredentials } from '../../services/guruAuthService';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    
    try {
      const credentials: GuruLoginCredentials = {
        username: username.trim(),
        password: password,
      };

      const response = await guruAuthService.login(credentials);

      if (response.success) {
        // Login successful
        setShowLoginModal(false);
        // Navigate to dashboard
        window.location.href = '/guru/dashboard';
      } else {
        // Login failed
        setLoginError(response.message || 'Login gagal. Periksa kembali username dan password Anda.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Terjadi kesalahan saat melakukan login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotPasswordLoading(true);
    setForgotPasswordMessage('');
    
    try {
      const response = await guruAuthService.forgotPassword({ email: forgotPasswordEmail });
      
      if (response.success) {
        setForgotPasswordMessage('Link reset password telah dikirim ke email Anda.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordEmail('');
        }, 3000);
      } else {
        setForgotPasswordMessage(response.message || 'Gagal mengirim link reset password.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setForgotPasswordMessage('Terjadi kesalahan saat mengirim link reset password.');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
    setLoginError('');
    setUsername('');
    setPassword('');
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordMessage('');
    // Small delay to ensure modal is rendered before animation
    setTimeout(() => setIsModalAnimating(true), 50);
  };

  const closeLoginModal = () => {
    setIsModalAnimating(false);
    setTimeout(() => setShowLoginModal(false), 300);
  };

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

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (guruAuthService.isAuthenticated()) {
        try {
          const guru = await guruAuthService.getProfile();
          if (guru) {
            // Guru is authenticated, redirect to dashboard
            window.location.href = '/guru/dashboard';
          }
        } catch (error) {
          // Token might be invalid, clear it
          await guruAuthService.logout();
        }
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-indigo-600 relative overflow-hidden">
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
            <h1 className="text-white text-2xl font-bold">PORTAL GURU</h1>
            <p className="text-white/80 text-xs">YPI An-Nur Cikarang</p>
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
              Selamat Datang<br />
              Para Pendidik Terbaik
            </h2>
          </div>

          {/* Guru Logo Section */}
          <div className="relative mx-auto w-96 h-80">
            {/* Main Oval Background */}
            <div className="w-full h-full bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30 flex items-center justify-center relative overflow-hidden">
              
              {/* Background Decorations */}
              <div className="absolute inset-0">
                {/* Books */}
                <div className="absolute bottom-4 left-4 w-8 h-12 bg-blue-500 rounded-sm"></div>
                <div className="absolute bottom-4 right-4 w-8 h-12 bg-green-500 rounded-sm"></div>
                <div className="absolute bottom-4 left-12 w-6 h-10 bg-red-500 rounded-sm"></div>
                <div className="absolute bottom-4 right-12 w-6 h-10 bg-yellow-500 rounded-sm"></div>
                
                {/* School Building */}
                <div className="absolute bottom-0 left-20 right-20 h-8 bg-gray-300 rounded-t-lg"></div>
                <div className="absolute bottom-0 left-24 w-4 h-12 bg-gray-400 rounded-t-sm"></div>
                <div className="absolute bottom-0 right-24 w-3 h-10 bg-gray-400 rounded-t-sm"></div>
                
                {/* Education Icons */}
                <div className="absolute top-4 left-8 text-blue-400 text-lg">📚</div>
                <div className="absolute top-6 right-8 text-yellow-400 text-sm">🎓</div>
                <div className="absolute top-8 left-1/4 text-orange-400 text-xs">✏️</div>
                <div className="absolute top-4 right-1/4 text-pink-400 text-lg">🍎</div>
                
                {/* Clouds */}
                <div className="absolute top-6 left-16 w-8 h-4 bg-gray-200 rounded-full opacity-60"></div>
                <div className="absolute top-8 right-16 w-6 h-3 bg-gray-200 rounded-full opacity-60"></div>
                
                {/* Green Ground */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-green-400 rounded-b-3xl"></div>
              </div>

              {/* School Logo */}
              <div className="relative z-10 w-48 h-48 flex items-center justify-center">
                <img 
                  src="/logo-annur.png" 
                  alt="Logo Annur" 
                  className="w-full h-full object-contain rounded-lg shadow-lg"
                />
              </div>
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
              className="flex-1 bg-white hover:bg-gray-50 text-indigo-600 font-bold py-4 rounded-xl transition-all duration-200 transform active:scale-[0.98] shadow-xl text-lg border border-gray-200"
            >
              Login
            </button>
            
            {/* Face ID Button */}
            <button className="w-14 h-14 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center shadow-xl transition-all duration-200 border border-gray-200">
              <div className="w-8 h-8 border-2 border-indigo-600 rounded-lg border-dashed flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
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
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <School className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Portal Guru</h3>
                  <p className="text-sm text-gray-500">Sistem Informasi Guru</p>
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
                <>
                  {!showForgotPassword ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error Message */}
                  {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                      {loginError}
                    </div>
                  )}

                  {/* Username Field */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Masukkan Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-12 pr-20 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors duration-200"
                      >
                        Ganti Akun
                      </button>
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
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
                    disabled={!username || !password || isLoading}
                    className={`w-full font-semibold py-4 rounded-2xl transition-all duration-200 transform active:scale-[0.98] shadow-lg mt-6 ${
                      username && password && !isLoading
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      username && password ? 'Masuk ke Dashboard' : 'Login'
                    )}
                  </button>

                  {/* Forgot Password */}
                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors duration-200"
                    >
                      Lupa Username/Password?
                    </button>
                  </div>
                </form>
                  ) : (
                    // Forgot Password Form
                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Lupa Password?</h3>
                        <p className="text-gray-600">Masukkan email Anda untuk mendapatkan link reset password.</p>
                      </div>

                      {forgotPasswordMessage && (
                        <div className={`px-4 py-3 rounded-xl text-sm ${
                          forgotPasswordMessage.includes('berhasil') || forgotPasswordMessage.includes('dikirim')
                            ? 'bg-green-50 border border-green-200 text-green-600'
                            : 'bg-red-50 border border-red-200 text-red-600'
                        }`}>
                          {forgotPasswordMessage}
                        </div>
                      )}

                      <div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            placeholder="Masukkan email Anda"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            disabled={isForgotPasswordLoading}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(false)}
                          disabled={isForgotPasswordLoading}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Kembali
                        </button>
                        <button
                          type="submit"
                          disabled={!forgotPasswordEmail || isForgotPasswordLoading}
                          className={`flex-1 font-medium py-3 rounded-xl transition-all duration-200 ${
                            forgotPasswordEmail && !isForgotPasswordLoading
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isForgotPasswordLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Mengirim...</span>
                            </div>
                          ) : (
                            'Kirim Link'
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </>
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
