import api, { phpApiMethods } from './api';
import type { Student, StudentFormData } from '../types/student';

interface StudentApiData {
  id: number | string;
  nama_lengkap: string;
  nama_panggilan: string;
  nisn: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  nama_ibu: string;
  nama_ayah: string;
  nomor_hp: string;
  alamat: string;
  email: string;
  unit_sekolah: string;
  unit_kelas: string;
  password: string;
  avatar?: string;
  status: string;
  umur?: number;
  created_at: string;
  updated_at: string;
}


interface StudentResponse {
  success: boolean;
  data: StudentApiData;
  message: string;
}

interface StudentFilters {
  search?: string;
  status?: string;
  unit_sekolah?: string;
  unit_kelas?: string;
  nama?: string; // camelCase alias for search
  unitSekolah?: string; // camelCase alias for unit_sekolah
  unitKelas?: string; // camelCase alias for unit_kelas
  per_page?: number;
  page?: number;
}

const convertApiToFrontend = (apiData: any): Student => {
  if (!apiData || typeof apiData !== 'object') {
    console.error('Invalid API data:', apiData);
    return {} as Student;
  }
  
  // Handle both snake_case (from list API) and camelCase (from create/update API) formats
  console.log('🔄 Converting API data to frontend:', {
    avatarFromAPI: apiData.avatar,
    avatarType: typeof apiData.avatar
  });
  
  const avatarUrl = apiData.avatar && apiData.avatar !== "0" && apiData.avatar !== "null" 
    ? `${import.meta.env.PROD ? 'https://nurverse.id/manajemen-annur/backend/public' : 'http://localhost:8001'}/storage/${apiData.avatar}` 
    : undefined;
    
  console.log('🖼️ Avatar URL generated:', avatarUrl);
  
  return {
    id: String(apiData.id),
    namaLengkap: apiData.namaLengkap || apiData.nama_lengkap || '',
    namaPanggilan: apiData.namaPanggilan || apiData.nama_panggilan || '',
    nisn: apiData.nisn || '',
    tempatLahir: apiData.tempatLahir || apiData.tempat_lahir || '',
    tanggalLahir: apiData.tanggalLahir || apiData.tanggal_lahir || '',
    namaIbu: apiData.namaIbu || apiData.nama_ibu || '',
    namaAyah: apiData.namaAyah || apiData.nama_ayah || '',
    nomorHP: apiData.nomorHP || apiData.nomor_hp || '',
    alamat: apiData.alamat || '',
    email: apiData.email || '',
    unitSekolah: apiData.unitSekolah || apiData.unit_sekolah || '',
    unitKelas: apiData.unitKelas || apiData.unit_kelas || '',
    password: apiData.password || '',
    avatar: avatarUrl,
    createdAt: apiData.createdAt || apiData.created_at || '',
    updatedAt: apiData.updatedAt || apiData.updated_at || ''
  };
};

const convertFrontendToApi = (formData: StudentFormData) => {
  // Ensure all required fields are included and not empty
  const apiData = {
    nama_lengkap: formData.namaLengkap?.trim() || '',
    nama_panggilan: formData.namaPanggilan?.trim() || '',
    nisn: formData.nisn?.trim() || '',
    tempat_lahir: formData.tempatLahir?.trim() || '',
    tanggal_lahir: formData.tanggalLahir ? new Date(formData.tanggalLahir).toISOString().split('T')[0] : '',
    nama_ibu: formData.namaIbu?.trim() || '',
    nama_ayah: formData.namaAyah?.trim() || '',
    nomor_hp: formData.nomorHP?.trim() || '',
    alamat: formData.alamat?.trim() || '',
    email: formData.email?.trim() || '',
    unit_sekolah: formData.unitSekolah?.trim() || '',
    unit_kelas: formData.unitKelas?.trim() || '',
    password: formData.password?.trim() || '',
    status: 'Aktif'
  };

  console.log('Converting frontend data to API format:', {
    input: formData,
    output: apiData
  });

  return apiData;
};

export const studentService = {
  // Get all students with filters
  async getAll(filters: StudentFilters = {}): Promise<{ students: Student[]; total: number }> {
    try {
      const params: Record<string, any> = {
        action: 'list'
      };
      
      // Map frontend camelCase to backend snake_case
      // Prioritize 'nama' over 'search' if both exist
      if (filters.nama && filters.nama.trim()) {
        params.search = filters.nama.trim();
      } else if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.status) params.status = filters.status;
      if (filters.unitSekolah) params.unit_sekolah = filters.unitSekolah;
      if (filters.unitKelas) params.unit_kelas = filters.unitKelas;
      if (filters.unit_sekolah) params.unit_sekolah = filters.unit_sekolah;
      if (filters.unit_kelas) params.unit_kelas = filters.unit_kelas;
      if (filters.per_page) params.per_page = filters.per_page.toString();
      if (filters.page) params.page = filters.page.toString();

      const apiResponse = await phpApiMethods.get<{
        data: StudentApiData[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
      }>('/master-data/student', params);

      console.log('API Response for students list:', apiResponse);

      const result = {
        students: apiResponse.data.map(convertApiToFrontend),
        total: apiResponse.total
      };
      return result;
    } catch (error) {
      console.error('Error fetching students:', error);
      return { students: [], total: 0 };
    }
  },

  // Get statistics for all students
  async getStatistics(): Promise<{ total: number; by_unit_sekolah: { TK: number; SD: number; SMP: number; SMA: number } }> {
    try {
      const apiResponse = await phpApiMethods.get<{
        total: number;
        by_unit_sekolah: { TK: number; SD: number; SMP: number; SMA: number };
      }>('/master-data/student/statistics');

      console.log('API Response for statistics:', apiResponse);

      return apiResponse;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return { total: 0, by_unit_sekolah: { TK: 0, SD: 0, SMP: 0, SMA: 0 } };
    }
  },

  // Get student by ID
  async getById(id: string): Promise<Student | null> {
    try {
      const apiResponse = await phpApiMethods.get<StudentApiData>('/master-data/student', {
        action: 'show',
        id: id
      });

      console.log('API Response for student by ID:', apiResponse);
      return convertApiToFrontend(apiResponse);
    } catch (error) {
      console.error('Error fetching student:', error);
      return null;
    }
  },

  // Create new student
  async create(formData: StudentFormData): Promise<Student> {
    try {
      console.log('Creating student with data:', formData);
      
      // Convert frontend data to API format
      const apiData = convertFrontendToApi(formData);
      console.log('Converted API data:', apiData);
      
      let response;
      
      // Handle file upload if avatar exists
      if (formData.avatar) {
        console.log('🖼️ Avatar file detected:', {
          name: formData.avatar.name,
          size: formData.avatar.size,
          type: formData.avatar.type
        });
        
        // Use FormData for file upload
        const formDataWithFile = new FormData();
        Object.entries(apiData).forEach(([key, value]) => {
          formDataWithFile.append(key, value);
        });
        formDataWithFile.append('avatar', formData.avatar);
        
        console.log('📦 FormData contents for CREATE:', Object.fromEntries(formDataWithFile.entries()));
        
        response = await api.post('/master-data/student', formDataWithFile, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Use fixed backend API through nginx
        console.log('🎯 Using fixed backend API...');
        console.log('🔍 API Data being sent:', apiData);
        
        response = await api.post('/master-data/student', apiData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Raw response received:', response);
        console.log('📊 Response status:', response.status);
        console.log('📋 Response headers:', response.headers);
      }
      
      console.log('API Response:', response.data);
      const apiResponse: StudentResponse = response.data;

      if (apiResponse.success) {
        const newStudent = convertApiToFrontend(apiResponse.data);
        console.log('Created student:', newStudent);
        return newStudent;
      }
      
      throw new Error(apiResponse.message || 'Failed to create student');
    } catch (error: any) {
      console.error('Error creating student:', error);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Failed to create student');
    }
  },

  // Update student
  async update(id: string, formData: StudentFormData): Promise<Student> {
    try {
      console.log('Updating student with ID:', id, 'and data:', formData);
      
      // Convert frontend data to API format  
      const apiData = convertFrontendToApi(formData);
      console.log('Converted API data for update:', apiData);
      
      let response;
      
      // Handle file upload if avatar exists
      if (formData.avatar) {
        console.log('🖼️ Avatar file detected in UPDATE:', {
          name: formData.avatar.name,
          size: formData.avatar.size,
          type: formData.avatar.type
        });
        
        // Use FormData for file upload
        const formDataWithFile = new FormData();
        Object.entries(apiData).forEach(([key, value]) => {
          formDataWithFile.append(key, value);
        });
        formDataWithFile.append('avatar', formData.avatar);
        
        console.log('📦 FormData contents for UPDATE:', Object.fromEntries(formDataWithFile.entries()));
        
        response = await api.post(`/master-data/student/${id}/update-with-file`, formDataWithFile, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Use PUT for regular data update
        response = await api.put(`/master-data/student/${id}`, apiData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      console.log('Update API Response:', response.data);
      console.log('🐛 Backend Debug Info:', response.data.debug);
      const apiResponse: StudentResponse = response.data;

      if (apiResponse.success) {
        const updatedStudent = convertApiToFrontend(apiResponse.data);
        console.log('Updated student:', updatedStudent);
        return updatedStudent;
      }
      throw new Error(apiResponse.message || 'Failed to update student');
    } catch (error: any) {
      console.error('Error updating student:', error);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Failed to update student');
    }
  },

  // Delete student
  async delete(id: string): Promise<boolean> {
    try {
      console.log('Deleting student with ID:', id);
      const response = await api.delete(`/master-data/student/${id}`);
      console.log('Delete API Response:', response.data);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting student:', error);
      return false;
    }
  },

  // Import students from Excel/CSV
  async importFromFile(file: File): Promise<{ 
    success: boolean; 
    message: string; 
    imported?: number; 
    updated?: number;
    skipped?: number; 
    errors?: string[];
    debug?: {
      total_rows_processed?: number;
      header_mapping?: Array<{
        col: number;
        letter: string;
        header: string;
        mapped_to: string | null;
      }>;
    };
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/master-data/student/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Import API Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error importing students:', error);
      if (error.response?.data) {
        console.error('Error response data:', error.response.data);
      }
      throw new Error(error.response?.data?.message || 'Failed to import students');
    }
  },

  // Import students from JSON data
  async importFromJson(jsonData: any[]): Promise<{ 
    success: boolean; 
    message: string; 
    imported?: number; 
    updated?: number;
    skipped?: number; 
    errors?: string[];
    debug?: {
      total_items_processed?: number;
    };
  }> {
    try {
      const response = await api.post('/master-data/student/import-json', {
        data: jsonData
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Import JSON API Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error importing students from JSON:', error);
      if (error.response?.data) {
        console.error('Error response data:', error.response.data);
      }
      throw new Error(error.response?.data?.message || 'Failed to import students from JSON');
    }
  }
};

export default studentService;
