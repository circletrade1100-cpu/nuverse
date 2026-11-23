import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  MessageCircle, 
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Users,
  CheckCheck,
  Clock,
  Home,
  FileText,
  Activity,
  LogOut,
  ScanLine
} from 'lucide-react';

const Komunikasi: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const chatList = [
    {
      id: 1,
      name: 'Wali Kelas 5A',
      lastMessage: 'Terima kasih atas partisipasinya dalam kegiatan hari ini',
      timestamp: '10:30',
      unreadCount: 2,
      isOnline: true,
      type: 'teacher',
      avatar: '👩‍🏫'
    },
    {
      id: 2,
      name: 'Grup Orang Tua 5A',
      lastMessage: 'Ahmad: Terima kasih infonya bu',
      timestamp: '09:15',
      unreadCount: 5,
      isOnline: false,
      type: 'group',
      avatar: '👥'
    },
    {
      id: 3,
      name: 'Kepala Sekolah',
      lastMessage: 'Selamat pagi, terkait dengan kegiatan workshop parenting...',
      timestamp: 'Kemarin',
      unreadCount: 0,
      isOnline: false,
      type: 'principal',
      avatar: '👨‍💼'
    },
    {
      id: 4,
      name: 'Bendahara Sekolah',
      lastMessage: 'Konfirmasi pembayaran SPP bulan Januari telah diterima',
      timestamp: 'Kemarin',
      unreadCount: 0,
      isOnline: true,
      type: 'staff',
      avatar: '💼'
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'Wali Kelas 5A',
      message: 'Selamat pagi, Bapak/Ibu orang tua Ahmad Fadli',
      timestamp: '09:00',
      isOwn: false
    },
    {
      id: 2,
      sender: 'You',
      message: 'Selamat pagi bu, ada yang bisa saya bantu?',
      timestamp: '09:05',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Wali Kelas 5A',
      message: 'Ahmad hari ini menunjukkan perkembangan yang baik dalam pelajaran matematika. Dia aktif bertanya dan mengerjakan soal dengan baik.',
      timestamp: '09:10',
      isOwn: false
    },
    {
      id: 4,
      sender: 'You',
      message: 'Alhamdulillah, terima kasih bu atas informasinya. Saya akan terus mendukung Ahmad di rumah.',
      timestamp: '09:15',
      isOwn: true
    }
  ];

  const notifications = [
    {
      id: 1,
      title: 'Pesan baru dari Wali Kelas 5A',
      description: 'Ahmad menunjukkan perkembangan yang baik...',
      timestamp: '10:30',
      isRead: false,
      type: 'message'
    },
    {
      id: 2,
      title: 'Undangan Video Call',
      description: 'Kepala Sekolah mengundang Anda untuk video call',
      timestamp: '09:45',
      isRead: false,
      type: 'call'
    },
    {
      id: 3,
      title: 'Grup Orang Tua 5A',
      description: '5 pesan baru dalam grup',
      timestamp: '09:15',
      isRead: true,
      type: 'group'
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle send message logic
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'teacher': return 'bg-blue-100 text-blue-700';
      case 'group': return 'bg-green-100 text-green-700';
      case 'principal': return 'bg-purple-100 text-purple-700';
      case 'staff': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleNavigateToTagihan = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/parent/tagihan');
    }, 300);
  };

  const handleNavigateBack = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/parent/dashboard');
    }, 300);
  };

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 transition-all duration-300 ${isLoggingOut || isNavigating ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleNavigateBack}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white text-xl font-semibold">Komunikasi</h1>
          </div>
          <button 
            onClick={() => {
              setIsNavigating(true);
              setTimeout(() => {
                navigate('/parent/notifikasi');
              }, 300);
            }}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/10 rounded-2xl p-1 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-center rounded-xl transition-colors ${
              activeTab === 'chat' 
                ? 'bg-white text-blue-600 font-semibold' 
                : 'text-white/80'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 text-center rounded-xl transition-colors relative ${
              activeTab === 'notifications' 
                ? 'bg-white text-blue-600 font-semibold' 
                : 'text-white/80'
            }`}
          >
            Notifikasi
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </button>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {activeTab === 'chat' ? (
          <>
            {!selectedChat ? (
              <>
                {/* Search Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
                  <div className="flex items-center space-x-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari kontak atau pesan..."
                      className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Aksi Cepat</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="flex flex-col items-center space-y-2 p-3 bg-blue-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-blue-700 font-medium">Chat Guru</span>
                    </button>
                    <button className="flex flex-col items-center space-y-2 p-3 bg-green-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-green-700 font-medium">Telepon</span>
                    </button>
                    <button className="flex flex-col items-center space-y-2 p-3 bg-purple-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-purple-700 font-medium">Video Call</span>
                    </button>
                  </div>
                </div>

                {/* Chat List */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Percakapan</h3>
                  <div className="space-y-3">
                    {chatList.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedChat(chat.id)}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl text-left"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                            {chat.avatar}
                          </div>
                          {chat.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-800 truncate">{chat.name}</h4>
                            <span className="text-xs text-gray-500">{chat.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(chat.type)}`}>
                              {chat.type === 'teacher' && 'Guru'}
                              {chat.type === 'group' && 'Grup'}
                              {chat.type === 'principal' && 'Kepala Sekolah'}
                              {chat.type === 'staff' && 'Staff'}
                            </span>
                            {chat.unreadCount > 0 && (
                              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">{chat.unreadCount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Chat Detail */
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setSelectedChat(null)}
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                    >
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {chatList.find(chat => chat.id === selectedChat)?.name}
                      </h3>
                      <p className="text-sm text-green-600">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Video className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                        msg.isOwn 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-1 ${
                          msg.isOwn ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{msg.timestamp}</span>
                          {msg.isOwn && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Paperclip className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
                      <input
                        type="text"
                        placeholder="Ketik pesan..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-transparent outline-none text-gray-700"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                    </div>
                    <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Smile className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      onClick={handleSendMessage}
                      className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Notifications Tab */
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Notifikasi</h3>
              <button className="text-blue-600 text-sm font-medium">Tandai Semua Dibaca</button>
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-3 rounded-xl border ${
                  notification.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'message' ? 'bg-blue-100' :
                      notification.type === 'call' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {notification.type === 'message' && <MessageCircle className="w-5 h-5 text-blue-600" />}
                      {notification.type === 'call' && <Video className="w-5 h-5 text-green-600" />}
                      {notification.type === 'group' && <Users className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                      <div className="flex items-center space-x-1 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button 
            onClick={() => {
              setIsNavigating(true);
              setTimeout(() => {
                navigate('/parent/dashboard');
              }, 300);
            }}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Home</span>
          </button>
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
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-blue-600 font-medium">Notifikasi</span>
          </button>
          <button 
            onClick={() => {
              setIsLoggingOut(true);
              setTimeout(() => {
                localStorage.removeItem('student_data');
                localStorage.removeItem('token');
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

export default Komunikasi;
