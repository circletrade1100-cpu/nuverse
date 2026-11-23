<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PayrollInputTu;
use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PayrollInputTuController extends Controller
{
    /**
     * Get all payroll input TU data
     * Filter by unit_sekolah_id, periode_bulan, periode_tahun
     */
    public function index(Request $request)
    {
        try {
            $query = PayrollInputTu::with(['guru:id,nama_lengkap,nip', 'unitSekolah:id,nama,jenjang']);

            // Filter by unit_sekolah_id (untuk TU Unit hanya bisa lihat unit mereka)
            if ($request->has('unit_sekolah_id') && $request->unit_sekolah_id) {
                $query->where('unit_sekolah_id', $request->unit_sekolah_id);
            }

            // Filter by periode
            if ($request->has('periode_bulan') && $request->periode_bulan) {
                $query->where('periode_bulan', $request->periode_bulan);
            }

            if ($request->has('periode_tahun') && $request->periode_tahun) {
                $query->where('periode_tahun', $request->periode_tahun);
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            $data = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single payroll input TU data
     */
    public function show($id)
    {
        try {
            $data = PayrollInputTu::with(['guru', 'unitSekolah'])->find($id);

            if (!$data) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new payroll input TU data
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'guru_id' => 'required|integer|exists:gurus,id',
                'unit_sekolah_id' => 'required|integer|exists:unit_sekolahs,id',
                'periode_bulan' => 'required|string',
                'periode_tahun' => 'required|string',
                'bimbel' => 'nullable|integer|min:0',
                'proyek' => 'nullable|integer|min:0',
                'eskul' => 'nullable|integer|min:0',
                'pramuka' => 'nullable|integer|min:0',
                't_muka_pengganti_gaji_pokok' => 'nullable|integer|min:0',
                't_muka_pengganti_potongan' => 'nullable|integer|min:0',
                'insentif_lain' => 'nullable|integer|min:0',
                'potongan_lain' => 'nullable|integer|min:0',
                'status' => 'nullable|in:Draft,Submitted,Approved',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()->toArray()
                ], 422);
            }

            // Cek apakah sudah ada data untuk guru dan periode ini
            $existing = PayrollInputTu::where('guru_id', $request->guru_id)
                ->where('periode_bulan', $request->periode_bulan)
                ->where('periode_tahun', $request->periode_tahun)
                ->first();

            if ($existing) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data untuk guru dan periode ini sudah ada. Gunakan update untuk mengubah data.'
                ], 409);
            }

            $data = $validator->validated();
            $data['created_by'] = auth()->user()->name ?? 'system';
            $data['status'] = $data['status'] ?? 'Draft';

            // Set default 0 untuk field yang tidak diisi
            $data['bimbel'] = $data['bimbel'] ?? 0;
            $data['proyek'] = $data['proyek'] ?? 0;
            $data['eskul'] = $data['eskul'] ?? 0;
            $data['pramuka'] = $data['pramuka'] ?? 0;
            $data['t_muka_pengganti_gaji_pokok'] = $data['t_muka_pengganti_gaji_pokok'] ?? 0;
            $data['t_muka_pengganti_potongan'] = $data['t_muka_pengganti_potongan'] ?? 0;
            $data['insentif_lain'] = $data['insentif_lain'] ?? 0;
            $data['potongan_lain'] = $data['potongan_lain'] ?? 0;

            $payrollInput = PayrollInputTu::create($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Data berhasil disimpan',
                'data' => $payrollInput->load(['guru', 'unitSekolah'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update payroll input TU data
     */
    public function update(Request $request, $id)
    {
        try {
            $payrollInput = PayrollInputTu::find($id);

            if (!$payrollInput) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data tidak ditemukan'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'bimbel' => 'nullable|integer|min:0',
                'proyek' => 'nullable|integer|min:0',
                'eskul' => 'nullable|integer|min:0',
                'pramuka' => 'nullable|integer|min:0',
                't_muka_pengganti_gaji_pokok' => 'nullable|integer|min:0',
                't_muka_pengganti_potongan' => 'nullable|integer|min:0',
                'insentif_lain' => 'nullable|integer|min:0',
                'potongan_lain' => 'nullable|integer|min:0',
                'status' => 'nullable|in:Draft,Submitted,Approved',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()->toArray()
                ], 422);
            }

            $data = $validator->validated();

            $payrollInput->update($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Data berhasil diperbarui',
                'data' => $payrollInput->load(['guru', 'unitSekolah'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete payroll input TU data
     */
    public function destroy($id)
    {
        try {
            $payrollInput = PayrollInputTu::find($id);

            if (!$payrollInput) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data tidak ditemukan'
                ], 404);
            }

            $payrollInput->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Data berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk create payroll input TU (untuk import dari Excel atau multiple input)
     */
    public function bulkStore(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'data' => 'required|array|min:1',
                'data.*.guru_id' => 'required|integer|exists:gurus,id',
                'data.*.unit_sekolah_id' => 'required|integer|exists:unit_sekolahs,id',
                'data.*.periode_bulan' => 'required|string',
                'data.*.periode_tahun' => 'required|string',
                'data.*.bimbel' => 'nullable|integer|min:0',
                'data.*.proyek' => 'nullable|integer|min:0',
                'data.*.eskul' => 'nullable|integer|min:0',
                'data.*.pramuka' => 'nullable|integer|min:0',
                'data.*.t_muka_pengganti_gaji_pokok' => 'nullable|integer|min:0',
                'data.*.t_muka_pengganti_potongan' => 'nullable|integer|min:0',
                'data.*.insentif_lain' => 'nullable|integer|min:0',
                'data.*.potongan_lain' => 'nullable|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()->toArray()
                ], 422);
            }

            $created = [];
            $failed = [];
            $skipped = [];

            DB::beginTransaction();
            try {
                foreach ($request->data as $item) {
                    // Cek apakah sudah ada
                    $existing = PayrollInputTu::where('guru_id', $item['guru_id'])
                        ->where('periode_bulan', $item['periode_bulan'])
                        ->where('periode_tahun', $item['periode_tahun'])
                        ->first();

                    if ($existing) {
                        $skipped[] = [
                            'guru_id' => $item['guru_id'],
                            'message' => 'Data sudah ada untuk periode ini'
                        ];
                        continue;
                    }

                    $item['created_by'] = auth()->user()->name ?? 'system';
                    $item['status'] = 'Draft';
                    
                    // Set default 0
                    $item['bimbel'] = $item['bimbel'] ?? 0;
                    $item['proyek'] = $item['proyek'] ?? 0;
                    $item['eskul'] = $item['eskul'] ?? 0;
                    $item['pramuka'] = $item['pramuka'] ?? 0;
                    $item['t_muka_pengganti_gaji_pokok'] = $item['t_muka_pengganti_gaji_pokok'] ?? 0;
                    $item['t_muka_pengganti_potongan'] = $item['t_muka_pengganti_potongan'] ?? 0;
                    $item['insentif_lain'] = $item['insentif_lain'] ?? 0;
                    $item['potongan_lain'] = $item['potongan_lain'] ?? 0;

                    $payrollInput = PayrollInputTu::create($item);
                    $created[] = $payrollInput;
                }

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Bulk create berhasil',
                    'data' => [
                        'created' => count($created),
                        'skipped' => count($skipped),
                        'failed' => count($failed),
                        'created_data' => $created,
                        'skipped_data' => $skipped
                    ]
                ], 201);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal melakukan bulk create',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get list of gurus by unit_sekolah_id (untuk dropdown di form input TU)
     */
    public function getGurusByUnit(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'unit_sekolah_id' => 'required|integer|exists:unit_sekolahs,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()->toArray()
                ], 422);
            }

            $gurus = Guru::where('unit_sekolah_id', $request->unit_sekolah_id)
                ->where('status', 'Aktif')
                ->select('id', 'nama_lengkap', 'nip', 'jabatan_id', 'bimbel', 'ekskul', 'proyek', 'pramuka', 't_muka_pengganti')
                ->with('jabatan:id,nama')
                ->orderBy('nama_lengkap', 'asc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $gurus
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data guru',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
