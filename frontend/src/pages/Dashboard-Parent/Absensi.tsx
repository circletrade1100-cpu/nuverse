import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  MapPin,
  Bell
} from 'lucide-react';

const Absensi: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [selectedFilter, setSelectedFilter] = useState('semua');

  const absensiData = [
    { date: '2024-01-15', status: 'hadir', time: '07:30', keterangan: 'Tepat waktu' },
    { date: '2024-01-16', status: 'hadir', time: '07:45', keterangan: 'Terlambat 15 menit' },
    { date: '2024-01-17', status: 'sakit', time: '-', keterangan: 'Sakit demam' },
    { date: '2024-01-18', status: 'hadir', time: '07:25', keterangan: 'Tepat waktu' },
    { date: '2024-01-19', status: 'izin', time: '-', keterangan: 'Acara keluarga' },
    { date: '2024-01-22', status: 'hadir', time: '07:35', keterangan: 'Tepat waktu' },
    { date: '2024-01-23', status: 'alpha', time: '-', keterangan: 'Tanpa keterangan' },
    { date: '2024-01-24', status: 'hadir', time: '07:20', keterangan: 'Tepat waktu' },
  ];

  const statistik = {
    hadir: absensiData.filter(item => item.status === 'hadir').length,
    sakit: absensiData.filter(item => item.status === 'sakit').length,
    izin: absensiData.filter(item => item.status === 'izin').length,
    alpha: absensiData.filter(item => item.status === 'alpha').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir': return 'text-green-600 bg-green-100';
      case 'sakit': return 'text-yellow-600 bg-yellow-100';
      case 'izin': return 'text-blue-600 bg-blue-100';
      case 'alpha': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hadir': return <CheckCircle className="w-4 h-4" />;
      case 'sakit': return <AlertCircle className="w-4 h-4" />;
      case 'izin': return <Clock className="w-4 h-4" />;
      case 'alpha': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()]
    };
  };

  const filteredData = selectedFilter === 'semua' 
    ? absensiData 
    : absensiData.filter(item => item.status === selectedFilter);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/parent/dashboard')}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white text-xl font-semibold">Absensi</h1>
          </div>
          <button 
            onClick={() => navigate('/parent/notifikasi')}
            className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Bell className="w-5 h-5 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          </button>
        </div>

        {/* Student Info */}
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">AF</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">Ahmad Fadli</h3>
              <p className="text-blue-100 text-sm">Kelas 5A - MI An-Nur</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{statistik.hadir}</p>
            <p className="text-xs text-gray-600">Hadir</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{statistik.sakit}</p>
            <p className="text-xs text-gray-600">Sakit</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{statistik.izin}</p>
            <p className="text-xs text-gray-600">Izin</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{statistik.alpha}</p>
            <p className="text-xs text-gray-600">Alpha</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Filter & Pencarian</h3>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari tanggal..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="sakit">Sakit</option>
              <option value="izin">Izin</option>
              <option value="alpha">Alpha</option>
            </select>
            
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Riwayat Absensi</h3>
            <span className="text-sm text-gray-600">{filteredData.length} record</span>
          </div>

          <div className="space-y-3">
            {filteredData.map((item, index) => {
              const dateInfo = formatDate(item.date);
              return (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs text-gray-600">{dateInfo.day}</p>
                    <p className="text-lg font-bold text-gray-800">{dateInfo.date}</p>
                    <p className="text-xs text-gray-600">{dateInfo.month}</p>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="text-xs font-medium capitalize">{item.status}</span>
                      </div>
                      {item.time !== '-' && (
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{item.time}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{item.keterangan}</p>
                  </div>

                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mt-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Lokasi Absensi</h4>
              <p className="text-sm text-gray-600">MI An-Nur, Jakarta Selatan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Absensi;
