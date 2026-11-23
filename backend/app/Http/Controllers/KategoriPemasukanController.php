<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KategoriPemasukanController extends Controller
{
    /**
     * Get all kategori pemasukan
     */
    public function index()
    {
        $categories = Category::income()->active()->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Create new kategori pemasukan
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
            'type' => 'income',
            'description' => $request->description,
            'icon' => $request->icon ?? 'money-bill-wave',
            'color' => $request->color ?? '#10B981',
            'is_active' => $request->is_active ?? true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori pemasukan berhasil dibuat',
            'data' => $category
        ], 201);
    }

    /**
     * Show specific kategori pemasukan
     */
    public function show($id)
    {
        $category = Category::income()->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Update kategori pemasukan
     */
    public function update(Request $request, $id)
    {
        $category = Category::income()->findOrFail($id);

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
            'message' => 'Kategori pemasukan berhasil diperbarui',
            'data' => $category
        ]);
    }

    /**
     * Delete kategori pemasukan
     */
    public function destroy($id)
    {
        $category = Category::income()->withCount('transactions')->findOrFail($id);

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
            'message' => 'Kategori pemasukan berhasil dihapus'
        ]);
    }
}
