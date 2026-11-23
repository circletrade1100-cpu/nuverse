import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  BookOpen, 
  Users, 
  Edit,
  Camera,
  Save,
  Bell
} from 'lucide-react';
import { studentAuthService } from '../../services/studentAuthService';
import type { StudentProfile } from '../../services/studentAuthService';

const BiodataAnak: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [backendData, setBackendData] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [studentData, setStudentData] = useState({
    nama: "No Data",
    nis: "No Data",
    nisn: "No Data",
    kelas: "No Data",
    tempatLahir: "No Data",
    tanggalLahir: "No Data",
    jenisKelamin: "No Data",
    agama: "No Data",
    alamat: "No Data",
    namaAyah: "No Data",
    pekerjaanAyah: "No Data",
    namaIbu: "No Data",
    pekerjaanIbu: "No Data",
    noTelp: "No Data",
    email: "No Data",
    wali: "No Data",
    status: "No Data",
    unitSekolah: "No Data"
  });

  // Format tanggal ke format Indonesia
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "No Data";
    
    try {
      const date = new Date(dateString);
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    } catch {
      return dateString;
    }
  };

  // Load data from localStorage
  useEffect(() => {
    const data = studentAuthService.getStoredStudentData();
    if (data) {
      setBackendData(data);
      setStudentData({
        nama: data.nama_lengkap || "No Data",
        nis: data.nisn || "No Data", // Backend tidak punya NIS, pakai NISN
        nisn: data.nisn || "No Data",
        kelas: data.unit_kelas || "No Data",
        tempatLahir: data.tempat_lahir || "No Data",
        tanggalLahir: formatDate(data.tanggal_lahir),
        jenisKelamin: "No Data", // Field tidak ada di backend
        agama: "No Data", // Field tidak ada di backend
        alamat: data.alamat || "No Data",
        namaAyah: data.nama_ayah || "No Data",
        pekerjaanAyah: "No Data", // Field tidak ada di backend
        namaIbu: data.nama_ibu || "No Data",
        pekerjaanIbu: "No Data", // Field tidak ada di backend
        noTelp: data.nomor_hp || "No Data",
        email: data.email || "No Data",
        wali: "No Data", // Field tidak ada di backend
        status: data.status || "No Data",
        unitSekolah: data.unit_sekolah || "No Data"
      });
    } else {
      // Redirect ke login jika tidak ada data
      navigate('/parent/login');
    }
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(!isEditing);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSave = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // Konversi tanggal kembali ke format YYYY-MM-DD untuk backend
      const dateToISO = (dateStr: string): string | undefined => {
        if (dateStr === "No Data") return undefined;
        
        try {
          // Jika sudah format Indonesia, parse kembali
          const months: { [key: string]: string } = {
            'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
            'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
            'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
          };
          
          const parts = dateStr.split(' ');
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = months[parts[1]];
            const year = parts[2];
            
            if (month) {
              return `${year}-${month}-${day}`;
            }
          }
          
          return dateStr;
        } catch {
          return undefined;
        }
      };

      // Prepare data untuk backend
      const updateData = {
        nama_lengkap: studentData.nama !== "No Data" ? studentData.nama : undefined,
        email: studentData.email !== "No Data" ? studentData.email : undefined,
        tempat_lahir: studentData.tempatLahir !== "No Data" ? studentData.tempatLahir : undefined,
        tanggal_lahir: dateToISO(studentData.tanggalLahir),
        alamat: studentData.alamat !== "No Data" ? studentData.alamat : undefined,
        nama_ayah: studentData.namaAyah !== "No Data" ? studentData.namaAyah : undefined,
        nama_ibu: studentData.namaIbu !== "No Data" ? studentData.namaIbu : undefined,
        nomor_hp: studentData.noTelp !== "No Data" ? studentData.noTelp : undefined,
      };

      // Remove undefined values
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      const response = await studentAuthService.updateProfile(filteredData);

      if (response.success) {
        setSuccessMessage('Biodata berhasil diperbarui!');
        setIsEditing(false);
        
        // Update data di state
        if (response.data) {
          setBackendData(response.data.student);
          
          // Re-load data untuk refresh tampilan
          setStudentData({
            nama: response.data.student.nama_lengkap || "No Data",
            nis: response.data.student.nisn || "No Data",
            nisn: response.data.student.nisn || "No Data",
            kelas: response.data.student.unit_kelas || "No Data",
            tempatLahir: response.data.student.tempat_lahir || "No Data",
            tanggalLahir: formatDate(response.data.student.tanggal_lahir),
            jenisKelamin: "No Data",
            agama: "No Data",
            alamat: response.data.student.alamat || "No Data",
            namaAyah: response.data.student.nama_ayah || "No Data",
            pekerjaanAyah: "No Data",
            namaIbu: response.data.student.nama_ibu || "No Data",
            pekerjaanIbu: "No Data",
            noTelp: response.data.student.nomor_hp || "No Data",
            email: response.data.student.email || "No Data",
            wali: "No Data",
            status: response.data.student.status || "No Data",
            unitSekolah: response.data.student.unit_sekolah || "No Data"
          });
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.message || 'Gagal memperbarui biodata');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
        <div className="w-1 h-5 bg-blue-600 rounded-full mr-3"></div>
        {title}
      </h3>
      {children}
    </div>
  );

  const InfoRow = ({ label, value, field, icon: Icon }: { 
    label: string; 
    value: string; 
    field?: string; 
    icon?: React.ElementType 
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      {isEditing && field ? (
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="text-sm text-gray-800 font-medium bg-gray-50 px-2 py-1 rounded border-none outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <span className="text-sm text-gray-800 font-medium">{value}</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/parent/dashboard')}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white text-xl font-semibold">Biodata Anak</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigate('/parent/notifikasi')}
              className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Bell className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            </button>
            <button 
              onClick={isEditing ? handleSave : handleEdit}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white text-sm font-medium">Menyimpan...</span>
                </>
              ) : isEditing ? (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Simpan</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Edit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center justify-between">
            <span className="text-sm">{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="text-green-700 hover:text-green-900">
              ✕
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center justify-between">
            <span className="text-sm">{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="text-red-700 hover:text-red-900">
              ✕
            </button>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {backendData?.avatar ? (
                <img 
                  src={`https://nurverse.id/manajemen-annur/backend/public/storage/${backendData.avatar}`}
                  alt={studentData.nama}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{studentData.nama}</h2>
              <p className="text-gray-600">NISN: {studentData.nisn}</p>
              <p className="text-gray-600">Kelas {studentData.kelas}</p>
            </div>
          </div>
        </div>

        {/* Data Pribadi */}
        <InfoCard title="Data Pribadi">
          <InfoRow label="Nama Lengkap" value={studentData.nama} field="nama" icon={User} />
          <InfoRow label="NIS" value={studentData.nis} field="nis" />
          <InfoRow label="NISN" value={studentData.nisn} field="nisn" />
          <InfoRow label="Kelas" value={studentData.kelas} field="kelas" icon={BookOpen} />
          <InfoRow label="Tempat Lahir" value={studentData.tempatLahir} field="tempatLahir" icon={MapPin} />
          <InfoRow label="Tanggal Lahir" value={studentData.tanggalLahir} field="tanggalLahir" icon={Calendar} />
          <InfoRow label="Jenis Kelamin" value={studentData.jenisKelamin} field="jenisKelamin" />
          <InfoRow label="Agama" value={studentData.agama} field="agama" />
        </InfoCard>

        {/* Alamat */}
        <InfoCard title="Alamat">
          <InfoRow label="Alamat Lengkap" value={studentData.alamat} field="alamat" icon={MapPin} />
        </InfoCard>

        {/* Data Orang Tua */}
        <InfoCard title="Data Orang Tua">
          <InfoRow label="Nama Ayah" value={studentData.namaAyah} field="namaAyah" icon={Users} />
          <InfoRow label="Pekerjaan Ayah" value={studentData.pekerjaanAyah} field="pekerjaanAyah" />
          <InfoRow label="Nama Ibu" value={studentData.namaIbu} field="namaIbu" icon={Users} />
          <InfoRow label="Pekerjaan Ibu" value={studentData.pekerjaanIbu} field="pekerjaanIbu" />
          <InfoRow label="Wali" value={studentData.wali} field="wali" />
        </InfoCard>

        {/* Kontak */}
        <InfoCard title="Informasi Kontak">
          <InfoRow label="No. Telepon" value={studentData.noTelp} field="noTelp" icon={Phone} />
          <InfoRow label="Email" value={studentData.email} field="email" icon={Mail} />
        </InfoCard>

        {/* Status Akademik */}
        <InfoCard title="Status Akademik">
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-600">Status</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${studentData.status === 'Aktif' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className={`text-sm font-medium ${studentData.status === 'Aktif' ? 'text-green-600' : 'text-gray-600'}`}>
                {studentData.status}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-600">Unit Sekolah</span>
            <span className="text-sm text-gray-800 font-medium">{studentData.unitSekolah}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-600">Tahun Ajaran</span>
            <span className="text-sm text-gray-800 font-medium">2024/2025</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-600">Semester</span>
            <span className="text-sm text-gray-800 font-medium">Ganjil</span>
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default BiodataAnak;
