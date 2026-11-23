import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalPageWrapper from '../../components/GlobalPageWrapper';
import ProtectedRoute from '../../components/ProtectedRoute';
import { HeaderSkeleton, ListItemSkeleton } from '../../components/SkeletonLoader';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Plus,
  MoreVertical,
  Calendar,
  Users,
  Eye,
  MessageSquare,
  Share2,
  Bookmark,
  BookmarkCheck,
  Pin,
  Info,
  Megaphone,
  Bell,
  Send,
  Image,
  Paperclip,
  X
} from 'lucide-react';

const Pengumuman: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('semua');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('info');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('semua');
  const [loading, setLoading] = useState(true);

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const pengumumanData = [
    {
      id: 1,
      title: 'Rapat Evaluasi Tengah Semester',
      content: 'Mengundang seluruh guru untuk menghadiri rapat evaluasi tengah semester yang akan membahas perkembangan akademik siswa...',
      category: 'rapat',
      priority: 'high',
      author: 'Kepala Sekolah',
      timestamp: '2 jam yang lalu',
      date: '2024-01-25',
      views: 45,
      comments: 8,
      isBookmarked: true,
      isPinned: true,
      targetAudience: 'Semua Guru',
      attachments: ['agenda-rapat.pdf']
    },
    {
      id: 2,
      title: 'Workshop Metode Pembelajaran Digital',
      content: 'Sekolah mengadakan workshop tentang implementasi teknologi dalam pembelajaran. Diharapkan semua guru dapat mengikuti...',
      category: 'workshop',
      priority: 'medium',
      author: 'Wakil Kepala Sekolah',
      timestamp: '5 jam yang lalu',
      date: '2024-01-24',
      views: 32,
      comments: 5,
      isBookmarked: false,
      isPinned: false,
      targetAudience: 'Semua Guru',
      attachments: []
    },
    {
      id: 3,
      title: 'Perubahan Jadwal Ujian Kelas 5',
      content: 'Terkait dengan hari libur nasional, jadwal ujian untuk kelas 5 mengalami perubahan. Mohon untuk menyesuaikan...',
      category: 'jadwal',
      priority: 'high',
      author: 'Koordinator Akademik',
      timestamp: '1 hari yang lalu',
      date: '2024-01-23',
      views: 67,
      comments: 12,
      isBookmarked: true,
      isPinned: false,
      targetAudience: 'Guru Kelas 5',
      attachments: ['jadwal-baru.pdf']
    },
    {
      id: 4,
      title: 'Sosialisasi Kurikulum Merdeka',
      content: 'Dalam rangka implementasi Kurikulum Merdeka, akan diadakan sosialisasi untuk seluruh tenaga pendidik...',
      category: 'info',
      priority: 'medium',
      author: 'Tim Kurikulum',
      timestamp: '2 hari yang lalu',
      date: '2024-01-22',
      views: 89,
      comments: 15,
      isBookmarked: false,
      isPinned: false,
      targetAudience: 'Semua Guru',
      attachments: ['panduan-kurikulum.pdf', 'modul-pelatihan.pdf']
    }
  ];

  const categories = [
    { id: 'semua', label: 'Semua', count: pengumumanData.length },
    { id: 'rapat', label: 'Rapat', count: pengumumanData.filter(p => p.category === 'rapat').length },
    { id: 'workshop', label: 'Workshop', count: pengumumanData.filter(p => p.category === 'workshop').length },
    { id: 'jadwal', label: 'Jadwal', count: pengumumanData.filter(p => p.category === 'jadwal').length },
    { id: 'info', label: 'Informasi', count: pengumumanData.filter(p => p.category === 'info').length }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50';
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-4 border-green-500 bg-green-50';
      default: return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rapat': return <Users className="w-4 h-4" />;
      case 'workshop': return <Megaphone className="w-4 h-4" />;
      case 'jadwal': return <Calendar className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'rapat': return 'bg-purple-100 text-purple-700';
      case 'workshop': return 'bg-blue-100 text-blue-700';
      case 'jadwal': return 'bg-green-100 text-green-700';
      case 'info': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredPengumuman = activeTab === 'semua' 
    ? pengumumanData 
    : pengumumanData.filter(item => item.category === activeTab);

  const handleCreatePengumuman = () => {
    if (title.trim() && content.trim()) {
      console.log('Creating pengumuman:', { title, content, selectedCategory, targetAudience });
      setShowCreateModal(false);
      setTitle('');
      setContent('');
      setSelectedCategory('info');
      setTargetAudience('semua');
      alert('Pengumuman berhasil dibuat!');
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
            <h1 className="text-white text-xl font-semibold">Pengumuman</h1>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-white/80" />
            <input
              type="text"
              placeholder="Cari pengumuman..."
              className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
            />
            <Filter className="w-5 h-5 text-white/80" />
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {/* Category Tabs */}
        <div className="bg-white rounded-2xl p-1 shadow-sm mb-6">
          <div className="flex overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === category.id 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Pin className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">
              {pengumumanData.filter(p => p.isPinned).length}
            </p>
            <p className="text-xs text-gray-600">Diprioritaskan</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">
              {pengumumanData.reduce((total, p) => total + p.views, 0)}
            </p>
            <p className="text-xs text-gray-600">Total Views</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">
              {pengumumanData.reduce((total, p) => total + p.comments, 0)}
            </p>
            <p className="text-xs text-gray-600">Komentar</p>
          </div>
        </div>

        {/* Pengumuman List */}
        <div className="space-y-4">
          {filteredPengumuman.map((item) => (
            <div key={item.id} className={`bg-white rounded-2xl p-4 shadow-sm ${getPriorityColor(item.priority)}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  {item.isPinned && (
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <Pin className="w-3 h-3 text-red-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span>{item.author}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>
                <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Category & Target */}
              <div className="flex items-center space-x-2 mb-3">
                <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                  {getCategoryIcon(item.category)}
                  <span className="capitalize">{item.category}</span>
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {item.targetAudience}
                </span>
              </div>

              {/* Content */}
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                {item.content}
              </p>

              {/* Attachments */}
              {item.attachments.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Lampiran:</p>
                  <div className="space-y-2">
                    {item.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{attachment}</span>
                        <button className="ml-auto text-blue-600 text-sm font-medium">Download</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{item.views}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{item.comments}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {item.isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Pengumuman Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Buat Pengumuman</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <div className="grid grid-cols-2 gap-2">
                  {['info', 'rapat', 'workshop', 'jadwal'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {getCategoryIcon(cat)}
                        <span className="capitalize">{cat}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="semua">Semua Guru</option>
                  <option value="kelas1">Guru Kelas 1</option>
                  <option value="kelas2">Guru Kelas 2</option>
                  <option value="kelas3">Guru Kelas 3</option>
                  <option value="kelas4">Guru Kelas 4</option>
                  <option value="kelas5">Guru Kelas 5</option>
                  <option value="kelas6">Guru Kelas 6</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
                <input
                  type="text"
                  placeholder="Masukkan judul pengumuman..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Isi Pengumuman</label>
                <textarea
                  placeholder="Tulis isi pengumuman..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lampiran</label>
                <div className="flex space-x-2">
                  <button className="flex-1 p-3 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-green-400 transition-colors">
                    <Image className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <span className="text-sm text-gray-600">Gambar</span>
                  </button>
                  <button className="flex-1 p-3 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-green-400 transition-colors">
                    <Paperclip className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <span className="text-sm text-gray-600">File</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreatePengumuman}
                  disabled={!title.trim() || !content.trim()}
                  className={`flex-1 py-3 font-medium rounded-xl flex items-center justify-center space-x-2 ${
                    title.trim() && content.trim()
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </GlobalPageWrapper>
    </ProtectedRoute>
  );
};

export default Pengumuman;
