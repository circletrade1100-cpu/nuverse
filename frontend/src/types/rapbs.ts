export interface AcademicYear {
  id: number;
  year: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ActivityCategory {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  budget_type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
}

export interface FundingSource {
  id: number;
  name: string;
  type: 'bos' | 'spp' | 'donation' | 'other';
  description: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface RAPBSUser {
  id: number;
  user_id: number;
  role: 'planner' | 'approver' | 'executor' | 'viewer';
  unit_kerja_id: number;
  permissions: string;
  created_at: string;
  updated_at: string;
}

export interface RAPBSPlan {
  id: number;
  academic_year_id: number;
  activity_category_id: number;
  funding_source_id: number;
  title: string;
  description: string;
  planned_amount: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'submitted' | 'approved_by_principal' | 'approved_by_dirpen' | 'approved' | 'rejected_by_principal' | 'rejected_by_dirpen' | 'rejected_by_director' | 'rejected';
  submitted_by: number;
  approved_by: number | null;
  approved_at: string | null;
  // Multi-level approval fields
  approved_by_principal?: number | null;
  approved_by_principal_at?: string | null;
  rejection_notes_principal?: string | null;
  approved_by_dirpen?: number | null;
  approved_by_dirpen_at?: string | null;
  rejection_notes_dirpen?: string | null;
  approved_by_director?: number | null;
  approved_by_director_at?: string | null;
  rejection_notes_director?: string | null;
  created_at: string;
  updated_at: string;
  academic_year?: AcademicYear;
  activity_category?: ActivityCategory;
  funding_source?: FundingSource;
  approved_by_principal_user?: any;
  approved_by_dirpen_user?: any;
  approved_by_director_user?: any;
  documents?: RAPBSDocument[];
}

export interface BudgetBreakdown {
  id: number;
  rapbs_plan_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface RAPBSDocument {
  id: number;
  rapbs_plan_id: number;
  document_type: 'proposal' | 'budget_detail' | 'supporting_doc';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  created_at: string;
}

export interface RAPBSRealization {
  id: number;
  rapbs_plan_id: number;
  transaction_date: string;
  amount: number;
  description: string;
  vendor_name: string;
  payment_method: 'cash' | 'transfer' | 'check';
  reference_number: string;
  created_by: number;
  status: 'pending' | 'submitted' | 'approved_by_principal' | 'approved_by_dirpen' | 'approved' | 'rejected_by_principal' | 'rejected_by_dirpen' | 'rejected_by_director' | 'rejected';
  approved_by: number | null;
  approved_at: string | null;
  approval_notes: string | null;
  // Multi-level approval fields (mengikuti alur Rencana RAPBS)
  approved_by_principal?: number | null;
  approved_by_principal_at?: string | null;
  rejection_notes_principal?: string | null;
  approved_by_dirpen?: number | null;
  approved_by_dirpen_at?: string | null;
  rejection_notes_dirpen?: string | null;
  approved_by_director?: number | null;
  approved_by_director_at?: string | null;
  rejection_notes_director?: string | null;
  created_at: string;
  updated_at: string;
  approved_by_principal_user?: any;
  approved_by_dirpen_user?: any;
  approved_by_director_user?: any;
  rapbsPlan?: any;
}

export interface RealizationDocument {
  id: number;
  realization_id: number;
  document_type: 'receipt' | 'invoice' | 'fpu' | 'other';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  validation_status: 'pending' | 'validated' | 'rejected';
  validated_by: number | null;
  validated_at: string | null;
  notes: string;
  created_at: string;
}

export interface ActivityNote {
  id: number;
  rapbs_plan_id: number;
  note_type: 'progress' | 'issue' | 'completion';
  title: string;
  content: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetSummary {
  total_budget: number;
  total_realization: number;
  remaining_budget: number;
  utilization_rate: number;
}

export interface FundingSourceBreakdown {
  source: string;
  budget: number;
  realization: number;
  percentage: number;
}

export interface CategoryBreakdown {
  category: string;
  budget: number;
  realization: number;
}

export interface DashboardData {
  budget_summary: BudgetSummary;
  funding_sources: FundingSourceBreakdown[];
  category_breakdown: CategoryBreakdown[];
}

export interface PlanFormData {
  academic_year_id: number;
  activity_category_id: number;
  funding_source_id: number;
  title: string;
  description: string;
  planned_amount: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface RealizationFormData {
  rapbs_plan_id: number;
  transaction_date: string;
  amount: number;
  description: string;
  vendor_name: string;
  payment_method: 'cash' | 'transfer' | 'check';
  reference_number: string;
}

