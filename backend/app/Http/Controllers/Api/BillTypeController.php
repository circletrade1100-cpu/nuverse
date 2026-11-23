<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BillTypeController extends Controller
{
    /**
     * Display a listing of bill types
     */
    public function index(Request $request)
    {
        try {
            $query = BillType::query();

            // Filter by status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->is_active);
            }

            // Search by name
            if ($request->has('search') && $request->search) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // Order by name
            $query->orderBy('name', 'asc');

            $billTypes = $query->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $billTypes,
                'message' => 'Data jenis tagihan berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created bill type
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100',
                'description' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $billType = BillType::create([
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->is_active ?? true
            ]);

            return response()->json([
                'success' => true,
                'data' => $billType,
                'message' => 'Jenis tagihan berhasil dibuat'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified bill type
     */
    public function show(string $id)
    {
        try {
            $billType = BillType::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $billType,
                'message' => 'Data jenis tagihan berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Jenis tagihan tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Update the specified bill type
     */
    public function update(Request $request, string $id)
    {
        try {
            $billType = BillType::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:100',
                'description' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $billType->update($request->only([
                'name',
                'description',
                'is_active'
            ]));

            return response()->json([
                'success' => true,
                'data' => $billType,
                'message' => 'Jenis tagihan berhasil diperbarui'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified bill type
     */
    public function destroy(string $id)
    {
        try {
            $billType = BillType::findOrFail($id);

            // Cek apakah sudah digunakan di student_bills
            if ($billType->studentBills()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus jenis tagihan yang sudah digunakan'
                ], 422);
            }

            $billType->delete();

            return response()->json([
                'success' => true,
                'message' => 'Jenis tagihan berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle active status
     */
    public function toggleStatus(string $id)
    {
        try {
            $billType = BillType::findOrFail($id);
            $billType->is_active = !$billType->is_active;
            $billType->save();

            return response()->json([
                'success' => true,
                'data' => $billType,
                'message' => 'Status jenis tagihan berhasil diubah'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}

