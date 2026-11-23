import React, { useState, useRef, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import Select from 'react-select';
import ExcelJS from 'exceljs';
import PayrollLayout from '../../components/Payroll/PayrollLayout';
import Card from '../../components/common/UI/Card';
import Button from '../../components/common/UI/Button';
import Modal from '../../components/common/UI/Modal';
import Table from '../../components/common/UI/Table';
import SlipGajiTemplate from '../../components/Payroll/SlipGajiTemplate';
import Swal from 'sweetalert2';
import {
  DocumentTextIcon,
  BanknotesIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  UserIcon,
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  CogIcon,
  MinusIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SlipGaji {
  id: string;
  nip: string;
  nama: string;
  divisi: string;
  jabatan: string;
  periode: string;
  
  // Pendapatan - Gaji Dasar & Tunjangan
  gajiPokok: number;
  tunjanganJabatan: number;
  masaKerja: number;
  waliKelas: number;
  koordinator: number;
  tatapmuka: number;
  tatapMukaPengganti: number;
  tunjanganKeluarga: number;
  tunjanganLain: number;
  transport: number;
  transport1?: number;
  transport2?: number;
  jmlHariTransport1?: number;
  jmlHariTransport2?: number;
  totalTransport?: number;
  totalTransport2?: number;
  makan: number;
  jamsostek: number;
  bpjs: number;
  overtime: number;
  
  // Insentif
  pramuka: number;
  ekskul: number;
  bimbel: number;
  proyek: number;
  insentifPramuka: number;
  insentifEkskul: number;
  insentifProyek: number;
  insentifBimbel: number;
  insentifLain: number;
  
  // Lembur
  lemburHari: number;
  gajiLembur: number;
  
  // Total Pendapatan
  totalPendapatan: number;
  
  // Potongan Standar
  potonganYayasan: number;
  potonganLain: number;
  potonganKoperasiWajib: number;
  potonganKoperasiSukarela: number;
  potonganAngsuranKoperasi: number;
  depositAnnurmart: number;
  potonganJHT: number;
  potonganPPH21: number;
  potonganTMukaPengganti: number;
  
  // Potongan Lain
  potonganBPJS: number;
  potonganPajak: number;
  potonganAbsen: number;
  
  // Total Potongan & Net
  totalPotongan: number;
  gajiDiterima: number;
  totalGaji: number; // Total gaji sebelum potongan (total_gaji dari backend)
  status: 'Draft' | 'Disetujui' | 'Dibayar';
  tanggalGenerate: string;
  tanggalBayar?: string;
  namaBank?: string;
  noRekening?: string;
  memo?: string; // Field memo untuk catatan
}

interface Guru {
  id: number;
  nama_lengkap: string;
  nip: string;
  email: string;
  jabatan_nama: string;
  unit_sekolah_nama: string;
  status: string;
  // Payroll fields
  gaji_pokok?: number;
  tunjangan_jabatan?: number;
  tunjangan_masa_kerja?: number;
  wali_kelas?: number;
  koordinator?: number;
  tatap_muka?: number;
  t_muka_pengganti?: number;
  tunj_keluarga?: number;
  transport1?: number;
  transport2?: number;
  makan?: number;
  jamsostek?: number;
  overtime?: number;
  pramuka?: number;
  tunj_lain?: number;
  ekskul?: number;
  bpjs?: number;
  bimbel?: number;
  proyek?: number;
  insentif_peng_pramuka?: number;
  insentif_peng_ekskul?: number;
  insentif_peng_proyek?: number;
  insentif_pengurus_bimbel?: number;
  insentif_lain?: number;
  potongan_yayasan?: number;
  potongan_lain?: number;
  potongan_koperasi_wajib?: number;
  potongan_koperasi_sukarela?: number;
  potongan_angsuran_koperasi?: number;
  deposit_annurmart?: number;
  potongan_jht?: number;
  potongan_pph21?: number;
  potongan_t_muka_pengganti?: number;
  nama_bank?: string;
  no_rekening?: string;
  masa_kerja_guru?: number;
  tmt?: string;
}

// Fungsi format rupiah
function formatRupiah(value: string | number): string {
  let numberString = String(value).replace(/[^\d]/g, '');
  if (!numberString) return '';
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Fungsi untuk menghitung masa kerja
function calculateMasaKerja(tmtDate: string): string {
  if (!tmtDate) return "0 bulan";
  
  try {
    const today = new Date();
    const tmt = new Date(tmtDate);
    
    // Check if date is valid
    if (isNaN(tmt.getTime())) {
      return "0 bulan";
    }
    
    // If TMT is in the future
    if (today < tmt) {
      return "0 bulan";
    }
    
    // Simple and reliable calculation
    let years = today.getFullYear() - tmt.getFullYear();
    let months = today.getMonth() - tmt.getMonth();
    let days = today.getDate() - tmt.getDate();
    
    // Adjust for negative days
    if (days < 0) {
      months--;
      // Get days in previous month
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // If less than 1 month, calculate days
    if (years === 0 && months === 0) {
      const diffTime = today.getTime() - tmt.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return "1 hari";
      } else if (diffDays < 30) {
        return `${diffDays} hari`;
      } else {
        return "1 bulan";
      }
    }
    
    if (years > 0) {
      return months > 0 ? `${years} tahun ${months} bulan` : `${years} tahun`;
    } else {
      return `${months} bulan`;
    }
  } catch (error) {
    console.error('Error calculating masa kerja:', error);
    return "0 bulan";
  }
}

// Fungsi untuk mendapatkan hanya jumlah tahun dari TMT
function getYearsFromTMT(tmtDate: string): number {
  if (!tmtDate) return 0;
  
  try {
    const today = new Date();
    const tmt = new Date(tmtDate);
    
    // Check if date is valid
    if (isNaN(tmt.getTime())) {
      return 0;
    }
    
    // If TMT is in the future
    if (today < tmt) {
      return 0;
    }
    
    // Calculate years
    let years = today.getFullYear() - tmt.getFullYear();
    let months = today.getMonth() - tmt.getMonth();
    let days = today.getDate() - tmt.getDate();
    
    // Adjust for negative days
    if (days < 0) {
      months--;
    }
    
    // Adjust for negative months
    if (months < 0) {
      years--;
    }
    
    return Math.max(0, years);
  } catch (error) {
    console.error('Error calculating years from TMT:', error);
    return 0;
  }
}

const SlipGaji: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null);
  const [loadingGuru, setLoadingGuru] = useState(false);
  const [slipData, setSlipData] = useState<SlipGaji[]>([]);
  const [loadingSlipData, setLoadingSlipData] = useState(false);

  const [searchInputValue, setSearchInputValue] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSetupPayrollModal, setShowSetupPayrollModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPayrollId, setEditPayrollId] = useState<string | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<SlipGaji | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [templateType, setTemplateType] = useState<'formal' | 'modern' | 'minimalist'>('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [generatePeriode, setGeneratePeriode] = useState('');
  const [bulkStatus, setBulkStatus] = useState<'draft' | 'approved' | 'paid'>('draft');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [potonganList, setPotonganList] = useState([
    { nama_potongan: '', jumlah_potongan: '' }
  ]);

  // State untuk modal Tatap Muka Calculator
  const [showTatapMukaModal, setShowTatapMukaModal] = useState(false);
  const [jamInput, setJamInput] = useState('');

  // State untuk modal Potongan Tatap Muka Pengganti Calculator
  const [showPotonganTMukaModal, setShowPotonganTMukaModal] = useState(false);
  const [jamPotonganInput, setJamPotonganInput] = useState('');

  // State untuk modal Pramuka Calculator
  const [showPramukaModal, setShowPramukaModal] = useState(false);
  const [jamPramukaInput, setJamPramukaInput] = useState('');

  // State untuk modal Tatap Muka Pengganti Calculator
  const [showTMukaPenggantiModal, setShowTMukaPenggantiModal] = useState(false);
  const [jamTMukaPenggantiInput, setJamTMukaPenggantiInput] = useState('');

  // State untuk modal Makan, Ekskul, Bimbel, Proyek Calculator
  const [showMakanModal, setShowMakanModal] = useState(false);
  const [jamMakanInput, setJamMakanInput] = useState('');
  const [showEkskulModal, setShowEkskulModal] = useState(false);
  const [jamEkskulInput, setJamEkskulInput] = useState('');
  const [showBimbelModal, setShowBimbelModal] = useState(false);
  const [jamBimbelInput, setJamBimbelInput] = useState('');
  const [showProyekModal, setShowProyekModal] = useState(false);
  const [jamProyekInput, setJamProyekInput] = useState('');

  // State untuk loading Jumlah Hari Hadir
  const [isLoadingJumlahHari, setIsLoadingJumlahHari] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingLaporanYayasan, setIsExportingLaporanYayasan] = useState(false);

  const initialPayrollForm = {
    guru_id: '',
    nama_lengkap: '',
    unit_sekolah_nama: '',
    jabatan_nama: '',
    gaji_pokok: 0,
    jabatan: 0,
    masa_kerja: 0,
    masa_kerja_tahun: 0,
    base_masa_kerja: 0, // Base value untuk kalkulasi
    wali_kelas: 0,
    koordinator: 0,
    tatap_muka: '0',
    base_tatap_muka: '0', // Base value untuk kalkulasi
    t_muka_pengganti: '0',
    base_t_muka_pengganti: '0', // Base value untuk kalkulasi
    tunj_keluarga: 0,
    tunj_lain: 0,
    transport1: 0,
    transport2: 0,
    makan: 0,
    base_makan: 0, // Base value untuk kalkulasi
    makan_hari: 0,
    jamsostek: 0,
    overtime: 0,
    overtime_hari: 0,
    pramuka: 0,
    base_pramuka: 0, // Base value untuk kalkulasi
    jml_jam_pramuka: 0,
    ekskul: 0,
    base_ekskul: 0, // Base value untuk kalkulasi
    jml_jam_insentif_ekskul: 0,
    bpjs: 0,
    bimbel: 0,
    base_bimbel: 0, // Base value untuk kalkulasi
    jml_jam_insentif_bimbel: 0,
    proyek: 0,
    base_proyek: 0, // Base value untuk kalkulasi
    jml_jam_insentif_proyek: 0,
    insentif_peng_pramuka: 0,
    insentif_peng_ekskul: 0,
    insentif_peng_proyek: 0,
    insentif_pengurus_bimbel: 0,
    insentif_lain: 0,
    potongan_yayasan: 0,
    potongan_lain: 0,
    potongan_koperasi_wajib: 0,
    potongan_koperasi_sukarela: 0,
    potongan_angsuran_koperasi: 0,
    deposit_annurmart: 0,
    potongan_jht: 0,
    potongan_pph21: 0,
    potongan_t_muka_pengganti: 0,
    jml_jam_t_muka_pengganti: 0,
    nama_bank: '',
    no_rekening: '',
    jumlah_hari: 0,
    jumlah_hari_lain: 0,
    jml_hari_transport1: 0,
    jml_hari_transport2: 0,
    total_transport: 0,
    total_transport2: 0,
    total_transport_all: 0,
    total_gaji: 0,
    total_potongan: 0,
    gaji_bersih: 0,
    status: '',
    periode_bulan: '',
    periode_tahun: '',
  };

  const [payrollForm, setPayrollForm] = useState(initialPayrollForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hitung total_gaji otomatis
  const hitungTotalGaji = (form: typeof payrollForm) => {
    const fields: (keyof typeof payrollForm)[] = [
      'gaji_pokok', 'jabatan', 'masa_kerja', 'wali_kelas', 'koordinator', 'tatap_muka', 't_muka_pengganti',
      'tunj_keluarga', 'tunj_lain', 'makan', 'jamsostek', 'overtime',
      'pramuka', 'ekskul', 'bpjs', 'bimbel', 'proyek',
      'insentif_peng_pramuka', 'insentif_peng_ekskul', 'insentif_peng_proyek', 'insentif_pengurus_bimbel', 'insentif_lain', 'total_transport_all'
    ];
    let total = 0;
    for (const key of fields) {
      let value = form[key] as number | string;
      // Remove formatting characters (dots, commas) for proper number conversion
      if (typeof value === 'string') {
        value = value.replace(/\./g, '').replace(/,/g, '');
      }
      total += Number(value || 0);
    }
    return total;
  };

  // Hitung total potongan dari potonganList
  const hitungTotalPotongan = () => {
    // Potongan dari dynamic list
    const potonganDynamic = potonganList.reduce((total, item) => {
      let jumlah = item.jumlah_potongan;
      // Remove formatting characters for proper number conversion
      if (typeof jumlah === 'string') {
        jumlah = jumlah.replace(/\./g, '').replace(/,/g, '');
      }
      return total + (Number(jumlah) || 0);
    }, 0);
    
    // Potongan standar - Helper function to parse value
    const parseValue = (value: any) => {
      let val = value;
      if (typeof val === 'string') {
        val = val.replace(/\./g, '').replace(/,/g, '');
      }
      return Number(val || 0);
    };
    
    const potonganStandar = 
      parseValue(payrollForm.potongan_yayasan) +
      parseValue(payrollForm.potongan_lain) +
      parseValue(payrollForm.potongan_koperasi_wajib) +
      parseValue(payrollForm.potongan_koperasi_sukarela) +
      parseValue(payrollForm.potongan_angsuran_koperasi) +
      parseValue(payrollForm.deposit_annurmart) +
      parseValue(payrollForm.potongan_jht) +
      parseValue(payrollForm.potongan_pph21) +
      parseValue(payrollForm.potongan_t_muka_pengganti);
    
    return potonganDynamic + potonganStandar;
  };

  // Handle input change
  const handlePayrollChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Field yang menggunakan teks biasa (tidak diformat)
    const textFields = ['tatap_muka', 't_muka_pengganti'];
    // Cek apakah field numerik
    const numericFields = [
      'gaji_pokok','jabatan', 'masa_kerja', 'masa_kerja_tahun', 'wali_kelas', 'koordinator',
      'tunj_keluarga', 'tunj_lain', 'transport1', 'transport2', 'makan', 'makan_hari', 'jamsostek', 'overtime', 'overtime_hari',
      'pramuka', 'jml_jam_pramuka', 'ekskul', 'jml_jam_insentif_ekskul', 'bpjs', 'bimbel', 'jml_jam_insentif_bimbel', 'proyek', 'jml_jam_insentif_proyek',
      'insentif_peng_pramuka', 'insentif_peng_ekskul', 'insentif_peng_proyek', 'insentif_pengurus_bimbel', 'insentif_lain', 'total_gaji', 'jumlah_hari', 'jumlah_hari_lain', 'jml_hari_transport1', 'jml_hari_transport2', 'jml_jam_t_muka_pengganti',
      // Potongan standar
      'potongan_yayasan', 'potongan_lain', 'potongan_koperasi_wajib', 'potongan_koperasi_sukarela',
      'potongan_angsuran_koperasi', 'deposit_annurmart', 'potongan_jht', 'potongan_pph21', 'potongan_t_muka_pengganti'
    ];
    let val: any = value;
    if (textFields.includes(name)) {
      // Simpan sebagai teks biasa, jangan parse ke number
      val = value || '0';
    } else if (numericFields.includes(name)) {
      // Hapus titik, simpan sebagai number
      val = Number(String(value).replace(/\./g, ''));
    }
    const updatedForm = {
      ...payrollForm,
      [name]: val,
    };
    
    // Update base values when user manually changes these fields
    if (name === 'tatap_muka') {
      updatedForm.base_tatap_muka = val;
    } else if (name === 'pramuka') {
      updatedForm.base_pramuka = val;
    } else if (name === 'makan') {
      updatedForm.base_makan = val;
    } else if (name === 'ekskul') {
      updatedForm.base_ekskul = val;
    } else if (name === 'bimbel') {
      updatedForm.base_bimbel = val;
    } else if (name === 'proyek') {
      updatedForm.base_proyek = val;
    }
    
    // Auto-calculate total_transport when jumlah_hari or transport1 changes
    if (name === 'jumlah_hari' || name === 'transport1') {
      const jumlahHari = name === 'jumlah_hari' ? val : updatedForm.jumlah_hari;
      const transport1 = name === 'transport1' ? val : updatedForm.transport1;
      updatedForm.total_transport = jumlahHari * transport1;
      updatedForm.jml_hari_transport1 = Number(jumlahHari) || 0;
    }
    
    // Auto-calculate total_transport2 when jumlah_hari_lain or transport2 changes
    if (name === 'jumlah_hari_lain' || name === 'transport2') {
      const jumlahHariLain = name === 'jumlah_hari_lain' ? val : updatedForm.jumlah_hari_lain;
      const transport2 = name === 'transport2' ? val : updatedForm.transport2;
      updatedForm.total_transport2 = jumlahHariLain * transport2;
      updatedForm.jml_hari_transport2 = Number(jumlahHariLain) || 0;
    }
    
    // Auto-calculate total_transport_all (total_transport + total_transport2)
    if (name === 'jumlah_hari' || name === 'transport1' || name === 'jumlah_hari_lain' || name === 'transport2') {
      updatedForm.total_transport_all = updatedForm.total_transport + updatedForm.total_transport2;
    }
    
    updatedForm.total_gaji = hitungTotalGaji(updatedForm);
    setPayrollForm(updatedForm);
  };

  // Handle select guru
  const handleSelectGuru = async (selectedOption: any) => {
    if (selectedOption) {
      const guru = guruList.find(g => g.id.toString() === selectedOption.value);
      setSelectedGuru(guru || null);
      
      if (guru) {
        const updatedForm = {
          ...payrollForm,
          guru_id: selectedOption.value,
          nama_lengkap: guru.nama_lengkap,
          unit_sekolah_nama: guru.unit_sekolah_nama,
          jabatan_nama: guru.jabatan_nama,
          // Auto-fill payroll fields from guru data
          gaji_pokok: guru.gaji_pokok || 0,
          jabatan: guru.tunjangan_jabatan || 0,
          masa_kerja: guru.tunjangan_masa_kerja || 0,
          masa_kerja_tahun: guru.tmt ? getYearsFromTMT(guru.tmt) : 0,
          base_masa_kerja: guru.tunjangan_masa_kerja || 0, // Base value untuk kalkulasi
          wali_kelas: guru.wali_kelas || 0,
          koordinator: guru.koordinator || 0,
          tatap_muka: String(guru.tatap_muka || '0'),
          base_tatap_muka: String(guru.tatap_muka || '0'), // Base value untuk kalkulasi
          t_muka_pengganti: String(guru.t_muka_pengganti || '0'),
          base_t_muka_pengganti: String(guru.t_muka_pengganti || '0'), // Base value untuk kalkulasi
          tunj_keluarga: guru.tunj_keluarga || 0,
          tunj_lain: guru.tunj_lain || 0,
          transport1: guru.transport1 || 0,
          transport2: guru.transport2 || 0,
          makan: guru.makan || 0,
          base_makan: guru.makan || 0,
          makan_hari: 0,
          jamsostek: guru.jamsostek || 0,
          overtime: guru.overtime || 0,
          overtime_hari: 0,
          pramuka: guru.pramuka || 0,
          base_pramuka: guru.pramuka || 0, // Base value untuk kalkulasi
          jml_jam_pramuka: 0,
          ekskul: guru.ekskul || 0,
          base_ekskul: guru.ekskul || 0,
          jml_jam_insentif_ekskul: 0,
          bpjs: guru.bpjs || 0,
          bimbel: guru.bimbel || 0,
          base_bimbel: guru.bimbel || 0,
          jml_jam_insentif_bimbel: 0,
          proyek: guru.proyek || 0,
          base_proyek: guru.proyek || 0,
          jml_jam_insentif_proyek: 0,
          insentif_peng_pramuka: guru.insentif_peng_pramuka || 0,
          insentif_peng_ekskul: guru.insentif_peng_ekskul || 0,
          insentif_peng_proyek: guru.insentif_peng_proyek || 0,
          insentif_pengurus_bimbel: guru.insentif_pengurus_bimbel || 0,
          insentif_lain: guru.insentif_lain || 0,
          potongan_yayasan: guru.potongan_yayasan || 0,
          potongan_lain: guru.potongan_lain || 0,
          potongan_koperasi_wajib: guru.potongan_koperasi_wajib || 0,
          potongan_koperasi_sukarela: guru.potongan_koperasi_sukarela || 0,
          potongan_angsuran_koperasi: guru.potongan_angsuran_koperasi || 0,
          deposit_annurmart: guru.deposit_annurmart || 0,
          potongan_jht: guru.potongan_jht || 0,
          potongan_pph21: guru.potongan_pph21 || 0,
          potongan_t_muka_pengganti: guru.potongan_t_muka_pengganti || 0,
          jml_jam_t_muka_pengganti: 0,
          nama_bank: guru.nama_bank || '',
          no_rekening: guru.no_rekening || '',
          masa_kerja_guru: guru.masa_kerja_guru || 0,
          tmt: guru.tmt || '',
          // jumlah_hari dan jumlah_hari_lain tidak lagi auto-fill
          jumlah_hari: 0,
          jumlah_hari_lain: 0,
          jml_hari_transport1: 0,
          jml_hari_transport2: 0,
        };
        
        updatedForm.total_gaji = hitungTotalGaji(updatedForm);
        setPayrollForm(updatedForm);
        
        // Auto-fetch jumlah hari setelah guru dipilih
        // Set timeout untuk memastikan form sudah di-update
        setTimeout(() => {
          handleFetchJumlahHari();
        }, 100);
      }
    } else {
      setPayrollForm(initialPayrollForm);
      setSelectedGuru(null);
    }
  };
  // Handle submit
  const handlePayrollSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Helper function to parse formatted string values
      const parseFormattedValue = (value: any) => {
        if (typeof value === 'string') {
          return Number(value.replace(/\./g, '').replace(/,/g, ''));
        }
        return Number(value || 0);
      };

      // Siapkan data untuk dikirim ke backend
      // Parse semua field potongan standar untuk memastikan format benar
      const submitData = {
        ...payrollForm,
        // Convert string fields to number
        tatap_muka: parseFormattedValue(payrollForm.tatap_muka),
        t_muka_pengganti: parseFormattedValue(payrollForm.t_muka_pengganti),
        jml_jam_t_muka_pengganti: Number(payrollForm.jml_jam_t_muka_pengganti) || 0,
        jml_jam_pramuka: Number(payrollForm.jml_jam_pramuka) || 0,
        jml_jam_insentif_ekskul: Number(payrollForm.jml_jam_insentif_ekskul) || 0,
        jml_jam_insentif_bimbel: Number(payrollForm.jml_jam_insentif_bimbel) || 0,
        jml_jam_insentif_proyek: Number(payrollForm.jml_jam_insentif_proyek) || 0,
        makan_hari: Number(payrollForm.makan_hari) || 0,
        overtime_hari: Number(payrollForm.overtime_hari) || 0,
        jml_hari_transport1: Number(payrollForm.jml_hari_transport1 || payrollForm.jumlah_hari) || 0,
        jml_hari_transport2: Number(payrollForm.jml_hari_transport2 || payrollForm.jumlah_hari_lain) || 0,
        jumlah_hari: Number(payrollForm.jumlah_hari || payrollForm.jml_hari_transport1) || 0,
        jumlah_hari_lain: Number(payrollForm.jumlah_hari_lain || payrollForm.jml_hari_transport2) || 0,
        // Parse field bimbel, proyek, dan insentif_pengurus_bimbel yang menggunakan formatRupiah
        tunj_lain: parseFormattedValue(payrollForm.tunj_lain),
        bpjs: parseFormattedValue(payrollForm.bpjs),
        bimbel: parseFormattedValue(payrollForm.bimbel),
        proyek: parseFormattedValue(payrollForm.proyek),
        insentif_pengurus_bimbel: parseFormattedValue(payrollForm.insentif_pengurus_bimbel),
        // Parse semua field potongan standar untuk memastikan nilai benar
        potongan_yayasan: parseFormattedValue(payrollForm.potongan_yayasan),
        potongan_lain: parseFormattedValue(payrollForm.potongan_lain),
        potongan_koperasi_wajib: parseFormattedValue(payrollForm.potongan_koperasi_wajib),
        potongan_koperasi_sukarela: parseFormattedValue(payrollForm.potongan_koperasi_sukarela),
        potongan_angsuran_koperasi: parseFormattedValue(payrollForm.potongan_angsuran_koperasi),
        deposit_annurmart: parseFormattedValue(payrollForm.deposit_annurmart),
        potongan_jht: parseFormattedValue(payrollForm.potongan_jht),
        potongan_pph21: parseFormattedValue(payrollForm.potongan_pph21),
        potongan_t_muka_pengganti: parseFormattedValue(payrollForm.potongan_t_muka_pengganti),
        total_potongan: hitungTotalPotongan(),
        gaji_bersih: Math.max(0, Number(payrollForm.total_gaji) - hitungTotalPotongan()),
        potongan_list: potonganList.filter(item => 
          item.nama_potongan.trim() !== '' && item.jumlah_potongan !== ''
        ).map(item => ({
          nama_potongan: item.nama_potongan.trim(),
          jumlah_potongan: parseFormattedValue(item.jumlah_potongan)
        }))
      };

      const token = localStorage.getItem('auth_token');
      const baseUrl = import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001';
      const url = isEditMode && editPayrollId 
        ? `${baseUrl}/api/master-data/payroll/${editPayrollId}`
        : `${baseUrl}/api/master-data/payroll`;
      
      const response = await fetch(url, {
        method: isEditMode && editPayrollId ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(submitData),
      });
      
      const result = await response.json();
      console.log('Payroll saved:', result);
      
      if (!response.ok || (result.status && result.status === 'error')) {
        throw new Error(result.message || 'Gagal menyimpan data');
      }
      
      // Set submit false dulu agar tombol aktif kembali
      setIsSubmitting(false);
      
      // Tutup modal
      setShowSetupPayrollModal(false);
      
      // Tunggu modal benar-benar tertutup (animasi selesai)
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Tampilkan notifikasi sukses
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil! 🎉',
        text: isEditMode ? 'Data payroll berhasil diperbarui!' : 'Data payroll berhasil disimpan ke database!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6',
        allowOutsideClick: false
      });
      
      // Reset form setelah notifikasi ditutup
      setPayrollForm(initialPayrollForm);
      setPotonganList([{ nama_potongan: '', jumlah_potongan: '' }]);
      setSelectedGuru(null);
      setIsEditMode(false);
      setEditPayrollId(null);
      
      // Refresh data slip gaji
      await fetchSlipData();
    } catch (err: any) {
      console.error('Error saving payroll:', err);
      setIsSubmitting(false);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err?.message || 'Terjadi kesalahan saat menyimpan data payroll',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#ef4444'
      });
    }
  };
  // Fetch payroll data for edit
  const fetchPayrollForEdit = async (payrollId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const baseUrl = import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001';
      const response = await fetch(`${baseUrl}/api/master-data/payroll/${payrollId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await response.json();
      
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Gagal mengambil data payroll');
      }

      const payroll = result.data;
      
      // Fetch potongan_list dari backend
      let potonganListData = [{ nama_potongan: '', jumlah_potongan: '' }];
      try {
        const potonganResponse = await fetch(
          `${baseUrl}/api/master-data/payroll/${payrollId}/potongan`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        if (potonganResponse.ok) {
          const potonganResult = await potonganResponse.json();
          if (potonganResult.success && potonganResult.data && potonganResult.data.length > 0) {
            potonganListData = potonganResult.data.map((p: any) => ({
              nama_potongan: p.nama_potongan || '',
              jumlah_potongan: String(p.jumlah_potongan || '')
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching potongan:', err);
      }

      // Find guru in guruList
      const guru = guruList.find(g => g.id.toString() === String(payroll.guru_id));
      
      // Populate form with payroll data
      // Base values harus diambil dari data guru (sama seperti mode tambah payroll)
      const updatedForm = {
        ...payrollForm,
        guru_id: String(payroll.guru_id),
        nama_lengkap: payroll.guru?.nama_lengkap || '',
        unit_sekolah_nama: payroll.guru?.unit_sekolah?.nama || '',
        jabatan_nama: payroll.guru?.jabatan?.nama || '',
        gaji_pokok: Number(payroll.gaji_pokok) || 0,
        jabatan: Number(payroll.jabatan) || 0,
        masa_kerja: Number(payroll.masa_kerja) || 0,
        masa_kerja_tahun: payroll.guru?.tmt ? getYearsFromTMT(payroll.guru.tmt) : (Number(payroll.masa_kerja_tahun) || 0),
        base_masa_kerja: guru?.tunjangan_masa_kerja || 0, // Base dari guru, bukan payroll
        wali_kelas: Number(payroll.wali_kelas) || 0,
        koordinator: Number(payroll.koordinator) || 0,
        tatap_muka: String(payroll.tatap_muka || '0'),
        base_tatap_muka: String(payroll.tatap_muka || '0'), // Base dari tatap_muka itu sendiri, bukan dari guru
        t_muka_pengganti: String(payroll.t_muka_pengganti || '0'),
        base_t_muka_pengganti: String(guru?.t_muka_pengganti || '0'), // Base dari guru, bukan payroll
        tunj_keluarga: Number(payroll.tunj_keluarga) || 0,
        tunj_lain: Number(payroll.tunj_lain ?? guru?.tunj_lain) || 0,
        transport1: Number(payroll.transport1) || 0,
        transport2: Number(payroll.transport2) || 0,
        makan: Number(payroll.makan) || 0,
        base_makan: guru?.makan || 0, // Base dari guru, bukan payroll
        makan_hari: Number(payroll.makan_hari) || 0,
        jamsostek: Number(payroll.jamsostek ?? guru?.jamsostek) || 0,
        overtime: Number(payroll.overtime) || 0,
        overtime_hari: Number(payroll.overtime_hari) || 0,
        pramuka: Number(payroll.pramuka) || 0,
        base_pramuka: Number(payroll.pramuka) || 0, // Base dari pramuka itu sendiri, bukan dari guru
        jml_jam_pramuka: Number(payroll.jml_jam_pramuka) || 0,
        ekskul: Number(payroll.ekskul) || 0,
        base_ekskul: guru?.ekskul || 0, // Base dari guru, bukan payroll
        jml_jam_insentif_ekskul: Number(payroll.jml_jam_insentif_ekskul) || 0,
        bpjs: Number(payroll.bpjs ?? guru?.bpjs) || 0,
        bimbel: Number(payroll.bimbel) || 0,
        base_bimbel: guru?.bimbel || 0, // Base dari guru, bukan payroll
        jml_jam_insentif_bimbel: Number(payroll.jml_jam_insentif_bimbel) || 0,
        proyek: Number(payroll.proyek) || 0,
        base_proyek: guru?.proyek || 0, // Base dari guru, bukan payroll
        jml_jam_insentif_proyek: Number(payroll.jml_jam_insentif_proyek) || 0,
        insentif_peng_pramuka: Number(payroll.insentif_peng_pramuka) || 0,
        insentif_peng_ekskul: Number(payroll.insentif_peng_ekskul) || 0,
        insentif_peng_proyek: Number(payroll.insentif_peng_proyek) || 0,
        insentif_pengurus_bimbel: Number(payroll.insentif_pengurus_bimbel) || 0,
        insentif_lain: Number(payroll.insentif_lain) || 0,
        potongan_yayasan: Number(payroll.potongan_yayasan) || 0,
        potongan_lain: Number(payroll.potongan_lain) || 0,
        potongan_koperasi_wajib: Number(payroll.potongan_koperasi_wajib) || 0,
        potongan_koperasi_sukarela: Number(payroll.potongan_koperasi_sukarela) || 0,
        potongan_angsuran_koperasi: Number(payroll.potongan_angsuran_koperasi) || 0,
        deposit_annurmart: Number(payroll.deposit_annurmart) || 0,
        potongan_jht: Number(payroll.potongan_jht) || 0,
        potongan_pph21: Number(payroll.potongan_pph21) || 0,
        potongan_t_muka_pengganti: Number(payroll.potongan_t_muka_pengganti) || 0,
        jml_jam_t_muka_pengganti: Number(payroll.jml_jam_t_muka_pengganti) || 0,
        nama_bank: payroll.guru?.nama_bank || payroll.nama_bank || '',
        no_rekening: payroll.guru?.no_rekening || payroll.no_rekening || '',
        jml_hari_transport1: Number(payroll.jml_hari_transport1) || Number(payroll.jumlah_hari) || 0,
        jml_hari_transport2: Number(payroll.jml_hari_transport2) || Number(payroll.jumlah_hari_lain) || 0,
        jumlah_hari: Number(payroll.jml_hari_transport1) || Number(payroll.jumlah_hari) || 0,
        jumlah_hari_lain: Number(payroll.jml_hari_transport2) || Number(payroll.jumlah_hari_lain) || 0,
        total_transport: ((Number(payroll.jml_hari_transport1) || Number(payroll.jumlah_hari) || 0)) * (Number(payroll.transport1) || 0),
        total_transport2: ((Number(payroll.jml_hari_transport2) || Number(payroll.jumlah_hari_lain) || 0)) * (Number(payroll.transport2) || 0),
        total_transport_all: (((Number(payroll.jml_hari_transport1) || Number(payroll.jumlah_hari) || 0)) * (Number(payroll.transport1) || 0)) + (((Number(payroll.jml_hari_transport2) || Number(payroll.jumlah_hari_lain) || 0)) * (Number(payroll.transport2) || 0)),
        total_gaji: Number(payroll.total_gaji) || 0,
        total_potongan: Number(payroll.total_potongan) || 0,
        gaji_bersih: Number(payroll.gaji_bersih) || 0,
        status: payroll.status || '',
        periode_bulan: payroll.periode_bulan || '',
        periode_tahun: String(payroll.periode_tahun) || '',
      };

      setPayrollForm(updatedForm);
      setPotonganList(potonganListData);
      setSelectedGuru(guru || null);
      setEditPayrollId(payrollId);
      setIsEditMode(true);
      setShowSetupPayrollModal(true);
    } catch (err: any) {
      console.error('Error fetching payroll for edit:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: err?.message || 'Terjadi kesalahan saat mengambil data payroll',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Handle edit payroll
  const handleEditPayroll = (slip: SlipGaji) => {
    fetchPayrollForEdit(slip.id);
  };

  // Generate unique values untuk filter options
  const uniquePeriodes = React.useMemo(() => {
    const periodes = new Set<string>();
    slipData.forEach(slip => {
      if (slip.periode) {
        periodes.add(slip.periode);
      }
    });
    return Array.from(periodes).sort().reverse(); // Sort descending (terbaru dulu)
  }, [slipData]);

  const uniqueDivisis = React.useMemo(() => {
    const divisis = new Set<string>();
    slipData.forEach(slip => {
      if (slip.divisi) {
        divisis.add(slip.divisi);
      }
    });
    return Array.from(divisis).sort();
  }, [slipData]);

  const uniqueStatuses = React.useMemo(() => {
    const statuses = new Set<string>();
    // Selalu sertakan semua status yang mungkin
    statuses.add('Draft');
    statuses.add('Disetujui');
    statuses.add('Dibayar');
    
    // Tambahkan status lain yang ada di data
    slipData.forEach(slip => {
      if (slip.status) {
        statuses.add(slip.status);
      }
    });
    
    // Urutkan: Draft, Disetujui, Dibayar, lalu yang lain
    const statusOrder = ['Draft', 'Disetujui', 'Dibayar'];
    const sortedStatuses = Array.from(statuses).sort((a, b) => {
      const indexA = statusOrder.indexOf(a);
      const indexB = statusOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
    
    return sortedStatuses;
  }, [slipData]);

  const filteredSlip = React.useMemo(() => {
    return slipData.filter(slip => {
      // Filter search
      const matchesSearch = !debouncedSearchTerm || 
        slip.nama.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         slip.nip.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      // Filter periode (exact match atau partial match untuk berbagai format)
      let matchesPeriode = true;
      if (selectedPeriode) {
        const slipPeriode = slip.periode || '';
        matchesPeriode = slipPeriode === selectedPeriode || 
                        slipPeriode.toLowerCase() === selectedPeriode.toLowerCase() ||
                        slipPeriode.includes(selectedPeriode) ||
                        selectedPeriode.includes(slipPeriode);
      }
      
      // Filter divisi (exact match, case sensitive)
      const matchesDivisi = !selectedDivisi || (slip.divisi && slip.divisi === selectedDivisi);
      
      // Filter status (exact match, case sensitive)
      const matchesStatus = !selectedStatus || (slip.status && slip.status === selectedStatus);
    
    return matchesSearch && matchesPeriode && matchesDivisi && matchesStatus;
  });
  }, [slipData, debouncedSearchTerm, selectedPeriode, selectedDivisi, selectedStatus]);

  const totalFilteredSlip = filteredSlip.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredSlip / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginationStartIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginationStart = totalFilteredSlip === 0 ? 0 : paginationStartIndex + 1;
  const paginationEnd = Math.min(paginationStartIndex + itemsPerPage, totalFilteredSlip);

  const paginatedSlip = React.useMemo(() => {
    return filteredSlip.slice(paginationStartIndex, paginationStartIndex + itemsPerPage);
  }, [filteredSlip, paginationStartIndex, itemsPerPage]);

  const paginationPages = React.useMemo(() => {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);
    const startPage = Math.max(1, Math.min(safeCurrentPage - halfVisiblePages, totalPages - maxVisiblePages + 1));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }, [safeCurrentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedPeriode, selectedDivisi, selectedStatus, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = {
    totalSlip: slipData.length,
    draft: slipData.filter(s => s.status === 'Draft').length,
    disetujui: slipData.filter(s => s.status === 'Disetujui').length,
    dibayar: slipData.filter(s => s.status === 'Dibayar').length,
    totalPengeluaran: slipData.filter(s => s.status === 'Dibayar').reduce((sum, s) => sum + s.gajiDiterima, 0)
  };

  // Fetch data guru dari backend
  const fetchGuruData = async () => {
    setLoadingGuru(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/guru?per_page=10000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      console.log('API Response - Total Guru:', data.data?.total);
      
      if (data.success && data.data && data.data.data) {
        // Transform data to match Guru interface
        const transformedGurus = data.data.data.map((guru: any) => ({
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
          wali_kelas: guru.wali_kelas || 0,
          koordinator: guru.koordinator || 0,
          tatap_muka: guru.tatap_muka || 0,
          t_muka_pengganti: guru.t_muka_pengganti || 0,
          tunj_keluarga: guru.tunj_keluarga || 0,
          transport1: guru.transport1 || 0,
          transport2: guru.transport2 || 0,
          makan: guru.makan || 0,
          jamsostek: guru.jamsostek || 0,
          overtime: guru.overtime || 0,
          pramuka: guru.pramuka || 0,
          tunj_lain: guru.tunj_lain || 0,
          ekskul: guru.ekskul || 0,
          bpjs: guru.bpjs || 0,
          bimbel: guru.bimbel || 0,
          proyek: guru.proyek || 0,
          insentif_peng_pramuka: guru.insentif_peng_pramuka || 0,
          insentif_peng_ekskul: guru.insentif_peng_ekskul || 0,
          insentif_peng_proyek: guru.insentif_peng_proyek || 0,
          insentif_pengurus_bimbel: guru.insentif_pengurus_bimbel || 0,
          insentif_lain: guru.insentif_lain || 0,
          potongan_yayasan: guru.potongan_yayasan || 0,
          potongan_lain: guru.potongan_lain || 0,
          potongan_koperasi_wajib: guru.potongan_koperasi_wajib || 0,
          potongan_koperasi_sukarela: guru.potongan_koperasi_sukarela || 0,
          potongan_angsuran_koperasi: guru.potongan_angsuran_koperasi || 0,
          deposit_annurmart: guru.deposit_annurmart || 0,
          potongan_jht: guru.potongan_jht || 0,
          potongan_pph21: guru.potongan_pph21 || 0,
          potongan_t_muka_pengganti: guru.potongan_t_muka_pengganti || 0,
          nama_bank: guru.nama_bank || '',
          no_rekening: guru.no_rekening || '',
          masa_kerja_guru: guru.masa_kerja_guru || 0,
          tmt: guru.tmt || '',
        }));
        console.log('Transformed Gurus:', transformedGurus);
        setGuruList(transformedGurus);
      } else {
        console.warn('Unexpected data structure:', data);
        setGuruList([]);
      }
    } catch (error) {
      console.error('Error fetching guru data:', error);
      setGuruList([]);
    } finally {
      setLoadingGuru(false);
    }
  };

  // Fetch data slip gaji dari backend
  const fetchSlipData = async () => {
    setLoadingSlipData(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/payroll`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Payroll API Response:', data);
      
      if (response.ok && Array.isArray(data)) {
        // Transform data dari backend ke format yang diharapkan frontend
        const transformedData = data.map((item: any, index: number) => {
          // Debug: Log item untuk melihat struktur data
          if (index === 0) {
            console.log('=== BACKEND DATA STRUCTURE ===');
            console.log('First item from backend:', JSON.stringify(item, null, 2));
            console.log('item.id:', item.id);
            console.log('item.payroll_id:', item.payroll_id);
            console.log('item keys:', Object.keys(item));
            console.log('================================');
          }

          // Ambil ID dengan prioritas: id -> payroll_id
          // Backend mengirim: 'id' dan 'payroll_id' (line 196-197 PayrollController.php)
          let id = '';
          if (item.id !== undefined && item.id !== null) {
            id = String(item.id);
          } else if (item.payroll_id !== undefined && item.payroll_id !== null) {
            id = String(item.payroll_id);
          }
          
          if (!id || id === '') {
            console.error('ERROR: No valid ID found for item at index', index);
            console.error('Item data:', JSON.stringify(item, null, 2));
            console.error('Available fields:', Object.keys(item));
            console.error('item.id value:', item.id, 'type:', typeof item.id);
            console.error('item.payroll_id value:', item.payroll_id, 'type:', typeof item.payroll_id);
          }
          
          return {
          id: id,
          nip: item.guru?.nip || item.nip || '',
          nama: item.guru?.nama_lengkap || item.nama_lengkap || '',
          divisi: item.guru?.unit_sekolah?.nama || item.unit_sekolah_nama || '',
          jabatan: item.guru?.jabatan?.nama || item.nama_jabatan || '',
          periode: (item.periode_bulan && item.periode_tahun) ? `${item.periode_bulan}-${item.periode_tahun}` : '',
          
          // Pendapatan - Gaji Dasar & Tunjangan
          gajiPokok: Number(item.gaji_pokok) || 0,
          tunjanganJabatan: Number(item.jabatan) || 0,
          masaKerja: Number(item.masa_kerja) || 0,
          waliKelas: Number(item.wali_kelas) || 0,
          koordinator: Number(item.koordinator) || 0,
          tatapmuka: Number(item.tatap_muka) || 0,
          tatapMukaPengganti: Number(item.t_muka_pengganti) || 0,
          baseTatapMukaPengganti: Number(item.guru?.t_muka_pengganti) || 0,
          tatapMukaPenggantiPerHari: Number(item.guru?.t_muka_pengganti) || 0, // Nilai per hari dari guru
          jmlJamTMukaPengganti: Number(item.jml_jam_t_muka_pengganti) || 0, // Jumlah jam tatap muka pengganti
          jumlahHariTatapMukaPengganti: 23, // Default 23 hari (untuk fallback)
          tunjanganKeluarga: Number(item.tunj_keluarga) || 0,
          tunjanganLain: Number(item.tunj_lain ?? item.guru?.tunj_lain) || 0,
          transport: Number(item.total_transport_all) || (Number(item.transport1) || 0) + (Number(item.transport2) || 0),
          transport1: Number(item.transport1) || 0, // Total transport1 dari payroll
          transport2: Number(item.transport2) || 0, // Total transport2 dari payroll
          // Nilai transport per hari dari guru (bukan total)
          transport1PerHari: Number(item.guru?.transport1) || 0,
          transport2PerHari: Number(item.guru?.transport2) || 0,
          jmlHariTransport1: Number(item.jml_hari_transport1) || 0,
          jmlHariTransport2: Number(item.jml_hari_transport2) || 0,
          totalTransport: Number(item.total_transport) || 0,
          totalTransport2: Number(item.total_transport2) || 0,
          makan: Number(item.makan) || 0, // Total makan dari payroll
          makanHari: Number(item.makan_hari) || 0,
          makanPerHari: Number(item.guru?.makan) || 0, // Nilai per hari dari guru
          jamsostek: Number(item.jamsostek ?? item.guru?.jamsostek) || 0,
          bpjs: Number(item.bpjs ?? item.guru?.bpjs) || 0,
          overtime: Number(item.overtime) || 0, // Total overtime dari payroll
          overtimeHari: Number(item.overtime_hari) || 0,
          overtimePerHari: Number(item.guru?.overtime) || 0, // Nilai per hari dari guru
          
          // Insentif
          pramuka: Number(item.pramuka) || 0, // Total pramuka dari payroll
          jmlJamPramuka: Number(item.jml_jam_pramuka) || 0,
          pramukaPerJam: Number(item.guru?.pramuka) || 0, // Nilai per jam dari guru
          ekskul: Number(item.ekskul) || 0, // Total ekskul dari payroll
          jmlJamInsentifEkskul: Number(item.jml_jam_insentif_ekskul) || 0,
          ekskulPerJam: Number(item.guru?.ekskul) || 0, // Nilai per jam dari guru
          bimbel: Number(item.bimbel) || 0, // Total bimbel dari payroll
          jmlJamInsentifBimbel: Number(item.jml_jam_insentif_bimbel) || 0,
          bimbelPerJam: Number(item.guru?.bimbel) || 0, // Nilai per jam dari guru
          proyek: Number(item.proyek) || 0, // Total proyek dari payroll
          jmlJamInsentifProyek: Number(item.jml_jam_insentif_proyek) || 0,
          proyekPerJam: Number(item.guru?.proyek) || 0, // Nilai per jam dari guru
          insentifPramuka: Number(item.insentif_peng_pramuka) || 0,
          insentifEkskul: Number(item.insentif_peng_ekskul) || 0,
          insentifProyek: Number(item.insentif_peng_proyek) || 0,
          insentifBimbel: Number(item.insentif_pengurus_bimbel) || 0,
          insentifLain: Number(item.insentif_lain) || 0,
          
          // Lembur
          lemburHari: Number(item.jumlah_hari) || 0,
          gajiLembur: Number(item.overtime) || 0,
          
          // Total Pendapatan
          totalPendapatan: Number(item.total_gaji) || 0,
          
          // Potongan Standar
          potonganYayasan: Number(item.potongan_yayasan) || 0,
          potonganLain: Number(item.potongan_lain) || 0,
          potonganKoperasiWajib: Number(item.potongan_koperasi_wajib) || 0,
          potonganKoperasiSukarela: Number(item.potongan_koperasi_sukarela) || 0,
          potonganAngsuranKoperasi: Number(item.potongan_angsuran_koperasi) || 0,
          depositAnnurmart: Number(item.deposit_annurmart) || 0,
          potonganJHT: Number(item.potongan_jht) || 0,
          potonganPPH21: Number(item.potongan_pph21) || 0,
          potonganTMukaPengganti: Number(item.potongan_t_muka_pengganti) || 0,
          
          // Potongan Lain
          potonganBPJS: Number(item.bpjs ?? item.guru?.bpjs) || 0,
          potonganPajak: 0,
          potonganAbsen: 0,
          
          // Total Potongan & Net
          totalPotongan: Number(item.total_potongan) || 0,
          gajiDiterima: Number(item.gaji_bersih) || 0,
          totalGaji: Number(item.total_gaji) || 0, // Total gaji sebelum potongan
          status: item.status as 'Draft' | 'Disetujui' | 'Dibayar',
          tanggalGenerate: item.created_date || item.created_at || new Date().toISOString().split('T')[0],
          tanggalBayar: item.status === 'Dibayar' ? (item.updated_at || new Date().toISOString().split('T')[0]) : undefined,
          namaBank: item.guru?.nama_bank || item.nama_bank || '',
          noRekening: item.guru?.no_rekening || item.no_rekening || '',
          memo: item.memo || '' // Field memo dari backend
          };
        });
        console.log('Transformed Slip Data:', transformedData);
        setSlipData(transformedData);
      } else {
        console.warn('Unexpected data structure:', data);
        setSlipData([]);
      }
    } catch (error) {
      console.error('Error fetching slip data:', error);
      setSlipData([]);
    } finally {
      setLoadingSlipData(false);
    }
  };

  // Load data saat component mount
  useEffect(() => {
    fetchGuruData();
    fetchSlipData();
  }, []);

  // Debounce effect untuk search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Update debouncedSearchTerm setelah 500ms tanpa input baru
      setDebouncedSearchTerm(searchInputValue);
    }, 500); // Delay 500ms

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInputValue]);

  // Handle guru selection
  const handleGuruSelect = (guruId: string) => {
    if (Array.isArray(guruList)) {
      const guru = guruList.find(g => g.id.toString() === guruId);
      setSelectedGuru(guru || null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPeriode = (periode: string) => {
    if (!periode) return '';
    
    // Jika sudah dalam format "Bulan Tahun" (dari backend)
    if (periode.includes(' ') && !periode.includes('-')) {
      return periode;
    }
    
    // Jika dalam format "YYYY-MM"
    const [year, month] = periode.split('-');
    if (!year || !month) return periode;
    
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIndex = parseInt(month) - 1;
    
    if (monthIndex < 0 || monthIndex >= 12) return periode;
    
    return `${monthNames[monthIndex]} ${year}`;
  };

  const getStatusBadge = (status: SlipGaji['status']) => {
    const colors = {
      'Draft': {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        icon: '⏱️'
      },
      'Disetujui': {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: '✅'
      },
      'Dibayar': {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '💰'
      }
    };
    
    const style = colors[status];
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl border ${style.bg} ${style.text} ${style.border}`}>
        <span className="text-base">{style.icon}</span>
        <span>{status}</span>
      </div>
    );
  };

  const handleViewDetail = (slip: SlipGaji) => {
    setSelectedSlip(slip);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSlip(null);
  };

  const handlePrintSlip = (slip: SlipGaji) => {
    setSelectedSlip(slip);
    setShowPrintPreview(true);
  };
  const handleActualPrint = async (slip: SlipGaji) => {
    try {
      // Show loading
      Swal.fire({
        title: 'Memuat Data...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Fetch data dari backend menggunakan ID slip
      const token = localStorage.getItem('auth_token');
      const baseUrl = import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001';
      const response = await fetch(`${baseUrl}/api/master-data/payroll/${slip.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await response.json();
      
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Gagal mengambil data payroll');
      }

      const payroll = result.data;

      // Transform data dari backend ke format SlipGajiTemplate
      // Berdasarkan PayrollController.php show() method dan SlipGajiTemplate interface
      const templateData = {
        id: slip.id || String(payroll.payroll_id || payroll.id || ''),
        nip: payroll.guru?.nip || slip.nip || '',
        nama: payroll.guru?.nama_lengkap || slip.nama || '',
        divisi: payroll.guru?.unitSekolah?.nama || payroll.guru?.unit_sekolah?.nama || slip.divisi || '',
        jabatan: payroll.guru?.jabatan?.nama || slip.jabatan || '',
        periode: payroll.periode_bulan && payroll.periode_tahun 
          ? `${payroll.periode_bulan} ${payroll.periode_tahun}`
          : slip.periode || '',
        
        // Pendapatan - Gaji Dasar & Tunjangan
        gajiPokok: Number(payroll.gaji_pokok) || 0,
        tunjanganJabatan: Number(payroll.jabatan) || 0,
        masaKerja: Number(payroll.masa_kerja) || 0,
        waliKelas: Number(payroll.wali_kelas) || 0,
        koordinator: Number(payroll.koordinator) || 0,
        tatapmuka: Number(payroll.tatap_muka) || 0,
        tatapMukaPengganti: Number(payroll.t_muka_pengganti) || 0,
        baseTatapMukaPengganti: Number(payroll.guru?.t_muka_pengganti || payroll.base_t_muka_pengganti || 0) || 0,
        tatapMukaPenggantiPerHari: Number(payroll.guru?.t_muka_pengganti) || 0, // Nilai per hari dari guru
        jmlJamTMukaPengganti: Number(payroll.jml_jam_t_muka_pengganti) || 0, // Jumlah jam tatap muka pengganti
        jumlahHariTatapMukaPengganti: 23, // Default 23 hari (untuk fallback)
        tunjanganKeluarga: Number(payroll.tunj_keluarga) || 0,
        tunjanganLain: Number(payroll.tunj_lain ?? payroll.guru?.tunj_lain) || 0,
        transport: Number(payroll.total_transport_all) || (Number(payroll.transport1) || 0) + (Number(payroll.transport2) || 0),
        transport1: Number(payroll.transport1) || 0, // Total transport1 dari payroll
        transport2: Number(payroll.transport2) || 0, // Total transport2 dari payroll
        // Nilai transport per hari dari guru (bukan total)
        transport1PerHari: Number(payroll.guru?.transport1) || 0,
        transport2PerHari: Number(payroll.guru?.transport2) || 0,
        jumlahHari: Number(payroll.jumlah_hari) || 0,
        jumlahHariLain: Number(payroll.jumlah_hari_lain) || 0,
        totalTransport: Number(payroll.jumlah_hari) * Number(payroll.transport1) || 0,
        totalTransport2: Number(payroll.jumlah_hari_lain) * Number(payroll.transport2) || 0,
        totalTransportAll: Number(payroll.total_transport_all) || ((Number(payroll.jumlah_hari) * Number(payroll.transport1) || 0) + (Number(payroll.jumlah_hari_lain) * Number(payroll.transport2) || 0)),
        jmlHariTransport1: Number(payroll.jml_hari_transport1) || 0,
        jmlHariTransport2: Number(payroll.jml_hari_transport2) || 0,
        makan: Number(payroll.makan) || 0, // Total makan dari payroll
        makanHari: Number(payroll.makan_hari) || 0,
        makanPerHari: Number(payroll.guru?.makan) || 0, // Nilai per hari dari guru
        jamsostek: Number(payroll.jamsostek ?? payroll.guru?.jamsostek) || 0,
        bpjs: Number(payroll.bpjs ?? payroll.guru?.bpjs) || 0,
        overtime: Number(payroll.overtime) || 0, // Total overtime dari payroll
        overtimeHari: Number(payroll.overtime_hari) || 0,
        overtimePerHari: Number(payroll.guru?.overtime) || 0, // Nilai per hari dari guru
        
        // Insentif
        pramuka: Number(payroll.pramuka) || 0, // Total pramuka dari payroll
        jmlJamPramuka: Number(payroll.jml_jam_pramuka) || 0,
        pramukaPerJam: Number(payroll.guru?.pramuka) || 0, // Nilai per jam dari guru
        ekskul: Number(payroll.ekskul) || 0, // Total ekskul dari payroll
        jmlJamInsentifEkskul: Number(payroll.jml_jam_insentif_ekskul) || 0,
        ekskulPerJam: Number(payroll.guru?.ekskul) || 0, // Nilai per jam dari guru
        bimbel: Number(payroll.bimbel) || 0, // Total bimbel dari payroll
        jmlJamInsentifBimbel: Number(payroll.jml_jam_insentif_bimbel) || 0,
        bimbelPerJam: Number(payroll.guru?.bimbel) || 0, // Nilai per jam dari guru
        proyek: Number(payroll.proyek) || 0, // Total proyek dari payroll
        jmlJamInsentifProyek: Number(payroll.jml_jam_insentif_proyek) || 0,
        proyekPerJam: Number(payroll.guru?.proyek) || 0, // Nilai per jam dari guru
        insentifPramuka: Number(payroll.insentif_peng_pramuka) || 0,
        insentifEkskul: Number(payroll.insentif_peng_ekskul) || 0,
        insentifProyek: Number(payroll.insentif_peng_proyek) || 0,
        insentifBimbel: Number(payroll.insentif_pengurus_bimbel) || 0,
        insentifLain: Number(payroll.insentif_lain) || 0,
        
        // Lembur
        lemburHari: Number(payroll.jumlah_hari) || 0,
        gajiLembur: Number(payroll.overtime) || 0,
        
        // Total Pendapatan
        totalPendapatan: Number(payroll.total_gaji) || 0,
        
        // Potongan Standar
        potonganYayasan: Number(payroll.potongan_yayasan) || 0,
        potonganLain: Number(payroll.potongan_lain) || 0,
        potonganKoperasiWajib: Number(payroll.potongan_koperasi_wajib) || 0,
        potonganKoperasiSukarela: Number(payroll.potongan_koperasi_sukarela) || 0,
        potonganAngsuranKoperasi: Number(payroll.potongan_angsuran_koperasi) || 0,
        depositAnnurmart: Number(payroll.deposit_annurmart) || 0,
        potonganJHT: Number(payroll.potongan_jht) || 0,
        potonganPPH21: Number(payroll.potongan_pph21) || 0,
        potonganTMukaPengganti: Number(payroll.potongan_t_muka_pengganti) || 0,
        
        // Potongan Lain
        potonganBPJS: Number(payroll.bpjs ?? payroll.guru?.bpjs) || 0,
        potonganPajak: 0,
        potonganAbsen: 0,
        
        // Total Potongan & Net
        totalPotongan: Number(payroll.total_potongan) || 0,
        gajiDiterima: Number(payroll.gaji_bersih) || 0,
        totalGaji: Number(payroll.total_gaji) || 0, // Total gaji sebelum potongan
        status: (payroll.status as 'Draft' | 'Disetujui' | 'Dibayar') || slip.status || 'Draft',
        tanggalGenerate: payroll.created_date || payroll.created_at || new Date().toISOString().split('T')[0],
        tanggalBayar: payroll.status === 'Dibayar' ? (payroll.updated_at || new Date().toISOString().split('T')[0]) : undefined,
        namaBank: payroll.guru?.nama_bank || payroll.nama_bank || '',
        noRekening: payroll.guru?.no_rekening || payroll.no_rekening || '',
        memo: payroll.memo || '' // Field memo dari backend
      };

      // Close loading
      await Swal.close();

      // Escape HTML untuk keamanan
      const escapeHtml = (text: string) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      // Render SlipGajiTemplate component ke HTML string
      const templateHtml = renderToString(
        React.createElement(SlipGajiTemplate, {
          data: templateData,
          showWatermark: false
        })
      );

      // Buat HTML untuk window baru dengan template dari komponen SlipGajiTemplate
      const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slip Gaji - ${escapeHtml(templateData.nama)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page {
        margin: 0.5cm;
        size: A4;
      }
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        background: white;
      }
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  <div id="root">
    ${templateHtml}
  </div>
  
  <div class="no-print" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
    <button onclick="window.print()" style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      🖨️ Print
    </button>
  </div>

  <script>
    // Tunggu Tailwind CSS selesai load sebelum fokus
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
      }, 100);
    });
  </script>
</body>
</html>
      `;

      // Buka window baru
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      
      if (!printWindow) {
        throw new Error('Pop-up blocked. Silakan izinkan pop-up untuk browser ini.');
      }

      // Write HTML ke window baru
      printWindow.document.write(htmlContent);
      printWindow.document.close();

    } catch (error: any) {
      console.error('Error opening print window:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Membuka Print',
        text: error?.message || 'Terjadi kesalahan saat membuka halaman print. Silakan coba lagi.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleDelete = async (slip: SlipGaji) => {
    // Konfirmasi sebelum menghapus
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus slip gaji untuk ${slip.nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        // Debug: Log seluruh slip data
        console.log('=== DELETE PAYROLL DEBUG ===');
        console.log('Full slip object:', JSON.stringify(slip, null, 2));
        console.log('slip.id:', slip.id);
        console.log('slip.id type:', typeof slip.id);
        console.log('slip.id length:', slip.id?.length);
        console.log('ID equals empty string:', slip.id === '');
        console.log('ID is null:', slip.id === null);
        console.log('ID is undefined:', slip.id === undefined);
        console.log('ID is falsy:', !slip.id);
        
        // Cek semua IDs yang mungkin
        console.log('=== Checking alternate ID fields ===');
        console.log('slip.payroll_id:', (slip as any).payroll_id);
        console.log('slip.data:', (slip as any).data);
        console.log('================================');

        // Validasi ID lebih detil
        if (!slip.id || slip.id === '' || slip.id === 'null' || slip.id === 'undefined' || slip.id === null || slip.id === undefined) {
          console.error('Invalid ID detected:', {
            value: slip.id,
            type: typeof slip.id,
            isNull: slip.id === null,
            isUndefined: slip.id === undefined,
            isEmpty: slip.id === ''
          });
          throw new Error('ID payroll tidak valid. Silakan refresh halaman dan coba lagi.');
        }

        const token = localStorage.getItem('auth_token');
        const baseUrl = import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001';
        // Pastikan ID adalah string yang bersih
        const payrollId = String(slip.id).trim();
        const url = `${baseUrl}/api/master-data/payroll/${payrollId}`;
        
        console.log('✅ ID is valid, proceeding with deletion');
        console.log('Deleting payroll ID:', payrollId);
        console.log('URL:', url);
        
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('Delete response status:', response.status);

        const result = await response.json();
        console.log('Delete response data:', result);

        if (response.ok && result.status === 'success') {
          await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            html: result.message || 'Data payroll berhasil dihapus',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3b82f6'
          });
          
          // Refresh data slip gaji
          await fetchSlipData();
        } else {
          throw new Error(result.message || 'Gagal menghapus data');
        }
      } catch (err: any) {
        console.error('Error deleting payroll:', err);
        await Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: err?.message || 'Terjadi kesalahan saat menghapus data payroll',
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  // Generate slip gaji untuk bulan ini
  const handleGenerateSlipBulanIni = () => {
    const currentDate = new Date();
    const currentPeriode = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setGeneratePeriode(currentPeriode);
    setShowGenerateModal(true);
  };

  // Mock data karyawan untuk generate slip
  const mockEmployees = [
    { id: 'EMP001', nama: 'Ahmad Fauzi', divisi: 'Akademik', jabatan: 'Guru Matematika' },
    { id: 'EMP002', nama: 'Siti Nurhaliza', divisi: 'Akademik', jabatan: 'Guru Bahasa Indonesia' },
    { id: 'EMP003', nama: 'Budi Santoso', divisi: 'Administrasi', jabatan: 'Staff TU' },
    { id: 'EMP004', nama: 'Lisa Permata', divisi: 'Keuangan', jabatan: 'Staff Accounting' },
    { id: 'EMP005', nama: 'Andi Rahman', divisi: 'Akademik', jabatan: 'Guru IPA' },
    { id: 'EMP006', nama: 'Dewi Sartika', divisi: 'Administrasi', jabatan: 'Staff HR' },
  ];

  const handleGenerateConfirm = async () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate new slip gaji for selected employees
    const newSlips: SlipGaji[] = selectedEmployees.map((empId, index) => {
      const employee = mockEmployees.find(emp => emp.id === empId);
      if (!employee) return null;
      
      const baseGaji = 3500000 + Math.random() * 2000000;
      const tunjangan = baseGaji * 0.4;
      const lembur = Math.floor(Math.random() * 20) * 30000;
      const totalPendapatan = baseGaji + tunjangan + lembur;
      const totalPotongan = totalPendapatan * 0.15;
      const gajiDiterima = totalPendapatan - totalPotongan;
      
      return {
        id: `SLIP-${generatePeriode}-${String(index + 1).padStart(3, '0')}`,
        nip: employee.id,
        nama: employee.nama,
        divisi: employee.divisi,
        jabatan: employee.jabatan,
        periode: generatePeriode,
        
        // Pendapatan - Gaji Dasar & Tunjangan
        gajiPokok: Math.floor(baseGaji),
        tunjanganJabatan: Math.floor(tunjangan * 0.5),
        masaKerja: Math.floor(tunjangan * 0.1),
        waliKelas: 0,
        koordinator: 0,
        tatapmuka: 0,
        tatapMukaPengganti: 0,
        tunjanganKeluarga: Math.floor(tunjangan * 0.2),
        tunjanganLain: Math.floor(tunjangan * 0.1),
        transport: Math.floor(tunjangan * 0.15),
        makan: Math.floor(tunjangan * 0.15),
        jamsostek: 0,
        bpjs: 0,
        overtime: 0,
        
        // Insentif
        pramuka: 0,
        ekskul: 0,
        bimbel: 0,
        proyek: 0,
        insentifPramuka: 0,
        insentifEkskul: 0,
        insentifProyek: 0,
        insentifBimbel: 0,
        insentifLain: 0,
        
        // Lembur
        lemburHari: Math.floor(lembur / 30000),
        gajiLembur: lembur,
        
        // Total Pendapatan
        totalPendapatan: Math.floor(totalPendapatan),
        
        // Potongan Standar
        potonganYayasan: Math.floor(totalPotongan * 0.2),
        potonganLain: 0,
        potonganKoperasiWajib: 0,
        potonganKoperasiSukarela: 0,
        potonganAngsuranKoperasi: 0,
        depositAnnurmart: 0,
        potonganJHT: Math.floor(totalPotongan * 0.2),
        potonganPPH21: Math.floor(totalPotongan * 0.3),
        potonganTMukaPengganti: 0,
        
        // Potongan Lain
        potonganBPJS: Math.floor(totalPotongan * 0.5),
        potonganPajak: Math.floor(totalPotongan * 0.3),
        potonganAbsen: Math.floor(totalPotongan * 0.1),
        
        // Total Potongan & Net
        totalPotongan: Math.floor(totalPotongan),
        gajiDiterima: Math.floor(gajiDiterima),
        status: bulkStatus === 'draft' ? 'Draft' : bulkStatus === 'approved' ? 'Disetujui' : 'Dibayar',
        tanggalGenerate: new Date().toISOString().split('T')[0],
        tanggalBayar: bulkStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined
      };
    }).filter(Boolean) as SlipGaji[];
    
    // Add to slip data
    setSlipData(prev => [...newSlips, ...prev]);
    
    setIsGenerating(false);
    setShowGenerateModal(false);
    setSelectedEmployees([]);
    
    // Refresh data slip gaji dari backend
    fetchSlipData();
    
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: `Berhasil generate ${newSlips.length} slip gaji untuk periode ${formatPeriode(generatePeriode)}`,
      confirmButtonText: 'OK'
    });
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === mockEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(mockEmployees.map(emp => emp.id));
    }
  };

  const handleToggleEmployee = (empId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const handleUpdateStatus = (slipId: string, newStatus: SlipGaji['status']) => {
    setSlipData(prev => prev.map(slip => 
      slip.id === slipId 
        ? { 
            ...slip, 
            status: newStatus,
            tanggalBayar: newStatus === 'Dibayar' ? new Date().toISOString().split('T')[0] : slip.tanggalBayar
          }
        : slip
    ));
    setIsModalOpen(false);
  };

  // Bulk update status payroll menjadi "Dibayar"
  const handleBulkUpdateStatus = async () => {
    // Konfirmasi sebelum update
    const result = await Swal.fire({
      title: 'Konfirmasi Bulk Update Status',
      html: `Apakah Anda yakin ingin mengubah status <strong>semua payroll yang terfilter</strong> menjadi <strong>"Dibayar"</strong>?<br><br>Total: <strong>${filteredSlip.length}</strong> payroll`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Update Semua!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsBulkUpdating(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const baseUrl = import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001';
      
      // Update semua payroll yang terfilter
      const updatePromises = filteredSlip.map(async (slip) => {
        try {
          const response = await fetch(`${baseUrl}/api/master-data/payroll/${slip.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              status: 'Dibayar'
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Gagal update payroll ${slip.nama}`);
          }

          return await response.json();
        } catch (error: any) {
          console.error(`Error updating payroll ${slip.id}:`, error);
          throw error;
        }
      });

      // Tunggu semua update selesai
      await Promise.all(updatePromises);

      // Update local state
      setSlipData(prev => prev.map(slip => {
        const isInFiltered = filteredSlip.some(fs => fs.id === slip.id);
        if (isInFiltered) {
          return {
            ...slip,
            status: 'Dibayar' as const,
            tanggalBayar: new Date().toISOString().split('T')[0]
          };
        }
        return slip;
      }));

      // Refresh data dari backend
      await fetchSlipData();

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        html: `Status <strong>${filteredSlip.length}</strong> payroll berhasil diubah menjadi "Dibayar"`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6'
      });

    } catch (error: any) {
      console.error('Error bulk updating status:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Update',
        text: error?.message || 'Terjadi kesalahan saat mengupdate status payroll',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Export Excel dengan template modern dan professional
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Show loading
      Swal.fire({
        title: 'Memproses Export...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Tentukan periode untuk nama file
      const currentDate = new Date();
      const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                     'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const periode = selectedPeriode || `${bulan[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      
      // Data untuk di-export - SELALU gunakan filteredSlip (data yang sudah terfilter)
      // Jika tidak ada filter aktif, filteredSlip akan berisi semua data dari slipData
      const dataToExport = filteredSlip;
      
      if (dataToExport.length === 0) {
        await Swal.close();
        setIsExporting(false);
        Swal.fire({
          icon: 'warning',
          title: 'Tidak Ada Data',
          text: 'Tidak ada data payroll untuk diekspor',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6'
        });
        return;
      }

      // Fungsi format rupiah untuk Excel
      const formatRupiahExcel = (value: number | string | null | undefined): string => {
        if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
          return 'Rp 0';
        }
        const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d]/g, '')) : value;
        if (isNaN(numValue) || numValue === 0) {
          return 'Rp 0';
        }
        return 'Rp ' + Math.abs(numValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      };

      // Buat workbook baru dengan ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Payroll');

      // Header utama - align left
      // Total kolom: No(1) + Tgl(2) + Nama(3) + Jabatan(4) + MasaKerjaTahun(5) + GajiPokok(6) + TunjanganJabatan(7) + TunjanganMasaKerja(8) +
      // Tunjangan & Insentif (9-25=17) + Ringkasan (26-28=3) = 28 kolom (hapus Masa Kerja Rp)
      worksheet.mergeCells(1, 1, 1, 41);
      worksheet.getCell(1, 1).value = 'DATA PERHITUNGAN GAJI KARYAWAN';
      worksheet.getCell(1, 1).font = { size: 14, bold: true };
      worksheet.getCell(1, 1).alignment = { horizontal: 'left', vertical: 'middle' };
      
      worksheet.mergeCells(2, 1, 2, 41);
      worksheet.getCell(2, 1).value = 'YAYASAN NURROHIM CIKARANG BARU';
      worksheet.getCell(2, 1).font = { size: 12, bold: true };
      worksheet.getCell(2, 1).alignment = { horizontal: 'left', vertical: 'middle' };
      
      worksheet.mergeCells(3, 1, 3, 41);
      worksheet.getCell(3, 1).value = `Bulan: ${periode}`;
      worksheet.getCell(3, 1).font = { size: 11 };
      worksheet.getCell(3, 1).alignment = { horizontal: 'left', vertical: 'middle' };

      // Header tabel dengan warna kuning
      const tableHeaders = [
        [
          'No',
          'Tgl. Masuk',
          'Nama Karyawan',
          'Jabatan',
          'Masa Kerja (Tahun)',
          'Gaji Pokok',
          'Tunjangan Jabatan',
          'Tunjangan Masa Kerja',
          // KOMPONEN GAJI (BASIC) - TUNIANGAN
          'Wali Kelas',
          'Koordinator',
          'Tatap Muka',
          'Tatap Muka Pengganti',
          'Tunjangan Keluarga',
          'Tunjangan Lain',
          'Transport 01',
          'Transport 02',
          'Makan',
          'Jamsostek',
          'BPJS',
          'Overtime',
          'Insentif Lain',
          'Insentif Pengajar - Pramuka',
          'Insentif Pengajar - Ekstrakurikuler',
          'Insentif Pengajar - Proyek',
          'Insentif Pengajar - Bimbel',
          'TOTAL GAJI',
          'Iuran Wajib',
          'Iuran Sukarela',
          'Angsuran Hutang',
          'Angsuran ke Yayasan',
          'Deposit Annur Mart',
          'JHT',
          'PPh 21',
          'Tatap Muka Pengganti',
          'Lain Lain',
          'TOTAL POTONGAN',
          'GAJI BERSIH'
        ]
      ];

      // Fetch data lengkap dari backend untuk mendapatkan transport1, transport2, dll
      const fetchFullDataForExport = async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const baseUrl = import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001';
          const response = await fetch(`${baseUrl}/api/master-data/payroll`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          const data = await response.json();
          return response.ok && Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Error fetching full data for export:', error);
          return [];
        }
      };

      const fullData = await fetchFullDataForExport();
      
      // Data rows dengan data lengkap
      const dataRows = dataToExport.map((slip, index) => {
        // Cari data lengkap dari backend untuk slip ini
        const fullItem = fullData.find((item: any) => {
          const itemId = String(item.id || item.payroll_id || '');
          return itemId === slip.id;
        });

        // Hitung tanggal masuk dari TMT guru (prioritas utama)
        let tglMasuk = '-';
        if (fullItem?.guru?.tmt) {
          try {
            const tmtDate = new Date(fullItem.guru.tmt);
            if (!isNaN(tmtDate.getTime())) {
              tglMasuk = tmtDate.toLocaleDateString('id-ID');
            }
          } catch (e) {
            console.error('Error parsing TMT date:', e);
          }
        }
        
        // Jika masih tidak ada, coba dari guru_id dengan fetch terpisah
        if (tglMasuk === '-' && slip.id) {
          // Cari guru berdasarkan guru_id dari fullItem
          if (fullItem?.guru_id) {
            const guruInList = guruList.find(g => g.id === fullItem.guru_id || g.id === Number(fullItem.guru_id));
            if (guruInList?.tmt) {
              try {
                const tmtDate = new Date(guruInList.tmt);
                if (!isNaN(tmtDate.getTime())) {
                  tglMasuk = tmtDate.toLocaleDateString('id-ID');
                }
              } catch (e) {
                console.error('Error parsing TMT from guruList:', e);
              }
            }
          }
        }

        // Hitung masa kerja dalam tahun dari TMT (perbaiki perhitungan)
        let masaKerjaTahun = 0;
        let tmtDate: Date | null = null;
        
        // Coba ambil TMT dari fullItem
        if (fullItem?.guru?.tmt) {
          try {
            tmtDate = new Date(fullItem.guru.tmt);
            if (isNaN(tmtDate.getTime())) {
              tmtDate = null;
            }
          } catch (e) {
            tmtDate = null;
          }
        }
        
        // Jika belum ada, cari dari guruList
        if (!tmtDate && fullItem?.guru_id) {
          const guruInList = guruList.find(g => g.id === fullItem.guru_id || g.id === Number(fullItem.guru_id));
          if (guruInList?.tmt) {
            try {
              tmtDate = new Date(guruInList.tmt);
              if (isNaN(tmtDate.getTime())) {
                tmtDate = null;
              }
            } catch (e) {
              tmtDate = null;
            }
          }
        }
        
        // Hitung masa kerja jika TMT ada
        if (tmtDate) {
          const today = new Date();
          let years = today.getFullYear() - tmtDate.getFullYear();
          let months = today.getMonth() - tmtDate.getMonth();
          let days = today.getDate() - tmtDate.getDate();
          
          // Adjust for negative days
          if (days < 0) {
            months--;
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += prevMonth.getDate();
          }
          
          // Adjust for negative months
          if (months < 0) {
            years--;
            months += 12;
          }
          
          // Set masa kerja tahun (jika sudah lebih dari 1 tahun atau setidaknya 1 bulan)
          if (years > 0 || (years === 0 && months >= 1)) {
            masaKerjaTahun = years;
            // Jika sudah lebih dari 6 bulan di tahun ini, round up
            if (months >= 6 && years === 0) {
              masaKerjaTahun = 1;
            }
          }
          
          masaKerjaTahun = Math.max(0, masaKerjaTahun);
        }
        
        // Ambil transport1 dan transport2 total (rate × jumlah hari)
        const transport1Rate = fullItem ? (Number(fullItem.transport1) || 0) : Number((slip as any).transport1) || 0;
        const transport1Days = fullItem
          ? (Number(fullItem.jml_hari_transport1) || Number(fullItem.jumlah_hari) || 0)
          : Number((slip as any).jmlHariTransport1) || Number((slip as any).jumlahHari) || 0;
        let transport1Total = transport1Rate * transport1Days;
        if (!transport1Total && fullItem) {
          transport1Total = Number(fullItem.total_transport) || 0;
        }
        if (!transport1Total) {
          transport1Total = Number((slip as any).totalTransport) || 0;
        }

        const transport2Rate = fullItem ? (Number(fullItem.transport2) || 0) : Number((slip as any).transport2) || 0;
        const transport2Days = fullItem
          ? (Number(fullItem.jml_hari_transport2) || Number(fullItem.jumlah_hari_lain) || 0)
          : Number((slip as any).jmlHariTransport2) || Number((slip as any).jumlahHariLain) || 0;
        let transport2Total = transport2Rate * transport2Days;
        if (!transport2Total && fullItem) {
          transport2Total = Number(fullItem.total_transport2) || 0;
        }
        if (!transport2Total) {
          transport2Total = Number((slip as any).totalTransport2) || 0;
        }

        // Ambil proyek dari data lengkap (jika ada)
        const pramukaValue = fullItem ? (Number(fullItem.pramuka) || 0) : (slip.pramuka || 0);
        const ekskulValue = fullItem ? (Number(fullItem.ekskul) || 0) : (slip.ekskul || 0);
        const proyekValue = fullItem ? (Number(fullItem.proyek) || 0) : (slip.proyek || 0);
        const bimbelValue = fullItem ? (Number(fullItem.bimbel) || 0) : (slip.bimbel || 0);
        const insentifPengPramukaValue = fullItem ? (Number(fullItem.insentif_peng_pramuka) || 0) : (Number(slip.insentifPramuka) || 0);
        const insentifPengEkskulValue = fullItem ? (Number(fullItem.insentif_peng_ekskul) || 0) : (Number(slip.insentifEkskul) || 0);
        const insentifPengProyekValue = fullItem ? (Number(fullItem.insentif_peng_proyek) || 0) : (Number(slip.insentifProyek) || 0);
        const insentifPengBimbelValue = fullItem ? (Number(fullItem.insentif_pengurus_bimbel) || 0) : (Number(slip.insentifBimbel) || 0);
        const iuranWajibValue = fullItem ? (Number(fullItem.potongan_koperasi_wajib) || 0) : (Number(slip.potonganKoperasiWajib) || 0);
        const iuranSukarelaValue = fullItem ? (Number(fullItem.potongan_koperasi_sukarela) || 0) : (Number(slip.potonganKoperasiSukarela) || 0);
        const angsuranHutangValue = fullItem ? (Number(fullItem.potongan_angsuran_koperasi) || 0) : (Number(slip.potonganAngsuranKoperasi) || 0);
        const angsuranYayasanValue = fullItem ? (Number(fullItem.potongan_yayasan) || 0) : (Number(slip.potonganYayasan) || 0);
        const depositAnnurMartValue = fullItem ? (Number(fullItem.deposit_annurmart) || 0) : (Number(slip.depositAnnurmart) || 0);
        const potonganJhtValue = fullItem ? (Number(fullItem.potongan_jht) || 0) : (Number(slip.potonganJHT) || 0);
        const potonganPph21Value = fullItem ? (Number(fullItem.potongan_pph21) || 0) : (Number(slip.potonganPPH21) || 0);
        const potonganTMukaPenggantiValue = fullItem ? (Number(fullItem.potongan_t_muka_pengganti) || 0) : (Number(slip.potonganTMukaPengganti) || 0);
        const potonganLainValue = fullItem ? (Number(fullItem.potongan_lain) || 0) : (Number(slip.potonganLain) || 0);

        // Pastikan gajiDiterima tidak null/kosong
        const gajiDiterima = slip.gajiDiterima || (slip.totalGaji || 0) - (slip.totalPotongan || 0);
        
        return [
          index + 1, // No
          tglMasuk, // Tgl. Masuk
          slip.nama, // Nama Karyawan
          slip.jabatan, // Jabatan
          masaKerjaTahun, // Masa Kerja (Tahun)
          formatRupiahExcel(slip.gajiPokok || 0), // Gaji Pokok
          formatRupiahExcel(slip.tunjanganJabatan || 0), // Tunjangan Jabatan
          formatRupiahExcel(slip.masaKerja || 0), // Tunjangan Masa Kerja
          // KOMPONEN GAJI (BASIC) - TUNIANGAN
          formatRupiahExcel(slip.waliKelas || 0), // Wali Kelas
          formatRupiahExcel(slip.koordinator || 0), // Koordinator
          formatRupiahExcel(slip.tatapmuka || 0), // Tatap Muka
          formatRupiahExcel(slip.tatapMukaPengganti || 0), // Tatap Muka Pengganti
          formatRupiahExcel(slip.tunjanganKeluarga || 0), // Tunjangan Keluarga
          formatRupiahExcel(slip.tunjanganLain || 0), // Tunjangan Lain
          formatRupiahExcel(transport1Total || 0), // Transport 01
          formatRupiahExcel(transport2Total || 0), // Transport 02
          formatRupiahExcel(slip.makan || 0), // Makan
          formatRupiahExcel(slip.jamsostek || 0), // Jamsostek
          formatRupiahExcel(slip.bpjs || 0), // BPJS
          formatRupiahExcel(slip.overtime || 0), // Overtime
          formatRupiahExcel(slip.insentifLain || 0), // Insentif Lain
          formatRupiahExcel(pramukaValue), // Pramuka
          formatRupiahExcel(ekskulValue), // Ekstrakurikuler
          formatRupiahExcel(proyekValue), // Proyek
          formatRupiahExcel(bimbelValue), // Bimbel
          formatRupiahExcel(insentifPengPramukaValue), // Pramuka (Insentif Pengajar)
          formatRupiahExcel(insentifPengEkskulValue), // Ekstrakurikuler (Insentif Pengajar)
          formatRupiahExcel(insentifPengProyekValue), // Proyek (Insentif Pengajar)
          formatRupiahExcel(insentifPengBimbelValue), // Bimbel (Insentif Pengajar)
          formatRupiahExcel(slip.totalGaji || 0), // TOTAL GAJI
          formatRupiahExcel(iuranWajibValue), // Iuran Wajib
          formatRupiahExcel(iuranSukarelaValue), // Iuran Sukarela
          formatRupiahExcel(angsuranHutangValue), // Angsuran Hutang
          formatRupiahExcel(angsuranYayasanValue), // Angsuran ke Yayasan
          formatRupiahExcel(depositAnnurMartValue), // Deposit Annur Mart
          formatRupiahExcel(potonganJhtValue), // JHT
          formatRupiahExcel(potonganPph21Value), // PPh 21
          formatRupiahExcel(potonganTMukaPenggantiValue), // Tatap Muka Pengganti (Potongan)
          formatRupiahExcel(potonganLainValue), // Lain Lain
          formatRupiahExcel(slip.totalPotongan || 0), // TOTAL POTONGAN
          formatRupiahExcel(gajiDiterima) // GAJI BERSIH (perbaiki jika null)
        ];
      });

      // Calculate totals dengan data lengkap
      let totalTransport1 = 0;
      let totalTransport2 = 0;
      let totalPramuka = 0;
      let totalEkskul = 0;
      let totalProyek = 0;
      let totalBimbel = 0;
      let totalIuranWajib = 0;
      let totalIuranSukarela = 0;
      let totalAngsuranHutang = 0;
      let totalAngsuranYayasan = 0;
      let totalDepositAnnurMart = 0;
      let totalJHT = 0;
      let totalPPH21 = 0;
      let totalPotonganTMukaPengganti = 0;
      let totalPotonganLain = 0;

      dataToExport.forEach((slip) => {
        const fullItem = fullData.find((item: any) => {
          const itemId = String(item.id || item.payroll_id || '');
          return itemId === slip.id;
        });
        if (fullItem) {
          const transport1Rate = Number(fullItem.transport1) || 0;
          const transport1Days = Number(fullItem.jml_hari_transport1) || Number(fullItem.jumlah_hari) || 0;
          const transport1Total =
            transport1Rate * transport1Days ||
            Number(fullItem.total_transport) ||
            0;

          const transport2Rate = Number(fullItem.transport2) || 0;
          const transport2Days = Number(fullItem.jml_hari_transport2) || Number(fullItem.jumlah_hari_lain) || 0;
          const transport2Total =
            transport2Rate * transport2Days ||
            Number(fullItem.total_transport2) ||
            0;

          totalTransport1 += transport1Total;
          totalTransport2 += transport2Total;
          totalPramuka += Number(fullItem.pramuka) || 0;
          totalEkskul += Number(fullItem.ekskul) || 0;
          totalProyek += Number(fullItem.proyek) || 0;
          totalBimbel += Number(fullItem.bimbel) || 0;
          totalIuranWajib += Number(fullItem.potongan_koperasi_wajib) || 0;
          totalIuranSukarela += Number(fullItem.potongan_koperasi_sukarela) || 0;
          totalAngsuranHutang += Number(fullItem.potongan_angsuran_koperasi) || 0;
          totalAngsuranYayasan += Number(fullItem.potongan_yayasan) || 0;
          totalDepositAnnurMart += Number(fullItem.deposit_annurmart) || 0;
          totalJHT += Number(fullItem.potongan_jht) || 0;
          totalPPH21 += Number(fullItem.potongan_pph21) || 0;
          totalPotonganTMukaPengganti += Number(fullItem.potongan_t_muka_pengganti) || 0;
          totalPotonganLain += Number(fullItem.potongan_lain) || 0;
        } else {
          const slipTransport1Total =
            (Number((slip as any).transport1) || 0) *
            (Number((slip as any).jmlHariTransport1) || 0);
          const slipTransport2Total =
            (Number((slip as any).transport2) || 0) *
            (Number((slip as any).jmlHariTransport2) || 0);

          let fallbackTransport1 = slipTransport1Total;
          let fallbackTransport2 = slipTransport2Total;

          if (!fallbackTransport1) {
            fallbackTransport1 = Number((slip as any).totalTransport) || 0;
          }
          if (!fallbackTransport2) {
            fallbackTransport2 = Number((slip as any).totalTransport2) || 0;
          }

          totalTransport1 += fallbackTransport1;
          totalTransport2 += fallbackTransport2;
          totalPramuka += slip.pramuka || 0;
          totalEkskul += slip.ekskul || 0;
          totalProyek += slip.proyek || 0;
          totalBimbel += slip.bimbel || 0;
          totalIuranWajib += Number(slip.potonganKoperasiWajib) || 0;
          totalIuranSukarela += Number(slip.potonganKoperasiSukarela) || 0;
          totalAngsuranHutang += Number(slip.potonganAngsuranKoperasi) || 0;
          totalAngsuranYayasan += Number(slip.potonganYayasan) || 0;
          totalDepositAnnurMart += Number(slip.depositAnnurmart) || 0;
          totalJHT += Number(slip.potonganJHT) || 0;
          totalPPH21 += Number(slip.potonganPPH21) || 0;
          totalPotonganTMukaPengganti += Number(slip.potonganTMukaPengganti) || 0;
          totalPotonganLain += Number(slip.potonganLain) || 0;
        }
      });

      // Total row dengan format rupiah dan perbaiki total gaji diterima
      const totalGaji = dataToExport.reduce((acc, slip) => acc + (slip.totalGaji || 0), 0);
      const totalPotongan = dataToExport.reduce((acc, slip) => acc + (slip.totalPotongan || 0), 0);
      const totalGajiDiterima = dataToExport.reduce((acc, slip) => {
        const gajiDiterima = slip.gajiDiterima || (slip.totalGaji || 0) - (slip.totalPotongan || 0);
        return acc + Math.max(0, gajiDiterima);
      }, 0);

      // Hitung total Masa Kerja (Tahun) untuk total row
      const totalMasaKerjaTahun = dataToExport.reduce((acc, slip) => {
        // Hitung masa kerja tahun untuk setiap slip
        const fullItem = fullData.find((item: any) => {
          const itemId = String(item.id || item.payroll_id || '');
          return itemId === slip.id;
        });
        
        let tmtDate: Date | null = null;
        if (fullItem?.guru?.tmt) {
          try {
            tmtDate = new Date(fullItem.guru.tmt);
            if (isNaN(tmtDate.getTime())) tmtDate = null;
          } catch (e) {
            tmtDate = null;
          }
        }
        
        if (!tmtDate && fullItem?.guru_id) {
          const guruInList = guruList.find(g => g.id === fullItem.guru_id || g.id === Number(fullItem.guru_id));
          if (guruInList?.tmt) {
            try {
              tmtDate = new Date(guruInList.tmt);
              if (isNaN(tmtDate.getTime())) tmtDate = null;
            } catch (e) {
              tmtDate = null;
            }
          }
        }
        
        if (tmtDate) {
          const today = new Date();
          let years = today.getFullYear() - tmtDate.getFullYear();
          let months = today.getMonth() - tmtDate.getMonth();
          if (months < 0) {
            years--;
          }
          return acc + Math.max(0, years);
        }
        return acc;
      }, 0);

      const totalRow = [
        'TOTAL',
        '',
        '',
        '',
        '', // Total Masa Kerja (Tahun) dihilangkan
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.gajiPokok || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.tunjanganJabatan || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.masaKerja || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.waliKelas || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.koordinator || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.tatapmuka || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.tatapMukaPengganti || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.tunjanganKeluarga || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.tunjanganLain || 0), 0)),
        formatRupiahExcel(totalTransport1),
        formatRupiahExcel(totalTransport2),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.makan || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.jamsostek || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.bpjs || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.overtime || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.insentifLain || 0), 0)),
        formatRupiahExcel(totalPramuka),
        formatRupiahExcel(totalEkskul),
        formatRupiahExcel(totalProyek),
        formatRupiahExcel(totalBimbel),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (Number(slip.insentifPramuka) || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (Number(slip.insentifEkskul) || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (Number(slip.insentifProyek) || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (Number(slip.insentifBimbel) || 0), 0)),
        formatRupiahExcel(totalGaji), // TOTAL GAJI
        formatRupiahExcel(totalIuranWajib), // Iuran Wajib
        formatRupiahExcel(totalIuranSukarela), // Iuran Sukarela
        formatRupiahExcel(totalAngsuranHutang), // Angsuran Hutang
        formatRupiahExcel(totalAngsuranYayasan), // Angsuran ke Yayasan
        formatRupiahExcel(totalDepositAnnurMart), // Deposit Annur Mart
        formatRupiahExcel(totalJHT), // JHT
        formatRupiahExcel(totalPPH21), // PPh 21
        formatRupiahExcel(totalPotonganTMukaPengganti), // Tatap Muka Pengganti
        formatRupiahExcel(totalPotonganLain), // Lain Lain
        formatRupiahExcel(totalPotongan), // TOTAL POTONGAN
        formatRupiahExcel(totalGajiDiterima) // GAJI BERSIH (diperbaiki)
      ];

      // Set row 5 untuk header tabel (row 4 kosong sebagai spacing)
      const headerRow = 5;
      tableHeaders[0].forEach((header, colIndex) => {
        const cell = worksheet.getCell(headerRow, colIndex + 1);
        cell.value = header;
        cell.font = { bold: true, size: 11 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEB3B' } // Yellow color
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Set column widths
      worksheet.getColumn(1).width = 5;   // No
      worksheet.getColumn(2).width = 12; // Tgl. Masuk
      worksheet.getColumn(3).width = 25; // Nama Karyawan
      worksheet.getColumn(4).width = 20; // Jabatan
      worksheet.getColumn(5).width = 15; // Masa Kerja (Tahun)
      worksheet.getColumn(6).width = 18; // Gaji Pokok
      worksheet.getColumn(7).width = 18; // Tunjangan Jabatan
      worksheet.getColumn(8).width = 18; // Tunjangan Masa Kerja
      worksheet.getColumn(9).width = 12; // Wali Kelas
      worksheet.getColumn(10).width = 12; // Koordinator
      worksheet.getColumn(11).width = 15; // Tatap Muka
      worksheet.getColumn(12).width = 20; // Tatap Muka Pengganti
      worksheet.getColumn(13).width = 18; // Tunjangan Keluarga
      worksheet.getColumn(14).width = 15; // Tunjangan Lain
      worksheet.getColumn(15).width = 15; // Transport 01
      worksheet.getColumn(16).width = 15; // Transport 02
      worksheet.getColumn(17).width = 12; // Makan
      worksheet.getColumn(18).width = 12; // Jamsostek
      worksheet.getColumn(19).width = 12; // BPJS
      worksheet.getColumn(20).width = 12; // Overtime
      worksheet.getColumn(21).width = 15; // Insentif Lain
      worksheet.getColumn(22).width = 12; // Pramuka
      worksheet.getColumn(23).width = 15; // Ekstrakurikuler
      worksheet.getColumn(24).width = 12; // Proyek
      worksheet.getColumn(25).width = 12; // Bimbel
      worksheet.getColumn(26).width = 12; // Pramuka (Insentif Pengajar)
      worksheet.getColumn(27).width = 15; // Ekstrakurikuler (Insentif Pengajar)
      worksheet.getColumn(28).width = 12; // Proyek (Insentif Pengajar)
      worksheet.getColumn(29).width = 12; // Bimbel (Insentif Pengajar)
      worksheet.getColumn(30).width = 18; // TOTAL GAJI
      worksheet.getColumn(31).width = 15; // Iuran Wajib
      worksheet.getColumn(32).width = 15; // Iuran Sukarela
      worksheet.getColumn(33).width = 15; // Angsuran Hutang
      worksheet.getColumn(34).width = 15; // Angsuran ke Yayasan
      worksheet.getColumn(35).width = 15; // Deposit Annur Mart
      worksheet.getColumn(36).width = 12; // JHT
      worksheet.getColumn(37).width = 12; // PPh 21
      worksheet.getColumn(38).width = 15; // Tatap Muka Pengganti (Potongan)
      worksheet.getColumn(39).width = 15; // Lain Lain
      worksheet.getColumn(40).width = 20; // TOTAL POTONGAN
      worksheet.getColumn(41).width = 22; // GAJI BERSIH

      // Add data rows
      dataRows.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const cell = worksheet.getCell(headerRow + 1 + rowIndex, colIndex + 1);
          cell.value = value;
          cell.alignment = { vertical: 'middle', wrapText: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          // Format angka sebagai text dengan rupiah sudah dilakukan di formatRupiahExcel
        });
      });
      // Add total row dengan bold
      totalRow.forEach((value, colIndex) => {
        const cell = worksheet.getCell(headerRow + 1 + dataRows.length, colIndex + 1);
        cell.value = value;
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (typeof value === 'string' && value !== '' && value !== 'TOTAL') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' } // Light gray untuk total row
          };
        }
      });

      const signatureStartRow = headerRow + 1 + dataRows.length + 2;
      const signatureNameRow = signatureStartRow + 3;
      const signatureTitleRow = signatureNameRow + 1;
      const signatureSections = [
        { startCol: 1, endCol: 14, header: 'DIBUAT', name: 'SUARNI, A.Md', title: 'Staff Tata Usaha' },
        { startCol: 15, endCol: 27, header: 'MENGETAHUI', name: 'Windiarti, SE', title: 'Kepala Tata Usaha' },
        { startCol: 28, endCol: 41, header: "MENYETUJUI", name: "Nova Rabi'ah Nurrochmah, SE, MM", title: 'Direktur Keuangan' }
      ];

      signatureSections.forEach((section) => {
        worksheet.mergeCells(signatureStartRow, section.startCol, signatureStartRow, section.endCol);
        const headerCell = worksheet.getCell(signatureStartRow, section.startCol);
        headerCell.value = section.header;
        headerCell.font = { bold: true };
        headerCell.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.mergeCells(signatureNameRow, section.startCol, signatureNameRow, section.endCol);
        const nameCell = worksheet.getCell(signatureNameRow, section.startCol);
        nameCell.value = section.name;
        nameCell.font = { bold: true, underline: true };
        nameCell.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.mergeCells(signatureTitleRow, section.startCol, signatureTitleRow, section.endCol);
        const titleCell = worksheet.getCell(signatureTitleRow, section.startCol);
        titleCell.value = section.title;
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Generate filename
      const filename = `Data_Perhitungan_Gaji_${periode.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      // Close loading
      await Swal.close();
      setIsExporting(false);

      // Show success notification
      Swal.fire({
        icon: 'success',
        title: 'Berhasil! 🎉',
        text: `Data payroll berhasil diekspor ke Excel (${dataToExport.length} karyawan)`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6',
        timer: 2000
      });
    } catch (error: any) {
      console.error('Error exporting Excel:', error);
      setIsExporting(false);
      await Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengekspor',
        text: error?.message || 'Terjadi kesalahan saat mengekspor data ke Excel',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#ef4444'
      });
    }
  };
  // Export Laporan Yayasan dengan logo dan field tambahan
  const handleExportLaporanYayasan = async () => {
    setIsExportingLaporanYayasan(true);
    try {
      // Show loading
      Swal.fire({
        title: 'Memproses Laporan Yayasan...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Data untuk di-export - SELALU gunakan filteredSlip (data yang sudah terfilter)
      const dataToExport = filteredSlip;
      
      if (dataToExport.length === 0) {
        await Swal.close();
        setIsExportingLaporanYayasan(false);
        Swal.fire({
          icon: 'warning',
          title: 'Tidak Ada Data',
          text: 'Tidak ada data payroll untuk diekspor',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6'
        });
        return;
      }

      // Parse periode untuk ambil bulan dan tahun dari filter atau data
      const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                     'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      
      let namaBulan = '';
      let tahun = '';
      
      // Jika ada selectedPeriode dari filter, gunakan itu (prioritas utama)
      if (selectedPeriode && selectedPeriode.trim() !== '') {
        const periodeTrimmed = selectedPeriode.trim();
        
        // Cek format "YYYY-MM" (contoh: "2025-10")
        if (periodeTrimmed.match(/^\d{4}-\d{2}$/)) {
          const [y, m] = periodeTrimmed.split('-');
          if (y && m) {
            tahun = y;
            const monthNum = parseInt(m, 10);
            if (monthNum >= 1 && monthNum <= 12) {
              namaBulan = bulan[monthNum - 1];
            }
          }
        }
        // Cek format "Bulan-Tahun" (contoh: "Oktober-2025")
        else if (periodeTrimmed.includes('-')) {
          const parts = periodeTrimmed.split('-');
          if (parts.length >= 2) {
            // Cek apakah bagian pertama adalah nama bulan
            const firstPart = parts[0].trim();
            const lastPart = parts[parts.length - 1].trim();
            
            if (bulan.includes(firstPart)) {
              // Format: "Oktober-2025"
              namaBulan = firstPart;
              tahun = lastPart;
            } else if (lastPart.match(/^\d{4}$/)) {
              // Format: mungkin "Bulan-Tahun" tapi bulan tidak terdeteksi, coba cari di array
              const foundMonth = parts.find(part => bulan.includes(part.trim()));
              if (foundMonth) {
                namaBulan = foundMonth.trim();
                tahun = lastPart;
              }
            }
          }
        }
        // Cek format "Bulan Tahun" dengan spasi (contoh: "Oktober 2025")
        else {
          const periodeParts = periodeTrimmed.split(/\s+/);
          if (periodeParts.length >= 2) {
            const foundMonth = periodeParts.find(part => bulan.includes(part));
            if (foundMonth) {
              namaBulan = foundMonth;
              const foundYear = periodeParts.find(part => /^\d{4}$/.test(part));
              tahun = foundYear || periodeParts[periodeParts.length - 1];
            } else {
              namaBulan = periodeParts[0];
              tahun = periodeParts[periodeParts.length - 1];
            }
          }
        }
      }
      
      // Jika masih kosong, ambil dari data yang di-export (periode dari slip pertama)
      if (!namaBulan || !tahun) {
        const firstSlip = dataToExport[0];
        if (firstSlip?.periode) {
          const slipPeriode = firstSlip.periode;
          // Cek format "Bulan Tahun" (contoh: "Januari 2024")
          const periodeParts = slipPeriode.split(' ');
          if (periodeParts.length >= 2) {
            namaBulan = periodeParts[0];
            tahun = periodeParts[1];
          } else if (slipPeriode.includes('-')) {
            // Format "YYYY-MM"
            const [y, m] = slipPeriode.split('-');
            if (y && m && y.match(/^\d{4}$/) && m.match(/^\d{2}$/)) {
              tahun = y;
              const monthIndex = parseInt(m) - 1;
              if (monthIndex >= 0 && monthIndex < 12) {
                namaBulan = bulan[monthIndex];
              }
            }
          }
        }
      }
      
      // Fallback ke current date jika masih kosong
      if (!namaBulan || !tahun) {
        const currentDate = new Date();
        namaBulan = bulan[currentDate.getMonth()];
        tahun = currentDate.getFullYear().toString();
      }

      // Ambil unique unit/divisi dari data yang di-export
      const uniqueUnits = new Set<string>();
      dataToExport.forEach(slip => {
        if (slip.divisi) {
          uniqueUnits.add(slip.divisi);
        }
      });
      const unitText = uniqueUnits.size === 1 
        ? `${Array.from(uniqueUnits)[0]} ANNUR` 
        : uniqueUnits.size > 1 
          ? 'Semua Unit ANNUR' 
          : '-';

      // Fungsi format rupiah untuk Excel
      const formatRupiahExcel = (value: number | string | null | undefined): string => {
        if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
          return 'Rp 0';
        }
        const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d]/g, '')) : value;
        if (isNaN(numValue) || numValue === 0) {
          return 'Rp 0';
        }
        return 'Rp ' + Math.abs(numValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      };

      // Buat workbook baru dengan ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Yayasan');

      // Set row height
      worksheet.getRow(1).height = 25;
      worksheet.getRow(2).height = 25;
      worksheet.getRow(3).height = 25;
      worksheet.getRow(4).height = 25;
      worksheet.getRow(5).height = 10; // Spacing
      worksheet.getRow(6).height = 25;

      // Row 1: Judul utama (center, hitam)
      worksheet.mergeCells(1, 1, 1, 28);
      const header1 = worksheet.getCell(1, 1);
      header1.value = 'LAPORAN GAJI GURU & KARYAWAN';
      header1.font = { size: 14, bold: true, color: { argb: 'FF000000' } }; // Black
      header1.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Row 2: YPI NURRAHIM ANNUR (center, hitam)
      worksheet.mergeCells(2, 1, 2, 28);
      const header2 = worksheet.getCell(2, 1);
      header2.value = 'YPI NURRAHIM ANNUR';
      header2.font = { size: 12, bold: true, color: { argb: 'FF000000' } }; // Black
      header2.alignment = { horizontal: 'center', vertical: 'middle' };

      // Row 3: Unit (kiri)
      worksheet.mergeCells(3, 1, 3, 8);
      const unitCell = worksheet.getCell(3, 1);
      unitCell.value = `UNIT : ${unitText}`;
      unitCell.font = { size: 11 };
      unitCell.alignment = { horizontal: 'left', vertical: 'middle' };

      // Row 4: Periode (kiri)
      worksheet.mergeCells(4, 1, 4, 8);
      const periodeCell = worksheet.getCell(4, 1);
      periodeCell.value = `PERIODE : ${namaBulan} ${tahun}`;
      periodeCell.font = { size: 11 };
      periodeCell.alignment = { horizontal: 'left', vertical: 'middle' };

      // Row 6: Penanda Penerimaan (F6:AM6)
      worksheet.mergeCells(6, 6, 6, 29);
      const penerimaanHeaderCell = worksheet.getCell(6, 6);
      penerimaanHeaderCell.value = 'PENERIMAAN';
      penerimaanHeaderCell.font = { size: 11 };
      penerimaanHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
      penerimaanHeaderCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF92D050' }
      };
      penerimaanHeaderCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      worksheet.mergeCells(6, 31, 6, 39);
      const potonganHeaderCell = worksheet.getCell(6, 31);
      potonganHeaderCell.value = 'POTONGAN';
      potonganHeaderCell.font = { size: 11 };
      potonganHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
      potonganHeaderCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFC000' }
      };
      potonganHeaderCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      // Sisipkan baris kosong setelah baris ke-6 sebagai pemisah visual
      const spacerRow = worksheet.insertRow(7, []);
      spacerRow.height = 18;

      worksheet.mergeCells(7, 22, 7, 25);
      const insentifHeaderCell = worksheet.getCell(7, 22);
      insentifHeaderCell.value = 'Insentif Pengajar';
      insentifHeaderCell.font = { size: 11, bold: true };
      insentifHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
      insentifHeaderCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFA9D18E' }
      };
      insentifHeaderCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      worksheet.mergeCells(7, 26, 7, 29);
      const insentifPengurusCell = worksheet.getCell(7, 26);
      insentifPengurusCell.value = 'Insentif Pengurus';
      insentifPengurusCell.font = { size: 11, bold: true };
      insentifPengurusCell.alignment = { horizontal: 'center', vertical: 'middle' };
      insentifPengurusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFA9D18E' }
      };
      insentifPengurusCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      worksheet.mergeCells(7, 31, 7, 33);
      const koperasiHeaderCell = worksheet.getCell(7, 31);
      koperasiHeaderCell.value = 'KOPERASI';
      koperasiHeaderCell.font = { size: 11, bold: true };
      koperasiHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
      koperasiHeaderCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00B050' }
      };
      koperasiHeaderCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      worksheet.mergeCells(6, 1, 8, 1);
      worksheet.mergeCells(6, 2, 8, 2);
      worksheet.mergeCells(6, 3, 8, 3);
      worksheet.mergeCells(6, 4, 8, 4);
      worksheet.mergeCells(6, 5, 8, 5);
      const columnsToMergeRow7To8 = [
        6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
        34, 35, 36, 37, 38, 39
      ];
      columnsToMergeRow7To8.forEach((col) => {
        worksheet.mergeCells(7, col, 8, col);
      });

      worksheet.mergeCells(6, 30, 8, 30);
      worksheet.mergeCells(6, 40, 8, 40);
      worksheet.mergeCells(6, 41, 8, 41);

      // Header tabel dengan warna kuning 
      const tableHeaders = [
        [
          'No',
          'Tgl. Masuk',
          'Nama Karyawan',
          'Jabatan',
          'Masa Kerja (Tahun)',
          'Gaji Pokok',
          'Tunjangan Jabatan',
          'Tunjangan Masa Kerja',
          // KOMPONEN GAJI (BASIC) - TUNIANGAN
          'Wali Kelas',
          'Koordinator',
          'Tatap Muka',
          'Tatap Muka Pengganti',
          'Tunjangan Keluarga',
          'Tunjangan Lain',
          'Transport 01',
          'Transport 02',
          'Makan',
          'Jamsostek',
          'BPJS',
          'Overtime',
          'Insentif Lain',
          'Pramuka',
          'Ekstrakurikuler',
          'Proyek',
          'Bimbel',
          'Pramuka',
          'Ekstrakurikuler',
          'Proyek',
          'Bimbel',
          'TOTAL GAJI',
          'Iuran Wajib',
          'Iuran Sukarela',
          'Angsuran Hutang',
          'Angsuran ke Yayasan',
          'Deposit Annur Mart',
          'JHT',
          'PPh 21',
          'Tatap Muka Pengganti',
          'Lain Lain',
          'TOTAL POTONGAN',
          'GAJI BERSIH'
        ]
      ];

      // Fetch data lengkap dari backend untuk mendapatkan transport1, transport2, dll
      const fetchFullDataForExport = async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const baseUrl = import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001';
          const response = await fetch(`${baseUrl}/api/master-data/payroll`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          const data = await response.json();
          return response.ok && Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Error fetching full data for export:', error);
          return [];
        }
      };

      const fullData = await fetchFullDataForExport();
      
      // Data rows dengan data lengkap (sama seperti handleExportExcel)
      const dataRows = dataToExport.map((slip, index) => {
        // Cari data lengkap dari backend untuk slip ini
        const fullItem = fullData.find((item: any) => {
          const itemId = String(item.id || item.payroll_id || '');
          return itemId === slip.id;
        });

        // Hitung tanggal masuk dari TMT guru (prioritas utama)
        let tglMasuk = '-';
        if (fullItem?.guru?.tmt) {
          try {
            const tmtDate = new Date(fullItem.guru.tmt);
            if (!isNaN(tmtDate.getTime())) {
              tglMasuk = tmtDate.toLocaleDateString('id-ID');
            }
          } catch (e) {
            console.error('Error parsing TMT date:', e);
          }
        }
        
        // Jika masih tidak ada, coba dari guru_id dengan fetch terpisah
        if (tglMasuk === '-' && slip.id) {
          // Cari guru berdasarkan guru_id dari fullItem
          if (fullItem?.guru_id) {
            const guruInList = guruList.find(g => g.id === fullItem.guru_id || g.id === Number(fullItem.guru_id));
            if (guruInList?.tmt) {
              try {
                const tmtDate = new Date(guruInList.tmt);
                if (!isNaN(tmtDate.getTime())) {
                  tglMasuk = tmtDate.toLocaleDateString('id-ID');
                }
              } catch (e) {
                console.error('Error parsing TMT from guruList:', e);
              }
            }
          }
        }

        // Hitung masa kerja dalam tahun dari TMT (perbaiki perhitungan)
        let masaKerjaTahun = 0;
        let tmtDate: Date | null = null;
        
        // Coba ambil TMT dari fullItem
        if (fullItem?.guru?.tmt) {
          try {
            tmtDate = new Date(fullItem.guru.tmt);
            if (isNaN(tmtDate.getTime())) {
              tmtDate = null;
            }
          } catch (e) {
            tmtDate = null;
          }
        }
        
        // Jika belum ada, cari dari guruList
        if (!tmtDate && fullItem?.guru_id) {
          const guruInList = guruList.find(g => g.id === fullItem.guru_id || g.id === Number(fullItem.guru_id));
          if (guruInList?.tmt) {
            try {
              tmtDate = new Date(guruInList.tmt);
              if (isNaN(tmtDate.getTime())) {
                tmtDate = null;
              }
            } catch (e) {
              tmtDate = null;
            }
          }
        }
        
        // Hitung masa kerja jika TMT ada
        if (tmtDate) {
          const today = new Date();
          let years = today.getFullYear() - tmtDate.getFullYear();
          let months = today.getMonth() - tmtDate.getMonth();
          let days = today.getDate() - tmtDate.getDate();
          
          // Adjust for negative days
          if (days < 0) {
            months--;
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += prevMonth.getDate();
          }
          
          // Adjust for negative months
          if (months < 0) {
            years--;
            months += 12;
          }
          
          // Set masa kerja tahun (jika sudah lebih dari 1 tahun atau setidaknya 1 bulan)
          if (years > 0 || (years === 0 && months >= 1)) {
            masaKerjaTahun = years;
            // Jika sudah lebih dari 6 bulan di tahun ini, round up
            if (months >= 6 && years === 0) {
              masaKerjaTahun = 1;
            }
          }
          
          masaKerjaTahun = Math.max(0, masaKerjaTahun);
        }

        // Ambil transport1 dan transport2 total (rate × jumlah hari)
        const transport1Rate = fullItem ? (Number(fullItem.transport1) || 0) : Number((slip as any).transport1) || 0;
        const transport1Days = fullItem
          ? (Number(fullItem.jml_hari_transport1) || Number(fullItem.jumlah_hari) || 0)
          : Number((slip as any).jmlHariTransport1) || Number((slip as any).jumlahHari) || 0;
        let transport1Total = transport1Rate * transport1Days;
        if (!transport1Total && fullItem) {
          transport1Total = Number(fullItem.total_transport) || 0;
        }
        if (!transport1Total) {
          transport1Total = Number((slip as any).totalTransport) || 0;
        }

        const transport2Rate = fullItem ? (Number(fullItem.transport2) || 0) : Number((slip as any).transport2) || 0;
        const transport2Days = fullItem
          ? (Number(fullItem.jml_hari_transport2) || Number(fullItem.jumlah_hari_lain) || 0)
          : Number((slip as any).jmlHariTransport2) || Number((slip as any).jumlahHariLain) || 0;
        let transport2Total = transport2Rate * transport2Days;
        if (!transport2Total && fullItem) {
          transport2Total = Number(fullItem.total_transport2) || 0;
        }
        if (!transport2Total) {
          transport2Total = Number((slip as any).totalTransport2) || 0;
        }

        // Ambil proyek dari data lengkap (jika ada)
        const pramukaValue = fullItem ? (Number(fullItem.pramuka) || 0) : (slip.pramuka || 0);
        const ekskulValue = fullItem ? (Number(fullItem.ekskul) || 0) : (slip.ekskul || 0);
        const proyekValue = fullItem ? (Number(fullItem.proyek) || 0) : (slip.proyek || 0);
        const bimbelValue = fullItem ? (Number(fullItem.bimbel) || 0) : (slip.bimbel || 0);
        const insentifPengPramukaValue = fullItem ? (Number(fullItem.insentif_peng_pramuka) || 0) : (Number(slip.insentifPramuka) || 0);
        const insentifPengEkskulValue = fullItem ? (Number(fullItem.insentif_peng_ekskul) || 0) : (Number(slip.insentifEkskul) || 0);
        const insentifPengProyekValue = fullItem ? (Number(fullItem.insentif_peng_proyek) || 0) : (Number(slip.insentifProyek) || 0);
        const insentifPengBimbelValue = fullItem ? (Number(fullItem.insentif_pengurus_bimbel) || 0) : (Number(slip.insentifBimbel) || 0);
        const iuranWajibValue = fullItem ? (Number(fullItem.potongan_koperasi_wajib) || 0) : (Number(slip.potonganKoperasiWajib) || 0);
        const iuranSukarelaValue = fullItem ? (Number(fullItem.potongan_koperasi_sukarela) || 0) : (Number(slip.potonganKoperasiSukarela) || 0);
        const angsuranHutangValue = fullItem ? (Number(fullItem.potongan_angsuran_koperasi) || 0) : (Number(slip.potonganAngsuranKoperasi) || 0);
        const angsuranYayasanValue = fullItem ? (Number(fullItem.potongan_yayasan) || 0) : (Number(slip.potonganYayasan) || 0);
        const depositAnnurMartValue = fullItem ? (Number(fullItem.deposit_annurmart) || 0) : (Number(slip.depositAnnurmart) || 0);
        const potonganJhtValue = fullItem ? (Number(fullItem.potongan_jht) || 0) : (Number(slip.potonganJHT) || 0);
        const potonganPph21Value = fullItem ? (Number(fullItem.potongan_pph21) || 0) : (Number(slip.potonganPPH21) || 0);
        const potonganTMukaPenggantiValue = fullItem ? (Number(fullItem.potongan_t_muka_pengganti) || 0) : (Number(slip.potonganTMukaPengganti) || 0);
        const potonganLainValue = fullItem ? (Number(fullItem.potongan_lain) || 0) : (Number(slip.potonganLain) || 0);

        // Pastikan gajiDiterima tidak null/kosong
        const gajiDiterima = slip.gajiDiterima || (slip.totalGaji || 0) - (slip.totalPotongan || 0);
        
        return [
          index + 1, // No
          tglMasuk, // Tgl. Masuk
          slip.nama, // Nama Karyawan
          slip.jabatan, // Jabatan
          masaKerjaTahun, // Masa Kerja (Tahun)
          formatRupiahExcel(slip.gajiPokok || 0), // Gaji Pokok
          formatRupiahExcel(slip.tunjanganJabatan || 0), // Tunjangan Jabatan
          formatRupiahExcel(slip.masaKerja || 0), // Tunjangan Masa Kerja
          // KOMPONEN GAJI (BASIC) - TUNIANGAN
          formatRupiahExcel(slip.waliKelas || 0), // Wali Kelas
          formatRupiahExcel(slip.koordinator || 0), // Koordinator
          formatRupiahExcel(slip.tatapmuka || 0), // Tatap Muka
          formatRupiahExcel(slip.tatapMukaPengganti || 0), // Tatap Muka Pengganti
          formatRupiahExcel(slip.tunjanganKeluarga || 0), // Tunjangan Keluarga
          formatRupiahExcel(slip.tunjanganLain || 0), // Tunjangan Lain
          formatRupiahExcel(transport1Total || 0), // Transport 01
          formatRupiahExcel(transport2Total || 0), // Transport 02
          formatRupiahExcel(slip.makan || 0), // Makan
          formatRupiahExcel(slip.jamsostek || 0), // Jamsostek
          formatRupiahExcel(slip.bpjs || 0), // BPJS
          formatRupiahExcel(slip.overtime || 0), // Overtime
          formatRupiahExcel(slip.insentifLain || 0), // Insentif Lain
          formatRupiahExcel(pramukaValue), // Pramuka
          formatRupiahExcel(ekskulValue), // Ekstrakurikuler
          formatRupiahExcel(proyekValue), // Proyek
          formatRupiahExcel(bimbelValue), // Bimbel
          formatRupiahExcel(insentifPengPramukaValue), // Pramuka (Insentif Pengajar)
          formatRupiahExcel(insentifPengEkskulValue), // Ekstrakurikuler (Insentif Pengajar)
          formatRupiahExcel(insentifPengProyekValue), // Proyek (Insentif Pengajar)
          formatRupiahExcel(insentifPengBimbelValue), // Bimbel (Insentif Pengajar)
          formatRupiahExcel(slip.totalGaji || 0), // TOTAL GAJI
          formatRupiahExcel(iuranWajibValue), // Iuran Wajib
          formatRupiahExcel(iuranSukarelaValue), // Iuran Sukarela
          formatRupiahExcel(angsuranHutangValue), // Angsuran Hutang
          formatRupiahExcel(angsuranYayasanValue), // Angsuran ke Yayasan
          formatRupiahExcel(depositAnnurMartValue), // Deposit Annur Mart
          formatRupiahExcel(potonganJhtValue), // JHT
          formatRupiahExcel(potonganPph21Value), // PPh 21
          formatRupiahExcel(potonganTMukaPenggantiValue), // Tatap Muka Pengganti (Potongan)
          formatRupiahExcel(potonganLainValue), // Lain Lain
          formatRupiahExcel(slip.totalPotongan || 0), // TOTAL POTONGAN
          formatRupiahExcel(gajiDiterima) // GAJI BERSIH (perbaiki jika null)
        ];
      });

      // Calculate totals dengan data lengkap
      let totalTransport1 = 0;
      let totalTransport2 = 0;
      let totalPramuka = 0;
      let totalEkskul = 0;
      let totalProyek = 0;
      let totalBimbel = 0;
      let totalIuranWajib = 0;
      let totalIuranSukarela = 0;
      let totalAngsuranHutang = 0;
      let totalAngsuranYayasan = 0;
      let totalDepositAnnurMart = 0;
      let totalJHT = 0;
      let totalPPH21 = 0;
      let totalPotonganTMukaPengganti = 0;
      let totalPotonganLain = 0;

      dataToExport.forEach((slip) => {
        const fullItem = fullData.find((item: any) => {
          const itemId = String(item.id || item.payroll_id || '');
          return itemId === slip.id;
        });
        if (fullItem) {
          const transport1Rate = Number(fullItem.transport1) || 0;
          const transport1Days = Number(fullItem.jml_hari_transport1) || Number(fullItem.jumlah_hari) || 0;
          const transport1Total =
            transport1Rate * transport1Days ||
            Number(fullItem.total_transport) ||
            0;

          const transport2Rate = Number(fullItem.transport2) || 0;
          const transport2Days = Number(fullItem.jml_hari_transport2) || Number(fullItem.jumlah_hari_lain) || 0;
          const transport2Total =
            transport2Rate * transport2Days ||
            Number(fullItem.total_transport2) ||
            0;

          totalTransport1 += transport1Total;
          totalTransport2 += transport2Total;
          totalPramuka += Number(fullItem.pramuka) || 0;
          totalEkskul += Number(fullItem.ekskul) || 0;
          totalProyek += Number(fullItem.proyek) || 0;
          totalBimbel += Number(fullItem.bimbel) || 0;
          totalIuranWajib += Number(fullItem.potongan_koperasi_wajib) || 0;
          totalIuranSukarela += Number(fullItem.potongan_koperasi_sukarela) || 0;
          totalAngsuranHutang += Number(fullItem.potongan_angsuran_koperasi) || 0;
          totalAngsuranYayasan += Number(fullItem.potongan_yayasan) || 0;
          totalDepositAnnurMart += Number(fullItem.deposit_annurmart) || 0;
          totalJHT += Number(fullItem.potongan_jht) || 0;
          totalPPH21 += Number(fullItem.potongan_pph21) || 0;
          totalPotonganTMukaPengganti += Number(fullItem.potongan_t_muka_pengganti) || 0;
          totalPotonganLain += Number(fullItem.potongan_lain) || 0;
        } else {
          const slipTransport1Total =
            (Number((slip as any).transport1) || 0) *
            (Number((slip as any).jmlHariTransport1) || 0);
          const slipTransport2Total =
            (Number((slip as any).transport2) || 0) *
            (Number((slip as any).jmlHariTransport2) || 0);

          let fallbackTransport1 = slipTransport1Total;
          let fallbackTransport2 = slipTransport2Total;

          if (!fallbackTransport1) {
            fallbackTransport1 = Number((slip as any).totalTransport) || 0;
          }
          if (!fallbackTransport2) {
            fallbackTransport2 = Number((slip as any).totalTransport2) || 0;
          }

          totalTransport1 += fallbackTransport1;
          totalTransport2 += fallbackTransport2;
          totalPramuka += slip.pramuka || 0;
          totalEkskul += slip.ekskul || 0;
          totalProyek += slip.proyek || 0;
          totalBimbel += slip.bimbel || 0;
          totalIuranWajib += Number(slip.potonganKoperasiWajib) || 0;
          totalIuranSukarela += Number(slip.potonganKoperasiSukarela) || 0;
          totalAngsuranHutang += Number(slip.potonganAngsuranKoperasi) || 0;
          totalAngsuranYayasan += Number(slip.potonganYayasan) || 0;
          totalDepositAnnurMart += Number(slip.depositAnnurmart) || 0;
          totalJHT += Number(slip.potonganJHT) || 0;
          totalPPH21 += Number(slip.potonganPPH21) || 0;
          totalPotonganTMukaPengganti += Number(slip.potonganTMukaPengganti) || 0;
          totalPotonganLain += Number(slip.potonganLain) || 0;
        }
      });

      // Total row dengan format rupiah dan perbaiki total gaji diterima
      const totalGaji = dataToExport.reduce((acc, slip) => acc + (slip.totalGaji || 0), 0);
      const totalPotongan = dataToExport.reduce((acc, slip) => acc + (slip.totalPotongan || 0), 0);
      const totalGajiDiterima = dataToExport.reduce((acc, slip) => {
        const gajiDiterima = slip.gajiDiterima || (slip.totalGaji || 0) - (slip.totalPotongan || 0);
        return acc + Math.max(0, gajiDiterima);
      }, 0);

      // Hitung total Masa Kerja (Tahun) untuk total row
      const totalMasaKerjaTahun = dataToExport.reduce((acc, slip) => {
        // Hitung masa kerja tahun untuk setiap slip
        const fullItem = fullData.find((item: any) => {
          const itemId = String(item.id || item.payroll_id || '');
          return itemId === slip.id;
        });
        
        let tmtDate: Date | null = null;
        if (fullItem?.guru?.tmt) {
          try {
            tmtDate = new Date(fullItem.guru.tmt);
            if (isNaN(tmtDate.getTime())) tmtDate = null;
          } catch (e) {
            tmtDate = null;
          }
        }
        
        if (!tmtDate && fullItem?.guru_id) {
          const guruInList = guruList.find(g => g.id === fullItem.guru_id || g.id === Number(fullItem.guru_id));
          if (guruInList?.tmt) {
            try {
              tmtDate = new Date(guruInList.tmt);
              if (isNaN(tmtDate.getTime())) tmtDate = null;
            } catch (e) {
              tmtDate = null;
            }
          }
        }
        
        if (tmtDate) {
          const today = new Date();
          let years = today.getFullYear() - tmtDate.getFullYear();
          let months = today.getMonth() - tmtDate.getMonth();
          if (months < 0) {
            years--;
          }
          return acc + Math.max(0, years);
        }
        return acc;
      }, 0);

      const totalRow = [
        'TOTAL',
        '',
        '',
        '',
        '', // Total Masa Kerja (Tahun) dihilangkan
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.gajiPokok || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.tunjanganJabatan || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.masaKerja || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.waliKelas || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.koordinator || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.tatapmuka || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.tatapMukaPengganti || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.tunjanganKeluarga || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.tunjanganLain || 0), 0)),
        formatRupiahExcel(totalTransport1),
        formatRupiahExcel(totalTransport2),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.makan || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.jamsostek || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.bpjs || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.overtime || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (slip.insentifLain || 0), 0)),
        formatRupiahExcel(totalPramuka),
        formatRupiahExcel(totalEkskul),
        formatRupiahExcel(totalProyek),
        formatRupiahExcel(totalBimbel),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (Number(slip.insentifPramuka) || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (Number(slip.insentifEkskul) || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (Number(slip.insentifProyek) || 0), 0)),
        formatRupiahExcel(dataToExport.reduce((acc, slip) => acc + (Number(slip.insentifBimbel) || 0), 0)),
        formatRupiahExcel(totalGaji), // TOTAL GAJI
        formatRupiahExcel(totalIuranWajib), // Iuran Wajib
        formatRupiahExcel(totalIuranSukarela), // Iuran Sukarela
        formatRupiahExcel(totalAngsuranHutang), // Angsuran Hutang
        formatRupiahExcel(totalAngsuranYayasan), // Angsuran ke Yayasan
        formatRupiahExcel(totalDepositAnnurMart), // Deposit Annur Mart
        formatRupiahExcel(totalJHT), // JHT
        formatRupiahExcel(totalPPH21), // PPh 21
        formatRupiahExcel(totalPotonganTMukaPengganti), // Tatap Muka Pengganti
        formatRupiahExcel(totalPotonganLain), // Lain Lain
        formatRupiahExcel(totalPotongan), // TOTAL POTONGAN
        formatRupiahExcel(totalGajiDiterima) // GAJI BERSIH (diperbaiki)
      ];
      // Set row 7 untuk header tabel (row 6 digunakan untuk PENERIMAAN)
      const headerRow = 8;
      const mergedRow6To8Columns = new Set([1, 2, 3, 4, 5, 30, 40, 41]);
      const mergedRow7To8Columns = new Set(columnsToMergeRow7To8);
      tableHeaders[0].forEach((header, colIndex) => {
        const columnNumber = colIndex + 1;
        const targetRow = mergedRow6To8Columns.has(columnNumber)
          ? 6
          : mergedRow7To8Columns.has(columnNumber)
            ? 7
            : headerRow;
        const cell = worksheet.getCell(targetRow, columnNumber);
        cell.value = header;
        cell.font = { bold: true, size: 11 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEB3B' } // Yellow color
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Set column widths
      worksheet.getColumn(1).width = 5;   // No
      worksheet.getColumn(2).width = 12; // Tgl. Masuk
      worksheet.getColumn(3).width = 25; // Nama Karyawan
      worksheet.getColumn(4).width = 20; // Jabatan
      worksheet.getColumn(5).width = 15; // Masa Kerja (Tahun)
      worksheet.getColumn(6).width = 18; // Gaji Pokok
      worksheet.getColumn(7).width = 18; // Tunjangan Jabatan
      worksheet.getColumn(8).width = 18; // Tunjangan Masa Kerja
      worksheet.getColumn(9).width = 12; // Wali Kelas
      worksheet.getColumn(10).width = 12; // Koordinator
      worksheet.getColumn(11).width = 15; // Tatap Muka
      worksheet.getColumn(12).width = 20; // Tatap Muka Pengganti
      worksheet.getColumn(13).width = 18; // Tunjangan Keluarga
      worksheet.getColumn(14).width = 15; // Tunjangan Lain
      worksheet.getColumn(15).width = 15; // Transport 01
      worksheet.getColumn(16).width = 15; // Transport 02
      worksheet.getColumn(17).width = 12; // Makan
      worksheet.getColumn(18).width = 12; // Jamsostek
      worksheet.getColumn(19).width = 12; // BPJS
      worksheet.getColumn(20).width = 12; // Overtime
      worksheet.getColumn(21).width = 15; // Insentif Lain
      worksheet.getColumn(22).width = 12; // Pramuka
      worksheet.getColumn(23).width = 15; // Ekstrakurikuler
      worksheet.getColumn(24).width = 12; // Proyek
      worksheet.getColumn(25).width = 12; // Bimbel
      worksheet.getColumn(26).width = 12; // Pramuka (Insentif Pengajar)
      worksheet.getColumn(27).width = 15; // Ekstrakurikuler (Insentif Pengajar)
      worksheet.getColumn(28).width = 12; // Proyek (Insentif Pengajar)
      worksheet.getColumn(29).width = 12; // Bimbel (Insentif Pengajar)
      worksheet.getColumn(30).width = 18; // TOTAL GAJI
      worksheet.getColumn(31).width = 15; // Iuran Wajib
      worksheet.getColumn(32).width = 15; // Iuran Sukarela
      worksheet.getColumn(33).width = 15; // Angsuran Hutang
      worksheet.getColumn(34).width = 15; // Angsuran ke Yayasan
      worksheet.getColumn(35).width = 15; // Deposit Annur Mart
      worksheet.getColumn(36).width = 12; // JHT
      worksheet.getColumn(37).width = 12; // PPh 21
      worksheet.getColumn(38).width = 15; // Tatap Muka Pengganti (Potongan)
      worksheet.getColumn(39).width = 15; // Lain Lain
      worksheet.getColumn(40).width = 20; // TOTAL POTONGAN
      worksheet.getColumn(41).width = 22; // GAJI BERSIH

      // Add data rows
      dataRows.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const cell = worksheet.getCell(headerRow + 1 + rowIndex, colIndex + 1);
          cell.value = value;
          cell.alignment = { vertical: 'middle', wrapText: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Add total row dengan bold
      totalRow.forEach((value, colIndex) => {
        const cell = worksheet.getCell(headerRow + 1 + dataRows.length, colIndex + 1);
        cell.value = value;
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (typeof value === 'string' && value !== '' && value !== 'TOTAL') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' } // Light gray untuk total row
          };
        }
      });

      const signatureStartRow = headerRow + 1 + dataRows.length + 2;
      const signatureNameRow = signatureStartRow + 3;
      const signatureTitleRow = signatureNameRow + 1;
      const signatureSections = [
        { startCol: 1, endCol: 14, header: 'DIBUAT', name: 'SUARNI, A.Md', title: 'Staff Tata Usaha' },
        { startCol: 15, endCol: 27, header: 'MENGETAHUI', name: 'Windiarti, SE', title: 'Kepala Tata Usaha' },
        { startCol: 28, endCol: 41, header: "MENYETUJUI", name: "Nova Rabi'ah Nurrochmah, SE, MM", title: 'Direktur Keuangan' }
      ];

      signatureSections.forEach((section) => {
        worksheet.mergeCells(signatureStartRow, section.startCol, signatureStartRow, section.endCol);
        const headerCell = worksheet.getCell(signatureStartRow, section.startCol);
        headerCell.value = section.header;
        headerCell.font = { bold: true };
        headerCell.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.mergeCells(signatureNameRow, section.startCol, signatureNameRow, section.endCol);
        const nameCell = worksheet.getCell(signatureNameRow, section.startCol);
        nameCell.value = section.name;
        nameCell.font = { bold: true, underline: true };
        nameCell.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.mergeCells(signatureTitleRow, section.startCol, signatureTitleRow, section.endCol);
        const titleCell = worksheet.getCell(signatureTitleRow, section.startCol);
        titleCell.value = section.title;
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Generate filename
      const filename = `Laporan_Yayasan_${namaBulan.replace(/\s+/g, '_')}_${tahun}_${new Date().toISOString().split('T')[0]}.xlsx`;
      // Download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      // Close loading
      await Swal.close();
      setIsExportingLaporanYayasan(false);

      // Show success notification
      Swal.fire({
        icon: 'success',
        title: 'Berhasil! 🎉',
        text: `Laporan Yayasan berhasil diekspor ke Excel (${dataToExport.length} karyawan)`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6',
        timer: 2000
      });
    } catch (error: any) {
      console.error('Error exporting Laporan Yayasan:', error);
      setIsExportingLaporanYayasan(false);
      await Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengekspor',
        text: error?.message || 'Terjadi kesalahan saat mengekspor Laporan Yayasan ke Excel',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleAddPotongan = () => {
    setPotonganList([...potonganList, { nama_potongan: '', jumlah_potongan: '' }]);
  };

  const handleRemovePotongan = (idx: number) => {
    setPotonganList(potonganList.filter((_, i) => i !== idx));
  };

  const handlePotonganChange = (idx: number, field: 'nama_potongan' | 'jumlah_potongan', value: string) => {
    const updated = [...potonganList];
    updated[idx][field] = field === 'jumlah_potongan' ? value.replace(/[^\d]/g, '') : value;
    setPotonganList(updated);
  };

  // Handle Tatap Muka Calculator
  const handleOpenTatapMukaModal = () => {
    setJamInput('');
    setShowTatapMukaModal(true);
  };
  // Handle Pramuka Calculator
  const handleOpenPramukaModal = () => {
    setJamPramukaInput('');
    setShowPramukaModal(true);
  };

  // Handle Tatap Muka Pengganti Calculator
  const handleOpenTMukaPenggantiModal = () => {
    setJamTMukaPenggantiInput('');
    setShowTMukaPenggantiModal(true);
  };
  const handleTMukaPenggantiCalculate = () => {
    const jamValue = parseFloat(jamTMukaPenggantiInput.replace(/,/g, '.'));
    const nilaiDasar = parseFloat(String(payrollForm.base_t_muka_pengganti).replace(/\./g, '').replace(/,/g, ''));
    
    if (isNaN(jamValue)) {
      alert('Input tidak valid. Pastikan memasukkan angka.');
      return;
    }

    // Rumus: Jam × Nilai Dasar (tanpa dikali 4)
    const result = jamValue * nilaiDasar;
    
    // Pembulatan tanpa decimal
    const roundedResult = Math.round(result);
    
    // Update payrollForm dengan hasil kalkulasi - simpan sebagai string dengan format rupiah
    const formattedResult = formatRupiah(roundedResult);
    
    const updatedForm = {
      ...payrollForm,
      t_muka_pengganti: formattedResult,
      jml_jam_t_muka_pengganti: Math.round(jamValue),
    };
    
    // Auto-calculate total_gaji
    updatedForm.total_gaji = hitungTotalGaji(updatedForm);
    setPayrollForm(updatedForm);
    
    setShowTMukaPenggantiModal(false);
    setJamTMukaPenggantiInput('');
  };
  const handleTatapMukaCalculate = () => {
    const jamValue = parseFloat(jamInput.replace(/,/g, '.'));
    // Parse base_tatap_muka dengan benar: handle format Indonesia (koma decimal) dan format standar (titik decimal)
    const baseValue = String(payrollForm.base_tatap_muka || '0');
    let parsed = baseValue;
    if (parsed.includes(',')) {
      // Format Indonesia: hapus titik ribu, ganti koma dengan titik
      parsed = parsed.replace(/\./g, '').replace(/,/g, '.');
    } else if (parsed.includes('.')) {
      // Format standar: cek apakah titik terakhir adalah decimal separator
      const lastDotIndex = parsed.lastIndexOf('.');
      const afterDot = parsed.substring(lastDotIndex + 1);
      // Jika setelah titik ada 1-2 digit dan tidak ada titik lagi setelahnya, itu decimal separator
      if (afterDot.length <= 2 && !parsed.substring(lastDotIndex + 1).includes('.')) {
        // Decimal separator: hapus titik ribu sebelum titik terakhir, biarkan titik terakhir
        const beforeLastDot = parsed.substring(0, lastDotIndex).replace(/\./g, '');
        parsed = beforeLastDot + '.' + afterDot;
      } else {
        // Thousand separator: hapus semua titik
        parsed = parsed.replace(/\./g, '');
      }
    }
    const nilaiDasar = parseFloat(parsed) || 0;
    
    if (isNaN(jamValue)) {
      alert('Input tidak valid. Pastikan memasukkan angka.');
      return;
    }

    // Rumus: Jam × base_tatap_muka × 4
    const result = jamValue * nilaiDasar * 4;
    
    // Pembulatan tanpa decimal
    const roundedResult = Math.round(result);
    
    // Update payrollForm dengan hasil kalkulasi - simpan sebagai string dengan format rupiah
    const formattedResult = formatRupiah(roundedResult);
    
    const updatedForm = {
      ...payrollForm,
      tatap_muka: formattedResult,
    };
    
    // Auto-calculate total_gaji
    updatedForm.total_gaji = hitungTotalGaji(updatedForm);
    setPayrollForm(updatedForm);
    
    setShowTatapMukaModal(false);
    setJamInput('');
  };

  const handlePramukaCalculate = () => {
    const jamValue = parseFloat(jamPramukaInput.replace(/,/g, '.'));
    // Gunakan nilai base_pramuka sebagai pengali
    const nilaiPramuka = Number(payrollForm.base_pramuka) || 0;
    
    if (isNaN(jamValue)) {
      alert('Input tidak valid. Pastikan memasukkan angka.');
      return;
    }

    if (nilaiPramuka === 0) {
      alert('Nilai base pramuka adalah 0. Silakan isi nilai pramuka terlebih dahulu.');
      return;
    }

    // Rumus: Jam × base_pramuka
    const result = jamValue * nilaiPramuka;
    
    // Pembulatan tanpa decimal
    const roundedResult = Math.round(result);
    
    const updatedForm = {
      ...payrollForm,
      pramuka: roundedResult as number,
      jml_jam_pramuka: Math.round(jamValue),
    };
    
    // Auto-calculate total_gaji
    updatedForm.total_gaji = hitungTotalGaji(updatedForm);
    setPayrollForm(updatedForm);
    
    setShowPramukaModal(false);
    setJamPramukaInput('');
  };
  // Handle Masa Kerja Click - Multiply base_masa_kerja with masa_kerja_tahun if > 0
  const handleMasaKerjaClick = () => {
    // Get masa_kerja_tahun value from payrollForm
    const masaKerjaTahunValue = Number(payrollForm.masa_kerja_tahun) || 0;
    
    // If masa_kerja_tahun is 0 or less, don't change masa_kerja
    if (masaKerjaTahunValue <= 0) {
      alert('Masa Kerja (Tahun) harus lebih dari 0 untuk melakukan kalkulasi.');
      return;
    }
    
    // Get base_masa_kerja value (base value dari guru)
    const baseMasaKerja = Number(payrollForm.base_masa_kerja) || 0;
    
    // If base_masa_kerja is 0, try to get from selectedGuru
    let finalBaseMasaKerja = baseMasaKerja;
    if (finalBaseMasaKerja === 0 && selectedGuru?.tunjangan_masa_kerja) {
      finalBaseMasaKerja = selectedGuru.tunjangan_masa_kerja;
    }
    
    // If still 0, show alert
    if (finalBaseMasaKerja === 0) {
      alert('Nilai base Masa Kerja tidak tersedia. Pastikan guru memiliki tunjangan masa kerja.');
      return;
    }
    
    // Calculate: base_masa_kerja × masa_kerja_tahun
    const result = finalBaseMasaKerja * masaKerjaTahunValue;
    const roundedResult = Math.round(result);
    
    // Update payrollForm dengan hasil kalkulasi
    const updatedForm = {
      ...payrollForm,
      masa_kerja: roundedResult,
    };
    
    // Auto-calculate total_gaji
    updatedForm.total_gaji = hitungTotalGaji(updatedForm);
    setPayrollForm(updatedForm);
  };

  // Handle Potongan Tatap Muka Pengganti Calculator
  const handleOpenPotonganTMukaModal = () => {
    setJamPotonganInput('');
    setShowPotonganTMukaModal(true);
  };

  const handlePotonganTMukaCalculate = () => {
    const jamValue = parseFloat(jamPotonganInput.replace(/,/g, '.'));
    const tMukaPengganti = parseFloat(String(payrollForm.t_muka_pengganti).replace(/\./g, '').replace(/,/g, ''));
    
    if (isNaN(jamValue)) {
      alert('Input tidak valid. Pastikan memasukkan angka.');
      return;
    }

    // Rumus: Jam × t_muka_pengganti
    const result = jamValue * tMukaPengganti;
    
    // Pembulatan tanpa decimal
    const roundedResult = Math.round(result);
    
    // Update payrollForm dengan hasil kalkulasi (nilai numerik, bukan diformat)
    const updatedForm = {
      ...payrollForm,
      potongan_t_muka_pengganti: roundedResult,
    };
    
    // Auto-calculate total_gaji dan total_potongan
    updatedForm.total_gaji = hitungTotalGaji(updatedForm);
    setPayrollForm(updatedForm);
    
    // Close modal dan reset input
    setShowPotonganTMukaModal(false);
    setJamPotonganInput('');
  };

  // Handle Makan Calculator
  const handleOpenMakanModal = () => {
    setJamMakanInput('');
    setShowMakanModal(true);
  };

  const handleMakanCalculate = () => {
    const jamValue = parseFloat(jamMakanInput.replace(/,/g, '.'));
    const baseMakanValue = Number(String(payrollForm.base_makan).replace(/\./g, ''));
    
    if (isNaN(jamValue)) {
      alert('Input tidak valid. Pastikan memasukkan angka.');
      return;
    }

    const result = jamValue * baseMakanValue;
    const roundedResult = Math.round(result);
    
    const updatedForm = {
      ...payrollForm,
      makan: roundedResult,
      makan_hari: Math.round(jamValue),
    };
    
    updatedForm.total_gaji = hitungTotalGaji(updatedForm);
    setPayrollForm(updatedForm);
    
    setShowMakanModal(false);
    setJamMakanInput('');
  };

  // Handle Ekskul Calculator
  const handleOpenEkskulModal = () => {
    setJamEkskulInput('');
    setShowEkskulModal(true);
  };

  const handleEkskulCalculate = () => {
    const jamValue = parseFloat(jamEkskulInput.replace(/,/g, '.'));
    const baseEkskulValue = Number(String(payrollForm.base_ekskul).replace(/\./g, ''));
    
    if (isNaN(jamValue)) {
      alert('Input tidak valid. Pastikan memasukkan angka.');
      return;
    }

    const result = jamValue * baseEkskulValue;
    const roundedResult = Math.round(result);
    
    const updatedForm = {
      ...payrollForm,
      ekskul: roundedResult,
      jml_jam_insentif_ekskul: Math.round(jamValue),
    };
    
    updatedForm.total_gaji = hitungTotalGaji(updatedForm);
    setPayrollForm(updatedForm);
    
    setShowEkskulModal(false);
    setJamEkskulInput('');
  };

  // Handle Bimbel Calculator
  const handleOpenBimbelModal = () => {
    setJamBimbelInput('');
    setShowBimbelModal(true);
  };

  const handleBimbelCalculate = () => {
    const jamValue = parseFloat(jamBimbelInput.replace(/,/g, '.'));
    const baseBimbelValue = Number(String(payrollForm.base_bimbel).replace(/\./g, ''));
    
    if (isNaN(jamValue)) {
      alert('Input tidak valid. Pastikan memasukkan angka.');
      return;
    }

    const result = jamValue * baseBimbelValue;
    const roundedResult = Math.round(result);
    
    const updatedForm = {
      ...payrollForm,
      bimbel: roundedResult,
      jml_jam_insentif_bimbel: Math.round(jamValue),
    };
    
    updatedForm.total_gaji = hitungTotalGaji(updatedForm);
    setPayrollForm(updatedForm);
    
    setShowBimbelModal(false);
    setJamBimbelInput('');
  };

  // Handle Proyek Calculator
  const handleOpenProyekModal = () => {
    setJamProyekInput('');
    setShowProyekModal(true);
  };

  const handleProyekCalculate = () => {
    const jamValue = parseFloat(jamProyekInput.replace(/,/g, '.'));
    const baseProyekValue = Number(String(payrollForm.base_proyek).replace(/\./g, ''));
    
    if (isNaN(jamValue)) {
      alert('Input tidak valid. Pastikan memasukkan angka.');
      return;
    }

    const result = jamValue * baseProyekValue;
    const roundedResult = Math.round(result);
    
    const updatedForm = {
      ...payrollForm,
      proyek: roundedResult,
      jml_jam_insentif_proyek: Math.round(jamValue),
    };
    
    updatedForm.total_gaji = hitungTotalGaji(updatedForm);
    setPayrollForm(updatedForm);
    
    setShowProyekModal(false);
    setJamProyekInput('');
  };

  // Handle Open Jumlah Hari Modal
  // Handle Fetch Jumlah Hari - Langsung hitung tanpa modal
  // Menghitung dari tanggal 26 bulan sebelumnya sampai 25 bulan sekarang
  const handleFetchJumlahHari = async () => {
    if (!payrollForm.guru_id) {
      return; // Tidak ada error jika guru belum dipilih
    }

    setIsLoadingJumlahHari(true);
    try {
      // Hitung tanggal: mulai tanggal 26 bulan sebelumnya sampai 25 bulan periode yang dipilih
      // Gunakan periode dari form jika tersedia, jika tidak gunakan bulan/tahun saat ini
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      
      let bulan: number;
      let tahun: number;
      
      if (payrollForm.periode_bulan && payrollForm.periode_tahun) {
        // Convert nama bulan ke angka (1-12)
        bulan = monthNames.indexOf(payrollForm.periode_bulan) + 1;
        tahun = parseInt(payrollForm.periode_tahun.toString());
      } else {
        // Fallback ke bulan/tahun saat ini jika periode belum dipilih
        const today = new Date();
        bulan = today.getMonth() + 1; // getMonth() returns 0-11, jadi +1 untuk 1-12
        tahun = today.getFullYear();
      }
      
      // Tanggal mulai: 26 bulan sebelumnya dari periode yang dipilih
      // Contoh: Jika periode November 2025 (bulan=11), maka mulai dari 26 Oktober 2025
      let bulanSebelumnya: number;
      let tahunStart: number;
      
      if (bulan === 1) {
        // Jika bulan adalah Januari (1), bulan sebelumnya adalah Desember tahun sebelumnya
        bulanSebelumnya = 12;
        tahunStart = tahun - 1;
      } else {
        // Bulan sebelumnya adalah bulan - 1
        bulanSebelumnya = bulan - 1;
        tahunStart = tahun;
      }
      
      // Tanggal akhir: 25 bulan periode yang dipilih
      // Format tanggal tanpa timezone issue: gunakan format manual YYYY-MM-DD
      const tanggalDari = `${tahunStart}-${String(bulanSebelumnya).padStart(2, '0')}-26`;
      const tanggalSampai = `${tahun}-${String(bulan).padStart(2, '0')}-25`;
      
      // Debug log
      console.log('📅 Periode Payroll:', {
        periode_bulan: payrollForm.periode_bulan,
        periode_tahun: payrollForm.periode_tahun,
        bulan: bulan,
        tahun: tahun,
        bulanSebelumnya: bulanSebelumnya,
        tahunStart: tahunStart,
        tanggalDari: tanggalDari,
        tanggalSampai: tanggalSampai
      });

      const token = localStorage.getItem('auth_token');
      const baseUrl = import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001';

      // Fetch total absensi berdasarkan tanggal dari-sampai
      const response = await fetch(
        `${baseUrl}/api/master-data/guru/total-absensi?id_guru=${payrollForm.guru_id}&tanggal_mulai=${tanggalDari}&tanggal_akhir=${tanggalSampai}`,
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
        throw new Error(errorData.message || 'Gagal mengambil data absensi');
      }

      const result = await response.json();
      
      // Validasi response structure
      if (!result.success || !result.data || !result.data.statistics) {
        throw new Error('Format response tidak valid');
      }

      // Ambil data dari statistics
      const jumlahHari = result.data.statistics.jumlah_hari_hadir || 0;
      const jumlahHariLain = result.data.statistics.jumlah_hari_lain || 0;

      // Update payrollForm
      const updatedForm = {
        ...payrollForm,
        jumlah_hari: jumlahHari,
        jumlah_hari_lain: jumlahHariLain,
        jml_hari_transport1: jumlahHari,
        jml_hari_transport2: jumlahHariLain,
      };

      // Recalculate total_transport
      updatedForm.total_transport = jumlahHari * (payrollForm.transport1 || 0);
      updatedForm.total_transport2 = jumlahHariLain * (payrollForm.transport2 || 0);
      updatedForm.total_transport_all = updatedForm.total_transport + updatedForm.total_transport2;
      updatedForm.total_gaji = hitungTotalGaji(updatedForm);

      setPayrollForm(updatedForm);
    } catch (error: any) {
      console.error('Error fetching jumlah hari:', error);
      // Tidak tampilkan error, cukup log di console
    } finally {
      setIsLoadingJumlahHari(false);
    }
  };
  const columns = [
    {
      key: 'employee',
      header: 'Karyawan',
      className: 'min-w-64',
      sticky: 'left' as const,
      stickyOffset: 0,
      stickyZIndex: 30,
      stickyHeaderBgClass: 'bg-slate-100',
      stickyCellBgClass: 'bg-white',
      stickyShadowClass: 'shadow-[1px_0_0_0_rgba(226,232,240,1)]',
      render: (_: any, slip: SlipGaji) => (
        <div className="flex items-start gap-4 py-2">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center border border-amber-200">
            <UserIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 text-base mb-1 truncate">{slip.nama}</div>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
              <span className="font-medium">{slip.nip}</span>
              <span className="text-slate-400">•</span>
              <span className="truncate">{slip.jabatan}</span>
            </div>
            <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              {slip.divisi}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'periode',
      header: 'Periode',
      className: 'min-w-44',
      render: (_: any, slip: SlipGaji) => (
        <div className="py-2">
          <div className="font-semibold text-slate-900 text-base mb-2">{formatPeriode(slip.periode)}</div>
          <div className="text-xs text-slate-500">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Generated: {new Date(slip.tanggalGenerate).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'gaji',
      header: 'Detail Gaji',
      className: 'min-w-56',
      render: (_: any, slip: SlipGaji) => (
        <div className="py-2 space-y-2">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="font-bold text-slate-900 text-base mb-2">{formatCurrency(slip.gajiPokok)}</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">+{formatCurrency(slip.totalPendapatan - slip.gajiPokok)}</span>
                <span className="text-slate-500">tunjangan</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-700 font-medium">-{formatCurrency(slip.totalPotongan)}</span>
                <span className="text-slate-500">potongan</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'lembur',
      header: 'Lembur',
      className: 'min-w-32 text-center',
      render: (_: any, slip: SlipGaji) => (
        <div className="py-2 text-center">
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 inline-block">
            <div className="font-bold text-slate-900 text-lg mb-1">{slip.lemburHari}h</div>
            <div className="text-xs text-amber-700 font-semibold">{formatCurrency(slip.gajiLembur)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'diterima',
      header: 'Gaji Diterima',
      className: 'min-w-44 text-right',
      render: (_: any, slip: SlipGaji) => (
        <div className="py-2 text-right">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200 inline-block">
            <div className="font-bold text-green-700 text-lg">
              {formatCurrency(slip.gajiDiterima)}
            </div>
            <div className="text-xs text-green-600 mt-1">Gaji bersih</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      className: 'min-w-32 text-center',
      render: (_: any, slip: SlipGaji) => (
        <div className="py-2 text-center">
          {getStatusBadge(slip.status)}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'min-w-56',
      render: (_: any, slip: SlipGaji) => (
        <div className="py-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleEditPayroll(slip)}
              className="group relative p-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200 hover:scale-105 border border-amber-200 hover:border-amber-300"
              title="Edit Payroll"
            >
              <PencilIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-amber-200/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button
              onClick={() => handleViewDetail(slip)}
              className="group relative p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105 border border-blue-200 hover:border-blue-300"
              title="Lihat Detail"
            >
              <EyeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-blue-200/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button
              onClick={() => handleDelete(slip)}
              className="group relative p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 border border-red-200 hover:border-red-300"
              title="Hapus Data"
            >
              <TrashIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-red-200/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>
      )
    }
  ];
  return (
    <PayrollLayout>
      <div className="space-y-6">
        {/* Ultra Modern Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/15 rounded-full blur-lg animate-pulse delay-500"></div>
          </div>
          
          <div className="relative z-10 flex flex-col xl:flex-row gap-8 items-start xl:items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="group relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-110 transition-all duration-300">
                  <DocumentTextIcon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/10 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              </div>
              
              <div>
                <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Slip Gaji Karyawan
                </h1>
                <p className="text-white/90 text-lg font-medium mb-4">
                  Kelola dan cetak slip gaji bulanan karyawan dengan mudah
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <ClockIcon className="w-4 h-4" />
                    <span className="font-semibold">Update Realtime</span>
                  </div>
                  
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              {/* Hidden Generate Slip Bulan Ini Button */}
              <Button 
                onClick={handleGenerateSlipBulanIni}
                className="hidden group relative bg-white/20 backdrop-blur-lg hover:bg-white/30 text-white border border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 px-6 py-3 font-semibold"
                disabled={isGenerating}
              >
                <div className="flex items-center">
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  ) : (
                    <PlusIcon className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  )}
                  <span>
                    {isGenerating ? 'Generating...' : '+ Generate Slip Bulan Ini'}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
              </Button>
              <Button
                onClick={handleBulkUpdateStatus}
                disabled={isBulkUpdating || filteredSlip.length === 0}
                className="group relative bg-white/20 backdrop-blur-lg hover:bg-white/30 text-white border border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkUpdating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Bulk Create Status</span>
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
              </Button>
              <Button
                onClick={() => setShowSetupPayrollModal(true)}
                className="bg-white/20 backdrop-blur-lg hover:bg-white/30 text-white border border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2 px-6 py-3"
              >
                <CogIcon className="w-5 h-5" />
                Setup Payroll
              </Button>
              <Button className="group relative bg-white/20 backdrop-blur-lg hover:bg-white/30 text-white border border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2 px-6 py-3">
                <PrinterIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Print Semua
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border border-blue-100 bg-white rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Total Slip</p>
                <p className="text-3xl font-bold text-blue-900 mb-1">{stats.totalSlip}</p>
                <p className="text-xs text-slate-500">Semua periode</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center ml-4">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border border-slate-200 bg-white rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Draft</p>
                <p className="text-3xl font-bold text-slate-900 mb-1">{stats.draft}</p>
                <p className="text-xs text-slate-500">Belum disetujui</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center ml-4">
                <ClockIcon className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border border-amber-200 bg-white rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Disetujui</p>
                <p className="text-3xl font-bold text-amber-900 mb-1">{stats.disetujui}</p>
                <p className="text-xs text-slate-500">Siap dibayar</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center ml-4">
                <CheckCircleIcon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border border-green-200 bg-white rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Dibayar</p>
                <p className="text-3xl font-bold text-green-900 mb-1">{stats.dibayar}</p>
                <p className="text-xs text-slate-500">Selesai</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center ml-4">
                <BanknotesIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border border-emerald-200 bg-white rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Total Dibayar</p>
                <p className="text-xl font-bold text-emerald-900 mb-1 leading-tight">{formatCurrency(stats.totalPengeluaran)}</p>
                <p className="text-xs text-slate-500">Bulan ini</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center ml-4">
                <span className="text-base font-bold text-emerald-600">Rp</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Modern Filters */}
        <Card className="p-6 bg-white shadow-sm border border-slate-200 rounded-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <FunnelIcon className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Filter & Pencarian</h3>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button
                onClick={handleExportLaporanYayasan}
                disabled={isExportingLaporanYayasan || filteredSlip.length === 0}
                className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl"
              >
                {isExportingLaporanYayasan ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-sm">Exporting...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm">Laporan Yayasan</span>
                  </>
                )}
              </Button>
              <Button
                onClick={handleExportExcel}
                disabled={isExporting || filteredSlip.length === 0}
                className="group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-sm">Exporting...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm">Export Excel</span>
                  </>
                )}
              </Button>
              <Button
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-5 py-2.5 rounded-xl font-semibold transition-all duration-200"
                onClick={() => {
                  setSearchInputValue('');
                  setDebouncedSearchTerm('');
                  setSelectedPeriode('');
                  setSelectedDivisi('');
                  setSelectedStatus('');
                }}
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Cari Karyawan</label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nama atau NIP..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Periode</label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full transition-all duration-200 bg-white text-slate-900"
              >
                <option value="">Semua Periode</option>
                {uniquePeriodes.map((periode) => (
                  <option key={periode} value={periode}>
                    {formatPeriode(periode)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Divisi</label>
              <select
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full transition-all duration-200 bg-white text-slate-900"
              >
                <option value="">Semua Divisi</option>
                {uniqueDivisis.map((divisi) => (
                  <option key={divisi} value={divisi}>
                    {divisi}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full transition-all duration-200 bg-white text-slate-900"
              >
                <option value="">Semua Status</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Info jumlah data terfilter */}
          <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              Menampilkan <span className="font-bold text-slate-900">{filteredSlip.length}</span> dari <span className="font-bold text-slate-900">{slipData.length}</span> data payroll
            </div>
            {filteredSlip.length === 0 && (
              <div className="text-sm text-amber-600 font-semibold flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                <ExclamationTriangleIcon className="w-4 h-4" />
                Tidak ada data yang sesuai dengan filter
              </div>
            )}
          </div>
        </Card>

        {/* Super Modern Table */}
        <Card className="overflow-hidden shadow-lg border border-slate-200 bg-white rounded-2xl">
          {/* Enhanced Table Header */}
          <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-6 py-5 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Daftar Slip Gaji</h3>
                  <p className="text-sm text-slate-600">
                    {loadingSlipData ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
                        Memuat data...
                      </span>
                    ) : (
                      <>
                        Menampilkan <span className="font-bold text-indigo-600">{paginationStart}-{paginationEnd}</span> dari {filteredSlip.length} slip gaji
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-green-700">Real-time update</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                  <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">Auto-sync</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Table with Enhanced Styling */}
          <div className="overflow-x-auto bg-gradient-to-b from-white to-slate-50">
            <div className="min-w-full">
              <Table
                data={paginatedSlip}
                columns={columns}
              />
            </div>
          </div>
          
          {/* Table Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                <span className="font-medium">Total pengeluaran gaji: </span>
                <span className="font-bold text-green-600 text-lg">
                  {formatCurrency(filteredSlip.reduce((sum, slip) => sum + slip.gajiDiterima, 0))}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>Tampilkan</span>
                  <select
                    value={itemsPerPage}
                    onChange={(event) => setItemsPerPage(Number(event.target.value))}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {[10, 25, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <span>data</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={safeCurrentPage <= 1 || totalFilteredSlip === 0}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sebelumnya
                  </button>
                  {paginationPages.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 border rounded-lg text-sm font-semibold transition-colors ${
                        page === safeCurrentPage
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={safeCurrentPage >= totalPages || totalFilteredSlip === 0}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Berikutnya
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ClockIcon className="w-4 h-4" />
                  <span>Last updated: {new Date().toLocaleTimeString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        {selectedSlip && (
          <SlipGajiTemplate
            ref={printRef}
            data={selectedSlip}
            templateType={templateType}
            showWatermark={true}
          />
        )}
      </div>

      {/* Print Preview Modal */}
      <Modal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title=""
        size="full"
      >
        <div className="h-screen flex flex-col bg-gray-100 p-4">
          {/* Header */}
          <div className="bg-white p-4 rounded-lg mb-4 shadow-sm flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Preview Slip Gaji</h2>
            <div className="flex gap-2">
              <button
                onClick={() => selectedSlip && handleActualPrint(selectedSlip)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold"
              >
                <PrinterIcon className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
          
          {/* Template Preview */}
          <div className="flex-1 bg-white rounded-lg shadow-lg overflow-auto p-8">
            {selectedSlip && (
              <SlipGajiTemplate
                data={selectedSlip}
                templateType={templateType}
                showWatermark={true}
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Setup Payroll Modal - Modern Professional Design */}
      <Modal
        isOpen={showSetupPayrollModal}
        onClose={() => {
          setShowSetupPayrollModal(false);
          // Reset edit mode saat modal ditutup
          setTimeout(() => {
            setIsEditMode(false);
            setEditPayrollId(null);
            setPayrollForm(initialPayrollForm);
            setPotonganList([{ nama_potongan: '', jumlah_potongan: '' }]);
            setSelectedGuru(null);
          }, 300);
        }}
        title=""
        size="xl"
      >
        <div className="h-[90vh] flex flex-col">
          {/* Header dengan gradient dan shadow */}
          <div className={`${isEditMode ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700' : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700'} px-8 py-5 -mx-6 -mt-6 rounded-t-xl border-b ${isEditMode ? 'border-amber-200/30' : 'border-blue-200/30'} shadow-sm`}>
           
              <div>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {isEditMode ? 'Edit Payroll' : 'Konfigurasi Payroll'}
                </h2>
                <p className={`${isEditMode ? 'text-amber-100' : 'text-blue-100'} text-sm mt-1`}>
                  {isEditMode ? 'Edit data payroll karyawan' : 'Setup lengkap sistem penggajian karyawan'}
                </p>
              </div>
            
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-2">
            <form className="space-y-6">
              {/* Informasi Karyawan */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Informasi Karyawan</h3>
                    <p className="text-sm text-slate-600">Pilih guru dan isi data gaji</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Pilih Guru</label>
                    <Select
                      options={guruList.map(guru => ({
                        value: guru.id.toString(),
                        label: `${guru.nip} - ${guru.nama_lengkap}`,
                        guru: guru
                      }))}
                      onChange={handleSelectGuru}
                      value={payrollForm.guru_id ? {
                        value: payrollForm.guru_id,
                        label: guruList.find(g => g.id.toString() === payrollForm.guru_id) 
                          ? `${guruList.find(g => g.id.toString() === payrollForm.guru_id)!.nip} - ${guruList.find(g => g.id.toString() === payrollForm.guru_id)!.nama_lengkap}`
                          : 'Pilih Guru'
                      } : null}
                      placeholder="Ketik untuk mencari guru..."
                      isClearable
                      isSearchable
                      isLoading={loadingGuru}
                      isDisabled={loadingGuru}
                      noOptionsMessage={() => "Tidak ada data guru"}
                      loadingMessage={() => "Memuat data..."}
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '48px',
                          borderRadius: '0.5rem',
                          borderColor: '#cbd5e1',
                          backgroundColor: '#f8fafc',
                          '&:hover': {
                            borderColor: '#3b82f6'
                          }
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 9999
                        })
                      }}
                    />
                    {loadingGuru && (
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                        Memuat data guru...
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Nama Guru</label>
                    <input
                      type="text"
                      name="nama_lengkap"
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200"
                      placeholder="Nama akan terisi otomatis"
                      value={selectedGuru?.nama_lengkap || ''}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Divisi</label>
                    <input
                      type="text"
                      name="unit_sekolah_nama"
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200"
                      placeholder="Divisi akan terisi otomatis"
                      value={selectedGuru?.unit_sekolah_nama || ''}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Nama Jabatan</label>
                    <input
                      type="text"
                      name="jabatan_nama"
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200"
                      placeholder="Jabatan akan terisi otomatis"
                      value={selectedGuru?.jabatan_nama || ''}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Informasi Bank */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Informasi Bank</h3>
                    <p className="text-sm text-slate-600">Data rekening bank karyawan</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Nama Bank</label>
                    <input
                      type="text"
                      name="nama_bank"
                      value={payrollForm.nama_bank}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 transition-all duration-200"
                      placeholder="Nama Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">No Rekening</label>
                    <input
                      type="text"
                      name="no_rekening"
                      value={payrollForm.no_rekening}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 transition-all duration-200"
                      placeholder="No Rekening"
                    />
                  </div>
                </div>
              </div>

              {/* Gaji Pokok */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm" 
              style={{ maxHeight: 'fit-content' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BanknotesIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Gaji Pokok</h3>
                    <p className="text-sm text-slate-600">Gaji dasar karyawan</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Gaji Pokok (Rp)</label>
                    <input
                      type="text"
                      name="gaji_pokok"
                      value={formatRupiah(payrollForm.gaji_pokok)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-slate-50 transition-all duration-200"
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Jabatan</label>
                    <input
                      type="text"
                      name="jabatan"
                      value={formatRupiah(payrollForm.jabatan)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-slate-50 transition-all duration-200"
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Masa Kerja (Tahun)</label>
                    <input
                      type="text"
                      name="masa_kerja_tahun"
                      value={payrollForm.masa_kerja_tahun || ''}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-slate-50 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Masa Kerja (Rp)</label>
                    <input
                      type="text"
                      name="masa_kerja"
                      value={formatRupiah(payrollForm.masa_kerja)}
                      onChange={handlePayrollChange}
                      onClick={handleMasaKerjaClick}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-slate-50 transition-all duration-200 cursor-pointer hover:bg-green-50 hover:border-green-400"
                      placeholder=""
                    />
                    <p className="text-xs text-slate-500">💡 Klik untuk menghitung: masa_kerja × masa_kerja_tahun (jika tahun {'>'} 0)</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Wali Kelas (Rp)</label>
                    <input
                      type="text"
                      name="wali_kelas"
                      value={formatRupiah(payrollForm.wali_kelas)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200"
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Koordinator (Rp)</label>
                    <input
                      type="text"
                      name="koordinator"
                      value={formatRupiah(payrollForm.koordinator)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200"
                      placeholder="300000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Tatap Muka (Rp)</label>
                    <input
                      type="text"
                      name="tatap_muka"
                      value={payrollForm.tatap_muka}
                      onChange={handlePayrollChange}
                      onClick={handleOpenTatapMukaModal}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 cursor-pointer hover:bg-blue-50"
                      placeholder="50000"
                    />
                    <p className="text-xs text-slate-500">💡 Klik untuk menghitung dengan formula</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Tatap Muka Pengganti (Rp)</label>
                    <input
                      type="text"
                      name="t_muka_pengganti"
                      value={payrollForm.t_muka_pengganti}
                      onChange={handlePayrollChange}
                      onClick={handleOpenTMukaPenggantiModal}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 cursor-pointer hover:bg-blue-50"
                      placeholder="0"
                    />
                    <p className="text-xs text-slate-500">💡 Klik untuk menghitung dengan formula</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Tunjangan Keluarga (Rp)</label>
                    <input
                      type="text"
                      name="tunj_keluarga"
                      value={formatRupiah(payrollForm.tunj_keluarga)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200"
                      placeholder="500000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Tunjangan Lain (Rp)</label>
                    <input
                      type="text"
                      name="tunj_lain"
                      value={formatRupiah(payrollForm.tunj_lain)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 transition-all duration-200"
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Transport 1 (Rp)</label>
                    <input
                      type="text"
                      name="transport1"
                      value={formatRupiah(payrollForm.transport1)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200"
                      placeholder="200000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Transport 2 (Rp)</label>
                    <input
                      type="text"
                      name="transport2"
                      value={formatRupiah(payrollForm.transport2)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200"
                      placeholder="100000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Makan (Rp)</label>
                    <input
                      type="text"
                      name="makan"
                      value={formatRupiah(payrollForm.makan)}
                      onChange={handlePayrollChange}
                      onClick={handleOpenMakanModal}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 cursor-pointer hover:bg-blue-50"
                      placeholder="400000"
                    />
                    <p className="text-xs text-slate-500">💡 Klik untuk menghitung dengan formula</p>
                  </div>
                </div>
              </div>


              {/* Aktivitas & Ekstrakurikuler */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Aktivitas & Ekstrakurikuler</h3>
                    <p className="text-sm text-slate-600">Kegiatan tambahan dan ekstrakurikuler</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Jamsostek (Rp)</label>
                    <input
                      type="text"
                      name="jamsostek"
                      value={formatRupiah(payrollForm.jamsostek)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 transition-all duration-200"
                      placeholder="200000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Overtime (Rp)</label>
                    <input
                      type="text"
                      name="overtime"
                      value={formatRupiah(payrollForm.overtime)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 transition-all duration-200"
                      placeholder="150000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Pramuka (Rp)</label>
                    <input
                      type="text"
                      name="pramuka"
                      value={formatRupiah(payrollForm.pramuka)}
                      onChange={handlePayrollChange}
                      onClick={handleOpenPramukaModal}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 transition-all duration-200 cursor-pointer hover:bg-purple-50"
                      placeholder=""
                    />
                    <p className="text-xs text-slate-500">💡 Klik untuk menghitung dengan formula</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Ekstrakurikuler (Rp)</label>
                    <input
                      type="text"
                      name="ekskul"
                      value={formatRupiah(payrollForm.ekskul)}
                      onChange={handlePayrollChange}
                      onClick={handleOpenEkskulModal}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 transition-all duration-200 cursor-pointer hover:bg-purple-50"
                      placeholder="200000"
                    />
                    <p className="text-xs text-slate-500">💡 Klik untuk menghitung dengan formula</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">BPJS (Rp)</label>
                    <input
                      type="text"
                      name="bpjs"
                      value={formatRupiah(payrollForm.bpjs)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 transition-all duration-200"
                      placeholder="300000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Bimbel (Rp)</label>
                    <input
                      type="text"
                      name="bimbel"
                      value={formatRupiah(payrollForm.bimbel)}
                      onChange={handlePayrollChange}
                      onClick={handleOpenBimbelModal}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 transition-all duration-200 cursor-pointer hover:bg-purple-50"
                      placeholder="250000"
                    />
                    <p className="text-xs text-slate-500">💡 Klik untuk menghitung dengan formula</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Proyek (Rp)</label>
                    <input
                      type="text"
                      name="proyek"
                      value={formatRupiah(payrollForm.proyek)}
                      onChange={handlePayrollChange}
                      onClick={handleOpenProyekModal}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 transition-all duration-200 cursor-pointer hover:bg-purple-50"
                      placeholder="200000"
                    />
                    <p className="text-xs text-slate-500">💡 Klik untuk menghitung dengan formula</p>
                  </div>
                </div>
              </div>

              {/* Insentif Pengajaran */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <CogIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Insentif Pengurus</h3>
                    <p className="text-sm text-slate-600">Insentif untuk kegiatan pengurus khusus</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Insentif Peng Pramuka (Rp)</label>
                    <input
                      type="text"
                      name="insentif_peng_pramuka"
                      value={formatRupiah(payrollForm.insentif_peng_pramuka)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 transition-all duration-200"
                      placeholder="150000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Insentif Peng Ekstrakurikuler (Rp)</label>
                    <input
                      type="text"
                      name="insentif_peng_ekskul"
                      value={formatRupiah(payrollForm.insentif_peng_ekskul)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 transition-all duration-200"
                      placeholder="200000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Insentif Peng Proyek (Rp)</label>
                    <input
                      type="text"
                      name="insentif_peng_proyek"
                      value={formatRupiah(payrollForm.insentif_peng_proyek)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 transition-all duration-200"
                      placeholder="300000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Insentif Pengurus Bimbel (Rp)</label>
                    <input
                      type="text"
                      name="insentif_pengurus_bimbel"
                      value={formatRupiah(payrollForm.insentif_pengurus_bimbel)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 transition-all duration-200"
                      placeholder="250000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Insentif Lain (Rp)</label>
                    <input
                      type="text"
                      name="insentif_lain"
                      value={formatRupiah(payrollForm.insentif_lain)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 transition-all duration-200"
                      placeholder="100000"
                    />
                  </div>
                </div>
              </div>

              {/* Informasi Kehadiran */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <ClockIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Informasi Kehadiran</h3>
                    <p className="text-sm text-slate-600">Data kehadiran dan transport harian</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Jumlah Hari Hadir</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="jumlah_hari"
                        value={formatRupiah(payrollForm.jumlah_hari)}
                        onChange={handlePayrollChange}
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={handleFetchJumlahHari}
                        disabled={!payrollForm.guru_id || isLoadingJumlahHari}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        title="Hitung Jumlah Hari dari Absensi"
                      >
                        {isLoadingJumlahHari ? (
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : (
                          <FunnelIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">💡 Dihitung otomatis dari tanggal 26 bulan sebelumnya sampai 25 bulan sekarang</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Total Transport (Rp)</label>
                    <input
                      type="text"
                      name="total_transport"
                      value={formatRupiah(payrollForm.total_transport)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-indigo-50 font-bold text-indigo-900 transition-all duration-200"
                      placeholder="0"
                      readOnly
                    />
                    <p className="text-xs text-slate-500">
                      Dihitung otomatis: Transport 1 (Rp {formatRupiah(payrollForm.transport1)}) × {payrollForm.jumlah_hari} hari
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Jumlah Hari Lain</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="jumlah_hari_lain"
                        value={formatRupiah(payrollForm.jumlah_hari_lain)}
                        onChange={handlePayrollChange}
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={handleFetchJumlahHari}
                        disabled={!payrollForm.guru_id || isLoadingJumlahHari}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        title="Hitung Jumlah Hari dari Absensi"
                      >
                        {isLoadingJumlahHari ? (
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : (
                          <FunnelIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">💡 Dihitung otomatis dari tanggal 26 bulan sebelumnya sampai 25 bulan sekarang</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Total Transport 2 (Rp)</label>
                    <input
                      type="text"
                      name="total_transport2"
                      value={formatRupiah(payrollForm.total_transport2)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-indigo-50 font-bold text-indigo-900 transition-all duration-200"
                      placeholder="0"
                      readOnly
                    />
                    <p className="text-xs text-slate-500">
                      Dihitung otomatis: Transport 2 (Rp {formatRupiah(payrollForm.transport2)}) × {payrollForm.jumlah_hari_lain} hari
                    </p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Total Transport All (Rp)</label>
                    <input
                      type="text"
                      name="total_transport_all"
                      value={formatRupiah(payrollForm.total_transport_all)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-green-50 font-bold text-green-900 transition-all duration-200"
                      placeholder="0"
                      readOnly
                    />
                    <p className="text-xs text-slate-500">
                      Dihitung otomatis: Total Transport (Rp {formatRupiah(payrollForm.total_transport)}) + Total Transport 2 (Rp {formatRupiah(payrollForm.total_transport2)})
                    </p>
                  </div>
                </div>
              </div>
              {/* Potongan Standar */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <MinusIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Potongan Standar</h3>
                    <p className="text-sm text-slate-600">Potongan tetap yang sudah ditentukan</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Potongan Yayasan (Rp)</label>
                    <input
                      type="text"
                      name="potongan_yayasan"
                      value={formatRupiah(payrollForm.potongan_yayasan)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Potongan Lain (Rp)</label>
                    <input
                      type="text"
                      name="potongan_lain"
                      value={formatRupiah(payrollForm.potongan_lain)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Potongan Koperasi/Iuran Wajib (Rp)</label>
                    <input
                      type="text"
                      name="potongan_koperasi_wajib"
                      value={formatRupiah(payrollForm.potongan_koperasi_wajib)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Potongan Koperasi/Iuran Sukarela (Rp)</label>
                    <input
                      type="text"
                      name="potongan_koperasi_sukarela"
                      value={formatRupiah(payrollForm.potongan_koperasi_sukarela)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Potongan Angsuran Koperasi (Rp)</label>
                    <input
                      type="text"
                      name="potongan_angsuran_koperasi"
                      value={formatRupiah(payrollForm.potongan_angsuran_koperasi)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Deposit Annurmart (Rp)</label>
                    <input
                      type="text"
                      name="deposit_annurmart"
                      value={formatRupiah(payrollForm.deposit_annurmart)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Potongan JHT (Rp)</label>
                    <input
                      type="text"
                      name="potongan_jht"
                      value={formatRupiah(payrollForm.potongan_jht)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Potongan PPH 21 (Rp)</label>
                    <input
                      type="text"
                      name="potongan_pph21"
                      value={formatRupiah(payrollForm.potongan_pph21)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Potongan Tatap Muka Pengganti (Rp)</label>
                    <input
                      type="text"
                      name="potongan_t_muka_pengganti"
                      value={formatRupiah(payrollForm.potongan_t_muka_pengganti)}
                      onChange={handlePayrollChange}
                      onClick={handleOpenPotonganTMukaModal}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50 transition-all duration-200 cursor-pointer hover:bg-red-50 hover:border-red-400"
                      placeholder="0"
                    />
                    <p className="text-xs text-slate-500">💡 Klik untuk menghitung dengan formula: jam × t_muka_pengganti</p>
                  </div>
                </div>
              </div>

              {/* Potongan */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <MinusIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Potongan</h3>
                    <p className="text-sm text-slate-600">Daftar potongan tambahan</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {potonganList.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50"
                          placeholder="Nama Potongan"
                          value={item.nama_potongan}
                          onChange={e => handlePotonganChange(idx, 'nama_potongan', e.target.value)}
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50"
                          placeholder="Jumlah Potongan"
                          value={formatRupiah(item.jumlah_potongan)}
                          onChange={e => handlePotonganChange(idx, 'jumlah_potongan', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          type="button"
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          onClick={() => handleRemovePotongan(idx)}
                          aria-label="Remove Potongan"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    onClick={handleAddPotongan}
                  >
                    Tambah Potongan
                  </button>
                </div>
              </div>
              {/* Total & Periode */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Total & Periode</h3>
                    <p className="text-sm text-slate-600">Total gaji dan periode pembayaran</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Total Gaji Kotor (Rp)</label>
                    <input
                      type="text"
                      name="total_gaji"
                      value={formatRupiah(payrollForm.total_gaji)}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500  transition-all duration-200 bg-green-50"
                      placeholder="0"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Total Potongan (Rp)</label>
                    <input
                      type="text"
                      name="total_potongan"
                      value={formatRupiah(hitungTotalPotongan())}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-green-50"
                      placeholder="0"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Gaji Bersih (Rp)</label>
                    <input
                      type="text"
                      name="gaji_bersih"
                      value={formatRupiah(payrollForm.total_gaji - hitungTotalPotongan())}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-blue-50 font-bold"
                      placeholder="0"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Status</label>
                    <select name="status" value={payrollForm.status} onChange={handlePayrollChange} className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-slate-50 transition-all duration-200">
                      <option value="">Pilih Status</option>
                      <option value="Draft">Draft</option>
                      <option value="Disetujui">Disetujui</option>
                      <option value="Dibayar">Dibayar</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Periode Bulan</label>
                    <select name="periode_bulan" value={payrollForm.periode_bulan} onChange={handlePayrollChange} className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-slate-50 transition-all duration-200">
                      <option value="">Pilih Bulan</option>
                      <option value="Januari">Januari</option>
                      <option value="Februari">Februari</option>
                      <option value="Maret">Maret</option>
                      <option value="April">April</option>
                      <option value="Mei">Mei</option>
                      <option value="Juni">Juni</option>
                      <option value="Juli">Juli</option>
                      <option value="Agustus">Agustus</option>
                      <option value="September">September</option>
                      <option value="Oktober">Oktober</option>
                      <option value="November">November</option>
                      <option value="Desember">Desember</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Periode Tahun</label>
                    <input
                      type="number"
                      name="periode_tahun"
                      value={payrollForm.periode_tahun}
                      onChange={handlePayrollChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-slate-50 transition-all duration-200"
                      placeholder=""
                      min="2020"
                      max="2030"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer dengan Buttons */}
          <div className="border-t border-slate-200 px-8 py-6 bg-slate-50 flex gap-3 justify-end rounded-b-xl -mx-6 -mb-6">
            <button
              type="button"
              onClick={() => {
                setShowSetupPayrollModal(false);
                // Reset edit mode saat modal ditutup
                setTimeout(() => {
                  setIsEditMode(false);
                  setEditPayrollId(null);
                  setPayrollForm(initialPayrollForm);
                  setPotonganList([{ nama_potongan: '', jumlah_potongan: '' }]);
                  setSelectedGuru(null);
                }, 300);
              }}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold transition-all duration-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handlePayrollSubmit}
              disabled={isSubmitting || !payrollForm.guru_id}
              className={`px-6 py-2.5 ${isEditMode ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEditMode ? 'Memperbarui...' : 'Menyimpan...'}
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  {isEditMode ? 'Perbarui' : 'Simpan'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Tatap Muka Calculator Modal */}
      <Modal
        isOpen={showTatapMukaModal}
        onClose={() => setShowTatapMukaModal(false)}
        title=""
        size="sm"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <CogIcon className="w-6 h-6" />
              Kalkulator Tatap Muka
            </h2>
            <p className="text-blue-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai base × 4
            </p>
          </div>

          {/* Current Values Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
              <p className="text-sm text-slate-600 mb-2">Tatap Muka Saat Ini:</p>
              <p className="text-2xl font-bold text-slate-900">
                {payrollForm.tatap_muka || 0}
              </p>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
              <p className="text-sm text-slate-600 mb-2">Nilai Base:</p>
              <p className="text-2xl font-bold text-slate-900">
                {(() => {
                  const baseValue = String(payrollForm.base_tatap_muka || '0');
                  // Handle format: jika ada koma, berarti format Indonesia (9.496,08) -> hapus titik ribu, ganti koma dengan titik
                  // Jika tidak ada koma tapi ada titik, cek apakah itu decimal separator (diikuti 1-2 digit di akhir)
                  let parsed = baseValue;
                  if (parsed.includes(',')) {
                    // Format Indonesia: hapus titik ribu, ganti koma dengan titik
                    parsed = parsed.replace(/\./g, '').replace(/,/g, '.');
                  } else if (parsed.includes('.')) {
                    // Format standar: cek apakah titik terakhir adalah decimal separator
                    const lastDotIndex = parsed.lastIndexOf('.');
                    const afterDot = parsed.substring(lastDotIndex + 1);
                    // Jika setelah titik ada 1-2 digit dan tidak ada titik lagi setelahnya, itu decimal separator
                    if (afterDot.length <= 2 && !parsed.substring(lastDotIndex + 1).includes('.')) {
                      // Decimal separator: hapus titik ribu sebelum titik terakhir, biarkan titik terakhir
                      const beforeLastDot = parsed.substring(0, lastDotIndex).replace(/\./g, '');
                      parsed = beforeLastDot + '.' + afterDot;
                    } else {
                      // Thousand separator: hapus semua titik
                      parsed = parsed.replace(/\./g, '');
                    }
                  }
                  const numValue = parseFloat(parsed) || 0;
                  // Format dengan 2 decimal untuk display
                  return numValue.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                })()}
              </p>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Masukkan Jumlah Jam
            </label>
            <input
              type="text"
              value={jamInput}
              onChange={(e) => setJamInput(e.target.value)}
              placeholder="Contoh: 2"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          {/* Formula Display */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-blue-600">
              Jam × Nilai Tatap Muka × 4
            </p>
            {jamInput && (
              <p className="text-sm text-blue-800 font-bold mt-2">
                = {jamInput} × {(() => {
                  const baseValue = String(payrollForm.base_tatap_muka || '0');
                  // Handle format: jika ada koma, berarti format Indonesia (9.496,08) -> hapus titik ribu, ganti koma dengan titik
                  // Jika tidak ada koma tapi ada titik, cek apakah itu decimal separator
                  let parsed = baseValue;
                  if (parsed.includes(',')) {
                    parsed = parsed.replace(/\./g, '').replace(/,/g, '.');
                  } else if (parsed.includes('.')) {
                    const lastDotIndex = parsed.lastIndexOf('.');
                    const afterDot = parsed.substring(lastDotIndex + 1);
                    if (afterDot.length <= 2 && !parsed.substring(lastDotIndex + 1).includes('.')) {
                      const beforeLastDot = parsed.substring(0, lastDotIndex).replace(/\./g, '');
                      parsed = beforeLastDot + '.' + afterDot;
                    } else {
                      parsed = parsed.replace(/\./g, '');
                    }
                  }
                  const numValue = parseFloat(parsed) || 0;
                  return numValue.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                })()} × 4
                <br/>
                = <span className="text-lg text-green-600">
                  {(() => {
                    const jamValue = parseFloat(jamInput.replace(/,/g, '.')) || 0;
                    const baseValue = String(payrollForm.base_tatap_muka || '0');
                    let parsed = baseValue;
                    if (parsed.includes(',')) {
                      parsed = parsed.replace(/\./g, '').replace(/,/g, '.');
                    } else if (parsed.includes('.')) {
                      const lastDotIndex = parsed.lastIndexOf('.');
                      const afterDot = parsed.substring(lastDotIndex + 1);
                      if (afterDot.length <= 2 && !parsed.substring(lastDotIndex + 1).includes('.')) {
                        const beforeLastDot = parsed.substring(0, lastDotIndex).replace(/\./g, '');
                        parsed = beforeLastDot + '.' + afterDot;
                      } else {
                        parsed = parsed.replace(/\./g, '');
                      }
                    }
                    const baseNum = parseFloat(parsed) || 0;
                    const result = Math.round(jamValue * baseNum * 4);
                    return result.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  })()}
                </span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowTatapMukaModal(false)}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleTatapMukaCalculate}
              disabled={!jamInput}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
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
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <CogIcon className="w-6 h-6" />
              Kalkulator Pramuka
            </h2>
            <p className="text-purple-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai base
            </p>
          </div>

          {/* Current Values Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
              <p className="text-sm text-slate-600 mb-2">Pramuka Saat Ini:</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatRupiah(payrollForm.pramuka || 0)}
              </p>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
              <p className="text-sm text-slate-600 mb-2">Nilai Base:</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatRupiah(payrollForm.base_pramuka || 0)}
              </p>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Masukkan Jumlah Jam
            </label>
            <input
              type="text"
              value={jamPramukaInput}
              onChange={(e) => setJamPramukaInput(e.target.value)}
              placeholder="Contoh: 2"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          {/* Formula Display */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-purple-600">
              Jam × Nilai Base
            </p>
            {jamPramukaInput && (
              <p className="text-sm text-purple-800 font-bold mt-2">
                = {jamPramukaInput} × {formatRupiah(payrollForm.base_pramuka || 0)}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamPramukaInput.replace(/,/g, '.')) || 0) * 
                      (Number(payrollForm.base_pramuka) || 0)
                    )
                  )}
                </span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Hitung & Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Potongan Tatap Muka Pengganti Calculator Modal */}
      <Modal
        isOpen={showPotonganTMukaModal}
        onClose={() => setShowPotonganTMukaModal(false)}
        title=""
        size="sm"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <CogIcon className="w-6 h-6" />
              Kalkulator Potongan Tatap Muka Pengganti
            </h2>
            <p className="text-blue-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan t_muka_pengganti
            </p>
          </div>

          {/* Current Values Display */}
          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <p className="text-sm text-slate-600 mb-2">T. Muka Pengganti:</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRupiah(parseFloat(String(payrollForm.t_muka_pengganti).replace(/,/g, '.')) || 0)}
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Masukkan Jumlah Jam
            </label>
            <input
              type="text"
              value={jamPotonganInput}
              onChange={(e) => setJamPotonganInput(e.target.value)}
              placeholder="Contoh: 2"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          {/* Formula Display */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-blue-600">
              Jam × T. Muka Pengganti
            </p>
            {jamPotonganInput && (
              <p className="text-sm text-blue-800 font-bold mt-2">
                = {jamPotonganInput} × {parseFloat(String(payrollForm.t_muka_pengganti).replace(/\./g, '').replace(/,/g, '')) || 0}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamPotonganInput.replace(/,/g, '.')) || 0) * 
                      (parseFloat(String(payrollForm.t_muka_pengganti).replace(/\./g, '').replace(/,/g, '')) || 0)
                    )
                  )}
                </span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowPotonganTMukaModal(false)}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={handlePotonganTMukaCalculate}
              disabled={!jamPotonganInput}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Hitung & Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Tatap Muka Pengganti Calculator Modal */}
      <Modal
        isOpen={showTMukaPenggantiModal}
        onClose={() => setShowTMukaPenggantiModal(false)}
        title=""
        size="sm"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <CogIcon className="w-6 h-6" />
              Kalkulator Tatap Muka Pengganti
            </h2>
            <p className="text-blue-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai T. Muka Pengganti saat ini
            </p>
          </div>

          {/* Current Value Display */}
          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <p className="text-sm text-slate-600 mb-2">Nilai Base T. Muka Pengganti:</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRupiah(parseFloat(String(payrollForm.base_t_muka_pengganti).replace(/\./g, '').replace(/,/g, '')) || 0)}
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Masukkan Jumlah Jam
            </label>
            <input
              type="text"
              value={jamTMukaPenggantiInput}
              onChange={(e) => setJamTMukaPenggantiInput(e.target.value)}
              placeholder="Contoh: 2"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          {/* Formula Display */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-blue-600">
              Jam × T. Muka Pengganti
            </p>
            {jamTMukaPenggantiInput && (
              <p className="text-sm text-blue-800 font-bold mt-2">
                = {jamTMukaPenggantiInput} × {formatRupiah(parseFloat(String(payrollForm.base_t_muka_pengganti).replace(/\./g, '').replace(/,/g, '')) || 0)}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamTMukaPenggantiInput.replace(/,/g, '.')) || 0) * 
                      (parseFloat(String(payrollForm.base_t_muka_pengganti).replace(/\./g, '').replace(/,/g, '')) || 0)
                    )
                  )}
                </span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowTMukaPenggantiModal(false)}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleTMukaPenggantiCalculate}
              disabled={!jamTMukaPenggantiInput}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Hitung & Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Makan Calculator Modal */}
      <Modal
        isOpen={showMakanModal}
        onClose={() => setShowMakanModal(false)}
        title=""
        size="sm"
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <CogIcon className="w-6 h-6" />
              Kalkulator Makan
            </h2>
            <p className="text-blue-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai Makan saat ini
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <p className="text-sm text-slate-600 mb-2">Nilai Base Makan:</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRupiah(payrollForm.base_makan)}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Masukkan Jumlah Jam
            </label>
            <input
              type="text"
              value={jamMakanInput}
              onChange={(e) => setJamMakanInput(e.target.value)}
              placeholder="Contoh: 2"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-blue-600">
              Jam × Makan
            </p>
            {jamMakanInput && (
              <p className="text-sm text-blue-800 font-bold mt-2">
                = {jamMakanInput} × {formatRupiah(payrollForm.base_makan)}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamMakanInput.replace(/,/g, '.')) || 0) * 
                      (Number(String(payrollForm.base_makan).replace(/\./g, '')))
                    )
                  )}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowMakanModal(false)}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleMakanCalculate}
              disabled={!jamMakanInput}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
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
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <CogIcon className="w-6 h-6" />
              Kalkulator Ekstrakurikuler
            </h2>
            <p className="text-purple-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai Ekskul saat ini
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <p className="text-sm text-slate-600 mb-2">Nilai Base Ekskul:</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRupiah(payrollForm.base_ekskul)}
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
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-purple-600">
              Jam × Ekskul
            </p>
            {jamEkskulInput && (
              <p className="text-sm text-purple-800 font-bold mt-2">
                = {jamEkskulInput} × {formatRupiah(payrollForm.base_ekskul)}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamEkskulInput.replace(/,/g, '.')) || 0) * 
                      (Number(String(payrollForm.base_ekskul).replace(/\./g, '')))
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
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Hitung & Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Bimbel Calculator Modal */}
      <Modal
        isOpen={showBimbelModal}
        onClose={() => setShowBimbelModal(false)}
        title=""
        size="sm"
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <CogIcon className="w-6 h-6" />
              Kalkulator Bimbel
            </h2>
            <p className="text-orange-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai Bimbel saat ini
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <p className="text-sm text-slate-600 mb-2">Nilai Base Bimbel:</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRupiah(payrollForm.base_bimbel)}
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
                = {jamBimbelInput} × {formatRupiah(payrollForm.base_bimbel)}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamBimbelInput.replace(/,/g, '.')) || 0) * 
                      (Number(String(payrollForm.base_bimbel).replace(/\./g, '')))
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
              <CheckCircleIcon className="w-4 h-4" />
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
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <CogIcon className="w-6 h-6" />
              Kalkulator Proyek
            </h2>
            <p className="text-green-100 text-sm mt-2">
              Masukkan jumlah jam untuk dikalikan dengan nilai Proyek saat ini
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <p className="text-sm text-slate-600 mb-2">Nilai Base Proyek:</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRupiah(payrollForm.base_proyek)}
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
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 font-semibold mb-2">📐 Formula Perhitungan:</p>
            <p className="text-sm text-green-600">
              Jam × Proyek
            </p>
            {jamProyekInput && (
              <p className="text-sm text-green-800 font-bold mt-2">
                = {jamProyekInput} × {formatRupiah(payrollForm.base_proyek)}
                <br/>
                = <span className="text-lg text-green-600">
                  {formatRupiah(
                    Math.round(
                      (parseFloat(jamProyekInput.replace(/,/g, '.')) || 0) * 
                      (Number(String(payrollForm.base_proyek).replace(/\./g, '')))
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
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Hitung & Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Detail Slip Gaji */}
      <Modal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        title=""
        size="xl"
      >
        {selectedSlip && (
          <div className="space-y-6">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <EyeIcon className="w-7 h-7" />
                Detail Slip Gaji
              </h2>
              <p className="text-blue-100 text-sm mt-2">
                Periode: {formatPeriode(selectedSlip.periode)} • Status: {selectedSlip.status}
              </p>
            </div>

            {/* Info Karyawan */}
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-indigo-600" />
                Informasi Karyawan
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Nama</p>
                  <p className="font-semibold text-slate-900">{selectedSlip.nama}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">NIP</p>
                  <p className="font-semibold text-slate-900">{selectedSlip.nip}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Jabatan</p>
                  <p className="font-semibold text-slate-900">{selectedSlip.jabatan}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Divisi</p>
                  <p className="font-semibold text-slate-900">{selectedSlip.divisi}</p>
                </div>
              </div>
            </div>

            {/* Pendapatan */}
            <div className="bg-green-50 p-5 rounded-lg border border-green-200">
              <h3 className="font-bold text-lg mb-4 text-green-800">💰 Pendapatan</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Gaji Pokok:</span>
                  <span className="font-semibold">{formatCurrency(selectedSlip.gajiPokok)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Tunjangan Jabatan:</span>
                  <span className="font-semibold">{formatCurrency(selectedSlip.tunjanganJabatan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Masa Kerja:</span>
                  <span className="font-semibold">{formatCurrency(selectedSlip.masaKerja)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Transport:</span>
                  <span className="font-semibold">{formatCurrency(selectedSlip.transport)}</span>
                </div>
                <div className="col-span-2 border-t border-green-300 pt-3 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-green-800">Total Pendapatan:</span>
                    <span className="font-bold text-green-800 text-lg">{formatCurrency(selectedSlip.totalPendapatan)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Potongan */}
            <div className="bg-red-50 p-5 rounded-lg border border-red-200">
              <h3 className="font-bold text-lg mb-4 text-red-800">📉 Potongan</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Potongan Yayasan:</span>
                  <span className="font-semibold">{formatCurrency(selectedSlip.potonganYayasan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Potongan BPJS:</span>
                  <span className="font-semibold">{formatCurrency(selectedSlip.potonganBPJS)}</span>
                </div>
                <div className="col-span-2 border-t border-red-300 pt-3 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-red-800">Total Potongan:</span>
                    <span className="font-bold text-red-800 text-lg">{formatCurrency(selectedSlip.totalPotongan)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gaji Bersih */}
            <div className="bg-indigo-50 p-5 rounded-lg border-2 border-indigo-400">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xl text-indigo-900">💵 Gaji Diterima:</span>
                <span className="font-bold text-2xl text-indigo-900">{formatCurrency(selectedSlip.gajiDiterima)}</span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                onClick={handleCloseDetailModal}
                className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold transition-all duration-200"
              >
                Tutup
              </button>
              <button
                onClick={() => handleActualPrint(selectedSlip)}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <PrinterIcon className="w-4 h-4" />
                Print Slip
              </button>
            </div>
          </div>
        )}
      </Modal>

    </PayrollLayout>
  );
};

export default SlipGaji;