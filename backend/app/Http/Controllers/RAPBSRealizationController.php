<?php

namespace App\Http\Controllers;

use App\Models\RapbsRealization;
use App\Models\RealizationDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class RAPBSRealizationController extends Controller
{
    /**
     * Get all realizations
     */
    public function index(Request $request)
    {
        $query = RapbsRealization::with([
            'rapbsPlan',
            'rapbsPlan.unitKerja:id,nama',
            'approvedByPrincipal',
            'approvedByDirpen',
            'approvedByDirector'
        ]);

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
        
        // Cek apakah user adalah Kepala Sekolah
        $isPrincipal = $user && $user->roles()->where(function($q) {
            $q->where('name', 'Kepala Sekolah')
              ->orWhere('name', 'kepala_sekolah')
              ->orWhere('name', 'Kepala_Sekolah')
              ->orWhere('name', 'kepsek_rapbs_&_divisi_unit')
              ->orWhere('name', 'Kepsek_RAPBS_&_Divisi_Unit')
              ->orWhereRaw('LOWER(name) LIKE ?', ['%kepsek%'])
              ->orWhereRaw('LOWER(name) LIKE ?', ['%kepala%sekolah%']);
        })->exists();
        
        // Filter unit_kerja hanya untuk user biasa, bukan untuk Dirpen/Direktur
        if (!$isSuperAdmin && !$isDirpen && !$isDirector && $user && $user->profile && $user->profile->unit_kerja) {
            // Cari unit_kerja_id berdasarkan nama unit_kerja
            $unitKerja = \App\Models\UnitKerja::where('nama', $user->profile->unit_kerja)->first();
            if ($unitKerja) {
                // Filter realisasi berdasarkan unit_kerja_id dari plan
                // Include juga realisasi yang plan-nya tidak punya unit_kerja_id (NULL) untuk fleksibilitas
                $query->whereHas('rapbsPlan', function($q) use ($unitKerja) {
                    $q->where(function($subQuery) use ($unitKerja) {
                        $subQuery->where('unit_kerja_id', $unitKerja->id)
                                 ->orWhereNull('unit_kerja_id');
                    });
                });
            }
        }
        
        // Filter untuk Kepala Sekolah: tidak menampilkan realisasi dengan status pending
        if ($isPrincipal && !$request->has('status')) {
            $query->where('status', '!=', 'pending');
        }
        
        // Filter default untuk dirpen: hanya menampilkan data yang sudah approved_by_principal atau approved_by_dirpen
        if ($isDirpen && !$request->has('status')) {
            $query->whereIn('status', ['approved_by_principal', 'approved_by_dirpen', 'rejected_by_dirpen']);
        }
        
        // Filter default untuk direktur: hanya menampilkan data yang sudah approved_by_dirpen
        if ($isDirector && !$request->has('status')) {
            $query->whereIn('status', ['approved_by_dirpen', 'approved', 'rejected_by_director']);
        }

        // Filters
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('vendor_name', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        if ($request->has('rapbs_plan_id')) {
            $query->where('rapbs_plan_id', $request->rapbs_plan_id);
        }

        if ($request->has('start_date')) {
            $query->where('transaction_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('transaction_date', '<=', $request->end_date);
        }

        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('unit_kerja_id')) {
            $query->whereHas('rapbsPlan', function($q) use ($request) {
                $q->where('unit_kerja_id', $request->unit_kerja_id);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 10);
        // Sort by created_at descending (terbaru di atas)
        $realizations = $query->latest('created_at')->paginate($perPage);

        // Debug: Check if unitKerja is loaded
        if ($realizations->count() > 0) {
            $first = $realizations->first();
            \Log::info('First realization debug', [
                'realization_id' => $first->id,
                'has_rapbs_plan' => $first->rapbsPlan ? 'yes' : 'no',
                'plan_id' => $first->rapbsPlan?->id,
                'plan_unit_kerja_id' => $first->rapbsPlan?->unit_kerja_id,
                'has_unit_kerja' => $first->rapbsPlan?->unitKerja ? 'yes' : 'no',
                'unit_kerja_nama' => $first->rapbsPlan?->unitKerja?->nama ?? 'null',
            ]);
        }

        // Log untuk debugging
        \Log::info('RAPBS Realizations query', [
            'user_id' => $user?->id,
            'is_super_admin' => $isSuperAdmin ?? false,
            'is_dirpen' => $isDirpen ?? false,
            'is_director' => $isDirector ?? false,
            'status_filter' => $request->get('status'),
            'total' => $realizations->total(),
            'count' => $realizations->count(),
            'current_page' => $realizations->currentPage(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $realizations
        ]);
    }

    /**
     * Get single realization
     */
    public function show($id)
    {
        $realization = RapbsRealization::with([
            'rapbsPlan',
            'rapbsPlan.unitKerja:id,nama',
            'documents',
            'createdBy',
            'approvedBy',
            'approvedByPrincipal',
            'approvedByDirpen',
            'approvedByDirector'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $realization
        ]);
    }

    /**
     * Create new realization
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rapbs_plan_id' => 'required|exists:rapbs_plans,id',
            'transaction_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
            'vendor_name' => 'required|string|max:200',
            'payment_method' => 'required|in:cash,transfer,check',
            'reference_number' => 'nullable|string|max:100',
            'documents.*' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $realization = RapbsRealization::create([
            'rapbs_plan_id' => $request->rapbs_plan_id,
            'transaction_date' => $request->transaction_date,
            'amount' => $request->amount,
            'description' => $request->description,
            'vendor_name' => $request->vendor_name,
            'payment_method' => $request->payment_method,
            'reference_number' => $request->reference_number,
            'created_by' => Auth::id(),
            'status' => 'pending'
        ]);

        // Handle file uploads
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('realization_documents', $fileName, 'public');
                
                RealizationDocument::create([
                    'realization_id' => $realization->id,
                    'document_type' => 'receipt',
                    'file_name' => $fileName,
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        $realization->load(['documents', 'rapbsPlan']);

        return response()->json([
            'success' => true,
            'message' => 'Realization created successfully',
            'data' => $realization
        ], 201);
    }

    /**
     * Update realization
     */
    public function update(Request $request, $id)
    {
        $realization = RapbsRealization::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'rapbs_plan_id' => 'sometimes|exists:rapbs_plans,id',
            'transaction_date' => 'sometimes|date',
            'amount' => 'sometimes|numeric|min:0',
            'description' => 'sometimes|string',
            'vendor_name' => 'sometimes|string|max:200',
            'payment_method' => 'sometimes|in:cash,transfer,check',
            'reference_number' => 'nullable|string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $realization->update($request->only([
            'rapbs_plan_id',
            'transaction_date',
            'amount',
            'description',
            'vendor_name',
            'payment_method',
            'reference_number'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Realization updated successfully',
            'data' => $realization
        ]);
    }

    /**
     * Delete realization
     */
    public function destroy($id)
    {
        $realization = RapbsRealization::findOrFail($id);
        $realization->delete();

        return response()->json([
            'success' => true,
            'message' => 'Realization deleted successfully'
        ]);
    }

    // Realization Document Methods

    /**
     * Upload realization document
     */
    public function uploadDocument(Request $request, $realizationId)
    {
        $realization = RapbsRealization::findOrFail($realizationId);

        $validator = Validator::make($request->all(), [
            'document_type' => 'required|in:receipt,invoice,fpu,other',
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
        $path = $file->storeAs('rapbs/realization-documents', $filename, 'public');

        $document = RealizationDocument::create([
            'realization_id' => $realizationId,
            'document_type' => $request->document_type,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'validation_status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'data' => $document
        ], 201);
    }

    /**
     * Validate realization document
     */
    public function validateDocument(Request $request, $realizationId, $documentId)
    {
        $document = RealizationDocument::where('realization_id', $realizationId)
            ->findOrFail($documentId);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:validated,rejected',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $document->update([
            'validation_status' => $request->status,
            'validated_by' => Auth::id(),
            'validated_at' => now(),
            'notes' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document validation updated',
            'data' => $document
        ]);
    }

    /**
     * Get realization documents
     */
    public function getDocuments($realizationId)
    {
        $realization = RapbsRealization::findOrFail($realizationId);
        $documents = $realization->documents()->with('validatedBy')->get();

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    /**
     * Submit realization for approval
     */
    public function submit(Request $request, $id)
    {
        $realization = RapbsRealization::findOrFail($id);

        if ($realization->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending realizations can be submitted'
            ], 403);
        }

        $realization->update([
            'status' => 'submitted'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Realization submitted successfully',
            'data' => $realization
        ]);
    }

    /**
     * Approve realization by Principal (Level 1)
     */
    public function approveByPrincipal($id)
    {
        $realization = RapbsRealization::findOrFail($id);

        // Cek status: Harus submitted
        if ($realization->status !== 'submitted') {
            return response()->json([
                'success' => false,
                'message' => 'Only submitted realizations can be approved by principal'
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

        // Cek unit kerja: Harus dari unit kerja yang sama dengan plan
        $plan = $realization->rapbsPlan;
        if ($user->profile && $user->profile->unit_kerja && $plan->unit_kerja_id) {
            $unitKerja = \App\Models\UnitKerja::where('nama', $user->profile->unit_kerja)->first();
            if (!$unitKerja || $plan->unit_kerja_id != $unitKerja->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only approve realizations from your own unit'
                ], 403);
            }
        }

        $realization->update([
            'status' => 'approved_by_principal',
            'approved_by_principal' => $user->id,
            'approved_by_principal_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Realization approved by principal',
            'data' => $realization->load('approvedByPrincipal')
        ]);
    }

    /**
     * Approve realization by Dirpen (Level 2)
     */
    public function approveByDirpen($id)
    {
        $realization = RapbsRealization::findOrFail($id);

        // Cek status: Harus sudah approved by principal
        if ($realization->status !== 'approved_by_principal') {
            return response()->json([
                'success' => false,
                'message' => 'Realization must be approved by principal first'
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

        $realization->update([
            'status' => 'approved_by_dirpen',
            'approved_by_dirpen' => $user->id,
            'approved_by_dirpen_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Realization approved by Dirpen',
            'data' => $realization->load(['approvedByPrincipal', 'approvedByDirpen'])
        ]);
    }

    /**
     * Approve realization by Director (Level 3 - Final)
     */
    public function approveByDirector($id)
    {
        $realization = RapbsRealization::findOrFail($id);

        // Cek status: Harus sudah approved by dirpen
        if ($realization->status !== 'approved_by_dirpen') {
            return response()->json([
                'success' => false,
                'message' => 'Realization must be approved by Dirpen first'
            ], 403);
        }

        $user = Auth::user();

        // Cek role: Harus "Direktur Keuangan" (case-insensitive, support multiple formats)
        $hasDirectorRole = $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Keuangan')
              ->orWhere('name', 'direktur_keuangan')
              ->orWhere('name', 'Direktur_Keuangan')
              ->orWhere('name', 'DIREKTUR_KEUANGAN')
              ->orWhereRaw('LOWER(name) = ?', ['direktur keuangan'])
              ->orWhereRaw('LOWER(name) = ?', ['direktur_keuangan']);
        })->exists();
        
        if (!$hasDirectorRole) {
            $userRoles = $user->roles()->pluck('name')->toArray();
            return response()->json([
                'success' => false,
                'message' => 'Only Finance Director can give final approval. Your roles: ' . implode(', ', $userRoles)
            ], 403);
        }

        // Tidak perlu cek unit kerja (bisa global)

        $plan = $realization->rapbsPlan;

        // Check if there's enough budget
        $remainingBudget = $plan->planned_amount - $plan->realized_amount;
        if ($realization->amount > $remainingBudget) {
            return response()->json([
                'success' => false,
                'message' => 'Realization amount exceeds remaining budget'
            ], 422);
        }

        // Update realization status
        $realization->update([
            'status' => 'approved',
            'approved_by_director' => $user->id,
            'approved_by_director_at' => now(),
            'approved_by' => $user->id,  // Keep for backward compatibility
            'approved_at' => now()
        ]);

        // Kurangi anggaran di plan (hanya saat final approval)
        $plan->increment('realized_amount', $realization->amount);

        $realization->load(['approvedByPrincipal', 'approvedByDirpen', 'approvedByDirector', 'rapbsPlan']);

        return response()->json([
            'success' => true,
            'message' => 'Realization approved by finance director (final)',
            'data' => $realization
        ]);
    }

    /**
     * Reject realization by Principal
     */
    public function rejectByPrincipal(Request $request, $id)
    {
        $realization = RapbsRealization::findOrFail($id);

        if ($realization->status !== 'submitted') {
            return response()->json([
                'success' => false,
                'message' => 'Only submitted realizations can be rejected by principal'
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
                'message' => 'Only School Principal can reject at this level. Your roles: ' . implode(', ', $userRoles)
            ], 403);
        }

        // Cek unit kerja
        $plan = $realization->rapbsPlan;
        if ($user->profile && $user->profile->unit_kerja && $plan->unit_kerja_id) {
            $unitKerja = \App\Models\UnitKerja::where('nama', $user->profile->unit_kerja)->first();
            if (!$unitKerja || $plan->unit_kerja_id != $unitKerja->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only reject realizations from your own unit'
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

        $realization->update([
            'status' => 'rejected_by_principal',
            'rejection_notes_principal' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Realization rejected by principal',
            'data' => $realization
        ]);
    }

    /**
     * Reject realization by Dirpen
     */
    public function rejectByDirpen(Request $request, $id)
    {
        $realization = RapbsRealization::findOrFail($id);

        if ($realization->status !== 'approved_by_principal') {
            return response()->json([
                'success' => false,
                'message' => 'Only principal-approved realizations can be rejected by Dirpen'
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

        $realization->update([
            'status' => 'rejected_by_dirpen',
            'rejection_notes_dirpen' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Realization rejected by Dirpen',
            'data' => $realization
        ]);
    }

    /**
     * Reject realization by Director
     */
    public function rejectByDirector(Request $request, $id)
    {
        $realization = RapbsRealization::findOrFail($id);

        if ($realization->status !== 'approved_by_dirpen') {
            return response()->json([
                'success' => false,
                'message' => 'Only Dirpen-approved realizations can be rejected by director'
            ], 403);
        }

        $user = Auth::user();

        // Cek role: Harus "Direktur Keuangan" (case-insensitive, support multiple formats)
        $hasDirectorRole = $user->roles()->where(function($q) {
            $q->where('name', 'Direktur Keuangan')
              ->orWhere('name', 'direktur_keuangan')
              ->orWhere('name', 'Direktur_Keuangan')
              ->orWhere('name', 'DIREKTUR_KEUANGAN')
              ->orWhereRaw('LOWER(name) = ?', ['direktur keuangan'])
              ->orWhereRaw('LOWER(name) = ?', ['direktur_keuangan']);
        })->exists();
        
        if (!$hasDirectorRole) {
            $userRoles = $user->roles()->pluck('name')->toArray();
            return response()->json([
                'success' => false,
                'message' => 'Only Finance Director can reject at this level. Your roles: ' . implode(', ', $userRoles)
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

        $realization->update([
            'status' => 'rejected_by_director',
            'rejection_notes_director' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Realization rejected by director',
            'data' => $realization
        ]);
    }

    /**
     * Approve realization - backward compatibility (deprecated, use approveByDirector instead)
     */
    public function approve(Request $request, $id)
    {
        // Redirect to approveByDirector for backward compatibility
        return $this->approveByDirector($id);
    }

    /**
     * Reject realization - backward compatibility (deprecated)
     */
    public function reject(Request $request, $id)
    {
        $realization = RapbsRealization::findOrFail($id);

        // Determine which level to reject based on current status
        if ($realization->status === 'submitted') {
            return $this->rejectByPrincipal($request, $id);
        } elseif ($realization->status === 'approved_by_principal') {
            return $this->rejectByDirpen($request, $id);
        } elseif ($realization->status === 'approved_by_dirpen') {
            return $this->rejectByDirector($request, $id);
        }

        return response()->json([
            'success' => false,
            'message' => 'Cannot reject realization in current status'
        ], 403);
    }
}

