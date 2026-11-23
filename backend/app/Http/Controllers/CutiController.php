<?php

namespace App\Http\Controllers;

use App\Models\Cuti;
use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CutiController extends Controller
{
    /**
     * Mendapatkan semua data cuti dengan filter
     */
    public function index(Request $request)
    {
        try {
            $query = Cuti::with(['guru.jabatan', 'guru.unitSekolah', 'creator', 'approver']);

            // Filter berdasarkan status
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }

            // Filter berdasarkan guru
            if ($request->has('id_guru') && $request->id_guru !== '') {
                $query->where('id_guru', $request->id_guru);
            }

            // Filter berdasarkan jenis cuti
            if ($request->has('jenis') && $request->jenis !== '') {
                $query->where('jenis', 'like', '%' . $request->jenis . '%');
            }

            // Filter berdasarkan rentang tanggal
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('tanggal_mulai', [$request->start_date, $request->end_date]);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $cuti = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Data cuti berhasil diambil',
                'data' => $cuti
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching cuti data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data cuti: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan data cuti milik guru yang sedang login
     */
    public function myCuti(Request $request)
    {
        try {
            $guru = $request->user(); // Guru yang sedang login
            
            $query = Cuti::with(['guru.jabatan', 'guru.unitSekolah', 'approver'])
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
            $cuti = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Data cuti berhasil diambil',
                'data' => $cuti
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching my cuti: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data cuti: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan data cuti baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'jenis' => 'required|string|max:255',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alasan' => 'required|string',
            'pengganti' => 'nullable|string|max:255'
        ], [
            'jenis.required' => 'Jenis cuti harus diisi',
            'tanggal_mulai.required' => 'Tanggal mulai harus diisi',
            'tanggal_mulai.date' => 'Format tanggal mulai tidak valid',
            'tanggal_selesai.required' => 'Tanggal selesai harus diisi',
            'tanggal_selesai.date' => 'Format tanggal selesai tidak valid',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai',
            'alasan.required' => 'Alasan cuti harus diisi'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $guru = $request->user(); // Guru yang sedang login

            // Hitung durasi
            $tanggalMulai = Carbon::parse($request->tanggal_mulai);
            $tanggalSelesai = Carbon::parse($request->tanggal_selesai);
            $durasi = $tanggalMulai->diffInDays($tanggalSelesai) + 1;

            $cuti = Cuti::create([
                'id_guru' => $guru->id,
                'jenis' => $request->jenis,
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
                'durasi' => $durasi,
                'status' => 'pending',
                'alasan' => $request->alasan,
                'pengganti' => $request->pengganti,
                'created_by' => $guru->id
            ]);

            $cuti->load(['guru', 'creator']);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan cuti berhasil dibuat',
                'data' => $cuti
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pengajuan cuti: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan detail data cuti
     */
    public function show($id)
    {
        try {
            $cuti = Cuti::with(['guru', 'creator', 'approver'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Detail cuti berhasil diambil',
                'data' => $cuti
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data cuti tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Update data cuti (hanya jika status masih pending)
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'jenis' => 'required|string|max:255',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alasan' => 'required|string',
            'pengganti' => 'nullable|string|max:255'
        ], [
            'jenis.required' => 'Jenis cuti harus diisi',
            'tanggal_mulai.required' => 'Tanggal mulai harus diisi',
            'tanggal_mulai.date' => 'Format tanggal mulai tidak valid',
            'tanggal_selesai.required' => 'Tanggal selesai harus diisi',
            'tanggal_selesai.date' => 'Format tanggal selesai tidak valid',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai',
            'alasan.required' => 'Alasan cuti harus diisi'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $cuti = Cuti::findOrFail($id);
            $guru = $request->user();

            // Cek apakah cuti milik guru yang login
            if ($cuti->id_guru !== $guru->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk mengubah data cuti ini'
                ], 403);
            }

            // Cek apakah status masih pending
            if ($cuti->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya cuti dengan status pending yang dapat diubah'
                ], 400);
            }

            // Hitung durasi
            $tanggalMulai = Carbon::parse($request->tanggal_mulai);
            $tanggalSelesai = Carbon::parse($request->tanggal_selesai);
            $durasi = $tanggalMulai->diffInDays($tanggalSelesai) + 1;

            $cuti->update([
                'jenis' => $request->jenis,
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
                'durasi' => $durasi,
                'alasan' => $request->alasan,
                'pengganti' => $request->pengganti
            ]);

            $cuti->load(['guru', 'creator', 'approver']);

            return response()->json([
                'success' => true,
                'message' => 'Data cuti berhasil diperbarui',
                'data' => $cuti
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data cuti: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hapus data cuti (hanya jika status masih pending)
     */
    public function destroy(Request $request, $id)
    {
        try {
            $cuti = Cuti::findOrFail($id);
            $guru = $request->user();

            // Cek apakah cuti milik guru yang login
            if ($cuti->id_guru !== $guru->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk menghapus data cuti ini'
                ], 403);
            }

            // Cek apakah status masih pending
            if ($cuti->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya cuti dengan status pending yang dapat dihapus'
                ], 400);
            }

            $cuti->delete();

            return response()->json([
                'success' => true,
                'message' => 'Data cuti berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data cuti: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve cuti (untuk admin/kepala sekolah)
     */
    public function approve(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'pengganti' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $cuti = Cuti::findOrFail($id);

            // Cek apakah status masih pending
            if ($cuti->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya cuti dengan status pending yang dapat disetujui'
                ], 400);
            }

            $user = $request->user();

            $cuti->update([
                'status' => 'approved',
                'tanggal_disetujui' => now(),
                'disetujui_oleh' => $user->id,
                'pengganti' => $request->pengganti ?? $cuti->pengganti
            ]);

            $cuti->load(['guru', 'creator', 'approver']);

            return response()->json([
                'success' => true,
                'message' => 'Cuti berhasil disetujui',
                'data' => $cuti
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyetujui cuti: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject cuti (untuk admin/kepala sekolah)
     */
    public function reject(Request $request, $id)
    {
        try {
            $cuti = Cuti::findOrFail($id);

            // Cek apakah status masih pending
            if ($cuti->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya cuti dengan status pending yang dapat ditolak'
                ], 400);
            }

            $user = $request->user();

            $cuti->update([
                'status' => 'rejected',
                'tanggal_disetujui' => now(),
                'disetujui_oleh' => $user->id
            ]);

            $cuti->load(['guru', 'creator', 'approver']);

            return response()->json([
                'success' => true,
                'message' => 'Cuti berhasil ditolak',
                'data' => $cuti
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menolak cuti: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan statistik cuti guru
     */
    public function statistics(Request $request)
    {
        try {
            // Cek apakah user adalah guru atau admin
            $user = $request->user();
            $isGuru = $user instanceof Guru;
            
            $year = $request->get('year', date('Y'));
            
            if ($isGuru) {
                // Statistik untuk guru yang login
                $stats = [
                    'total' => Cuti::where('id_guru', $user->id)
                        ->whereYear('tanggal_mulai', $year)
                        ->count(),
                    'pending' => Cuti::where('id_guru', $user->id)
                        ->whereYear('tanggal_mulai', $year)
                        ->where('status', 'pending')
                        ->count(),
                    'approved' => Cuti::where('id_guru', $user->id)
                        ->whereYear('tanggal_mulai', $year)
                        ->where('status', 'approved')
                        ->count(),
                    'rejected' => Cuti::where('id_guru', $user->id)
                        ->whereYear('tanggal_mulai', $year)
                        ->where('status', 'rejected')
                        ->count(),
                    'total_hari' => Cuti::where('id_guru', $user->id)
                        ->whereYear('tanggal_mulai', $year)
                        ->where('status', 'approved')
                        ->sum('durasi')
                ];
            } else {
                // Statistik untuk admin (semua cuti)
                $stats = [
                    'total' => Cuti::whereYear('tanggal_mulai', $year)->count(),
                    'pending' => Cuti::whereYear('tanggal_mulai', $year)
                        ->where('status', 'pending')
                        ->count(),
                    'approved' => Cuti::whereYear('tanggal_mulai', $year)
                        ->where('status', 'approved')
                        ->count(),
                    'rejected' => Cuti::whereYear('tanggal_mulai', $year)
                        ->where('status', 'rejected')
                        ->count(),
                    'total_hari' => Cuti::whereYear('tanggal_mulai', $year)
                        ->where('status', 'approved')
                        ->sum('durasi')
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'Statistik cuti berhasil diambil',
                'data' => $stats
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik cuti: ' . $e->getMessage()
            ], 500);
        }
    }
}

