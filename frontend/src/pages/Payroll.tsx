import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  UsersIcon,
  CalculatorIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import Table from '../components/common/UI/Table';
import Modal from '../components/common/UI/Modal';
import Button from '../components/common/UI/Button';

interface EmployeePayroll {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  gajiPokok: number;
  tunjangan: number;
  potongan: number;
  gajiBersih: number;
  status: 'belum_dibayar' | 'sudah_dibayar' | 'pending';
  tanggalBayar?: string;
}

const Payroll: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePayroll | null>(null);

  // Sample data
  const payrollData: EmployeePayroll[] = [
    {
      id: '1',
      nama: 'Ahmad Fauzi, S.Pd',
      nip: '198501012010011001',
      jabatan: 'Guru Kelas',
      gajiPokok: 4500000,
      tunjangan: 1200000,
      potongan: 450000,
      gajiBersih: 5250000,
      status: 'sudah_dibayar',
      tanggalBayar: '2024-12-01'
    },
    {
      id: '2',
      nama: 'Siti Nurhaliza, S.Pd',
      nip: '198503152010012002',
      jabatan: 'Wali Kelas',
      gajiPokok: 4800000,
      tunjangan: 1500000,
      potongan: 480000,
      gajiBersih: 5820000,
      status: 'sudah_dibayar',
      tanggalBayar: '2024-12-01'
    },
    {
      id: '3',
      nama: 'Bambang Santoso, S.Kom',
      nip: '198707202015031003',
      jabatan: 'Staff TU',
      gajiPokok: 3800000,
      tunjangan: 800000,
      potongan: 380000,
      gajiBersih: 4220000,
      status: 'belum_dibayar'
    },
    {
      id: '4',
      nama: 'Rina Marlina, S.E',
      nip: '198904102018012004',
      jabatan: 'Bendahara',
      gajiPokok: 4200000,
      tunjangan: 1000000,
      potongan: 420000,
      gajiBersih: 4780000,
      status: 'pending'
    }
  ];

  const stats = [
    {
      title: 'Total Gaji Bulan Ini',
      value: `Rp ${payrollData.reduce((sum, emp) => sum + emp.gajiBersih, 0).toLocaleString('id-ID')}`,
      icon: CurrencyDollarIcon,
      gradient: 'from-emerald-500 to-green-600',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Karyawan Aktif',
      value: payrollData.length.toString(),
      icon: UsersIcon,
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Sudah Dibayar',
      value: payrollData.filter(emp => emp.status === 'sudah_dibayar').length.toString(),
      icon: BanknotesIcon,
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Belum Dibayar',
      value: payrollData.filter(emp => emp.status === 'belum_dibayar').length.toString(),
      icon: ClockIcon,
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600'
    }
  ];

  const filteredData = payrollData.filter(emp =>
    emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.nip.includes(searchTerm) ||
    emp.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Karyawan',
      key: 'nama',
      render: (value: string, row: EmployeePayroll) => (
        <div>
          <p className="font-semibold text-slate-800">{value}</p>
          <p className="text-xs text-slate-500 font-mono">{row.nip}</p>
          <p className="text-xs text-slate-600">{row.jabatan}</p>
        </div>
      )
    },
    {
      header: 'Gaji Pokok',
      key: 'gajiPokok',
      render: (value: number) => (
        <span className="font-semibold text-slate-800">
          Rp {value.toLocaleString('id-ID')}
        </span>
      )
    },
    {
      header: 'Tunjangan',
      key: 'tunjangan',
      render: (value: number) => (
        <span className="text-green-600 font-medium">
          +Rp {value.toLocaleString('id-ID')}
        </span>
      )
    },
    {
      header: 'Potongan',
      key: 'potongan',
      render: (value: number) => (
        <span className="text-red-600 font-medium">
          -Rp {value.toLocaleString('id-ID')}
        </span>
      )
    },
    {
      header: 'Gaji Bersih',
      key: 'gajiBersih',
      render: (value: number) => (
        <span className="font-bold text-lg text-slate-900">
          Rp {value.toLocaleString('id-ID')}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (value: string, row: EmployeePayroll) => {
        const statusConfig = {
          sudah_dibayar: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Sudah Dibayar' },
          belum_dibayar: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Belum Dibayar' },
          pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' }
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        
        return (
          <div className="space-y-1">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
              {config.label}
            </span>
            {row.tanggalBayar && (
              <p className="text-xs text-slate-500">{new Date(row.tanggalBayar).toLocaleDateString('id-ID')}</p>
            )}
          </div>
        );
      }
    },
    {
      header: 'Aksi',
      key: 'id',
      render: (_: string, row: EmployeePayroll) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleView(row)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleEdit(row)}
            className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          {row.status === 'belum_dibayar' && (
            <button 
              onClick={() => handlePayroll(row)}
              className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
              title="Proses Gaji"
            >
              <BanknotesIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const handleView = (employee: EmployeePayroll) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: EmployeePayroll) => {
    console.log('Edit employee:', employee);
  };

  const handlePayroll = (employee: EmployeePayroll) => {
    console.log('Process payroll for:', employee);
  };

  return (
    <div className="space-y-6">
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
              <CalculatorIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Hitung Gaji</p>
              <p className="text-sm text-slate-600">Kalkulasi otomatis gaji bulanan</p>
            </div>
          </button>
          
          <button className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DocumentArrowDownIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Export Slip Gaji</p>
              <p className="text-sm text-slate-600">Download slip gaji PDF</p>
            </div>
          </button>
          
          <Link 
            to="/payroll/cuti-karyawan"
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CalendarDaysIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Kelola Cuti</p>
              <p className="text-sm text-slate-600">Manajemen cuti karyawan</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800">Daftar Gaji Karyawan</h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari karyawan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <Button variant="outline" className="border-amber-300 text-amber-600 hover:bg-amber-50">
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <Table columns={columns} data={filteredData} />
      </div>

      {/* Quick Access Links */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Menu Payroll</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/payroll/absensi-karyawan" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Absensi Karyawan</p>
              <p className="text-sm text-slate-600">Kelola absensi harian</p>
            </div>
          </Link>
          
          <Link to="/payroll/cuti-karyawan" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CalendarDaysIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Cuti Karyawan</p>
              <p className="text-sm text-slate-600">Manajemen cuti</p>
            </div>
          </Link>
          
          <Link to="/payroll/gaji/slip-gaji" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Slip Gaji</p>
              <p className="text-sm text-slate-600">Cetak slip gaji</p>
            </div>
          </Link>
          
          <Link to="/payroll/gaji/report-slip" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Report Slip Gaji</p>
              <p className="text-sm text-slate-600">Analisis gaji per unit/bulan/tahun</p>
            </div>
          </Link>
          
          <Link to="/payroll/koperasi" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Koperasi</p>
              <p className="text-sm text-slate-600">Data koperasi</p>
            </div>
          </Link>
          
          <Link to="/payroll/rekapitulasi/laporan-gaji" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <DocumentArrowDownIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Laporan</p>
              <p className="text-sm text-slate-600">Laporan keuangan</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detail Gaji Karyawan"
        size="lg"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-800 mb-3">Informasi Karyawan</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nama</label>
                  <p className="text-slate-900 font-semibold">{selectedEmployee.nama}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">NIP</label>
                  <p className="text-slate-900 font-mono">{selectedEmployee.nip}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Jabatan</label>
                  <p className="text-slate-900">{selectedEmployee.jabatan}</p>
                </div>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4">Rincian Gaji</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Gaji Pokok</span>
                  <span className="font-semibold">Rp {selectedEmployee.gajiPokok.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Tunjangan</span>
                  <span className="font-semibold text-green-600">+Rp {selectedEmployee.tunjangan.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Potongan</span>
                  <span className="font-semibold text-red-600">-Rp {selectedEmployee.potongan.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-slate-50 px-4 rounded-lg">
                  <span className="font-bold text-slate-800">Total Gaji Bersih</span>
                  <span className="font-bold text-xl text-slate-900">Rp {selectedEmployee.gajiBersih.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600">
                <DocumentArrowDownIcon className="w-4 h-4" />
                Download Slip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payroll;
