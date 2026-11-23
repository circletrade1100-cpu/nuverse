<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use App\Models\JournalDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class JournalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = JournalEntry::with(['details.account', 'creator', 'poster']);
            
            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by entry_type
            if ($request->has('entry_type')) {
                $query->where('entry_type', $request->entry_type);
            }
            
            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('entry_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('entry_date', '<=', $request->end_date);
            }
            
            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('entry_number', 'like', "%{$search}%")
                      ->orWhere('reference_number', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }
            
            $journals = $query->orderBy('entry_date', 'desc')->paginate($request->per_page ?? 15);
            
            return response()->json([
                'success' => true,
                'data' => $journals
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data jurnal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'entry_date' => 'required|date',
            'reference_number' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'entry_type' => 'required|in:automatic,manual,adjustment,reversing',
            'source_module' => 'nullable|string|max:50',
            'source_id' => 'nullable|integer',
            'details' => 'required|array|min:2',
            'details.*.account_id' => 'required|exists:chart_of_accounts,id',
            'details.*.debit_amount' => 'required|numeric|min:0',
            'details.*.credit_amount' => 'required|numeric|min:0',
            'details.*.description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate debit = credit
        $totalDebit = collect($request->details)->sum('debit_amount');
        $totalCredit = collect($request->details)->sum('credit_amount');
        
        if ($totalDebit != $totalCredit) {
            return response()->json([
                'success' => false,
                'message' => 'Total debit harus sama dengan total credit'
            ], 422);
        }

        try {
            DB::beginTransaction();
            
            // Generate entry number
            $entryNumber = $this->generateEntryNumber();
            
            $journal = JournalEntry::create([
                'entry_number' => $entryNumber,
                'entry_date' => $request->entry_date,
                'reference_number' => $request->reference_number,
                'description' => $request->description,
                'entry_type' => $request->entry_type,
                'source_module' => $request->source_module,
                'source_id' => $request->source_id,
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'status' => 'draft',
                'created_by' => auth()->id(),
            ]);
            
            // Create details
            foreach ($request->details as $detail) {
                JournalDetail::create([
                    'journal_entry_id' => $journal->id,
                    'account_id' => $detail['account_id'],
                    'debit_amount' => $detail['debit_amount'],
                    'credit_amount' => $detail['credit_amount'],
                    'description' => $detail['description'] ?? null,
                ]);
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Jurnal berhasil dibuat',
                'data' => $journal->load(['details.account', 'creator'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat jurnal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $journal = JournalEntry::with(['details.account', 'creator', 'poster'])
                ->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $journal
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Jurnal tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $journal = JournalEntry::findOrFail($id);
            
            // Only allow update if status is draft
            if ($journal->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya jurnal dengan status draft yang dapat diupdate'
                ], 422);
            }
            
            $validator = Validator::make($request->all(), [
                'entry_date' => 'sometimes|required|date',
                'reference_number' => 'nullable|string|max:100',
                'description' => 'nullable|string',
                'entry_type' => 'sometimes|required|in:automatic,manual,adjustment,reversing',
                'details' => 'sometimes|required|array|min:2',
                'details.*.account_id' => 'required|exists:chart_of_accounts,id',
                'details.*.debit_amount' => 'required|numeric|min:0',
                'details.*.credit_amount' => 'required|numeric|min:0',
                'details.*.description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();
            
            // Update journal entry
            $journal->update($request->only(['entry_date', 'reference_number', 'description', 'entry_type']));
            
            // Update details if provided
            if ($request->has('details')) {
                // Validate debit = credit
                $totalDebit = collect($request->details)->sum('debit_amount');
                $totalCredit = collect($request->details)->sum('credit_amount');
                
                if ($totalDebit != $totalCredit) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Total debit harus sama dengan total credit'
                    ], 422);
                }
                
                // Delete old details
                $journal->details()->delete();
                
                // Create new details
                foreach ($request->details as $detail) {
                    JournalDetail::create([
                        'journal_entry_id' => $journal->id,
                        'account_id' => $detail['account_id'],
                        'debit_amount' => $detail['debit_amount'],
                        'credit_amount' => $detail['credit_amount'],
                        'description' => $detail['description'] ?? null,
                    ]);
                }
                
                // Update totals
                $journal->update([
                    'total_debit' => $totalDebit,
                    'total_credit' => $totalCredit,
                ]);
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Jurnal berhasil diupdate',
                'data' => $journal->load(['details.account', 'creator'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate jurnal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $journal = JournalEntry::findOrFail($id);
            
            // Only allow delete if status is draft
            if ($journal->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya jurnal dengan status draft yang dapat dihapus'
                ], 422);
            }
            
            DB::beginTransaction();
            
            // Delete details first
            $journal->details()->delete();
            
            // Delete journal
            $journal->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Jurnal berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus jurnal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Post journal entry
     */
    public function post(string $id)
    {
        try {
            $journal = JournalEntry::findOrFail($id);
            
            if ($journal->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Jurnal sudah di-post atau dibatalkan'
                ], 422);
            }
            
            $journal->update([
                'status' => 'posted',
                'posted_by' => auth()->id(),
                'posted_at' => now(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Jurnal berhasil di-post',
                'data' => $journal->load(['details.account', 'poster'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mem-post jurnal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Void journal entry
     */
    public function void(string $id)
    {
        try {
            $journal = JournalEntry::findOrFail($id);
            
            if ($journal->status === 'void') {
                return response()->json([
                    'success' => false,
                    'message' => 'Jurnal sudah dibatalkan'
                ], 422);
            }
            
            $journal->update([
                'status' => 'void',
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Jurnal berhasil dibatalkan',
                'data' => $journal
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membatalkan jurnal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate entry number
     */
    private function generateEntryNumber()
    {
        $date = date('Ymd');
        $lastEntry = JournalEntry::where('entry_number', 'like', "JE-{$date}-%")
            ->orderBy('entry_number', 'desc')
            ->first();
        
        if ($lastEntry) {
            $lastNumber = intval(substr($lastEntry->entry_number, -4));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        return "JE-{$date}-" . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
