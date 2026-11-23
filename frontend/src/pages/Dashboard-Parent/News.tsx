import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Clock,
  Eye,
  Heart,
  Share2,
  Bookmark,
  MessageCircle,
  TrendingUp,
  Bell
} from 'lucide-react';
import { cmsParentService } from '../../services/cmsParentService';
import type { Announcement } from '../../types/cmsParent';

const News: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch announcements dari CMS
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await cmsParentService.getPublicAnnouncements();
      if (response.success && response.data) {
        // Helper function to strip HTML tags
        const stripHtml = (html: string) => {
          if (!html) return '';
          // Remove HTML tags using regex
          return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        };

        // Transform data dari API ke format yang digunakan di halaman
        const transformedNews = response.data.map((announcement: Announcement) => {
          // Gunakan excerpt jika ada, atau strip HTML dari content untuk preview
          const previewText = announcement.excerpt || stripHtml(announcement.content);
          
          return {
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            preview: previewText,
            category: announcement.category,
            author: announcement.author || 'Admin',
            publishedAt: announcement.published_at || announcement.created_at || '',
            readTime: `${announcement.read_time || 3} menit`,
            views: announcement.view_count || 0,
            likes: 0,
            isBookmarked: false,
            imageUrl: announcement.thumbnail,
            isPinned: announcement.is_pinned
          };
        });
        setNewsData(transformedNews);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate category counts dynamically
  const categories = React.useMemo(() => [
    { id: 'semua', label: 'Semua', count: newsData.length },
    { id: 'akademik', label: 'Akademik', count: newsData.filter(n => n.category === 'akademik').length },
    { id: 'kegiatan', label: 'Kegiatan', count: newsData.filter(n => n.category === 'kegiatan').length },
    { id: 'pengumuman', label: 'Pengumuman', count: newsData.filter(n => n.category === 'pengumuman').length }
  ], [newsData]);

  const filteredNews = newsData.filter(news => {
    const matchesCategory = activeCategory === 'semua' || news.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = news.title.toLowerCase().includes(searchLower) ||
                         (news.preview || '').toLowerCase().includes(searchLower) ||
                         (news.content || '').toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'akademik': return 'bg-blue-100 text-blue-700';
      case 'kegiatan': return 'bg-green-100 text-green-700';
      case 'pengumuman': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://nurverse.id/storage/${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/parent/dashboard')}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white text-xl font-semibold">Berita & Informasi</h1>
          </div>
          <button 
            onClick={() => navigate('/parent/notifikasi')}
            className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Bell className="w-5 h-5 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder="Cari berita atau informasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/70 outline-none"
            />
            <button className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {/* Categories */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Kategori</h3>
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm font-medium">{category.label}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-gray-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Trending News */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-800">Trending</h3>
          </div>
          
          <div className="space-y-3">
            {newsData.filter(news => news.isPinned).slice(0, 2).map((news, index) => (
              <div key={news.id} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm line-clamp-2">{news.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(news.category)}`}>
                      {news.category}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(news.publishedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News List */}
        <div className="space-y-4">
          {filteredNews.map((news) => (
            <div key={news.id} className="bg-white rounded-2xl p-4 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(news.category)}`}>
                      {news.category}
                    </span>
                    {news.isPinned && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                        Pinned
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-lg line-clamp-2 mb-2">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {news.preview || news.content}
                  </p>
                </div>
                <button className="ml-3">
                  <Bookmark className={`w-5 h-5 ${news.isBookmarked ? 'text-blue-600 fill-current' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-4">
                  <span>{news.author}</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{news.readTime}</span>
                  </div>
                  <span>{formatDate(news.publishedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{news.views}</span>
                  </div>
                  <button className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{news.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Komentar</span>
                  </button>
                </div>
                
                <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-600">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Bagikan</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Tidak ada berita ditemukan</h3>
            <p className="text-gray-600 text-sm">
              Coba ubah kata kunci pencarian atau filter kategori
            </p>
          </div>
        )}

        {/* Load More */}
        {filteredNews.length > 0 && (
          <div className="mt-6">
            <button className="w-full bg-white border border-gray-200 rounded-2xl py-4 text-gray-700 font-medium hover:bg-gray-50">
              Muat Lebih Banyak
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
