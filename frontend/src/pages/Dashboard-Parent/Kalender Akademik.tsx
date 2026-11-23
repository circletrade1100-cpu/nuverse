import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Plus,
  Bell,
  BookOpen,
  Award,
  AlertCircle
} from 'lucide-react';
import { cmsParentService } from '../../services/cmsParentService';
import type { CalendarEvent } from '../../types/cmsParent';

const KalenderAkademik: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events dari CMS
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await cmsParentService.getPublicCalendarEvents();
      if (response.success && response.data) {
        // Transform data dari API ke format yang digunakan di halaman
        const transformedEvents = response.data.map((event: CalendarEvent) => ({
          id: event.id,
          title: event.title,
          date: event.start_date,
          endDate: event.end_date || undefined,
          time: event.start_time && event.end_time 
            ? `${event.start_time.substring(0, 5)} - ${event.end_time.substring(0, 5)}`
            : event.start_time 
            ? event.start_time.substring(0, 5)
            : 'Sepanjang Hari',
          type: event.event_type,
          description: event.description || '',
          location: event.location || '-',
          priority: event.priority
        }));
        setEvents(transformedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsByDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      if (event.endDate) {
        return dateString >= event.date && dateString <= event.endDate;
      }
      return event.date === dateString;
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'akademik': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'kegiatan': return 'bg-green-100 text-green-700 border-green-200';
      case 'libur': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'kompetisi': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

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
            <h1 className="text-white text-xl font-semibold">Kalender Akademik</h1>
          </div>
          <button 
            onClick={() => navigate('/parent/notifikasi')}
            className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Bell className="w-5 h-5 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-white/10 rounded-2xl p-1 backdrop-blur-sm">
          {['month', 'week', 'day'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`flex-1 py-2 text-center rounded-xl transition-colors ${
                viewMode === mode 
                  ? 'bg-white text-blue-600 font-semibold' 
                  : 'text-white/80'
              }`}
            >
              {mode === 'month' && 'Bulan'}
              {mode === 'week' && 'Minggu'}
              {mode === 'day' && 'Hari'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 -mt-4">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Acara Mendatang</h3>
            <button className="text-blue-600 text-sm font-medium">Lihat Semua</button>
          </div>
          
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className={`p-3 rounded-xl border-l-4 ${getPriorityColor(event.priority)} bg-gray-50`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-1">{event.title}</h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                  </div>
                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Bell className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigateMonth('prev')}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={() => navigateMonth('next')}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {getDaysInMonth(currentDate).map((day, index) => {
              const dayEvents = getEventsByDate(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === day.toDateString();
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`relative p-2 text-sm rounded-lg transition-colors ${
                    !isCurrentMonth 
                      ? 'text-gray-300' 
                      : isSelected
                      ? 'bg-blue-600 text-white'
                      : isToday
                      ? 'bg-blue-100 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{day.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                      {dayEvents.slice(0, 3).map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-blue-600'
                        }`}></div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              Acara pada {selectedDate.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </h3>
            
            {getEventsByDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getEventsByDate(selectedDate).map((event) => (
                  <div key={event.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-1">{event.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Tidak ada acara pada tanggal ini</p>
              </div>
            )}
          </div>
        )}

        {/* Event Categories */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mt-6">
          <h3 className="font-semibold text-gray-800 mb-4">Kategori Acara</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Akademik</p>
                <p className="text-sm text-blue-600">
                  {events.filter(e => e.type === 'akademik').length} acara
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Kegiatan</p>
                <p className="text-sm text-green-600">
                  {events.filter(e => e.type === 'kegiatan').length} acara
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-medium text-purple-800">Kompetisi</p>
                <p className="text-sm text-purple-600">
                  {events.filter(e => e.type === 'kompetisi').length} acara
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">Libur</p>
                <p className="text-sm text-orange-600">
                  {events.filter(e => e.type === 'libur').length} hari
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KalenderAkademik;
