import { apiMethods } from './api';

// ==================== INTERFACES ====================

interface InventoryItem {
  id: number;
  item_code: string;
  name: string;
  category_id?: number;
  sub_category?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price: number;
  current_value: number;
  location?: string;
  status: 'aktif' | 'maintenance' | 'penghapusan';
  condition: 'baik' | 'rusak_ringan' | 'rusak_berat' | 'tidak_berfungsi';
  warranty_expiry?: string;
  supplier?: string;
  pic?: string;
  notes?: string;
  images?: Array<{
    id?: number;
    url: string;
    name?: string;
  }>;
  category?: InventoryCategory;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryCategory {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  children?: InventoryCategory[];
  created_at?: string;
  updated_at?: string;
}

interface MaintenanceSchedule {
  id: number;
  item_id: number;
  maintenance_type: 'preventive' | 'corrective' | 'emergency' | 'upgrade';
  frequency?: string;
  last_maintenance?: string;
  next_maintenance: string;
  technician_id?: number;
  estimated_duration?: string;
  required_materials?: string;
  checklist?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  notes?: string;
  item?: InventoryItem;
  technician?: any;
  created_at?: string;
  updated_at?: string;
}

export interface RepairRequestImage {
  id: number;
  repair_request_id: number;
  image_url: string;
  image_name: string;
  created_at?: string;
}

export interface DepreciationLog {
  id: number;
  item_id: number;
  depreciation_date: string;
  depreciation_amount: number;
  current_value: number;
  previous_value: number;
  method: 'straight_line' | 'declining_balance' | 'units_of_production';
  depreciation_rate?: number;
  useful_life_years?: number;
  salvage_value: number;
  notes?: string;
  calculated_by: number;
  item?: InventoryItem;
  calculator?: {
    id: number;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: number;
  item_id: number;
  audit_date: string;
  auditor_id: number;
  condition_before: 'baik' | 'rusak_ringan' | 'rusak_berat' | 'tidak_berfungsi';
  condition_after: 'baik' | 'rusak_ringan' | 'rusak_berat' | 'tidak_berfungsi';
  status_before: 'aktif' | 'maintenance' | 'penghapusan';
  status_after: 'aktif' | 'maintenance' | 'penghapusan';
  findings?: string;
  recommendations?: string;
  action_taken?: string;
  estimated_repair_cost?: number;
  audit_type: 'routine' | 'special' | 'emergency';
  location_verified?: string;
  photos?: string[];
  item?: InventoryItem;
  auditor?: {
    id: number;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface RepairRequest {
  id: number;
  item_id: number;
  requester_id: number;
  request_date: string;
  problem_description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_cost?: number;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  assigned_technician_id?: number;
  start_date?: string;
  completion_date?: string;
  actual_cost?: number;
  notes?: string;
  item?: InventoryItem;
  requester?: any;
  technician?: any;
  images?: RepairRequestImage[];
  created_at?: string;
  updated_at?: string;
}

export interface Statistics {
  total_items: number;
  total_value: number;
  by_condition: Array<{ condition: string; count: number }>;
  by_status: Array<{ status: string; count: number }>;
  by_category: Array<{ sub_category: string; count: number }>;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  status?: string;
  condition?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

// ==================== SERVICE CLASS ====================

class SarprasService {
  // ==================== INVENTORY ITEMS ====================

  /**
   * Get all inventory items with optional filters
   */
  async getInventoryItems(filters?: InventoryFilters): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.condition) params.append('condition', filters.condition);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.sort_order) params.append('sort_order', filters.sort_order);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const url = `/master-data/sarpras${queryString ? `?${queryString}` : ''}`;
    
    return apiMethods.get<InventoryItem[]>(url);
  }

  /**
   * Get single inventory item by ID
   */
  async getInventoryItem(id: number): Promise<InventoryItem> {
    return apiMethods.get<InventoryItem>(`/master-data/sarpras/${id}`);
  }

  /**
   * Create new inventory item
   */
  async createInventoryItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    return apiMethods.post<InventoryItem>('/master-data/sarpras', data);
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(id: number, data: Partial<InventoryItem>): Promise<InventoryItem> {
    return apiMethods.put<InventoryItem>(`/master-data/sarpras/${id}`, data);
  }

  /**
   * Delete inventory item
   */
  async deleteInventoryItem(id: number): Promise<void> {
    return apiMethods.delete<void>(`/master-data/sarpras/${id}`);
  }

  // ==================== STATISTICS ====================

  /**
   * Get dashboard statistics
   */
  async getStatistics(): Promise<Statistics> {
    return apiMethods.get<Statistics>('/master-data/sarpras/statistics');
  }

  // ==================== CATEGORIES ====================

  /**
   * Get all categories
   */
  async getCategories(): Promise<InventoryCategory[]> {
    return apiMethods.get<InventoryCategory[]>('/master-data/sarpras/categories');
  }

  /**
   * Store new category
   */
  async storeCategory(categoryData: { name: string; description?: string }): Promise<InventoryCategory> {
    return apiMethods.post<InventoryCategory>('/master-data/sarpras/categories', categoryData);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: number): Promise<void> {
    return apiMethods.delete<void>(`/master-data/sarpras/categories/${id}`);
  }

  // ==================== MAINTENANCE SCHEDULES ====================

  /**
   * Get maintenance schedules
   */
  async getMaintenanceSchedules(filters?: { status?: string; item_id?: number }): Promise<MaintenanceSchedule[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.item_id) params.append('item_id', filters.item_id.toString());
    
    const queryString = params.toString();
    const url = `/master-data/sarpras/maintenance/schedules${queryString ? `?${queryString}` : ''}`;
    
    return apiMethods.get<MaintenanceSchedule[]>(url);
  }

  /**
   * Create maintenance schedule
   */
  async createMaintenanceSchedule(data: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> {
    return apiMethods.post<MaintenanceSchedule>('/master-data/sarpras/maintenance/schedules', data);
  }

  /**
   * Update maintenance schedule
   */
  async updateMaintenanceSchedule(id: number, data: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> {
    return apiMethods.put<MaintenanceSchedule>(`/master-data/sarpras/maintenance/schedules/${id}`, data);
  }

  /**
   * Delete maintenance schedule
   */
  async deleteMaintenanceSchedule(id: number): Promise<void> {
    return apiMethods.delete<void>(`/master-data/sarpras/maintenance/schedules/${id}`);
  }

  // ==================== REPAIR REQUESTS ====================

  /**
   * Get repair requests
   */
  async getRepairRequests(filters?: { status?: string; priority?: string }): Promise<RepairRequest[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    
    const queryString = params.toString();
    const url = `/master-data/sarpras/repair/requests${queryString ? `?${queryString}` : ''}`;
    
    return apiMethods.get<RepairRequest[]>(url);
  }

  /**
   * Create repair request
   */
  async createRepairRequest(data: Partial<RepairRequest>): Promise<RepairRequest> {
    return apiMethods.post<RepairRequest>('/master-data/sarpras/repair/requests', data);
  }

  /**
   * Create repair request with files
   */
  async createRepairRequestWithFiles(formData: FormData): Promise<RepairRequest> {
    const response = await fetch('/api/master-data/sarpras/repair/requests', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create repair request');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to create repair request');
    }

    return result.data;
  }

  /**
   * Update repair request
   */
  async updateRepairRequest(id: number, data: Partial<RepairRequest>): Promise<RepairRequest> {
    return apiMethods.put<RepairRequest>(`/master-data/sarpras/repair/requests/${id}`, data);
  }

  /**
   * Update repair request with files
   */
  async updateRepairRequestWithFiles(id: number, formData: FormData): Promise<RepairRequest> {
    const response = await fetch(`/api/master-data/sarpras/repair/requests/${id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update repair request');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update repair request');
    }

    return result.data;
  }

  /**
   * Update repair request status
   */
  async updateRepairRequestStatus(id: number, data: Partial<RepairRequest>): Promise<RepairRequest> {
    return apiMethods.put<RepairRequest>(`/master-data/sarpras/repair/requests/${id}/status`, data);
  }

  /**
   * Delete repair request
   */
  async deleteRepairRequest(id: number): Promise<void> {
    return apiMethods.delete<void>(`/master-data/sarpras/repair/requests/${id}`);
  }

  // ==================== DEPRECIATION LOGS ====================

  /**
   * Get depreciation logs
   */
  async getDepreciationLogs(params?: {
    item_id?: number;
    start_date?: string;
    end_date?: string;
    method?: string;
    page?: number;
  }): Promise<{ data: DepreciationLog[]; meta: any }> {
    const queryString = new URLSearchParams();
    if (params?.item_id) queryString.append('item_id', params.item_id.toString());
    if (params?.start_date) queryString.append('start_date', params.start_date);
    if (params?.end_date) queryString.append('end_date', params.end_date);
    if (params?.method) queryString.append('method', params.method);
    if (params?.page) queryString.append('page', params.page.toString());

    const url = `/master-data/sarpras/depreciation/logs${queryString ? `?${queryString}` : ''}`;
    
    return apiMethods.get<{ data: DepreciationLog[]; meta: any }>(url);
  }

  /**
   * Create depreciation log
   */
  async createDepreciationLog(data: Partial<DepreciationLog>): Promise<DepreciationLog> {
    return apiMethods.post<DepreciationLog>('/master-data/sarpras/depreciation/logs', data);
  }

  /**
   * Update depreciation log
   */
  async updateDepreciationLog(id: number, data: Partial<DepreciationLog>): Promise<DepreciationLog> {
    return apiMethods.put<DepreciationLog>(`/master-data/sarpras/depreciation/logs/${id}`, data);
  }

  /**
   * Delete depreciation log
   */
  async deleteDepreciationLog(id: number): Promise<void> {
    return apiMethods.delete<void>(`/master-data/sarpras/depreciation/logs/${id}`);
  }

  // ==================== AUDIT LOGS ====================

  /**
   * Get audit logs
   */
  async getAuditLogs(params?: {
    item_id?: number;
    start_date?: string;
    end_date?: string;
    audit_type?: string;
    auditor_id?: number;
    page?: number;
  }): Promise<{ data: AuditLog[]; meta: any }> {
    const queryString = new URLSearchParams();
    if (params?.item_id) queryString.append('item_id', params.item_id.toString());
    if (params?.start_date) queryString.append('start_date', params.start_date);
    if (params?.end_date) queryString.append('end_date', params.end_date);
    if (params?.audit_type) queryString.append('audit_type', params.audit_type);
    if (params?.auditor_id) queryString.append('auditor_id', params.auditor_id.toString());
    if (params?.page) queryString.append('page', params.page.toString());

    const url = `/master-data/sarpras/audit/logs${queryString ? `?${queryString}` : ''}`;
    
    return apiMethods.get<{ data: AuditLog[]; meta: any }>(url);
  }

  /**
   * Create audit log
   */
  async createAuditLog(data: Partial<AuditLog> | FormData): Promise<AuditLog> {
    if (data instanceof FormData) {
      console.log('Sending FormData to backend...');
      console.log('FormData entries:');
      for (let pair of data.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }
      
      const response = await fetch('/api/master-data/sarpras/audit/logs', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create audit log');
      }
      
      const result = await response.json();
      return result.data;
    }
    
    return apiMethods.post<AuditLog>('/master-data/sarpras/audit/logs', data);
  }

  /**
   * Update audit log
   */
  async updateAuditLog(id: number, data: Partial<AuditLog> | FormData): Promise<AuditLog> {
    if (data instanceof FormData) {
      const response = await fetch(`/api/master-data/sarpras/audit/logs/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update audit log');
      }
      
      const result = await response.json();
      return result.data;
    }
    
    return apiMethods.put<AuditLog>(`/master-data/sarpras/audit/logs/${id}`, data);
  }

  /**
   * Delete audit log
   */
  async deleteAuditLog(id: number): Promise<void> {
    return apiMethods.delete<void>(`/master-data/sarpras/audit/logs/${id}`);
  }
}

const sarprasService = new SarprasService();
export default sarprasService;

// Export individual service and all interfaces
export { sarprasService, type MaintenanceSchedule, type InventoryItem };

