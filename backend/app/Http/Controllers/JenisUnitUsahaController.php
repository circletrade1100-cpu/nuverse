<?php

namespace App\Http\Controllers;

use App\Models\JenisUnitUsaha;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JenisUnitUsahaController extends Controller
{
    /**
     * Display a listing of jenis unit usaha
     */
    public function index(Request $request)
    {
        $query = JenisUnitUsaha::query();

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('kode_unit_usaha', 'like', "%{$search}%")
                  ->orWhere('nama_jenis_unit_usaha', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $jenisUnitUsaha = $query->orderBy('created_at', 'desc')
                               ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $jenisUnitUsaha
        ]);
    }

    /**
     * Store a newly created jenis unit usaha
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kode_unit_usaha' => 'required|string|max:10|unique:jenis_unit_usaha,kode_unit_usaha',
            'nama_jenis_unit_usaha' => 'required|string|max:100',
            'status' => 'required|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $jenisUnitUsaha = JenisUnitUsaha::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Jenis unit usaha created successfully',
            'data' => $jenisUnitUsaha
        ], 201);
    }

    /**
     * Display the specified jenis unit usaha
     */
    public function show($id)
    {
        $jenisUnitUsaha = JenisUnitUsaha::find($id);

        if (!$jenisUnitUsaha) {
            return response()->json([
                'success' => false,
                'message' => 'Jenis unit usaha not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $jenisUnitUsaha
        ]);
    }

    /**
     * Update the specified jenis unit usaha
     */
    public function update(Request $request, $id)
    {
        $jenisUnitUsaha = JenisUnitUsaha::find($id);

        if (!$jenisUnitUsaha) {
            return response()->json([
                'success' => false,
                'message' => 'Jenis unit usaha not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'kode_unit_usaha' => 'sometimes|required|string|max:10|unique:jenis_unit_usaha,kode_unit_usaha,' . $id,
            'nama_jenis_unit_usaha' => 'sometimes|required|string|max:100',
            'status' => 'sometimes|required|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $jenisUnitUsaha->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Jenis unit usaha updated successfully',
            'data' => $jenisUnitUsaha
        ]);
    }

    /**
     * Remove the specified jenis unit usaha
     */
    public function destroy($id)
    {
        $jenisUnitUsaha = JenisUnitUsaha::find($id);

        if (!$jenisUnitUsaha) {
            return response()->json([
                'success' => false,
                'message' => 'Jenis unit usaha not found'
            ], 404);
        }

        // TODO: Add business units relationship check when business_units table has jenis_unit_usaha_id column
        // For now, allow deletion without checking relationships

        $jenisUnitUsaha->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jenis unit usaha deleted successfully'
        ]);
    }

    /**
     * Get all jenis unit usaha for dropdown/select
     */
    public function getAll()
    {
        $jenisUnitUsaha = JenisUnitUsaha::active()
                                       ->select('id', 'kode_unit_usaha', 'nama_jenis_unit_usaha')
                                       ->orderBy('nama_jenis_unit_usaha')
                                       ->get();

        return response()->json([
            'success' => true,
            'data' => $jenisUnitUsaha
        ]);
    }
}