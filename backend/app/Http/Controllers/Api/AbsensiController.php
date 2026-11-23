<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Guru;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AbsensiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Absensi::with(['guru.unitSekolah', 'guru.jabatan']);

            // Filter by date if provided
            if ($request->has('tanggal')) {
                $query->whereDate('tanggal', $request->tanggal);
            }

            // Filter by date range if provided
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('tanggal', [$request->start_date, $request->end_date]);
            }

            // Filter by tanggal_mulai and tanggal_akhir (for frontend compatibility)
            if ($request->has('tanggal_mulai') && $request->has('tanggal_akhir')) {
                $query->whereBetween('tanggal', [$request->tanggal_mulai, $request->tanggal_akhir]);
            }

            // Filter by bulan and tahun if provided
            if ($request->has('bulan') && $request->has('tahun')) {
                $query->whereMonth('tanggal', $request->bulan)
                      ->whereYear('tanggal', $request->tahun);
            }

            // Filter by guru if provided
            if ($request->has('id_guru')) {
                $query->where('id_guru', $request->id_guru);
            }

            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by unit_sekolah if provided
            if ($request->has('unit_sekolah')) {
                $unitSekolahNama = $request->unit_sekolah;
                \Log::info('Filtering by unit_sekolah:', ['nama' => $unitSekolahNama]);
                $query->whereHas('guru', function($q) use ($unitSekolahNama) {
                    $q->whereHas('unitSekolah', function($subQ) use ($unitSekolahNama) {
                        $subQ->where('nama', $unitSekolahNama);
                    });
                });
            }

            // Order by tanggal desc
            $query->orderBy('tanggal', 'desc')->orderBy('jam_masuk', 'desc');

            $absensi = $query->get();
            
            \Log::info('Absensi query result count:', ['count' => $absensi->count()]);

            return response()->json([
                'success' => true,
                'message' => 'Data absensi berhasil diambil',
                'data' => [
                    'data' => $absensi, // Wrap in data object for frontend compatibility
                    'total' => $absensi->count()
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data absensi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get daily attendance statistics
     */
    public function getDailyStatistics(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'tanggal' => 'nullable|date',
                'id_guru' => 'nullable|exists:gurus,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $query = Absensi::with('guru');

            // Filter by date if provided
            if ($request->has('tanggal')) {
                $query->whereDate('tanggal', $request->tanggal);
            } else {
                // Default to today
                $query->whereDate('tanggal', Carbon::today());
            }

            // Filter by guru if provided
            if ($request->has('id_guru')) {
                $query->where('id_guru', $request->id_guru);
            }

            $absensi = $query->get();

            // Calculate daily statistics
            $statistics = [
                'tanggal' => $request->tanggal ?? Carbon::today()->format('Y-m-d'),
                'total_guru' => $absensi->count(),
                'hadir' => $absensi->where('status', 'hadir')->count(),
                'izin' => $absensi->where('status', 'izin')->count(),
                'sakit' => $absensi->where('status', 'sakit')->count(),
                'alpha' => $absensi->where('status', 'alpha')->count(),
                'persentase_kehadiran' => $absensi->count() > 0 ? 
                    round(($absensi->where('status', 'hadir')->count() / $absensi->count()) * 100, 2) : 0
            ];

            return response()->json([
                'success' => true,
                'message' => 'Statistik absensi harian berhasil diambil',
                'data' => [
                    'statistics' => $statistics,
                    'attendance_data' => $absensi
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil statistik absensi harian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check-in attendance
     */
    public function checkIn(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_guru' => 'required|exists:gurus,id',
                'lokasi' => 'nullable|string|max:500',
                'nama_lokasi' => 'nullable|string|max:100',
                'foto' => 'nullable|string|max:100000',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'jam_masuk' => 'nullable|string|date_format:H:i:s'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $today = Carbon::today();
            
            // Check if already checked in today
            $existingAbsensi = Absensi::where('id_guru', $request->id_guru)
                ->whereDate('tanggal', $today)
                ->first();

            if ($existingAbsensi && $existingAbsensi->jam_masuk) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan check-in hari ini'
                ], 409);
            }

            // Prepare data
            $jamMasuk = $request->jam_masuk ?? Carbon::now()->format('H:i:s');
            $lokasi = $request->lokasi;
            if ($request->latitude && $request->longitude) {
                $lokasi = "{$request->latitude},{$request->longitude} - {$lokasi}";
            }

            if ($existingAbsensi) {
                // Update existing record
                $existingAbsensi->update([
                    'jam_masuk' => $jamMasuk,
                    'status' => 'hadir',
                    'lokasi' => $lokasi ?? $existingAbsensi->lokasi,
                    'nama_lokasi' => $request->nama_lokasi ?? $existingAbsensi->nama_lokasi,
                    'foto' => $request->foto ?? $existingAbsensi->foto
                ]);
                $absensi = $existingAbsensi;
            } else {
                // Create new record
                $absensi = Absensi::create([
                    'id_guru' => $request->id_guru,
                    'tanggal' => $today,
                    'jam_masuk' => $jamMasuk,
                    'status' => 'hadir',
                    'lokasi' => $lokasi,
                    'nama_lokasi' => $request->nama_lokasi,
                    'foto' => $request->foto,
                    'jam_mengajar' => 0,
                    'keterangan' => 'Check-in via Web'
                ]);
            }

            $absensi->load('guru');

            return response()->json([
                'success' => true,
                'message' => 'Check-in berhasil',
                'data' => $absensi
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat check-in',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check-out attendance
     */
    public function checkOut(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_guru' => 'required|exists:gurus,id',
                'jam_keluar' => 'nullable|string|date_format:H:i:s',
                'jam_mengajar' => 'nullable|numeric|min:0',
                'keterangan' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $today = Carbon::today();
            
            // Find today's attendance record
            $absensi = Absensi::where('id_guru', $request->id_guru)
                ->whereDate('tanggal', $today)
                ->first();

            if (!$absensi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada record absensi untuk hari ini'
                ], 404);
            }

            if ($absensi->jam_keluar) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan check-out hari ini'
                ], 409);
            }

            // Update check-out data
            $jamKeluar = $request->jam_keluar ?? Carbon::now()->format('H:i:s');
            
            $absensi->update([
                'jam_keluar' => $jamKeluar,
                'jam_mengajar' => $request->jam_mengajar ?? $absensi->jam_mengajar,
                'keterangan' => $request->keterangan ?? $absensi->keterangan
            ]);

            $absensi->load('guru');

            return response()->json([
                'success' => true,
                'message' => 'Check-out berhasil',
                'data' => $absensi
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat check-out',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance data for a specific teacher
     */
    public function getAttendance(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_guru' => 'required|exists:gurus,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $absensi = Absensi::with('guru')
                ->where('id_guru', $request->id_guru)
                ->orderBy('tanggal', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Data absensi berhasil diambil',
                'data' => $absensi
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data absensi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new attendance record
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Normalisasi format waktu sebelum validasi
            $requestData = $request->all();
            if (isset($requestData['jam_masuk']) && $requestData['jam_masuk']) {
                // Jika format H:i, tambahkan :00
                if (preg_match('/^\d{1,2}:\d{2}$/', $requestData['jam_masuk'])) {
                    $requestData['jam_masuk'] = $requestData['jam_masuk'] . ':00';
                }
            }
            if (isset($requestData['jam_keluar']) && $requestData['jam_keluar']) {
                // Jika format H:i, tambahkan :00
                if (preg_match('/^\d{1,2}:\d{2}$/', $requestData['jam_keluar'])) {
                    $requestData['jam_keluar'] = $requestData['jam_keluar'] . ':00';
                }
            }

            $validator = Validator::make($requestData, [
                'id_guru' => 'required|exists:gurus,id',
                'tanggal' => 'required|date',
                'jam_masuk' => 'nullable|string|date_format:H:i:s',
                'jam_keluar' => 'nullable|string|date_format:H:i:s',
                'status' => 'required|in:hadir,izin,sakit,alpha',
                'keterangan' => 'nullable|string|max:500',
                'lokasi' => 'nullable|string|max:500',
                'nama_lokasi' => 'nullable|string|max:100',
                'foto' => 'nullable|string|max:100000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $absensi = Absensi::create($requestData);
            $absensi->load('guru');

            return response()->json([
                'success' => true,
                'message' => 'Data absensi berhasil disimpan',
                'data' => $absensi
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data absensi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update attendance record
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $absensi = Absensi::findOrFail($id);

            // Normalisasi format waktu sebelum validasi
            $requestData = $request->all();
            if (isset($requestData['jam_masuk']) && $requestData['jam_masuk']) {
                // Jika format H:i, tambahkan :00
                if (preg_match('/^\d{1,2}:\d{2}$/', $requestData['jam_masuk'])) {
                    $requestData['jam_masuk'] = $requestData['jam_masuk'] . ':00';
                }
            }
            if (isset($requestData['jam_keluar']) && $requestData['jam_keluar']) {
                // Jika format H:i, tambahkan :00
                if (preg_match('/^\d{1,2}:\d{2}$/', $requestData['jam_keluar'])) {
                    $requestData['jam_keluar'] = $requestData['jam_keluar'] . ':00';
                }
            }

            $validator = Validator::make($requestData, [
                'jam_masuk' => 'nullable|string|date_format:H:i:s',
                'jam_keluar' => 'nullable|string|date_format:H:i:s',
                'status' => 'nullable|in:hadir,izin,sakit,alpha',
                'keterangan' => 'nullable|string|max:500',
                'lokasi' => 'nullable|string|max:500',
                'nama_lokasi' => 'nullable|string|max:100',
                'foto' => 'nullable|string|max:100000',
                'jam_mengajar' => 'nullable|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $absensi->update($requestData);
            $absensi->load('guru');

            return response()->json([
                'success' => true,
                'message' => 'Data absensi berhasil diupdate',
                'data' => $absensi
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengupdate data absensi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete attendance record
     */
    public function destroy($id): JsonResponse
    {
        try {
            $absensi = Absensi::findOrFail($id);
            $absensi->delete();

            return response()->json([
                'success' => true,
                'message' => 'Data absensi berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data absensi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed attendance statistics
     */
    public function getDetailedStatistics(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_guru' => 'required|exists:gurus,id',
                'bulan' => 'nullable|integer|min:1|max:12',
                'tahun' => 'nullable|integer|min:2020|max:2030'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $bulan = $request->bulan ?? Carbon::now()->month;
            $tahun = $request->tahun ?? Carbon::now()->year;

            // Get attendance data for the specified month/year
            $absensi = Absensi::where('id_guru', $request->id_guru)
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->orderBy('tanggal', 'desc')
                ->get();

            // Calculate statistics
            $statistics = [
                'total_hari' => $absensi->count(),
                'hadir' => $absensi->where('status', 'hadir')->count(),
                'izin' => $absensi->where('status', 'izin')->count(),
                'sakit' => $absensi->where('status', 'sakit')->count(),
                'alpha' => $absensi->where('status', 'alpha')->count(),
                'persentase_kehadiran' => $absensi->count() > 0 ? 
                    round(($absensi->where('status', 'hadir')->count() / $absensi->count()) * 100, 2) : 0
            ];

            // Get detailed daily data
            $dailyData = $absensi->map(function($item) {
                return [
                    'id' => $item->id,
                    'tanggal' => $item->tanggal->format('Y-m-d'),
                    'tanggal_formatted' => $item->tanggal->format('d/m/Y'),
                    'jam_masuk' => $item->jam_masuk,
                    'jam_keluar' => $item->jam_keluar,
                    'status' => $item->status,
                    'keterangan' => $item->keterangan,
                    'lokasi' => $item->lokasi,
                    'jam_mengajar' => $item->jam_mengajar,
                    'foto' => $item->foto,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Statistik absensi detail berhasil diambil',
                'data' => [
                    'statistics' => $statistics,
                    'data' => $dailyData, // Changed from 'daily_data' to 'data' to match frontend expectation
                    'month' => $bulan,
                    'year' => $tahun,
                    'guru_id' => $request->id_guru
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil statistik absensi detail',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance statistics
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_guru' => 'required|exists:gurus,id',
                'bulan' => 'nullable|integer|min:1|max:12',
                'tahun' => 'nullable|integer|min:2020|max:2030'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $bulan = $request->bulan ?? Carbon::now()->month;
            $tahun = $request->tahun ?? Carbon::now()->year;

            $absensi = Absensi::where('id_guru', $request->id_guru)
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->get();

            $statistics = [
                'total_hari' => $absensi->count(),
                'hadir' => $absensi->where('status', 'hadir')->count(),
                'izin' => $absensi->where('status', 'izin')->count(),
                'sakit' => $absensi->where('status', 'sakit')->count(),
                'alpha' => $absensi->where('status', 'alpha')->count(),
                'persentase_kehadiran' => $absensi->count() > 0 ? 
                    round(($absensi->where('status', 'hadir')->count() / $absensi->count()) * 100, 2) : 0
            ];

            return response()->json([
                'success' => true,
                'message' => 'Statistik absensi berhasil diambil',
                'data' => $statistics
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil statistik absensi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if teacher has unfinished attendance
     */
    public function checkUnfinishedAttendance(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_guru' => 'required|exists:gurus,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $today = Carbon::today();
            
            $unfinishedAbsensi = Absensi::where('id_guru', $request->id_guru)
                ->whereDate('tanggal', '<', $today)
                ->whereNotNull('jam_masuk')
                ->whereNull('jam_keluar')
                ->orderBy('tanggal', 'desc')
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Cek absensi berhasil',
                'data' => [
                    'has_unfinished' => $unfinishedAbsensi ? true : false,
                    'unfinished_data' => $unfinishedAbsensi ? [
                        'tanggal' => $unfinishedAbsensi->tanggal->format('Y-m-d'),
                        'jam_masuk' => $unfinishedAbsensi->jam_masuk
                    ] : null
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengecek absen yang belum diselesaikan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get today's attendance for a teacher
     */
    public function getTodayAttendance(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_guru' => 'required|exists:gurus,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $today = Carbon::today();
            
            $absensi = Absensi::with('guru')
                ->where('id_guru', $request->id_guru)
                ->whereDate('tanggal', $today)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Data absensi hari ini berhasil diambil',
                'data' => $absensi
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data absensi hari ini',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mobile check-in with more flexible validation
     */
    public function mobileCheckIn(Request $request): JsonResponse
    {
        try {
            // Log incoming request for debugging
            \Log::info('Mobile check-in request:', [
                'request_data' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            $validator = Validator::make($request->all(), [
                'id_guru' => 'required',
                'lokasi' => 'nullable|string|max:500',
                'nama_lokasi' => 'nullable|string|max:100',
                'foto' => 'nullable|string|max:100000', // Increased limit for base64 images
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'jam_masuk' => 'nullable|string|date_format:H:i:s'
            ]);

            if ($validator->fails()) {
                \Log::error('Mobile check-in validation failed:', [
                    'errors' => $validator->errors(),
                    'request_data' => $request->all()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Convert id_guru to integer if it's a string
            $idGuru = is_numeric($request->id_guru) ? (int)$request->id_guru : null;
            
            if (!$idGuru) {
                \Log::error('Invalid id_guru format:', ['id_guru' => $request->id_guru]);
                return response()->json([
                    'success' => false,
                    'message' => 'ID Guru tidak valid',
                    'errors' => ['id_guru' => ['ID Guru harus berupa angka']]
                ], 422);
            }

            // Check if guru exists
            $guru = Guru::find($idGuru);
            if (!$guru) {
                \Log::error('Guru not found:', ['id_guru' => $idGuru]);
                return response()->json([
                    'success' => false,
                    'message' => 'Guru tidak ditemukan',
                    'errors' => ['id_guru' => ['Guru dengan ID tersebut tidak ditemukan']]
                ], 422);
            }

            $today = Carbon::today();
            
            // AUTO-FIX: Otomatis selesaikan absen keluar dari hari sebelumnya yang belum di-checkout
            $unfinishedAbsensi = Absensi::where('id_guru', $idGuru)
                ->whereDate('tanggal', '<', $today)
                ->whereNotNull('jam_masuk')
                ->whereNull('jam_keluar')
                ->get();
            
            if ($unfinishedAbsensi->count() > 0) {
                foreach ($unfinishedAbsensi as $oldAbsen) {
                    // Set jam keluar otomatis ke 16:00:00 (jam pulang standar)
                    $oldAbsen->update([
                        'jam_keluar' => '16:00:00',
                        'keterangan' => ($oldAbsen->keterangan ?? '') . ' [Auto-checkout: belum checkout manual]'
                    ]);
                }
                
                \Log::info('Auto-checkout untuk absen lama:', [
                    'guru_id' => $idGuru,
                    'total_fixed' => $unfinishedAbsensi->count()
                ]);
            }
            
            // Cek apakah sudah ada absensi hari ini
            $existingAbsensi = Absensi::where('id_guru', $idGuru)
                ->whereDate('tanggal', $today)
                ->first();

            if ($existingAbsensi && $existingAbsensi->jam_masuk) {
                // Sudah check-in, return data yang ada (bukan error)
                $existingAbsensi->load('guru');
                
                \Log::warning('Duplicate check-in attempt:', [
                    'guru_id' => $idGuru,
                    'existing_checkin' => $existingAbsensi->jam_masuk
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Anda sudah check-in pada ' . $existingAbsensi->jam_masuk,
                    'data' => $existingAbsensi,
                    'already_checked_in' => true
                ], 200);
            }

            // Gunakan DB Transaction untuk mencegah race condition
            $absensi = DB::transaction(function () use ($idGuru, $today, $request, $existingAbsensi) {
                // Prepare lokasi data
                $lokasi = $request->lokasi;
                if ($request->latitude && $request->longitude) {
                    $lokasi = "{$request->latitude},{$request->longitude} - {$lokasi}";
                }

                // Determine jam masuk - use from request or fallback to current time
                $jamMasuk = $request->jam_masuk;
                if (!$jamMasuk) {
                    // Fallback to current time if not provided
                    $jamMasuk = Carbon::now()->format('H:i:s');
                    \Log::warning('Jam masuk not provided in request, using current time:', ['jam_masuk' => $jamMasuk]);
                } else {
                    \Log::info('Using jam masuk from request:', ['jam_masuk' => $jamMasuk]);
                }

                // Double-check dalam transaction untuk handle race condition
                $doubleCheck = Absensi::where('id_guru', $idGuru)
                    ->whereDate('tanggal', $today)
                    ->lockForUpdate() // Pessimistic locking
                    ->first();

                if ($doubleCheck && $doubleCheck->jam_masuk) {
                    // Already checked in by another concurrent request
                    return $doubleCheck;
                }

                if ($doubleCheck) {
                    // Update existing record
                    $doubleCheck->update([
                        'jam_masuk' => $jamMasuk,
                        'status' => 'hadir',
                        'lokasi' => $lokasi ?? $doubleCheck->lokasi,
                        'nama_lokasi' => $request->nama_lokasi ?? $doubleCheck->nama_lokasi,
                        'foto' => $request->foto ?? $doubleCheck->foto
                    ]);
                    return $doubleCheck;
                } else {
                    // Create new record
                    return Absensi::create([
                        'id_guru' => $idGuru,
                        'tanggal' => $today,
                        'jam_masuk' => $jamMasuk,
                        'status' => 'hadir',
                        'lokasi' => $lokasi,
                        'nama_lokasi' => $request->nama_lokasi,
                        'foto' => $request->foto,
                        'jam_mengajar' => 0,
                        'keterangan' => 'Check-in via Mobile App'
                    ]);
                }
            });

            $absensi->load('guru');

            \Log::info('Mobile check-in successful:', [
                'absensi_id' => $absensi->id,
                'guru_id' => $idGuru
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Check-in berhasil',
                'data' => $absensi
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Mobile check-in error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat check-in',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export absensi data to Excel (.xls format)
     */
    public function export(Request $request)
    {
        try {
            $query = Absensi::with(['guru.unitSekolah', 'guru.jabatan']);

            // Filter by date range if provided
            if ($request->has('tanggal_mulai') && $request->has('tanggal_akhir')) {
                $query->whereBetween('tanggal', [$request->tanggal_mulai, $request->tanggal_akhir]);
            }

            // Filter by status if provided
            if ($request->has('status')) {
                $statusMap = [
                    'Hadir' => 'hadir',
                    'Terlambat' => 'hadir',
                    'Absen' => 'alpha',
                    'Izin' => 'izin',
                    'Sakit' => 'sakit'
                ];
                $backendStatus = $statusMap[$request->status] ?? $request->status;
                $query->where('status', $backendStatus);
            }

            // Filter by unit_sekolah if provided
            if ($request->has('unit_sekolah')) {
                $unitSekolahNama = $request->unit_sekolah;
                \Log::info('Export: Filtering by unit_sekolah:', ['nama' => $unitSekolahNama]);
                $query->whereHas('guru', function($q) use ($unitSekolahNama) {
                    $q->whereHas('unitSekolah', function($subQ) use ($unitSekolahNama) {
                        $subQ->where('nama', $unitSekolahNama);
                    });
                });
            }

            // Buat query terpisah untuk menghitung total hari per karyawan
            // (jumlah tanggal unik per guru_id dengan filter yang sama)
            $countQuery = Absensi::query();
            
            // Apply same filters as main query
            if ($request->has('tanggal_mulai') && $request->has('tanggal_akhir')) {
                $countQuery->whereBetween('tanggal', [$request->tanggal_mulai, $request->tanggal_akhir]);
            }

            if ($request->has('status')) {
                $statusMap = [
                    'Hadir' => 'hadir',
                    'Terlambat' => 'hadir',
                    'Absen' => 'alpha',
                    'Izin' => 'izin',
                    'Sakit' => 'sakit'
                ];
                $backendStatus = $statusMap[$request->status] ?? $request->status;
                $countQuery->where('status', $backendStatus);
            }

            if ($request->has('unit_sekolah')) {
                $unitSekolahNama = $request->unit_sekolah;
                $countQuery->whereHas('guru', function($q) use ($unitSekolahNama) {
                    $q->whereHas('unitSekolah', function($subQ) use ($unitSekolahNama) {
                        $subQ->where('nama', $unitSekolahNama);
                    });
                });
            }
            
            // Hitung jumlah tanggal unik per id_guru
            $totalHariResults = $countQuery->select('id_guru', DB::raw('COUNT(DISTINCT tanggal) as total_hari'))
                ->groupBy('id_guru')
                ->get();
            
            // Convert ke array untuk akses cepat: [id_guru => total_hari]
            $totalHariPerKaryawan = [];
            foreach ($totalHariResults as $result) {
                $totalHariPerKaryawan[$result->id_guru] = (int)$result->total_hari;
            }
            
            \Log::info('Export: Total hari per karyawan:', $totalHariPerKaryawan);

            // Get data dengan ordering untuk export
            $absensi = $query->orderBy('tanggal', 'desc')->orderBy('jam_masuk', 'desc')->get();
            \Log::info('Export: absensi found:', ['count' => $absensi->count()]);

            // Prepare CSV data
            $csvData = [];
            
            // Add header - mengikuti kolom di datatable
            $csvData[] = [
                'Tanggal',
                'NIP',
                'Nama Karyawan',
                'Divisi/Unit',
                'Jam Masuk',
                'Jam Keluar',
                'Jam Kerja',
                'Status',
                'Lokasi',
                'Keterangan',
                'Total Hari'
            ];

            // Add data rows
            foreach ($absensi as $item) {
                // Hitung jam kerja dari jam masuk dan keluar
                $jamKerja = '-';
                if ($item->jam_masuk && $item->jam_keluar && $item->jam_masuk !== '-' && $item->jam_keluar !== '-') {
                    try {
                        [$inHour, $inMinute] = explode(':', $item->jam_masuk);
                        [$outHour, $outMinute] = explode(':', $item->jam_keluar);
                        $inTotalMinutes = $inHour * 60 + $inMinute;
                        $outTotalMinutes = $outHour * 60 + $outMinute;
                        $diffMinutes = max(0, $outTotalMinutes - $inTotalMinutes);
                        $hours = floor($diffMinutes / 60);
                        $remainingMinutes = $diffMinutes % 60;
                        
                        if ($hours === 0) {
                            $jamKerja = $remainingMinutes . ' Menit';
                        } else if ($remainingMinutes === 0) {
                            $jamKerja = $hours . ' Jam';
                        } else {
                            $jamKerja = $hours . ' Jam ' . $remainingMinutes . ' Menit';
                        }
                    } catch (\Exception $e) {
                        $jamKerja = '-';
                    }
                }

                // Map backend status to frontend status
                $statusMap = [
                    'hadir' => 'Hadir',
                    'sakit' => 'Sakit',
                    'izin' => 'Izin',
                    'alpha' => 'Absen'
                ];
                $status = $statusMap[$item->status] ?? 'Absen';

                // Ambil total hari untuk karyawan ini
                $guruId = $item->id_guru;
                $totalHari = $totalHariPerKaryawan[$guruId] ?? 0;

                $csvData[] = [
                    $item->tanggal ? Carbon::parse($item->tanggal)->format('d/m/Y') : '-',
                    $item->guru->nip ?? '-',
                    $item->guru->nama_lengkap ?? '-',
                    $item->guru->unitSekolah->nama ?? '-',
                    $item->jam_masuk ?? '-',
                    $item->jam_keluar ?? '-',
                    $jamKerja,
                    $status,
                    $item->nama_lokasi
                        ? $item->nama_lokasi
                        : ($item->lokasi ?? '-'),
                    $item->keterangan ?? '-',
                    $totalHari
                ];
            }

            // Generate Excel-compatible HTML table (widely supported by Excel)
            $htmlContent = '<html><head><meta charset="UTF-8"></head><body>';
            $htmlContent .= '<table border="1" cellspacing="0" cellpadding="3">';
            
            foreach ($csvData as $rowIndex => $row) {
                $htmlContent .= '<tr>';
                
                foreach ($row as $cell) {
                    $tag = $rowIndex === 0 ? 'th' : 'td';
                    $htmlContent .= sprintf(
                        '<%1$s>%2$s</%1$s>',
                        $tag,
                        htmlspecialchars((string) $cell, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
                    );
                }
                
                $htmlContent .= '</tr>';
            }
            
            $htmlContent .= '</table></body></html>';

            // Set headers for download with Excel .xls format
            $unitName = $request->unit_sekolah ? str_replace(' ', '_', $request->unit_sekolah) : 'Semua_Unit';
            $dateFrom = $request->tanggal_mulai ? Carbon::parse($request->tanggal_mulai)->format('Y-m-d') : date('Y-m-d');
            $dateTo = $request->tanggal_akhir ? Carbon::parse($request->tanggal_akhir)->format('Y-m-d') : date('Y-m-d');
            $filename = 'Absensi_' . $unitName . '_' . $dateFrom . '_to_' . $dateTo . '.xls';
            
            return response("\xEF\xBB\xBF" . $htmlContent)
                ->header('Content-Type', 'application/vnd.ms-excel; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');

        } catch (\Exception $e) {
            \Log::error('Export absensi error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat export data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}