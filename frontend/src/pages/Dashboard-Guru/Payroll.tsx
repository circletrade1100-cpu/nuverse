import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import Swal from 'sweetalert2';
import GlobalPageWrapper from '../../components/GlobalPageWrapper';
import ProtectedRoute from '../../components/ProtectedRoute';
import { HeaderSkeleton, PayrollCardSkeleton, TabContentSkeleton } from '../../components/SkeletonLoader';
import SlipGajiTemplate from '../../components/Payroll/SlipGajiTemplate';
import SlipTHRTemplate, { type SlipTHRData } from '../../components/Payroll/SlipTHRTemplate';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
  Wallet,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useGuruAuth } from '../../hooks/useGuruAuth';
import { guruPayrollService, type GuruTHRData, type PayrollData, type PayrollHistoryItem } from '../../services/guruPayrollService';

const Payroll: React.FC = () => {
  const navigate = useNavigate();
  const [showSalary, setShowSalary] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [thrData, setThrData] = useState<GuruTHRData | null>(null);
  const [payrollHistory, setPayrollHistory] = useState<PayrollHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { guru } = useGuruAuth();

  // Fetch payroll data from backend
  useEffect(() => {
    const fetchPayrollData = async () => {
      if (!guru?.id) {
        setError('Data guru tidak ditemukan');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching payroll data for authenticated guru');
        
        const [payroll, thr] = await Promise.all([
          guruPayrollService.getGuruPayroll(),
          guruPayrollService.getGuruTHR()
        ]);
        
        if (payroll) {
          setPayrollData(payroll);
          console.log('✅ Payroll data loaded:', payroll);
        } else {
          console.log('ℹ️ No payroll data available');
          setPayrollData(null);
          // Tidak set error, biarkan payrollData tetap null untuk ditampilkan pesan "belum ada data"
        }

        setThrData(thr);
        
      } catch (err) {
        console.error('❌ Error fetching payroll data:', err);
        setError('Gagal mengambil data payroll. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, [guru?.id]);

  // Fetch payroll history
  const fetchPayrollHistory = async () => {
    if (!guru?.id) {
      console.log('❌ No guru ID available for payroll history fetch');
      return;
    }

    console.log('🔄 Fetching payroll history for guru:', guru.nama_lengkap, 'ID:', guru.id);

    try {
      setLoadingHistory(true);
      const history = await guruPayrollService.getGuruPayrollHistory();
      console.log('✅ Payroll history received:', history);
      setPayrollHistory(history || []);
      setHistoryLoaded(true);
    } catch (error) {
      console.error('❌ Error fetching payroll history:', error);
      setPayrollHistory([]);
      setHistoryLoaded(true);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load history when history tab is selected
  useEffect(() => {
    if (activeTab === 'history' && !historyLoaded && !loadingHistory) {
      fetchPayrollHistory();
    }
  }, [activeTab, historyLoaded, loadingHistory]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDownloadSlip = async () => {
    if (!payrollData) {
      await Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Tersedia',
        text: 'Data payroll tidak tersedia untuk didownload.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    if (!payrollData.id) {
      await Swal.fire({
        icon: 'error',
        title: 'ID Payroll Tidak Ditemukan',
        text: 'Tidak dapat menemukan ID payroll. Silakan refresh halaman dan coba lagi.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

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

      // Fetch data lengkap dari backend menggunakan ID payroll
      const token = localStorage.getItem('guru_token') || localStorage.getItem('auth_token');
      const baseUrl = import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001';
      const response = await fetch(`${baseUrl}/api/master-data/payroll/guru/my-slip/${payrollData.id}`, {
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
      const templateData = {
        id: payrollData.id || String(payroll.payroll_id || payroll.id || ''),
        nip: payroll.guru?.nip || payrollData.guru.nip || '',
        nama: payroll.guru?.nama_lengkap || payrollData.guru.nama_lengkap || '',
        divisi: payroll.guru?.unitSekolah?.nama || payroll.guru?.unit_sekolah?.nama || '',
        jabatan: payroll.guru?.jabatan?.nama || payrollData.guru.jabatan?.nama || '',
        periode: payroll.periode_bulan && payroll.periode_tahun 
          ? `${payroll.periode_bulan} ${payroll.periode_tahun}`
          : `${payrollData.periode.bulan} ${payrollData.periode.tahun}`,
        
        // Pendapatan - Gaji Dasar & Tunjangan
        gajiPokok: Number(payroll.gaji_pokok) || payrollData.gaji_pokok || 0,
        tunjanganJabatan: Number(payroll.jabatan) || payrollData.tunjangan.jabatan || 0,
        masaKerja: Number(payroll.masa_kerja) || payrollData.tunjangan.masa_kerja || 0,
        waliKelas: Number(payroll.wali_kelas) || payrollData.tunjangan.wali_kelas || 0,
        koordinator: Number(payroll.koordinator) || payrollData.tunjangan.koordinator || 0,
        tatapmuka: Number(payroll.tatap_muka) || payrollData.tunjangan.tatap_muka || 0,
        tatapMukaPengganti: Number(payroll.t_muka_pengganti) || payrollData.tunjangan.t_muka_pengganti || 0,
        baseTatapMukaPengganti: Number(payroll.guru?.t_muka_pengganti || payroll.base_t_muka_pengganti || 0) || 0,
        tatapMukaPenggantiPerHari: Number(payroll.guru?.t_muka_pengganti) || 0,
        jmlJamTMukaPengganti: Number(payroll.jml_jam_t_muka_pengganti) || 0,
        jumlahHariTatapMukaPengganti: 23,
        tunjanganKeluarga: Number(payroll.tunj_keluarga) || payrollData.tunjangan.tunj_keluarga || 0,
        tunjanganLain: Number(payroll.tunj_lain) || payrollData.tunjangan.tunj_lain || 0,
        transport: Number(payroll.total_transport_all) || (Number(payroll.transport1) || 0) + (Number(payroll.transport2) || 0),
        transport1: Number(payroll.transport1) || payrollData.tunjangan.transport1 || 0,
        transport2: Number(payroll.transport2) || payrollData.tunjangan.transport2 || 0,
        transport1PerHari: Number(payroll.guru?.transport1) || 0,
        transport2PerHari: Number(payroll.guru?.transport2) || 0,
        jumlahHari: Number(payroll.jumlah_hari) || 0,
        jumlahHariLain: Number(payroll.jumlah_hari_lain) || 0,
        totalTransport: Number(payroll.jumlah_hari) * Number(payroll.transport1) || 0,
        totalTransport2: Number(payroll.jumlah_hari_lain) * Number(payroll.transport2) || 0,
        totalTransportAll: Number(payroll.total_transport_all) || ((Number(payroll.jumlah_hari) * Number(payroll.transport1) || 0) + (Number(payroll.jumlah_hari_lain) * Number(payroll.transport2) || 0)),
        jmlHariTransport1: Number(payroll.jml_hari_transport1) || 0,
        jmlHariTransport2: Number(payroll.jml_hari_transport2) || 0,
        makan: Number(payroll.makan) || payrollData.tunjangan.makan || 0,
        makanHari: Number(payroll.makan_hari) || 0,
        makanPerHari: Number(payroll.guru?.makan) || 0,
        jamsostek: Number(payroll.jamsostek) || payrollData.tunjangan.jamsostek || 0,
        overtime: Number(payroll.overtime) || payrollData.tunjangan.overtime || 0,
        overtimeHari: Number(payroll.overtime_hari) || 0,
        overtimePerHari: Number(payroll.guru?.overtime) || 0,
        
        // Insentif
        pramuka: Number(payroll.pramuka) || payrollData.tunjangan.pramuka || 0,
        jmlJamPramuka: Number(payroll.jml_jam_pramuka) || 0,
        pramukaPerJam: Number(payroll.guru?.pramuka) || 0,
        ekskul: Number(payroll.ekskul) || payrollData.tunjangan.ekskul || 0,
        jmlJamInsentifEkskul: Number(payroll.jml_jam_insentif_ekskul) || 0,
        ekskulPerJam: Number(payroll.guru?.ekskul) || 0,
        bimbel: Number(payroll.bimbel) || payrollData.tunjangan.bimbel || 0,
        jmlJamInsentifBimbel: Number(payroll.jml_jam_insentif_bimbel) || 0,
        bimbelPerJam: Number(payroll.guru?.bimbel) || 0,
        proyek: Number(payroll.proyek) || payrollData.tunjangan.proyek || 0,
        jmlJamInsentifProyek: Number(payroll.jml_jam_insentif_proyek) || 0,
        proyekPerJam: Number(payroll.guru?.proyek) || 0,
        insentifPramuka: Number(payroll.insentif_peng_pramuka) || payrollData.tunjangan.insentif_peng_pramuka || 0,
        insentifEkskul: Number(payroll.insentif_peng_ekskul) || payrollData.tunjangan.insentif_peng_ekskul || 0,
        insentifProyek: Number(payroll.insentif_peng_proyek) || payrollData.tunjangan.insentif_peng_proyek || 0,
        insentifBimbel: Number(payroll.insentif_pengurus_bimbel) || 0,
        insentifLain: Number(payroll.insentif_lain) || 0,
        
        // Lembur
        lemburHari: Number(payroll.jumlah_hari) || 0,
        gajiLembur: Number(payroll.overtime) || 0,
        
        // Total Pendapatan
        totalPendapatan: Number(payroll.total_gaji) || (payrollData.gaji_pokok + payrollData.tunjangan.total),
        
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
        potonganBPJS: Number(payroll.bpjs) || 0,
        potonganPajak: 0,
        potonganAbsen: 0,
        
        // Total Potongan & Net
        totalPotongan: Number(payroll.total_potongan) || payrollData.total_potongan || 0,
        gajiDiterima: Number(payroll.gaji_bersih) || payrollData.gaji_bersih || 0,
        totalGaji: Number(payroll.total_gaji) || (payrollData.gaji_pokok + payrollData.tunjangan.total),
        status: (payroll.status as 'Draft' | 'Disetujui' | 'Dibayar') || (payrollData.periode.status as 'Draft' | 'Disetujui' | 'Dibayar') || 'Draft',
        tanggalGenerate: payroll.created_date || payroll.created_at || payrollData.created_date || new Date().toISOString().split('T')[0],
        tanggalBayar: payroll.status === 'Dibayar' ? (payroll.updated_at || new Date().toISOString().split('T')[0]) : undefined,
        namaBank: payroll.guru?.nama_bank || '',
        noRekening: payroll.guru?.no_rekening || '',
        memo: payroll.memo || ''
      };

      // Update loading message
      Swal.update({
        title: 'Mengkonversi ke PDF...',
        text: 'Mohon tunggu sebentar'
      });

      // Buat temporary container di halaman yang sama (hidden) dengan ukuran lebih besar
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm'; // A4 width
      tempContainer.style.minHeight = '297mm'; // A4 height
      tempContainer.style.padding = '6mm';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.zIndex = '-9999';
      tempContainer.id = 'slip-gaji-temp-container';
      
      // Inject CSS ringan agar layout tetap proporsional dengan template asli
      const style = document.createElement('style');
      style.setAttribute('data-slip-gaji-style', 'true');
      style.textContent = `
        #slip-gaji-temp-container .max-w-5xl {
          max-width: 100% !important;
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(tempContainer);

      // Render template ke temporary container dengan ukuran lebih besar
      const root = createRoot(tempContainer);
      root.render(
        React.createElement(SlipGajiTemplate, {
          data: templateData,
          showWatermark: false
        })
      );

      // Tunggu rendering selesai
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update loading message
      Swal.update({
        title: 'Mengkonversi ke PDF...',
        text: 'Sedang memproses gambar...'
      });

      // Convert HTML ke PNG menggunakan html-to-image.
      // Library ini menggunakan rendering native browser sehingga aman untuk warna oklch.
      const contentNode = tempContainer.firstElementChild as HTMLElement | null;
      if (!contentNode) {
        throw new Error('Template slip gaji gagal dirender.');
      }

      const imgData = await toPng(contentNode, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        skipAutoScale: true,
        width: Math.ceil(contentNode.scrollWidth),
        height: Math.ceil(contentNode.scrollHeight)
      });

      // Hapus temporary container dan style
      root.unmount();
      document.body.removeChild(tempContainer);
      document.head.removeChild(style);

      // Buat PDF dari image dengan ukuran A4 penuh
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      // Calculate image dimensions to fit A4
      const imgWidth = pdfWidth;
      const sourceWidth = Math.max(contentNode.scrollWidth, 1);
      const sourceHeight = Math.max(contentNode.scrollHeight, 1);
      const imgHeight = (sourceHeight * pdfWidth) / sourceWidth;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      // Generate filename
      const bulan = templateData.periode.split(' ')[0] || 'Unknown';
      const tahun = templateData.periode.split(' ')[1] || new Date().getFullYear();
      const namaFile = `Slip_Gaji_${templateData.nama.replace(/\s+/g, '_')}_${bulan}_${tahun}.pdf`;

      // Download PDF
      pdf.save(namaFile);

      // Close loading
      await Swal.close();

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Download Berhasil',
        text: `Slip gaji telah diunduh sebagai ${namaFile}`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981',
        timer: 2000
      });

    } catch (error: any) {
      console.error('Error generating PDF:', error);
      
      // Cleanup jika ada error
      try {
        const container = document.getElementById('slip-gaji-temp-container');
        if (container) {
          document.body.removeChild(container);
        }
        const style = document.querySelector('style[data-slip-gaji-style]');
        if (style) {
          document.head.removeChild(style);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Generate PDF',
        text: error?.message || 'Terjadi kesalahan saat menggenerate PDF. Silakan coba lagi.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleDownloadTHR = async () => {
    if (!thrData) {
      await Swal.fire({
        icon: 'warning',
        title: 'Data THR Tidak Tersedia',
        text: 'Data THR belum tersedia untuk didownload.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Memuat Data THR...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const detail = await guruPayrollService.getGuruTHRSlip(thrData.id);

      if (!detail) {
        throw new Error('Data THR tidak ditemukan.');
      }

      const toNumber = (value: unknown) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const templateData: SlipTHRData = {
        id: detail.id,
        namaLengkap: detail.nama_lengkap || guru?.nama_lengkap || '-',
        nip: detail.nip || undefined,
        jabatan: detail.jabatan || '',
        unitSekolah: detail.unit_sekolah || detail.unit_sekolah_nama || '',
        masaKerjaTahun: toNumber(detail.masa_kerja_tahun),
        gajiPokok: toNumber(detail.gaji_pokok),
        tunjanganJabatan: toNumber(detail.tunjangan_jabatan),
        masaKerjaRupiah: toNumber(detail.masa_kerja_rupiah),
        jumlahTatapMuka: toNumber(detail.jumlah_tatap_muka),
        tatapMukaRupiah: toNumber(detail.tatap_muka_rupiah),
        totalRupiah: toNumber(detail.total_rupiah),
        tahun: toNumber(detail.tahun),
        namaBank: detail.nama_bank || undefined,
        noRekening: detail.no_rekening || undefined,
        tanggalCetak: detail.updated_at || detail.created_at || new Date().toISOString()
      };

      Swal.update({
        title: 'Mengkonversi ke PDF...',
        text: 'Mohon tunggu sebentar'
      });

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm';
      tempContainer.style.minHeight = '297mm';
      tempContainer.style.padding = '6mm';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.zIndex = '-9999';
      tempContainer.id = 'slip-thr-temp-container';

      const style = document.createElement('style');
      style.setAttribute('data-slip-thr-style', 'true');
      style.textContent = `
        #slip-thr-temp-container > div {
          min-height: auto !important;
          background: #ffffff !important;
        }
        #slip-thr-temp-container .max-w-4xl {
          max-width: 100% !important;
          padding: 0 !important;
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(tempContainer);

      const root = createRoot(tempContainer);
      root.render(
        React.createElement(SlipTHRTemplate, {
          data: templateData
        })
      );

      await new Promise(resolve => setTimeout(resolve, 1500));

      Swal.update({
        title: 'Mengkonversi ke PDF...',
        text: 'Sedang memproses gambar...'
      });

      const contentNode = tempContainer.firstElementChild as HTMLElement | null;
      if (!contentNode) {
        throw new Error('Template slip THR gagal dirender.');
      }

      const sourceWidth = Math.max(contentNode.scrollWidth, 1);
      const sourceHeight = Math.max(contentNode.scrollHeight, 1);
      const imgData = await toPng(contentNode, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        skipAutoScale: true,
        width: sourceWidth,
        height: sourceHeight
      });

      root.unmount();
      document.body.removeChild(tempContainer);
      document.head.removeChild(style);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (sourceHeight * pdfWidth) / sourceWidth;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const namaFile = `Slip_THR_${templateData.namaLengkap.replace(/\s+/g, '_')}_${templateData.tahun}.pdf`;
      pdf.save(namaFile);

      await Swal.close();
      await Swal.fire({
        icon: 'success',
        title: 'Download Berhasil',
        text: `Slip THR telah diunduh sebagai ${namaFile}`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981',
        timer: 2000
      });
    } catch (error: any) {
      if (Swal.isVisible()) {
        Swal.close();
      }

      try {
        const container = document.getElementById('slip-thr-temp-container');
        if (container) {
          document.body.removeChild(container);
        }
        const style = document.querySelector('style[data-slip-thr-style]');
        if (style) {
          document.head.removeChild(style);
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      await Swal.fire({
        icon: 'error',
        title: 'Gagal Generate PDF THR',
        text: error?.message || 'Terjadi kesalahan saat menggenerate PDF THR. Silakan coba lagi.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    }
  };


  // Loading component dengan skeleton
  if (loading) {
    return (
      <ProtectedRoute>
        <GlobalPageWrapper>
          <div className="min-h-screen bg-gray-50">
            <HeaderSkeleton />
            <div className="p-6 space-y-6">
              <PayrollCardSkeleton />
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex space-x-4 mb-6">
                  <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
                  <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>
                <TabContentSkeleton />
              </div>
            </div>
          </div>
        </GlobalPageWrapper>
      </ProtectedRoute>
    );
  }

  // Error component
  if (error) {
    return (
      <ProtectedRoute>
        <GlobalPageWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gagal Memuat Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
        </div>
      </GlobalPageWrapper>
      </ProtectedRoute>
    );
  }

  // No data component
  if (!payrollData) {
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
                <h1 className="text-white text-xl font-semibold">Payroll</h1>
              </div>
            </div>
          </div>

          {/* No Data Message */}
          <div className="px-6 -mt-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Data Payroll</h3>
                <p className="text-gray-600 mb-6">Data payroll untuk periode ini belum tersedia. Silakan hubungi administrator untuk informasi lebih lanjut.</p>
                {thrData && (
                  <div className="mb-6">
                    <button
                      onClick={handleDownloadTHR}
                      className="w-full flex items-center justify-center space-x-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                        <Download className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-800">Download Slip THR</p>
                        <p className="text-sm text-gray-600">Slip THR {thrData.tahun}</p>
                      </div>
                    </button>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => navigate('/guru/dashboard')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Kembali ke Dashboard
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Refresh Halaman
                  </button>
                </div>
              </div>
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
            <h1 className="text-white text-xl font-semibold">Payroll</h1>
          </div>
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Salary Card */}
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-green-100 text-sm">Gaji Bulan Ini</p>
              <div className="flex items-center space-x-3">
                <span className="text-white text-2xl font-bold">
                  {showSalary ? formatCurrency(payrollData.gaji_bersih) : '••••••••'}
                </span>
                <button 
                  onClick={() => setShowSalary(!showSalary)}
                  className="w-6 h-6 text-white/80 hover:text-white transition-colors"
                >
                  {showSalary ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-green-200">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+2.4%</span>
              </div>
              <p className="text-green-100 text-xs">vs bulan lalu</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <p className="text-green-200 text-xs">Gaji Pokok</p>
              <p className="text-white text-sm font-semibold">
                {showSalary ? formatCurrency(payrollData.gaji_pokok) : '••••••'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-200 text-xs">Tunjangan</p>
              <p className="text-white text-sm font-semibold">
                {showSalary ? formatCurrency(payrollData.tunjangan.total) : '••••••'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-200 text-xs">Potongan</p>
              <p className="text-white text-sm font-semibold">
                {showSalary ? formatCurrency(payrollData.total_potongan) : '••••••'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-1 shadow-sm mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 text-center rounded-xl transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-green-600 text-white font-semibold' 
                  : 'text-gray-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`flex-1 py-3 text-center rounded-xl transition-colors ${
                activeTab === 'detail' 
                  ? 'bg-green-600 text-white font-semibold' 
                  : 'text-gray-600'
              }`}
            >
              Detail Gaji
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-center rounded-xl transition-colors ${
                activeTab === 'history' 
                  ? 'bg-green-600 text-white font-semibold' 
                  : 'text-gray-600'
              }`}
            >
              Riwayat
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Download Slip Action */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
              <button 
                onClick={handleDownloadSlip}
                className="w-full flex items-center justify-center space-x-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Download Slip Gaji</p>
                  <p className="text-sm text-gray-600">Slip gaji bulan ini</p>
                </div>
              </button>
              {thrData && (
                <button
                  onClick={handleDownloadTHR}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors mt-3"
                >
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Download Slip THR</p>
                    <p className="text-sm text-gray-600">Slip THR {thrData.tahun}</p>
                  </div>
                </button>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-gray-600 text-sm">Total Diterima</p>
                <p className="text-xl font-bold text-gray-800">
                  {showSalary ? formatCurrency(payrollData.gaji_bersih) : '••••••••'}
                </p>
                <p className="text-green-600 text-xs mt-1">+2.4% dari bulan lalu</p>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                  </div>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-gray-600 text-sm">Total Potongan</p>
                <p className="text-xl font-bold text-gray-800">
                  {showSalary ? formatCurrency(payrollData.total_potongan) : '••••••••'}
                </p>
                <p className="text-red-500 text-xs mt-1">-1.2% dari bulan lalu</p>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Status Pembayaran</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Gaji {payrollData.periode.bulan} {payrollData.periode.tahun}</p>
                      <p className="text-sm text-gray-600">Dibayar pada {new Date(payrollData.created_date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {showSalary ? formatCurrency(payrollData.gaji_bersih) : '••••••••'}
                    </p>
                    <p className="text-xs text-green-600">Transfer Bank</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'detail' && (
          <>
            {/* Gaji Pokok */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Gaji Pokok</h3>
                <span className="text-lg font-bold text-gray-800">
                  {showSalary ? formatCurrency(payrollData.gaji_pokok) : '••••••••'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
            </div>

            {/* Tunjangan */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Tunjangan</h3>
                <span className="text-lg font-bold text-green-600">
                  +{showSalary ? formatCurrency(payrollData.tunjangan.total) : '••••••••'}
                </span>
              </div>
              <div className="space-y-3">
                {Object.entries(payrollData.tunjangan).filter(([key]) => key !== 'total').map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium text-gray-800">
                      {showSalary ? formatCurrency(value) : '••••••'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Potongan */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Potongan</h3>
                <span className="text-lg font-bold text-red-600">
                  -{showSalary ? formatCurrency(payrollData.total_potongan) : '••••••••'}
                </span>
              </div>
              <div className="space-y-3">
                {payrollData.potongan.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{item.nama_potongan}</span>
                    <span className="font-medium text-gray-800">
                      {showSalary ? formatCurrency(item.jumlah) : '••••••'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Gaji Diterima</p>
                  <p className="text-white text-2xl font-bold">
                    {showSalary ? formatCurrency(payrollData.gaji_bersih) : '••••••••••'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <>
            {/* History List */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Riwayat Gaji</h3>
                <button 
                  onClick={() => {
                    setHistoryLoaded(false);
                    fetchPayrollHistory();
                  }}
                  className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Refresh
                </button>
              </div>
              
              {loadingHistory ? (
                <TabContentSkeleton />
              ) : payrollHistory && payrollHistory.length > 0 ? (
                <div className="space-y-3">
                  {payrollHistory.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              Gaji {item.periode_bulan} {item.periode_tahun}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Dibayar pada {new Date(item.created_date).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
                            {showSalary ? formatCurrency(item.gaji_bersih) : '••••••••'}
                          </p>
                          <p className="text-xs text-green-600 capitalize">{item.status}</p>
                        </div>
                      </div>
                      
                      {/* Detail breakdown */}
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Gaji Pokok</p>
                          <p className="text-sm font-medium text-gray-700">
                            {showSalary ? formatCurrency(item.gaji_pokok) : '••••••'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Total Gaji</p>
                          <p className="text-sm font-medium text-gray-700">
                            {showSalary ? formatCurrency(item.total_gaji) : '••••••'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Potongan</p>
                          <p className="text-sm font-medium text-gray-700">
                            {showSalary ? formatCurrency(item.total_potongan) : '••••••'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Belum ada riwayat gaji</p>
                  <p className="text-sm text-gray-500 mt-2">Riwayat gaji akan muncul setelah ada pembayaran</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      </div>
    </GlobalPageWrapper>
    </ProtectedRoute>
  );
};

export default Payroll;
