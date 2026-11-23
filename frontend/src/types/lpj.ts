export interface LPJ {
  id: number;
  academic_year_id: number;
  unit_kerja_id: number | null;
  periode_type: 'semester' | 'tahunan';
  periode_start_date: string;
  periode_end_date: string;
  title: string;
  description: string | null;
  status: 'draft' | 'submitted' | 'approved_by_principal' | 'approved_by_dirpen' | 'approved' | 'finalized' | 'rejected_by_principal' | 'rejected_by_dirpen' | 'rejected_by_director' | 'rejected';
  created_by: number;
  submitted_at: string | null;
  approved_by_principal: number | null;
  approved_by_principal_at: string | null;
  approved_by_dirpen: number | null;
  approved_by_dirpen_at: string | null;
  approved_by_director: number | null;
  approved_by_director_at: string | null;
  finalized_at: string | null;
  rejection_notes_principal: string | null;
  rejection_notes_dirpen: string | null;
  rejection_notes_director: string | null;
  created_at: string;
  updated_at: string;
  academic_year?: any;
  unit_kerja?: any;
  created_by_user?: any;
  approved_by_principal_user?: any;
  approved_by_dirpen_user?: any;
  approved_by_director_user?: any;
  rapbs_plans?: LPJRapbsPlan[];
  documents?: LPJDocument[];
  notes?: LPJNote[];
}

export interface LPJRapbsPlan {
  id: number;
  lpj_id: number;
  rapbs_plan_id: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  rapbs_plan?: any;
}

export interface LPJDocument {
  id: number;
  lpj_id: number;
  document_type: 'cover_letter' | 'legal_doc' | 'photo' | 'other';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string | null;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  uploaded_by_user?: any;
}

export interface LPJNote {
  id: number;
  lpj_id: number;
  note_type: 'summary' | 'issue' | 'achievement' | 'recommendation';
  title: string;
  content: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  created_by_user?: any;
}

export interface LPJSummary {
  total_planned: number;
  total_realized: number;
  remaining: number;
  utilization_rate: number;
  by_category: Record<string, {
    planned: number;
    realized: number;
  }>;
  by_funding_source: Record<string, {
    planned: number;
    realized: number;
  }>;
}

export interface LPJFormData {
  academic_year_id: number;
  unit_kerja_id?: number | null;
  periode_type: 'semester' | 'tahunan';
  periode_start_date: string;
  periode_end_date: string;
  title: string;
  description?: string | null;
  rapbs_plan_ids?: number[];
}

export interface LPJDashboardData {
  total_lpj: number;
  status_summary: Record<string, number>;
  periode_type_summary: Record<string, number>;
  approval_rate: number;
  recent_lpjs: LPJ[];
  lpj_trend: Array<{
    month: string;
    count: number;
  }>;
}

