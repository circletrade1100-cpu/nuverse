import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import oneSignalService from '../../services/oneSignalService';

const NotificationPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      // Tunggu OneSignal ready
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const subscribed = await oneSignalService.isPushSubscribed();
      const hasPermission = await oneSignalService.isNotificationPermissionGranted();
      
      // Tampilkan prompt jika belum subscribe
      if (!subscribed || !hasPermission) {
        setShowPrompt(true);
      } else {
        setIsSubscribed(true);
      }
    } catch (error) {
      console.log('Error checking subscription:', error);
      // Tampilkan prompt anyway untuk safety
      setShowPrompt(true);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const granted = await oneSignalService.requestPermission();
      
      if (granted) {
        setIsSubscribed(true);
        setShowPrompt(false);
        
        // Toast success
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        toast.innerHTML = '✅ Notifikasi berhasil diaktifkan! Anda akan menerima reminder tagihan.';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.remove();
        }, 3000);
      } else {
        // User block
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        toast.innerHTML = '❌ Notifikasi diblokir. Silakan allow dari pengaturan browser.';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.remove();
        }, 3000);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Simpan ke localStorage agar tidak muncul lagi hari ini
    localStorage.setItem('notification_prompt_dismissed', new Date().toDateString());
  };

  // Jika sudah subscribe atau prompt di-dismiss, jangan tampilkan
  if (!showPrompt || isSubscribed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-2xl p-4 relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-3 rounded-lg flex-shrink-0">
            <Bell size={24} className="text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              Aktifkan Notifikasi 🔔
            </h3>
            <p className="text-sm text-white/90 mb-3">
              Dapatkan notifikasi untuk:
            </p>
            <ul className="text-sm text-white/90 space-y-1 mb-4">
              <li>✅ Tagihan baru</li>
              <li>✅ Reminder jatuh tempo</li>
              <li>✅ Pengumuman penting</li>
            </ul>
            
            <button
              onClick={handleEnableNotifications}
              className="w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              🔔 Aktifkan Notifikasi Sekarang
            </button>
            
            <p className="text-xs text-white/70 mt-2 text-center">
              Tap tombol di atas untuk mengaktifkan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;

