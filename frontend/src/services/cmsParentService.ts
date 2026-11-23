import { api } from './api';
import type {
  CalendarEvent,
  CalendarEventFormData,
  Announcement,
  AnnouncementFormData,
  Banner,
  BannerFormData,
} from '../types/cmsParent';

class CMSParentService {
  // ==================== CALENDAR EVENTS ====================
  
  async getCalendarEvents(params?: {
    search?: string;
    event_type?: string;
    priority?: string;
    is_active?: boolean;
    date_from?: string;
    date_to?: string;
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/cms-parent/calendar-events', { params });
    return response.data;
  }

  async getCalendarEvent(id: number) {
    const response = await api.get(`/cms-parent/calendar-events/${id}`);
    return response.data;
  }

  async createCalendarEvent(data: CalendarEventFormData) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if (key === 'document' && value instanceof File) {
          formData.append('document', value);
        } else if (key !== 'document') {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post('/cms-parent/calendar-events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async updateCalendarEvent(id: number, data: Partial<CalendarEventFormData>) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if (key === 'document' && value instanceof File) {
          formData.append('document', value);
        } else if (key !== 'document') {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post(`/cms-parent/calendar-events/${id}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        '_method': 'PUT'
      }
    });
    return response.data;
  }

  async deleteCalendarEvent(id: number) {
    const response = await api.delete(`/cms-parent/calendar-events/${id}`);
    return response.data;
  }

  // Public route (no auth required)
  async getPublicCalendarEvents(params?: { upcoming?: boolean }) {
    const response = await api.get('/cms-parent/calendar-events/public', { params });
    return response.data;
  }

  // ==================== ANNOUNCEMENTS ====================
  
  async getAnnouncements(params?: {
    search?: string;
    category?: string;
    is_pinned?: boolean;
    is_active?: boolean;
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/cms-parent/announcements', { params });
    return response.data;
  }

  async getAnnouncement(id: number) {
    const response = await api.get(`/cms-parent/announcements/${id}`);
    return response.data;
  }

  async createAnnouncement(data: AnnouncementFormData) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if ((key === 'thumbnail' || key === 'document') && value instanceof File) {
          formData.append(key, value);
        } else if (key !== 'thumbnail' && key !== 'document') {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post('/cms-parent/announcements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async updateAnnouncement(id: number, data: Partial<AnnouncementFormData>) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if ((key === 'thumbnail' || key === 'document') && value instanceof File) {
          formData.append(key, value);
        } else if (key !== 'thumbnail' && key !== 'document') {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post(`/cms-parent/announcements/${id}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        '_method': 'PUT'
      }
    });
    return response.data;
  }

  async deleteAnnouncement(id: number) {
    const response = await api.delete(`/cms-parent/announcements/${id}`);
    return response.data;
  }

  async incrementViews(id: number) {
    const response = await api.post(`/cms-parent/announcements/${id}/increment-views`);
    return response.data;
  }

  // Public route (no auth required)
  async getPublicAnnouncements(params?: { category?: string; limit?: number }) {
    const response = await api.get('/cms-parent/announcements/public', { params });
    return response.data;
  }

  // ==================== BANNERS ====================
  
  async getBanners(params?: {
    search?: string;
    is_active?: boolean;
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/cms-parent/banners', { params });
    return response.data;
  }

  async getBanner(id: number) {
    const response = await api.get(`/cms-parent/banners/${id}`);
    return response.data;
  }

  async createBanner(data: BannerFormData) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if ((key === 'image' || key === 'mobile_image') && value instanceof File) {
          formData.append(key, value);
        } else if (key !== 'image' && key !== 'mobile_image') {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post('/cms-parent/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async updateBanner(id: number, data: Partial<BannerFormData>) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if ((key === 'image' || key === 'mobile_image') && value instanceof File) {
          formData.append(key, value);
        } else if (key !== 'image' && key !== 'mobile_image') {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post(`/cms-parent/banners/${id}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        '_method': 'PUT'
      }
    });
    return response.data;
  }

  async deleteBanner(id: number) {
    const response = await api.delete(`/cms-parent/banners/${id}`);
    return response.data;
  }

  async updateSortOrder(banners: Array<{ id: number; sort_order: number }>) {
    const response = await api.post('/cms-parent/banners/update-sort-order', { banners });
    return response.data;
  }

  // Public route (no auth required)
  async getPublicBanners() {
    const response = await api.get('/cms-parent/banners/public');
    return response.data;
  }
}

export const cmsParentService = new CMSParentService();

