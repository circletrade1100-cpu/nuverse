import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PayrollLayout from '../../components/Payroll/PayrollLayout';
import Button from '../../components/common/UI/Button';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PhotoIcon,
  EllipsisVerticalIcon
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
  tempatLahir?: string;
  tanggalLahir?: string;
  pendidikanJurusan?: string;
  pendidikanTitle?: string;
  statusPernikahan?: 'Belum Menikah' | 'Menikah' | 'Cerai';
  tugasTambahan?: string;
  mapelDiampu?: string;
  jamMengajar?: number;
}

const DetailKaryawan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Scroll ke atas saat halaman dimuat
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Mock data - dalam implementasi nyata, ambil dari API berdasarkan ID
  const employee: Employee = {
    id: '1',
    nipy: 'EMP001',
    nama: 'Ahmad Fauzi',
    jabatan: 'Guru Matematika',
    unit: 'SMA',
    email: 'ahmad.fauzi@annur.sch.id',
    telepon: '081234567890',
    alamat: 'Jl. Merdeka No. 123, Jakarta Selatan',
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
  };

  const getStatusBadge = (status: Employee['status']) => {
    const colors = {
      'Aktif': 'bg-green-100 text-green-800 border-green-200',
      'Non-Aktif': 'bg-red-100 text-red-800 border-red-200',
      'Cuti': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${colors[status]}`}>
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${colors[statusKerja]}`}>
        {statusKerja}
      </span>
    );
  };

  const getStatusPernikahanBadge = (status: 'Belum Menikah' | 'Menikah' | 'Cerai') => {
    const colors = {
      'Belum Menikah': 'bg-gray-100 text-gray-800 border-gray-200',
      'Menikah': 'bg-green-100 text-green-800 border-green-200',
      'Cerai': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${colors[status]}`}>
        {status}
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <PayrollLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header dengan Back Button */}
        <div className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate('/payroll/data-karyawan')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Kembali
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Detail Karyawan</h1>
                  <p className="text-slate-600">Informasi lengkap data karyawan</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => navigate(`/payroll/edit-karyawan/${id}`)}
                  className="group relative overflow-hidden flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <PencilIcon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 font-medium">Edit Data</span>
                </Button>
                
                <div className="relative">
                  <Button className="group relative overflow-hidden flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-slate-300">
                    <EllipsisVerticalIcon className="w-5 h-5" />
                    <span className="font-medium">Lainnya</span>
                  </Button>
                  
                  {/* Dropdown menu - bisa dikembangkan jadi component terpisah */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left">
                        <TrashIcon className="w-4 h-4" />
                        <span className="font-medium">Hapus Karyawan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header Card */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 mb-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl">
                    {employee.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-4xl font-bold mb-2">{employee.nama}</h2>
                  <p className="text-xl text-blue-100 font-medium mb-3">{employee.jabatan}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {employee.nipy}
                    </span>
                    <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {employee.unit}
                    </span>
                    {getStatusBadge(employee.status)}
                    {getStatusKerjaBadge(employee.statusKerja)}
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-6 h-6 text-blue-200" />
                      <div>
                        <p className="text-blue-200 text-sm">TMT</p>
                        <p className="font-semibold">
                          {new Date(employee.tanggalMasuk).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <ClockIcon className="w-6 h-6 text-blue-200" />
                      <div>
                        <p className="text-blue-200 text-sm">Masa Kerja</p>
                        <p className="font-semibold">{calculateMasaKerja(employee.tanggalMasuk)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <BriefcaseIcon className="w-6 h-6 text-blue-200" />
                      <div>
                        <p className="text-blue-200 text-sm">Jam Mengajar</p>
                        <p className="font-semibold">{employee.jamMengajar || 0} jam/minggu</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Data Utama */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Data Utama</h3>
                    <p className="text-slate-600 text-sm">Informasi dasar karyawan</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">Nama Lengkap</label>
                    <p className="text-lg font-semibold text-slate-900">{employee.nama}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">NIPY</label>
                    <p className="text-lg font-semibold text-slate-900">{employee.nipy}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">Jabatan</label>
                    <p className="text-lg font-semibold text-slate-900">{employee.jabatan}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">Unit</label>
                    <p className="text-lg font-semibold text-slate-900">{employee.unit}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-3 block">Status</label>
                  <div className="flex gap-3">
                    {getStatusBadge(employee.status)}
                    {getStatusKerjaBadge(employee.statusKerja)}
                  </div>
                </div>
              </div>
            </div>

            {/* Informasi Kepegawaian */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-green-100 px-8 py-6 border-b border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center">
                    <BriefcaseIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Informasi Kepegawaian</h3>
                    <p className="text-slate-600 text-sm">Detail pekerjaan dan tugas</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">TMT</label>
                    <p className="text-lg font-semibold text-slate-900">
                      {new Date(employee.tanggalMasuk).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">Masa Kerja</label>
                    <p className="text-lg font-semibold text-slate-900">{calculateMasaKerja(employee.tanggalMasuk)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-2 block">Tugas Tambahan</label>
                  <p className="text-lg font-semibold text-slate-900">{employee.tugasTambahan || '-'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-2 block">Mapel yang Diampu</label>
                  <p className="text-lg font-semibold text-slate-900">{employee.mapelDiampu || '-'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-2 block">Jam Mengajar</label>
                  <p className="text-lg font-semibold text-slate-900">{employee.jamMengajar || 0} jam/minggu</p>
                </div>
              </div>
            </div>

            {/* Data Personal */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-8 py-6 border-b border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-2xl flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Data Personal</h3>
                    <p className="text-slate-600 text-sm">Informasi pribadi</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">Tempat Lahir</label>
                    <p className="text-lg font-semibold text-slate-900">{employee.tempatLahir || 'Jakarta'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">Tanggal Lahir</label>
                    <p className="text-lg font-semibold text-slate-900">
                      {employee.tanggalLahir ? new Date(employee.tanggalLahir).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : '1 Januari 1990'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-3 block">Status Pernikahan</label>
                  {getStatusPernikahanBadge(employee.statusPernikahan || 'Belum Menikah')}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                    <EnvelopeIcon className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Email</p>
                      <p className="font-semibold text-slate-900">{employee.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                    <PhoneIcon className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Telepon</p>
                      <p className="font-semibold text-slate-900">{employee.telepon}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
                    <MapPinIcon className="w-5 h-5 text-slate-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Alamat</p>
                      <p className="font-semibold text-slate-900">{employee.alamat}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pendidikan */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-8 py-6 border-b border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Pendidikan</h3>
                    <p className="text-slate-600 text-sm">Riwayat pendidikan</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">Jenjang</label>
                    <p className="text-lg font-semibold text-slate-900">{employee.pendidikanTitle || 'S1'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">Jurusan</label>
                    <p className="text-lg font-semibold text-slate-900">{employee.pendidikanJurusan || 'Umum'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File Dokumen */}
          <div className="mt-8">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-8 py-6 border-b border-indigo-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">File Dokumen</h3>
                    <p className="text-slate-600 text-sm">Dokumen pendukung karyawan</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* CV/Resume */}
                  <div className="group bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                        <DocumentTextIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">CV / Resume</h4>
                        <p className="text-sm text-slate-600">PDF • 2.3 MB</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 bg-white/70 px-3 py-2 rounded-lg">
                      Diupload: 15 Jan 2020
                    </div>
                  </div>

                  {/* KTP */}
                  <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                        <PhotoIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">KTP</h4>
                        <p className="text-sm text-slate-600">JPEG • 1.8 MB</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 bg-white/70 px-3 py-2 rounded-lg">
                      Diupload: 15 Jan 2020
                    </div>
                  </div>

                  {/* Ijazah */}
                  <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Ijazah S1</h4>
                        <p className="text-sm text-slate-600">PDF • 3.1 MB</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 bg-white/70 px-3 py-2 rounded-lg">
                      Diupload: 15 Jan 2020
                    </div>
                  </div>

                  {/* Sertifikat */}
                  <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                        <DocumentTextIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Sertifikat Pendidik</h4>
                        <p className="text-sm text-slate-600">PDF • 1.5 MB</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 bg-white/70 px-3 py-2 rounded-lg">
                      Diupload: 20 Mar 2020
                    </div>
                  </div>

                  {/* Foto */}
                  <div className="group bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                        <PhotoIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Pas Foto</h4>
                        <p className="text-sm text-slate-600">JPEG • 0.8 MB</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 bg-white/70 px-3 py-2 rounded-lg">
                      Diupload: 15 Jan 2020
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="group bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-dashed border-slate-300 hover:border-slate-400 transition-all duration-300 cursor-pointer">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <DocumentTextIcon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-700 mb-2">Upload Dokumen</h4>
                      <p className="text-sm text-slate-500">Klik untuk menambah dokumen baru</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="mt-8">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-8 border border-emerald-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                  <BuildingOfficeIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Informasi Gaji</h3>
                  <p className="text-slate-600">Detail kompensasi dan tunjangan</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <p className="text-sm font-medium text-slate-600 mb-2">Gaji Pokok</p>
                  <p className="text-3xl font-bold text-emerald-700">{formatCurrency(employee.gajiPokok)}</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <p className="text-sm font-medium text-slate-600 mb-2">Tunjangan</p>
                  <p className="text-3xl font-bold text-emerald-700">{formatCurrency(employee.tunjangan)}</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <p className="text-sm font-medium text-slate-600 mb-2">Total Pendapatan</p>
                  <p className="text-3xl font-bold text-emerald-800">{formatCurrency(employee.gajiPokok + employee.tunjangan)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PayrollLayout>
  );
};

export default DetailKaryawan;
