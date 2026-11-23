<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeacherAttendanceDocument;
use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TeacherAttendanceController extends Controller
{
    /**
     * Upload attendance document
     */
    public function uploadDocument(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'teacher_id' => 'required|exists:gurus,id',
                'attendance_date' => 'required|date',
                'document_type' => 'required|in:sick_leave,permit,other',
                'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('document');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('teacher_attendance_documents', $fileName, 'public');

            $document = TeacherAttendanceDocument::create([
                'teacher_id' => $request->teacher_id,
                'attendance_date' => $request->attendance_date,
                'document_type' => $request->document_type,
                'document_file' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'pending',
                'notes' => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil diupload',
                'data' => $document->load(['teacher', 'approver'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupload dokumen',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all attendance documents
     */
    public function getDocuments(Request $request)
    {
        try {
            $query = TeacherAttendanceDocument::with(['teacher', 'approver']);

            // Filter by teacher
            if ($request->has('teacher_id')) {
                $query->where('teacher_id', $request->teacher_id);
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by document type
            if ($request->has('document_type')) {
                $query->where('document_type', $request->document_type);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('attendance_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('attendance_date', '<=', $request->end_date);
            }

            $perPage = $request->get('per_page', 15);
            $documents = $query->orderBy('attendance_date', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $documents
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dokumen',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve document
     */
    public function approveDocument(Request $request, string $id)
    {
        try {
            $document = TeacherAttendanceDocument::findOrFail($id);

            if ($document->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen sudah diproses sebelumnya'
                ], 400);
            }

            $document->update([
                'status' => 'approved',
                'approved_by' => auth()->id() ?? 1,
                'approved_at' => now(),
                'notes' => $request->notes ?? $document->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil disetujui',
                'data' => $document->load(['teacher', 'approver'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyetujui dokumen',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject document
     */
    public function rejectDocument(Request $request, string $id)
    {
        try {
            $document = TeacherAttendanceDocument::findOrFail($id);

            if ($document->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen sudah diproses sebelumnya'
                ], 400);
            }

            $validator = Validator::make($request->all(), [
                'notes' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alasan penolakan harus diisi',
                    'errors' => $validator->errors()
                ], 422);
            }

            $document->update([
                'status' => 'rejected',
                'approved_by' => auth()->id() ?? 1,
                'approved_at' => now(),
                'notes' => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil ditolak',
                'data' => $document->load(['teacher', 'approver'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menolak dokumen',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get teachers list with attendance summary
     */
    public function getTeachers(Request $request)
    {
        try {
            $query = Guru::query();

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                      ->orWhere('nip', 'like', "%{$search}%");
                });
            }

            $teachers = $query->get()->map(function ($teacher) use ($request) {
                $documentQuery = TeacherAttendanceDocument::where('teacher_id', $teacher->id);
                
                // Filter by date range if provided
                if ($request->has('start_date')) {
                    $documentQuery->where('attendance_date', '>=', $request->start_date);
                }
                if ($request->has('end_date')) {
                    $documentQuery->where('attendance_date', '<=', $request->end_date);
                }

                return [
                    'id' => $teacher->id,
                    'nama' => $teacher->nama,
                    'nip' => $teacher->nip,
                    'email' => $teacher->email,
                    'total_documents' => $documentQuery->count(),
                    'pending_documents' => (clone $documentQuery)->where('status', 'pending')->count(),
                    'approved_documents' => (clone $documentQuery)->where('status', 'approved')->count(),
                    'rejected_documents' => (clone $documentQuery)->where('status', 'rejected')->count(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $teachers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data guru',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Input attendance manually
     */
    public function inputAttendance(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'teacher_id' => 'required|exists:gurus,id',
                'attendance_date' => 'required|date',
                'document_type' => 'required|in:sick_leave,permit,other',
                'notes' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create a document entry without file (manual input)
            $document = TeacherAttendanceDocument::create([
                'teacher_id' => $request->teacher_id,
                'attendance_date' => $request->attendance_date,
                'document_type' => $request->document_type,
                'document_file' => 'manual_input',
                'file_name' => 'Manual Input',
                'file_size' => 0,
                'mime_type' => 'text/plain',
                'status' => 'approved',
                'approved_by' => auth()->id() ?? 1,
                'approved_at' => now(),
                'notes' => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data kehadiran berhasil dicatat',
                'data' => $document->load(['teacher', 'approver'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencatat kehadiran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance report
     */
    public function getReport(Request $request)
    {
        try {
            $query = TeacherAttendanceDocument::with(['teacher', 'approver']);

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('attendance_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('attendance_date', '<=', $request->end_date);
            }

            // Summary statistics
            $totalDocuments = (clone $query)->count();
            $pendingDocuments = (clone $query)->where('status', 'pending')->count();
            $approvedDocuments = (clone $query)->where('status', 'approved')->count();
            $rejectedDocuments = (clone $query)->where('status', 'rejected')->count();

            // By document type
            $byType = (clone $query)->selectRaw('
                document_type,
                COUNT(*) as total,
                SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
            ')
            ->groupBy('document_type')
            ->get();

            // By teacher
            $byTeacher = (clone $query)->selectRaw('
                teacher_id,
                COUNT(*) as total,
                SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
            ')
            ->groupBy('teacher_id')
            ->get()
            ->map(function ($item) {
                $teacher = Guru::find($item->teacher_id);
                return [
                    'teacher_id' => $item->teacher_id,
                    'teacher_name' => $teacher ? $teacher->nama : 'Unknown',
                    'total' => $item->total,
                    'approved' => $item->approved,
                    'pending' => $item->pending,
                    'rejected' => $item->rejected,
                ];
            });

            // Recent documents
            $recentDocuments = (clone $query)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => [
                        'total' => $totalDocuments,
                        'pending' => $pendingDocuments,
                        'approved' => $approvedDocuments,
                        'rejected' => $rejectedDocuments,
                    ],
                    'by_type' => $byType,
                    'by_teacher' => $byTeacher,
                    'recent_documents' => $recentDocuments,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil laporan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
