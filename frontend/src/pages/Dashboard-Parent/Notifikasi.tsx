import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell,
  X
} from 'lucide-react';
import { tokenManager } from '../../services/api';

interface NotificationItem {
  id: number;
  student_id: number;
  type: string;
  title: string;
  description: string;
  full_content?: string;
  data?: any;
  category: 'tagihan' | 'pengumuman' | 'komunikasi';
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationCounts {
  total: number;
  unread: number;
  tagihan: number;
  pengumuman: number;
  komunikasi: number;
}

const Notifikasi: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('semua');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    unread: 0,
    tagihan: 0,
    pengumuman: 0,
    komunikasi: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch notifications dari API
  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = tokenManager.getToken();
      
      const params = new URLSearchParams();
      if (activeTab !== 'semua') {
        params.append('category', activeTab);
      }
      
      const response = await fetch(`https://nurverse.id/api/student-auth/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data || []);
        setCounts(data.counts || {
          total: 0,
          unread: 0,
          tagihan: 0,
          pengumuman: 0,
          komunikasi: 0
        });
      } else {
        console.error('Failed to fetch notifications:', data.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'semua', label: 'Semua Notifikasi', count: counts.unread },
    { id: 'tagihan', label: 'Tagihan', count: counts.tagihan },
    { id: 'pengumuman', label: 'Pengumuman', count: counts.pengumuman },
    { id: 'komunikasi', label: 'Komunikasi', count: counts.komunikasi }
  ];

  const filteredNotifications = notifications;

  const handleNotificationClick = async (notification: NotificationItem) => {
    setSelectedNotification(notification);
    
    // Mark as read if unread
    if (!notification.is_read) {
      try {
        const token = tokenManager.getToken();
        await fetch(`https://nurverse.id/api/student-auth/notifications/${notification.id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        );
        
        // Refresh counts
        fetchNotifications();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const closeNotificationDetail = () => {
    setSelectedNotification(null);
  };

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/parent/dashboard');
    }, 300);
  };

  React.useEffect(() => {
    setTimeout(() => setIsAnimating(false), 50);
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 relative overflow-hidden transition-all duration-300 ${
      isExiting ? 'translate-x-full opacity-0' : isAnimating ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
    }`}>
      {/* Main Content with slide animation */}
      <div className={`transition-transform duration-500 ease-out ${selectedNotification ? '-translate-x-full' : 'translate-x-0'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 pt-12 pb-6 px-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBack}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-white text-2xl font-bold">Notifikasi</h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white px-6 py-4 shadow-sm">
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-red-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="px-6 py-4 pb-20">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1 text-base">Tidak ada notifikasi</h3>
                  <p className="text-gray-600 text-xs">Belum ada notifikasi untuk ditampilkan</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500 font-medium">
                            {formatTimestamp(notification.created_at)}
                          </span>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {notification.description}
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                        <div className={`w-full h-full bg-gradient-to-br ${
                          notification.category === 'tagihan' ? 'from-orange-400 to-orange-600' :
                          notification.category === 'pengumuman' ? 'from-blue-400 to-blue-600' :
                          'from-purple-400 to-purple-600'
                        } flex items-center justify-center`}>
                          <Bell className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notification Detail Popup */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeNotificationDetail}
          />
          
          {/* Bottom Sheet */}
          <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transform transition-transform duration-500 ease-out ${
            selectedNotification ? 'translate-y-0' : 'translate-y-full'
          }`}>
            <div className="p-6">
              {/* Handle */}
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Detail Notifikasi</h2>
                <button 
                  onClick={closeNotificationDetail}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(selectedNotification.created_at)}
                    </span>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {selectedNotification.title}
                    </h3>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedNotification.full_content || selectedNotification.description}
                  </p>
                </div>

                {/* Additional data if available */}
                {selectedNotification.data && selectedNotification.category === 'tagihan' && (
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-2">Detail Tagihan</h4>
                    <div className="space-y-1 text-sm">
                      {selectedNotification.data.bill_type && (
                        <p className="text-blue-800">
                          <span className="font-semibold">Jenis:</span> {selectedNotification.data.bill_type}
                        </p>
                      )}
                      {selectedNotification.data.amount && (
                        <p className="text-blue-800">
                          <span className="font-semibold">Jumlah:</span> Rp {Number(selectedNotification.data.amount).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      )}
                      {selectedNotification.data.due_date && (
                        <p className="text-blue-800">
                          <span className="font-semibold">Jatuh Tempo:</span> {new Date(selectedNotification.data.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                      {selectedNotification.data.notes && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-blue-800">
                            <span className="font-semibold">Catatan:</span>
                          </p>
                          <p className="text-blue-700 mt-1 whitespace-pre-wrap">{selectedNotification.data.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={closeNotificationDetail}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Tutup
                  </button>
                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-medium hover:bg-blue-700 transition-colors">
                    Tandai Dibaca
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifikasi;
