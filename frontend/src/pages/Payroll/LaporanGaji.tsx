import React, { useState } from 'react';
import PayrollLayout from '../../components/Payroll/PayrollLayout';
import Card from '../../components/common/UI/Card';
import Button from '../../components/common/UI/Button';
import Table from '../../components/common/UI/Table';
import {
  ChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  FunnelIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

interface LaporanGajiBulanan {
  periode: string;
  divisi: string;
  totalKaryawan: number;
  totalGajiPokok: number;
  totalTunjangan: number;
  totalLembur: number;
  totalPendapatan: number;
  totalBPJS: number;
  totalPajak: number;
  totalPotonganLain: number;
  totalPotongan: number;
  totalGajiDibayar: number;
  rataRataGaji: number;
}

interface LaporanGajiKaryawan {
  nip: string;
  nama: string;
  jabatan: string;
  divisi: string;
  gajiPokok: number;
  tunjanganJabatan: number;
  tunjanganKeluarga: number;
  tunjanganTransport: number;
  tunjanganMakan: number;
  totalTunjangan: number;
  jamLembur: number;
  gajiLembur: number;
  totalPendapatan: number;
  bpjs: number;
  pajak: number;
  potonganLain: number;
  totalPotongan: number;
  gajiDiterima: number;
}

const LaporanGaji: React.FC = () => {
  const [laporanBulanan] = useState<LaporanGajiBulanan[]>([
    {
      periode: '2024-02',
      divisi: 'Akademik',
      totalKaryawan: 15,
      totalGajiPokok: 70000000,
      totalTunjangan: 28000000,
      totalLembur: 5200000,
      totalPendapatan: 103200000,
      totalBPJS: 14000000,
      totalPajak: 12000000,
      totalPotonganLain: 500000,
      totalPotongan: 26500000,
      totalGajiDibayar: 76700000,
      rataRataGaji: 5113333
    },
    {
      periode: '2024-02',
      divisi: 'Administrasi',
      totalKaryawan: 6,
      totalGajiPokok: 21000000,
      totalTunjangan: 10500000,
      totalLembur: 1800000,
      totalPendapatan: 33300000,
      totalBPJS: 4200000,
      totalPajak: 3800000,
      totalPotonganLain: 200000,
      totalPotongan: 8200000,
      totalGajiDibayar: 25100000,
      rataRataGaji: 4183333
    },
    {
      periode: '2024-02',
      divisi: 'Keuangan',
      totalKaryawan: 4,
      totalGajiPokok: 14000000,
      totalTunjangan: 6500000,
      totalLembur: 1500000,
      totalPendapatan: 22000000,
      totalBPJS: 2800000,
      totalPajak: 2500000,
      totalPotonganLain: 100000,
      totalPotongan: 5400000,
      totalGajiDibayar: 16600000,
      rataRataGaji: 4150000
    }
  ]);

  const [laporanKaryawan] = useState<LaporanGajiKaryawan[]>([
    {
      nip: 'EMP001',
      nama: 'Ahmad Fauzi',
      jabatan: 'Guru Matematika',
      divisi: 'Akademik',
      gajiPokok: 5000000,
      tunjanganJabatan: 800000,
      tunjanganKeluarga: 500000,
      tunjanganTransport: 300000,
      tunjanganMakan: 400000,
      totalTunjangan: 2000000,
      jamLembur: 8,
      gajiLembur: 240000,
      totalPendapatan: 7240000,
      bpjs: 300000,
      pajak: 250000,
      potonganLain: 0,
      totalPotongan: 550000,
      gajiDiterima: 6690000
    },
    {
      nip: 'EMP002',
      nama: 'Siti Nurhaliza',
      jabatan: 'Guru Bahasa Indonesia',
      divisi: 'Akademik',
      gajiPokok: 4800000,
      tunjanganJabatan: 700000,
      tunjanganKeluarga: 400000,
      tunjanganTransport: 300000,
      tunjanganMakan: 400000,
      totalTunjangan: 1800000,
      jamLembur: 4,
      gajiLembur: 120000,
      totalPendapatan: 6720000,
      bpjs: 280000,
      pajak: 200000,
      potonganLain: 50000,
      totalPotongan: 530000,
      gajiDiterima: 6190000
    },
    {
      nip: 'EMP003',
      nama: 'Budi Santoso',
      jabatan: 'Staff TU',
      divisi: 'Administrasi',
      gajiPokok: 3500000,
      tunjanganJabatan: 400000,
      tunjanganKeluarga: 350000,
      tunjanganTransport: 250000,
      tunjanganMakan: 350000,
      totalTunjangan: 1350000,
      jamLembur: 12,
      gajiLembur: 270000,
      totalPendapatan: 5120000,
      bpjs: 200000,
      pajak: 150000,
      potonganLain: 50000,
      totalPotongan: 400000,
      gajiDiterima: 4720000
    }
  ]);

  const [selectedPeriode, setSelectedPeriode] = useState('2024-02');
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary');

  const filteredLaporanBulanan = laporanBulanan.filter(laporan => {
    const matchesPeriode = laporan.periode === selectedPeriode;
    const matchesDivisi = !selectedDivisi || laporan.divisi === selectedDivisi;
    return matchesPeriode && matchesDivisi;
  });

  const filteredLaporanKaryawan = laporanKaryawan.filter(karyawan => {
    const matchesDivisi = !selectedDivisi || karyawan.divisi === selectedDivisi;
    return matchesDivisi;
  });

  const totalStats = filteredLaporanBulanan.reduce((acc, curr) => ({
    totalKaryawan: acc.totalKaryawan + curr.totalKaryawan,
    totalGajiPokok: acc.totalGajiPokok + curr.totalGajiPokok,
    totalTunjangan: acc.totalTunjangan + curr.totalTunjangan,
    totalLembur: acc.totalLembur + curr.totalLembur,
    totalPendapatan: acc.totalPendapatan + curr.totalPendapatan,
    totalPotongan: acc.totalPotongan + curr.totalPotongan,
    totalGajiDibayar: acc.totalGajiDibayar + curr.totalGajiDibayar
  }), {
    totalKaryawan: 0,
    totalGajiPokok: 0,
    totalTunjangan: 0,
    totalLembur: 0,
    totalPendapatan: 0,
    totalPotongan: 0,
    totalGajiDibayar: 0
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

  const summaryColumns = [
    {
      key: 'divisi',
      header: 'Divisi',
      render: (laporan: LaporanGajiBulanan) => (
        <div>
          <div className="font-medium text-slate-900">{laporan.divisi}</div>
          <div className="text-sm text-slate-500">{laporan.totalKaryawan} karyawan</div>
        </div>
      )
    },
    {
      key: 'gajiPokok',
      header: 'Gaji Pokok',
      render: (laporan: LaporanGajiBulanan) => (
        <div className="text-right font-medium text-slate-900">
          {formatCurrency(laporan.totalGajiPokok)}
        </div>
      )
    },
    {
      key: 'tunjangan',
      header: 'Total Tunjangan',
      render: (laporan: LaporanGajiBulanan) => (
        <div className="text-right font-medium text-blue-600">
          {formatCurrency(laporan.totalTunjangan)}
        </div>
      )
    },
    {
      key: 'lembur',
      header: 'Lembur',
      render: (laporan: LaporanGajiBulanan) => (
        <div className="text-right font-medium text-amber-600">
          {formatCurrency(laporan.totalLembur)}
        </div>
      )
    },
    {
      key: 'pendapatan',
      header: 'Total Pendapatan',
      render: (laporan: LaporanGajiBulanan) => (
        <div className="text-right font-semibold text-green-600">
          {formatCurrency(laporan.totalPendapatan)}
        </div>
      )
    },
    {
      key: 'potongan',
      header: 'Total Potongan',
      render: (laporan: LaporanGajiBulanan) => (
        <div className="text-right font-medium text-red-600">
          {formatCurrency(laporan.totalPotongan)}
        </div>
      )
    },
    {
      key: 'dibayar',
      header: 'Gaji Dibayar',
      render: (laporan: LaporanGajiBulanan) => (
        <div className="text-right">
          <div className="font-bold text-green-700">{formatCurrency(laporan.totalGajiDibayar)}</div>
          <div className="text-xs text-slate-500">
            Avg: {formatCurrency(laporan.rataRataGaji)}
          </div>
        </div>
      )
    }
  ];

  const detailColumns = [
    {
      key: 'karyawan',
      header: 'Karyawan',
      render: (karyawan: LaporanGajiKaryawan) => (
        <div>
          <div className="font-medium text-slate-900">{karyawan.nama}</div>
          <div className="text-sm text-slate-500">{karyawan.nip}</div>
          <div className="text-xs text-slate-400">{karyawan.jabatan}</div>
        </div>
      )
    },
    {
      key: 'divisi',
      header: 'Divisi',
      render: (karyawan: LaporanGajiKaryawan) => (
        <div className="text-sm font-medium text-slate-700">{karyawan.divisi}</div>
      )
    },
    {
      key: 'gajiPokok',
      header: 'Gaji Pokok',
      render: (karyawan: LaporanGajiKaryawan) => (
        <div className="text-right font-medium text-slate-900">
          {formatCurrency(karyawan.gajiPokok)}
        </div>
      )
    },
    {
      key: 'tunjangan',
      header: 'Tunjangan',
      render: (karyawan: LaporanGajiKaryawan) => (
        <div className="text-right text-sm">
          <div className="font-medium text-blue-600">{formatCurrency(karyawan.totalTunjangan)}</div>
          <div className="text-xs text-slate-500">
            J:{formatCurrency(karyawan.tunjanganJabatan)} | K:{formatCurrency(karyawan.tunjanganKeluarga)}
          </div>
        </div>
      )
    },
    {
      key: 'lembur',
      header: 'Lembur',
      render: (karyawan: LaporanGajiKaryawan) => (
        <div className="text-right text-sm">
          <div className="font-medium text-amber-600">{formatCurrency(karyawan.gajiLembur)}</div>
          <div className="text-xs text-slate-500">{karyawan.jamLembur} jam</div>
        </div>
      )
    },
    {
      key: 'pendapatan',
      header: 'Total Pendapatan',
      render: (karyawan: LaporanGajiKaryawan) => (
        <div className="text-right font-semibold text-green-600">
          {formatCurrency(karyawan.totalPendapatan)}
        </div>
      )
    },
    {
      key: 'potongan',
      header: 'Potongan',
      render: (karyawan: LaporanGajiKaryawan) => (
        <div className="text-right text-sm">
          <div className="font-medium text-red-600">{formatCurrency(karyawan.totalPotongan)}</div>
          <div className="text-xs text-slate-500">
            BPJS:{formatCurrency(karyawan.bpjs)} | Pajak:{formatCurrency(karyawan.pajak)}
          </div>
        </div>
      )
    },
    {
      key: 'diterima',
      header: 'Gaji Diterima',
      render: (karyawan: LaporanGajiKaryawan) => (
        <div className="text-right font-bold text-green-700">
          {formatCurrency(karyawan.gajiDiterima)}
        </div>
      )
    }
  ];

  return (
    <PayrollLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <DocumentChartBarIcon className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Laporan Gaji Bulanan</h3>
                <p className="text-sm text-slate-600">Analisis penggajian per divisi dan per karyawan</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Grafik Analisis
              </Button>
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print Laporan
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Karyawan</p>
                <p className="text-2xl font-bold text-slate-900">{totalStats.totalKaryawan}</p>
                <p className="text-xs text-slate-500 mt-1">{formatPeriode(selectedPeriode)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">👥</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Gaji Pokok</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(totalStats.totalGajiPokok)}</p>
                <p className="text-xs text-slate-500 mt-1">Basis penggajian</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-green-600">💰</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tunjangan</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(totalStats.totalTunjangan)}</p>
                <p className="text-xs text-slate-500 mt-1">Benefit karyawan</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">🎁</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Dibayar</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalStats.totalGajiDibayar)}</p>
                <p className="text-xs text-slate-500 mt-1">Gaji bersih</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-green-600">✅</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'summary' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ringkasan Divisi
              </button>
              <button
                onClick={() => setViewMode('detail')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'detail' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Detail Karyawan
              </button>
            </div>
          </div>
        </Card>

        {/* Main Table */}
        <Card>
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {viewMode === 'summary' ? 'Laporan Per Divisi' : 'Laporan Per Karyawan'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Periode: {formatPeriode(selectedPeriode)}
                  {selectedDivisi && ` • Divisi: ${selectedDivisi}`}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-600">{formatPeriode(selectedPeriode)}</span>
              </div>
            </div>
          </div>
          
          <Table
            data={viewMode === 'summary' ? filteredLaporanBulanan : filteredLaporanKaryawan}
            columns={viewMode === 'summary' ? summaryColumns : detailColumns}

          />
          
          {/* Summary Footer */}
          {(viewMode === 'summary' && filteredLaporanBulanan.length > 1) && (
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <div className="grid grid-cols-7 gap-4 text-sm font-semibold">
                <div className="text-slate-900">
                  TOTAL ({totalStats.totalKaryawan} karyawan)
                </div>
                <div className="text-right text-slate-900">
                  {formatCurrency(totalStats.totalGajiPokok)}
                </div>
                <div className="text-right text-blue-600">
                  {formatCurrency(totalStats.totalTunjangan)}
                </div>
                <div className="text-right text-amber-600">
                  {formatCurrency(totalStats.totalLembur)}
                </div>
                <div className="text-right text-green-600">
                  {formatCurrency(totalStats.totalPendapatan)}
                </div>
                <div className="text-right text-red-600">
                  {formatCurrency(totalStats.totalPotongan)}
                </div>
                <div className="text-right text-green-700">
                  {formatCurrency(totalStats.totalGajiDibayar)}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PayrollLayout>
  );
};

export default LaporanGaji;
