<?php

namespace App\Http\Controllers;

use App\Models\Overtime;
use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OvertimeController extends Controller
{
    /**
     * Mendapatkan semua data overtime dengan filter
     */
    public function index(Request $request)
    {
        try {
            $query = Overtime::with(['guru.jabatan', 'guru.unitSekolah', 'creator', 'approver']);

            // Filter berdasarkan status
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }

            // Filter berdasarkan guru
            if ($request->has('id_guru') && $request->id_guru !== '') {
                $query->where('id_guru', $request->id_guru);
            }

            // Filter berdasarkan jenis lembur
            if ($request->has('jenis') && $request->jenis !== '') {
                $query->where('jenis', 'like', '%' . $request->jenis . '%');
            }

            // Filter berdasarkan rentang tanggal
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('tanggal', [$request->start_date, $request->end_date]);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $overtimes = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Data lembur berhasil diambil',
                'data' => $overtimes
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching overtime data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data lembur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan data overtime milik guru yang sedang login
     */
    public function myOvertime(Request $request)
    {
        try {
            $guru = $request->user(); // Guru yang sedang login
            
            $query = Overtime::with(['guru.jabatan', 'guru.unitSekolah', 'approver'])
                ->where('id_guru', $guru->id);

            // Filter berdasarkan status
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $overtimes = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Data lembur berhasil diambil',
                'data' => $overtimes
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching my overtime: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data lembur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan statistik overtime
     */
    public function statistics(Request $request)
    {
        try {
            $guru = $request->user();
            
            $query = Overtime::query();
            
            // Jika bukan admin, hanya tampilkan data guru yang login
            if ($request->has('id_guru')) {
                $query->where('id_guru', $request->id_guru);
            } else {
                $query->where('id_guru', $guru->id);
            }

            $stats = [
                'total' => $query->count(),
                'pending' => (clone $query)->where('status', 'pending')->count(),
                'approved' => (clone $query)->where('status', 'approved')->count(),
                'rejected' => (clone $query)->where('status', 'rejected')->count(),
                'total_jam' => (clone $query)->where('status', 'approved')->sum('durasi'),
                'total_pendapatan' => (clone $query)->where('status', 'approved')->sum('total'),
                'bulan_ini' => (clone $query)->whereMonth('tanggal', now()->month)
                    ->whereYear('tanggal', now()->year)
                    ->count(),
                'tahun_ini' => (clone $query)->whereYear('tanggal', now()->year)->count(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Statistik lembur berhasil diambil',
                'data' => $stats
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching overtime statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik lembur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menampilkan detail overtime
     */
    public function show($id)
    {
        try {
            $overtime = Overtime::with(['guru.jabatan', 'guru.unitSekolah', 'creator', 'approver'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Data lembur berhasil diambil',
                'data' => $overtime
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data lembur tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Membuat overtime baru
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_guru' => 'required|exists:gurus,id',
                'tanggal' => 'required|date',
                'jam_mulai' => 'required|date_format:H:i',
                'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
                'jenis' => 'required|string|max:255',
                'deskripsi' => 'required|string',
                'tarif' => 'nullable|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Hitung durasi dalam jam
            $jamMulai = Carbon::parse($request->jam_mulai);
            $jamSelesai = Carbon::parse($request->jam_selesai);
            $durasi = $jamSelesai->diffInHours($jamMulai);

            // Set default tarif jika tidak diisi (50.000 per jam)
            $tarif = $request->tarif ?? 50000;

            // Hitung total
            $total = $durasi * $tarif;

            $overtime = Overtime::create([
                'id_guru' => $request->id_guru,
                'tanggal' => $request->tanggal,
                'jam_mulai' => $request->jam_mulai,
                'jam_selesai' => $request->jam_selesai,
                'durasi' => $durasi,
                'jenis' => $request->jenis,
                'deskripsi' => $request->deskripsi,
                'status' => 'pending',
                'tarif' => $tarif,
                'total' => $total,
                'supervisor' => $request->supervisor,
                'created_by' => $request->user()->id
            ]);

            $overtime->load(['guru.jabatan', 'guru.unitSekolah', 'creator']);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan lembur berhasil dibuat',
                'data' => $overtime
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error creating overtime: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pengajuan lembur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengupdate overtime
     */
    public function update(Request $request, $id)
    {
        try {
            $overtime = Overtime::findOrFail($id);

            // Validasi hanya pending yang bisa diupdate
            if ($overtime->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya pengajuan lembur dengan status pending yang dapat diubah'
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'id_guru' => 'sometimes|exists:gurus,id',
                'tanggal' => 'sometimes|date',
                'jam_mulai' => 'sometimes|date_format:H:i',
                'jam_selesai' => 'sometimes|date_format:H:i|after:jam_mulai',
                'jenis' => 'sometimes|string|max:255',
                'deskripsi' => 'sometimes|string',
                'tarif' => 'nullable|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update data
            if ($request->has('id_guru')) {
                $overtime->id_guru = $request->id_guru;
            }
            if ($request->has('tanggal')) {
                $overtime->tanggal = $request->tanggal;
            }
            if ($request->has('jam_mulai')) {
                $overtime->jam_mulai = $request->jam_mulai;
            }
            if ($request->has('jam_selesai')) {
                $overtime->jam_selesai = $request->jam_selesai;
            }
            if ($request->has('jenis')) {
                $overtime->jenis = $request->jenis;
            }
            if ($request->has('deskripsi')) {
                $overtime->deskripsi = $request->deskripsi;
            }
            if ($request->has('tarif')) {
                $overtime->tarif = $request->tarif;
            }
            if ($request->has('supervisor')) {
                $overtime->supervisor = $request->supervisor;
            }

            // Recalculate durasi dan total jika jam berubah
            if ($request->has('jam_mulai') || $request->has('jam_selesai')) {
                $jamMulai = Carbon::parse($overtime->jam_mulai);
                $jamSelesai = Carbon::parse($overtime->jam_selesai);
                $overtime->durasi = $jamSelesai->diffInHours($jamMulai);
            }

            if ($request->has('tarif') || $request->has('jam_mulai') || $request->has('jam_selesai')) {
                $overtime->total = $overtime->durasi * $overtime->tarif;
            }

            $overtime->save();
            $overtime->load(['guru.jabatan', 'guru.unitSekolah', 'creator', 'approver']);

            return response()->json([
                'success' => true,
                'message' => 'Data lembur berhasil diperbarui',
                'data' => $overtime
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error updating overtime: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data lembur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghapus overtime
     */
    public function destroy($id)
    {
        try {
            $overtime = Overtime::findOrFail($id);

            // Validasi hanya pending yang bisa dihapus
            if ($overtime->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya pengajuan lembur dengan status pending yang dapat dihapus'
                ], 422);
            }

            $overtime->delete();

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan lembur berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error deleting overtime: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pengajuan lembur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyetujui overtime
     */
    public function approve(Request $request, $id)
    {
        try {
            $overtime = Overtime::findOrFail($id);

            if ($overtime->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya pengajuan lembur dengan status pending yang dapat disetujui'
                ], 422);
            }

            $overtime->status = 'approved';
            $overtime->tanggal_disetujui = now();
            $overtime->disetujui_oleh = $request->user()->id;
            $overtime->save();

            $overtime->load(['guru.jabatan', 'guru.unitSekolah', 'creator', 'approver']);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan lembur berhasil disetujui',
                'data' => $overtime
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error approving overtime: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyetujui pengajuan lembur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menolak overtime
     */
    public function reject(Request $request, $id)
    {
        try {
            $overtime = Overtime::findOrFail($id);

            if ($overtime->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya pengajuan lembur dengan status pending yang dapat ditolak'
                ], 422);
            }

            $overtime->status = 'rejected';
            $overtime->tanggal_disetujui = now();
            $overtime->disetujui_oleh = $request->user()->id;
            $overtime->save();

            $overtime->load(['guru.jabatan', 'guru.unitSekolah', 'creator', 'approver']);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan lembur berhasil ditolak',
                'data' => $overtime
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error rejecting overtime: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menolak pengajuan lembur: ' . $e->getMessage()
            ], 500);
        }
    }
}

