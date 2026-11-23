<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JabatanController extends Controller
{
    public function index(Request $request)
    {
        $query = Jabatan::query();

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Level filter
        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        $jabatans = $query->orderBy('level', 'asc')
                         ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $jabatans
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:20|unique:jabatans',
            'nama' => 'required|string|max:100',
            'level' => 'required|integer|min:1',
            'deskripsi' => 'nullable|string',
            'gaji_pokok' => 'required|numeric|min:0',
            'tunjangan' => 'required|numeric|min:0',
            'status' => 'required|in:Aktif,Tidak Aktif'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $jabatan = Jabatan::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Jabatan created successfully',
            'data' => $jabatan
        ], 201);
    }

    public function show($id)
    {
        $jabatan = Jabatan::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $jabatan
        ]);
    }

    public function update(Request $request, $id)
    {
        $jabatan = Jabatan::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'kode' => 'sometimes|string|max:20|unique:jabatans,kode,' . $id,
            'nama' => 'sometimes|string|max:100',
            'level' => 'sometimes|integer|min:1',
            'deskripsi' => 'nullable|string',
            'gaji_pokok' => 'sometimes|numeric|min:0',
            'tunjangan' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:Aktif,Tidak Aktif'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $jabatan->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Jabatan updated successfully',
            'data' => $jabatan
        ]);
    }

    public function destroy($id)
    {
        $jabatan = Jabatan::findOrFail($id);
        $jabatan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jabatan deleted successfully'
        ]);
    }
}
