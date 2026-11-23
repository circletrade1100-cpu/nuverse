<?php

namespace App\Http\Controllers;

use App\Models\Lpj;
use App\Models\LpjRapbsPlan;
use App\Models\LpjDocument;
use App\Models\LpjNote;
use App\Models\RapbsPlan;
use App\Models\RapbsRealization;
use App\Models\UnitKerja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class LPJController extends Controller
{
    /**
     * Get all LPJs
     */
    public function index(Request $request)
    {
        $query = Lpj::query();

        // Filter berdasarkan unit_kerja_id user yang login (kecuali Super Admin dan Dirpen/Direktur)
        $user = Auth::user();
        $isSuperAdmin = $user && $user->roles()->where('name', 'Super Administrator')->exists();
        
        $isDirpen = $user && $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Pendidikan')
              ->orWhere('name', 'direktur_pendidikan')
              ->orWhere('name', 'Dirpen')
              ->orWhereRaw('LOWER(name) LIKE ?', ['%dirpen%']);
        })->exists();
        
        $isDirector = $user && $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Keuangan')
              ->orWhere('name', 'direktur_keuangan')
              ->orWhereRaw('LOWER(name) LIKE ?', ['%direktur%keuangan%']);
        })->exists();
        
        $userUnitKerjaId = null;
        if (!$isSuperAdmin && !$isDirpen && !$isDirector && $user && $user->profile && $user->profile->unit_kerja) {
            $unitKerja = \App\Models\UnitKerja::where('nama', $user->profile->unit_kerja)->first();
            if ($unitKerja) {
                $userUnitKerjaId = $unitKerja->id;
                $query->where(function($q) use ($unitKerja) {
                    $q->where('unit_kerja_id', $unitKerja->id)
                      ->orWhereNull('unit_kerja_id');
                });
            }
        }

        // Filter berdasarkan status untuk approver
        if ($user && !$isSuperAdmin) {
            if ($isDirpen) {
                if (!$request->has('status')) {
                    $query->whereIn('status', ['approved_by_principal', 'approved_by_dirpen', 'rejected_by_dirpen']);
                }
            } elseif ($isDirector) {
                if (!$request->has('status')) {
                    $query->whereIn('status', ['approved_by_dirpen', 'approved', 'rejected_by_director']);
                }
            } else {
                $isApprover = $user->roles()->where(function($q) {
                    $q->where('name', 'Kepala Sekolah')
                      ->orWhere('name', 'kepala_sekolah')
                      ->orWhereRaw('LOWER(name) LIKE ?', ['%kepsek%rapbs%']);
                })->exists();

                if ($isApprover) {
                    $query->where(function($q) use ($userUnitKerjaId) {
                        $q->where('status', '!=', 'draft');
                        if ($userUnitKerjaId) {
                            $q->orWhere(function($subQ) use ($userUnitKerjaId) {
                                $subQ->where('status', 'draft')
                                     ->where('unit_kerja_id', $userUnitKerjaId);
                            });
                        }
                    });
                } else {
                    $query->where(function($q) use ($user) {
                        $q->where('status', '!=', 'draft')
                          ->orWhere('created_by', $user->id);
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

        if ($request->has('unit_kerja_id')) {
            $query->where('unit_kerja_id', $request->unit_kerja_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('periode_type')) {
            $query->where('periode_type', $request->periode_type);
        }

        $perPage = $request->get('per_page', 10);
        $lpjs = $query->with(['academicYear', 'unitKerja', 'createdBy'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $lpjs
        ]);
    }

    /**
     * Get LPJ by ID
     */
    public function show($id)
    {
        $lpj = Lpj::with([
            'academicYear',
            'unitKerja',
            'createdBy.profile',
            'approvedByPrincipal',
            'approvedByDirpen',
            'approvedByDirector',
            'rapbsPlans.rapbsPlan.activityCategory',
            'rapbsPlans.rapbsPlan.fundingSource',
            'rapbsPlans.rapbsPlan.unitKerja',
            'rapbsPlans.rapbsPlan.realizations' => function($q) {
                $q->where('status', 'approved');
            },
            'documents',
            'notes.createdBy'
        ])->findOrFail($id);

        // Auto-fill unit_kerja_id from created_by user if not set
        if (!$lpj->unit_kerja_id && $lpj->createdBy && $lpj->createdBy->profile && $lpj->createdBy->profile->unit_kerja) {
            $unitKerja = UnitKerja::where('nama', $lpj->createdBy->profile->unit_kerja)->first();
            if ($unitKerja) {
                $lpj->unit_kerja_id = $unitKerja->id;
                $lpj->save();
                // Reload with unitKerja
                $lpj->load('unitKerja');
            }
        }

        // Calculate summary data
        $summary = $this->calculateSummary($lpj);

        return response()->json([
            'success' => true,
            'data' => $lpj,
            'summary' => $summary
        ]);
    }

    /**
     * Create new LPJ
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'academic_year_id' => 'required|exists:academic_years,id',
            'unit_kerja_id' => 'nullable|exists:unit_kerjas,id',
            'periode_type' => 'required|in:semester,tahunan',
            'periode_start_date' => 'required|date',
            'periode_end_date' => 'required|date|after_or_equal:periode_start_date',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'rapbs_plan_ids' => 'nullable|array',
            'rapbs_plan_ids.*' => 'exists:rapbs_plans,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get unit_kerja_id from user profile if not provided
        $unitKerjaId = $request->unit_kerja_id;
        if (!$unitKerjaId) {
            $user = Auth::user();
            if ($user && $user->profile && $user->profile->unit_kerja) {
                $unitKerja = UnitKerja::where('nama', $user->profile->unit_kerja)->first();
                if ($unitKerja) {
                    $unitKerjaId = $unitKerja->id;
                }
            }
        }

        $lpj = Lpj::create([
            'academic_year_id' => $request->academic_year_id,
            'unit_kerja_id' => $unitKerjaId,
            'periode_type' => $request->periode_type,
            'periode_start_date' => $request->periode_start_date,
            'periode_end_date' => $request->periode_end_date,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'draft',
            'created_by' => Auth::id(),
        ]);

        // Attach RAPBS plans if provided
        if ($request->has('rapbs_plan_ids') && is_array($request->rapbs_plan_ids)) {
            foreach ($request->rapbs_plan_ids as $planId) {
                LpjRapbsPlan::create([
                    'lpj_id' => $lpj->id,
                    'rapbs_plan_id' => $planId,
                ]);
            }
        } else {
            // Auto-include all approved plans in the period
            $this->autoIncludePlans($lpj);
        }

        return response()->json([
            'success' => true,
            'message' => 'LPJ created successfully',
            'data' => $lpj->load(['rapbsPlans.rapbsPlan'])
        ], 201);
    }

    /**
     * Update LPJ
     */
    public function update(Request $request, $id)
    {
        $lpj = Lpj::findOrFail($id);

        // Only draft and rejected LPJs can be updated
        $editableStatuses = [
            'draft',
            'rejected',
            'rejected_by_principal',
            'rejected_by_dirpen',
            'rejected_by_director',
        ];

        if (!in_array($lpj->status, $editableStatuses, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Only draft and rejected LPJs can be updated'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'academic_year_id' => 'sometimes|required|exists:academic_years,id',
            'unit_kerja_id' => 'nullable|exists:unit_kerjas,id',
            'periode_type' => 'sometimes|required|in:semester,tahunan',
            'periode_start_date' => 'sometimes|required|date',
            'periode_end_date' => 'sometimes|required|date|after_or_equal:periode_start_date',
            'title' => 'sometimes|required|string|max:200',
            'description' => 'nullable|string',
            'rapbs_plan_ids' => 'nullable|array',
            'rapbs_plan_ids.*' => 'exists:rapbs_plans,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $lpj->update($request->only([
            'academic_year_id',
            'unit_kerja_id',
            'periode_type',
            'periode_start_date',
            'periode_end_date',
            'title',
            'description',
        ]));

        // Update RAPBS plans if provided
        if ($request->has('rapbs_plan_ids')) {
            // Delete existing relations
            LpjRapbsPlan::where('lpj_id', $lpj->id)->delete();
            
            // Create new relations
            foreach ($request->rapbs_plan_ids as $planId) {
                LpjRapbsPlan::create([
                    'lpj_id' => $lpj->id,
                    'rapbs_plan_id' => $planId,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'LPJ updated successfully',
            'data' => $lpj->load(['rapbsPlans.rapbsPlan'])
        ]);
    }

    /**
     * Delete LPJ
     */
    public function destroy($id)
    {
        $lpj = Lpj::findOrFail($id);

        // Only draft and rejected LPJs can be deleted
        $deletableStatuses = [
            'draft',
            'rejected',
            'rejected_by_principal',
            'rejected_by_dirpen',
            'rejected_by_director',
        ];

        if (!in_array($lpj->status, $deletableStatuses, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Only draft and rejected LPJs can be deleted'
            ], 403);
        }

        $lpj->delete();

        return response()->json([
            'success' => true,
            'message' => 'LPJ deleted successfully'
        ]);
    }

    /**
     * Submit LPJ for approval
     */
    public function submit($id)
    {
        $lpj = Lpj::findOrFail($id);

        if (!in_array($lpj->status, ['draft', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only draft and rejected LPJs can be submitted'
            ], 403);
        }

        $lpj->update([
            'status' => 'submitted',
            'submitted_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'LPJ submitted for approval',
            'data' => $lpj
        ]);
    }

    /**
     * Approve LPJ by Principal (Level 1)
     */
    public function approveByPrincipal($id)
    {
        $lpj = Lpj::findOrFail($id);

        if ($lpj->status !== 'submitted') {
            return response()->json([
                'success' => false,
                'message' => 'Only submitted LPJs can be approved by principal'
            ], 403);
        }

        $user = Auth::user();

        $hasPrincipalRole = $user->roles()->where(function($q) {
            $q->where('name', 'Kepala Sekolah')
              ->orWhere('name', 'kepala_sekolah')
              ->orWhere('name', 'kepsek_rapbs_&_divisi_unit')
              ->orWhere('name', 'Kepsek RAPBS & Divisi Unit')
              ->orWhereRaw('LOWER(name) LIKE ?', ['%kepsek%rapbs%'])
              ->orWhereRaw('LOWER(name) LIKE ?', ['%kepsek%divisi%']);
        })->exists();
        
        if (!$hasPrincipalRole) {
            return response()->json([
                'success' => false,
                'message' => 'Only School Principal can approve at this level'
            ], 403);
        }

        // Cek unit kerja: Harus dari unit kerja yang sama dengan LPJ
        if ($user->profile && $user->profile->unit_kerja && $lpj->unit_kerja_id) {
            $unitKerja = \App\Models\UnitKerja::where('nama', $user->profile->unit_kerja)->first();
            if (!$unitKerja || $lpj->unit_kerja_id != $unitKerja->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only approve LPJs from your own unit'
                ], 403);
            }
        }

        $lpj->update([
            'status' => 'approved_by_principal',
            'approved_by_principal' => $user->id,
            'approved_by_principal_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'LPJ approved by principal',
            'data' => $lpj->load('approvedByPrincipal')
        ]);
    }

    /**
     * Approve LPJ by Dirpen (Level 2)
     */
    public function approveByDirpen($id)
    {
        $lpj = Lpj::findOrFail($id);

        if ($lpj->status !== 'approved_by_principal') {
            return response()->json([
                'success' => false,
                'message' => 'LPJ must be approved by principal first'
            ], 403);
        }

        $user = Auth::user();

        $hasDirpenRole = $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Pendidikan')
              ->orWhere('name', 'direktur_pendidikan')
              ->orWhere('name', 'Dirpen')
              ->orWhereRaw('LOWER(name) LIKE ?', ['%dirpen%']);
        })->exists();
        
        if (!$hasDirpenRole) {
            return response()->json([
                'success' => false,
                'message' => 'Only Director of Education (Dirpen) can approve at this level'
            ], 403);
        }

        $lpj->update([
            'status' => 'approved_by_dirpen',
            'approved_by_dirpen' => $user->id,
            'approved_by_dirpen_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'LPJ approved by Dirpen',
            'data' => $lpj->load(['approvedByPrincipal', 'approvedByDirpen'])
        ]);
    }

    /**
     * Approve LPJ by Director (Level 3 - Final)
     */
    public function approveByDirector($id)
    {
        $lpj = Lpj::findOrFail($id);

        if ($lpj->status !== 'approved_by_dirpen') {
            return response()->json([
                'success' => false,
                'message' => 'LPJ must be approved by Dirpen first'
            ], 403);
        }

        $user = Auth::user();

        $hasDirectorRole = $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Keuangan')
              ->orWhere('name', 'direktur_keuangan')
              ->orWhereRaw('LOWER(name) LIKE ?', ['%direktur%keuangan%']);
        })->exists();
        
        if (!$hasDirectorRole) {
            return response()->json([
                'success' => false,
                'message' => 'Only Finance Director can give final approval'
            ], 403);
        }

        $lpj->update([
            'status' => 'approved',
            'approved_by_director' => $user->id,
            'approved_by_director_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'LPJ approved by Director',
            'data' => $lpj->load(['approvedByPrincipal', 'approvedByDirpen', 'approvedByDirector'])
        ]);
    }

    /**
     * Reject LPJ
     */
    public function reject(Request $request, $id)
    {
        $lpj = Lpj::findOrFail($id);
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'rejection_notes' => 'required|string',
            'rejection_level' => 'required|in:principal,dirpen,director'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $rejectionLevel = $request->rejection_level;
        $status = 'rejected';
        $notesField = 'rejection_notes';

        if ($rejectionLevel === 'principal') {
            if ($lpj->status !== 'submitted') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only reject submitted LPJs at this level'
                ], 403);
            }
            $status = 'rejected_by_principal';
            $notesField = 'rejection_notes_principal';
        } elseif ($rejectionLevel === 'dirpen') {
            if ($lpj->status !== 'approved_by_principal') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only reject LPJs approved by principal at this level'
                ], 403);
            }
            $status = 'rejected_by_dirpen';
            $notesField = 'rejection_notes_dirpen';
        } elseif ($rejectionLevel === 'director') {
            if ($lpj->status !== 'approved_by_dirpen') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only reject LPJs approved by Dirpen at this level'
                ], 403);
            }
            $status = 'rejected_by_director';
            $notesField = 'rejection_notes_director';
        }

        $lpj->update([
            'status' => $status,
            $notesField => $request->rejection_notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'LPJ rejected',
            'data' => $lpj
        ]);
    }

    /**
     * Finalize LPJ
     */
    public function finalize($id)
    {
        $lpj = Lpj::findOrFail($id);

        if ($lpj->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Only approved LPJs can be finalized'
            ], 403);
        }

        $lpj->update([
            'status' => 'finalized',
            'finalized_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'LPJ finalized successfully',
            'data' => $lpj
        ]);
    }

    /**
     * Get LPJ summary
     */
    public function summary($id)
    {
        $lpj = Lpj::with(['rapbsPlans.rapbsPlan'])->findOrFail($id);
        $summary = $this->calculateSummary($lpj);

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }

    /**
     * Upload document
     */
    public function uploadDocument(Request $request, $id)
    {
        $lpj = Lpj::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'document_type' => 'required|in:cover_letter,legal_doc,photo,other',
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('lpj_documents', $fileName, 'public');

        $document = LpjDocument::create([
            'lpj_id' => $lpj->id,
            'document_type' => $request->document_type,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => Auth::id(),
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
    public function deleteDocument($id, $documentId)
    {
        $lpj = Lpj::findOrFail($id);
        $document = LpjDocument::where('lpj_id', $lpj->id)->findOrFail($documentId);

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
     * Add note
     */
    public function addNote(Request $request, $id)
    {
        $lpj = Lpj::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'note_type' => 'required|in:summary,issue,achievement,recommendation',
            'title' => 'required|string|max:200',
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $note = LpjNote::create([
            'lpj_id' => $lpj->id,
            'note_type' => $request->note_type,
            'title' => $request->title,
            'content' => $request->content,
            'created_by' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Note added successfully',
            'data' => $note->load('createdBy')
        ], 201);
    }

    /**
     * Get available RAPBS plans for LPJ
     * This method returns all approved plans that can be included in LPJ
     * More flexible than RAPBSPlanController::index for LPJ purposes
     */
    public function getAvailablePlans(Request $request)
    {
        $academicYearId = $request->get('academic_year_id');
        
        if (!$academicYearId) {
            return response()->json([
                'success' => false,
                'message' => 'Academic year ID is required'
            ], 422);
        }

        $query = RapbsPlan::query();

        // Filter by academic year
        $query->where('academic_year_id', $academicYearId);

        // Only get approved plans (final or intermediate approval)
        $query->whereIn('status', [
            'approved',              // Final approval
            'approved_by_dirpen',    // Level 2 approval
            'approved_by_principal'  // Level 1 approval
        ]);

        // Filter berdasarkan unit_kerja user (jika bukan Super Admin/Dirpen/Direktur)
        $user = Auth::user();
        $isSuperAdmin = $user && $user->roles()->where('name', 'Super Administrator')->exists();
        
        $isDirpen = $user && $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Pendidikan')
              ->orWhere('name', 'direktur_pendidikan')
              ->orWhere('name', 'Dirpen')
              ->orWhereRaw('LOWER(name) LIKE ?', ['%dirpen%']);
        })->exists();
        
        $isDirector = $user && $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Keuangan')
              ->orWhere('name', 'direktur_keuangan')
              ->orWhereRaw('LOWER(name) LIKE ?', ['%direktur%keuangan%']);
        })->exists();

        // Untuk LPJ, kita sangat fleksibel - semua user yang punya akses LPJ bisa lihat SEMUA approved plans
        // Karena LPJ adalah laporan pertanggungjawaban yang perlu mencakup semua approved plans
        // Tidak perlu filter berdasarkan unit_kerja untuk endpoint ini
        // Semua approved plans untuk tahun ajaran tersebut bisa digunakan untuk LPJ
        
        // Catatan: Tidak ada filter unit_kerja di sini karena:
        // 1. LPJ adalah dokumen formal yang perlu mencakup semua approved plans
        // 2. User yang membuat LPJ sudah memiliki permission untuk modul LPJ
        // 3. Filter unit_kerja akan dilakukan di level LPJ itu sendiri, bukan di level plans

        $plans = $query->with([
            'academicYear:id,year',
            'activityCategory:id,name',
            'fundingSource:id,name',
            'unitKerja:id,nama'
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        // Log untuk debugging
        \Log::info('LPJ Available Plans', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'is_super_admin' => $isSuperAdmin,
            'is_dirpen' => $isDirpen,
            'is_director' => $isDirector,
            'academic_year_id' => $academicYearId,
            'total_plans' => $plans->count(),
            'plans_sample' => $plans->take(5)->map(function($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'status' => $p->status,
                    'unit_kerja_id' => $p->unit_kerja_id,
                    'academic_year_id' => $p->academic_year_id
                ];
            })->toArray()
        ]);

        return response()->json([
            'success' => true,
            'data' => $plans
        ]);
    }

    /**
     * Auto-include approved plans in period
     */
    private function autoIncludePlans(Lpj $lpj)
    {
        $plans = RapbsPlan::where('status', 'approved')
            ->where('academic_year_id', $lpj->academic_year_id)
            ->where(function($q) use ($lpj) {
                if ($lpj->unit_kerja_id) {
                    $q->where('unit_kerja_id', $lpj->unit_kerja_id)
                      ->orWhereNull('unit_kerja_id');
                }
            })
            ->get();

        foreach ($plans as $plan) {
            // Check if plan has approved realizations in the period
            $hasRealizations = RapbsRealization::where('rapbs_plan_id', $plan->id)
                ->where('status', 'approved')
                ->whereBetween('transaction_date', [
                    $lpj->periode_start_date,
                    $lpj->periode_end_date
                ])
                ->exists();

            if ($hasRealizations) {
                LpjRapbsPlan::create([
                    'lpj_id' => $lpj->id,
                    'rapbs_plan_id' => $plan->id,
                ]);
            }
        }
    }

    /**
     * Calculate summary data
     */
    private function calculateSummary(Lpj $lpj)
    {
        $totalPlanned = 0;
        $totalRealized = 0;
        $byCategory = [];
        $byFundingSource = [];

        foreach ($lpj->rapbsPlans as $lpjPlan) {
            $plan = $lpjPlan->rapbsPlan;
            $totalPlanned += $plan->planned_amount;

            $realizations = RapbsRealization::where('rapbs_plan_id', $plan->id)
                ->where('status', 'approved')
                ->whereBetween('transaction_date', [
                    $lpj->periode_start_date,
                    $lpj->periode_end_date
                ])
                ->sum('amount');

            $totalRealized += $realizations;

            // By category
            $categoryName = $plan->activityCategory->name ?? 'Unknown';
            if (!isset($byCategory[$categoryName])) {
                $byCategory[$categoryName] = [
                    'planned' => 0,
                    'realized' => 0,
                ];
            }
            $byCategory[$categoryName]['planned'] += $plan->planned_amount;
            $byCategory[$categoryName]['realized'] += $realizations;

            // By funding source
            $sourceName = $plan->fundingSource->name ?? 'Unknown';
            if (!isset($byFundingSource[$sourceName])) {
                $byFundingSource[$sourceName] = [
                    'planned' => 0,
                    'realized' => 0,
                ];
            }
            $byFundingSource[$sourceName]['planned'] += $plan->planned_amount;
            $byFundingSource[$sourceName]['realized'] += $realizations;
        }

        $remaining = $totalPlanned - $totalRealized;
        $utilizationRate = $totalPlanned > 0 ? ($totalRealized / $totalPlanned) * 100 : 0;

        return [
            'total_planned' => $totalPlanned,
            'total_realized' => $totalRealized,
            'remaining' => $remaining,
            'utilization_rate' => round($utilizationRate, 2),
            'by_category' => $byCategory,
            'by_funding_source' => $byFundingSource,
        ];
    }
}
