<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\UnitKerja;
use App\Models\Jabatan;
use App\Models\UnitSekolah;
use App\Models\UnitKelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MasterDataController extends Controller
{
    // ===========================================
    // UNIT KERJA CRUD OPERATIONS
    // ===========================================
    
    public function getUnitKerjas(Request $request)
    {
        $query = UnitKerja::query();

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

        $unitKerjas = $query->orderBy('created_at', 'desc')
                           ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $unitKerjas
        ]);
    }

    public function storeUnitKerja(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:20|unique:unit_kerjas',
            'nama' => 'required|string|max:100',
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

        $unitKerja = UnitKerja::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Unit Kerja created successfully',
            'data' => $unitKerja
        ], 201);
    }

    public function showUnitKerja($id)
    {
        $unitKerja = UnitKerja::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $unitKerja
        ]);
    }

    public function updateUnitKerja(Request $request, $id)
    {
        $unitKerja = UnitKerja::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'kode' => 'sometimes|string|max:20|unique:unit_kerjas,kode,' . $id,
            'nama' => 'sometimes|string|max:100',
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

        $unitKerja->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Unit Kerja updated successfully',
            'data' => $unitKerja
        ]);
    }

    public function destroyUnitKerja($id)
    {
        $unitKerja = UnitKerja::findOrFail($id);
        $unitKerja->delete();

        return response()->json([
            'success' => true,
            'message' => 'Unit Kerja deleted successfully'
        ]);
    }

    // ===========================================
    // UNIT SEKOLAH CRUD OPERATIONS
    // ===========================================
    
    public function getUnitSekolahs(Request $request)
    {
        $query = UnitSekolah::query();

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
}
