<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpenseDocument;
use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ExpenseDocumentController extends Controller
{
    /**
     * Upload expense document
     */
    public function upload(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'division_id' => 'required|exists:divisions,id',
                'expense_date' => 'required|date',
                'amount' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'vendor_name' => 'required|string|max:200',
                'document_type' => 'required|in:fpu,receipt,invoice,other',
                'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // Max 5MB
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
            $filePath = $file->storeAs('expense_documents', $fileName, 'public');

            $document = ExpenseDocument::create([
                'division_id' => $request->division_id,
                'expense_date' => $request->expense_date,
                'amount' => $request->amount,
                'description' => $request->description,
                'vendor_name' => $request->vendor_name,
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
                'message' => 'Dokumen pengeluaran berhasil diupload',
                'data' => $document->load(['division', 'approver'])
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
     * Get all expense documents
     */
    public function getDocuments(Request $request)
    {
        try {
            $query = ExpenseDocument::with(['division', 'approver']);

            // Filter by division
            if ($request->has('division_id')) {
                $query->where('division_id', $request->division_id);
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
                $query->where('expense_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('expense_date', '<=', $request->end_date);
            }

            // Search by vendor name or description
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('vendor_name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $perPage = $request->get('per_page', 15);
            $documents = $query->orderBy('expense_date', 'desc')->paginate($perPage);

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
            $document = ExpenseDocument::findOrFail($id);

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
                'message' => 'Dokumen pengeluaran berhasil disetujui',
                'data' => $document->load(['division', 'approver'])
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
            $document = ExpenseDocument::findOrFail($id);

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
                'message' => 'Dokumen pengeluaran berhasil ditolak',
                'data' => $document->load(['division', 'approver'])
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
     * Get expense summary
     */
    public function getSummary(Request $request)
    {
        try {
            $query = ExpenseDocument::query();

            // Filter by division
            if ($request->has('division_id')) {
                $query->where('division_id', $request->division_id);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('expense_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('expense_date', '<=', $request->end_date);
            }

            $totalExpenses = (clone $query)->where('status', 'approved')->sum('amount');
            $pendingExpenses = (clone $query)->where('status', 'pending')->sum('amount');
            $rejectedExpenses = (clone $query)->where('status', 'rejected')->sum('amount');

            $totalDocuments = (clone $query)->count();
            $approvedDocuments = (clone $query)->where('status', 'approved')->count();
            $pendingDocuments = (clone $query)->where('status', 'pending')->count();
            $rejectedDocuments = (clone $query)->where('status', 'rejected')->count();

            // By document type
            $byDocumentType = (clone $query)->selectRaw('
                document_type,
                COUNT(*) as total_documents,
                SUM(amount) as total_amount,
                SUM(CASE WHEN status = "approved" THEN amount ELSE 0 END) as approved_amount,
                SUM(CASE WHEN status = "pending" THEN amount ELSE 0 END) as pending_amount
            ')
            ->groupBy('document_type')
            ->get();

            // By division
            $byDivision = (clone $query)->selectRaw('
                division_id,
                COUNT(*) as total_documents,
                SUM(amount) as total_amount,
                SUM(CASE WHEN status = "approved" THEN amount ELSE 0 END) as approved_amount
            ')
            ->groupBy('division_id')
            ->get()
            ->map(function ($item) {
                $division = Division::find($item->division_id);
                return [
                    'division_id' => $item->division_id,
                    'division_name' => $division ? $division->name : 'Unknown',
                    'total_documents' => $item->total_documents,
                    'total_amount' => $item->total_amount,
                    'approved_amount' => $item->approved_amount,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => [
                        'total_expenses' => $totalExpenses,
                        'pending_expenses' => $pendingExpenses,
                        'rejected_expenses' => $rejectedExpenses,
                        'total_documents' => $totalDocuments,
                        'approved_documents' => $approvedDocuments,
                        'pending_documents' => $pendingDocuments,
                        'rejected_documents' => $rejectedDocuments,
                    ],
                    'by_document_type' => $byDocumentType,
                    'by_division' => $byDivision,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil ringkasan pengeluaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get expense report
     */
    public function getReport(Request $request)
    {
        try {
            $query = ExpenseDocument::with(['division', 'approver']);

            // Filter by division
            if ($request->has('division_id')) {
                $query->where('division_id', $request->division_id);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('expense_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('expense_date', '<=', $request->end_date);
            }

            // Monthly trend
            $monthlyTrend = (clone $query)->where('status', 'approved')
                ->selectRaw('
                    DATE_FORMAT(expense_date, "%Y-%m") as month,
                    SUM(amount) as total_expense,
                    COUNT(*) as document_count
                ')
                ->groupBy('month')
                ->orderBy('month', 'desc')
                ->limit(12)
                ->get();

            // Top vendors
            $topVendors = (clone $query)->where('status', 'approved')
                ->selectRaw('
                    vendor_name,
                    SUM(amount) as total_expense,
                    COUNT(*) as transaction_count
                ')
                ->groupBy('vendor_name')
                ->orderBy('total_expense', 'desc')
                ->limit(10)
                ->get();

            // By status
            $byStatus = (clone $query)->selectRaw('
                status,
                COUNT(*) as total_documents,
                SUM(amount) as total_amount
            ')
            ->groupBy('status')
            ->get();

            // Recent documents
            $recentDocuments = (clone $query)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'monthly_trend' => $monthlyTrend,
                    'top_vendors' => $topVendors,
                    'by_status' => $byStatus,
                    'recent_documents' => $recentDocuments,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil laporan pengeluaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Input expense manually
     */
    public function inputExpense(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'division_id' => 'required|exists:divisions,id',
                'expense_date' => 'required|date',
                'amount' => 'required|numeric|min:0',
                'description' => 'required|string',
                'vendor_name' => 'required|string|max:200',
                'document_type' => 'required|in:fpu,receipt,invoice,other',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create a document entry without file (manual input)
            $document = ExpenseDocument::create([
                'division_id' => $request->division_id,
                'expense_date' => $request->expense_date,
                'amount' => $request->amount,
                'description' => $request->description,
                'vendor_name' => $request->vendor_name,
                'document_type' => $request->document_type,
                'document_file' => 'manual_input',
                'file_name' => 'Manual Input',
                'file_size' => 0,
                'mime_type' => 'text/plain',
                'status' => 'approved',
                'approved_by' => auth()->id() ?? 1,
                'approved_at' => now(),
                'notes' => $request->notes ?? 'Input manual tanpa dokumen',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengeluaran berhasil dicatat',
                'data' => $document->load(['division', 'approver'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencatat pengeluaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
