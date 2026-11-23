<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class GuruController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Guru::with(['jabatan', 'unitSekolah']);

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Unit sekolah filter
        if ($request->has('unit_sekolah_id')) {
            $query->byUnitSekolah($request->unit_sekolah_id);
        }

        // Jabatan filter
        if ($request->has('jabatan_id')) {
            $query->byJabatan($request->jabatan_id);
        }

        $gurus = $query->orderBy('created_at', 'desc')
                      ->paginate($request->get('per_page', 15));

        // masa_kerja will be automatically appended via $appends in model

        return response()->json([
            'success' => true,
            'data' => $gurus
        ]);
    }

    /**
     * Export guru data to PDF
     */
    public function exportPdf(Request $request)
    {
        $query = Guru::with(['jabatan', 'unitSekolah']);

        // Apply same filters as index method
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('unit_sekolah_id')) {
            $query->byUnitSekolah($request->unit_sekolah_id);
        }

        if ($request->has('jabatan_id')) {
            $query->byJabatan($request->jabatan_id);
        }

        $gurus = $query->orderBy('nama_lengkap', 'asc')->get();

        // Generate HTML content for PDF
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Data Guru</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #333; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .header-info { text-align: center; margin-bottom: 20px; }
        .date-info { font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <h1>DATA GURU</h1>
    <div class="header-info">
        <div class="date-info">Tanggal Export: ' . date('d F Y H:i') . '</div>
        <div class="date-info">Total Data: ' . $gurus->count() . ' guru</div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 60%;">Nama Lengkap</th>
                <th style="width: 35%;">NIP</th>
            </tr>
        </thead>
        <tbody>';

        $no = 1;
        foreach ($gurus as $guru) {
            $html .= '<tr>
                <td>' . $no++ . '</td>
                <td>' . htmlspecialchars($guru->nama_lengkap ?? '') . '</td>
                <td>' . htmlspecialchars($guru->nip ?? '') . '</td>
            </tr>';
        }

        $html .= '</tbody>
    </table>
</body>
</html>';

        // Set headers for PDF download
        $filename = 'Data_Guru_' . date('Y-m-d_H-i-s') . '.html';
        
        return response($html)
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
    public function export(Request $request)
    {
        $query = Guru::with(['jabatan', 'unitSekolah']);

        // Apply same filters as index method
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('unit_sekolah_id')) {
            $query->byUnitSekolah($request->unit_sekolah_id);
        }

        if ($request->has('jabatan_id')) {
            $query->byJabatan($request->jabatan_id);
        }

        $gurus = $query->orderBy('nama_lengkap', 'asc')->get();

        // Prepare CSV data - simple format with only Nama Lengkap and NIP
        $csvData = [];
        
        // Add header - only essential columns
        $csvData[] = [
            'Nama Lengkap',
            'NIP'
        ];

        // Add data rows
        foreach ($gurus as $guru) {
            $csvData[] = [
                $guru->nama_lengkap ?? '',
                $guru->nip ?? ''
            ];
        }

        // Generate CSV content with proper Excel formatting
        $csvContent = '';
        
        // Add UTF-8 BOM for proper Excel encoding
        $csvContent .= "\xEF\xBB\xBF";
        
        foreach ($csvData as $row) {
            $csvContent .= '"' . implode('","', array_map(function($field) {
                // Escape quotes and handle special characters
                return str_replace('"', '""', $field);
            }, $row)) . '"' . "\r\n";
        }

        // Set headers for download with Excel-friendly settings
        $filename = 'Data_Guru_' . date('Y-m-d_H-i-s') . '.csv';
        
        return response($csvContent)
            ->header('Content-Type', 'application/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'required|string|max:255',
            'nip' => 'required|string|max:20|unique:gurus',
            'jabatan_id' => 'required|exists:jabatans,id',
            'status' => 'required|in:Aktif,Non-Aktif,Pensiun',
            'tmt' => 'required|date',
            'unit_sekolah_id' => 'required|exists:unit_sekolahs,id',
            'tempat_lahir' => 'required|string|max:100',
            'tanggal_lahir' => 'required|date',
            'jenjang_pendidikan' => 'required|string|max:50',
            'jurusan' => 'required|string|max:100',
            'status_pernikahan' => 'required|in:Menikah,Belum Menikah,Janda/Duda',
            'tugas_tambahan' => 'nullable|string|max:255',
            'mapel_diampu' => 'nullable|array',
            'jam_mengajar' => 'nullable|integer|min:0',
            'email' => 'required|email|unique:gurus',
            'no_telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'username' => 'required|string|min:3|max:50|unique:gurus|regex:/^[a-zA-Z0-9_]+$/',
            'password' => 'required|string|min:6',
            // Payroll fields
            'gaji_pokok' => 'nullable|integer|min:0',
            'tunjangan_jabatan' => 'nullable|integer|min:0',
            'tunjangan_masa_kerja' => 'nullable|integer|min:0',
            'wali_kelas' => 'nullable|integer|min:0',
            'koordinator' => 'nullable|integer|min:0',
            'tatap_muka' => 'nullable|string|max:50',
            't_muka_pengganti' => 'nullable|string|max:50',
            'tunj_keluarga' => 'nullable|integer|min:0',
            'transport1' => 'nullable|integer|min:0',
            'transport2' => 'nullable|integer|min:0',
            'makan' => 'nullable|integer|min:0',
            'jamsostek' => 'nullable|integer|min:0',
            'overtime' => 'nullable|integer|min:0',
            'pramuka' => 'nullable|integer|min:0',
            'tunj_lain' => 'nullable|integer|min:0',
            'ekskul' => 'nullable|integer|min:0',
            'bpjs' => 'nullable|integer|min:0',
            'bimbel' => 'nullable|integer|min:0',
            'proyek' => 'nullable|integer|min:0',
            'insentif_peng_pramuka' => 'nullable|integer|min:0',
            'insentif_peng_ekskul' => 'nullable|integer|min:0',
            'insentif_peng_proyek' => 'nullable|integer|min:0',
            'insentif_pengurus_bimbel' => 'nullable|integer|min:0',
            // Bank fields
            'nama_bank' => 'nullable|in:BSI,BJB Syariah,Mandiri,Tunai',
            'no_rekening' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['avatar']);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $avatarPath;
        }

        $guru = Guru::create($data);
        
        // Load relationships for response
        $guru->load(['jabatan', 'unitSekolah']);
        // masa_kerja will be automatically appended via $appends in model

        return response()->json([
            'success' => true,
            'message' => 'Guru created successfully',
            'data' => $guru
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $guru = Guru::with(['jabatan', 'unitSekolah'])->findOrFail($id);
        // masa_kerja will be automatically appended via $appends in model
        
        return response()->json([
            'success' => true,
            'data' => $guru
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $guru = Guru::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'sometimes|string|max:255',
            'nip' => 'sometimes|string|max:20|unique:gurus,nip,' . $id,
            'jabatan_id' => 'sometimes|exists:jabatans,id',
            'status' => 'sometimes|in:Aktif,Non-Aktif,Pensiun',
            'tmt' => 'sometimes|date',
            'unit_sekolah_id' => 'sometimes|exists:unit_sekolahs,id',
            'tempat_lahir' => 'sometimes|string|max:100',
            'tanggal_lahir' => 'sometimes|date',
            'jenjang_pendidikan' => 'sometimes|string|max:50',
            'jurusan' => 'sometimes|string|max:100',
            'status_pernikahan' => 'sometimes|in:Menikah,Belum Menikah,Janda/Duda',
            'tugas_tambahan' => 'nullable|string|max:255',
            'mapel_diampu' => 'nullable|array',
            'jam_mengajar' => 'nullable|integer|min:0',
            'email' => 'sometimes|email|unique:gurus,email,' . $id,
            'no_telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'username' => 'sometimes|string|min:3|max:50|unique:gurus,username,' . $id . '|regex:/^[a-zA-Z0-9_]+$/',
            'password' => 'sometimes|string|min:6',
            // Payroll fields
            'gaji_pokok' => 'nullable|integer|min:0',
            'tunjangan_jabatan' => 'nullable|integer|min:0',
            'tunjangan_masa_kerja' => 'nullable|integer|min:0',
            'wali_kelas' => 'nullable|integer|min:0',
            'koordinator' => 'nullable|integer|min:0',
            'tatap_muka' => 'nullable|string|max:50',
            't_muka_pengganti' => 'nullable|string|max:50',
            'tunj_keluarga' => 'nullable|integer|min:0',
            'transport1' => 'nullable|integer|min:0',
            'transport2' => 'nullable|integer|min:0',
            'makan' => 'nullable|integer|min:0',
            'jamsostek' => 'nullable|integer|min:0',
            'overtime' => 'nullable|integer|min:0',
            'pramuka' => 'nullable|integer|min:0',
            'tunj_lain' => 'nullable|integer|min:0',
            'ekskul' => 'nullable|integer|min:0',
            'bpjs' => 'nullable|integer|min:0',
            'bimbel' => 'nullable|integer|min:0',
            'proyek' => 'nullable|integer|min:0',
            'insentif_peng_pramuka' => 'nullable|integer|min:0',
            'insentif_peng_ekskul' => 'nullable|integer|min:0',
            'insentif_peng_proyek' => 'nullable|integer|min:0',
            'insentif_pengurus_bimbel' => 'nullable|integer|min:0',
            // Bank fields
            'nama_bank' => 'nullable|in:BSI,BJB Syariah,Mandiri,Tunai',
            'no_rekening' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['avatar']);

        // Handle password - only update if provided
        if (!$request->filled('password')) {
            unset($data['password']);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($guru->avatar) {
                Storage::disk('public')->delete($guru->avatar);
            }
            
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $avatarPath;
        }

        $guru->update($data);
        
        // Reload with relationships for response
        $guru->load(['jabatan', 'unitSekolah']);
        // masa_kerja will be automatically appended via $appends in model

        return response()->json([
            'success' => true,
            'message' => 'Guru updated successfully',
            'data' => $guru
        ]);
    }

    /**
     * Update guru with file upload support
     */
    public function updateWithFile(Request $request, string $id)
    {
        error_log('=== GURU UPDATE WITH FILE METHOD CALLED ===');
        error_log('Guru ID: ' . $id);
        error_log('Request method: ' . $request->method());
        error_log('Content-Type: ' . $request->header('Content-Type'));
        error_log('Has files: ' . ($request->hasFile('avatar') ? 'YES' : 'NO'));
        
        $guru = Guru::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'sometimes|string|max:255',
            'nip' => 'sometimes|string|max:20|unique:gurus,nip,' . $id,
            'jabatan_id' => 'sometimes|exists:jabatans,id',
            'status' => 'sometimes|in:Aktif,Tidak Aktif,Pensiun',
            'tmt' => 'sometimes|date',
            'unit_sekolah_id' => 'sometimes|exists:unit_sekolahs,id',
            'tempat_lahir' => 'sometimes|string|max:100',
            'tanggal_lahir' => 'sometimes|date',
            'jenjang_pendidikan' => 'sometimes|string|max:50',
            'jurusan' => 'sometimes|string|max:100',
            'status_pernikahan' => 'sometimes|in:Belum Menikah,Menikah,Cerai',
            'email' => 'sometimes|email|unique:gurus,email,' . $id,
            'username' => 'sometimes|string|max:50|unique:gurus,username,' . $id,
            'password' => 'sometimes|string|min:6',
            'tugas_tambahan' => 'nullable|string|max:255',
            'mapel_diampu' => 'nullable|array',
            'jam_mengajar' => 'nullable|integer|min:0',
            'no_telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['avatar', 'mapel_diampu']);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            error_log('GURU UPDATE WITH FILE: Avatar file received: ' . $file->getClientOriginalName() . ' (' . $file->getSize() . ' bytes)');
            
            // Delete old avatar if exists
            if ($guru->avatar) {
                error_log('GURU UPDATE WITH FILE: Deleting old avatar: ' . $guru->avatar);
                Storage::disk('public')->delete($guru->avatar);
            }
            
            $avatarPath = $file->store('avatars', 'public');
            $data['avatar'] = $avatarPath;
            error_log('GURU UPDATE WITH FILE: Avatar stored at: ' . $avatarPath);
        } else {
            error_log('GURU UPDATE WITH FILE: No avatar file received');
        }

        // Handle mapel_diampu array
        if ($request->has('mapel_diampu')) {
            $data['mapel_diampu'] = $request->mapel_diampu;
        }

        $guru->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Guru updated successfully with file',
            'data' => $guru->load(['jabatan', 'unitSekolah']),
            'debug' => [
                'hasFile' => $request->hasFile('avatar'),
                'files' => array_keys($request->allFiles()),
                'method' => $request->method(),
                'contentType' => $request->header('Content-Type')
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $guru = Guru::findOrFail($id);
        
        // Delete avatar if exists
        if ($guru->avatar) {
            Storage::disk('public')->delete($guru->avatar);
        }
        
        $guru->delete();

        return response()->json([
            'success' => true,
            'message' => 'Guru deleted successfully'
        ]);
    }

    /**
     * Get dropdown data for form
     */
    public function getFormData()
    {
        $jabatans = \App\Models\Jabatan::where('status', 'Aktif')->get(['id', 'nama', 'level']);
        $unitSekolahs = \App\Models\UnitSekolah::where('status', 'Aktif')->get(['id', 'nama', 'jenjang']);
        
        return response()->json([
            'success' => true,
            'data' => [
                'jabatans' => $jabatans,
                'unit_sekolahs' => $unitSekolahs
            ]
        ]);
    }

    /**
     * Get jumlah hari hadir untuk guru berdasarkan periode
     * Periode: 26 bulan sebelumnya - 25 bulan ini
     */
    public function getJumlahHariHadir(Request $request, $guruId)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2020|max:2100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $bulan = $request->input('bulan');
        $tahun = $request->input('tahun');

        // Hitung tanggal periode
        // Tanggal mulai: 26 bulan sebelumnya
        $tanggalMulai = \Carbon\Carbon::createFromDate($tahun, $bulan, 26)->subMonth();
        
        // Tanggal akhir: 25 bulan ini
        $tanggalAkhir = \Carbon\Carbon::createFromDate($tahun, $bulan, 25);

        // Hitung jumlah hari hadir (status = 'hadir')
        $jumlahHariHadir = \App\Models\Absensi::where('id_guru', $guruId)
            ->whereBetween('tanggal', [$tanggalMulai->format('Y-m-d'), $tanggalAkhir->format('Y-m-d')])
            ->where('status', 'hadir')
            ->count();

        // Hitung jumlah hari lain (status selain 'hadir': izin, sakit, alpha)
        $jumlahHariLain = \App\Models\Absensi::where('id_guru', $guruId)
            ->whereBetween('tanggal', [$tanggalMulai->format('Y-m-d'), $tanggalAkhir->format('Y-m-d')])
            ->whereIn('status', ['izin', 'sakit', 'alpha'])
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'guru_id' => $guruId,
                'periode' => [
                    'bulan' => $bulan,
                    'tahun' => $tahun,
                    'tanggal_mulai' => $tanggalMulai->format('Y-m-d'),
                    'tanggal_akhir' => $tanggalAkhir->format('Y-m-d')
                ],
                'jumlah_hari_hadir' => $jumlahHariHadir,
                'jumlah_hari_lain' => $jumlahHariLain
            ]
        ]);
    }

    /**
     * Get total absensi untuk guru berdasarkan rentang tanggal
     */
    public function getTotalAbsensi(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'id_guru' => 'required|exists:gurus,id',
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'required|date|after_or_equal:tanggal_mulai'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $guruId = $request->input('id_guru');
        $tanggalMulai = $request->input('tanggal_mulai');
        $tanggalAkhir = $request->input('tanggal_akhir');

        // Hitung jumlah hari hadir (status = 'hadir')
        $jumlahHariHadir = \App\Models\Absensi::where('id_guru', $guruId)
            ->whereBetween('tanggal', [$tanggalMulai, $tanggalAkhir])
            ->where('status', 'hadir')
            ->count();

        // Hitung jumlah hari lain (status selain 'hadir': izin, sakit, alpha)
        $jumlahHariLain = \App\Models\Absensi::where('id_guru', $guruId)
            ->whereBetween('tanggal', [$tanggalMulai, $tanggalAkhir])
            ->whereIn('status', ['izin', 'sakit', 'alpha'])
            ->count();

        // Hitung total
        $total = $jumlahHariHadir + $jumlahHariLain;

        // Hitung persentase kehadiran
        $persentaseKehadiran = $total > 0 
            ? round(($jumlahHariHadir / $total) * 100, 2) 
            : 0;

        // Build statistics
        $statistics = [
            'total' => $total,
            'jumlah_hari_hadir' => $jumlahHariHadir,
            'jumlah_hari_lain' => $jumlahHariLain,
            'persentase_kehadiran' => $persentaseKehadiran
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'guru_id' => $guruId,
                'periode' => [
                    'tanggal_mulai' => $tanggalMulai,
                    'tanggal_akhir' => $tanggalAkhir
                ],
                'statistics' => $statistics
            ]
        ]);
    }
}
