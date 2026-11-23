<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\THR;
use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class THRController extends Controller
{
    private function getMasaKerjaTahun($tmt): int
    {
        if (!$tmt) {
            return 0;
        }

        try {
            $tmtDate = Carbon::parse($tmt);
            $now = Carbon::now();

            if ($now->lt($tmtDate)) {
                return 0;
            }

            $years = $now->year - $tmtDate->year;
            $months = $now->month - $tmtDate->month;
            $days = $now->day - $tmtDate->day;

            if ($months < 0 || ($months == 0 && $days < 0)) {
                $years--;
            }

            return max(0, $years);
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function formatGuruTHR(THR $thr): array
    {
        $guru = $thr->guru;

        return [
            'id' => $thr->id,
            'guru_id' => $thr->guru_id,
            'nama_lengkap' => $guru ? $guru->nama_lengkap : null,
            'nip' => $guru ? $guru->nip : null,
            'jabatan' => $guru && $guru->jabatan ? $guru->jabatan->nama : null,
            'unit_sekolah' => $guru && $guru->unitSekolah ? $guru->unitSekolah->nama : null,
            'unit_sekolah_nama' => $guru && $guru->unitSekolah ? $guru->unitSekolah->nama : null,
            'masa_kerja_tahun' => $this->getMasaKerjaTahun($guru ? $guru->tmt : null),
            'gaji_pokok' => $guru ? ($guru->gaji_pokok ?? 0) : 0,
            'tunjangan_jabatan' => $guru ? ($guru->tunjangan_jabatan ?? 0) : 0,
            'masa_kerja_rupiah' => $thr->masa_kerja ?? ($guru ? ($guru->tunjangan_masa_kerja ?? 0) : 0),
            'jumlah_tatap_muka' => $thr->jumlah_tatap_muka,
            'tatap_muka_rupiah' => $thr->tatap_muka_rupiah,
            'total_rupiah' => $thr->total_rupiah,
            'keterangan_rupiah' => $thr->keterangan_rupiah,
            'tahun' => $thr->tahun,
            'nama_bank' => $guru ? $guru->nama_bank : null,
            'no_rekening' => $guru ? $guru->no_rekening : null,
            'created_at' => $thr->created_at,
            'updated_at' => $thr->updated_at,
        ];
    }

    public function getGuruTHR(Request $request)
    {
        try {
            $guru = $request->user();

            if (!$guru) {
                return response()->json([
                    'success' => false,
                    'message' => 'Guru tidak terauthentikasi'
                ], 401);
            }

            $tahun = $request->get('tahun', date('Y'));
            $thr = THR::with(['guru.jabatan', 'guru.unitSekolah'])
                ->where('guru_id', $guru->id)
                ->where('tahun', $tahun)
                ->latest()
                ->first();

            return response()->json([
                'success' => true,
                'message' => $thr ? 'Data THR guru berhasil diambil' : 'Belum ada data THR',
                'data' => $thr ? $this->formatGuruTHR($thr) : null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data THR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getGuruTHRSlip(Request $request, string $id)
    {
        try {
            $guru = $request->user();

            if (!$guru) {
                return response()->json([
                    'success' => false,
                    'message' => 'Guru tidak terauthentikasi'
                ], 401);
            }

            $thr = THR::with(['guru.jabatan', 'guru.unitSekolah'])
                ->where('id', $id)
                ->where('guru_id', $guru->id)
                ->first();

            if (!$thr) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data THR tidak ditemukan atau tidak memiliki akses'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Data slip THR guru berhasil diambil',
                'data' => $this->formatGuruTHR($thr)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil slip THR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $tahun = $request->get('tahun', date('Y'));
            
            $thr = THR::with(['guru.jabatan', 'guru.unitSekolah'])
                ->where('tahun', $tahun)
                ->orderBy('created_at', 'desc')
                ->get();

            // Format data untuk response
            $data = $thr->map(function($item) {
                $guru = $item->guru;
                $tmt = $guru ? $guru->tmt : null;
                $masaKerjaTahun = 0;
                
                if ($tmt) {
                    try {
                        $tmtDate = Carbon::parse($tmt);
                        $now = Carbon::now();
                        
                        // Pastikan TMT tidak di masa depan
                        if ($now->lt($tmtDate)) {
                            $masaKerjaTahun = 0;
                        } else {
                            // Hitung selisih tahun dengan cara yang lebih akurat
                            $years = $now->year - $tmtDate->year;
                            $months = $now->month - $tmtDate->month;
                            $days = $now->day - $tmtDate->day;
                            
                            // Jika bulan atau hari negatif, kurangi 1 tahun
                            if ($months < 0 || ($months == 0 && $days < 0)) {
                                $years--;
                            }
                            
                            $masaKerjaTahun = max(0, $years);
                        }
                    } catch (\Exception $e) {
                        $masaKerjaTahun = 0;
                    }
                }

                return [
                    'id' => $item->id,
                    'guru_id' => $item->guru_id,
                    'nama_lengkap' => $guru ? $guru->nama_lengkap : null,
                    'jabatan' => $guru && $guru->jabatan ? $guru->jabatan->nama : null,
                    'masa_kerja_tahun' => $masaKerjaTahun,
                    'gaji_pokok' => $guru ? ($guru->gaji_pokok ?? 0) : 0,
                    'masa_kerja_rupiah' => $item->masa_kerja ?? ($guru ? ($guru->tunjangan_masa_kerja ?? 0) : 0),
                    'jumlah_tatap_muka' => $item->jumlah_tatap_muka,
                    'tatap_muka_rupiah' => $item->tatap_muka_rupiah,
                    'total_rupiah' => $item->total_rupiah,
                    'keterangan_rupiah' => $item->keterangan_rupiah,
                    'tahun' => $item->tahun,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data THR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'guru_id' => 'required|exists:gurus,id',
                'tahun' => 'required|integer|min:2020|max:2100',
                'jumlah_tatap_muka' => 'required|integer|min:0',
                'tatap_muka_rupiah' => 'required|integer|min:0',
                'masa_kerja' => 'nullable|integer|min:0',
                'total_rupiah' => 'required|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Cek apakah sudah ada THR untuk guru_id dan tahun ini
            $existing = THR::where('guru_id', $request->guru_id)
                ->where('tahun', $request->tahun)
                ->first();

            if ($existing) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'THR untuk guru ini pada tahun ' . $request->tahun . ' sudah ada'
                ], 409);
            }

            $data = $request->all();
            $data['keterangan_rupiah'] = $data['total_rupiah']; // Keterangan sama dengan total
            $data['created_by'] = auth()->user()->name ?? 'System';
            $data['created_date'] = now()->format('Y-m-d');

            $thr = THR::create($data);

            return response()->json([
                'status' => 'success',
                'message' => 'THR berhasil ditambahkan',
                'data' => $thr
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan THR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $thr = THR::with(['guru.jabatan', 'guru.unitSekolah'])->find($id);

            if (!$thr) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data THR tidak ditemukan'
                ], 404);
            }

            $guru = $thr->guru;
            $tmt = $guru ? $guru->tmt : null;
            $masaKerjaTahun = 0;
            
            if ($tmt) {
                try {
                    $tmtDate = Carbon::parse($tmt);
                    $now = Carbon::now();
                    
                    // Pastikan TMT tidak di masa depan
                    if ($now->lt($tmtDate)) {
                        $masaKerjaTahun = 0;
                    } else {
                        // Hitung selisih tahun dengan cara yang lebih akurat
                        $years = $now->year - $tmtDate->year;
                        $months = $now->month - $tmtDate->month;
                        $days = $now->day - $tmtDate->day;
                        
                        // Jika bulan atau hari negatif, kurangi 1 tahun
                        if ($months < 0 || ($months == 0 && $days < 0)) {
                            $years--;
                        }
                        
                        $masaKerjaTahun = max(0, $years);
                    }
                } catch (\Exception $e) {
                    $masaKerjaTahun = 0;
                }
            }

            $data = [
                'id' => $thr->id,
                'guru_id' => $thr->guru_id,
                'nama_lengkap' => $guru ? $guru->nama_lengkap : null,
                'jabatan' => $guru && $guru->jabatan ? $guru->jabatan->nama : null,
                'masa_kerja_tahun' => $masaKerjaTahun,
                'gaji_pokok' => $guru ? ($guru->gaji_pokok ?? 0) : 0,
                'masa_kerja_rupiah' => $thr->masa_kerja ?? ($guru ? ($guru->tunjangan_masa_kerja ?? 0) : 0),
                'jumlah_tatap_muka' => $thr->jumlah_tatap_muka,
                'tatap_muka_rupiah' => $thr->tatap_muka_rupiah,
                'total_rupiah' => $thr->total_rupiah,
                'keterangan_rupiah' => $thr->keterangan_rupiah,
                'tahun' => $thr->tahun,
                'created_at' => $thr->created_at,
                'updated_at' => $thr->updated_at,
            ];

            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data THR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $thr = THR::find($id);

            if (!$thr) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data THR tidak ditemukan'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'guru_id' => 'sometimes|exists:gurus,id',
                'tahun' => 'sometimes|integer|min:2020|max:2100',
                'jumlah_tatap_muka' => 'sometimes|integer|min:0',
                'tatap_muka_rupiah' => 'sometimes|integer|min:0',
                'masa_kerja' => 'nullable|integer|min:0',
                'total_rupiah' => 'sometimes|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Jika tahun atau guru_id diubah, cek duplikasi
            if ($request->has('guru_id') || $request->has('tahun')) {
                $guruId = $request->guru_id ?? $thr->guru_id;
                $tahun = $request->tahun ?? $thr->tahun;
                
                $existing = THR::where('guru_id', $guruId)
                    ->where('tahun', $tahun)
                    ->where('id', '!=', $id)
                    ->first();

                if ($existing) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'THR untuk guru ini pada tahun ' . $tahun . ' sudah ada'
                    ], 409);
                }
            }

            $data = $request->all();
            if (isset($data['total_rupiah'])) {
                $data['keterangan_rupiah'] = $data['total_rupiah'];
            }

            $thr->update($data);

            return response()->json([
                'status' => 'success',
                'message' => 'THR berhasil diperbarui',
                'data' => $thr
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui THR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $thr = THR::find($id);

            if (!$thr) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data THR tidak ditemukan'
                ], 404);
            }

            $thr->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'THR berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus THR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export THR to Excel format
     */
    public function export(Request $request)
    {
        try {
            $tahun = $request->get('tahun', date('Y'));

            // Ambil data THR dengan relasi guru
            $thrList = THR::with(['guru.jabatan', 'guru.unitSekolah'])
                ->where('tahun', $tahun)
                ->orderBy('id')
                ->get();

            if ($thrList->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tidak ada data THR untuk tahun ' . $tahun
                ], 404);
            }

            // Format data untuk export sesuai format gambar
            $data = $thrList->map(function($item, $index) {
                $guru = $item->guru;
                $tmt = $guru ? $guru->tmt : null;
                $masaKerjaTahun = 0;
                
                if ($tmt) {
                    try {
                        $tmtDate = Carbon::parse($tmt);
                        $now = Carbon::now();
                        
                        // Pastikan TMT tidak di masa depan
                        if ($now->lt($tmtDate)) {
                            $masaKerjaTahun = 0;
                        } else {
                            // Hitung selisih tahun dengan cara yang lebih akurat
                            $years = $now->year - $tmtDate->year;
                            $months = $now->month - $tmtDate->month;
                            $days = $now->day - $tmtDate->day;
                            
                            // Jika bulan atau hari negatif, kurangi 1 tahun
                            if ($months < 0 || ($months == 0 && $days < 0)) {
                                $years--;
                            }
                            
                            $masaKerjaTahun = max(0, $years);
                        }
                    } catch (\Exception $e) {
                        $masaKerjaTahun = 0;
                    }
                }

                return [
                    'no' => $index + 1,
                    'guru_id' => $item->guru_id,
                    'nama_lengkap' => $guru ? $guru->nama_lengkap : '',
                    'jabatan' => $guru && $guru->jabatan ? $guru->jabatan->nama : '',
                    'masa_kerja_tahun' => $masaKerjaTahun,
                    'gaji_pokok' => $guru ? ($guru->gaji_pokok ?? 0) : 0,
                    'masa_kerja_rupiah' => $item->masa_kerja ?? ($guru ? ($guru->tunjangan_masa_kerja ?? 0) : 0),
                    'jumlah_tatap_muka' => $item->jumlah_tatap_muka,
                    'tatap_muka_rupiah' => $item->tatap_muka_rupiah,
                    'total_rupiah' => $item->total_rupiah,
                    'keterangan_rupiah' => $item->keterangan_rupiah,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'tahun' => $tahun
            ]);
        } catch (\Exception $e) {
            \Log::error('Export THR Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal export data THR',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}