import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CalendarDaysIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Table from '../components/common/UI/Table';
import Modal from '../components/common/UI/Modal';
import Button from '../components/common/UI/Button';
import sarprasService from '../services/sarprasService';
import toast from 'react-hot-toast';

// Local interfaces to avoid import issues
interface InventoryCategory {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface InventoryItem {
  id: number;
  item_code: string;
  name: string;
  category_id?: number;
  sub_category?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price: number;
  current_value: number;
  location?: string;
  status: 'aktif' | 'maintenance' | 'penghapusan';
  condition: 'baik' | 'rusak_ringan' | 'rusak_berat' | 'tidak_berfungsi';
  warranty_expiry?: string;
  supplier?: string;
  pic?: string;
  notes?: string;
  images?: Array<{
    id?: number;
    url: string;
    name?: string;
  }>;
  category?: any;
  created_at?: string;
  updated_at?: string;
}

interface Statistics {
  total_items: number;
  total_value: number;
  by_condition: Array<{ condition: string; count: number }>;
  by_status: Array<{ status: string; count: number }>;
  by_category: Array<{ sub_category: string; count: number }>;
}

const Sarpras: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('semua');
  const [facilitiesData, setFacilitiesData] = useState<InventoryItem[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<InventoryCategory[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    sub_category: '',
    brand: '',
    model: '',
    location: '',
    purchase_price: 0,
    current_value: 0,
    status: 'aktif',
    condition: 'baik',
    pic: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, stats, categories] = await Promise.all([
        sarprasService.getInventoryItems(),
        sarprasService.getStatistics(),
        sarprasService.getCategories()
      ]);
      setFacilitiesData(items);
      setStatistics(stats);
      setAvailableCategories(categories);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          submitData.append(key, value.toString());
        }
      });

      // Add images
      uploadedImages.forEach((file, index) => {
        submitData.append(`images[${index}]`, file);
      });

      // Send FormData to backend
      const response = await fetch('/api/master-data/sarpras', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test', // Use proper auth token
          'Accept': 'application/json',
        },
        body: submitData
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Item berhasil ditambahkan');
        setIsFormModalOpen(false);
        resetForm();
        loadData();
      } else {
        throw new Error(result.message || 'Gagal menambahkan item');
      }
    } catch (error: any) {
      console.error('Error creating item:', error);
      toast.error(error.message || 'Gagal menambahkan item');
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    
    try {
      await sarprasService.updateInventoryItem(selectedItem.id, formData);
      toast.success('Item berhasil diupdate');
      setIsFormModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error updating item:', error);
      toast.error(error.message || 'Gagal mengupdate item');
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    if (!window.confirm(`Yakin ingin menghapus ${item.name}?`)) return;

    try {
      await sarprasService.deleteInventoryItem(item.id);
      toast.success('Item berhasil dihapus');
      loadData();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error(error.message || 'Gagal menghapus item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sub_category: '',
      brand: '',
      model: '',
      location: '',
      purchase_price: 0,
      current_value: 0,
      status: 'aktif',
      condition: 'baik',
      pic: '',
      notes: ''
    });
    setSelectedItem(null);
    setUploadedImages([]);
    setImagePreviews([]);
    setNewCategoryInput('');
    setIsAddingNewCategory(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      const validImages = newImages.filter(file => {
        // Check file type
        if (!file.type.startsWith('image/')) {
          toast.error('Hanya file gambar yang diperbolehkan');
          return false;
        }
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Ukuran file maksimal 5MB');
          return false;
        }
        return true;
      });

      if (validImages.length > 0) {
        setUploadedImages(prev => [...prev, ...validImages]);
        
        // Create previews
        validImages.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreviews(prev => [...prev, e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        });

        toast.success(`${validImages.length} gambar berhasil diupload`);
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    toast.success('Gambar dihapus');
  };

  const addNewCategory = async () => {
    const trimmedCategory = newCategoryInput.trim();
    
    if (!trimmedCategory) {
      toast.error('Nama kategori tidak boleh kosong');
      return;
    }
    
    if (availableCategories.some(cat => cat.name === trimmedCategory)) {
      toast.error('Kategori sudah ada');
      return;
    }
    
    try {
      const categoryData = await sarprasService.storeCategory({
        name: trimmedCategory,
        description: `Kategori ${trimmedCategory}`
      });
      
      setAvailableCategories(prev => [...prev, categoryData]);
      setFormData(prev => ({ ...prev, sub_category: categoryData.name }));
      setNewCategoryInput('');
      setIsAddingNewCategory(false);
      toast.success('Kategori baru berhasil ditambahkan');
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error.message || 'Gagal menambahkan kategori');
    }
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${categoryName}"?`)) return;
    
    try {
      await sarprasService.deleteCategory(categoryId);
      setAvailableCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      // Reset form category if it matches the deleted category
      if (formData.sub_category === categoryName) {
        setFormData(prev => ({ ...prev, sub_category: '' }));
      }
      
      toast.success('Kategori berhasil dihapus');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Gagal menghapus kategori');
    }
  };

  const formatCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const openCreateModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      sub_category: item.sub_category,
      brand: item.brand,
      model: item.model,
      location: item.location,
      purchase_price: item.purchase_price,
      current_value: item.current_value,
      status: item.status,
      condition: item.condition,
      pic: item.pic,
      notes: item.notes
    });
    setIsFormModalOpen(true);
  };

  const stats = [
    {
      title: 'Total Aset',
      value: statistics?.total_items?.toString() || '0',
      icon: BuildingOfficeIcon,
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Kondisi Baik',
      value: statistics?.by_condition?.find(c => c.condition === 'baik')?.count?.toString() || '0',
      icon: CheckCircleIcon,
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Perlu Maintenance',
      value: statistics?.by_status?.find(s => s.status === 'maintenance')?.count?.toString() || '0',
      icon: WrenchScrewdriverIcon,
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Nilai Total Aset',
      value: `Rp ${(statistics?.total_value || 0).toLocaleString('id-ID')}`,
      icon: ComputerDesktopIcon,
      gradient: 'from-purple-500 to-indigo-600',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  const categories = [
    { key: 'semua', label: 'Semua Kategori', count: facilitiesData.length },
    ...availableCategories.map(category => ({
      key: category.name,
      label: category.name,
      count: facilitiesData.filter(item => item.sub_category === category.name).length
    }))
  ];

  const filteredData = facilitiesData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.pic || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'semua' || item.sub_category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      header: 'Nama Aset',
      key: 'name',
      render: (value: string, row: InventoryItem) => (
        <div>
          <p className="font-semibold text-slate-800">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPinIcon className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">{row.location}</span>
          </div>
          <p className="text-xs text-slate-600 capitalize">{row.sub_category?.replace('_', ' ')}</p>
        </div>
      )
    },
    {
      header: 'Kondisi',
      key: 'condition',
      render: (value: string) => {
        const kondisiConfig = {
          baik: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Baik', icon: CheckCircleIcon },
          rusak_ringan: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Rusak Ringan', icon: ExclamationTriangleIcon },
          rusak_berat: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Rusak Berat', icon: ExclamationTriangleIcon },
          tidak_berfungsi: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Tidak Berfungsi', icon: ExclamationTriangleIcon }
        };
        const config = kondisiConfig[value as keyof typeof kondisiConfig];
        const IconComponent = config.icon;
        
        return (
          <div className="flex items-center gap-2">
            <IconComponent className={`w-4 h-4 ${config.text}`} />
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
              {config.label}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (value: string) => {
        const statusConfig = {
          aktif: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Aktif' },
          maintenance: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Maintenance' },
          penghapusan: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Penghapusan' }
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      header: 'Nilai Aset',
      key: 'current_value',
      render: (value: number) => (
        <span className="font-semibold text-slate-800">
          Rp {value.toLocaleString('id-ID')}
        </span>
      )
    },
    {
      header: 'PIC',
      key: 'pic',
      render: (value: string) => (
        <span className="text-sm text-slate-700">{value || '-'}</span>
      )
    },
    {
      header: 'Aksi',
      key: 'id',
      render: (_: number, row: InventoryItem) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleView(row)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => openEditModal(row)}
            className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDeleteItem(row)}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Hapus"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const handleView = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            SARPRAS
          </h1>
          <p className="text-slate-600 mt-1">Manajemen sarana dan prasarana sekolah</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Tambah Aset Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="group relative bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-7 h-7 ${stat.iconColor}`} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600 tracking-wide uppercase">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <WrenchScrewdriverIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Schedule Maintenance</p>
              <p className="text-sm text-slate-600">Jadwalkan perawatan rutin</p>
            </div>
          </button>
          
          <button className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ComputerDesktopIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Inventaris Aset</p>
              <p className="text-sm text-slate-600">Update data inventaris</p>
            </div>
          </button>
          
          <button className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Laporan Kerusakan</p>
              <p className="text-sm text-slate-600">Buat laporan kerusakan</p>
            </div>
          </button>
        </div>
      </div>

      {/* Categories & Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveFilter(category.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeFilter === category.key
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari aset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <FunnelIcon className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <Table columns={columns} data={filteredData} />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detail Aset"
        size="xl"
      >
        {selectedItem && (
          <div className="flex flex-col h-full max-h-[80vh]">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-800 mb-3">Informasi Aset</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Kode Item</label>
                  <p className="text-slate-900 font-semibold">{selectedItem.item_code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nama Aset</label>
                  <p className="text-slate-900 font-semibold">{selectedItem.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Kategori</label>
                  <p className="text-slate-900 capitalize">{selectedItem.sub_category?.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Lokasi</label>
                  <p className="text-slate-900">{selectedItem.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">PIC</label>
                  <p className="text-slate-900">{selectedItem.pic}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Brand</label>
                  <p className="text-slate-900">{selectedItem.brand || '-'}</p>
                </div>
              </div>
            </div>

            {/* Condition & Value */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Kondisi</label>
                <p className="text-slate-900 capitalize">{selectedItem.condition.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Status</label>
                <p className="text-slate-900 capitalize">{selectedItem.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Harga Beli</label>
                <p className="text-slate-900 font-bold">Rp {selectedItem.purchase_price.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Nilai Sekarang</label>
                <p className="text-slate-900 font-bold">Rp {selectedItem.current_value.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {selectedItem.notes && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Keterangan</label>
                <p className="text-slate-900">{selectedItem.notes}</p>
              </div>
            )}
            
                {/* Image Gallery Section */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <PhotoIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">Gallery Gambar</h3>
                        <p className="text-slate-500 text-sm">Foto dokumentasi aset</p>
                      </div>
                    </div>
                    {selectedItem.images && selectedItem.images.length > 0 && (
                      <div className="bg-white px-3 py-1 rounded-full border border-blue-200">
                        <span className="text-blue-600 font-semibold text-sm">
                          {selectedItem.images.length} gambar
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {selectedItem.images && selectedItem.images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedItem.images.map((image, index) => (
                        <div key={index} className="group relative">
                          <div className="aspect-square rounded-2xl overflow-hidden bg-white border-2 border-slate-200 hover:border-blue-400 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl">
                            <img
                              src={image.url || `https://nurverse.id/manajemen-annur/backend/public/storage/${image.file_path}`}
                              alt={`${selectedItem.name} - Image ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                // Fallback to placeholder image
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="p-4 w-full">
                              <p className="text-white font-medium text-sm truncate">
                                {image.original_name || image.name || `Gambar ${index + 1}`}
                              </p>
                              <p className="text-white/80 text-xs">
                                {(image.file_size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <PhotoIcon className="w-4 h-4 text-slate-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <PhotoIcon className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="text-slate-600 font-medium mb-2">Belum ada gambar</h4>
                      <p className="text-slate-400 text-sm">Gambar dokumentasi akan muncul di sini</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex-shrink-0 pt-4 border-t-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
                <Button className="bg-purple-500 hover:bg-purple-600" onClick={() => openEditModal(selectedItem)}>
                <PencilIcon className="w-4 h-4" />
                Edit Aset
              </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal (Create/Edit) - Modern Design */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          resetForm();
        }}
        title={selectedItem ? 'Edit Aset' : 'Tambah Aset Baru'}
        size="xl"
      >
        <div className="flex flex-col h-full max-h-[60vh]">
          {/* Header */}
          <div className="pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <PlusIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedItem ? 'Edit Aset' : 'Tambah Aset Baru'}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedItem ? 'Ubah informasi aset yang sudah ada' : 'Masukkan informasi aset baru ke dalam sistem'}
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Informasi Dasar
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nama Aset <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                      placeholder="Masukkan nama aset"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {/* Custom Category Dropdown */}
                      <div className="relative">
                        <select
                          value={isAddingNewCategory ? '' : formData.sub_category}
                          onChange={(e) => {
                            if (e.target.value === 'add_new') {
                              setIsAddingNewCategory(true);
                            } else {
                              setFormData({ ...formData, sub_category: e.target.value });
                              setIsAddingNewCategory(false);
                            }
                          }}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                          disabled={isAddingNewCategory}
                        >
                          <option value="">Pilih Kategori</option>
                          {availableCategories.map(category => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                          <option value="add_new" className="text-purple-600 font-medium">
                            + Tambah Kategori Baru
                          </option>
                        </select>
                      </div>
                      
                      {/* Category List with Delete Buttons */}
                      {availableCategories.length > 0 && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <h5 className="text-sm font-medium text-slate-700 mb-2">Kategori Tersedia:</h5>
                          <div className="space-y-1">
                            {availableCategories.map(category => (
                              <div key={category.id} className="flex items-center justify-between group">
                                <span className="text-sm text-slate-600 flex-1">
                                  {category.name}
                                  {category.description && (
                                    <span className="text-xs text-slate-400 ml-2">
                                      - {category.description}
                                    </span>
                                  )}
                                </span>
                                <button
                                  onClick={() => handleDeleteCategory(category.id, category.name)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200"
                                  title="Hapus kategori"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {isAddingNewCategory && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCategoryInput}
                            onChange={(e) => setNewCategoryInput(e.target.value)}
                            placeholder="Masukkan nama kategori baru"
                            className="flex-1 px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                            onKeyPress={(e) => e.key === 'Enter' && addNewCategory()}
                          />
                          <button
                            onClick={addNewCategory}
                            className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors font-medium"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingNewCategory(false);
                              setNewCategoryInput('');
                            }}
                            className="px-4 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors font-medium"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                      placeholder="Lokasi aset"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Details Section */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Detail Teknis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Brand/Merek</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                      placeholder="Brand/Merek"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                      placeholder="Model"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information Section */}
              <div className="bg-green-50 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Informasi Keuangan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Harga Beli <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">Rp</span>
                      <input
                        type="number"
                        value={formData.purchase_price}
                        onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nilai Sekarang</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">Rp</span>
                      <input
                        type="number"
                        value={formData.current_value}
                        onChange={(e) => setFormData({ ...formData, current_value: Number(e.target.value) })}
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Condition Section */}
              <div className="bg-amber-50 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Status & Kondisi
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="penghapusan">Penghapusan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kondisi <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                    >
                      <option value="baik">Baik</option>
                      <option value="rusak_ringan">Rusak Ringan</option>
                      <option value="rusak_berat">Rusak Berat</option>
                      <option value="tidak_berfungsi">Tidak Berfungsi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="bg-indigo-50 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Upload Gambar
                </h4>
                
                {/* Upload Area */}
                <div className="mb-4">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    <PhotoIcon className="w-8 h-8 text-indigo-500 mb-2" />
                    <p className="text-sm text-indigo-600 font-medium">Upload Gambar</p>
                    <p className="text-xs text-indigo-500">Klik untuk memilih atau drag & drop</p>
                    <p className="text-xs text-indigo-400">PNG, JPG, JPEG (max 5MB)</p>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      Preview Gambar ({imagePreviews.length} gambar)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-white border border-slate-200">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {uploadedImages[index]?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Information Section */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  Informasi Tambahan
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">PIC (Person in Charge)</label>
                    <input
                      type="text"
                      value={formData.pic}
                      onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                      placeholder="Nama PIC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Catatan</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white resize-none"
                      rows={4}
                      placeholder="Catatan tambahan..."
                    ></textarea>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer - Always Visible */}
          <div className="flex-shrink-0 pt-4 pb-4 border-t-2 border-purple-300 bg-white shadow-lg -mx-8 px-8">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-slate-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium">*</span> Wajib diisi
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsFormModalOpen(false);
                    resetForm();
                  }}
                  className="px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-semibold shadow-sm"
                >
                  Batal
                </button>
                <button
                  onClick={selectedItem ? handleUpdateItem : handleCreateItem}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <PlusIcon className="w-5 h-5" />
                  {selectedItem ? 'Update Aset' : 'Simpan Aset'}
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-500 text-center">
              Pastikan semua field wajib diisi sebelum menyimpan
            </div>
          </div>
      </Modal>
    </div>
  );
};

export default Sarpras;
