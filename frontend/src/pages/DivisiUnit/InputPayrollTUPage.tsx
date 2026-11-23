import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, Building2, FileText, Check, ChevronDown, CheckSquare, Square, Calculator, Lightbulb, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { payrollInputTuService } from '../../services/payrollInputTuService';
import type { PayrollInputTu, PayrollInputTuFormData, GuruOption } from '../../services/payrollInputTuService';
import { unitSekolahService } from '../../services/unitSekolahService';
import type { UnitSekolah } from '../../types/masterData';
import Modal from '../../components/common/UI/Modal';

const BULAN_OPTIONS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const InputPayrollTUPage: React.FC = () => {
  const [data, setData] = useState<PayrollInputTu[]>([]);
  const [loading, setLoading] = useState(false);
  const [unitSekolahs, setUnitSekolahs] = useState<UnitSekolah[]>([]);
  const [gurus, setGurus] = useState<GuruOption[]>([]);
  
  // Filters
  const [selectedUnitSekolah, setSelectedUnitSekolah] = useState<number | ''>('');
  const [selectedPeriodeBulan, setSelectedPeriodeBulan] = useState<string>('');
  const [selectedPeriodeTahun, setSelectedPeriodeTahun] = useState<string>(new Date().getFullYear().toString());
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedGuruIds, setSelectedGuruIds] = useState<number[]>([]);
  const [guruSearchTerm, setGuruSearchTerm] = useState('');
  const [isGuruDropdownOpen, setIsGuruDropdownOpen] = useState(false);
  const guruDropdownRef = useRef<HTMLDivElement>(null);
  
  // Calculator modals state
  const [showBimbelModal, setShowBimbelModal] = useState(false);
  const [showEkskulModal, setShowEkskulModal] = useState(false);
  const [showProyekModal, setShowProyekModal] = useState(false);
  const [showPramukaModal, setShowPramukaModal] = useState(false);
  const [showTMukaModal, setShowTMukaModal] = useState(false);
  const [showTMukaPotonganModal, setShowTMukaPotonganModal] = useState(false);
  const [jamBimbelInput, setJamBimbelInput] = useState('');
  const [jamEkskulInput, setJamEkskulInput] = useState('');
  const [jamProyekInput, setJamProyekInput] = useState('');
  const [jamPramukaInput, setJamPramukaInput] = useState('');
  const [jamTMukaInput, setJamTMukaInput] = useState('');
  const [jamTMukaPotonganInput, setJamTMukaPotonganInput] = useState('');
  
  // Base values dari guru (untuk kalkulasi)
  const [baseValues, setBaseValues] = useState<{
    bimbel: number;
    ekskul: number;
    proyek: number;
    pramuka: number;
    t_muka_pengganti: number;
  }>({
    bimbel: 0,
    ekskul: 0,
    proyek: 0,
    pramuka: 0,
    t_muka_pengganti: 0
  });
  const [formData, setFormData] = useState<PayrollInputTuFormData>({
    guru_id: 0,
    unit_sekolah_id: 0,
    periode_bulan: '',
    periode_tahun: new Date().getFullYear().toString(),
    bimbel: 0,
    proyek: 0,
    eskul: 0,
    pramuka: 0,
    t_muka_pengganti_gaji_pokok: 0,
    t_muka_pengganti_potongan: 0,
    insentif_lain: 0,
    potongan_lain: 0,
    status: 'Draft'
  });

  // Load unit sekolah
  useEffect(() => {
    const loadUnitSekolahs = async () => {
      try {
        const data = await unitSekolahService.getAllForDropdown();
        setUnitSekolahs(data);
      } catch (error) {
        console.error('Error loading unit sekolah:', error);
      }
    };
    loadUnitSekolahs();
  }, []);

  // Load gurus when unit sekolah selected
  useEffect(() => {
    if (formData.unit_sekolah_id && formData.unit_sekolah_id > 0) {
      const loadGurus = async () => {
        try {
          const response = await payrollInputTuService.getGurusByUnit(formData.unit_sekolah_id);
          setGurus(response?.data || []);
        } catch (error) {
          console.error('Error loading gurus:', error);
          setGurus([]);
          // Don't show error toast on initial load
        }
      };
      loadGurus();
    } else {
      setGurus([]);
      setSelectedGuruIds([]);
    }
  }, [formData.unit_sekolah_id]);

  // Load base values dari guru pertama yang dipilih (untuk kalkulasi)
  useEffect(() => {
    if (selectedGuruIds.length > 0 && gurus.length > 0) {
      const firstGuru = gurus.find(g => g.id === selectedGuruIds[0]);
      if (firstGuru) {
        // Ambil base values dari guru
        setBaseValues({
          bimbel: firstGuru.bimbel || 0,
          ekskul: firstGuru.ekskul || 0,
          proyek: firstGuru.proyek || 0,
          pramuka: firstGuru.pramuka || 0,
          t_muka_pengganti: typeof firstGuru.t_muka_pengganti === 'string' 
            ? parseFloat(String(firstGuru.t_muka_pengganti).replace(/\./g, '').replace(/,/g, '')) || 0
            : (firstGuru.t_muka_pengganti || 0)
        });
      }
    } else {
      setBaseValues({
        bimbel: 0,
        ekskul: 0,
        proyek: 0,
        pramuka: 0,
        t_muka_pengganti: 0
      });
    }
  }, [selectedGuruIds, gurus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guruDropdownRef.current && !guruDropdownRef.current.contains(event.target as Node)) {
        setIsGuruDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter gurus based on search
  const filteredGurus = gurus.filter(guru =>
    guru.nama_lengkap?.toLowerCase().includes(guruSearchTerm.toLowerCase()) ||
    guru.nip?.toLowerCase().includes(guruSearchTerm.toLowerCase())
  );

  const handleToggleGuru = (guruId: number) => {
    setSelectedGuruIds(prev => {
      if (prev.includes(guruId)) {
        return prev.filter(id => id !== guruId);
      } else {
        return [...prev, guruId];
      }
    });
  };

  const handleSelectAllGurus = () => {
    if (selectedGuruIds.length === filteredGurus.length) {
      setSelectedGuruIds([]);
    } else {
      setSelectedGuruIds(filteredGurus.map(g => g.id));
    }
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedUnitSekolah) filters.unit_sekolah_id = selectedUnitSekolah;
      if (selectedPeriodeBulan) filters.periode_bulan = selectedPeriodeBulan;
      if (selectedPeriodeTahun) filters.periode_tahun = selectedPeriodeTahun;
      if (selectedStatus) filters.status = selectedStatus;

      const response = await payrollInputTuService.getAll(filters);
      let filteredData = response?.data || [];

      // Client-side search
      if (searchTerm && filteredData.length > 0) {
        filteredData = filteredData.filter(item =>
          item.guru?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.guru?.nip?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setData(filteredData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedUnitSekolah, selectedPeriodeBulan, selectedPeriodeTahun, selectedStatus]);

  const handleAdd = () => {
    setEditingId(null);
    setSelectedGuruIds([]);
    setGuruSearchTerm('');
    setFormData({
      guru_id: 0,
      unit_sekolah_id: selectedUnitSekolah ? Number(selectedUnitSekolah) : 0,
      periode_bulan: selectedPeriodeBulan || '',
      periode_tahun: selectedPeriodeTahun || new Date().getFullYear().toString(),
      bimbel: 0,
      proyek: 0,
      eskul: 0,
      pramuka: 0,
      t_muka_pengganti_gaji_pokok: 0,
      t_muka_pengganti_potongan: 0,
      insentif_lain: 0,
      potongan_lain: 0,
      status: 'Draft'
    });
    setIsFormOpen(true);
  };

  const handleEdit = (item: PayrollInputTu) => {
    setEditingId(item.id);
    setFormData({
      guru_id: item.guru_id,
      unit_sekolah_id: item.unit_sekolah_id,
      periode_bulan: item.periode_bulan,
      periode_tahun: item.periode_tahun,
      bimbel: item.bimbel,
      proyek: item.proyek,
      eskul: item.eskul,
      pramuka: item.pramuka,
      t_muka_pengganti_gaji_pokok: item.t_muka_pengganti_gaji_pokok,
      t_muka_pengganti_potongan: item.t_muka_pengganti_potongan,
      insentif_lain: item.insentif_lain,
      potongan_lain: item.potongan_lain,
      status: item.status
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;

    try {
      await payrollInputTuService.delete(id);
      toast.success('Data berhasil dihapus');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus data');
    }
  };

  // Format currency helper
  const formatRupiah = (value: number | string): string => {
    const numValue = typeof value === 'string' 
      ? parseFloat(String(value).replace(/\./g, '').replace(/,/g, '')) || 0
      : value || 0;
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
  };

  // Calculator handlers
  const handleOpenBimbelModal = () => {
    if (selectedGuruIds.length === 0) {
      toast.error('Pilih guru terlebih dahulu');
      return;
    }
    setJamBimbelInput('');
    setShowBimbelModal(true);
  };

  const handleBimbelCalculate = () => {
    const jamValue = parseFloat(jamBimbelInput.replace(/,/g, '.'));
    const baseBimbelValue = baseValues.bimbel;
    
    if (isNaN(jamValue) || jamValue <= 0) {
      toast.error('Input tidak valid. Pastikan memasukkan angka lebih dari 0.');
      return;
    }

    if (baseBimbelValue === 0) {
      toast.error('Base Bimbel tidak tersedia. Pastikan guru memiliki nilai base bimbel.');
      return;
    }

    const result = jamValue * baseBimbelValue;
    const roundedResult = Math.round(result);
    
    setFormData({ ...formData, bimbel: roundedResult });
    setShowBimbelModal(false);
    setJamBimbelInput('');
    toast.success(`Bimbel dihitung: ${formatRupiah(roundedResult)}`);
  };

  const handleOpenEkskulModal = () => {
    if (selectedGuruIds.length === 0) {
      toast.error('Pilih guru terlebih dahulu');
      return;
    }
    setJamEkskulInput('');
    setShowEkskulModal(true);
  };

  const handleEkskulCalculate = () => {
    const jamValue = parseFloat(jamEkskulInput.replace(/,/g, '.'));
    const baseEkskulValue = baseValues.ekskul;
    
    if (isNaN(jamValue) || jamValue <= 0) {
      toast.error('Input tidak valid. Pastikan memasukkan angka lebih dari 0.');
      return;
    }

    if (baseEkskulValue === 0) {
      toast.error('Base Ekskul tidak tersedia. Pastikan guru memiliki nilai base ekskul.');
      return;
    }

    const result = jamValue * baseEkskulValue;
    const roundedResult = Math.round(result);
    
    setFormData({ ...formData, eskul: roundedResult });
    setShowEkskulModal(false);
    setJamEkskulInput('');
    toast.success(`Ekskul dihitung: ${formatRupiah(roundedResult)}`);
  };

  const handleOpenProyekModal = () => {
    if (selectedGuruIds.length === 0) {
      toast.error('Pilih guru terlebih dahulu');
      return;
    }
    setJamProyekInput('');
    setShowProyekModal(true);
  };

  const handleProyekCalculate = () => {
    const jamValue = parseFloat(jamProyekInput.replace(/,/g, '.'));
    const baseProyekValue = baseValues.proyek;
    
    if (isNaN(jamValue) || jamValue <= 0) {
      toast.error('Input tidak valid. Pastikan memasukkan angka lebih dari 0.');
      return;
    }

    if (baseProyekValue === 0) {
      toast.error('Base Proyek tidak tersedia. Pastikan guru memiliki nilai base proyek.');
      return;
    }

    const result = jamValue * baseProyekValue;
    const roundedResult = Math.round(result);
    
    setFormData({ ...formData, proyek: roundedResult });
    setShowProyekModal(false);
    setJamProyekInput('');
    toast.success(`Proyek dihitung: ${formatRupiah(roundedResult)}`);
  };

  const handleOpenPramukaModal = () => {
    if (selectedGuruIds.length === 0) {
      toast.error('Pilih guru terlebih dahulu');
      return;
    }
    setJamPramukaInput('');
    setShowPramukaModal(true);
  };

  const handlePramukaCalculate = () => {
    const jamValue = parseFloat(jamPramukaInput.replace(/,/g, '.'));
    const basePramukaValue = baseValues.pramuka;
    
    if (isNaN(jamValue) || jamValue <= 0) {
      toast.error('Input tidak valid. Pastikan memasukkan angka lebih dari 0.');
      return;
    }

    if (basePramukaValue === 0) {
      toast.error('Base Pramuka tidak tersedia. Pastikan guru memiliki nilai base pramuka.');
      return;
    }

    const result = jamValue * basePramukaValue;
    const roundedResult = Math.round(result);
    
    setFormData({ ...formData, pramuka: roundedResult });
    setShowPramukaModal(false);
    setJamPramukaInput('');
    toast.success(`Pramuka dihitung: ${formatRupiah(roundedResult)}`);
  };

  const handleOpenTMukaModal = () => {
    if (selectedGuruIds.length === 0) {
      toast.error('Pilih guru terlebih dahulu');
      return;
    }
    setJamTMukaInput('');
    setShowTMukaModal(true);
  };

  const handleTMukaCalculate = () => {
    const jamValue = parseFloat(jamTMukaInput.replace(/,/g, '.'));
    const baseTMukaValue = baseValues.t_muka_pengganti;
    
    if (isNaN(jamValue) || jamValue <= 0) {
      toast.error('Input tidak valid. Pastikan memasukkan angka lebih dari 0.');
      return;
    }

    if (baseTMukaValue === 0) {
      toast.error('Base Tatap Muka Pengganti tidak tersedia. Pastikan guru memiliki nilai base tatap muka pengganti.');
      return;
    }

    const result = jamValue * baseTMukaValue;
    const roundedResult = Math.round(result);
    
    setFormData({ ...formData, t_muka_pengganti_gaji_pokok: roundedResult });
    setShowTMukaModal(false);
    setJamTMukaInput('');
    toast.success(`Tatap Muka Pengganti dihitung: ${formatRupiah(roundedResult)}`);
  };

  const handleOpenTMukaPotonganModal = () => {
    if (selectedGuruIds.length === 0) {
      toast.error('Pilih guru terlebih dahulu');
      return;
    }
    setJamTMukaPotonganInput('');
    setShowTMukaPotonganModal(true);
  };

  const handleTMukaPotonganCalculate = () => {
    const jamValue = parseFloat(jamTMukaPotonganInput.replace(/,/g, '.'));
    const baseTMukaValue = baseValues.t_muka_pengganti;
    
    if (isNaN(jamValue) || jamValue <= 0) {
      toast.error('Input tidak valid. Pastikan memasukkan angka lebih dari 0.');
      return;
    }

    if (baseTMukaValue === 0) {
      toast.error('Base Tatap Muka Pengganti tidak tersedia. Pastikan guru memiliki nilai base tatap muka pengganti.');
      return;
    }

    const result = jamValue * baseTMukaValue;
    const roundedResult = Math.round(result);
    
    setFormData({ ...formData, t_muka_pengganti_potongan: roundedResult });
    setShowTMukaPotonganModal(false);
    setJamTMukaPotonganInput('');
    toast.success(`Potongan Tatap Muka Pengganti dihitung: ${formatRupiah(roundedResult)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.unit_sekolah_id || formData.unit_sekolah_id === 0) {
      toast.error('Pilih Unit Sekolah terlebih dahulu');
      return;
    }
    
    if (editingId) {
      // Edit mode - single guru
      if (!formData.guru_id || formData.guru_id === 0) {
        toast.error('Pilih Guru terlebih dahulu');
        return;
      }
      
      try {
        await payrollInputTuService.update(editingId, formData);
        toast.success('Data berhasil diperbarui');
        setIsFormOpen(false);
        fetchData();
      } catch (error: any) {
        const errorMessage = error.message || 'Gagal menyimpan data';
        try {
          const parsed = JSON.parse(errorMessage);
          const firstError = Object.values(parsed)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } catch {
          toast.error(errorMessage);
        }
      }
    } else {
      // Create mode - multiple gurus
      if (selectedGuruIds.length === 0) {
        toast.error('Pilih minimal satu Guru');
        return;
      }
      
      try {
        const bulkData = selectedGuruIds.map(guruId => ({
          ...formData,
          guru_id: guruId
        }));
        
        const response = await payrollInputTuService.bulkCreate(bulkData);
        toast.success(`Data berhasil disimpan untuk ${response.created} guru`);
        setIsFormOpen(false);
        setSelectedGuruIds([]);
        fetchData();
      } catch (error: any) {
        const errorMessage = error.message || 'Gagal menyimpan data';
        try {
          const parsed = JSON.parse(errorMessage);
          const firstError = Object.values(parsed)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } catch {
          toast.error(errorMessage);
        }
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Draft: 'bg-gray-100 text-gray-800',
      Submitted: 'bg-blue-100 text-blue-800',
      Approved: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status as keyof typeof colors] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-cyan-600" />
            Input Payroll TU
          </h1>
          <p className="text-gray-600 mt-1">Input data payroll dari TU Unit masing-masing sekolah</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Data
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Sekolah</label>
            <select
              value={selectedUnitSekolah}
              onChange={(e) => setSelectedUnitSekolah(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Semua Unit</option>
              {unitSekolahs && unitSekolahs.length > 0 && unitSekolahs.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
            <select
              value={selectedPeriodeBulan}
              onChange={(e) => setSelectedPeriodeBulan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Semua Bulan</option>
              {BULAN_OPTIONS.map((bulan) => (
                <option key={bulan} value={bulan}>
                  {bulan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
            <input
              type="text"
              value={selectedPeriodeTahun}
              onChange={(e) => setSelectedPeriodeTahun(e.target.value)}
              placeholder="2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari Guru</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nama atau NIP..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Tidak ada data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guru</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Sekolah</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bimbel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyek</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eskul</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pramuka</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data && data.length > 0 && data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{item.guru?.nama_lengkap || '-'}</div>
                        <div className="text-sm text-gray-500">{item.guru?.nip || '-'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.unit_sekolah?.nama || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.periode_bulan} {item.periode_tahun}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.bimbel)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.proyek)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.eskul)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.pramuka)}</td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-5 flex items-center justify-between border-b border-cyan-800/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {editingId ? 'Edit Data Input Payroll TU' : 'Tambah Data Input Payroll TU'}
                  </h2>
                  <p className="text-sm text-cyan-100 mt-0.5">
                    {editingId ? 'Perbarui data input payroll' : 'Input data payroll Guru'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setSelectedGuruIds([]);
                  setGuruSearchTerm('');
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
              {/* Basic Info Section */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-600" />
                  Informasi Dasar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit Sekolah <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.unit_sekolah_id}
                      onChange={(e) => {
                        setFormData({ ...formData, unit_sekolah_id: Number(e.target.value), guru_id: 0 });
                        setSelectedGuruIds([]);
                        setGuruSearchTerm('');
                      }}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white text-gray-900 font-medium"
                    >
                      <option value="0">Pilih Unit Sekolah</option>
                      {unitSekolahs && unitSekolahs.length > 0 && unitSekolahs.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {editingId ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Guru <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.guru_id}
                        onChange={(e) => setFormData({ ...formData, guru_id: Number(e.target.value) })}
                        required
                        disabled={!formData.unit_sekolah_id || formData.unit_sekolah_id === 0}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white text-gray-900 font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="0">Pilih Guru</option>
                        {gurus && gurus.length > 0 && gurus.map((guru) => (
                          <option key={guru.id} value={guru.id}>
                            {guru.nama_lengkap} - {guru.nip}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="relative" ref={guruDropdownRef}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pilih Guru <span className="text-red-500">*</span>
                        {selectedGuruIds.length > 0 && (
                          <span className="ml-2 text-xs font-normal text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
                            {selectedGuruIds.length} dipilih
                          </span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsGuruDropdownOpen(!isGuruDropdownOpen)}
                        disabled={!formData.unit_sekolah_id || formData.unit_sekolah_id === 0}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white text-left disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-between min-h-[3rem]"
                      >
                        <div className="flex-1 min-w-0">
                          {selectedGuruIds.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {selectedGuruIds.slice(0, 2).map((guruId) => {
                                const guru = gurus.find(g => g.id === guruId);
                                return guru ? (
                                  <span
                                    key={guruId}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-100 text-cyan-800 rounded-lg text-sm font-medium border border-cyan-200"
                                  >
                                    {guru.nama_lengkap}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleGuru(guruId);
                                      }}
                                      className="hover:bg-cyan-200 rounded-full p-0.5 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ) : null;
                              })}
                              {selectedGuruIds.length > 2 && (
                                <span className="inline-flex items-center px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-medium border border-cyan-200">
                                  +{selectedGuruIds.length - 2} lainnya
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">Pilih guru (bisa multiple)</span>
                          )}
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isGuruDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isGuruDropdownOpen && formData.unit_sekolah_id > 0 && (
                        <div className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden flex flex-col">
                          {/* Search */}
                          <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                value={guruSearchTerm}
                                onChange={(e) => setGuruSearchTerm(e.target.value)}
                                placeholder="Cari nama atau NIP..."
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                autoFocus
                              />
                            </div>
                          </div>

                          {/* Select All */}
                          {filteredGurus.length > 0 && (
                            <div className="px-3 py-2 border-b border-gray-200 bg-cyan-50/50">
                              <button
                                type="button"
                                onClick={handleSelectAllGurus}
                                className="w-full flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-800 transition-colors"
                              >
                                {selectedGuruIds.length === filteredGurus.length ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                                <span>Pilih Semua ({filteredGurus.length})</span>
                              </button>
                            </div>
                          )}

                          {/* Guru List */}
                          <div className="overflow-y-auto max-h-60">
                            {filteredGurus.length === 0 ? (
                              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                {guruSearchTerm ? 'Tidak ada guru ditemukan' : 'Tidak ada guru tersedia'}
                              </div>
                            ) : (
                              filteredGurus.map((guru) => (
                                <label
                                  key={guru.id}
                                  onClick={() => handleToggleGuru(guru.id)}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                >
                                  <div className="flex-shrink-0">
                                    {selectedGuruIds.includes(guru.id) ? (
                                      <div className="w-5 h-5 bg-cyan-600 border-2 border-cyan-600 rounded flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 border-2 border-gray-300 rounded hover:border-cyan-500 transition-colors" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900">{guru.nama_lengkap}</div>
                                    <div className="text-sm text-gray-500">NIP: {guru.nip}</div>
                                    {guru.jabatan && (
                                      <div className="text-xs text-gray-400 mt-0.5">{guru.jabatan.nama}</div>
                                    )}
                                  </div>
                                </label>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Periode Bulan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.periode_bulan}
                      onChange={(e) => setFormData({ ...formData, periode_bulan: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white text-gray-900 font-medium"
                    >
                      <option value="">Pilih Bulan</option>
                      {BULAN_OPTIONS.map((bulan) => (
                        <option key={bulan} value={bulan}>
                          {bulan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Periode Tahun <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.periode_tahun}
                      onChange={(e) => setFormData({ ...formData, periode_tahun: e.target.value })}
                      required
                      placeholder="2025"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white text-gray-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Data Input Section */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-600" />
                  Data Input Payroll
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bimbel</label>
                    <input
                      type="number"
                      value={formData.bimbel}
                      onChange={(e) => setFormData({ ...formData, bimbel: Number(e.target.value) || 0 })}
                      onClick={handleOpenBimbelModal}
                      min="0"
                      className="w-full px-3 py-2.5 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium cursor-pointer hover:bg-blue-50"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Klik untuk menghitung dengan formula
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Proyek</label>
                    <input
                      type="number"
                      value={formData.proyek}
                      onChange={(e) => setFormData({ ...formData, proyek: Number(e.target.value) || 0 })}
                      onClick={handleOpenProyekModal}
                      min="0"
                      className="w-full px-3 py-2.5 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-gray-900 font-medium cursor-pointer hover:bg-purple-50"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Klik untuk menghitung dengan formula
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-xl border border-green-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Eskul</label>
                    <input
                      type="number"
                      value={formData.eskul}
                      onChange={(e) => setFormData({ ...formData, eskul: Number(e.target.value) || 0 })}
                      onClick={handleOpenEkskulModal}
                      min="0"
                      className="w-full px-3 py-2.5 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 font-medium cursor-pointer hover:bg-green-50"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Klik untuk menghitung dengan formula
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-xl border border-orange-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pramuka</label>
                    <input
                      type="number"
                      value={formData.pramuka}
                      onChange={(e) => setFormData({ ...formData, pramuka: Number(e.target.value) || 0 })}
                      onClick={handleOpenPramukaModal}
                      min="0"
                      className="w-full px-3 py-2.5 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white text-gray-900 font-medium cursor-pointer hover:bg-orange-50"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Klik untuk menghitung dengan formula
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 p-4 rounded-xl border border-cyan-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tatap Muka Pengganti (Gaji Pokok)</label>
                    <input
                      type="number"
                      value={formData.t_muka_pengganti_gaji_pokok}
                      onChange={(e) => setFormData({ ...formData, t_muka_pengganti_gaji_pokok: Number(e.target.value) || 0 })}
                      onClick={handleOpenTMukaModal}
                      min="0"
                      className="w-full px-3 py-2.5 border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white text-gray-900 font-medium cursor-pointer hover:bg-cyan-50"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Klik untuk menghitung dengan formula
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-4 rounded-xl border border-red-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tatap Muka Pengganti (Potongan)</label>
                    <input
                      type="number"
                      value={formData.t_muka_pengganti_potongan}
                      onChange={(e) => setFormData({ ...formData, t_muka_pengganti_potongan: Number(e.target.value) || 0 })}
                      onClick={handleOpenTMukaPotonganModal}
                      min="0"
                      className="w-full px-3 py-2.5 border-2 border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white text-gray-900 font-medium cursor-pointer hover:bg-red-50"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Klik untuk menghitung dengan formula
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 rounded-xl border border-indigo-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Insentif Lain</label>
                    <input
                      type="number"
                      value={formData.insentif_lain}
                      onChange={(e) => setFormData({ ...formData, insentif_lain: Number(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2.5 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-gray-900 font-medium"
                      placeholder="0"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 p-4 rounded-xl border border-pink-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Potongan Lain</label>
                    <input
                      type="number"
                      value={formData.potongan_lain}
                      onChange={(e) => setFormData({ ...formData, potongan_lain: Number(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white text-gray-900 font-medium"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full md:w-1/3 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white text-gray-900 font-medium"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-6 py-4 -mx-6 -mb-6 flex items-center justify-end gap-3 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setSelectedGuruIds([]);
                    setGuruSearchTerm('');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? 'Perbarui Data' : `Simpan${selectedGuruIds.length > 0 ? ` (${selectedGuruIds.length} guru)` : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bimbel Calculator Modal */}
      <Modal
        isOpen={showBimbelModal}
        onClose={() => setShowBimbelModal(false)}
        title=""
        size="sm"
        showHeader={false}
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Calculator className="w-6 h-6" />
              Kalkulator Bimbel
            </h2>
            <p className="text-orange-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai Bimbel saat ini
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <p className="text-sm text-slate-600 mb-2">Nilai Base Bimbel:</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRupiah(baseValues.bimbel)}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Masukkan Jumlah Jam
            </label>
            <input
              type="text"
              value={jamBimbelInput}
              onChange={(e) => setJamBimbelInput(e.target.value)}
              placeholder="Contoh: 2"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-orange-600">
              Jam × Bimbel
            </p>
            {jamBimbelInput && (
              <p className="text-sm text-orange-800 font-bold mt-2">
                = {jamBimbelInput} × {formatRupiah(baseValues.bimbel)}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamBimbelInput.replace(/,/g, '.')) || 0) * baseValues.bimbel
                    )
                  )}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowBimbelModal(false)}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleBimbelCalculate}
              disabled={!jamBimbelInput}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Hitung & Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Ekskul Calculator Modal */}
      <Modal
        isOpen={showEkskulModal}
        onClose={() => setShowEkskulModal(false)}
        title=""
        size="sm"
        showHeader={false}
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Calculator className="w-6 h-6" />
              Kalkulator Ekstrakurikuler
            </h2>
            <p className="text-green-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai Ekskul saat ini
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <p className="text-sm text-slate-600 mb-2">Nilai Base Ekskul:</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRupiah(baseValues.ekskul)}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Masukkan Jumlah Jam
            </label>
            <input
              type="text"
              value={jamEkskulInput}
              onChange={(e) => setJamEkskulInput(e.target.value)}
              placeholder="Contoh: 2"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-green-600">
              Jam × Ekskul
            </p>
            {jamEkskulInput && (
              <p className="text-sm text-green-800 font-bold mt-2">
                = {jamEkskulInput} × {formatRupiah(baseValues.ekskul)}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamEkskulInput.replace(/,/g, '.')) || 0) * baseValues.ekskul
                    )
                  )}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowEkskulModal(false)}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleEkskulCalculate}
              disabled={!jamEkskulInput}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Hitung & Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Proyek Calculator Modal */}
      <Modal
        isOpen={showProyekModal}
        onClose={() => setShowProyekModal(false)}
        title=""
        size="sm"
        showHeader={false}
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Calculator className="w-6 h-6" />
              Kalkulator Proyek
            </h2>
            <p className="text-purple-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai Proyek saat ini
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <p className="text-sm text-slate-600 mb-2">Nilai Base Proyek:</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRupiah(baseValues.proyek)}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Masukkan Jumlah Jam
            </label>
            <input
              type="text"
              value={jamProyekInput}
              onChange={(e) => setJamProyekInput(e.target.value)}
              placeholder="Contoh: 2"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-purple-600">
              Jam × Proyek
            </p>
            {jamProyekInput && (
              <p className="text-sm text-purple-800 font-bold mt-2">
                = {jamProyekInput} × {formatRupiah(baseValues.proyek)}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamProyekInput.replace(/,/g, '.')) || 0) * baseValues.proyek
                    )
                  )}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowProyekModal(false)}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleProyekCalculate}
              disabled={!jamProyekInput}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Hitung & Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Tatap Muka Pengganti Calculator Modal */}
      <Modal
        isOpen={showTMukaModal}
        onClose={() => setShowTMukaModal(false)}
        title=""
        size="sm"
        showHeader={false}
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Calculator className="w-6 h-6" />
              Kalkulator Tatap Muka Pengganti
            </h2>
            <p className="text-cyan-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai Tatap Muka Pengganti saat ini
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <p className="text-sm text-slate-600 mb-2">Nilai Base Tatap Muka Pengganti:</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRupiah(baseValues.t_muka_pengganti)}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Masukkan Jumlah Jam
            </label>
            <input
              type="text"
              value={jamTMukaInput}
              onChange={(e) => setJamTMukaInput(e.target.value)}
              placeholder="Contoh: 2"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-cyan-600">
              Jam × Tatap Muka Pengganti
            </p>
            {jamTMukaInput && (
              <p className="text-sm text-cyan-800 font-bold mt-2">
                = {jamTMukaInput} × {formatRupiah(baseValues.t_muka_pengganti)}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamTMukaInput.replace(/,/g, '.')) || 0) * baseValues.t_muka_pengganti
                    )
                  )}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowTMukaModal(false)}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleTMukaCalculate}
              disabled={!jamTMukaInput}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Hitung & Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Pramuka Calculator Modal */}
      <Modal
        isOpen={showPramukaModal}
        onClose={() => setShowPramukaModal(false)}
        title=""
        size="sm"
        showHeader={false}
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Calculator className="w-6 h-6" />
              Kalkulator Pramuka
            </h2>
            <p className="text-amber-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai Pramuka saat ini
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <p className="text-sm text-slate-600 mb-2">Nilai Base Pramuka:</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRupiah(baseValues.pramuka)}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Masukkan Jumlah Jam
            </label>
            <input
              type="text"
              value={jamPramukaInput}
              onChange={(e) => setJamPramukaInput(e.target.value)}
              placeholder="Contoh: 2"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-amber-600">
              Jam × Pramuka
            </p>
            {jamPramukaInput && (
              <p className="text-sm text-amber-800 font-bold mt-2">
                = {jamPramukaInput} × {formatRupiah(baseValues.pramuka)}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamPramukaInput.replace(/,/g, '.')) || 0) * baseValues.pramuka
                    )
                  )}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowPramukaModal(false)}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={handlePramukaCalculate}
              disabled={!jamPramukaInput}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Hitung & Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Tatap Muka Pengganti Potongan Calculator Modal */}
      <Modal
        isOpen={showTMukaPotonganModal}
        onClose={() => setShowTMukaPotonganModal(false)}
        title=""
        size="sm"
        showHeader={false}
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Calculator className="w-6 h-6" />
              Kalkulator Potongan Tatap Muka Pengganti
            </h2>
            <p className="text-orange-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai Tatap Muka Pengganti saat ini
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <p className="text-sm text-slate-600 mb-2">Nilai Base Tatap Muka Pengganti:</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRupiah(baseValues.t_muka_pengganti)}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Masukkan Jumlah Jam
            </label>
            <input
              type="text"
              value={jamTMukaPotonganInput}
              onChange={(e) => setJamTMukaPotonganInput(e.target.value)}
              placeholder="Contoh: 2"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-orange-600">
              Jam × Tatap Muka Pengganti
            </p>
            {jamTMukaPotonganInput && (
              <p className="text-sm text-orange-800 font-bold mt-2">
                = {jamTMukaPotonganInput} × {formatRupiah(baseValues.t_muka_pengganti)}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamTMukaPotonganInput.replace(/,/g, '.')) || 0) * baseValues.t_muka_pengganti
                    )
                  )}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowTMukaPotonganModal(false)}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleTMukaPotonganCalculate}
              disabled={!jamTMukaPotonganInput}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Hitung & Update
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InputPayrollTUPage;

