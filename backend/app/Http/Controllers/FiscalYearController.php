<?php

namespace App\Http\Controllers;

use App\Models\FiscalYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FiscalYearController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = FiscalYear::with(['closedBy']);
            
            // Filter by is_closed
            if ($request->has('is_closed')) {
                $query->where('is_closed', $request->is_closed);
            }
            
            $fiscalYears = $query->orderBy('start_date', 'desc')->paginate($request->per_page ?? 15);
            
            return response()->json([
                'success' => true,
                'data' => $fiscalYears
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data tahun fiskal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'year_name' => 'required|string|max:20|unique:fiscal_years,year_name',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $fiscalYear = FiscalYear::create($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Tahun fiskal berhasil dibuat',
                'data' => $fiscalYear
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat tahun fiskal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $fiscalYear = FiscalYear::with(['closedBy'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $fiscalYear
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tahun fiskal tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $fiscalYear = FiscalYear::findOrFail($id);
            
            // Only allow update if not closed
            if ($fiscalYear->is_closed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat mengupdate tahun fiskal yang sudah ditutup'
                ], 422);
            }
            
            $validator = Validator::make($request->all(), [
                'year_name' => 'sometimes|required|string|max:20|unique:fiscal_years,year_name,' . $id,
                'start_date' => 'sometimes|required|date',
                'end_date' => 'sometimes|required|date|after:start_date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fiscalYear->update($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Tahun fiskal berhasil diupdate',
                'data' => $fiscalYear
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate tahun fiskal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $fiscalYear = FiscalYear::findOrFail($id);
            
            // Only allow delete if not closed
            if ($fiscalYear->is_closed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus tahun fiskal yang sudah ditutup'
                ], 422);
            }
            
            $fiscalYear->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Tahun fiskal berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus tahun fiskal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Close fiscal year
     */
    public function close(string $id)
    {
        try {
            $fiscalYear = FiscalYear::findOrFail($id);
            
            if ($fiscalYear->is_closed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tahun fiskal sudah ditutup'
                ], 422);
            }
            
            $fiscalYear->update([
                'is_closed' => true,
                'closed_by' => auth()->id(),
                'closed_at' => now(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Tahun fiskal berhasil ditutup',
                'data' => $fiscalYear->load('closedBy')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menutup tahun fiskal: ' . $e->getMessage()
            ], 500);
        }
    }
}
