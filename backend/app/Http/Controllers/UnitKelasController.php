<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\UnitKelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UnitKelasController extends Controller
{
    public function index(Request $request)
    {
        $query = UnitKelas::with('unitSekolah');

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%")
                  ->orWhere('wali_kelas', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Unit Sekolah filter
        if ($request->has('unit_sekolah_id')) {
            $query->where('unit_sekolah_id', $request->unit_sekolah_id);
        }

        // Tingkat filter
        if ($request->has('tingkat')) {
            $query->where('tingkat', $request->tingkat);
        }

        $unitKelas = $query->orderBy('tingkat', 'asc')
                          ->orderBy('nama', 'asc')
                          ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $unitKelas
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:20|unique:unit_kelas',
            'nama' => 'required|string|max:100',
            'tingkat' => 'required|integer|min:1|max:12',
            'unit_sekolah_id' => 'required|exists:unit_sekolahs,id',
            'wali_kelas' => 'nullable|string|max:100',
            'kapasitas' => 'required|integer|min:1|max:50',
            'deskripsi' => 'nullable|string',
            'status' => 'required|in:Aktif,Tidak Aktif'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $unitKelas = UnitKelas::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Unit Kelas created successfully',
            'data' => $unitKelas->load('unitSekolah')
        ], 201);
    }

    public function show($id)
    {
        $unitKelas = UnitKelas::with('unitSekolah')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $unitKelas
        ]);
    }

    public function update(Request $request, $id)
    {
        $unitKelas = UnitKelas::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'kode' => 'sometimes|string|max:20|unique:unit_kelas,kode,' . $id,
            'nama' => 'sometimes|string|max:100',
            'tingkat' => 'sometimes|integer|min:1|max:12',
            'unit_sekolah_id' => 'sometimes|exists:unit_sekolahs,id',
            'wali_kelas' => 'nullable|string|max:100',
            'kapasitas' => 'sometimes|integer|min:1|max:50',
            'deskripsi' => 'nullable|string',
            'status' => 'sometimes|in:Aktif,Tidak Aktif'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $unitKelas->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Unit Kelas updated successfully',
            'data' => $unitKelas->load('unitSekolah')
        ]);
    }

    public function destroy($id)
    {
        $unitKelas = UnitKelas::findOrFail($id);
        $unitKelas->delete();

        return response()->json([
            'success' => true,
            'message' => 'Unit Kelas deleted successfully'
        ]);
    }
}
