import React, { useState, useEffect, useRef } from 'react';
import PayrollLayout from '../../components/Payroll/PayrollLayout';
import Card from '../../components/common/UI/Card';
import Button from '../../components/common/UI/Button';
import Table from '../../components/common/UI/Table';
import Swal from 'sweetalert2';
import ExcelJS from 'exceljs';
import {
  DocumentTextIcon,
  FunnelIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  CheckCircleIcon,
  XMarkIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface ReportData {
  id: string;
  nip: string;
  nama: string;
  divisi: string;
  jabatan: string;
  periode: string;
  bulan: number;
  tahun: number;
  gajiPokok: number;
  totalPendapatan: number;
  totalPotongan: number;
  gajiDiterima: number;
  status: 'Draft' | 'Disetujui' | 'Dibayar';
  tanggalGenerate: string;
  nomorRekening?: string;
  namaRekening?: string;
}

interface ReportSummary {
  totalKaryawan: number;
  totalPendapatan: number;
  totalPotongan: number;
  totalGajiBersih: number;
  totalGajiPokok: number;
}

interface FilterOptions {
  divisi: string[];
  bulan: number[];
  tahun: number[];
}

const ReportSlipGaji: React.FC = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [filteredData, setFilteredData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    divisi: [],
    bulan: [],
    tahun: []
  });

  // Filter states
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [selectedBulan, setSelectedBulan] = useState('');
  const [selectedTahun, setSelectedTahun] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'unit' | 'bulan' | 'tahun'>('all');

  // Modal states
  const [showRekeningModal, setShowRekeningModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Filter Rekening states
  const [rekeningNamaBank, setRekeningNamaBank] = useState('');
  const [rekeningBulan, setRekeningBulan] = useState('');
  const [rekeningTahun, setRekeningTahun] = useState('');
  const [rekeningNamaBendahara, setRekeningNamaBendahara] = useState('');
  const [rekeningTanggal, setRekeningTanggal] = useState('');
  const [rekeningNomorSurat, setRekeningNomorSurat] = useState('842.3/107/YPIN/VI/2025');

  // Filter Excel states
  const [excelNamaBank, setExcelNamaBank] = useState('');
  const [excelBulan, setExcelBulan] = useState('');
  const [excelTahun, setExcelTahun] = useState('');
  const [excelTanggal, setExcelTanggal] = useState('');
  const [excelNomorSurat, setExcelNomorSurat] = useState('842.3/107/YPIN/VI/2025');
  const [excelNamaBendahara, setExcelNamaBendahara] = useState('');

  // Summary
  const [summary, setSummary] = useState<ReportSummary>({
    totalKaryawan: 0,
    totalPendapatan: 0,
    totalPotongan: 0,
    totalGajiBersih: 0,
    totalGajiPokok: 0
  });

  // Fetch report data
  const fetchReportData = async () => {
    setLoading(true);
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
      console.log('Report API Response:', data);

      if (response.ok && Array.isArray(data)) {
        // Mapping nama bulan Indonesia ke nomor bulan
        const monthMap: { [key: string]: string } = {
          'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
          'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
          'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
        };

        const transformedData = data.map((item: any) => {
          // Parse periode menggunakan monthMap
          let periode = '';
          let bulan = 0;
          let tahun = 0;
          
          if (item.periode_bulan && item.periode_tahun) {
            const monthNum = monthMap[item.periode_bulan];
            if (monthNum) {
              periode = `${item.periode_tahun}-${monthNum}`;
              bulan = parseInt(monthNum);
              tahun = parseInt(item.periode_tahun);
            }
          }

          return {
            id: item.payroll_id?.toString() || item.id?.toString() || '',
            nip: item.guru?.nip || item.nip || '',
            nama: item.guru?.nama_lengkap || item.nama_lengkap || '',
            divisi: item.guru?.unit_sekolah?.nama || item.unit_sekolah_nama || '',
            jabatan: item.guru?.jabatan?.nama || item.nama_jabatan || '',
            periode: periode,
            bulan: bulan,
            tahun: tahun,
            gajiPokok: Number(item.gaji_pokok) || 0,
            totalPendapatan: Number(item.total_gaji) || 0,
            totalPotongan: Number(item.total_potongan) || 0,
            gajiDiterima: Number(item.gaji_bersih) || 0,
            status: item.status as 'Draft' | 'Disetujui' | 'Dibayar',
            tanggalGenerate: item.created_date || item.created_at || new Date().toISOString().split('T')[0],
            nomorRekening: item.guru?.no_rekening || item.no_rekening || '',
            namaRekening: item.guru?.nama_rekening || item.nama_rekening || ''
          };
        });

        setReportData(transformedData);

        // Extract filter options
        const divisiSet = new Set(transformedData.map(item => item.divisi).filter(Boolean));
        const bulanSet = new Set(transformedData.map(item => item.bulan).filter(b => b > 0));
        const tahunSet = new Set(transformedData.map(item => item.tahun).filter(t => t > 0));

        setFilterOptions({
          divisi: Array.from(divisiSet).sort(),
          bulan: Array.from(bulanSet).sort((a, b) => a - b),
          tahun: Array.from(tahunSet).sort((a, b) => b - a)
        });

        applyFilters(transformedData, '', '', '');
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      Swal.fire('Error', 'Gagal mengambil data report', 'error');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = (
    data: ReportData[],
    divisi: string,
    bulan: string,
    tahun: string
  ) => {
    let filtered = data;

    // Filter by divisi
    if (divisi) {
      filtered = filtered.filter(item => item.divisi === divisi);
    }

    // Filter by bulan
    if (bulan) {
      const bulanNum = parseInt(bulan);
      filtered = filtered.filter(item => item.bulan === bulanNum);
    }

    // Filter by tahun
    if (tahun) {
      const tahunNum = parseInt(tahun);
      filtered = filtered.filter(item => item.tahun === tahunNum);
    }

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nip.includes(searchTerm)
      );
    }

    setFilteredData(filtered);
    calculateSummary(filtered);
  };

  const handleFilterChange = () => {
    applyFilters(reportData, selectedDivisi, selectedBulan, selectedTahun);
  };

  const handleViewModeChange = (mode: 'all' | 'unit' | 'bulan' | 'tahun') => {
    setViewMode(mode);
    setSelectedDivisi('');
    setSelectedBulan('');
    setSelectedTahun('');
    applyFilters(reportData, '', '', '');
  };

  // Calculate summary
  const calculateSummary = (data: ReportData[]) => {
    const summary: ReportSummary = {
      totalKaryawan: data.length,
      totalPendapatan: 0,
      totalPotongan: 0,
      totalGajiBersih: 0,
      totalGajiPokok: 0
    };

    data.forEach(item => {
      summary.totalGajiPokok += item.gajiPokok;
      summary.totalPendapatan += item.totalPendapatan;
      summary.totalPotongan += item.totalPotongan;
      summary.totalGajiBersih += item.gajiDiterima;
    });

    setSummary(summary);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedDivisi('');
    setSelectedBulan('');
    setSelectedTahun('');
    setSearchTerm('');
    setViewMode('all');
    applyFilters(reportData, '', '', '');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format bulan
  const formatBulan = (bulan: number) => {
    const bulanNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return bulanNames[bulan - 1] || '-';
  };

  // Open Excel Modal
  const handleOpenExcelModal = () => {
    // Reset filter dan data
    const now = new Date();
    setExcelNamaBank('');
    setExcelBulan((now.getMonth() + 1).toString());
    setExcelTahun(now.getFullYear().toString());
    setExcelTanggal('');
    setExcelNomorSurat('842.3/107/YPIN/VI/2025');
    setExcelNamaBendahara('');
    setShowExcelModal(true);
  };

  // Export to Excel
  const handleExportCSV = async () => {
    if (!excelNamaBank || !excelBulan || !excelTahun) {
      Swal.fire('Peringatan', 'Semua filter harus diisi', 'warning');
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
        text: 'Sedang mengambil data rekening BBJS...',
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false
      });

      const token = localStorage.getItem('auth_token');
      
      // Call backend API untuk get JSON data
      const response = await fetch(
        `${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/payroll/export-rekening-bbjs?bulan=${excelBulan}&tahun=${excelTahun}&nama_bank=${encodeURIComponent(excelNamaBank)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // Cek apakah response adalah JSON atau HTML (error page)
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Response bukan JSON, kemungkinan HTML error page
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse.substring(0, 200));
        throw new Error('Server mengembalikan respon yang tidak valid. Pastikan server berjalan dengan baik.');
      }

      if (!response.ok) {
        const errorMessage = result.message || result.error || 'Gagal mengambil data rekening BBJS';
        throw new Error(errorMessage);
      }
      
      if (result.status !== 'success' || !result.data || result.data.length === 0) {
        throw new Error(`Tidak ada data rekening untuk bank "${excelNamaBank}" pada periode ${excelBulan}/${excelTahun}. Pastikan ada guru yang memiliki rekening di bank tersebut untuk periode tersebut.`);
      }

      // Generate Excel menggunakan struktur HTML yang sama
      const bulanNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const bulanName = bulanNames[parseInt(excelBulan) - 1];
      const tahunValue = excelTahun;
      
      // Format tanggal untuk display
      let formattedTanggal = excelTanggal;
      if (excelTanggal) {
        const dateObj = new Date(excelTanggal);
        formattedTanggal = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      } else {
        formattedTanggal = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      }
      const today = formattedTanggal;
      const nomorSuratValue = excelNomorSurat || '842.3/107/YPIN/VI/2025';
      
      // Calculate total gaji
      const totalGaji = result.data.reduce((sum: number, item: any) => sum + (item.jumlah_gaji || 0), 0);

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

      const letterParagraph = `Sehubungan dengan adanya MOU antara ${excelNamaBank || 'Bank BJB Syariah'} Cabang Bekasi dengan yayasan Pendidikan Islam Nurrahim ANNUR dengan nomor MOU 2331/S-BKS/2015, maka dengan ini kami informasikan nomor rekening pegawai yang mengambil pembiayaan di ${excelNamaBank || 'Bank BJB Syariah'} Cabang Bekasi sebagai rekening pembayaran gaji (payroll) sesuai dengan MOU yang telah kita sepakati bersama. Adapun nama-namanya sebagai berikut:`;
      worksheet.mergeCells(currentRow, 1, currentRow, 6);
      worksheet.getCell(currentRow, 1).value = letterParagraph;
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
      result.data.forEach((item: any, index: number) => {
        const dataRow = worksheet.addRow([
          index + 1,
          item.nama_nasabah || '',
          item.no_rekening || '',
          item.jumlah_gaji || 0
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
        if ((index + 1) % 2 === 0) {
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
      link.download = `Rekening_BBJS_${excelNamaBank.replace(/\s+/g, '_')}_${bulanName}_${tahunValue}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      Swal.close();
      setShowExcelModal(false);
      Swal.fire('Sukses', `Dokumen Excel berhasil dibuat (${result.data.length} guru)`, 'success');
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

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Open Rekening Modal
  const handleOpenRekeningModal = () => {
    // Reset filter dan data
    const now = new Date();
    setRekeningNamaBank('');
    setRekeningBulan((now.getMonth() + 1).toString());
    setRekeningTahun(now.getFullYear().toString());
    setShowRekeningModal(true);
  };

  // Generate HTML untuk Rekening BBJS dengan format surat formal
  const generateRekeningHTML = (data: any[], periode: any, namaBendahara?: string, tanggal?: string, nomorSurat?: string, namaBank?: string) => {
    const bulanNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
    
    const bulanName = bulanNames[periode.bulan - 1];
    const today = tanggal || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const nomorSuratValue = nomorSurat || '842.3/107/YPIN/VI/2025';

    // Calculate total gaji
    const totalGaji = data.reduce((sum, item) => sum + (item.jumlah_gaji || 0), 0);

    // Generate table rows
    const tableRows = data.map(item => `
      <tr>
        <td class="text-center">${item.no}</td>
        <td>${item.nama_nasabah}</td>
        <td>${item.no_rekening}</td>
        <td class="currency">Rp ${item.jumlah_gaji.toLocaleString('id-ID')}</td>
      </tr>
    `).join('');

    // Generate total row
    const totalRow = `
      <tr style="background-color: #e0e0e0; font-weight: bold;">
        <td colspan="3" style="text-align: right; padding-right: 10mm;">TOTAL :</td>
        <td class="currency" style="font-weight: bold; font-size: 10pt;">Rp ${totalGaji.toLocaleString('id-ID')}</td>
      </tr>
    `;

    return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rekening BBJS - ${bulanName} ${periode.tahun}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', monospace;
            font-size: 9pt;
            line-height: 1.3;
            color: #000;
        }
        
        .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 10mm 15mm;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 5mm;
            padding-bottom: 5mm;
            border-bottom: 3px solid #000;
        }
        
        .header img {
            width: 100%;
            max-width: 180mm;
            height: auto;
            margin: 0 auto;
            display: block;
        }
        
        .decorative-top {
            height: 3mm;
            background: linear-gradient(to right, #006600 0%, #FFD700 50%, #006600 100%);
            margin-bottom: 10mm;
        }
        
        .doc-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4mm;
            font-size: 9pt;
        }
        
        .letter-body {
            margin-bottom: 4mm;
        }
        
        .letter-body p {
            margin-bottom: 0mm;
            text-align: justify;
            font-size: 9pt;
            line-height: 1.3;
        }
        
        .recipient {
            margin-bottom: 4mm;
        }
        
        .recipient-line {
            font-size: 9pt;
            margin-bottom: 1mm;
        }
        
        .table-wrapper {
            margin: 4mm 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4mm;
            font-size: 9pt;
        }
        
        th {
            background-color: #333;
            color: white;
            padding: 2mm 3mm;
            text-align: left;
            font-weight: bold;
            border: 1px solid #000;
        }
        
        td {
            padding: 2mm 3mm;
            border: 1px solid #000;
        }
        
        tr:nth-child(even) {
            background-color: #f5f5f5;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .summary {
            margin: 8mm 0;
            padding: 5mm;
            background-color: #f0f0f0;
            border: 1px solid #999;
            text-align: right;
            font-weight: bold;
            font-size: 10pt;
        }
        
        .closing {
            margin-top: 1.5mm;
            font-size: 9pt;
        }
        
        .closing-para {
            margin-bottom: 1.4mm;
            text-align: justify;
        }
        
        .signature-section {
            margin-top: 4mm;
            display: flex;
            justify-content: flex-end;
        }
        
        .signature-box {
            width: 40mm;
            text-align: center;
        }
        
        .signature-date {
            margin-bottom: 4mm;
            font-size: 9pt;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            padding-top: 2mm;
            margin-top: 8mm;
            font-weight: bold;
        }
        
        .currency {
            font-family: 'Courier New', monospace;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <img src="https://nurverse.id/aaaaa.png" alt="Yayasan Pendidikan Islam Nurrahim Annur">
        </div>
        
        <div class="doc-info">
            <div>
                <strong>Nomor</strong> : ${nomorSuratValue}
            </div>
            <div>
                Cikarang, ${today}
            </div>
        </div>
        
        <div class="doc-info">
            <div>
                <strong>Perihal</strong> : Surat Perintah Pembayaran
            </div>
        </div>
        
        <div class="recipient">
            <div class="recipient-line"><strong>Kepada Yth :</strong></div>
            <div class="recipient-line">${namaBank || 'Bank BJB Syariah'}</div>
            <div class="recipient-line">Cabang Bekasi</div>
        </div>
        
        <div class="letter-body">
            <p>Assalamu'alaikum wr...wb</p>
            
            <p>Teriring salam semoga Allah SWT senantiasa melindungi dan memberkahi segala aktifitas kita.</p>
            
            <p>Sholawat serta salam kita sampaikan kepada teladan dan junjungan kita Nabi Muhammad SAW.</p>
            
            <p>Sehubungan dengan adanya MOU antara ${namaBank || 'Bank BJB Syariah'} Cabang Bekasi dengan yayasan Pendidikan Islam Nurrahim ANNUR dengan nomor MOU 2331/S-BKS/2015, maka dengan ini kami informasikan nomor rekening pegawai yang mengambil pembiayaan di ${namaBank || 'Bank BJB Syariah'} Cabang Bekasi sebagai rekening pembayaran gaji (payroll) sesuai dengan MOU yang telah kita sepakati bersama. Adapun nama-namanya sebagai berikut:</p>
        </div>
        
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th style="width: 8%;">No</th>
                        <th style="width: 35%;">Nama Nasabah</th>
                        <th style="width: 25%;">Nomor Rekening</th>
                        <th style="width: 32%; text-align: right;">Jumlah Gaji Bersih</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    ${totalRow}
                </tbody>
            </table>
        </div>
        
        <div class="closing">
            <p class="closing-para">Demikian kami sampaikan, atas perhatiannya diucapkan terima kasih.</p>
            <p class="closing-para">Wassalamu'alaikum wr...wb</p>
        </div>
        
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-date">Cikarang, ${today}</div>
                <div style="font-weight: bold; margin-bottom: 0.5mm;">Hormat kami,</div>
                <div style="height: 8mm;"></div>
                <div class="signature-line">${namaBendahara || 'Bendahara YPI Nurrahim Annur'}</div>
                <div>Bendahara</div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  };

  // Export Rekening BBJS PDF
  const handleExportRekeningPDF = async () => {
    if (!rekeningNamaBank || !rekeningBulan || !rekeningTahun) {
      Swal.fire('Peringatan', 'Semua filter harus diisi', 'warning');
      return;
    }

    // Validasi khusus untuk bank Tunai
    if (rekeningNamaBank === 'Tunai') {
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
        text: 'Sedang mengambil data rekening BBJS...',
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false
      });

      const token = localStorage.getItem('auth_token');
      
      // Call backend API untuk get JSON data
      const response = await fetch(
        `${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/payroll/export-rekening-bbjs?bulan=${rekeningBulan}&tahun=${rekeningTahun}&nama_bank=${encodeURIComponent(rekeningNamaBank)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // Cek apakah response adalah JSON atau HTML (error page)
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Response bukan JSON, kemungkinan HTML error page
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse.substring(0, 200));
        throw new Error('Server mengembalikan respon yang tidak valid. Pastikan server berjalan dengan baik.');
      }

      if (!response.ok) {
        const errorMessage = result.message || result.error || 'Gagal mengambil data rekening BBJS';
        throw new Error(errorMessage);
      }
      
      if (result.status !== 'success' || !result.data || result.data.length === 0) {
        throw new Error(`Tidak ada data rekening untuk bank "${rekeningNamaBank}" pada periode ${rekeningBulan}/${rekeningTahun}. Pastikan ada guru yang memiliki rekening di bank tersebut untuk periode tersebut.`);
      }

      // Generate HTML dari data menggunakan format surat formal
      // Format tanggal untuk display
      let formattedTanggal = rekeningTanggal;
      if (rekeningTanggal) {
        const dateObj = new Date(rekeningTanggal);
        formattedTanggal = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      }
      const htmlContent = generateRekeningHTML(result.data, result.periode, rekeningNamaBendahara, formattedTanggal, rekeningNomorSurat, rekeningNamaBank);

      // Create a new window/tab with the HTML content for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Trigger print dialog after content is loaded
        setTimeout(() => {
          printWindow.print();
          // Optional: close window after print
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }, 500);

        Swal.close();
        setShowRekeningModal(false);
        Swal.fire('Sukses', `Dokumen berhasil dibuat (${result.data.length} guru)`, 'success');
      } else {
        throw new Error('Tidak dapat membuka window print');
      }
    } catch (error) {
      console.error('Error exporting rekening BBJS:', error);
      
      // Pesan error yang lebih informatif
      let errorMessage = 'Gagal mengexport rekening BBJS';
      
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
        title: 'Error Export Rekening',
        html: `<div class="text-left">
          <p class="mb-2"><strong>Terjadi kesalahan:</strong></p>
          <p class="text-sm">${errorMessage}</p>
          ${rekeningNamaBank === 'Tunai' ? '<p class="mt-3 text-sm text-orange-600"><strong>Catatan:</strong> Bank "Tunai" tidak memiliki data rekening. Silakan pilih bank lain.</p>' : ''}
        </div>`,
        confirmButtonText: 'OK',
        width: '500px'
      });
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const columns = [
    {
      key: 'nama',
      header: 'Nama Karyawan',
      className: 'min-w-40',
      render: (_: any, item: ReportData) => (
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">{item.nama}</div>
          <div className="text-xs text-slate-500">{item.nip}</div>
        </div>
      )
    },
    {
      key: 'divisi',
      header: 'Unit/Divisi',
      className: 'min-w-32',
      render: (_: any, item: ReportData) => (
        <div className="text-sm font-medium text-slate-700">{item.divisi}</div>
      )
    },
    {
      key: 'periode',
      header: 'Periode',
      className: 'min-w-40',
      render: (_: any, item: ReportData) => (
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">{formatBulan(item.bulan)} {item.tahun}</div>
          <div className="text-xs text-slate-500 font-mono">{item.periode}</div>
        </div>
      )
    },
    {
      key: 'gajiPokok',
      header: 'Gaji Pokok',
      className: 'min-w-32 text-right',
      render: (_: any, item: ReportData) => (
        <div className="text-sm font-semibold text-slate-900 text-right">
          {formatCurrency(item.gajiPokok)}
        </div>
      )
    },
    {
      key: 'totalPendapatan',
      header: 'Total Pendapatan',
      className: 'min-w-32 text-right',
      render: (_: any, item: ReportData) => (
        <div className="text-sm font-semibold text-green-600 text-right">
          {formatCurrency(item.totalPendapatan)}
        </div>
      )
    },
    {
      key: 'totalPotongan',
      header: 'Total Potongan',
      className: 'min-w-32 text-right',
      render: (_: any, item: ReportData) => (
        <div className="text-sm font-semibold text-red-600 text-right">
          {formatCurrency(item.totalPotongan)}
        </div>
      )
    },
    {
      key: 'gajiDiterima',
      header: 'Gaji Bersih',
      className: 'min-w-32 text-right',
      render: (_: any, item: ReportData) => (
        <div className="text-sm font-bold text-blue-600 text-right">
          {formatCurrency(item.gajiDiterima)}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      className: 'min-w-24',
      render: (_: any, item: ReportData) => (
        <div className="text-xs font-semibold">
          {item.status === 'Dibayar' && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-1 w-fit">
              <CheckCircleIcon className="w-4 h-4" />
              {item.status}
            </span>
          )}
          {item.status === 'Disetujui' && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {item.status}
            </span>
          )}
          {item.status === 'Draft' && (
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
              {item.status}
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <PayrollLayout>
      {/* Header */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3 rounded-xl">
            <ChartBarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Report Slip Gaji</h1>
            <p className="text-slate-600 text-sm">Analisis komprehensif data gaji karyawan per unit, bulan, dan tahun</p>
          </div>
        </div>
      </div>

      {/* View Mode Buttons */}
      <div className="flex flex-wrap gap-2 mb-6 print:hidden">
        <button
          onClick={() => handleViewModeChange('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'all'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          📊 Semua Data
        </button>
        <button
          onClick={() => handleViewModeChange('unit')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'unit'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          🏢 Per Unit
        </button>
        <button
          onClick={() => handleViewModeChange('bulan')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'bulan'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          📅 Per Bulan
        </button>
        <button
          onClick={() => handleViewModeChange('tahun')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'tahun'
              ? 'bg-orange-600 text-white shadow-lg'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          📆 Per Tahun
        </button>
      </div>

      {/* Filter Section */}
      <Card className="p-6 mb-6 border-0 shadow-md print:hidden">
        <div className="space-y-4">
          {/* Filter Buttons Row */}
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900">Filter & Pencarian</h3>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Unit Filter */}
            {(viewMode === 'all' || viewMode === 'unit') && (
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  🏢 Unit/Divisi
                </label>
                <select
                  value={selectedDivisi}
                  onChange={(e) => {
                    setSelectedDivisi(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Unit</option>
                  {filterOptions.divisi.map(divisi => (
                    <option key={divisi} value={divisi}>{divisi}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Bulan Filter */}
            {(viewMode === 'all' || viewMode === 'bulan') && (
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  📅 Bulan
                </label>
                <select
                  value={selectedBulan}
                  onChange={(e) => {
                    setSelectedBulan(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Bulan</option>
                  {filterOptions.bulan.map(bulan => (
                    <option key={bulan} value={bulan}>{formatBulan(bulan)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tahun Filter */}
            {(viewMode === 'all' || viewMode === 'tahun') && (
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  📆 Tahun
                </label>
                <select
                  value={selectedTahun}
                  onChange={(e) => {
                    setSelectedTahun(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Tahun</option>
                  {filterOptions.tahun.map(tahun => (
                    <option key={tahun} value={tahun}>{tahun}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Search */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                🔍 Cari (Nama/NIP)
              </label>
              <input
                type="text"
                placeholder="Ketik nama atau NIP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200">
            <Button
              onClick={handleFilterChange}
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Terapkan Filter
            </Button>
            <Button
              onClick={handleResetFilters}
              className="bg-slate-300 text-slate-700 hover:bg-slate-400 flex items-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" />
              Reset Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold">Total Karyawan</p>
              <p className="text-3xl font-black text-blue-600 mt-2">{summary.totalKaryawan}</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-xl">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <div>
            <p className="text-slate-600 text-sm font-semibold">Total Gaji Pokok</p>
            <p className="text-2xl font-black text-green-600 mt-2">{formatCurrency(summary.totalGajiPokok)}</p>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div>
            <p className="text-slate-600 text-sm font-semibold">Total Pendapatan</p>
            <p className="text-2xl font-black text-emerald-600 mt-2">{formatCurrency(summary.totalPendapatan)}</p>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <div>
            <p className="text-slate-600 text-sm font-semibold">Total Potongan</p>
            <p className="text-2xl font-black text-red-600 mt-2">{formatCurrency(summary.totalPotongan)}</p>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <div>
            <p className="text-slate-600 text-sm font-semibold">Total Gaji Bersih</p>
            <p className="text-2xl font-black text-purple-600 mt-2">{formatCurrency(summary.totalGajiBersih)}</p>
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Data Detail</h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DocumentTextIcon className="w-4 h-4" />
              Total: <span className="font-bold text-slate-900">{filteredData.length}</span> data
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin">
              <ArrowPathIcon className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-slate-600 mt-3">Memuat data...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div ref={tableRef}>
            <Table columns={columns} data={filteredData} />
          </div>
        ) : (
          <div className="p-12 text-center">
            <MagnifyingGlassIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Tidak ada data yang sesuai dengan filter</p>
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      {filteredData.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-6 print:hidden">
          <Button
            onClick={handleOpenExcelModal}
            className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 px-6 py-3"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export Rekening BBJS (Excel)
          </Button>
          <Button
            onClick={handleOpenRekeningModal}
            className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 px-6 py-3"
          >
            <BanknotesIcon className="w-4 h-4" />
            Export Rekening BBJS (PDF)
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 px-6 py-3"
          >
            <PrinterIcon className="w-4 h-4" />
            Print
          </Button>
        </div>
      )}

      {/* Excel Modal */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl border-0 shadow-lg bg-white">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Export Excel Rekening BBJS</h2>
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

                {/* Periode Bulan */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Periode Bulan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={excelBulan}
                    onChange={(e) => setExcelBulan(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black transition-all duration-200"
                  >
                    <option value="">Pilih Bulan</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((bulan) => (
                      <option key={bulan} value={bulan}>
                        {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][bulan - 1]}
                      </option>
                    ))}
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

                {/* Tanggal */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={excelTanggal}
                    onChange={(e) => setExcelTanggal(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black transition-all duration-200"
                  />
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
                disabled={!excelNamaBank || !excelBulan || !excelTahun || exportLoading}
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

      {/* Rekening Modal */}
      {showRekeningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl border-0 shadow-lg bg-white">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Export Rekening BBJS</h2>
                <p className="text-sm text-slate-600 mt-1">Pilih filter untuk export rekening ke PDF</p>
              </div>
              <button
                onClick={() => setShowRekeningModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-white">
              {/* Filter Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tanggal */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={rekeningTanggal}
                    onChange={(e) => setRekeningTanggal(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black transition-all duration-200"
                  />
                </div>

                {/* Nomor Surat */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Nomor Surat
                  </label>
                  <input
                    type="text"
                    value={rekeningNomorSurat}
                    onChange={(e) => setRekeningNomorSurat(e.target.value)}
                    placeholder="Input Nomor Surat"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black transition-all duration-200"
                  />
                </div>

                {/* Nama Bank */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Nama Bank <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rekeningNamaBank}
                    onChange={(e) => setRekeningNamaBank(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black transition-all duration-200"
                  >
                    <option value="">Pilih Bank</option>
                    <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                    <option value="BJB Syariah">BJB Syariah</option>
                    <option value="Tunai">Tunai</option>
                  </select>
                </div>

                {/* Periode Bulan */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Periode Bulan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rekeningBulan}
                    onChange={(e) => setRekeningBulan(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black transition-all duration-200"
                  >
                    <option value="">Pilih Bulan</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((bulan) => (
                      <option key={bulan} value={bulan}>
                        {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][bulan - 1]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Periode Tahun */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Periode Tahun <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rekeningTahun}
                    onChange={(e) => setRekeningTahun(e.target.value)}
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

                {/* Nama Bendahara */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Bendahara
                  </label>
                  <input
                    type="text"
                    value={rekeningNamaBendahara}
                    onChange={(e) => setRekeningNamaBendahara(e.target.value)}
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
                {/* <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    ⚠️ <strong>Catatan:</strong> Pilihan "Tunai" tidak dapat digunakan untuk export rekening karena tidak memiliki data rekening bank. Silakan pilih "Bank Syariah Indonesia (BSI)" atau "BJB Syariah".
                  </p>
                </div> */}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3">
              <Button
                onClick={() => setShowRekeningModal(false)}
                disabled={exportLoading}
                className="bg-slate-300 text-slate-700 hover:bg-slate-400 disabled:opacity-50"
              >
                Batal
              </Button>
              <Button
                onClick={handleExportRekeningPDF}
                disabled={!rekeningNamaBank || !rekeningBulan || !rekeningTahun || exportLoading}
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {exportLoading ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <BanknotesIcon className="w-4 h-4" />
                    <span>Export PDF</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\:hidden {
            display: none !important;
          }
          
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </PayrollLayout>
  );
};

export default ReportSlipGaji;
