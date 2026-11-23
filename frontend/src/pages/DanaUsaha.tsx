import React, { useState } from 'react';
import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import Table from '../components/common/UI/Table';
import Modal from '../components/common/UI/Modal';
import Button from '../components/common/UI/Button';

interface BusinessUnit {
  id: string;
  nama: string;
  jenis: 'kantin' | 'koperasi' | 'warung' | 'fotocopy' | 'lainnya';
  penanggungJawab: string;
  modalAwal: number;
  pendapatanBulanIni: number;
  pengeluaranBulanIni: number;
  labaBersih: number;
  status: 'aktif' | 'non_aktif' | 'evaluasi';
  tanggalMulai: string;
  keterangan?: string;
}

const DanaUsaha: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<BusinessUnit | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('2024-12');

  // Sample data
  const businessUnits: BusinessUnit[] = [
    {
      id: '1',
      nama: 'Kantin Sekolah',
      jenis: 'kantin',
      penanggungJawab: 'Siti Aminah',
      modalAwal: 25000000,
      pendapatanBulanIni: 18500000,
      pengeluaranBulanIni: 12800000,
      labaBersih: 5700000,
      status: 'aktif',
      tanggalMulai: '2023-07-15',
      keterangan: 'Menyediakan makanan dan minuman untuk siswa dan guru'
    },
    {
      id: '2',
      nama: 'Koperasi Siswa',
      jenis: 'koperasi',
      penanggungJawab: 'Ahmad Wijaya',
      modalAwal: 15000000,
      pendapatanBulanIni: 8200000,
      pengeluaranBulanIni: 6100000,
      labaBersih: 2100000,
      status: 'aktif',
      tanggalMulai: '2023-08-01',
      keterangan: 'Menjual alat tulis dan kebutuhan siswa'
    },
    {
      id: '3',
      nama: 'Warung Bu Ina',
      jenis: 'warung',
      penanggungJawab: 'Ina Marlina',
      modalAwal: 8000000,
      pendapatanBulanIni: 4500000,
      pengeluaranBulanIni: 3200000,
      labaBersih: 1300000,
      status: 'aktif',
      tanggalMulai: '2024-01-10',
      keterangan: 'Warung makan di area sekolah'
    },
    {
      id: '4',
      nama: 'Jasa Fotocopy',
      jenis: 'fotocopy',
      penanggungJawab: 'Bambang Sutrisno',
      modalAwal: 12000000,
      pendapatanBulanIni: 3800000,
      pengeluaranBulanIni: 2200000,
      labaBersih: 1600000,
      status: 'evaluasi',
      tanggalMulai: '2023-09-15',
      keterangan: 'Layanan fotocopy dan print untuk keperluan sekolah'
    }
  ];

  const totalPendapatan = businessUnits.reduce((sum, unit) => sum + unit.pendapatanBulanIni, 0);
  const totalPengeluaran = businessUnits.reduce((sum, unit) => sum + unit.pengeluaranBulanIni, 0);
  const totalLabaBersih = businessUnits.reduce((sum, unit) => sum + unit.labaBersih, 0);

  const stats = [
    {
      title: 'Total Pendapatan',
      value: `Rp ${totalPendapatan.toLocaleString('id-ID')}`,
      icon: ArrowTrendingUpIcon,
      gradient: 'from-emerald-500 to-green-600',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Pengeluaran',
      value: `Rp ${totalPengeluaran.toLocaleString('id-ID')}`,
      icon: ArrowTrendingDownIcon,
      gradient: 'from-red-500 to-rose-600',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Laba Bersih',
      value: `Rp ${totalLabaBersih.toLocaleString('id-ID')}`,
      icon: BanknotesIcon,
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+15%',
      changeType: 'increase'
    },
    {
      title: 'Unit Bisnis Aktif',
      value: businessUnits.filter(unit => unit.status === 'aktif').length.toString(),
      icon: BuildingStorefrontIcon,
      gradient: 'from-purple-500 to-indigo-600',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '4 unit',
      changeType: 'neutral'
    }
  ];

  const filteredData = businessUnits.filter(unit =>
    unit.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.jenis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Unit Bisnis',
      key: 'nama',
      render: (value: string, row: BusinessUnit) => (
        <div>
          <p className="font-semibold text-slate-800">{value}</p>
          <p className="text-xs text-slate-500 capitalize">{row.jenis}</p>
          <p className="text-xs text-slate-600">PJ: {row.penanggungJawab}</p>
        </div>
      )
    },
    {
      header: 'Modal Awal',
      key: 'modalAwal',
      render: (value: number) => (
        <span className="font-semibold text-slate-700">
          Rp {value.toLocaleString('id-ID')}
        </span>
      )
    },
    {
      header: 'Pendapatan',
      key: 'pendapatanBulanIni',
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          Rp {value.toLocaleString('id-ID')}
        </span>
      )
    },
    {
      header: 'Pengeluaran',
      key: 'pengeluaranBulanIni',
      render: (value: number) => (
        <span className="font-semibold text-red-600">
          Rp {value.toLocaleString('id-ID')}
        </span>
      )
    },
    {
      header: 'Laba Bersih',
      key: 'labaBersih',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          {value > 0 ? (
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
          )}
          <span className={`font-bold ${value > 0 ? 'text-green-600' : 'text-red-600'}`}>
            Rp {Math.abs(value).toLocaleString('id-ID')}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (value: string) => {
        const statusConfig = {
          aktif: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Aktif' },
          non_aktif: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Non Aktif' },
          evaluasi: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Evaluasi' }
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
      header: 'Mulai Beroperasi',
      key: 'tanggalMulai',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{new Date(value).toLocaleDateString('id-ID')}</span>
        </div>
      )
    },
    {
      header: 'Aksi',
      key: 'id',
      render: (_: string, row: BusinessUnit) => (
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
          <button 
            onClick={() => handleDelete(row)}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Hapus"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const handleView = (unit: BusinessUnit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleEdit = (unit: BusinessUnit) => {
    console.log('Edit unit:', unit);
  };

  const handleDelete = (unit: BusinessUnit) => {
    console.log('Delete unit:', unit);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6 text-white" />
            </div>
            Dana Usaha
          </h1>
          <p className="text-slate-600 mt-1">Manajemen keuangan unit bisnis sekolah</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="2024-12">Desember 2024</option>
            <option value="2024-11">November 2024</option>
            <option value="2024-10">Oktober 2024</option>
          </select>
          <Button className="bg-green-500 hover:bg-green-600">
            <PlusIcon className="w-4 h-4" />
            Tambah Unit Bisnis
          </Button>
        </div>
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
                  <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                    stat.changeType === 'increase' ? 'bg-emerald-50 border border-emerald-200' :
                    stat.changeType === 'decrease' ? 'bg-red-50 border border-red-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <span className={`text-xs font-semibold ${
                      stat.changeType === 'increase' ? 'text-emerald-700' :
                      stat.changeType === 'decrease' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                      {stat.change}
                    </span>
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
              <ChartPieIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Analisis Keuangan</p>
              <p className="text-sm text-slate-600">Lihat performa unit bisnis</p>
            </div>
          </button>
          
          <button className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DocumentArrowDownIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Laporan Keuangan</p>
              <p className="text-sm text-slate-600">Export laporan bulanan</p>
            </div>
          </button>
          
          <button className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BuildingStorefrontIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Monitor Unit Bisnis</p>
              <p className="text-sm text-slate-600">Evaluasi performa harian</p>
            </div>
          </button>
        </div>
      </div>

      {/* Business Units Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800">Daftar Unit Bisnis</h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari unit bisnis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <Button variant="outline" className="border-green-300 text-green-600 hover:bg-green-50">
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <Table columns={columns} data={filteredData} />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detail Unit Bisnis"
        size="lg"
      >
        {selectedUnit && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-800 mb-3">Informasi Unit Bisnis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nama Unit</label>
                  <p className="text-slate-900 font-semibold">{selectedUnit.nama}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Jenis Usaha</label>
                  <p className="text-slate-900 capitalize">{selectedUnit.jenis}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Penanggung Jawab</label>
                  <p className="text-slate-900">{selectedUnit.penanggungJawab}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                  <p className="text-slate-900 capitalize">{selectedUnit.status.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4">Informasi Keuangan</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Modal Awal</span>
                  <span className="font-semibold">Rp {selectedUnit.modalAwal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Pendapatan Bulan Ini</span>
                  <span className="font-semibold text-green-600">Rp {selectedUnit.pendapatanBulanIni.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Pengeluaran Bulan Ini</span>
                  <span className="font-semibold text-red-600">Rp {selectedUnit.pengeluaranBulanIni.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-slate-50 px-4 rounded-lg">
                  <span className="font-bold text-slate-800">Laba Bersih</span>
                  <span className={`font-bold text-xl ${selectedUnit.labaBersih > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Rp {Math.abs(selectedUnit.labaBersih).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {selectedUnit.keterangan && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Keterangan</label>
                <p className="text-slate-900">{selectedUnit.keterangan}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
              <Button className="bg-green-500 hover:bg-green-600">
                <DocumentArrowDownIcon className="w-4 h-4" />
                Download Laporan
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DanaUsaha;
