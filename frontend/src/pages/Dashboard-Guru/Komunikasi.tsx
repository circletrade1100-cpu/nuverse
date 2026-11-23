import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalPageWrapper from '../../components/GlobalPageWrapper';
import ProtectedRoute from '../../components/ProtectedRoute';
import { HeaderSkeleton, ListItemSkeleton } from '../../components/SkeletonLoader';
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
  UserPlus,
  Filter,
  Star,
  BellOff
} from 'lucide-react';

const Komunikasi: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const chatList = [
    {
      id: 1,
      name: 'Orang Tua Ahmad Fadli',
      parentName: 'Bapak Sigit',
      lastMessage: 'Terima kasih bu atas informasi perkembangan Ahmad',
      timestamp: '10:30',
      unreadCount: 0,
      isOnline: true,
      type: 'parent',
      avatar: '👨‍💼',
      subject: 'Matematika - Kelas 5A'
    },
    {
      id: 2,
      name: 'Grup Kelas 5A',
      parentName: '24 Orang Tua',
      lastMessage: 'Bu, untuk tugas matematika hari ini....',
      timestamp: '09:15',
      unreadCount: 3,
      isOnline: false,
      type: 'group',
      avatar: '👥',
      subject: 'Kelas 5A'
    },
    {
      id: 3,
      name: 'Orang Tua Siti Aminah',
      parentName: 'Ibu Ratna',
      lastMessage: 'Selamat pagi bu, saya ingin konsultasi tentang...',
      timestamp: 'Kemarin',
      unreadCount: 1,
      isOnline: false,
      type: 'parent',
      avatar: '👩‍💼',
      subject: 'Matematika - Kelas 5A'
    },
    {
      id: 4,
      name: 'Koordinator Wali Kelas',
      parentName: 'Tim Guru',
      lastMessage: 'Rapat koordinasi besok pagi jam 7',
      timestamp: 'Kemarin',
      unreadCount: 0,
      isOnline: true,
      type: 'teacher',
      avatar: '👩‍🏫',
      subject: 'Koordinasi'
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'Bapak Sigit',
      message: 'Selamat pagi Bu, bagaimana perkembangan Ahmad hari ini?',
      timestamp: '09:00',
      isOwn: false
    },
    {
      id: 2,
      sender: 'You',
      message: 'Selamat pagi Pak Sigit. Ahmad hari ini sangat aktif dan menunjukkan pemahaman yang baik dalam pelajaran matematika.',
      timestamp: '09:05',
      isOwn: true
    },
    {
      id: 3,
      sender: 'You',
      message: 'Dia berhasil mengerjakan 8 dari 10 soal dengan benar. Saya sarankan untuk memberikan latihan tambahan di rumah.',
      timestamp: '09:06',
      isOwn: true
    },
    {
      id: 4,
      sender: 'Bapak Sigit',
      message: 'Terima kasih bu atas informasinya. Akan saya berikan latihan tambahan di rumah. Ada rekomendasi buku latihan?',
      timestamp: '09:15',
      isOwn: false
    }
  ];

  const quickMessages = [
    "Selamat pagi, bagaimana kabar ananda hari ini?",
    "Terima kasih atas perhatiannya terhadap perkembangan anak",
    "Mohon izin untuk berkonsultasi tentang perkembangan akademik",
    "Untuk tugas hari ini, mohon dipastikan anak mengerjakan dengan teliti"
  ];

  const notifications = [
    {
      id: 1,
      title: 'Pesan baru dari Orang Tua',
      description: 'Bapak Sigit mengirim pesan tentang Ahmad...',
      timestamp: '10:30',
      isRead: false,
      type: 'message',
      priority: 'normal'
    },
    {
      id: 2,
      title: 'Permintaan Konsultasi',
      description: 'Ibu Ratna meminta waktu konsultasi',
      timestamp: '09:45',
      isRead: false,
      type: 'consultation',
      priority: 'high'
    },
    {
      id: 3,
      title: 'Grup Kelas 5A',
      description: '3 pesan baru dalam grup',
      timestamp: '09:15',
      isRead: true,
      type: 'group',
      priority: 'normal'
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'parent': return 'bg-blue-100 text-blue-700';
      case 'group': return 'bg-green-100 text-green-700';
      case 'teacher': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      default: return 'border-l-4 border-blue-500';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <ProtectedRoute>
        <GlobalPageWrapper>
          <div className="min-h-screen bg-gray-50 pb-20">
            <HeaderSkeleton />
            <div className="px-6 space-y-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="h-12 bg-gray-200 animate-pulse rounded-lg mb-3"></div>
                <div className="flex space-x-2">
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full"></div>
                  <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <ListItemSkeleton key={item} />
                ))}
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
      <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/guru/dashboard')}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white text-xl font-semibold">Komunikasi</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </button>
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/10 rounded-2xl p-1 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-center rounded-xl transition-colors ${
              activeTab === 'chat' 
                ? 'bg-white text-green-600 font-semibold' 
                : 'text-white/80'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 text-center rounded-xl transition-colors relative ${
              activeTab === 'notifications' 
                ? 'bg-white text-green-600 font-semibold' 
                : 'text-white/80'
            }`}
          >
            Notifikasi
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-3 text-center rounded-xl transition-colors ${
              activeTab === 'contacts' 
                ? 'bg-white text-green-600 font-semibold' 
                : 'text-white/80'
            }`}
          >
            Kontak
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
                  <div className="flex items-center space-x-3 mb-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari orang tua atau pesan..."
                      className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                    />
                    <Filter className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Semua</button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Orang Tua</button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Grup Kelas</button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Guru</button>
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
                      <span className="text-xs text-blue-700 font-medium">Broadcast</span>
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Percakapan</h3>
                    <button className="text-green-600 text-sm font-medium">Lihat Semua</button>
                  </div>
                  <div className="space-y-3">
                    {chatList.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedChat(chat.id)}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl text-left"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-xl">
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
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(chat.type)}`}>
                                {chat.type === 'parent' && 'Orang Tua'}
                                {chat.type === 'group' && 'Grup'}
                                {chat.type === 'teacher' && 'Guru'}
                              </span>
                              <span className="text-xs text-gray-500">{chat.subject}</span>
                            </div>
                            {chat.unreadCount > 0 && (
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
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
                    <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Quick Messages */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">Pesan Cepat:</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {quickMessages.map((msg, index) => (
                      <button
                        key={index}
                        onClick={() => setMessage(msg)}
                        className="min-w-max px-3 py-1 bg-white text-sm text-gray-700 border border-gray-200 rounded-full hover:bg-gray-100"
                      >
                        {msg.substring(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                        msg.isOwn 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-1 ${
                          msg.isOwn ? 'text-green-200' : 'text-gray-500'
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
                      className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'notifications' ? (
          /* Notifications Tab */
          <div className="space-y-4">
            {/* Filter */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                <div className="flex items-center space-x-2">
                  <button className="text-green-600 text-sm font-medium">Tandai Semua Dibaca</button>
                  <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <BellOff className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-xl border ${
                    notification.isRead ? 'bg-white border-gray-100' : 'bg-green-50 border-green-200'
                  } ${getPriorityColor(notification.priority)}`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.type === 'message' ? 'bg-blue-100' :
                        notification.type === 'consultation' ? 'bg-orange-100' : 'bg-purple-100'
                      }`}>
                        {notification.type === 'message' && <MessageCircle className="w-5 h-5 text-blue-600" />}
                        {notification.type === 'consultation' && <Video className="w-5 h-5 text-orange-600" />}
                        {notification.type === 'group' && <Users className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                            <div className="flex items-center space-x-1 mt-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{notification.timestamp}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {notification.priority === 'high' && (
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            )}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Contacts Tab */
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Kontak Orang Tua</h3>
              <button className="text-green-600 text-sm font-medium flex items-center space-x-1">
                <UserPlus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kontak..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Contacts List */}
            <div className="space-y-3">
              {chatList.filter(chat => chat.type === 'parent').map((contact) => (
                <div key={contact.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-lg">
                    {contact.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{contact.parentName}</h4>
                    <p className="text-sm text-gray-600">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.subject}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600" />
                    </button>
                    <button className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </GlobalPageWrapper>
    </ProtectedRoute>
  );
};

export default Komunikasi;
