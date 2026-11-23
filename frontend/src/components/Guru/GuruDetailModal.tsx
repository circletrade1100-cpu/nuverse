import React from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, Clock, Award, Users, BookOpen, DollarSign } from 'lucide-react';
import type { Guru } from '../../types/guru';

interface GuruDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  guru: Guru | null;
  onEdit?: (guru: Guru) => void;
}

const GuruDetailModal: React.FC<GuruDetailModalProps> = ({
  isOpen,
  onClose,
  guru,
  onEdit,
}) => {
  if (!isOpen || !guru) return null;

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateMasaKerja = (tmtDate: string) => {
    const today = new Date();
    const tmt = new Date(tmtDate);
    
    // If TMT is in the future
    if (today < tmt) {
      return "0 bulan";
    }
    
    // Simple and reliable calculation
    let years = today.getFullYear() - tmt.getFullYear();
    let months = today.getMonth() - tmt.getMonth();
    let days = today.getDate() - tmt.getDate();
    
    // Adjust for negative days
    if (days < 0) {
      months--;
      // Get days in previous month
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // If less than 1 month, calculate days
    if (years === 0 && months === 0) {
      const diffTime = today.getTime() - tmt.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return "1 hari";
      } else if (diffDays < 30) {
        return `${diffDays} hari`;
      } else {
        return "1 bulan";
      }
    }
    
    if (years > 0) {
      return months > 0 ? `${years} tahun ${months} bulan` : `${years} tahun`;
    } else {
      return `${months} bulan`;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'Aktif': 'bg-green-100 text-green-800 border-green-200',
      'Non-Aktif': 'bg-red-100 text-red-800 border-red-200',
      'Pensiun': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRupiah = (amount: number | undefined) => {
    if (!amount) return 'Rp 0';
    return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 rounded-t-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
                {guru.avatar ? (
                  <img
                    src={guru.avatar}
                    alt={guru.namaLengkap}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 md:w-16 md:h-16 text-white/70" />
                )}
              </div>
              {getStatusBadge(guru.status)}
            </div>
            
            {/* Basic Info */}
            <div className="text-center md:text-left text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{guru.namaLengkap}</h2>
              <p className="text-lg md:text-xl text-blue-100 mb-1">{guru.jabatan}</p>
              <p className="text-blue-200">NIP: {guru.nip}</p>
              <p className="text-blue-200">{guru.unitKerja}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Informasi Pribadi
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tempat, Tanggal Lahir</p>
                    <p className="text-gray-900">
                      {guru.tempatLahir}, {formatDate(guru.tanggalLahir)}
                    </p>
                    <p className="text-sm text-gray-500">({calculateAge(guru.tanggalLahir)} tahun)</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status Pernikahan</p>
                    <p className="text-gray-900">{guru.statusPernikahan}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{guru.email || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">No. Telepon</p>
                    <p className="text-gray-900">{guru.noTelepon || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Alamat</p>
                    <p className="text-gray-900">{guru.alamat || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-gray-600" />
                Informasi Kepegawaian
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Award className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Jabatan</p>
                    <p className="text-gray-900">{guru.jabatan}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">TMT (Tanggal Mulai Tugas)</p>
                    <p className="text-gray-900">{formatDate(guru.tmt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Masa Kerja</p>
                    <p className="text-gray-900">{guru.masaKerja || calculateMasaKerja(guru.tmt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Unit Kerja</p>
                    <p className="text-gray-900">{guru.unitKerja}</p>
                  </div>
                </div>
                
                {guru.tugasTambahan && (
                  <div className="flex items-start">
                    <Award className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tugas Tambahan</p>
                      <p className="text-blue-600 font-medium">{guru.tugasTambahan}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Education Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-gray-600" />
                Riwayat Pendidikan
              </h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {guru.pendidikan.jenjang}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{guru.pendidikan.jurusan}</p>
                </div>
              </div>
            </div>

            {/* Teaching Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-gray-600" />
                Informasi Mengajar
              </h3>
              
              <div className="space-y-4">
                {guru.mapelDiampu && guru.mapelDiampu.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Mata Pelajaran yang Diampu</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(guru.mapelDiampu) ? guru.mapelDiampu.map((mapel, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full"
                        >
                          {mapel}
                        </span>
                      )) : <span className="text-gray-500">{guru.mapelDiampu || 'Tidak ada'}</span>}
                    </div>
                  </div>
                )}
                
                {guru.jamMengajar && (
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Jam Mengajar per Minggu</p>
                      <p className="text-gray-900">{guru.jamMengajar} jam</p>
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((guru.jamMengajar / 40) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round((guru.jamMengajar / 40) * 100)}% dari maksimal 40 jam
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Payroll Information */}
            <div className="lg:col-span-2 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-gray-600" />
                Informasi Payroll
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Gaji Pokok</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.gajiPokok)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Tunjangan Jabatan</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.tunjanganJabatan)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Tunjangan Masa Kerja</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.tunjanganMasaKerja)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Wali Kelas</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.waliKelas)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Koordinator</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.koordinator)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Tatap Muka</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.tatapMuka)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">T. Muka Pengganti</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.tMukaPengganti)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Tunjangan Keluarga</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.tunjKeluarga)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Transport 1</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.transport1)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Transport 2</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.transport2)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Makan</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.makan)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Jamsostek</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.jamsostek)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Overtime</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.overtime)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Pramuka</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.pramuka)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Tunjangan Lain</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.tunjLain)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Ekskul</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.ekskul)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">BPJS</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.bpjs)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Bimbel</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.bimbel)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Proyek</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.proyek)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Insentif Peng. Pramuka</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.insentifPengPramuka)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Insentif Peng. Ekskul</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.insentifPengEkskul)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Insentif Peng. Proyek</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.insentifPengProyek)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Insentif Pengurus Bimbel</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(guru.insentifPengurusBimbel)}</p>
                </div>
              </div>

              {/* Total Gaji */}
              <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-green-800">Total Gaji Kotor</p>
                  <p className="text-xl font-bold text-green-900">
                    {formatRupiah(
                      (guru.gajiPokok || 0) +
                      (guru.tunjanganJabatan || 0) +
                      (guru.tunjanganMasaKerja || 0) +
                      (guru.waliKelas || 0) +
                      (guru.koordinator || 0) +
                      (guru.tatapMuka || 0) +
                      (guru.tMukaPengganti || 0) +
                      (guru.tunjKeluarga || 0) +
                      (guru.transport1 || 0) +
                      (guru.transport2 || 0) +
                      (guru.makan || 0) +
                      (guru.jamsostek || 0) +
                      (guru.overtime || 0) +
                      (guru.pramuka || 0) +
                      (guru.tunjLain || 0) +
                      (guru.ekskul || 0) +
                      (guru.bpjs || 0) +
                      (guru.bimbel || 0) +
                      (guru.proyek || 0) +
                      (guru.insentifPengPramuka || 0) +
                      (guru.insentifPengEkskul || 0) +
                      (guru.insentifPengProyek || 0) +
                      (guru.insentifPengurusBimbel || 0)
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Information */}
            {(guru.namaBank || guru.noRekening) && (
              <div className="lg:col-span-2 bg-amber-50 rounded-lg p-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-amber-600" />
                  Informasi Bank
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-amber-300">
                    <p className="text-xs font-medium text-gray-500 mb-1">Nama Bank</p>
                    <p className="text-sm font-semibold text-gray-900">{guru.namaBank || '-'}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-amber-300">
                    <p className="text-xs font-medium text-gray-500 mb-1">No Rekening Bank</p>
                    <p className="text-sm font-semibold text-gray-900">{guru.noRekening || '-'}</p>
                  </div>
                </div>

                {guru.namaBank === 'Tunai' && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      💰 Pembayaran dilakukan secara tunai
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{guru.jamMengajar || 0}</div>
              <div className="text-sm text-blue-600">Jam/Minggu</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{guru.mapelDiampu?.length || 0}</div>
              <div className="text-sm text-green-600">Mata Pelajaran</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{calculateAge(guru.tanggalLahir)}</div>
              <div className="text-sm text-purple-600">Tahun</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{guru.masaKerja.split(' ')[0]}</div>
              <div className="text-sm text-orange-600">Tahun Mengajar</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Tutup
          </button>
          {onEdit && (
            <button 
              onClick={() => onEdit(guru)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuruDetailModal;
