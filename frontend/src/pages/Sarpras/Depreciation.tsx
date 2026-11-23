import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  CalculatorIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import sarprasService, { type DepreciationLog, type InventoryItem } from '../../services/sarprasService';

const Depreciation: React.FC = () => {
  const [depreciationLogs, setDepreciationLogs] = useState<DepreciationLog[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DepreciationLog | null>(null);
  const [editingDepreciation, setEditingDepreciation] = useState<DepreciationLog | null>(null);
  const [formData, setFormData] = useState({
    item_id: undefined as number | undefined,
    depreciation_date: new Date().toISOString().split('T')[0],
    method: 'straight_line' as 'straight_line' | 'declining_balance' | 'units_of_production',
    depreciation_rate: 20,
    useful_life_years: 5,
    salvage_value: 0,
    notes: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    totalDepreciation: 0,
    totalItems: 0,
    thisMonthDepreciation: 0,
    averageDepreciationRate: 0
  });

  useEffect(() => {
    loadData();
    loadInventoryItems();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.item_id = parseInt(searchTerm);
      if (selectedMethod) params.method = selectedMethod;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await sarprasService.getDepreciationLogs(params);
      setDepreciationLogs(response.data);

      // Calculate statistics
      const totalDepreciation = response.data.reduce((sum, log) => sum + log.depreciation_amount, 0);
      const thisMonth = new Date().toISOString().slice(0, 7);
      const thisMonthDepreciation = response.data
        .filter(log => log.depreciation_date.startsWith(thisMonth))
        .reduce((sum, log) => sum + log.depreciation_amount, 0);
      
      setStats({
        totalDepreciation,
        totalItems: response.data.length,
        thisMonthDepreciation,
        averageDepreciationRate: response.data.length > 0 ? totalDepreciation / response.data.length : 0
      });
    } catch (error: any) {
      console.error('Error loading depreciation logs:', error);
      toast.error('Gagal memuat data penyusutan');
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryItems = async () => {
    try {
      const response = await sarprasService.getInventoryItems();
      setInventoryItems(response);
    } catch (error: any) {
      console.error('Error loading inventory items:', error);
    }
  };

  const handleCreateLog = async () => {
    try {
      if (!formData.item_id) {
        toast.error('Mohon pilih asset');
        return;
      }

      if (editingDepreciation) {
        // Update existing depreciation log
        await sarprasService.updateDepreciationLog(editingDepreciation.id, formData);
        toast.success('Log penyusutan berhasil diperbarui');
      } else {
        // Create new depreciation log
        await sarprasService.createDepreciationLog(formData);
        toast.success('Log penyusutan berhasil dibuat');
      }
      
      setIsFormModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creating depreciation log:', error);
      toast.error(error.message || 'Gagal membuat log penyusutan');
    }
  };

  const handleDeleteLog = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus log penyusutan ini?')) {
      try {
        await sarprasService.deleteDepreciationLog(id);
        toast.success('Log penyusutan berhasil dihapus');
        loadData();
      } catch (error: any) {
        console.error('Error deleting depreciation log:', error);
        toast.error('Gagal menghapus log penyusutan');
      }
    }
  };

  const openDetailModal = (log: DepreciationLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleEditLog = (log: DepreciationLog) => {
    setEditingDepreciation(log);
    setFormData({
      item_id: log.item_id,
      depreciation_date: log.depreciation_date,
      method: log.method,
      depreciation_rate: log.depreciation_rate || 20,
      useful_life_years: log.useful_life_years || 5,
      salvage_value: log.salvage_value || 0,
      notes: log.notes || ''
    });
    setIsFormModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      item_id: undefined,
      depreciation_date: new Date().toISOString().split('T')[0],
      method: 'straight_line',
      depreciation_rate: 20,
      useful_life_years: 5,
      salvage_value: 0,
      notes: ''
    });
    setEditingDepreciation(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getMethodLabel = (method: string) => {
    const methods = {
      straight_line: 'Garis Lurus',
      declining_balance: 'Saldo Menurun',
      units_of_production: 'Unit Produksi'
    };
    return methods[method as keyof typeof methods] || method;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Penyusutan Barang</h1>
        <p className="text-gray-600">Kelola perhitungan penyusutan aset inventaris</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Penyusutan</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalDepreciation)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Item</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Penyusutan Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.thisMonthDepreciation)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <CalendarIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata Penyusutan</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageDepreciationRate)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CalculatorIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari asset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            {/* Method Filter */}
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Metode</option>
              <option value="straight_line">Garis Lurus</option>
              <option value="declining_balance">Saldo Menurun</option>
              <option value="units_of_production">Unit Produksi</option>
            </select>

            {/* Date Range */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tanggal Mulai"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tanggal Akhir"
            />

            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FunnelIcon className="w-4 h-4" />
              Filter
            </button>
          </div>

          <button
            onClick={() => setIsFormModalOpen(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Buat Log Penyusutan
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Asset</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Metode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nilai Sebelum</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Penyusutan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nilai Sesudah</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : depreciationLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data penyusutan
                  </td>
                </tr>
              ) : (
                depreciationLogs && depreciationLogs.length > 0 ? depreciationLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.depreciation_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.item?.name}</div>
                        <div className="text-sm text-gray-500">{log.item?.item_code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {getMethodLabel(log.method)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(log.previous_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      -{formatCurrency(log.depreciation_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(log.current_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(log)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                        >
                          Lihat
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleEditLog(log)}
                          className="text-green-600 hover:text-green-700 font-medium text-sm hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Belum ada data penyusutan
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDepreciation ? 'Edit Log Penyusutan' : 'Buat Log Penyusutan'}
              </h2>
              <p className="text-gray-600 mt-1">
                {editingDepreciation ? 'Perbarui perhitungan penyusutan aset' : 'Catat perhitungan penyusutan aset'}
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pilih Asset *
                    </label>
                    <select
                      value={formData.item_id || ''}
                      onChange={(e) => setFormData({ ...formData, item_id: parseInt(e.target.value) || undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                      required
                    >
                      <option value="">Pilih asset...</option>
                      {inventoryItems && inventoryItems.length > 0 ? inventoryItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.item_code} - {item.name}
                        </option>
                      )) : (
                        <option value="" disabled>Tidak ada data asset</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Penyusutan *
                    </label>
                    <input
                      type="date"
                      value={formData.depreciation_date}
                      onChange={(e) => setFormData({ ...formData, depreciation_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Metode Penyusutan *
                    </label>
                    <select
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                    >
                      <option value="straight_line">Garis Lurus</option>
                      <option value="declining_balance">Saldo Menurun</option>
                      <option value="units_of_production">Unit Produksi</option>
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {formData.method === 'straight_line' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Umur Ekonomis (Tahun)
                        </label>
                        <input
                          type="number"
                          value={formData.useful_life_years}
                          onChange={(e) => setFormData({ ...formData, useful_life_years: parseInt(e.target.value) || 5 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nilai Sisa
                        </label>
                        <input
                          type="number"
                          value={formData.salvage_value}
                          onChange={(e) => setFormData({ ...formData, salvage_value: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                          min="0"
                        />
                      </div>
                    </>
                  )}

                  {formData.method === 'declining_balance' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tingkat Penyusutan (%)
                      </label>
                      <input
                        type="number"
                        value={formData.depreciation_rate}
                        onChange={(e) => setFormData({ ...formData, depreciation_rate: parseFloat(e.target.value) || 20 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                        min="0"
                        max="100"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                      placeholder="Catatan tambahan..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCreateLog}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {editingDepreciation ? 'Perbarui Log Penyusutan' : 'Buat Log Penyusutan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Detail Log Penyusutan</h2>
              <p className="text-gray-600 mt-1">Informasi lengkap log penyusutan</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Item Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Asset</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Nama Asset</p>
                    <p className="text-base font-semibold text-gray-900 break-words">{selectedLog.item?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Kode Asset</p>
                    <p className="text-base font-semibold text-gray-900">{selectedLog.item?.item_code}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Harga Beli</p>
                    <p className="text-base font-semibold text-gray-900">{formatCurrency(selectedLog.item?.purchase_price || 0)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Lokasi</p>
                    <p className="text-base font-semibold text-gray-900 break-words">{selectedLog.item?.location}</p>
                  </div>
                </div>
              </div>

              {/* Depreciation Information */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Penyusutan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Tanggal Penyusutan</p>
                    <p className="text-base font-semibold text-gray-900">{formatDate(selectedLog.depreciation_date)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Metode</p>
                    <p className="text-base font-semibold text-gray-900">{getMethodLabel(selectedLog.method)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Nilai Sebelum</p>
                    <p className="text-base font-semibold text-gray-900">{formatCurrency(selectedLog.previous_value)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Penyusutan</p>
                    <p className="text-base font-semibold text-red-600">-{formatCurrency(selectedLog.depreciation_amount)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Nilai Sesudah</p>
                    <p className="text-base font-semibold text-green-600">{formatCurrency(selectedLog.current_value)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Dihitung Oleh</p>
                    <p className="text-base font-semibold text-gray-900">{selectedLog.calculator?.name || 'Admin'}</p>
                  </div>
                </div>
              </div>

              {/* Method Specific Information */}
              {selectedLog.method === 'straight_line' && (
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Metode Garis Lurus</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Umur Ekonomis</p>
                      <p className="text-base font-semibold text-gray-900">{selectedLog.useful_life_years} tahun</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Nilai Sisa</p>
                      <p className="text-base font-semibold text-gray-900">{formatCurrency(selectedLog.salvage_value)}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedLog.method === 'declining_balance' && (
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Metode Saldo Menurun</h3>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Tingkat Penyusutan</p>
                    <p className="text-base font-semibold text-gray-900">{selectedLog.depreciation_rate}%</p>
                  </div>
                </div>
              )}

              {selectedLog.method === 'units_of_production' && (
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Metode Unit Produksi</h3>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Total Unit Produksi</p>
                    <p className="text-base font-semibold text-gray-900">{selectedLog.units_of_production || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedLog.notes && (
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan</h3>
                  <div className="space-y-1">
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedLog.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Depreciation;
