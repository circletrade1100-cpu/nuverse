<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\UnitSekolah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UnitSekolahController extends Controller
{
    public function index(Request $request)
    {
        $query = UnitSekolah::with('unitKelas');

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%")
                  ->orWhere('kepala_sekolah', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Jenjang filter
        if ($request->has('jenjang')) {
            $query->where('jenjang', $request->jenjang);
        }

        $unitSekolahs = $query->orderBy('jenjang', 'asc')
                            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $unitSekolahs
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:20|unique:unit_sekolahs',
            'nama' => 'required|string|max:100',
            'jenjang' => 'required|in:TK,SD,SMP,SMA,SMK',
            'deskripsi' => 'nullable|string',
            'kepala_sekolah' => 'nullable|string|max:100',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
            'status' => 'required|in:Aktif,Tidak Aktif'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $unitSekolah = UnitSekolah::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Unit Sekolah created successfully',
            'data' => $unitSekolah
        ], 201);
    }

    public function show($id)
    {
        $unitSekolah = UnitSekolah::with('unitKelas')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $unitSekolah
        ]);
    }

    public function update(Request $request, $id)
    {
        $unitSekolah = UnitSekolah::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'kode' => 'sometimes|string|max:20|unique:unit_sekolahs,kode,' . $id,
            'nama' => 'sometimes|string|max:100',
            'jenjang' => 'sometimes|in:TK,SD,SMP,SMA,SMK',
            'deskripsi' => 'nullable|string',
            'kepala_sekolah' => 'nullable|string|max:100',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
            'status' => 'sometimes|in:Aktif,Tidak Aktif'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $unitSekolah->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Unit Sekolah updated successfully',
            'data' => $unitSekolah
        ]);
    }

    public function destroy($id)
    {
        $unitSekolah = UnitSekolah::findOrFail($id);
        $unitSekolah->delete();

        return response()->json([
            'success' => true,
            'message' => 'Unit Sekolah deleted successfully'
        ]);
    }
}
