import React, { useState, useEffect } from 'react';
import { Plus, Megaphone, Trash2, Edit2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Banner, BannerFormData } from '../../types/cmsParent';
import { cmsParentService } from '../../services/cmsParentService';

const CMSParentBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<BannerFormData>>({
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    bg_color: 'from-blue-600 to-purple-600',
    is_active: true,
    sort_order: 0,
    start_date: '',
    end_date: '',
    notes: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [mobileImagePreview, setMobileImagePreview] = useState<string>('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await cmsParentService.getBanners({ per_page: 100 });
      if (response.success) {
        setBanners(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching banners:', error);
      toast.error('Gagal memuat data banner');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      button_text: '',
      button_link: '',
      bg_color: 'from-blue-600 to-purple-600',
      is_active: true,
      sort_order: 0,
      start_date: '',
      end_date: '',
      notes: ''
    });
    setImagePreview('');
    setMobileImagePreview('');
    setIsFormModalOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      button_text: banner.button_text,
      button_link: banner.button_link,
      bg_color: banner.bg_color,
      is_active: banner.is_active,
      sort_order: banner.sort_order,
      start_date: banner.start_date,
      end_date: banner.end_date,
      notes: banner.notes
    });
    setImagePreview(banner.image_path ? getImageUrl(banner.image_path) : '');
    setMobileImagePreview(banner.mobile_image_path ? getImageUrl(banner.mobile_image_path) : '');
    setIsFormModalOpen(true);
  };

  const handleDeleteBanner = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus banner ini?')) return;

    try {
      const response = await cmsParentService.deleteBanner(id);
      if (response.success) {
        toast.success('Banner berhasil dihapus');
        fetchBanners();
      }
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      toast.error('Gagal menghapus banner');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'mobile_image') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'image') {
          setImagePreview(reader.result as string);
        } else {
          setMobileImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      if (type === 'image') {
        setFormData(prev => ({ ...prev, image: file }));
      } else {
        setFormData(prev => ({ ...prev, mobile_image: file }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBanner) {
        const response = await cmsParentService.updateBanner(editingBanner.id, formData as BannerFormData);
        if (response.success) {
          toast.success('Banner berhasil diperbarui');
          setIsFormModalOpen(false);
          fetchBanners();
        }
      } else {
        const response = await cmsParentService.createBanner(formData as BannerFormData);
        if (response.success) {
          toast.success('Banner berhasil ditambahkan');
          setIsFormModalOpen(false);
          fetchBanners();
        }
      }
    } catch (error: any) {
      console.error('Error submitting banner:', error);
      toast.error('Gagal menyimpan banner');
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://nurverse.id/storage/${path}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Megaphone className="w-8 h-8 text-pink-600" />
              </div>
              CMS Parent - Banner
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola banner carousel untuk dashboard parent
            </p>
          </div>
          
          <button
            onClick={handleAddBanner}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Tambah Banner
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Megaphone className="w-5 h-5 text-pink-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Banner</p>
                <p className="text-2xl font-semibold text-gray-900">{banners.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Megaphone className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {banners.filter(b => b.is_active).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Megaphone className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tidak Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {banners.filter(b => !b.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Banner List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                {banner.image_path && (
                  <img 
                    src={getImageUrl(banner.image_path)} 
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {!banner.image_path && (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {banner.is_active ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-sm text-gray-600 mb-3">{banner.subtitle}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Order: {banner.sort_order}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBanner(banner)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {banners.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada banner</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Tambah Banner'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Banner *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Banner *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'image')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Mobile (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'mobile_image')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                {mobileImagePreview && (
                  <div className="mt-2">
                    <img src={mobileImagePreview} alt="Mobile Preview" className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teks Tombol
                  </label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Tombol
                  </label>
                  <input
                    type="url"
                    value={formData.button_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, button_link: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CMSParentBanners;
