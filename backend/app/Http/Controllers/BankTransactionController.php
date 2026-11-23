<?php

namespace App\Http\Controllers;

use App\Models\BankTransaction;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class BankTransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = BankTransaction::with(['bankAccount', 'creator']);
            
            // Filter by bank_account_id
            if ($request->has('bank_account_id')) {
                $query->where('bank_account_id', $request->bank_account_id);
            }
            
            // Filter by transaction_type
            if ($request->has('transaction_type')) {
                $query->where('transaction_type', $request->transaction_type);
            }
            
            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('transaction_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('transaction_date', '<=', $request->end_date);
            }
            
            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('reference_number', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }
            
            $transactions = $query->orderBy('transaction_date', 'desc')->paginate($request->per_page ?? 15);
            
            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data transaksi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'transaction_date' => 'required|date',
            'transaction_type' => 'required|in:deposit,withdrawal,transfer,adjustment',
            'reference_number' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();
            
            $bankAccount = BankAccount::findOrFail($request->bank_account_id);
            
            // Calculate new balance
            $newBalance = $bankAccount->current_balance;
            if (in_array($request->transaction_type, ['deposit', 'adjustment'])) {
                $newBalance += $request->amount;
            } else {
                $newBalance -= $request->amount;
            }
            
            // Check if balance is sufficient for withdrawal/transfer
            if (in_array($request->transaction_type, ['withdrawal', 'transfer']) && $newBalance < 0) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Saldo tidak mencukupi'
                ], 422);
            }
            
            // Create transaction
            $transaction = BankTransaction::create([
                'bank_account_id' => $request->bank_account_id,
                'transaction_date' => $request->transaction_date,
                'transaction_type' => $request->transaction_type,
                'reference_number' => $request->reference_number,
                'description' => $request->description,
                'amount' => $request->amount,
                'balance_after' => $newBalance,
                'status' => 'completed',
                'created_by' => auth()->id(),
            ]);
            
            // Update bank account balance
            $bankAccount->update(['current_balance' => $newBalance]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil dibuat',
                'data' => $transaction->load(['bankAccount', 'creator'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $transaction = BankTransaction::with(['bankAccount', 'creator'])
                ->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $transaction
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $transaction = BankTransaction::findOrFail($id);
            
            // Only allow update if status is pending
            if ($transaction->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya transaksi dengan status pending yang dapat diupdate'
                ], 422);
            }
            
            $validator = Validator::make($request->all(), [
                'transaction_date' => 'sometimes|required|date',
                'transaction_type' => 'sometimes|required|in:deposit,withdrawal,transfer,adjustment',
                'reference_number' => 'nullable|string|max:100',
                'description' => 'nullable|string',
                'amount' => 'sometimes|required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $transaction->update($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil diupdate',
                'data' => $transaction->load(['bankAccount', 'creator'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate transaksi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $transaction = BankTransaction::findOrFail($id);
            
            // Only allow delete if status is pending
            if ($transaction->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya transaksi dengan status pending yang dapat dihapus'
                ], 422);
            }
            
            $transaction->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus transaksi: ' . $e->getMessage()
            ], 500);
        }
    }
}
