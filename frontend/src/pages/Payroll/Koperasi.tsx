import React, { useState } from 'react';
import PayrollLayout from '../../components/Payroll/PayrollLayout';
import Card from '../../components/common/UI/Card';
import Button from '../../components/common/UI/Button';
import Modal from '../../components/common/UI/Modal';
import Table from '../../components/common/UI/Table';
import {
  BuildingStorefrontIcon,
  BanknotesIcon,
  CreditCardIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface KoperasiMember {
  id: string;
  nip: string;
  nama: string;
  divisi: string;
  tanggalBergabung: string;
  simpananPokok: number;
  simpananWajib: number;
  simpananSukarela: number;
  totalSimpanan: number;
  totalPinjaman: number;
  sisaPinjaman: number;
  status: 'Aktif' | 'Non-Aktif' | 'Pending';
}

interface TransaksiKoperasi {
  id: string;
  nip: string;
  nama: string;
  jenisTransaksi: 'Simpanan Wajib' | 'Simpanan Sukarela' | 'Pinjaman' | 'Angsuran' | 'Penarikan';
  jumlah: number;
  tanggal: string;
  keterangan: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
}

const Koperasi: React.FC = () => {
  const [memberData] = useState<KoperasiMember[]>([
    {
      id: '1',
      nip: 'EMP001',
      nama: 'Ahmad Fauzi',
      divisi: 'Akademik',
      tanggalBergabung: '2020-02-01',
      simpananPokok: 100000,
      simpananWajib: 1200000,
      simpananSukarela: 2500000,
      totalSimpanan: 3800000,
      totalPinjaman: 5000000,
      sisaPinjaman: 2500000,
      status: 'Aktif'
    },
    {
      id: '2',
      nip: 'EMP002',
      nama: 'Siti Nurhaliza',
      divisi: 'Akademik',
      tanggalBergabung: '2019-09-15',
      simpananPokok: 100000,
      simpananWajib: 1800000,
      simpananSukarela: 1000000,
      totalSimpanan: 2900000,
      totalPinjaman: 3000000,
      sisaPinjaman: 800000,
      status: 'Aktif'
    },
    {
      id: '3',
      nip: 'EMP003',
      nama: 'Budi Santoso',
      divisi: 'Administrasi',
      tanggalBergabung: '2021-04-10',
      simpananPokok: 100000,
      simpananWajib: 900000,
      simpananSukarela: 500000,
      totalSimpanan: 1500000,
      totalPinjaman: 0,
      sisaPinjaman: 0,
      status: 'Aktif'
    },
    {
      id: '4',
      nip: 'EMP004',
      nama: 'Lisa Permata',
      divisi: 'Keuangan',
      tanggalBergabung: '2022-01-20',
      simpananPokok: 100000,
      simpananWajib: 600000,
      simpananSukarela: 0,
      totalSimpanan: 700000,
      totalPinjaman: 1500000,
      sisaPinjaman: 1200000,
      status: 'Pending'
    }
  ]);

  const [transaksiData, setTransaksiData] = useState<TransaksiKoperasi[]>([
    {
      id: '1',
      nip: 'EMP001',
      nama: 'Ahmad Fauzi',
      jenisTransaksi: 'Angsuran',
      jumlah: 250000,
      tanggal: '2024-02-01',
      keterangan: 'Angsuran pinjaman bulan Februari',
      status: 'Disetujui'
    },
    {
      id: '2',
      nip: 'EMP004',
      nama: 'Lisa Permata',
      jenisTransaksi: 'Pinjaman',
      jumlah: 1500000,
      tanggal: '2024-01-28',
      keterangan: 'Pinjaman untuk renovasi rumah',
      status: 'Pending'
    },
    {
      id: '3',
      nip: 'EMP002',
      nama: 'Siti Nurhaliza',
      jenisTransaksi: 'Simpanan Sukarela',
      jumlah: 500000,
      tanggal: '2024-01-25',
      keterangan: 'Tambahan simpanan sukarela',
      status: 'Disetujui'
    },
    {
      id: '4',
      nip: 'EMP003',
      nama: 'Budi Santoso',
      jenisTransaksi: 'Simpanan Wajib',
      jumlah: 50000,
      tanggal: '2024-02-01',
      keterangan: 'Simpanan wajib bulan Februari',
      status: 'Disetujui'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'transactions'>('members');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<KoperasiMember | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'transaction'>('view');

  const filteredMembers = memberData.filter(member => {
    const matchesSearch = member.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.nip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivisi = !selectedDivisi || member.divisi === selectedDivisi;
    const matchesStatus = !selectedStatus || member.status === selectedStatus;
    
    return matchesSearch && matchesDivisi && matchesStatus;
  });

  const filteredTransaksi = transaksiData.filter(transaksi => {
    const matchesSearch = transaksi.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaksi.nip.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const koperasiStats = {
    totalAnggota: memberData.filter(m => m.status === 'Aktif').length,
    totalSimpanan: memberData.reduce((sum, m) => sum + m.totalSimpanan, 0),
    totalPinjaman: memberData.reduce((sum, m) => sum + m.sisaPinjaman, 0),
    pendingTransaksi: transaksiData.filter(t => t.status === 'Pending').length,
    totalAset: memberData.reduce((sum, m) => sum + m.totalSimpanan, 0) - memberData.reduce((sum, m) => sum + m.sisaPinjaman, 0)
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Aktif': 'bg-green-100 text-green-800 border-green-200',
      'Non-Aktif': 'bg-red-100 text-red-800 border-red-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Disetujui': 'bg-green-100 text-green-800 border-green-200',
      'Ditolak': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[status] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
        {status}
      </span>
    );
  };

  const getJenisTransaksiBadge = (jenis: string) => {
    const colors: Record<string, string> = {
      'Simpanan Wajib': 'bg-blue-100 text-blue-800',
      'Simpanan Sukarela': 'bg-green-100 text-green-800',
      'Pinjaman': 'bg-red-100 text-red-800',
      'Angsuran': 'bg-purple-100 text-purple-800',
      'Penarikan': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[jenis] || 'bg-slate-100 text-slate-800'}`}>
        {jenis}
      </span>
    );
  };

  const handleOpenModal = (mode: 'view' | 'transaction', member?: KoperasiMember) => {
    setModalMode(mode);
    setSelectedMember(member || null);
    setIsModalOpen(true);
  };

  const handleApproveTransaction = (transactionId: string, approved: boolean) => {
    setTransaksiData(prev => prev.map(t => 
      t.id === transactionId 
        ? { ...t, status: approved ? 'Disetujui' : 'Ditolak' }
        : t
    ));
  };

  const memberColumns = [
    {
      key: 'member',
      header: 'Anggota',
      render: (member: KoperasiMember) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900">{member.nama}</div>
            <div className="text-sm text-slate-500">{member.nip} • {member.divisi}</div>
            <div className="text-xs text-slate-400">
              Bergabung: {new Date(member.tanggalBergabung).toLocaleDateString('id-ID')}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'simpanan',
      header: 'Total Simpanan',
      render: (member: KoperasiMember) => (
        <div className="text-sm">
          <div className="font-semibold text-green-600">{formatCurrency(member.totalSimpanan)}</div>
          <div className="text-xs text-slate-500">
            Pokok: {formatCurrency(member.simpananPokok)}
          </div>
          <div className="text-xs text-slate-500">
            Wajib: {formatCurrency(member.simpananWajib)}
          </div>
          <div className="text-xs text-slate-500">
            Sukarela: {formatCurrency(member.simpananSukarela)}
          </div>
        </div>
      )
    },
    {
      key: 'pinjaman',
      header: 'Pinjaman',
      render: (member: KoperasiMember) => (
        <div className="text-sm text-center">
          <div className="font-medium text-slate-900">{formatCurrency(member.totalPinjaman)}</div>
          <div className="text-xs text-red-600">
            Sisa: {formatCurrency(member.sisaPinjaman)}
          </div>
        </div>
      )
    },
    {
      key: 'rasio',
      header: 'Rasio S/P',
      render: (member: KoperasiMember) => {
        const rasio = member.totalPinjaman > 0 ? ((member.totalSimpanan / member.totalPinjaman) * 100).toFixed(1) : '∞';
        const isGood = member.totalPinjaman === 0 || (member.totalSimpanan / member.totalPinjaman) >= 0.3;
        
        return (
          <div className={`text-sm font-medium text-center ${isGood ? 'text-green-600' : 'text-red-600'}`}>
            {rasio}%
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (member: KoperasiMember) => getStatusBadge(member.status)
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (member: KoperasiMember) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal('view', member)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenModal('transaction', member)}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Transaksi Baru"
          >
            <CreditCardIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const transaksiColumns = [
    {
      key: 'member',
      header: 'Anggota',
      render: (transaksi: TransaksiKoperasi) => (
        <div>
          <div className="font-medium text-slate-900">{transaksi.nama}</div>
          <div className="text-sm text-slate-500">{transaksi.nip}</div>
        </div>
      )
    },
    {
      key: 'jenis',
      header: 'Jenis Transaksi',
      render: (transaksi: TransaksiKoperasi) => getJenisTransaksiBadge(transaksi.jenisTransaksi)
    },
    {
      key: 'jumlah',
      header: 'Jumlah',
      render: (transaksi: TransaksiKoperasi) => {
        const isIncome = ['Simpanan Wajib', 'Simpanan Sukarela', 'Angsuran'].includes(transaksi.jenisTransaksi);
        return (
          <div className={`font-semibold text-right ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(transaksi.jumlah)}
          </div>
        );
      }
    },
    {
      key: 'tanggal',
      header: 'Tanggal',
      render: (transaksi: TransaksiKoperasi) => (
        <div className="text-sm text-slate-600">
          {new Date(transaksi.tanggal).toLocaleDateString('id-ID')}
        </div>
      )
    },
    {
      key: 'keterangan',
      header: 'Keterangan',
      render: (transaksi: TransaksiKoperasi) => (
        <div className="text-sm text-slate-600 max-w-xs truncate">
          {transaksi.keterangan}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (transaksi: TransaksiKoperasi) => getStatusBadge(transaksi.status)
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (transaksi: TransaksiKoperasi) => (
        <div className="flex items-center gap-2">
          {transaksi.status === 'Pending' && (
            <>
              <button
                onClick={() => handleApproveTransaction(transaksi.id, true)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Setujui"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleApproveTransaction(transaksi.id, false)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Tolak"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </>
          )}
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
              <BuildingStorefrontIcon className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Koperasi Karyawan</h3>
                <p className="text-sm text-slate-600">Kelola simpan pinjam karyawan sekolah</p>
              </div>
            </div>
            
            <Button
              onClick={() => handleOpenModal('transaction')}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Transaksi Baru
            </Button>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Anggota</p>
                <p className="text-2xl font-bold text-slate-900">{koperasiStats.totalAnggota}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Simpanan</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(koperasiStats.totalSimpanan)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Pinjaman</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(koperasiStats.totalPinjaman)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{koperasiStats.pendingTransaksi}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <CreditCardIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Aset</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(koperasiStats.totalAset)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BanknotesIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'members' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Data Anggota
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'transactions' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Transaksi
            </button>
          </div>
        </Card>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari anggota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full sm:w-64"
              />
            </div>
            
            {activeTab === 'members' && (
              <>
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
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                  <option value="Pending">Pending</option>
                </select>
              </>
            )}
          </div>
        </Card>

        {/* Data Table */}
        <Card>
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              {activeTab === 'members' ? 'Data Anggota Koperasi' : 'Transaksi Koperasi'}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {activeTab === 'members' 
                ? `Menampilkan ${filteredMembers.length} dari ${memberData.length} anggota`
                : `Menampilkan ${filteredTransaksi.length} dari ${transaksiData.length} transaksi`
              }
            </p>
          </div>
          
          <Table
            data={activeTab === 'members' ? filteredMembers : filteredTransaksi}
            columns={activeTab === 'members' ? memberColumns : transaksiColumns}

          />
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'view' ? 'Detail Anggota Koperasi' : 'Transaksi Koperasi Baru'
        }
        size="lg"
      >
        <div className="space-y-6">
          {modalMode === 'view' && selectedMember ? (
            // View Member Details
            <div className="space-y-6">
              {/* Member Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIP</label>
                  <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedMember.nip}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
                  <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedMember.nama}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Divisi</label>
                  <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedMember.divisi}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Bergabung</label>
                  <p className="text-sm text-slate-900 p-3 bg-slate-50 rounded-lg">
                    {new Date(selectedMember.tanggalBergabung).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Simpanan Details */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Rincian Simpanan</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Simpanan Pokok:</span>
                    <span className="font-medium">{formatCurrency(selectedMember.simpananPokok)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Simpanan Wajib:</span>
                    <span className="font-medium">{formatCurrency(selectedMember.simpananWajib)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Simpanan Sukarela:</span>
                    <span className="font-medium">{formatCurrency(selectedMember.simpananSukarela)}</span>
                  </div>
                  <div className="border-t border-green-300 pt-2 flex justify-between font-semibold text-green-700">
                    <span>Total Simpanan:</span>
                    <span>{formatCurrency(selectedMember.totalSimpanan)}</span>
                  </div>
                </div>
              </div>

              {/* Pinjaman Details */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Rincian Pinjaman</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Pinjaman:</span>
                    <span className="font-medium">{formatCurrency(selectedMember.totalPinjaman)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sisa Pinjaman:</span>
                    <span className="font-medium">{formatCurrency(selectedMember.sisaPinjaman)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sudah Dibayar:</span>
                    <span className="font-medium">{formatCurrency(selectedMember.totalPinjaman - selectedMember.sisaPinjaman)}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status Anggota</label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  {getStatusBadge(selectedMember.status)}
                </div>
              </div>
            </div>
          ) : (
            // New Transaction Form
            <div className="text-center py-12">
              <p className="text-slate-500">Form transaksi koperasi akan ditambahkan di sini.</p>
            </div>
          )}
        </div>
      </Modal>
    </PayrollLayout>
  );
};

export default Koperasi;
