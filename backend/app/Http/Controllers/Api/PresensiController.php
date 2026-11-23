<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class PresensiController extends Controller
{
    /**
     * Presensi masuk dengan foto dan lokasi
     */
    public function presensiMasuk(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_guru' => 'required|exists:gurus,id',
                'lokasi' => 'required|string|max:500',
                'foto' => 'required|string', // base64 string
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $today = Carbon::today();
            
            // Cek apakah sudah ada absensi hari ini
            $existingAbsensi = Absensi::where('id_guru', $request->id_guru)
                ->whereDate('tanggal', $today)
                ->first();

            if ($existingAbsensi && $existingAbsensi->jam_masuk) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan presensi masuk hari ini'
                ], 409);
            }

            // Simpan foto
            $fotoPath = $this->saveFoto($request->foto, $request->id_guru, 'masuk');

            if ($existingAbsensi) {
                // Update absensi yang sudah ada
                $existingAbsensi->update([
                    'jam_masuk' => Carbon::now()->format('H:i:s'),
                    'status' => 'hadir',
                    'lokasi' => $request->lokasi,
                    'foto' => $fotoPath
                ]);
                $absensi = $existingAbsensi;
            } else {
                // Buat absensi baru
                $absensi = Absensi::create([
                    'id_guru' => $request->id_guru,
                    'tanggal' => $today,
                    'jam_masuk' => Carbon::now()->format('H:i:s'),
                    'status' => 'hadir',
                    'lokasi' => $request->lokasi,
                    'foto' => $fotoPath,
                    'jam_mengajar' => 0
                ]);
            }

            $absensi->load('guru');

            return response()->json([
                'success' => true,
                'message' => 'Presensi masuk berhasil',
                'data' => [
                    'id' => $absensi->id,
                    'tanggal' => $absensi->tanggal->format('Y-m-d'),
                    'jam_masuk' => $absensi->jam_masuk,
                    'lokasi' => $absensi->lokasi,
                    'foto' => $fotoPath,
                    'guru' => $absensi->guru->nama_lengkap
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat presensi masuk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Presensi keluar dengan foto dan lokasi
     */
    public function presensiKeluar(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_guru' => 'required|exists:gurus,id',
                'lokasi' => 'required|string|max:500',
                'foto' => 'required|string', // base64 string
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'jam_mengajar' => 'nullable|integer|min:0|max:12'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $today = Carbon::today();
            
            // Cari absensi hari ini
            $absensi = Absensi::where('id_guru', $request->id_guru)
                ->whereDate('tanggal', $today)
                ->first();

            if (!$absensi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada presensi masuk hari ini. Silakan presensi masuk terlebih dahulu.'
                ], 404);
            }

            if ($absensi->jam_keluar) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan presensi keluar hari ini'
                ], 409);
            }

            // Simpan foto keluar
            $fotoKeluarPath = $this->saveFoto($request->foto, $request->id_guru, 'keluar');

            // Update absensi
            $absensi->update([
                'jam_keluar' => Carbon::now()->format('H:i:s'),
                'lokasi' => $request->lokasi,
                'foto' => $absensi->foto . '|' . $fotoKeluarPath, // Gabungkan foto masuk dan keluar
                'jam_mengajar' => $request->jam_mengajar ?? 8 // Default 8 jam
            ]);

            $absensi->load('guru');

            return response()->json([
                'success' => true,
                'message' => 'Presensi keluar berhasil',
                'data' => [
                    'id' => $absensi->id,
                    'tanggal' => $absensi->tanggal->format('Y-m-d'),
                    'jam_masuk' => $absensi->jam_masuk,
                    'jam_keluar' => $absensi->jam_keluar,
                    'jam_mengajar' => $absensi->jam_mengajar,
                    'lokasi' => $absensi->lokasi,
                    'foto' => $absensi->foto,
                    'guru' => $absensi->guru->nama_lengkap
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat presensi keluar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get status presensi hari ini
     */
    public function statusPresensiHariIni(Request $request): JsonResponse
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
            
            $absensi = Absensi::where('id_guru', $request->id_guru)
                ->whereDate('tanggal', $today)
                ->first();

            if (!$absensi) {
                return response()->json([
                    'success' => true,
                    'message' => 'Belum ada presensi hari ini',
                    'data' => [
                        'sudah_masuk' => false,
                        'sudah_keluar' => false,
                        'jam_masuk' => null,
                        'jam_keluar' => null,
                        'lokasi_masuk' => null,
                        'lokasi_keluar' => null
                    ]
                ], 200);
            }

            return response()->json([
                'success' => true,
                'message' => 'Status presensi berhasil didapatkan',
                'data' => [
                    'sudah_masuk' => !is_null($absensi->jam_masuk),
                    'sudah_keluar' => !is_null($absensi->jam_keluar),
                    'jam_masuk' => $absensi->jam_masuk,
                    'jam_keluar' => $absensi->jam_keluar,
                    'lokasi_masuk' => $absensi->lokasi,
                    'lokasi_keluar' => $absensi->lokasi,
                    'jam_mengajar' => $absensi->jam_mengajar,
                    'status' => $absensi->status
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mendapatkan status presensi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Simpan foto dari base64 ke storage
     */
    private function saveFoto(string $base64String, int $guruId, string $type): string
    {
        try {
            // Decode base64
            $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $base64String));
            
            // Generate filename
            $filename = 'presensi_' . $guruId . '_' . $type . '_' . time() . '.jpg';
            $path = 'presensi/' . $filename;
            
            // Simpan ke storage
            Storage::disk('public')->put($path, $imageData);
            
            return $path;
        } catch (\Exception $e) {
            throw new \Exception('Gagal menyimpan foto: ' . $e->getMessage());
        }
    }

    /**
     * Get foto presensi
     */
    public function getFotoPresensi(string $filename): JsonResponse
    {
        try {
            $path = 'presensi/' . $filename;
            
            if (!Storage::disk('public')->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Foto tidak ditemukan'
                ], 404);
            }

            $file = Storage::disk('public')->get($path);
            $mimeType = Storage::disk('public')->mimeType($path);

            return response($file, 200)
                ->header('Content-Type', $mimeType)
                ->header('Content-Disposition', 'inline; filename="' . $filename . '"');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil foto',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
