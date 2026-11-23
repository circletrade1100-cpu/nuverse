import React, { useState, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import PayrollLayout from '../../components/Payroll/PayrollLayout';
import Card from '../../components/common/UI/Card';
import Button from '../../components/common/UI/Button';
import Modal from '../../components/common/UI/Modal';
import Select from 'react-select';
import Swal from 'sweetalert2';
import ExcelJS from 'exceljs';
import SlipTHRTemplate from '../../components/Payroll/SlipTHRTemplate';
import type { SlipTHRData } from '../../components/Payroll/SlipTHRTemplate';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  CalculatorIcon,
  XMarkIcon,
  ArrowPathIcon,
  BanknotesIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

interface THRData {
  id: number;
  guru_id: string;
  nama_lengkap: string;
  jabatan: string;
  masa_kerja_tahun: number;
  gaji_pokok: number;
  jabatan_rupiah?: number;
  masa_kerja_rupiah: number;
  jumlah_tatap_muka: number;
  tatap_muka_rupiah: number;
  total_rupiah: number;
  keterangan_rupiah: number;
  tahun: number;
}

interface Guru {
  id: number;
  nama_lengkap: string;
  nip: string;
  email?: string;
  jabatan_nama?: string;
  unit_sekolah_nama?: string;
  status?: string;
  gaji_pokok?: number;
  tunjangan_jabatan?: number;
  tunjangan_masa_kerja?: number;
  tatap_muka?: number;
  tmt?: string;
  nama_bank?: string;
  no_rekening?: string;
}

const THR: React.FC = () => {
  const [thrList, setThrList] = useState<THRData[]>([]);
  const [filteredThrList, setFilteredThrList] = useState<THRData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loadingGuru, setLoadingGuru] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear().toString());
  const [isExporting, setIsExporting] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showMasaKerjaCalculatorModal, setShowMasaKerjaCalculatorModal] = useState(false);
  const [isTatapMukaFocused, setIsTatapMukaFocused] = useState(false);
  const [tatapMukaRawValue, setTatapMukaRawValue] = useState('');
  const [printingId, setPrintingId] = useState<number | null>(null);

  // Excel Modal states
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [excelNamaBank, setExcelNamaBank] = useState('');
  const [excelTahun, setExcelTahun] = useState('');
  const [excelNomorSurat, setExcelNomorSurat] = useState('842.3/107/YPIN/VI/2025');
  const [excelNamaBendahara, setExcelNamaBendahara] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    guru_id: '',
    tahun: new Date().getFullYear().toString(),
    jumlah_tatap_muka: '',
    tatap_muka_rupiah: '',
    masa_kerja_rupiah: '',
    base_masa_kerja: '',
    masa_kerja_tahun: '',
    total_rupiah: '',
  });

  // Calculator state
  const [calcData, setCalcData] = useState({
    jumlah_tatap_muka: '',
    tatap_muka_rp: '',
    hasil: 0
  });

  // Calculator Masa Kerja state
  const [calcMasaKerjaData, setCalcMasaKerjaData] = useState({
    base_masa_kerja: '',
    masa_kerja_tahun: '',
    hasil: 0
  });

  // Fetch THR data
  const fetchTHRData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/thr?tahun=${selectedTahun}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal mengambil data THR');
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        setThrList(result.data || []);
        setFilteredThrList(result.data || []);
      } else {
        // Jika status bukan success, set empty array
        setThrList([]);
        setFilteredThrList([]);
      }
    } catch (error: any) {
      console.error('Error fetching THR data:', error);
      setThrList([]);
      setFilteredThrList([]);
      // Jangan tampilkan error jika tidak ada data (bisa jadi memang belum ada)
      if (error.message && !error.message.includes('401')) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Gagal mengambil data THR'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Guru list
  const fetchGuruList = async () => {
    setLoadingGuru(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/guru?per_page=10000`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mengambil data guru');
      }

      const result = await response.json();
      console.log('API Response - Total Guru:', result.data?.total);
      
      if (result.success && result.data && result.data.data) {
        // Transform data to match Guru interface
        const transformedGurus = result.data.data.map((guru: any) => ({
          id: guru.id,
          nama_lengkap: guru.nama_lengkap,
          nip: guru.nip,
          email: guru.email,
          jabatan_nama: guru.jabatan?.nama || '',
          unit_sekolah_nama: guru.unit_sekolah?.nama || '',
          status: guru.status,
          // Include payroll fields
          gaji_pokok: guru.gaji_pokok || 0,
          tunjangan_jabatan: guru.tunjangan_jabatan || 0,
          tunjangan_masa_kerja: guru.tunjangan_masa_kerja || 0,
          tatap_muka: guru.tatap_muka || 0,
          tmt: guru.tmt || '',
          // Include bank fields
          nama_bank: guru.nama_bank || '',
          no_rekening: guru.no_rekening || '',
        }));
        console.log('Transformed Gurus:', transformedGurus);
        setGuruList(transformedGurus);
      } else {
        console.warn('Unexpected data structure:', result);
        setGuruList([]);
      }
    } catch (error: any) {
      console.error('Error fetching guru list:', error);
      setGuruList([]);
    } finally {
      setLoadingGuru(false);
    }
  };

  useEffect(() => {
    console.log('THR component mounted, fetching data...');
    fetchTHRData();
    fetchGuruList();
  }, [selectedTahun]);

  useEffect(() => {
    console.log('THR data updated:', thrList.length, 'items');
  }, [thrList]);

  // Filter data
  useEffect(() => {
    // Pastikan thrList adalah array
    const listArray = Array.isArray(thrList) ? thrList : [];
    let filtered = listArray;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jabatan?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredThrList(filtered);
  }, [searchTerm, thrList]);

  // Calculate masa kerja tahun dari TMT
  const calculateMasaKerjaTahun = (tmt: string): number => {
    if (!tmt) return 0;
    try {
      const today = new Date();
      const tmtDate = new Date(tmt);
      
      if (isNaN(tmtDate.getTime()) || today < tmtDate) {
        return 0;
      }
      
      // Hitung selisih tahun dengan cara yang lebih akurat
      let years = today.getFullYear() - tmtDate.getFullYear();
      let months = today.getMonth() - tmtDate.getMonth();
      let days = today.getDate() - tmtDate.getDate();
      
      // Jika bulan atau hari negatif, kurangi 1 tahun
      if (months < 0 || (months === 0 && days < 0)) {
        years--;
      }
      
      return Math.max(0, years);
    } catch {
      return 0;
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.guru_id || !formData.tahun || !formData.jumlah_tatap_muka || !formData.tatap_muka_rupiah || !formData.total_rupiah) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Semua field harus diisi'
      });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const payload = {
        guru_id: formData.guru_id,
        tahun: parseInt(formData.tahun),
        jumlah_tatap_muka: parseInt(formData.jumlah_tatap_muka),
        tatap_muka_rupiah: Math.round(parseFloat(formData.tatap_muka_rupiah) || 0),
        masa_kerja: parseInt(formData.masa_kerja_rupiah.replace(/[^\d]/g, '')) || 0,
        masa_kerja_tahun: parseInt(formData.masa_kerja_tahun) || 0,
        total_rupiah: parseInt(formData.total_rupiah.replace(/[^\d]/g, '')),
      };

      const url = isEditMode && editingId
        ? `${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/thr/${editingId}`
        : `${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/thr`;

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menyimpan data THR');
      }

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: isEditMode ? 'Data THR berhasil diperbarui' : 'Data THR berhasil ditambahkan'
      });

      setIsModalOpen(false);
      resetForm();
      fetchTHRData();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Gagal menyimpan data THR'
      });
    }
  };

  // Handle edit
  const handleEdit = (item: THRData) => {
    setIsEditMode(true);
    setEditingId(item.id);
    
    // Find guru from guruList for edit mode
    const guruId = typeof item.guru_id === 'string' ? parseInt(item.guru_id) : item.guru_id;
    const guru = guruList.find(g => g.id === guruId || g.id.toString() === item.guru_id.toString());
    if (guru) {
      setSelectedGuru(guru);
      // Gunakan masa_kerja_tahun dari item yang sudah disimpan, atau hitung dari TMT jika tidak ada
      const masaKerjaTahun = item.masa_kerja_tahun || (guru.tmt ? calculateMasaKerjaTahun(guru.tmt) : 0);
      setFormData({
        guru_id: item.guru_id.toString(),
        tahun: item.tahun.toString(),
        jumlah_tatap_muka: item.jumlah_tatap_muka.toString(),
        tatap_muka_rupiah: item.tatap_muka_rupiah.toString(),
        masa_kerja_rupiah: formatRupiah(item.masa_kerja_rupiah),
        base_masa_kerja: (guru.tunjangan_masa_kerja || 0).toString(),
        masa_kerja_tahun: masaKerjaTahun.toString(),
        total_rupiah: formatRupiah(item.total_rupiah),
      });
    } else {
      setFormData({
        guru_id: item.guru_id.toString(),
        tahun: item.tahun.toString(),
        jumlah_tatap_muka: item.jumlah_tatap_muka.toString(),
        tatap_muka_rupiah: item.tatap_muka_rupiah.toString(),
        masa_kerja_rupiah: formatRupiah(item.masa_kerja_rupiah),
        base_masa_kerja: '',
        masa_kerja_tahun: item.masa_kerja_tahun.toString(),
        total_rupiah: formatRupiah(item.total_rupiah),
      });
    }
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Data THR?',
      text: 'Data yang dihapus tidak dapat dikembalikan',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/thr/${id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Gagal menghapus data THR');
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data THR berhasil dihapus'
        });

        fetchTHRData();
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Gagal menghapus data THR'
        });
      }
    }
  };

  // Handle print slip THR
  const handlePrintTHR = async (item: THRData) => {
    setPrintingId(item.id);
    try {
      Swal.fire({
        title: 'Menyiapkan Slip THR...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const token = localStorage.getItem('auth_token');
      const baseUrl = import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001';
      const response = await fetch(`${baseUrl}/api/master-data/thr/${item.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Gagal mengambil data THR');
      }

      const thrDetail = result.data;

      const guruIdCandidate = thrDetail?.guru_id ?? item.guru_id;
      const guru = guruList.find(g => g.id.toString() === (guruIdCandidate ?? '').toString());

      const toNumber = (value: any) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const templateData: SlipTHRData = {
        id: thrDetail?.id || item.id,
        namaLengkap: thrDetail?.nama_lengkap || guru?.nama_lengkap || item.nama_lengkap || '-',
        nip: guru?.nip,
        jabatan: thrDetail?.jabatan || guru?.jabatan_nama || '',
        unitSekolah: guru?.unit_sekolah_nama || '',
        masaKerjaTahun: toNumber(thrDetail?.masa_kerja_tahun),
        gajiPokok: toNumber(thrDetail?.gaji_pokok ?? guru?.gaji_pokok ?? item.gaji_pokok),
        tunjanganJabatan: toNumber(guru?.tunjangan_jabatan ?? item.jabatan_rupiah),
        masaKerjaRupiah: toNumber(thrDetail?.masa_kerja_rupiah ?? item.masa_kerja_rupiah),
        jumlahTatapMuka: toNumber(thrDetail?.jumlah_tatap_muka ?? item.jumlah_tatap_muka),
        tatapMukaRupiah: toNumber(thrDetail?.tatap_muka_rupiah ?? item.tatap_muka_rupiah),
        totalRupiah: toNumber(thrDetail?.total_rupiah ?? item.total_rupiah),
        tahun: toNumber(thrDetail?.tahun ?? item.tahun ?? selectedTahun),
        namaBank: guru?.nama_bank,
        noRekening: guru?.no_rekening,
        tanggalCetak: thrDetail?.updated_at || thrDetail?.created_at || new Date().toISOString()
      };

      await Swal.close();

      const escapeHtml = (text: string) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      const templateHtml = renderToString(
        React.createElement(SlipTHRTemplate, { data: templateData })
      );

      const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slip THR - ${escapeHtml(templateData.namaLengkap)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page {
        margin: 0.6cm;
        size: A4;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        background: white;
      }
      .no-print {
        display: none !important;
      }
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
    }
  </style>
</head>
<body>
  <div id="root">
    ${templateHtml}
  </div>

  <div class="no-print" style="position: fixed; bottom: 24px; right: 24px; z-index: 1000;">
    <button onclick="window.print()" style="background: #047857; color: white; padding: 12px 24px; border: none; border-radius: 999px; cursor: pointer; font-weight: 600; box-shadow: 0 10px 30px rgba(4, 120, 87, 0.3); display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 18px;">🖨️</span>
      <span>Print Slip THR</span>
    </button>
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
      }, 150);
    });
  </script>
</body>
</html>
      `;

      const printWindow = window.open('', '_blank', 'width=1200,height=900');

      if (!printWindow) {
        throw new Error('Pop-up diblokir oleh browser. Mohon izinkan pop-up untuk mencetak slip THR.');
      }

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error: any) {
      if (Swal.isVisible()) {
        Swal.close();
      }
      Swal.fire({
        icon: 'error',
        title: 'Gagal Membuka Slip THR',
        text: error?.message || 'Terjadi kesalahan saat menyiapkan slip THR'
      });
    } finally {
      setPrintingId(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setIsEditMode(false);
    setEditingId(null);
    setSelectedGuru(null);
    setIsTatapMukaFocused(false);
    setTatapMukaRawValue('');
    setFormData({
      guru_id: '',
      tahun: new Date().getFullYear().toString(),
      jumlah_tatap_muka: '',
      tatap_muka_rupiah: '',
      masa_kerja_rupiah: '',
      base_masa_kerja: '',
      masa_kerja_tahun: '',
      total_rupiah: '',
    });
  };

  // Format rupiah
  const formatRupiah = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') return 'Rp 0';
    const numValue = typeof value === 'string' ? parseInt(value.replace(/[^\d]/g, '')) || 0 : value || 0;
    return 'Rp ' + numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Format rupiah dengan desimal untuk calculator (format Indonesia: Rp 189.921,60)
  const formatRupiahDecimal = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') return 'Rp 0,00';
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
    const parts = numValue.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalPart = parts[1] || '00';
    return `Rp ${integerPart},${decimalPart}`;
  };

  // Parse format rupiah dengan desimal kembali ke angka (untuk input)
  const parseRupiahDecimal = (value: string): number => {
    if (!value) return 0;
    // Hapus "Rp " dan ganti format Indonesia (titik ribuan, koma desimal) ke format standar
    const cleaned = value
      .replace(/Rp\s?/g, '')
      .replace(/\./g, '') // Hapus titik (ribuan)
      .replace(/,/g, '.'); // Ganti koma dengan titik (desimal)
    return parseFloat(cleaned) || 0;
  };

  // Handle guru selection
  const handleGuruSelect = (selectedOption: any) => {
    if (selectedOption) {
      const guru = guruList.find(g => g.id.toString() === selectedOption.value);
      if (guru) {
        setSelectedGuru(guru);
        const masaKerjaTahun = guru.tmt ? calculateMasaKerjaTahun(guru.tmt) : 0;
        setFormData(prev => ({
          ...prev,
          guru_id: guru.id.toString(),
          tatap_muka_rupiah: (guru.tatap_muka || 0).toString(),
          masa_kerja_rupiah: formatRupiah(guru.tunjangan_masa_kerja || 0),
          base_masa_kerja: (guru.tunjangan_masa_kerja || 0).toString(),
          masa_kerja_tahun: masaKerjaTahun.toString(),
        }));
      }
    } else {
      setSelectedGuru(null);
      setFormData(prev => ({
        ...prev,
        guru_id: '',
        masa_kerja_rupiah: '',
        base_masa_kerja: '',
        masa_kerja_tahun: '',
      }));
    }
  };

  // Calculate Tatap Muka Rupiah
  const calculateTatapMuka = () => {
    const jumlah = parseFloat(calcData.jumlah_tatap_muka) || 0;
    const tarif = parseRupiahDecimal(calcData.tatap_muka_rp) || parseFloat(calcData.tatap_muka_rp.replace(/[^\d.]/g, '')) || 0;
    const hasil = jumlah * tarif;
    
    setCalcData(prev => ({ ...prev, hasil }));
    setFormData(prev => ({
      ...prev,
      jumlah_tatap_muka: calcData.jumlah_tatap_muka,
      tatap_muka_rupiah: hasil.toFixed(2),
    }));
    setShowCalculatorModal(false);
  };

  // Handle Masa Kerja Calculator Modal
  const handleOpenMasaKerjaCalculatorModal = () => {
    if (!selectedGuru) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Pilih guru terlebih dahulu'
      });
      return;
    }
    
    const baseMasaKerja = selectedGuru.tunjangan_masa_kerja || 0;
    const masaKerjaTahun = selectedGuru.tmt ? calculateMasaKerjaTahun(selectedGuru.tmt) : 0;
    
    setCalcMasaKerjaData({
      base_masa_kerja: baseMasaKerja.toString(),
      masa_kerja_tahun: masaKerjaTahun.toString(),
      hasil: 0
    });
    setShowMasaKerjaCalculatorModal(true);
  };

  // Calculate Masa Kerja Rupiah
  const calculateMasaKerja = () => {
    const baseMasaKerja = parseInt(calcMasaKerjaData.base_masa_kerja.replace(/[^\d]/g, '')) || 0;
    const masaKerjaTahun = parseInt(calcMasaKerjaData.masa_kerja_tahun) || 0;
    
    if (masaKerjaTahun <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Masa Kerja (Tahun) harus lebih dari 0 untuk melakukan kalkulasi.'
      });
      return;
    }
    
    if (baseMasaKerja <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Nilai base Masa Kerja tidak tersedia. Pastikan guru memiliki tunjangan masa kerja.'
      });
      return;
    }
    
    // Calculate: base_masa_kerja × masa_kerja_tahun
    const hasil = baseMasaKerja * masaKerjaTahun;
    const roundedResult = Math.round(hasil);
    
    setCalcMasaKerjaData(prev => ({ ...prev, hasil: roundedResult }));
    setFormData(prev => ({
      ...prev,
      masa_kerja_rupiah: formatRupiah(roundedResult),
      base_masa_kerja: baseMasaKerja.toString(),
      masa_kerja_tahun: masaKerjaTahun.toString(),
    }));
    setShowMasaKerjaCalculatorModal(false);
    
    // Auto calculate total after masa kerja calculation
    calculateTotal();
  };

  // Calculate Total Rupiah
  const calculateTotal = () => {
    const selectedGuru = guruList.find(g => g.id.toString() === formData.guru_id);
    if (!selectedGuru) return;

    const gajiPokok = selectedGuru.gaji_pokok || 0;
    // Gunakan masa_kerja_rupiah dari formData jika sudah dihitung, jika tidak gunakan dari guru
    const masaKerjaRupiah = parseInt(formData.masa_kerja_rupiah.replace(/[^\d]/g, '')) || selectedGuru.tunjangan_masa_kerja || 0;
    const tatapMukaRupiah = parseFloat(formData.tatap_muka_rupiah) || 0;
    const jabatanRupiah = selectedGuru.tunjangan_jabatan || 0;

    const total = gajiPokok + masaKerjaRupiah + Math.round(tatapMukaRupiah) + jabatanRupiah;

    setFormData(prev => ({
      ...prev,
      total_rupiah: formatRupiah(total),
    }));
  };

  // Auto calculate total when related fields change
  useEffect(() => {
    if (formData.guru_id && (formData.tatap_muka_rupiah || formData.masa_kerja_rupiah)) {
      calculateTotal();
    }
  }, [formData.guru_id, formData.tatap_muka_rupiah, formData.masa_kerja_rupiah]);

  // Export to Excel
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/thr/export?tahun=${selectedTahun}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mengambil data untuk export');
      }

      const result = await response.json();
      if (result.status !== 'success' || !result.data || !Array.isArray(result.data) || result.data.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Peringatan',
          text: 'Tidak ada data untuk diekspor'
        });
        setIsExporting(false);
        return;
      }

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Perhitungan THR');

      // Header utama
      worksheet.mergeCells(1, 1, 1, 10);
      worksheet.getCell(1, 1).value = 'Data Perhitungan THR Karyawan';
      worksheet.getCell(1, 1).font = { size: 14, bold: true };
      worksheet.getCell(1, 1).alignment = { horizontal: 'left', vertical: 'middle' };

      worksheet.mergeCells(2, 1, 2, 10);
      worksheet.getCell(2, 1).value = 'YPI Nurrahim ANNUR';
      worksheet.getCell(2, 1).font = { size: 12, bold: true };
      worksheet.getCell(2, 1).alignment = { horizontal: 'left', vertical: 'middle' };

      worksheet.mergeCells(3, 1, 3, 10);
      worksheet.getCell(3, 1).value = `Thn ${result.tahun}`;
      worksheet.getCell(3, 1).font = { size: 11 };
      worksheet.getCell(3, 1).alignment = { horizontal: 'left', vertical: 'middle' };

      // Row 4: Table headers (langsung setelah header)
      const tableHeaders = [
        'No',
        'Nama Karyawan',
        'Jabatan',
        'Masa Kerja',
        'Gaji Pokok',
        'Jabatan (Rp)',
        'Masa Kerja',
        'jml ttm',
        'Tatap Muka',
        'TOTAL'
      ];

      worksheet.getRow(4).values = tableHeaders;
      worksheet.getRow(4).font = { bold: true };
      worksheet.getRow(4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' } // Yellow
      };
      worksheet.getRow(4).alignment = { horizontal: 'center', vertical: 'middle' };

      // Set column widths
      worksheet.getColumn(1).width = 5; // No
      worksheet.getColumn(2).width = 30; // Nama
      worksheet.getColumn(3).width = 20; // Jabatan
      worksheet.getColumn(4).width = 12; // Masa Kerja
      worksheet.getColumn(5).width = 15; // Gaji Pokok
      worksheet.getColumn(6).width = 15; // Jabatan (KOMPONEN)
      worksheet.getColumn(7).width = 15; // Masa Kerja (KOMPONEN)
      worksheet.getColumn(8).width = 12; // jml ttm
      worksheet.getColumn(9).width = 18; // Tatap Muka
      worksheet.getColumn(10).width = 18; // TOTAL

      // Add data rows - pastikan data adalah array
      const exportData = Array.isArray(result.data) ? result.data : [];
      exportData.forEach((item: any, index: number) => {
        const row = 5 + index; // Start from row 5 (setelah header row 4)
        const guruId = typeof item.guru_id === 'string' ? parseInt(item.guru_id) : item.guru_id;
        const guru = guruList.find(g => g.id === guruId || g.id.toString() === item.guru_id.toString());
        const masaKerjaTahun = guru && guru.tmt ? calculateMasaKerjaTahun(guru.tmt) : item.masa_kerja_tahun || 0;
        const jabatanRupiah = guru?.tunjangan_jabatan || 0;

        worksheet.getRow(row).values = [
          index + 1,
          item.nama_lengkap || '',
          item.jabatan || '',
          masaKerjaTahun,
          item.gaji_pokok || 0,
          jabatanRupiah,
          item.masa_kerja_rupiah || 0,
          item.jumlah_tatap_muka || 0,
          item.tatap_muka_rupiah || 0,
          item.total_rupiah || 0
        ];

        // Format number columns
        [5, 6, 7, 8, 9, 10].forEach(col => {
          const cell = worksheet.getCell(row, col);
          cell.numFmt = '#,##0';
        });
      });

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Data_Perhitungan_THR_${result.tahun}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data THR berhasil diekspor ke Excel'
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Gagal mengekspor data THR'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Open Excel Modal
  const handleOpenExcelModal = () => {
    // Reset filter dan data
    const now = new Date();
    setExcelNamaBank('');
    setExcelTahun(selectedTahun || now.getFullYear().toString());
    setExcelNomorSurat('842.3/107/YPIN/VI/2025');
    setExcelNamaBendahara('');
    setShowExcelModal(true);
  };

  // Export to Excel (Laporan ke Bank)
  const handleExportCSV = async () => {
    if (!excelNamaBank || !excelTahun) {
      Swal.fire('Peringatan', 'Nama Bank dan Tahun harus diisi', 'warning');
      return;
    }

    // Validasi khusus untuk bank Tunai
    if (excelNamaBank === 'Tunai') {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Bank "Tunai" tidak memiliki data rekening. Silakan pilih bank lain (BSI atau BJB Syariah).',
        confirmButtonText: 'OK'
      });
      return;
    }

    setExportLoading(true);

    try {
      Swal.fire({
        title: 'Memproses Export',
        text: 'Sedang memproses data THR...',
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false
      });

      // Filter THR data berdasarkan tahun
      const thrDataByTahun = thrList.filter(item => item.tahun.toString() === excelTahun);
      
      if (thrDataByTahun.length === 0) {
        throw new Error(`Tidak ada data THR untuk tahun ${excelTahun}.`);
      }

      // Filter berdasarkan nama bank dan ambil data rekening dari guru
      const exportData = thrDataByTahun
        .map(item => {
          const guruId = typeof item.guru_id === 'string' ? parseInt(item.guru_id) : item.guru_id;
          const guru = guruList.find(g => g.id === guruId || g.id.toString() === item.guru_id.toString());
          
          // Filter berdasarkan nama bank
          if (guru && guru.nama_bank === excelNamaBank && guru.no_rekening) {
            return {
              no: 0, // Will be set later
              nama_nasabah: item.nama_lengkap || guru.nama_lengkap || '',
              no_rekening: guru.no_rekening || '',
              jumlah_gaji: item.total_rupiah || 0
            };
          }
          return null;
        })
        .filter((item): item is { no: number; nama_nasabah: string; no_rekening: string; jumlah_gaji: number } => item !== null);

      if (exportData.length === 0) {
        throw new Error(`Tidak ada data THR untuk bank "${excelNamaBank}" pada tahun ${excelTahun}. Pastikan ada guru yang memiliki rekening di bank tersebut.`);
      }

      // Set nomor urut
      exportData.forEach((item, index) => {
        item.no = index + 1;
      });

      // Format tanggal untuk display (gunakan tanggal hari ini)
      const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      const nomorSuratValue = excelNomorSurat || '842.3/107/YPIN/VI/2025';
      const tahunValue = excelTahun;
      
      // Calculate total gaji
      const totalGaji = exportData.reduce((sum, item) => sum + (item.jumlah_gaji || 0), 0);

      // Buat workbook baru dengan ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Rekening BBJS');

      // Load logo yayasan dari server
      let logoBuffer: ArrayBuffer | null = null;
      try {
        const baseUrl = import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001';
        const logoUrl = `${baseUrl}/lgo.png`;
        
        const logoResponse = await fetch(logoUrl);
        if (logoResponse.ok) {
          logoBuffer = await logoResponse.arrayBuffer();
        }
      } catch (error) {
        console.warn('Logo tidak dapat dimuat:', error);
      }

      let currentRow = 1;

      // Header - Logo/Title dengan ukuran cell yang lebih besar
      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = 'YAYASAN PENDIDIKAN ISLAM NURRAHIM ANNUR';
      worksheet.getCell(currentRow, 1).font = { size: 16, bold: true };
      worksheet.getCell(currentRow, 1).alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Perbesar height row untuk logo (180px untuk logo + padding)
      worksheet.getRow(currentRow).height = 180;
      
      // Tambahkan logo jika berhasil dimuat
      if (logoBuffer) {
        try {
          const imageId = workbook.addImage({
            buffer: logoBuffer,
            extension: 'png',
          });
          // Tambahkan logo di tengah header (kolom 1-6, row 1)
          // Posisi: mulai dari kolom 0 (A), row 0 (index 0), lebar 6 kolom, tinggi sesuai row
          worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 }, // Top-left: kolom A (0), row 1 (0)
            ext: { width: 800, height: 180 } // Ukuran logo: 800px width, 180px height (diperbesar)
          });
        } catch (error) {
          console.warn('Error adding logo to Excel:', error);
        }
      }
      
      currentRow++;

      // Empty row
      currentRow++;

      // Nomor dan Tanggal
      worksheet.mergeCells(currentRow, 1, currentRow, 3);
      worksheet.getCell(currentRow, 1).value = `Nomor : ${nomorSuratValue}`;
      worksheet.getCell(currentRow, 1).font = { bold: true };
      
      worksheet.mergeCells(currentRow, 4, currentRow, 6);
      worksheet.getCell(currentRow, 4).value = `Cikarang, ${today}`;
      worksheet.getCell(currentRow, 4).alignment = { horizontal: 'right' };
      worksheet.getRow(currentRow).height = 20;
      currentRow++;

      // Perihal
      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = 'Perihal : Surat Perintah Pembayaran';
      worksheet.getCell(currentRow, 1).font = { bold: true };
      worksheet.getRow(currentRow).height = 20;
      currentRow++;

      // Empty row
      worksheet.getRow(currentRow).height = 10;
      currentRow++;

      // Kepada Yth
      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = 'Kepada Yth :';
      worksheet.getCell(currentRow, 1).font = { bold: true };
      worksheet.getRow(currentRow).height = 20;
      currentRow++;
      
      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = excelNamaBank || 'Bank BJB Syariah';
      worksheet.getRow(currentRow).height = 20;
      currentRow++;
      
      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = 'Cabang Bekasi';
      worksheet.getRow(currentRow).height = 20;
      currentRow++;

      // Empty row
      worksheet.getRow(currentRow).height = 10;
      currentRow++;

      // Letter body - Assalamu'alaikum
      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = "Assalamu'alaikum wr...wb";
      worksheet.getRow(currentRow).height = 20;
      currentRow++;

      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = "Teriring salam semoga Allah SWT senantiasa melindungi dan memberkahi segala aktifitas kita.";
      worksheet.getCell(currentRow, 1).alignment = { wrapText: true, vertical: 'top' };
      worksheet.getRow(currentRow).height = 30;
      currentRow++;

      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = "Sholawat serta salam kita sampaikan kepada teladan dan junjungan kita Nabi Muhammad SAW.";
      worksheet.getCell(currentRow, 1).alignment = { wrapText: true, vertical: 'top' };
      worksheet.getRow(currentRow).height = 30;
      currentRow++;

      // Buat rich text dengan "Tunjangan Hari Raya (THR)" berwarna merah
      const letterParagraphText = `Sehubungan dengan adanya MOU antara ${excelNamaBank || 'Bank BJB Syariah'} Cabang Bekasi dengan yayasan Pendidikan Islam Nurrahim ANNUR dengan nomor MOU 2331/S-BKS/2015, maka dengan ini kami informasikan nomor rekening pegawai yang mengambil pembiayaan di ${excelNamaBank || 'Bank BJB Syariah'} Cabang Bekasi sebagai rekening pembayaran Tunjangan Hari Raya (THR) sesuai dengan MOU yang telah kita sepakati bersama. Adapun nama-namanya sebagai berikut:`;
      
      // Split teks untuk membuat rich text dengan "Tunjangan Hari Raya (THR)" berwarna merah
      const textBefore = letterParagraphText.split('Tunjangan Hari Raya (THR)')[0];
      const textAfter = letterParagraphText.split('Tunjangan Hari Raya (THR)')[1];
      
      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = {
        richText: [
          { text: textBefore },
          { text: 'Tunjangan Hari Raya (THR)', font: { color: { argb: 'FFFF0000' } } },
          { text: textAfter }
        ]
      };
      worksheet.getCell(currentRow, 1).alignment = { wrapText: true, vertical: 'top' };
      worksheet.getRow(currentRow).height = 50;
      currentRow++;

      // Empty row
      currentRow++;

      // Table Header
      const headers = ['No', 'Nama Nasabah', 'Nomor Rekening', 'Jumlah Gaji Bersih'];
      const headerRow = worksheet.addRow([headers[0], headers[1], headers[2], headers[3]]);
      
      // Style header row
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF333333' }
      };
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.height = 25;
      
      // Align jumlah gaji header to right
      headerRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
      currentRow++;

      // Data rows
      exportData.forEach((item) => {
        const dataRow = worksheet.addRow([
          item.no,
          item.nama_nasabah,
          item.no_rekening,
          item.jumlah_gaji
        ]);
        
        // Center align untuk kolom No
        dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        
        // Wrap text untuk kolom nama nasabah
        dataRow.getCell(2).alignment = { vertical: 'middle', wrapText: true };
        
        // Right align untuk kolom jumlah gaji
        dataRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
        dataRow.getCell(4).numFmt = '#,##0';
        
        // Set row height
        dataRow.height = 25;
        
        // Alternate row color
        if (item.no % 2 === 0) {
          dataRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
          };
        }
        currentRow++;
      });

      // Total row
      const totalRow = worksheet.addRow(['', '', 'TOTAL :', totalGaji]);
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      totalRow.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
      totalRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
      totalRow.getCell(4).numFmt = '#,##0';
      totalRow.height = 25;
      currentRow++;

      // Empty row
      currentRow++;

      // Closing paragraph
      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = "Demikian kami sampaikan, atas perhatiannya diucapkan terima kasih.";
      worksheet.getCell(currentRow, 1).alignment = { wrapText: true, vertical: 'top' };
      worksheet.getRow(currentRow).height = 25;
      currentRow++;

      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = "Wassalamu'alaikum wr...wb";
      worksheet.getRow(currentRow).height = 20;
      currentRow++;

      // Empty rows for signature space
      worksheet.getRow(currentRow).height = 15;
      currentRow++;
      worksheet.getRow(currentRow).height = 15;
      currentRow++;

      // Signature section
      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = `Cikarang, ${today}`;
      worksheet.getCell(currentRow, 1).alignment = { horizontal: 'left' };
      worksheet.getRow(currentRow).height = 20;
      currentRow++;

      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = 'Hormat kami,';
      worksheet.getCell(currentRow, 1).font = { bold: true };
      worksheet.getCell(currentRow, 1).alignment = { horizontal: 'left' };
      worksheet.getRow(currentRow).height = 20;
      currentRow++;
      // Empty space untuk tanda tangan
      worksheet.getRow(currentRow).height = 20;
      currentRow++;
      worksheet.getRow(currentRow).height = 20;
      currentRow++;
      worksheet.getRow(currentRow).height = 20;
      currentRow++;

      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = excelNamaBendahara || 'Bendahara YPI Nurrahim Annur';
      worksheet.getCell(currentRow, 1).font = { bold: true, underline: true };
      worksheet.getCell(currentRow, 1).alignment = { horizontal: 'left' };
      worksheet.getRow(currentRow).height = 25;
      currentRow++;

      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = 'Bendahara';
      worksheet.getCell(currentRow, 1).alignment = { horizontal: 'left' };
      worksheet.getRow(currentRow).height = 20;

      // Set column widths - diperbesar untuk header logo
      // Total width untuk header: 6 kolom merge untuk logo
      worksheet.getColumn(1).width = 15;  // No (diperbesar untuk header)
      worksheet.getColumn(2).width = 25;  // Nama Nasabah (diperbesar untuk header)
      worksheet.getColumn(3).width = 25;  // Nomor Rekening (diperbesar untuk header)
      worksheet.getColumn(4).width = 25;  // Jumlah Gaji Bersih (diperbesar untuk header)
      worksheet.getColumn(5).width = 10;  // Spacing (diperbesar untuk header)
      worksheet.getColumn(6).width = 10;  // Spacing (diperbesar untuk header)
      // Total: 15 + 25 + 25 + 25 + 10 + 10 = 110 characters (lebih lebar untuk logo)

      // Page setup untuk print preview - pas dengan halaman A4
      worksheet.pageSetup = {
        paperSize: 9, // A4
        orientation: 'portrait', // Portrait orientation
        fitToPage: false, // Tidak menggunakan fitToPage agar column widths dipertahankan
        fitToWidth: 1, // Fit to 1 page width - ini akan auto scale jika perlu
        fitToHeight: 0, // 0 = tidak fit height, bisa lebih dari 1 halaman
        scale: 100, // Scale 100% - bisa disesuaikan jika perlu
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3
        },
        printArea: `A1:F${currentRow}`, // Set print area hingga baris terakhir
        showGridLines: false, // Sembunyikan grid lines untuk tampilan lebih rapi
      };

      // Generate buffer dan download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rekening_BBJS_THR_${excelNamaBank.replace(/\s+/g, '_')}_${tahunValue}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      Swal.close();
      setShowExcelModal(false);
      Swal.fire('Sukses', `Dokumen Excel berhasil dibuat (${exportData.length} guru)`, 'success');
    } catch (error) {
      console.error('Error exporting rekening BBJS to Excel:', error);
      
      // Pesan error yang lebih informatif
      let errorMessage = 'Gagal mengexport rekening BBJS ke Excel';
      
      if (error instanceof Error) {
        if (error.message.includes('Unexpected token')) {
          errorMessage = 'Server mengembalikan respons yang tidak valid. Pastikan server berjalan dengan baik dan coba lagi.';
        } else if (error.message.includes('Tidak ada data')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error Export Excel',
        html: `<div class="text-left">
          <p class="mb-2"><strong>Terjadi kesalahan:</strong></p>
          <p class="text-sm">${errorMessage}</p>
          ${excelNamaBank === 'Tunai' ? '<p class="mt-3 text-sm text-orange-600"><strong>Catatan:</strong> Bank "Tunai" tidak memiliki data rekening. Silakan pilih bank lain.</p>' : ''}
        </div>`,
        confirmButtonText: 'OK',
        width: '500px'
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Guru options for select
  const guruOptions = Array.isArray(guruList) 
    ? guruList.map(guru => ({
        value: guru.id.toString(),
        label: `${guru.nip} - ${guru.nama_lengkap}`,
        guru: guru
      }))
    : [];

  return (
    <PayrollLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tunjangan Hari Raya (THR)</h1>
            <p className="text-sm text-slate-600 mt-1">Kelola data THR karyawan</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleOpenExcelModal}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <BanknotesIcon className="w-5 h-5" />
              Laporan ke Bank
            </button>
            <button
              onClick={handleExportExcel}
              disabled={isExporting || filteredThrList.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              {isExporting ? 'Mengekspor...' : 'Export Excel'}
            </button>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              Tambah THR
            </button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Tahun</label>
              <select
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Cari</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau jabatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-white">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-slate-600">Memuat data...</p>
            </div>
          ) : !Array.isArray(filteredThrList) || filteredThrList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">Tidak ada data THR untuk tahun {selectedTahun}</p>
              <p className="text-sm text-slate-500">Klik tombol "Tambah THR" untuk menambahkan data baru</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white">
                <thead>
                  <tr className="bg-white border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Nama Karyawan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Jabatan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Masa Kerja (Thn)</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase">Gaji Pokok</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase">Jabatan (Rp)</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase">Masa Kerja (Rp)</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-700 uppercase">Jml TTM</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase">Tatap Muka (Rp)</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase">Total (Rp)</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-700 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(Array.isArray(filteredThrList) ? filteredThrList : []).map((item, index) => (
                    <tr key={item.id} className="bg-white hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{item.nama_lengkap}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.jabatan || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.masa_kerja_tahun}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right">{formatRupiah(item.gaji_pokok)}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right">
                        {formatRupiah((() => {
                          const guruId = typeof item.guru_id === 'string' ? parseInt(item.guru_id) : item.guru_id;
                          const guru = guruList.find(g => {
                            const matchById = g.id === guruId;
                            const matchByString = g.id.toString() === item.guru_id.toString();
                            return matchById || matchByString;
                          });
                          const jabatanRupiah = guru?.tunjangan_jabatan ?? 0;
                          if (!guru && guruList.length > 0) {
                            console.warn(`Guru not found for guru_id: ${item.guru_id} (type: ${typeof item.guru_id})`);
                          }
                          return jabatanRupiah;
                        })())}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right">{formatRupiah(item.masa_kerja_rupiah)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-center">{item.jumlah_tatap_muka}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right">{formatRupiah(item.tatap_muka_rupiah)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">{formatRupiah(item.total_rupiah)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handlePrintTHR(item)}
                            disabled={printingId === item.id}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            title={printingId === item.id ? 'Sedang menyiapkan slip...' : 'Cetak Slip THR'}
                          >
                            <PrinterIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditMode ? 'Edit Data THR' : 'Tambah Data THR'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Guru</label>
            <Select
              options={guruOptions}
              onChange={handleGuruSelect}
              value={formData.guru_id ? {
                value: formData.guru_id,
                label: guruList.find(g => g.id.toString() === formData.guru_id) 
                  ? `${guruList.find(g => g.id.toString() === formData.guru_id)!.nip} - ${guruList.find(g => g.id.toString() === formData.guru_id)!.nama_lengkap}`
                  : 'Pilih Guru'
              } : null}
              placeholder="Ketik untuk mencari guru..."
              isClearable
              isSearchable
              isLoading={loadingGuru}
              isDisabled={loadingGuru || isEditMode}
              noOptionsMessage={() => "Tidak ada data guru"}
              loadingMessage={() => "Memuat data..."}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '48px',
                  borderRadius: '0.5rem',
                  borderColor: '#cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  '&:hover': {
                    borderColor: '#3b82f6'
                  }
                }),
                input: (base) => ({
                  ...base,
                  color: '#0f172a'
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#0f172a'
                }),
                placeholder: (base) => ({
                  ...base,
                  color: '#64748b'
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                  backgroundColor: '#ffffff'
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#f1f5f9' : '#ffffff',
                  color: '#0f172a',
                  '&:active': {
                    backgroundColor: '#e2e8f0'
                  }
                })
              }}
            />
          </div>

          {/* Informasi Guru - Auto-fill dari guru yang dipilih */}
          {selectedGuru && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jabatan</label>
                <input
                  type="text"
                  value={selectedGuru.jabatan_nama || '-'}
                  readOnly
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Masa Kerja (Tahun)</label>
                <input
                  type="number"
                  value={formData.masa_kerja_tahun || (selectedGuru.tmt ? calculateMasaKerjaTahun(selectedGuru.tmt).toString() : '0')}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, masa_kerja_tahun: value }));
                  }}
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Gaji Pokok</label>
                <input
                  type="text"
                  value={formatRupiah(selectedGuru.gaji_pokok || 0)}
                  readOnly
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jabatan (Rp)</label>
                <input
                  type="text"
                  value={formatRupiah(selectedGuru.tunjangan_jabatan || 0)}
                  readOnly
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Masa Kerja (Rupiah)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.masa_kerja_rupiah || formatRupiah(selectedGuru.tunjangan_masa_kerja || 0)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, '');
                      setFormData(prev => ({ ...prev, masa_kerja_rupiah: value ? formatRupiah(parseInt(value)) : '' }));
                    }}
                    className="flex-1 px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Rp 0"
                  />
                  <button
                    onClick={handleOpenMasaKerjaCalculatorModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    title="Calculator Masa Kerja"
                  >
                    <CalculatorIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">💡 Klik calculator untuk menghitung: base_masa_kerja × masa_kerja_tahun</p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tahun</label>
            <input
              type="number"
              value={formData.tahun}
              onChange={(e) => setFormData(prev => ({ ...prev, tahun: e.target.value }))}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="2020"
              max="2100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah Tatap Muka</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.jumlah_tatap_muka}
                onChange={(e) => setFormData(prev => ({ ...prev, jumlah_tatap_muka: e.target.value }))}
                className="flex-1 px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                placeholder="Masukkan jumlah tatap muka"
              />
              {/* <button
                onClick={() => setShowCalculatorModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                title="Calculator"
              >
                <CalculatorIcon className="w-5 h-5" />
              </button> */}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tatap Muka dalam Rupiah</label>
            <input
              type="text"
              value={isTatapMukaFocused ? tatapMukaRawValue : (formData.tatap_muka_rupiah ? formatRupiahDecimal(parseFloat(formData.tatap_muka_rupiah)) : '')}
              onFocus={() => {
                setIsTatapMukaFocused(true);
                // Saat focus, tampilkan raw value untuk editing
                const currentValue = formData.tatap_muka_rupiah;
                if (currentValue) {
                  // Parse formatted value ke raw
                  const raw = parseRupiahDecimal(formatRupiahDecimal(parseFloat(currentValue))).toFixed(2).replace('.', ',');
                  setTatapMukaRawValue(raw);
                } else {
                  setTatapMukaRawValue('');
                }
              }}
              onChange={(e) => {
                const inputValue = e.target.value;
                // Hapus "Rp " dan spasi
                let cleaned = inputValue.replace(/Rp\s?/g, '').trim();
                
                // Jika kosong, set kosong
                if (!cleaned) {
                  setTatapMukaRawValue('');
                  setFormData(prev => ({ ...prev, tatap_muka_rupiah: '' }));
                  return;
                }
                
                // Izinkan hanya angka, titik, dan koma untuk decimal
                cleaned = cleaned.replace(/[^\d,.]/g, '');
                
                // Simpan raw value untuk display
                setTatapMukaRawValue(cleaned);
                
                // Parse untuk simpan angka di state
                const numValue = parseRupiahDecimal(cleaned);
                setFormData(prev => ({ ...prev, tatap_muka_rupiah: numValue >= 0 && !isNaN(numValue) ? numValue.toString() : '' }));
              }}
              onBlur={(e) => {
                setIsTatapMukaFocused(false);
                // Parse dan format saat blur
                const inputValue = e.target.value;
                const cleaned = inputValue.replace(/Rp\s?/g, '').trim();
                
                if (!cleaned) {
                  setTatapMukaRawValue('');
                  setFormData(prev => ({ ...prev, tatap_muka_rupiah: '' }));
                  return;
                }
                
                // Parse nilai
                const numValue = parseRupiahDecimal(cleaned);
                if (numValue >= 0 && !isNaN(numValue)) {
                  // Simpan angka di state (termasuk 0)
                  setFormData(prev => ({ ...prev, tatap_muka_rupiah: numValue.toString() }));
                  // Clear raw value (akan di-format di value display)
                  setTatapMukaRawValue('');
                } else {
                  setTatapMukaRawValue('');
                  setFormData(prev => ({ ...prev, tatap_muka_rupiah: '' }));
                }
              }}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Total dalam Rupiah</label>
            <input
              type="text"
              value={formData.total_rupiah}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, '');
                setFormData(prev => ({ ...prev, total_rupiah: value ? formatRupiah(parseInt(value)) : '' }));
              }}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Rp 0"
            />
            <button
              onClick={calculateTotal}
              className="mt-2 text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium"
            >
              Hitung Total Otomatis
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isEditMode ? 'Update' : 'Simpan'}
            </button>
            <button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      </Modal>

      {/* Calculator Modal */}
      <Modal
        isOpen={showCalculatorModal}
        onClose={() => setShowCalculatorModal(false)}
        title="Calculator Tatap Muka"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah Tatap Muka</label>
            <input
              type="number"
              value={calcData.jumlah_tatap_muka}
              onChange={(e) => setCalcData(prev => ({ ...prev, jumlah_tatap_muka: e.target.value }))}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tatap Muka (Rp)</label>
            <input
              type="number"
              step="0.01"
              value={calcData.tatap_muka_rp}
              onChange={(e) => {
                const value = e.target.value;
                setCalcData(prev => ({ ...prev, tatap_muka_rp: value }));
              }}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-slate-700 mb-2">Hasil</label>
            <p className="text-2xl font-bold text-slate-900">{formatRupiahDecimal(calcData.hasil)}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={calculateTatapMuka}
              disabled={!calcData.jumlah_tatap_muka || !calcData.tatap_muka_rp}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Gunakan Hasil
            </button>
            <button
              onClick={() => {
                setCalcData({ jumlah_tatap_muka: '', tatap_muka_rp: '', hasil: 0 });
                setShowCalculatorModal(false);
              }}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      </Modal>

      {/* Calculator Masa Kerja Modal */}
      <Modal
        isOpen={showMasaKerjaCalculatorModal}
        onClose={() => setShowMasaKerjaCalculatorModal(false)}
        title="Calculator Masa Kerja"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Base Masa Kerja (Rp)</label>
            <input
              type="text"
              value={calcMasaKerjaData.base_masa_kerja ? formatRupiah(parseInt(calcMasaKerjaData.base_masa_kerja.replace(/[^\d]/g, ''))) : ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, '');
                setCalcMasaKerjaData(prev => ({ ...prev, base_masa_kerja: value }));
              }}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Rp 0"
            />
            <p className="text-xs text-slate-500 mt-1">Nilai base dari tunjangan masa kerja guru</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Masa Kerja (Tahun)</label>
            <input
              type="number"
              value={calcMasaKerjaData.masa_kerja_tahun}
              onChange={(e) => setCalcMasaKerjaData(prev => ({ ...prev, masa_kerja_tahun: e.target.value }))}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              placeholder="0"
            />
            <p className="text-xs text-slate-500 mt-1">Jumlah tahun masa kerja dari TMT</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-slate-700 mb-2">Hasil (Base × Tahun)</label>
            <p className="text-2xl font-bold text-slate-900">
              {calcMasaKerjaData.base_masa_kerja && calcMasaKerjaData.masa_kerja_tahun
                ? formatRupiah(
                    Math.round(
                      (parseInt(calcMasaKerjaData.base_masa_kerja.replace(/[^\d]/g, '')) || 0) *
                      (parseInt(calcMasaKerjaData.masa_kerja_tahun) || 0)
                    )
                  )
                : 'Rp 0'}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={calculateMasaKerja}
              disabled={!calcMasaKerjaData.base_masa_kerja || !calcMasaKerjaData.masa_kerja_tahun || parseInt(calcMasaKerjaData.masa_kerja_tahun) <= 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Gunakan Hasil
            </button>
            <button
              onClick={() => {
                setCalcMasaKerjaData({ base_masa_kerja: '', masa_kerja_tahun: '', hasil: 0 });
                setShowMasaKerjaCalculatorModal(false);
              }}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      </Modal>

      {/* Excel Modal */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl border-0 shadow-lg bg-white">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Export Excel THR Laporan ke Bank</h2>
                <p className="text-sm text-slate-600 mt-1">Pilih filter untuk export rekening ke Excel</p>
              </div>
              <button
                onClick={() => setShowExcelModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-white">
              {/* Filter Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Bank */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Nama Bank <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={excelNamaBank}
                    onChange={(e) => setExcelNamaBank(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black transition-all duration-200"
                  >
                    <option value="">Pilih Bank</option>
                    <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                    <option value="BJB Syariah">BJB Syariah</option>
                    <option value="Tunai">Tunai</option>
                  </select>
                </div>

                {/* Periode Tahun */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Periode Tahun <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={excelTahun}
                    onChange={(e) => setExcelTahun(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black transition-all duration-200"
                  >
                    <option value="">Pilih Tahun</option>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((tahun) => (
                      <option key={tahun} value={tahun}>
                        {tahun}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nomor Surat */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Nomor Surat
                  </label>
                  <input
                    type="text"
                    value={excelNomorSurat}
                    onChange={(e) => setExcelNomorSurat(e.target.value)}
                    placeholder="Input Nomor Surat"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black transition-all duration-200"
                  />
                </div>

                {/* Nama Bendahara */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Bendahara
                  </label>
                  <input
                    type="text"
                    value={excelNamaBendahara}
                    onChange={(e) => setExcelNamaBendahara(e.target.value)}
                    placeholder="Input Nama Bendahara"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black transition-all duration-200"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ Sistem akan langsung export semua guru yang memiliki rekening di bank yang dipilih untuk periode tersebut.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3">
              <Button
                onClick={() => setShowExcelModal(false)}
                disabled={exportLoading}
                className="bg-slate-300 text-slate-700 hover:bg-slate-400 disabled:opacity-50"
              >
                Batal
              </Button>
              <Button
                onClick={handleExportCSV}
                disabled={!excelNamaBank || !excelTahun || exportLoading}
                className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {exportLoading ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Export Excel</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PayrollLayout>
  );
};

export default THR;
