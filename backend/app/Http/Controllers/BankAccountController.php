<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BankAccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = BankAccount::with(['transactions', 'reconciliations']);
            
            // Filter by account_type
            if ($request->has('account_type')) {
                $query->where('account_type', $request->account_type);
            }
            
            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('account_number', 'like', "%{$search}%")
                      ->orWhere('account_name', 'like', "%{$search}%")
                      ->orWhere('bank_name', 'like', "%{$search}%");
                });
            }
            
            $accounts = $query->orderBy('account_name')->paginate($request->per_page ?? 15);
            
            return response()->json([
                'success' => true,
                'data' => $accounts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data rekening: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'account_number' => 'required|string|max:50',
            'account_name' => 'required|string|max:100',
            'bank_name' => 'nullable|string|max:100',
            'account_type' => 'required|in:cash,bank,investment',
            'currency' => 'nullable|string|max:10',
            'opening_balance' => 'nullable|numeric',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            $data['current_balance'] = $request->opening_balance ?? 0;
            
            $account = BankAccount::create($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Rekening berhasil dibuat',
                'data' => $account
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat rekening: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $account = BankAccount::with(['transactions', 'reconciliations'])
                ->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $account
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rekening tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $account = BankAccount::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'account_number' => 'sometimes|required|string|max:50',
                'account_name' => 'sometimes|required|string|max:100',
                'bank_name' => 'nullable|string|max:100',
                'account_type' => 'sometimes|required|in:cash,bank,investment',
                'currency' => 'nullable|string|max:10',
                'status' => 'nullable|in:active,inactive',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $account->update($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Rekening berhasil diupdate',
                'data' => $account
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate rekening: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $account = BankAccount::findOrFail($id);
            
            // Check if account has transactions
            if ($account->transactions()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus rekening yang memiliki transaksi'
                ], 422);
            }
            
            $account->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Rekening berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus rekening: ' . $e->getMessage()
            ], 500);
        }
    }
}
