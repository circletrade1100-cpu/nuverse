import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PayrollLayout from '../../components/Payroll/PayrollLayout';
import Button from '../../components/common/UI/Button';
import EmployeeForm from '../../components/Payroll/EmployeeFormFixed';
import {
  ArrowLeftIcon,
  UserIcon
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

const EditKaryawan: React.FC = () => {
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

  const handleSave = (employeeData: any) => {
    // Implementasi save - dalam praktik nyata kirim ke API
    console.log('Saving employee data:', employeeData);
    
    // Redirect ke halaman detail setelah save
    navigate(`/payroll/detail-karyawan/${id}`);
  };

  const handleCancel = () => {
    navigate(`/payroll/detail-karyawan/${id}`);
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
                  onClick={() => navigate(`/payroll/detail-karyawan/${id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Kembali
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Edit Data Karyawan</h1>
                  <p className="text-slate-600">Ubah informasi data karyawan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header Info */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 mb-8 text-white shadow-2xl">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                  {employee.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <UserIcon className="w-6 h-6 text-blue-200" />
                  <h2 className="text-2xl font-bold">Edit: {employee.nama}</h2>
                </div>
                <p className="text-blue-100 font-medium">{employee.jabatan} • {employee.unit}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {employee.nipy}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Form Edit Karyawan</h3>
                  <p className="text-slate-600 text-sm">Lengkapi formulir di bawah untuk mengubah data karyawan</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <EmployeeForm
                mode="edit"
                initialData={{
                  nama: employee.nama,
                  nipy: employee.nipy,
                  tmt: employee.tanggalMasuk,
                  masaKerja: '', // Akan dihitung otomatis
                  tempatLahir: employee.tempatLahir || '',
                  tanggalLahir: employee.tanggalLahir || '',
                  statusPernikahan: employee.statusPernikahan || '',
                  pendidikanTitle: employee.pendidikanTitle || '',
                  pendidikanJurusan: employee.pendidikanJurusan || '',
                  statusKerja: employee.statusKerja || '',
                  jabatan: employee.jabatan,
                  tugasTambahan: employee.tugasTambahan || '',
                  mapelMaster: employee.mapelDiampu || '',
                  jamMengajar: employee.jamMengajar?.toString() || '',
                  telepon: employee.telepon,
                  email: employee.email,
                  namaBank: '', // Tambahan jika ada di form
                  nomorRekening: '' // Tambahan jika ada di form
                }}
                onSubmit={handleSave}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
    </PayrollLayout>
  );
};

export default EditKaryawan;
