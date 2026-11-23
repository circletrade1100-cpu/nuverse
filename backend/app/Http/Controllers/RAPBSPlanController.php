<?php

namespace App\Http\Controllers;

use App\Models\RapbsPlan;
use App\Models\BudgetBreakdown;
use App\Models\RapbsDocument;
use App\Models\ActivityNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class RAPBSPlanController extends Controller
{
    /**
     * Get all RAPBS plans
     */
    public function index(Request $request)
    {
        $query = RapbsPlan::query();

        // Filter berdasarkan unit_kerja_id user yang login (kecuali Super Admin dan Dirpen/Direktur)
        $user = Auth::user();
        $isSuperAdmin = $user && $user->roles()->where('name', 'Super Administrator')->exists();
        
        // Cek apakah user adalah Dirpen atau Direktur Keuangan (bisa lihat semua data yang sudah approved)
        $isDirpen = $user && $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Pendidikan')
              ->orWhere('name', 'direktur_pendidikan')
              ->orWhere('name', 'Direktur_Pendidikan')
              ->orWhere('name', 'Dirpen')
              ->orWhere('name', 'dirpen')
              ->orWhere('name', 'DIRPEN')
              ->orWhereRaw('LOWER(name) LIKE ?', ['%dirpen%']);
        })->exists();
        
        $isDirector = $user && $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Keuangan')
              ->orWhere('name', 'direktur_keuangan')
              ->orWhere('name', 'Direktur_Keuangan')
              ->orWhereRaw('LOWER(name) LIKE ?', ['%direktur%keuangan%']);
        })->exists();
        
        $userUnitKerjaId = null;
        // Filter unit_kerja hanya untuk user biasa, bukan untuk Dirpen/Direktur
        if (!$isSuperAdmin && !$isDirpen && !$isDirector && $user && $user->profile && $user->profile->unit_kerja) {
            // Cari unit_kerja_id berdasarkan nama unit_kerja
            $unitKerja = \App\Models\UnitKerja::where('nama', $user->profile->unit_kerja)->first();
            if ($unitKerja) {
                $userUnitKerjaId = $unitKerja->id;
                // Include juga plans yang unit_kerja_id nya NULL untuk fleksibilitas
                $query->where(function($q) use ($unitKerja) {
                    $q->where('unit_kerja_id', $unitKerja->id)
                      ->orWhereNull('unit_kerja_id');
                });
            }
        }

        // Filter draft plans: 
        // - Dirpen bisa lihat semua data yang sudah approved_by_principal atau approved_by_dirpen
        // - Direktur Keuangan bisa lihat semua data yang sudah approved_by_dirpen
        // - Pembuat plan bisa lihat draft yang mereka buat
        // - Approver bisa lihat draft dari unit kerja mereka sendiri
        if ($user && !$isSuperAdmin) {
            if ($isDirpen) {
                // Dirpen bisa lihat semua data yang sudah approved_by_principal atau approved_by_dirpen
                // Hanya apply filter default jika tidak ada filter status dari request
                if (!$request->has('status')) {
                    $query->whereIn('status', ['approved_by_principal', 'approved_by_dirpen', 'rejected_by_dirpen']);
                }
            } elseif ($isDirector) {
                // Direktur Keuangan bisa lihat semua data yang sudah approved_by_dirpen
                // Hanya apply filter default jika tidak ada filter status dari request
                if (!$request->has('status')) {
                    $query->whereIn('status', ['approved_by_dirpen', 'approved', 'rejected_by_director']);
                }
            } else {
                // Cek apakah user adalah approver
                $isApprover = $user->roles()->where(function($q) {
                    $q->where('name', 'Manajer Unit')
                      ->orWhere('name', 'manajer_unit')
                      ->orWhere('name', 'Kepala Sekolah')
                      ->orWhere('name', 'kepala_sekolah')
                      ->orWhere('name', 'kepsek_rapbs_&_divisi_unit')
                      ->orWhere('name', 'Direktur Keuangan')
                      ->orWhere('name', 'direktur_keuangan')
                      ->orWhereRaw('LOWER(name) LIKE ?', ['%kepsek%rapbs%'])
                      ->orWhereRaw('LOWER(name) LIKE ?', ['%manajer%unit%'])
                      ->orWhereRaw('LOWER(name) LIKE ?', ['%direktur%keuangan%']);
                })->exists();

                if ($isApprover) {
                    // Approver bisa lihat draft plans dari unit kerja mereka sendiri
                    $query->where(function($q) use ($userUnitKerjaId) {
                        // Bisa lihat semua plans yang bukan draft
                        $q->where('status', '!=', 'draft');
                        
                        // Atau draft plans dari unit kerja yang sama
                        if ($userUnitKerjaId) {
                            $q->orWhere(function($subQ) use ($userUnitKerjaId) {
                                $subQ->where('status', 'draft')
                                     ->where('unit_kerja_id', $userUnitKerjaId);
                            });
                        }
                    });
                } else {
                    // Non-approver (creator) bisa lihat draft plans yang mereka buat
                    $query->where(function($q) use ($user) {
                        $q->where('status', '!=', 'draft')
                          ->orWhere('submitted_by', $user->id);
                    });
                }
            }
        }

        // Filters
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('academic_year_id')) {
            $query->where('academic_year_id', $request->academic_year_id);
        }

        if ($request->has('activity_category_id')) {
            $query->where('activity_category_id', $request->activity_category_id);
        }

        if ($request->has('funding_source_id')) {
            $query->where('funding_source_id', $request->funding_source_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('unit_kerja_id')) {
            $query->where('unit_kerja_id', $request->unit_kerja_id);
        }

        $perPage = $request->get('per_page', 10);
        $plans = $query->with([
            'academicYear:id,year',
            'activityCategory:id,name',
            'fundingSource:id,name',
            'approvedByPrincipal:id,name,email',
            'approvedByDirpen:id,name,email',
            'approvedByDirector:id,name,email',
            'unitKerja:id,nama'
        ])->latest()->paginate($perPage);

        // Log untuk debugging
        \Log::info('RAPBS Plans query', [
            'user_id' => $user?->id,
            'is_super_admin' => $isSuperAdmin ?? false,
            'is_dirpen' => $isDirpen ?? false,
            'is_director' => $isDirector ?? false,
            'status_filter' => $request->get('status'),
            'total' => $plans->total(),
            'count' => $plans->count(),
            'current_page' => $plans->currentPage(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $plans
        ]);
    }

    /**
     * Get single RAPBS plan
     */
    public function show($id)
    {
        $plan = RapbsPlan::with([
            'academicYear:id,year',
            'activityCategory:id,name',
            'fundingSource:id,name',
            'budgetBreakdowns',
            'documents',
            'realizations',
            'activityNotes.createdBy',
            'submittedBy:id,name,email',
            'approvedBy:id,name,email',
            'approvedByPrincipal:id,name,email',
            'approvedByDirpen:id,name,email',
            'approvedByDirector:id,name,email',
            'unitKerja:id,nama'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $plan
        ]);
    }

    /**
     * Create new RAPBS plan
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'academic_year_id' => 'required|exists:academic_years,id',
            'activity_category_id' => 'required|exists:activity_categories,id',
            'funding_source_id' => 'required|exists:funding_sources,id',
            'title' => 'required|string|max:200',
            'description' => 'required|string',
            'planned_amount' => 'required|numeric|min:0',
            'priority' => 'required|in:low,medium,high,urgent',
            'proposal_files.*' => 'file|mimes:pdf|max:5120', // 5MB = 5120 KB (in kilobytes)
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate proposal files (required for new plans)
        if ($request->hasFile('proposal_files')) {
            $files = $request->file('proposal_files');
            foreach ($files as $file) {
                // Check file type
                if ($file->getMimeType() !== 'application/pdf') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Hanya file PDF yang diperbolehkan',
                        'errors' => ['proposal_files' => ['File ' . $file->getClientOriginalName() . ' harus berformat PDF']]
                    ], 422);
                }

                // Check file size (max 5MB)
                $maxSize = 5 * 1024 * 1024; // 5MB in bytes
                if ($file->getSize() > $maxSize) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ukuran file maksimal 5 MB',
                        'errors' => ['proposal_files' => ['File ' . $file->getClientOriginalName() . ' maksimal 5 MB']]
                    ], 422);
                }
            }
        } else {
            // Proposal files are required for new plans
            return response()->json([
                'success' => false,
                'message' => 'Proposal file wajib diupload',
                'errors' => ['proposal_files' => ['Minimal 1 file proposal harus diupload']]
            ], 422);
        }

        // Get unit_kerja_id dari user yang login
        $unitKerjaId = null;
        $user = Auth::user();
        if ($user && $user->profile && $user->profile->unit_kerja) {
            $unitKerja = \App\Models\UnitKerja::where('nama', $user->profile->unit_kerja)->first();
            if ($unitKerja) {
                $unitKerjaId = $unitKerja->id;
            }
        }

        $plan = RapbsPlan::create([
            'academic_year_id' => $request->academic_year_id,
            'activity_category_id' => $request->activity_category_id,
            'funding_source_id' => $request->funding_source_id,
            'unit_kerja_id' => $unitKerjaId,
            'title' => $request->title,
            'description' => $request->description,
            'planned_amount' => $request->planned_amount,
            'priority' => $request->priority,
            'status' => 'draft',
            'submitted_by' => Auth::id()
        ]);

        // Handle file uploads
        if ($request->hasFile('proposal_files')) {
            $uploadedFiles = [];
            foreach ($request->file('proposal_files') as $file) {
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('rapbs/proposals', $fileName, 'public');

                $document = RapbsDocument::create([
                    'rapbs_plan_id' => $plan->id,
                    'document_type' => 'proposal',
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'uploaded_by' => Auth::id()
                ]);

                $uploadedFiles[] = $document;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'RAPBS plan created successfully',
            'data' => $plan->load('documents')
        ], 201);
    }

    /**
     * Update RAPBS plan
     */
    public function update(Request $request, $id)
    {
        $plan = RapbsPlan::findOrFail($id);

        // Only draft and rejected plans can be edited
        if (!in_array($plan->status, ['draft', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only draft and rejected plans can be edited'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'academic_year_id' => 'sometimes|exists:academic_years,id',
            'activity_category_id' => 'sometimes|exists:activity_categories,id',
            'funding_source_id' => 'sometimes|exists:funding_sources,id',
            'title' => 'sometimes|string|max:200',
            'description' => 'sometimes|string',
            'planned_amount' => 'sometimes|numeric|min:0',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'proposal_files.*' => 'file|mimes:pdf|max:5120', // 5MB = 5120 KB (optional for update)
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate proposal files if provided
        if ($request->hasFile('proposal_files')) {
            $files = $request->file('proposal_files');
            foreach ($files as $file) {
                // Check file type
                if ($file->getMimeType() !== 'application/pdf') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Hanya file PDF yang diperbolehkan',
                        'errors' => ['proposal_files' => ['File ' . $file->getClientOriginalName() . ' harus berformat PDF']]
                    ], 422);
                }

                // Check file size (max 5MB)
                $maxSize = 5 * 1024 * 1024; // 5MB in bytes
                if ($file->getSize() > $maxSize) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ukuran file maksimal 5 MB',
                        'errors' => ['proposal_files' => ['File ' . $file->getClientOriginalName() . ' maksimal 5 MB']]
                    ], 422);
                }
            }
        }

        $plan->update($request->only([
            'academic_year_id',
            'activity_category_id',
            'funding_source_id',
            'title',
            'description',
            'planned_amount',
            'priority'
        ]));

        // Handle file uploads (optional for update)
        if ($request->hasFile('proposal_files')) {
            foreach ($request->file('proposal_files') as $file) {
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('rapbs/proposals', $fileName, 'public');

                RapbsDocument::create([
                    'rapbs_plan_id' => $plan->id,
                    'document_type' => 'proposal',
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'uploaded_by' => Auth::id()
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'RAPBS plan updated successfully',
            'data' => $plan->load('documents')
        ]);
    }

    /**
     * Delete RAPBS plan
     */
    public function destroy($id)
    {
        $plan = RapbsPlan::findOrFail($id);

        // Only draft and rejected plans can be deleted
        $deletableStatuses = [
            'draft',
            'rejected',
            'rejected_by_principal',
            'rejected_by_dirpen',
            'rejected_by_director',
        ];

        if (!in_array($plan->status, $deletableStatuses, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Only draft and rejected plans can be deleted'
            ], 403);
        }

        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => 'RAPBS plan deleted successfully'
        ]);
    }

    /**
     * Submit plan for approval
     */
    public function submit($id)
    {
        $plan = RapbsPlan::findOrFail($id);

        if (!in_array($plan->status, ['draft', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only draft and rejected plans can be submitted'
            ], 403);
        }

        $plan->update(['status' => 'submitted']);

        return response()->json([
            'success' => true,
            'message' => 'Plan submitted for approval',
            'data' => $plan
        ]);
    }

    /**
     * Approve plan
     */
    public function approve($id)
    {
        $plan = RapbsPlan::findOrFail($id);

        if ($plan->status !== 'submitted') {
            return response()->json([
                'success' => false,
                'message' => 'Only submitted plans can be approved'
            ], 403);
        }

        $plan->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Plan approved successfully',
            'data' => $plan
        ]);
    }

    /**
     * Reject plan
     */
    public function reject(Request $request, $id)
    {
        $plan = RapbsPlan::findOrFail($id);

        if ($plan->status !== 'submitted') {
            return response()->json([
                'success' => false,
                'message' => 'Only submitted plans can be rejected'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'notes' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $plan->update(['status' => 'rejected']);

        // Add rejection note
        ActivityNote::create([
            'rapbs_plan_id' => $plan->id,
            'note_type' => 'issue',
            'title' => 'Plan Rejected',
            'content' => $request->notes,
            'created_by' => Auth::id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Plan rejected',
            'data' => $plan
        ]);
    }

    /**
     * Approve plan by Principal (Level 1)
     */
    public function approveByPrincipal($id)
    {
        $plan = RapbsPlan::findOrFail($id);

        // Cek status: Harus submitted
        if ($plan->status !== 'submitted') {
            return response()->json([
                'success' => false,
                'message' => 'Only submitted plans can be approved by principal'
            ], 403);
        }

        $user = Auth::user();

        // Cek role: Harus "Kepala Sekolah" atau role khusus RAPBS (case-insensitive, support multiple formats)
        $hasPrincipalRole = $user->roles()->where(function($q) {
            $q->where('name', 'Kepala Sekolah')
              ->orWhere('name', 'kepala_sekolah')
              ->orWhere('name', 'Kepala_Sekolah')
              ->orWhere('name', 'KEPALA_SEKOLAH')
              ->orWhere('name', 'kepsek_rapbs_&_divisi_unit')
              ->orWhere('name', 'Kepsek_RAPBS_&_Divisi_Unit')
              ->orWhereRaw('LOWER(name) = ?', ['kepala sekolah'])
              ->orWhereRaw('LOWER(name) = ?', ['kepala_sekolah'])
              ->orWhereRaw('LOWER(name) LIKE ?', ['%kepsek%rapbs%']);
        })->exists();
        
        if (!$hasPrincipalRole) {
            $userRoles = $user->roles()->pluck('name')->toArray();
            return response()->json([
                'success' => false,
                'message' => 'Only School Principal can approve at this level. Your roles: ' . implode(', ', $userRoles)
            ], 403);
        }

        // Cek unit kerja: Harus dari unit kerja yang sama
        if ($user->profile && $user->profile->unit_kerja) {
            $unitKerja = \App\Models\UnitKerja::where('nama', $user->profile->unit_kerja)->first();
            if (!$unitKerja || $plan->unit_kerja_id != $unitKerja->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only approve plans from your own unit'
                ], 403);
            }
        }

        $plan->update([
            'status' => 'approved_by_principal',
            'approved_by_principal' => $user->id,
            'approved_by_principal_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Plan approved by principal',
            'data' => $plan->load('approvedByPrincipal')
        ]);
    }

    /**
     * Approve plan by Dirpen (Level 2)
     */
    public function approveByDirpen($id)
    {
        $plan = RapbsPlan::findOrFail($id);

        // Cek status: Harus sudah approved by principal
        if ($plan->status !== 'approved_by_principal') {
            return response()->json([
                'success' => false,
                'message' => 'Plan must be approved by principal first'
            ], 403);
        }

        $user = Auth::user();

        // Cek role: Harus "Direktur Pendidikan" atau "Dirpen" (case-insensitive, support multiple formats)
        $hasDirpenRole = $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Pendidikan')
              ->orWhere('name', 'direktur_pendidikan')
              ->orWhere('name', 'Direktur_Pendidikan')
              ->orWhere('name', 'DIREKTUR_PENDIDIKAN')
              ->orWhere('name', 'Dirpen')
              ->orWhere('name', 'dirpen')
              ->orWhere('name', 'DIRPEN')
              ->orWhereRaw('LOWER(name) = ?', ['direktur pendidikan'])
              ->orWhereRaw('LOWER(name) = ?', ['direktur_pendidikan'])
              ->orWhereRaw('LOWER(name) LIKE ?', ['%dirpen%']);
        })->exists();
        
        if (!$hasDirpenRole) {
            $userRoles = $user->roles()->pluck('name')->toArray();
            return response()->json([
                'success' => false,
                'message' => 'Only Director of Education (Dirpen) can approve at this level. Your roles: ' . implode(', ', $userRoles)
            ], 403);
        }

        // Tidak perlu cek unit kerja (bisa global)

        $plan->update([
            'status' => 'approved_by_dirpen',
            'approved_by_dirpen' => $user->id,
            'approved_by_dirpen_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Plan approved by Dirpen',
            'data' => $plan->load(['approvedByPrincipal', 'approvedByDirpen'])
        ]);
    }

    /**
     * Approve plan by Director (Level 3 - Final)
     */
    public function approveByDirector($id)
    {
        $plan = RapbsPlan::findOrFail($id);

        // Cek status: Harus sudah approved by dirpen
        if ($plan->status !== 'approved_by_dirpen') {
            return response()->json([
                'success' => false,
                'message' => 'Plan must be approved by Dirpen first'
            ], 403);
        }

        $user = Auth::user();

        // Cek role: Harus "Direktur Keuangan" atau "Manajer Unit Sekolah" (case-insensitive, support multiple formats)
        $hasDirectorRole = $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Keuangan')
              ->orWhere('name', 'direktur_keuangan')
              ->orWhere('name', 'Direktur_Keuangan')
              ->orWhere('name', 'DIREKTUR_KEUANGAN')
              ->orWhere('name', 'Manajer Unit Sekolah')
              ->orWhere('name', 'manajer_unit_sekolah')
              ->orWhere('name', 'Manajer_Unit_Sekolah')
              ->orWhere('name', 'MANAJER_UNIT_SEKOLAH')
              ->orWhereRaw('LOWER(name) = ?', ['direktur keuangan'])
              ->orWhereRaw('LOWER(name) = ?', ['direktur_keuangan'])
              ->orWhereRaw('LOWER(name) = ?', ['manajer unit sekolah'])
              ->orWhereRaw('LOWER(name) = ?', ['manajer_unit_sekolah'])
              ->orWhereRaw('LOWER(name) LIKE ?', ['%manajer%unit%sekolah%']);
        })->exists();
        
        if (!$hasDirectorRole) {
            $userRoles = $user->roles()->pluck('name')->toArray();
            return response()->json([
                'success' => false,
                'message' => 'Only Finance Director or Manager Unit School can give final approval. Your roles: ' . implode(', ', $userRoles)
            ], 403);
        }

        // Tidak perlu cek unit kerja (bisa global)

        $plan->update([
            'status' => 'approved',
            'approved_by_director' => $user->id,
            'approved_by_director_at' => now(),
            'approved_by' => $user->id,  // Keep for backward compatibility
            'approved_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Plan approved by finance director (final)',
            'data' => $plan->load(['approvedByPrincipal', 'approvedByDirpen', 'approvedByDirector'])
        ]);
    }

    /**
     * Reject plan by Principal
     */
    public function rejectByPrincipal(Request $request, $id)
    {
        $plan = RapbsPlan::findOrFail($id);

        if ($plan->status !== 'submitted') {
            return response()->json([
                'success' => false,
                'message' => 'Only submitted plans can be rejected by principal'
            ], 403);
        }

        $user = Auth::user();

        // Cek role: Harus "Kepala Sekolah" (case-insensitive, support multiple formats)
        $hasPrincipalRole = $user->roles()->where(function($q) {
            $q->where('name', 'Kepala Sekolah')
              ->orWhere('name', 'kepala_sekolah')
              ->orWhere('name', 'Kepala_Sekolah')
              ->orWhere('name', 'KEPALA_SEKOLAH')
              ->orWhere('name', 'kepsek_rapbs_&_divisi_unit')
              ->orWhere('name', 'Kepsek_RAPBS_&_Divisi_Unit')
              ->orWhereRaw('LOWER(name) = ?', ['kepala sekolah'])
              ->orWhereRaw('LOWER(name) = ?', ['kepala_sekolah'])
              ->orWhereRaw('LOWER(name) LIKE ?', ['%kepsek%rapbs%']);
        })->exists();
        
        if (!$hasPrincipalRole) {
            $userRoles = $user->roles()->pluck('name')->toArray();
            return response()->json([
                'success' => false,
                'message' => 'Only School Principal can reject at this level. Your roles: ' . implode(', ', $userRoles)
            ], 403);
        }

        // Cek unit kerja
        if ($user->profile && $user->profile->unit_kerja) {
            $unitKerja = \App\Models\UnitKerja::where('nama', $user->profile->unit_kerja)->first();
            if (!$unitKerja || $plan->unit_kerja_id != $unitKerja->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only reject plans from your own unit'
                ], 403);
            }
        }

        $validator = Validator::make($request->all(), [
            'notes' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $plan->update([
            'status' => 'rejected_by_principal',
            'rejection_notes_principal' => $request->notes
        ]);

        // Add rejection note
        ActivityNote::create([
            'rapbs_plan_id' => $plan->id,
            'note_type' => 'issue',
            'title' => 'Plan Rejected by Principal',
            'content' => $request->notes,
            'created_by' => Auth::id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Plan rejected by principal',
            'data' => $plan
        ]);
    }

    /**
     * Reject plan by Dirpen
     */
    public function rejectByDirpen(Request $request, $id)
    {
        $plan = RapbsPlan::findOrFail($id);

        if ($plan->status !== 'approved_by_principal') {
            return response()->json([
                'success' => false,
                'message' => 'Only principal-approved plans can be rejected by Dirpen'
            ], 403);
        }

        $user = Auth::user();

        // Cek role: Harus "Direktur Pendidikan" atau "Dirpen" (case-insensitive, support multiple formats)
        $hasDirpenRole = $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Pendidikan')
              ->orWhere('name', 'direktur_pendidikan')
              ->orWhere('name', 'Direktur_Pendidikan')
              ->orWhere('name', 'DIREKTUR_PENDIDIKAN')
              ->orWhere('name', 'Dirpen')
              ->orWhere('name', 'dirpen')
              ->orWhere('name', 'DIRPEN')
              ->orWhereRaw('LOWER(name) = ?', ['direktur pendidikan'])
              ->orWhereRaw('LOWER(name) = ?', ['direktur_pendidikan'])
              ->orWhereRaw('LOWER(name) LIKE ?', ['%dirpen%']);
        })->exists();
        
        if (!$hasDirpenRole) {
            $userRoles = $user->roles()->pluck('name')->toArray();
            return response()->json([
                'success' => false,
                'message' => 'Only Director of Education (Dirpen) can reject at this level. Your roles: ' . implode(', ', $userRoles)
            ], 403);
        }

        // Tidak perlu cek unit kerja (bisa global)

        $validator = Validator::make($request->all(), [
            'notes' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $plan->update([
            'status' => 'rejected_by_dirpen',
            'rejection_notes_dirpen' => $request->notes
        ]);

        // Add rejection note
        ActivityNote::create([
            'rapbs_plan_id' => $plan->id,
            'note_type' => 'issue',
            'title' => 'Plan Rejected by Dirpen',
            'content' => $request->notes,
            'created_by' => Auth::id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Plan rejected by Dirpen',
            'data' => $plan
        ]);
    }

    /**
     * Reject plan by Director
     */
    public function rejectByDirector(Request $request, $id)
    {
        $plan = RapbsPlan::findOrFail($id);

        if ($plan->status !== 'approved_by_dirpen') {
            return response()->json([
                'success' => false,
                'message' => 'Only Dirpen-approved plans can be rejected by director'
            ], 403);
        }

        $user = Auth::user();

        // Cek role: Harus "Direktur Keuangan" atau "Manajer Unit Sekolah" (case-insensitive, support multiple formats)
        $hasDirectorRole = $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Keuangan')
              ->orWhere('name', 'direktur_keuangan')
              ->orWhere('name', 'Direktur_Keuangan')
              ->orWhere('name', 'DIREKTUR_KEUANGAN')
              ->orWhere('name', 'Manajer Unit Sekolah')
              ->orWhere('name', 'manajer_unit_sekolah')
              ->orWhere('name', 'Manajer_Unit_Sekolah')
              ->orWhere('name', 'MANAJER_UNIT_SEKOLAH')
              ->orWhereRaw('LOWER(name) = ?', ['direktur keuangan'])
              ->orWhereRaw('LOWER(name) = ?', ['direktur_keuangan'])
              ->orWhereRaw('LOWER(name) = ?', ['manajer unit sekolah'])
              ->orWhereRaw('LOWER(name) = ?', ['manajer_unit_sekolah'])
              ->orWhereRaw('LOWER(name) LIKE ?', ['%manajer%unit%sekolah%']);
        })->exists();
        
        if (!$hasDirectorRole) {
            $userRoles = $user->roles()->pluck('name')->toArray();
            return response()->json([
                'success' => false,
                'message' => 'Only Finance Director or Manager Unit School can reject at this level. Your roles: ' . implode(', ', $userRoles)
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'notes' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $plan->update([
            'status' => 'rejected_by_director',
            'rejection_notes_director' => $request->notes
        ]);

        // Add rejection note
        ActivityNote::create([
            'rapbs_plan_id' => $plan->id,
            'note_type' => 'issue',
            'title' => 'Plan Rejected by Finance Director',
            'content' => $request->notes,
            'created_by' => Auth::id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Plan rejected by finance director',
            'data' => $plan
        ]);
    }

    // Budget Breakdown Methods

    /**
     * Get budget breakdown
     */
    public function getBreakdown($planId)
    {
        $plan = RapbsPlan::findOrFail($planId);
        $breakdowns = $plan->budgetBreakdowns;

        return response()->json([
            'success' => true,
            'data' => $breakdowns
        ]);
    }

    /**
     * Add budget breakdown item
     */
    public function addBreakdown(Request $request, $planId)
    {
        $plan = RapbsPlan::findOrFail($planId);

        $validator = Validator::make($request->all(), [
            'item_name' => 'required|string|max:200',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $breakdown = BudgetBreakdown::create([
            'rapbs_plan_id' => $planId,
            'item_name' => $request->item_name,
            'quantity' => $request->quantity,
            'unit_price' => $request->unit_price,
            'total_amount' => $request->quantity * $request->unit_price,
            'notes' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Breakdown item added successfully',
            'data' => $breakdown
        ], 201);
    }

    /**
     * Update budget breakdown item
     */
    public function updateBreakdown(Request $request, $planId, $breakdownId)
    {
        $breakdown = BudgetBreakdown::where('rapbs_plan_id', $planId)
            ->findOrFail($breakdownId);

        $validator = Validator::make($request->all(), [
            'item_name' => 'sometimes|string|max:200',
            'quantity' => 'sometimes|integer|min:1',
            'unit_price' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $breakdown->update($request->only([
            'item_name',
            'quantity',
            'unit_price',
            'notes'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Breakdown item updated successfully',
            'data' => $breakdown
        ]);
    }

    /**
     * Delete budget breakdown item
     */
    public function deleteBreakdown($planId, $breakdownId)
    {
        $breakdown = BudgetBreakdown::where('rapbs_plan_id', $planId)
            ->findOrFail($breakdownId);

        $breakdown->delete();

        return response()->json([
            'success' => true,
            'message' => 'Breakdown item deleted successfully'
        ]);
    }

    // Document Methods

    /**
     * Upload document
     */
    public function uploadDocument(Request $request, $planId)
    {
        $plan = RapbsPlan::findOrFail($planId);

        $validator = Validator::make($request->all(), [
            'document_type' => 'required|in:proposal,budget_detail,supporting_doc',
            'file' => 'required|file|max:10240' // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('rapbs/documents', $filename, 'public');

        $document = RapbsDocument::create([
            'rapbs_plan_id' => $planId,
            'document_type' => $request->document_type,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => Auth::id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'data' => $document
        ], 201);
    }

    /**
     * Delete document
     */
    public function deleteDocument($planId, $documentId)
    {
        $document = RapbsDocument::where('rapbs_plan_id', $planId)
            ->findOrFail($documentId);

        // Delete file from storage
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully'
        ]);
    }

    /**
     * Get documents
     */
    public function getDocuments($planId)
    {
        $plan = RapbsPlan::findOrFail($planId);
        $documents = $plan->documents()->with('uploadedBy')->get();

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    // Activity Notes Methods

    /**
     * Get activity notes
     */
    public function getNotes($planId)
    {
        $plan = RapbsPlan::findOrFail($planId);
        $notes = $plan->activityNotes()->with('createdBy')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $notes
        ]);
    }

    /**
     * Add activity note
     */
    public function addNote(Request $request, $planId)
    {
        $plan = RapbsPlan::findOrFail($planId);

        $validator = Validator::make($request->all(), [
            'note_type' => 'required|in:progress,issue,completion',
            'title' => 'required|string|max:200',
            'content' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $note = ActivityNote::create([
            'rapbs_plan_id' => $planId,
            'note_type' => $request->note_type,
            'title' => $request->title,
            'content' => $request->content,
            'created_by' => Auth::id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Note added successfully',
            'data' => $note->load('createdBy')
        ], 201);
    }
}

