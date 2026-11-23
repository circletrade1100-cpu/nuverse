import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  BellIcon, 
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return { dayName, day, month, year };
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const { dayName, day, month, year } = formatDate(currentTime);
  const timeString = formatTime(currentTime);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-2 sm:px-4 lg:px-6 xl:px-8 py-3 lg:py-4 container-responsive">
      <div className="w-full mx-auto container-adaptive flex items-center justify-between" style={{
        maxWidth: 'min(100vw - 2rem, 1536px)'
      }}>
        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:gap-4">
          <label htmlFor="my-drawer-2" className="lg:hidden btn btn-ghost btn-sm">
            <Bars3Icon className="w-5 h-5 text-slate-600" />
          </label>
          
          {/* Date and Time Display */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {/* Date Section */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-100">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{dayName}</p>
                <p className="text-xs text-slate-600">{day} {month} {year}</p>
              </div>
            </div>

            {/* Time Section */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 rounded-xl border border-emerald-100">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 font-mono tracking-wider">{timeString}</p>
                <p className="text-xs text-slate-600">WIB</p>
              </div>
            </div>
          </div>

          {/* Mobile Date Time - Compact */}
          <div className="lg:hidden flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-700">{dayName}</p>
              <p className="text-xs text-slate-500">{day}/{currentTime.getMonth() + 1}</p>
            </div>
            <div className="w-px h-6 bg-slate-300"></div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-700 font-mono">{timeString.slice(0, 5)}</p>
              <p className="text-xs text-slate-500">WIB</p>
            </div>
          </div>
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notifications */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm lg:btn-md hover:bg-slate-100">
              <div className="indicator">
                <BellIcon className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600" />
                <span className="badge badge-xs bg-blue-500 border-blue-500 text-white indicator-item">3</span>
              </div>
            </div>
            <div tabIndex={0} className="mt-3 z-[1] card card-compact dropdown-content w-72 lg:w-80 bg-white shadow-xl border border-slate-200 rounded-xl mr-4 lg:mr-0">
              <div className="card-body p-4">
                <h3 className="font-bold text-slate-800 text-sm lg:text-base">3 Notifikasi</h3>
                <div className="space-y-2">
                  <div className="p-2 hover:bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Ada tagihan yang jatuh tempo</p>
                    <p className="text-xs text-slate-400">2 menit lalu</p>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn btn-primary btn-block btn-sm">Lihat semua</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* User menu */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm lg:btn-md avatar hover:bg-slate-100">
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white text-xs lg:text-sm font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-white rounded-xl w-48 lg:w-52 border border-slate-200 mr-4 lg:mr-0">
              <li>
                <a className="justify-between hover:bg-slate-50 text-slate-700 text-sm">
                  Profile
                  <span className="badge badge-sm bg-blue-100 text-blue-600 border-blue-200">New</span>
                </a>
              </li>
              <li><a className="hover:bg-slate-50 text-slate-700 text-sm">Settings</a></li>
              <li><a onClick={handleLogout} className="hover:bg-slate-50 text-slate-700 text-sm cursor-pointer">Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
