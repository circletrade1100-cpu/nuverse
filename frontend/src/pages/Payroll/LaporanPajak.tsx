import React, { useState } from 'react';
import PayrollLayout from '../../components/Payroll/PayrollLayout';
import Card from '../../components/common/UI/Card';
import Button from '../../components/common/UI/Button';
import Table from '../../components/common/UI/Table';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  FunnelIcon,
  ChartBarIcon,
  UserIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface LaporanPajakBPJS {
  nip: string;
  nama: string;
  divisi: string;
  jabatan: string;
  gajiKotor: number;
  gajiTidakKenaPajak: number;
  pkp: number; // Penghasilan Kena Pajak
  pph21: number;
  bpjsKesehatan: number;
  bpjsTenagaKerja: number;
  totalBPJS: number;
  totalPotongan: number;
  gajiNetto: number;
  statusPajak: 'TK/0' | 'TK/1' | 'K/0' | 'K/1' | 'K/2' | 'K/3';
  npwp: string;
}

interface RingkasanPajakBPJS {
  periode: string;
  divisi: string;
  totalKaryawan: number;
  totalGajiKotor: number;
  totalPKP: number;
  totalPPh21: number;
  totalBPJSKesehatan: number;
  totalBPJSTenagaKerja: number;
  totalBPJS: number;
  totalPotonganPajak: number;
  totalGajiNetto: number;
  rataRataPajak: number;
}

interface AuditTrail {
  id: string;
  tanggal: string;
  user: string;
  aksi: string;
  detail: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Error';
}

const LaporanPajak: React.FC = () => {
  const [laporanDetail] = useState<LaporanPajakBPJS[]>([
    {
      nip: 'EMP001',
      nama: 'Ahmad Fauzi',
      divisi: 'Akademik',
      jabatan: 'Guru Matematika',
      gajiKotor: 7240000,
      gajiTidakKenaPajak: 54000000,
      pkp: 86880000,
      pph21: 250000,
      bpjsKesehatan: 180000,
      bpjsTenagaKerja: 120000,
      totalBPJS: 300000,
      totalPotongan: 550000,
      gajiNetto: 6690000,
      statusPajak: 'K/2',
      npwp: '12.345.678.9-123.000'
    },
    {
      nip: 'EMP002',
      nama: 'Siti Nurhaliza',
      divisi: 'Akademik',
      jabatan: 'Guru Bahasa Indonesia',
      gajiKotor: 6720000,
      gajiTidakKenaPajak: 54000000,
      pkp: 80640000,
      pph21: 200000,
      bpjsKesehatan: 168000,
      bpjsTenagaKerja: 112000,
      totalBPJS: 280000,
      totalPotongan: 530000,
      gajiNetto: 6190000,
      statusPajak: 'TK/0',
      npwp: '98.765.432.1-456.000'
    },
    {
      nip: 'EMP003',
      nama: 'Budi Santoso',
      divisi: 'Administrasi',
      jabatan: 'Staff TU',
      gajiKotor: 5120000,
      gajiTidakKenaPajak: 54000000,
      pkp: 61440000,
      pph21: 150000,
      bpjsKesehatan: 128000,
      bpjsTenagaKerja: 72000,
      totalBPJS: 200000,
      totalPotongan: 400000,
      gajiNetto: 4720000,
      statusPajak: 'K/1',
      npwp: '11.222.333.4-789.000'
    },
    {
      nip: 'EMP004',
      nama: 'Lisa Permata',
      divisi: 'Keuangan',
      jabatan: 'Staff Accounting',
      gajiKotor: 5680000,
      gajiTidakKenaPajak: 54000000,
      pkp: 68160000,
      pph21: 180000,
      bpjsKesehatan: 142000,
      bpjsTenagaKerja: 108000,
      totalBPJS: 250000,
      totalPotongan: 430000,
      gajiNetto: 5250000,
      statusPajak: 'TK/0',
      npwp: '55.666.777.8-012.000'
    }
  ]);

  const [ringkasanData] = useState<RingkasanPajakBPJS[]>([
    {
      periode: '2024-02',
      divisi: 'Akademik',
      totalKaryawan: 15,
      totalGajiKotor: 103200000,
      totalPKP: 1238400000,
      totalPPh21: 3750000,
      totalBPJSKesehatan: 2580000,
      totalBPJSTenagaKerja: 1720000,
      totalBPJS: 4300000,
      totalPotonganPajak: 8050000,
      totalGajiNetto: 95150000,
      rataRataPajak: 250000
    },
    {
      periode: '2024-02',
      divisi: 'Administrasi',
      totalKaryawan: 6,
      totalGajiKotor: 33300000,
      totalPKP: 399600000,
      totalPPh21: 1200000,
      totalBPJSKesehatan: 832000,
      totalBPJSTenagaKerja: 568000,
      totalBPJS: 1400000,
      totalPotonganPajak: 2600000,
      totalGajiNetto: 30700000,
      rataRataPajak: 200000
    },
    {
      periode: '2024-02',
      divisi: 'Keuangan',
      totalKaryawan: 4,
      totalGajiKotor: 22000000,
      totalPKP: 264000000,
      totalPPh21: 800000,
      totalBPJSKesehatan: 550000,
      totalBPJSTenagaKerja: 350000,
      totalBPJS: 900000,
      totalPotonganPajak: 1700000,
      totalGajiNetto: 20300000,
      rataRataPajak: 200000
    }
  ]);

  const [auditTrail] = useState<AuditTrail[]>([
    {
      id: '1',
      tanggal: '2024-02-28 14:30:00',
      user: 'HRD Manager',
      aksi: 'Generate Laporan Pajak',
      detail: 'Laporan PPh21 periode Februari 2024 untuk semua divisi',
      ipAddress: '192.168.1.100',
      status: 'Success'
    },
    {
      id: '2',
      tanggal: '2024-02-28 14:25:00',
      user: 'Finance Admin',
      aksi: 'Update Data BPJS',
      detail: 'Perubahan tarif BPJS Kesehatan menjadi 4%',
      ipAddress: '192.168.1.105',
      status: 'Success'
    },
    {
      id: '3',
      tanggal: '2024-02-28 14:20:00',
      user: 'Payroll Staff',
      aksi: 'Koreksi NPWP',
      detail: 'Perbaikan NPWP karyawan EMP002 - Siti Nurhaliza',
      ipAddress: '192.168.1.102',
      status: 'Warning'
    },
    {
      id: '4',
      tanggal: '2024-02-28 14:15:00',
      user: 'System',
      aksi: 'Auto Calculate Tax',
      detail: 'Perhitungan otomatis PPh21 untuk 25 karyawan',
      ipAddress: 'System',
      status: 'Success'
    }
  ]);

  const [selectedPeriode, setSelectedPeriode] = useState('2024-02');
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [activeTab, setActiveTab] = useState<'detail' | 'summary' | 'audit'>('detail');

  const filteredLaporanDetail = laporanDetail.filter(laporan => {
    const matchesDivisi = !selectedDivisi || laporan.divisi === selectedDivisi;
    return matchesDivisi;
  });

  const filteredRingkasan = ringkasanData.filter(ringkasan => {
    const matchesPeriode = ringkasan.periode === selectedPeriode;
    const matchesDivisi = !selectedDivisi || ringkasan.divisi === selectedDivisi;
    return matchesPeriode && matchesDivisi;
  });

  const totalStats = filteredLaporanDetail.reduce((acc, curr) => ({
    totalKaryawan: acc.totalKaryawan + 1,
    totalGajiKotor: acc.totalGajiKotor + curr.gajiKotor,
    totalPKP: acc.totalPKP + curr.pkp,
    totalPPh21: acc.totalPPh21 + curr.pph21,
    totalBPJS: acc.totalBPJS + curr.totalBPJS,
    totalPotongan: acc.totalPotongan + curr.totalPotongan
  }), {
    totalKaryawan: 0,
    totalGajiKotor: 0,
    totalPKP: 0,
    totalPPh21: 0,
    totalBPJS: 0,
    totalPotongan: 0
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPeriode = (periode: string) => {
    const [year, month] = periode.split('-');
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const getStatusPajakBadge = (status: string) => {
    const descriptions: Record<string, string> = {
      'TK/0': 'Tidak Kawin, 0 Tanggungan',
      'TK/1': 'Tidak Kawin, 1 Tanggungan',
      'K/0': 'Kawin, 0 Tanggungan',
      'K/1': 'Kawin, 1 Tanggungan',
      'K/2': 'Kawin, 2 Tanggungan',
      'K/3': 'Kawin, 3 Tanggungan'
    };

    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200" title={descriptions[status]}>
        {status}
      </span>
    );
  };

  const getAuditStatusBadge = (status: AuditTrail['status']) => {
    const colors = {
      'Success': 'bg-green-100 text-green-800 border-green-200',
      'Warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Error': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const detailColumns = [
    {
      key: 'karyawan',
      header: 'Karyawan',
      render: (laporan: LaporanPajakBPJS) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900">{laporan.nama}</div>
            <div className="text-sm text-slate-500">{laporan.nip}</div>
            <div className="text-xs text-slate-400">{laporan.jabatan}</div>
          </div>
        </div>
      )
    },
    {
      key: 'npwp',
      header: 'NPWP & Status',
      render: (laporan: LaporanPajakBPJS) => (
        <div className="text-sm">
          <div className="font-mono text-slate-700">{laporan.npwp}</div>
          <div className="mt-1">
            {getStatusPajakBadge(laporan.statusPajak)}
          </div>
        </div>
      )
    },
    {
      key: 'gajiKotor',
      header: 'Gaji Kotor',
      render: (laporan: LaporanPajakBPJS) => (
        <div className="text-right font-medium text-slate-900">
          {formatCurrency(laporan.gajiKotor)}
        </div>
      )
    },
    {
      key: 'pkp',
      header: 'PKP (Tahunan)',
      render: (laporan: LaporanPajakBPJS) => (
        <div className="text-right font-medium text-purple-600">
          {formatCurrency(laporan.pkp)}
        </div>
      )
    },
    {
      key: 'pph21',
      header: 'PPh 21',
      render: (laporan: LaporanPajakBPJS) => (
        <div className="text-right font-semibold text-red-600">
          {formatCurrency(laporan.pph21)}
        </div>
      )
    },
    {
      key: 'bpjs',
      header: 'BPJS',
      render: (laporan: LaporanPajakBPJS) => (
        <div className="text-right text-sm">
          <div className="font-semibold text-blue-600">{formatCurrency(laporan.totalBPJS)}</div>
          <div className="text-xs text-slate-500">
            Kes: {formatCurrency(laporan.bpjsKesehatan)}
          </div>
          <div className="text-xs text-slate-500">
            TK: {formatCurrency(laporan.bpjsTenagaKerja)}
          </div>
        </div>
      )
    },
    {
      key: 'totalPotongan',
      header: 'Total Potongan',
      render: (laporan: LaporanPajakBPJS) => (
        <div className="text-right font-bold text-red-600">
          {formatCurrency(laporan.totalPotongan)}
        </div>
      )
    },
    {
      key: 'gajiNetto',
      header: 'Gaji Netto',
      render: (laporan: LaporanPajakBPJS) => (
        <div className="text-right font-bold text-green-600">
          {formatCurrency(laporan.gajiNetto)}
        </div>
      )
    }
  ];

  const summaryColumns = [
    {
      key: 'divisi',
      header: 'Divisi',
      render: (ringkasan: RingkasanPajakBPJS) => (
        <div>
          <div className="font-medium text-slate-900">{ringkasan.divisi}</div>
          <div className="text-sm text-slate-500">{ringkasan.totalKaryawan} karyawan</div>
        </div>
      )
    },
    {
      key: 'gajiKotor',
      header: 'Total Gaji Kotor',
      render: (ringkasan: RingkasanPajakBPJS) => (
        <div className="text-right font-medium text-slate-900">
          {formatCurrency(ringkasan.totalGajiKotor)}
        </div>
      )
    },
    {
      key: 'pkp',
      header: 'Total PKP',
      render: (ringkasan: RingkasanPajakBPJS) => (
        <div className="text-right font-medium text-purple-600">
          {formatCurrency(ringkasan.totalPKP)}
        </div>
      )
    },
    {
      key: 'pph21',
      header: 'Total PPh 21',
      render: (ringkasan: RingkasanPajakBPJS) => (
        <div className="text-right font-semibold text-red-600">
          {formatCurrency(ringkasan.totalPPh21)}
        </div>
      )
    },
    {
      key: 'bpjs',
      header: 'Total BPJS',
      render: (ringkasan: RingkasanPajakBPJS) => (
        <div className="text-right text-sm">
          <div className="font-semibold text-blue-600">{formatCurrency(ringkasan.totalBPJS)}</div>
          <div className="text-xs text-slate-500">
            Kes: {formatCurrency(ringkasan.totalBPJSKesehatan)}
          </div>
          <div className="text-xs text-slate-500">
            TK: {formatCurrency(ringkasan.totalBPJSTenagaKerja)}
          </div>
        </div>
      )
    },
    {
      key: 'gajiNetto',
      header: 'Total Gaji Netto',
      render: (ringkasan: RingkasanPajakBPJS) => (
        <div className="text-right font-bold text-green-600">
          {formatCurrency(ringkasan.totalGajiNetto)}
        </div>
      )
    }
  ];

  const auditColumns = [
    {
      key: 'tanggal',
      header: 'Tanggal & Waktu',
      render: (audit: AuditTrail) => (
        <div className="text-sm">
          <div className="font-medium text-slate-900">
            {new Date(audit.tanggal).toLocaleDateString('id-ID')}
          </div>
          <div className="text-xs text-slate-500">
            {new Date(audit.tanggal).toLocaleTimeString('id-ID')}
          </div>
        </div>
      )
    },
    {
      key: 'user',
      header: 'User',
      render: (audit: AuditTrail) => (
        <div className="font-medium text-slate-900">{audit.user}</div>
      )
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (audit: AuditTrail) => (
        <div className="font-medium text-slate-900">{audit.aksi}</div>
      )
    },
    {
      key: 'detail',
      header: 'Detail',
      render: (audit: AuditTrail) => (
        <div className="text-sm text-slate-600 max-w-xs">
          {audit.detail}
        </div>
      )
    },
    {
      key: 'ip',
      header: 'IP Address',
      render: (audit: AuditTrail) => (
        <div className="text-sm font-mono text-slate-600">{audit.ipAddress}</div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (audit: AuditTrail) => getAuditStatusBadge(audit.status)
    }
  ];

  return (
    <PayrollLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <DocumentTextIcon className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Laporan Pajak & BPJS</h3>
                <p className="text-sm text-slate-600">Analisis PPh21 dan kontribusi BPJS karyawan</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Dashboard Pajak
              </Button>
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print SPT
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total PPh 21</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalStats.totalPPh21)}</p>
                <p className="text-xs text-slate-500 mt-1">{totalStats.totalKaryawan} karyawan</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total BPJS</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(totalStats.totalBPJS)}</p>
                <p className="text-xs text-slate-500 mt-1">Kesehatan + Tenaga Kerja</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total PKP</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(totalStats.totalPKP)}</p>
                <p className="text-xs text-slate-500 mt-1">Penghasilan Kena Pajak</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">%</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Potongan</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalStats.totalPotongan)}</p>
                <p className="text-xs text-slate-500 mt-1">Pajak + BPJS</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <BanknotesIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('detail')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'detail' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Detail Karyawan
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'summary' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ringkasan Divisi
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'audit' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Audit Trail
            </button>
          </div>
        </Card>

        {/* Filters */}
        {activeTab !== 'audit' && (
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <FunnelIcon className="w-5 h-5 text-slate-400" />
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="2024-02">Februari 2024</option>
                <option value="2024-01">Januari 2024</option>
                <option value="2023-12">Desember 2023</option>
              </select>
              
              <select
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Semua Divisi</option>
                <option value="Akademik">Akademik</option>
                <option value="Administrasi">Administrasi</option>
                <option value="Keuangan">Keuangan</option>
              </select>
            </div>
          </Card>
        )}

        {/* Main Table */}
        <Card>
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {activeTab === 'detail' ? 'Laporan Detail Pajak & BPJS' : 
                   activeTab === 'summary' ? 'Ringkasan Per Divisi' : 
                   'Audit Trail Sistem'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {activeTab === 'audit' ? 'Riwayat aktivitas sistem pajak dan BPJS' :
                   `Periode: ${formatPeriode(selectedPeriode)}${selectedDivisi ? ` • Divisi: ${selectedDivisi}` : ''}`}
                </p>
              </div>
              
              {activeTab === 'audit' && (
                <div className="flex items-center gap-2">
                  <ExclamationCircleIcon className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-600">Monitoring & Compliance</span>
                </div>
              )}
            </div>
          </div>
          
          <Table
            data={
              activeTab === 'detail' ? filteredLaporanDetail :
              activeTab === 'summary' ? filteredRingkasan :
              auditTrail
            }
            columns={
              activeTab === 'detail' ? detailColumns :
              activeTab === 'summary' ? summaryColumns :
              auditColumns
            }

          />
        </Card>

        {/* Compliance Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Info BPJS</h4>
                <p className="text-sm text-slate-600">Tarif kontribusi terbaru</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                <span>BPJS Kesehatan (Karyawan)</span>
                <span className="font-medium">1%</span>
              </div>
              <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                <span>BPJS Kesehatan (Perusahaan)</span>
                <span className="font-medium">4%</span>
              </div>
              <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                <span>BPJS Tenaga Kerja</span>
                <span className="font-medium">2%</span>
              </div>
              <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                <span>JHT (Jaminan Hari Tua)</span>
                <span className="font-medium">3.7%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Info PPh 21</h4>
                <p className="text-sm text-slate-600">Tarif pajak progresif</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                <span>PKP &le; 60 juta</span>
                <span className="font-medium">5%</span>
              </div>
              <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                <span>PKP 60-250 juta</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                <span>PKP 250-500 juta</span>
                <span className="font-medium">25%</span>
              </div>
              <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                <span>PKP &gt; 500 juta</span>
                <span className="font-medium">30%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PayrollLayout>
  );
};

export default LaporanPajak;
