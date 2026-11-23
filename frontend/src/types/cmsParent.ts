// Calendar Event Types
export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  event_type: 'akademik' | 'kegiatan' | 'libur' | 'kompetisi' | 'pengumuman';
  priority: 'high' | 'medium' | 'low';
  location?: string;
  document_path?: string;
  is_active: boolean;
  sort_order: number;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarEventFormData {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  event_type: 'akademik' | 'kegiatan' | 'libur' | 'kompetisi' | 'pengumuman';
  priority: 'high' | 'medium' | 'low';
  location?: string;
  document?: File;
  is_active: boolean;
  sort_order: number;
}

// Announcement Types
export interface Announcement {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  category: 'akademik' | 'kegiatan' | 'pengumuman' | 'informasi';
  author?: string;
  thumbnail?: string;
  document_path?: string;
  is_pinned: boolean;
  is_active: boolean;
  published_at?: string;
  expires_at?: string;
  view_count: number;
  sort_order: number;
  read_time?: number;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  excerpt?: string;
  category: 'akademik' | 'kegiatan' | 'pengumuman' | 'informasi';
  author?: string;
  thumbnail?: File;
  document?: File;
  is_pinned: boolean;
  is_active: boolean;
  published_at?: string;
  expires_at?: string;
  sort_order: number;
  read_time?: number;
}

// Banner Types
export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_path: string;
  mobile_image_path?: string;
  button_text?: string;
  button_link?: string;
  bg_color: string;
  is_active: boolean;
  sort_order: number;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BannerFormData {
  title: string;
  subtitle?: string;
  image?: File;
  mobile_image?: File;
  button_text?: string;
  button_link?: string;
  bg_color: string;
  is_active: boolean;
  sort_order: number;
  start_date?: string;
  end_date?: string;
  notes?: string;
}

