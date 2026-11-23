<?php

namespace App\Http\Controllers;

use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChartOfAccountsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = ChartOfAccount::with(['parent', 'children']);
            
            // Filter by account_type
            if ($request->has('account_type')) {
                $query->where('account_type', $request->account_type);
            }
            
            // Filter by is_active
            if ($request->has('is_active')) {
                $query->where('is_active', $request->is_active);
            }
            
            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('account_code', 'like', "%{$search}%")
                      ->orWhere('account_name', 'like', "%{$search}%");
                });
            }
            
            $accounts = $query->orderBy('account_code')->paginate($request->per_page ?? 15);
            
            return response()->json([
                'success' => true,
                'data' => $accounts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data akun: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'account_code' => 'required|string|max:20|unique:chart_of_accounts,account_code',
            'account_name' => 'required|string|max:100',
            'account_type' => 'required|in:asset,liability,equity,revenue,expense',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'level' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $account = ChartOfAccount::create($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Akun berhasil dibuat',
                'data' => $account->load(['parent', 'children'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat akun: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $account = ChartOfAccount::with(['parent', 'children', 'journalDetails', 'accountBalances'])
                ->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $account
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $account = ChartOfAccount::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'account_code' => 'sometimes|required|string|max:20|unique:chart_of_accounts,account_code,' . $id,
                'account_name' => 'sometimes|required|string|max:100',
                'account_type' => 'sometimes|required|in:asset,liability,equity,revenue,expense',
                'parent_id' => 'nullable|exists:chart_of_accounts,id',
                'level' => 'nullable|integer',
                'is_active' => 'nullable|boolean',
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
                'message' => 'Akun berhasil diupdate',
                'data' => $account->load(['parent', 'children'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate akun: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $account = ChartOfAccount::findOrFail($id);
            
            // Check if account has children
            if ($account->children()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus akun yang memiliki sub-akun'
                ], 422);
            }
            
            // Check if account has transactions
            if ($account->journalDetails()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus akun yang memiliki transaksi'
                ], 422);
            }
            
            $account->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Akun berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus akun: ' . $e->getMessage()
            ], 500);
        }
    }
}
