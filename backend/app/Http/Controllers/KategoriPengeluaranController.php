<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KategoriPengeluaranController extends Controller
{
    /**
     * Get all kategori pengeluaran
     */
    public function index()
    {
        $categories = Category::expense()->active()->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Create new kategori pengeluaran
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:categories',
            'description' => 'sometimes|string',
            'icon' => 'sometimes|string|max:50',
            'color' => 'sometimes|string|max:7',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $category = Category::create([
            'name' => $request->name,
            'code' => $request->code,
            'type' => 'expense',
            'description' => $request->description,
            'icon' => $request->icon ?? 'credit-card',
            'color' => $request->color ?? '#EF4444',
            'is_active' => $request->is_active ?? true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori pengeluaran berhasil dibuat',
            'data' => $category
        ], 201);
    }

    /**
     * Show specific kategori pengeluaran
     */
    public function show($id)
    {
        $category = Category::expense()->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Update kategori pengeluaran
     */
    public function update(Request $request, $id)
    {
        $category = Category::expense()->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'code' => 'sometimes|string|max:20|unique:categories,code,' . $id,
            'description' => 'sometimes|string',
            'icon' => 'sometimes|string|max:50',
            'color' => 'sometimes|string|max:7',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $category->update($request->only(['name', 'code', 'description', 'icon', 'color', 'is_active']));

        return response()->json([
            'success' => true,
            'message' => 'Kategori pengeluaran berhasil diperbarui',
            'data' => $category
        ]);
    }

    /**
     * Delete kategori pengeluaran
     */
    public function destroy($id)
    {
        $category = Category::expense()->withCount('transactions')->findOrFail($id);

        // Check if category is being used
        if ($category->transactions_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus kategori yang sedang digunakan dalam transaksi'
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori pengeluaran berhasil dihapus'
        ]);
    }
}
