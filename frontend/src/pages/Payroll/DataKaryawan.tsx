import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PayrollLayout from '../../components/Payroll/PayrollLayout';
import Card from '../../components/common/UI/Card';
import Button from '../../components/common/UI/Button';
import Modal from '../../components/common/UI/Modal';
import Table from '../../components/common/UI/Table';
import EmployeeForm from '../../components/Payroll/EmployeeFormFixed';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  nipy: string;
  nama: string;
  jabatan: string;
  unit: string;
  email: string;
  telepon: string;
  alamat: string;
  tanggalMasuk: string;
  status: 'Aktif' | 'Non-Aktif' | 'Cuti';
  statusKerja: 'Tetap' | 'Kontrak' | 'Honor';
  gajiPokok: number;
  tunjangan: number;
  // Data tambahan untuk detail
  tempatLahir?: string;
  tanggalLahir?: string;
  pendidikanJurusan?: string;
  pendidikanTitle?: string;
  statusPernikahan?: 'Belum Menikah' | 'Menikah' | 'Cerai';
  tugasTambahan?: string;
  mapelDiampu?: string;
  jamMengajar?: number;
}

const DataKaryawan: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      nipy: 'EMP001',
      nama: 'Ahmad Fauzi',
      jabatan: 'Guru Matematika',
      unit: 'SMA',
      email: 'ahmad.fauzi@annur.sch.id',
      telepon: '081234567890',
      alamat: 'Jl. Merdeka No. 123, Jakarta',
      tanggalMasuk: '2020-01-15',
      status: 'Aktif',
      statusKerja: 'Tetap',
      gajiPokok: 5000000,
      tunjangan: 1000000,
      tempatLahir: 'Jakarta',
      tanggalLahir: '1985-03-15',
      pendidikanJurusan: 'Matematika',
      pendidikanTitle: 'S1',
      statusPernikahan: 'Menikah',
      tugasTambahan: 'Koordinator Olimpiade',
      mapelDiampu: 'Matematika Wajib, Matematika Peminatan',
      jamMengajar: 24
    },
    {
      id: '2',
      nipy: 'EMP002',
      nama: 'Siti Nurhaliza',
      jabatan: 'Guru Bahasa Indonesia',
      unit: 'SMP',
      email: 'siti.nurhaliza@annur.sch.id',
      telepon: '081234567891',
      alamat: 'Jl. Sudirman No. 456, Jakarta',
      tanggalMasuk: '2019-08-20',
      status: 'Aktif',
      statusKerja: 'Tetap',
      gajiPokok: 4800000,
      tunjangan: 900000,
      tempatLahir: 'Bandung',
      tanggalLahir: '1987-07-22',
      pendidikanJurusan: 'Bahasa Indonesia',
      pendidikanTitle: 'S1',
      statusPernikahan: 'Menikah',
      tugasTambahan: 'Wali Kelas 8A',
      mapelDiampu: 'Bahasa Indonesia',
      jamMengajar: 20
    },
    {
      id: '3',
      nipy: 'EMP003',
      nama: 'Budi Santoso',
      jabatan: 'Staff TU',
      unit: 'Umum',
      email: 'budi.santoso@annur.sch.id',
      telepon: '081234567892',
      alamat: 'Jl. Gatot Subroto No. 789, Jakarta',
      tanggalMasuk: '2021-03-10',
      status: 'Aktif',
      statusKerja: 'Kontrak',
      gajiPokok: 3500000,
      tunjangan: 500000,
      tempatLahir: 'Surabaya',
      tanggalLahir: '1990-12-05',
      pendidikanJurusan: 'Administrasi',
      pendidikanTitle: 'D3',
      statusPernikahan: 'Belum Menikah',
      tugasTambahan: 'Koordinator Inventaris',
      mapelDiampu: '-',
      jamMengajar: 0
    },
    {
      id: '4',
      nipy: 'EMP004',
      nama: 'Rina Susanti',
      jabatan: 'Kepala Sekolah',
      unit: 'Manajemen',
      email: 'rina.susanti@annur.sch.id',
      telepon: '081234567893',
      alamat: 'Jl. Diponegoro No. 12, Jakarta',
      tanggalMasuk: '2018-01-10',
      status: 'Aktif',
      statusKerja: 'Tetap',
      gajiPokok: 8000000,
      tunjangan: 2000000,
      tempatLahir: 'Yogyakarta',
      tanggalLahir: '1975-11-08',
      pendidikanJurusan: 'Manajemen Pendidikan',
      pendidikanTitle: 'S2',
      statusPernikahan: 'Menikah',
      tugasTambahan: 'Kepala Sekolah SMA',
      mapelDiampu: '-',
      jamMengajar: 0
    },
    {
      id: '5',
      nipy: 'EMP005',
      nama: 'Dedi Kurniawan',
      jabatan: 'Guru Olahraga',
      unit: 'SD',
      email: 'dedi.kurniawan@annur.sch.id',
      telepon: '081234567894',
      alamat: 'Jl. Pemuda No. 45, Jakarta',
      tanggalMasuk: '2021-07-15',
      status: 'Aktif',
      statusKerja: 'Tetap',
      gajiPokok: 4200000,
      tunjangan: 800000,
      tempatLahir: 'Jakarta',
      tanggalLahir: '1988-09-12',
      pendidikanJurusan: 'Pendidikan Jasmani',
      pendidikanTitle: 'S1',
      statusPernikahan: 'Menikah',
      tugasTambahan: 'Koordinator Olahraga',
      mapelDiampu: 'PJOK',
      jamMengajar: 18
    },
    {
      id: '6',
      nipy: 'EMP006',
      nama: 'Maya Sari',
      jabatan: 'Pengasuh',
      unit: 'Daycare',
      email: 'maya.sari@annur.sch.id',
      telepon: '081234567895',
      alamat: 'Jl. Melati No. 67, Jakarta',
      tanggalMasuk: '2022-02-01',
      status: 'Aktif',
      statusKerja: 'Kontrak',
      gajiPokok: 3200000,
      tunjangan: 400000,
      tempatLahir: 'Medan',
      tanggalLahir: '1995-04-18',
      pendidikanJurusan: 'PAUD',
      pendidikanTitle: 'S1',
      statusPernikahan: 'Belum Menikah',
      tugasTambahan: 'Koordinator Kegiatan Anak',
      mapelDiampu: '-',
      jamMengajar: 0
    },
    {
      id: '7',
      nipy: 'EMP007',
      nama: 'Rahman Hakim',
      jabatan: 'Guru Fisika',
      unit: 'SMA',
      email: 'rahman.hakim@annur.sch.id',
      telepon: '081234567896',
      alamat: 'Jl. Kartini No. 89, Jakarta',
      tanggalMasuk: '2019-06-12',
      status: 'Aktif',
      statusKerja: 'Tetap',
      gajiPokok: 4900000,
      tunjangan: 950000
    },
    {
      id: '8',
      nipy: 'EMP008',
      nama: 'Indira Putri',
      jabatan: 'Staff Keuangan',
      unit: 'Manajemen',
      email: 'indira.putri@annur.sch.id',
      telepon: '081234567897',
      alamat: 'Jl. Cendana No. 23, Jakarta',
      tanggalMasuk: '2020-09-14',
      status: 'Aktif',
      statusKerja: 'Tetap',
      gajiPokok: 5500000,
      tunjangan: 1100000
    },
    {
      id: '9',
      nipy: 'EMP009',
      nama: 'Fajar Ramadhan',
      jabatan: 'Guru IPA',
      unit: 'SMP',
      email: 'fajar.ramadhan@annur.sch.id',
      telepon: '081234567898',
      alamat: 'Jl. Dahlia No. 34, Jakarta',
      tanggalMasuk: '2021-11-20',
      status: 'Aktif',
      statusKerja: 'Honor',
      gajiPokok: 3800000,
      tunjangan: 600000
    },
    {
      id: '10',
      nipy: 'EMP010',
      nama: 'Lestari Dewi',
      jabatan: 'Guru Kelas',
      unit: 'SD',
      email: 'lestari.dewi@annur.sch.id',
      telepon: '081234567899',
      alamat: 'Jl. Mawar No. 56, Jakarta',
      tanggalMasuk: '2020-03-08',
      status: 'Cuti',
      statusKerja: 'Tetap',
      gajiPokok: 4000000,
      tunjangan: 750000
    },
    {
      id: '11',
      nipy: 'EMP011',
      nama: 'Agus Salim',
      jabatan: 'Security',
      unit: 'Umum',
      email: 'agus.salim@annur.sch.id',
      telepon: '081234567810',
      alamat: 'Jl. Kenanga No. 78, Jakarta',
      tanggalMasuk: '2019-12-05',
      status: 'Aktif',
      statusKerja: 'Kontrak',
      gajiPokok: 3000000,
      tunjangan: 300000
    },
    {
      id: '12',
      nipy: 'EMP012',
      nama: 'Sari Wulandari',
      jabatan: 'Koordinator Daycare',
      unit: 'Daycare',
      email: 'sari.wulandari@annur.sch.id',
      telepon: '081234567811',
      alamat: 'Jl. Anggrek No. 90, Jakarta',
      tanggalMasuk: '2018-08-15',
      status: 'Aktif',
      statusKerja: 'Tetap',
      gajiPokok: 5200000,
      tunjangan: 1000000
    },
    {
      id: '13',
      nipy: 'EMP013',
      nama: 'Bambang Sutrisno',
      jabatan: 'Guru Sejarah',
      unit: 'SMA',
      email: 'bambang.sutrisno@annur.sch.id',
      telepon: '081234567812',
      alamat: 'Jl. Flamboyan No. 12, Jakarta',
      tanggalMasuk: '2017-09-20',
      status: 'Aktif',
      statusKerja: 'Tetap',
      gajiPokok: 4700000,
      tunjangan: 900000
    },
    {
      id: '14',
      nipy: 'EMP014',
      nama: 'Dewi Maharani',
      jabatan: 'Guru Bahasa Inggris',
      unit: 'SMP',
      email: 'dewi.maharani@annur.sch.id',
      telepon: '081234567813',
      alamat: 'Jl. Teratai No. 34, Jakarta',
      tanggalMasuk: '2020-01-20',
      status: 'Aktif',
      statusKerja: 'Tetap',
      gajiPokok: 4300000,
      tunjangan: 820000
    },
    {
      id: '15',
      nipy: 'EMP015',
      nama: 'Hendra Wijaya',
      jabatan: 'IT Support',
      unit: 'Umum',
      email: 'hendra.wijaya@annur.sch.id',
      telepon: '081234567814',
      alamat: 'Jl. Lily No. 56, Jakarta',
      tanggalMasuk: '2021-05-10',
      status: 'Aktif',
      statusKerja: 'Kontrak',
      gajiPokok: 4800000,
      tunjangan: 700000
    },
    {
      id: '16',
      nipy: 'EMP016',
      nama: 'Nurul Azizah',
      jabatan: 'Konselor',
      unit: 'Manajemen',
      email: 'nurul.azizah@annur.sch.id',
      telepon: '081234567815',
      alamat: 'Jl. Sakura No. 78, Jakarta',
      tanggalMasuk: '2019-03-15',
      status: 'Aktif',
      statusKerja: 'Tetap',
      gajiPokok: 5000000,
      tunjangan: 1000000
    },
    {
      id: '17',
      nipy: 'EMP017',
      nama: 'Rizki Pratama',
      jabatan: 'Guru Seni',
      unit: 'SD',
      email: 'rizki.pratama@annur.sch.id',
      telepon: '081234567816',
      alamat: 'Jl. Kamboja No. 90, Jakarta',
      tanggalMasuk: '2022-08-01',
      status: 'Aktif',
      statusKerja: 'Honor',
      gajiPokok: 3500000,
      tunjangan: 500000
    },
    {
      id: '18',
      nipy: 'EMP018',
      nama: 'Fitri Handayani',
      jabatan: 'Pengasuh',
      unit: 'Daycare',
      email: 'fitri.handayani@annur.sch.id',
      telepon: '081234567817',
      alamat: 'Jl. Tulip No. 12, Jakarta',
      tanggalMasuk: '2021-12-15',
      status: 'Non-Aktif',
      statusKerja: 'Kontrak',
      gajiPokok: 3100000,
      tunjangan: 400000
    },
    {
      id: '19',
      nipy: 'EMP019',
      nama: 'Arief Budiman',
      jabatan: 'Guru Kimia',
      unit: 'SMA',
      email: 'arief.budiman@annur.sch.id',
      telepon: '081234567818',
      alamat: 'Jl. Violet No. 34, Jakarta',
      tanggalMasuk: '2018-11-10',
      status: 'Aktif',
      statusKerja: 'Tetap',
      gajiPokok: 4800000,
      tunjangan: 920000
    },
    {
      id: '20',
      nipy: 'EMP020',
      nama: 'Yunita Sari',
      jabatan: 'Cleaning Service',
      unit: 'Umum',
      email: 'yunita.sari@annur.sch.id',
      telepon: '081234567819',
      alamat: 'Jl. Lavender No. 56, Jakarta',
      tanggalMasuk: '2020-07-20',
      status: 'Aktif',
      statusKerja: 'Kontrak',
      gajiPokok: 2800000,
      tunjangan: 250000
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.nipy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.telepon.includes(searchTerm);
    const matchesUnit = !selectedUnit || emp.unit === selectedUnit;
    const matchesStatus = !selectedStatus || emp.status === selectedStatus;
    
    return matchesSearch && matchesUnit && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', employee?: Employee) => {
    setModalMode(mode);
    setSelectedEmployee(employee || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSaveEmployee = (employeeData: any) => {
    if (modalMode === 'create') {
      // Generate new ID and NIPY
      const newId = String(employees.length + 1);
      const newNIPY = employeeData.nipy || `EMP${String(employees.length + 1).padStart(3, '0')}`;
      
      const newEmployee: Employee = {
        id: newId,
        nipy: newNIPY,
        nama: employeeData.nama,
        jabatan: employeeData.jabatan,
        unit: 'SD', // Default atau bisa diambil dari form
        email: employeeData.email,
        telepon: employeeData.telepon,
        alamat: '', // Bisa ditambahkan ke form jika diperlukan
        tanggalMasuk: employeeData.tmt || new Date().toISOString().split('T')[0],
        status: 'Aktif',
        statusKerja: 'Tetap', // Default value
        gajiPokok: 3500000, // Default value
        tunjangan: 500000,   // Default value
        // Default values untuk field baru
        tempatLahir: 'Jakarta',
        tanggalLahir: '1990-01-01',
        pendidikanJurusan: 'Umum',
        pendidikanTitle: 'S1',
        statusPernikahan: 'Belum Menikah',
        tugasTambahan: '-',
        mapelDiampu: '-',
        jamMengajar: 0
      };
      
      setEmployees(prev => [...prev, newEmployee]);
    } else if (modalMode === 'edit' && selectedEmployee) {
      // Update existing employee
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === selectedEmployee.id 
            ? {
                ...emp,
                nama: employeeData.nama,
                nipy: employeeData.nipy || emp.nipy,
                jabatan: employeeData.jabatan,
                email: employeeData.email,
                telepon: employeeData.telepon,
                tanggalMasuk: employeeData.tmt || emp.tanggalMasuk
              }
            : emp
        )
      );
    }
    
    handleCloseModal();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: Employee['status']) => {
    const colors = {
      'Aktif': 'bg-green-100 text-green-800 border-green-200',
      'Non-Aktif': 'bg-red-100 text-red-800 border-red-200',
      'Cuti': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const getStatusKerjaBadge = (statusKerja: Employee['statusKerja']) => {
    const colors = {
      'Tetap': 'bg-blue-100 text-blue-800 border-blue-200',
      'Kontrak': 'bg-orange-100 text-orange-800 border-orange-200',
      'Honor': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[statusKerja]}`}>
        {statusKerja}
      </span>
    );
  };

  const calculateMasaKerja = (tanggalMasuk: string) => {
    const masuk = new Date(tanggalMasuk);
    const sekarang = new Date();
    const diffTime = Math.abs(sekarang.getTime() - masuk.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return months > 0 ? `${years} tahun ${months} bulan` : `${years} tahun`;
    } else {
      return `${months} bulan`;
    }
  };

  const getStatusPernikahanBadge = (status: 'Belum Menikah' | 'Menikah' | 'Cerai') => {
    const colors = {
      'Belum Menikah': 'bg-gray-100 text-gray-800 border-gray-200',
      'Menikah': 'bg-green-100 text-green-800 border-green-200',
      'Cerai': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: 'nipy',
      header: 'NIPY',
      render: (_: any, employee: Employee) => (
        <div className="font-bold text-slate-900 bg-slate-100 px-3 py-2 rounded-lg text-center">
          {employee.nipy}
        </div>
      )
    },
    {
      key: 'nama',
      header: 'Nama Lengkap',
      render: (_: any, employee: Employee) => (
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-lg">
            {employee.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-900 text-sm lg:text-base truncate">{employee.nama}</div>
            <div className="text-xs lg:text-sm text-slate-500 font-medium truncate">{employee.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'jabatan',
      header: 'Jabatan',
      render: (_: any, employee: Employee) => (
        <div>
          <div className="font-semibold text-slate-900 mb-1 text-xs lg:text-sm">{employee.jabatan}</div>
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {employee.unit}
          </div>
        </div>
      )
    },
    {
      key: 'telepon',
      header: 'No. Handphone',
      render: (_: any, employee: Employee) => (
        <div className="text-center">
          <div className="font-medium text-slate-900 text-sm bg-slate-50 px-3 py-2 rounded-lg">
            {employee.telepon}
          </div>
        </div>
      )
    },
    {
      key: 'statusKerja',
      header: 'Status Kerja',
      render: (_: any, employee: Employee) => (
        <div className="flex flex-col items-center gap-2">
          {getStatusKerjaBadge(employee.statusKerja)}
          {getStatusBadge(employee.status)}
        </div>
      )
    },
    {
      key: 'masaKerja',
      header: 'Masa Kerja',
      render: (_: any, employee: Employee) => (
        <div className="text-center">
          <div className="font-semibold text-slate-900 text-sm mb-1">
            {calculateMasaKerja(employee.tanggalMasuk)}
          </div>
          <div className="text-xs text-slate-500">
            Sejak {new Date(employee.tanggalMasuk).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_: any, employee: Employee) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => navigate(`/payroll/detail-karyawan/${employee.id}`)}
            className="p-1.5 lg:p-2 text-blue-600 hover:bg-blue-100 rounded-lg lg:rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
            title="Lihat Detail"
          >
            <EyeIcon className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <button
            onClick={() => handleOpenModal('edit', employee)}
            className="p-1.5 lg:p-2 text-amber-600 hover:bg-amber-100 rounded-lg lg:rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
            title="Edit Data"
          >
            <PencilIcon className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <button
            className="p-1.5 lg:p-2 text-red-600 hover:bg-red-100 rounded-lg lg:rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
            title="Hapus Data"
          >
            <TrashIcon className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <PayrollLayout>
      <div className="space-y-6 lg:space-y-8">
        {/* Modern Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Data Karyawan</h1>
              <p className="text-blue-100 text-base lg:text-lg">Kelola informasi dan data seluruh karyawan</p>
            </div>
            <div className="flex lg:hidden items-center justify-between bg-blue-500/30 rounded-xl p-4">
              <div className="text-center">
                <div className="text-xl font-bold">{employees.length}</div>
                <div className="text-blue-200 text-xs">Total</div>
              </div>
              <div className="w-px h-8 bg-blue-400"></div>
              <div className="text-center">
                <div className="text-xl font-bold">{employees.filter(emp => emp.status === 'Aktif').length}</div>
                <div className="text-blue-200 text-xs">Aktif</div>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{employees.length}</div>
                <div className="text-blue-200 text-sm">Total Karyawan</div>
              </div>
              <div className="w-px h-12 bg-blue-400"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">{employees.filter(emp => emp.status === 'Aktif').length}</div>
                <div className="text-blue-200 text-sm">Aktif</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="p-4 lg:p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-0">
              <div className="flex-1">
                <p className="text-xs lg:text-sm font-semibold text-blue-700 mb-1">Total Karyawan</p>
                <p className="text-xl lg:text-3xl font-bold text-blue-900">{employees.length}</p>
                <p className="text-xs text-blue-600 mt-1 hidden lg:block">Seluruh karyawan terdaftar</p>
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg mx-auto lg:mx-0">
                <UsersIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 lg:p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-0">
              <div className="flex-1">
                <p className="text-xs lg:text-sm font-semibold text-green-700 mb-1">Karyawan Aktif</p>
                <p className="text-xl lg:text-3xl font-bold text-green-900">
                  {employees.filter(emp => emp.status === 'Aktif').length}
                </p>
                <p className="text-xs text-green-600 mt-1 hidden lg:block">Sedang bekerja aktif</p>
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg mx-auto lg:mx-0">
                <BriefcaseIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 lg:p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-0">
              <div className="flex-1">
                <p className="text-xs lg:text-sm font-semibold text-amber-700 mb-1">Sedang Cuti</p>
                <p className="text-xl lg:text-3xl font-bold text-amber-900">
                  {employees.filter(emp => emp.status === 'Cuti').length}
                </p>
                <p className="text-xs text-amber-600 mt-1 hidden lg:block">Karyawan yang cuti</p>
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-amber-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg mx-auto lg:mx-0">
                <ChartBarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 lg:p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-0">
              <div className="flex-1">
                <p className="text-xs lg:text-sm font-semibold text-red-700 mb-1">Non-Aktif</p>
                <p className="text-xl lg:text-3xl font-bold text-red-900">
                  {employees.filter(emp => emp.status === 'Non-Aktif').length}
                </p>
                <p className="text-xs text-red-600 mt-1 hidden lg:block">Tidak aktif bekerja</p>
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg mx-auto lg:mx-0">
                <ExclamationTriangleIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="p-4 lg:p-6 border-0 shadow-xl bg-white backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 flex-1">
              <div className="relative flex-1 sm:max-w-xs lg:max-w-sm">
                <MagnifyingGlassIcon className="w-4 h-4 lg:w-5 lg:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 lg:pl-10 pr-4 py-2.5 lg:py-3 border-2 border-slate-200 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 w-full text-sm lg:text-base text-slate-700 placeholder-slate-400 transition-all duration-200 hover:border-slate-300"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="px-3 lg:px-4 py-2.5 lg:py-3 border-2 border-slate-200 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm lg:text-base text-slate-700 bg-white hover:border-slate-300 transition-all duration-200"
                >
                  <option value="">Semua Unit</option>
                  <option value="Manajemen">Manajemen</option>
                  <option value="Umum">Umum</option>
                  <option value="Daycare">Daycare</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 lg:px-4 py-2.5 lg:py-3 border-2 border-slate-200 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm lg:text-base text-slate-700 bg-white hover:border-slate-300 transition-all duration-200"
                >
                  <option value="">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                  <option value="Cuti">Cuti</option>
                </select>
              </div>
            </div>
            
            <Button
              onClick={() => handleOpenModal('create')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5" />
              Tambah Karyawan
            </Button>
          </div>
        </Card>

        {/* Enhanced Employee Table */}
        <Card className="border-0 shadow-xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 lg:p-6 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-0">
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-1">Data Karyawan</h3>
                <p className="text-xs lg:text-sm text-slate-600">
                  Informasi lengkap seluruh karyawan • 
                  <span className="font-medium text-blue-600 ml-1">{filteredEmployees.length} data</span>
                  {selectedUnit && <span className="ml-2 text-slate-500">• Unit {selectedUnit}</span>}
                </p>
              </div>
              <div className="flex lg:hidden items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Aktif</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Cuti</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Non-Aktif</span>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-600">Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-600">Cuti</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-slate-600">Non-Aktif</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <Table
              data={currentEmployees}
              columns={columns}
            />
          </div>
          
          {/* Modern Pagination */}
          {totalPages > 1 && (
            <div className="bg-slate-50 px-4 lg:px-6 py-4 border-t border-slate-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-0">
                <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-600 justify-center lg:justify-start">
                  <span className="hidden sm:inline">Menampilkan</span>
                  <span className="font-semibold text-slate-900">
                    {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)}
                  </span>
                  <span>dari</span>
                  <span className="font-semibold text-slate-900">{filteredEmployees.length}</span>
                  <span className="hidden sm:inline">data karyawan</span>
                </div>
                
                <div className="flex items-center gap-1 lg:gap-2 justify-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">‹</span>
                  </button>
                  
                  <div className="flex items-center gap-0.5 lg:gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 ${
                            currentPage === page
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">›</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Enhanced Modal for Employee Details */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'view' ? '' : modalMode === 'create' ? 'Tambah Karyawan Baru' : 'Edit Data Karyawan'}
        size={modalMode === 'view' ? 'lg' : '2xl'}
        showHeader={modalMode !== 'view'}
      >
        {modalMode === 'view' && selectedEmployee ? (
          <div className="space-y-6">
            {/* Modern Header Section */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 -mx-8 mt-0 mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {selectedEmployee.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedEmployee.nama}</h2>
                  <p className="text-blue-100 text-lg font-medium mb-2">{selectedEmployee.jabatan}</p>
                  <div className="flex items-center gap-3">
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {selectedEmployee.nipy}
                    </span>
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {selectedEmployee.unit}
                    </span>
                    {getStatusBadge(selectedEmployee.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Utama */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Data Utama
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-sm font-medium text-slate-600">Nama Lengkap</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.nama}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-sm font-medium text-slate-600">NIPY</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.nipy}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-sm font-medium text-slate-600">Jabatan</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.jabatan}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-sm font-medium text-slate-600">Unit</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.unit}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-sm font-medium text-slate-600">Status</span>
                    <div className="flex gap-2">
                      {getStatusBadge(selectedEmployee.status)}
                      {getStatusKerjaBadge(selectedEmployee.statusKerja)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informasi Kepegawaian */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Informasi Kepegawaian
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-green-200">
                    <span className="text-sm font-medium text-slate-600">TMT</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {new Date(selectedEmployee.tanggalMasuk).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-green-200">
                    <span className="text-sm font-medium text-slate-600">Masa Kerja</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {calculateMasaKerja(selectedEmployee.tanggalMasuk)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-green-200">
                    <span className="text-sm font-medium text-slate-600">Tugas Tambahan</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.tugasTambahan || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-green-200">
                    <span className="text-sm font-medium text-slate-600">Mapel yang Diampu</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.mapelDiampu || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-green-200">
                    <span className="text-sm font-medium text-slate-600">Jam Mengajar</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.jamMengajar || 0} jam/minggu</span>
                  </div>
                </div>
              </div>

              {/* Data Personal */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Data Personal
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-200">
                    <span className="text-sm font-medium text-slate-600">Tempat Lahir</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.tempatLahir || 'Jakarta'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-200">
                    <span className="text-sm font-medium text-slate-600">Tanggal Lahir</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {selectedEmployee.tanggalLahir ? new Date(selectedEmployee.tanggalLahir).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : '1 Januari 1990'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-200">
                    <span className="text-sm font-medium text-slate-600">Status Pernikahan</span>
                    <div className="text-sm font-semibold">
                      {getStatusPernikahanBadge(selectedEmployee.statusPernikahan || 'Belum Menikah')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-200">
                    <span className="text-sm font-medium text-slate-600">Email</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-200">
                    <span className="text-sm font-medium text-slate-600">Telepon</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.telepon}</span>
                  </div>
                </div>
              </div>

              {/* Pendidikan */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Pendidikan
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-orange-200">
                    <span className="text-sm font-medium text-slate-600">Title</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.pendidikanTitle || 'S1'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-orange-200">
                    <span className="text-sm font-medium text-slate-600">Jurusan</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.pendidikanJurusan || 'Umum'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-orange-200">
                    <span className="text-sm font-medium text-slate-600 block mb-1">Alamat</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedEmployee.alamat}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Information Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Informasi Gaji
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-emerald-200 text-center">
                  <p className="text-sm font-medium text-slate-600 mb-1">Gaji Pokok</p>
                  <p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedEmployee.gajiPokok)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-emerald-200 text-center">
                  <p className="text-sm font-medium text-slate-600 mb-1">Tunjangan</p>
                  <p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedEmployee.tunjangan)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-emerald-200 text-center">
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Pendapatan</p>
                  <p className="text-xl font-bold text-emerald-800">{formatCurrency(selectedEmployee.gajiPokok + selectedEmployee.tunjangan)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 pb-4">
              <Button 
                onClick={handleCloseModal}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                Tutup
              </Button>
              <Button 
                onClick={() => {
                  setModalMode('edit');
                }}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Edit Data
              </Button>
            </div>
          </div>
        ) : (modalMode === 'create' || modalMode === 'edit') ? (
          // Create/Edit Mode - Employee Form
          <EmployeeForm
            mode={modalMode}
            initialData={selectedEmployee ? {
              nama: selectedEmployee.nama,
              nipy: selectedEmployee.nipy || '',
              tmt: '',
              masaKerja: '',
              tempatLahir: '',
              tanggalLahir: '',
              statusPernikahan: '',
              pendidikanTitle: '',
              pendidikanJurusan: '',
              statusKerja: selectedEmployee.statusKerja || '',
              jabatan: selectedEmployee.jabatan,
              tugasTambahan: '',
              mapelMaster: '',
              jamMengajar: '',
              telepon: selectedEmployee.telepon,
              email: selectedEmployee.email,
              namaBank: '',
              nomorRekening: ''
            } : undefined}
            onSubmit={handleSaveEmployee}
            onCancel={handleCloseModal}
          />
        ) : null}
      </Modal>
    </PayrollLayout>
  );
};

export default DataKaryawan;
