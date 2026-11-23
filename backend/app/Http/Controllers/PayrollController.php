<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Repositories\PayrollRepository;
use App\Repositories\PayrollPotonganRepository;
use App\Repositories\GuruPotonganRepository;
use App\Models\PayrollInputTu;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PayrollController extends Controller
{
    protected $payrollRepo;
    protected $potonganRepo;
    protected $guruPotonganRepo;

    public function __construct(
        PayrollRepository $payrollRepo,
        PayrollPotonganRepository $potonganRepo,
        GuruPotonganRepository $guruPotonganRepo
    ) {
        $this->payrollRepo = $payrollRepo;
        $this->potonganRepo = $potonganRepo;
        $this->guruPotonganRepo = $guruPotonganRepo;
    }

    // CRUD Payroll
    public function index()
    {
        try {
            // Jika ada filter guru_id, periode_bulan, periode_tahun
            if (request()->has('guru_id') && request()->get('guru_id') !== '' &&
                request()->has('periode_bulan') && request()->get('periode_bulan') !== '' &&
                request()->has('periode_tahun') && request()->get('periode_tahun') !== '') {
                
                $guruId = request()->get('guru_id');
                $periodeBulan = request()->get('periode_bulan');
                $periodeTahun = request()->get('periode_tahun');

                // Query payroll dengan filter spesifik
                $payroll = \App\Models\Payroll::select('*')
                ->with([
                    'guru' => function($query) {
                        $query->select('id', 'nama_lengkap', 'nip', 'email', 'jabatan_id', 'unit_sekolah_id', 'tunj_lain', 'bpjs', 'jamsostek', 'proyek')
                              ->with([
                                  'jabatan:id,nama',
                                  'unitSekolah:id,nama'
                              ]);
                    }
                ])
                ->where('guru_id', $guruId)
                ->where('periode_bulan', $periodeBulan)
                ->where('periode_tahun', $periodeTahun)
                ->first();

                // Jika payroll tidak ditemukan, ambil data guru dan return dengan gaji_bersih = 0
                if (!$payroll) {
                    $guru = \App\Models\Guru::with([
                        'jabatan:id,nama',
                        'unitSekolah:id,nama'
                    ])->find($guruId);

                    if (!$guru) {
                        return response()->json([]);
                    }

                    // Return data guru dengan gaji_bersih = 0
                    return response()->json([
                        [
                            'id' => null,
                            'payroll_id' => null,
                            'guru_id' => $guru->id,
                            'nama_lengkap' => $guru->nama_lengkap ?? '',
                            'nip' => $guru->nip ?? '',
                            'email' => $guru->email ?? '',
                            'nama_jabatan' => $guru->jabatan->nama ?? '',
                            'unit_sekolah_nama' => $guru->unitSekolah->nama ?? '',
                            // Data payroll dengan default 0
                            'gaji_pokok' => 0,
                            'jabatan' => 0,
                            'masa_kerja' => 0,
                            'wali_kelas' => 0,
                            'koordinator' => 0,
                            'tatap_muka' => 0,
                            't_muka_pengganti' => 0,
                            'jml_jam_t_muka_pengganti' => 0,
                            'tunj_keluarga' => 0,
                            'transport1' => 0,
                            'jml_hari_transport1' => 0,
                            'transport2' => 0,
                            'jml_hari_transport2' => 0,
                            'total_transport_all' => 0,
                            'makan' => 0,
                            'makan_hari' => 0,
                            'jamsostek' => 0,
                            'overtime' => 0,
                            'overtime_hari' => 0,
                            'pramuka' => 0,
                            'jml_jam_pramuka' => 0,
                            'tunj_lain' => 0,
                            'ekskul' => 0,
                            'jml_jam_insentif_ekskul' => 0,
                            'bpjs' => 0,
                            'bimbel' => 0,
                            'jml_jam_insentif_bimbel' => 0,
                            'proyek' => 0,
                            'insentif_peng_pramuka' => 0,
                            'insentif_peng_ekskul' => 0,
                            'insentif_peng_proyek' => 0,
                            'insentif_pengurus_bimbel' => 0,
                            'insentif_lain' => 0,
                            'potongan_yayasan' => 0,
                            'potongan_lain' => 0,
                            'potongan_koperasi_wajib' => 0,
                            'potongan_koperasi_sukarela' => 0,
                            'potongan_angsuran_koperasi' => 0,
                            'deposit_annurmart' => 0,
                            'potongan_jht' => 0,
                            'potongan_pph21' => 0,
                            'potongan_t_muka_pengganti' => 0,
                            'jumlah_hari' => 0,
                            'total_transport' => 0,
                            'total_gaji' => 0,
                            'total_potongan' => 0,
                            'gaji_bersih' => 0,
                            'status' => 'Draft',
                            'periode_bulan' => $periodeBulan,
                            'periode_tahun' => $periodeTahun,
                            'created_date' => null,
                            'created_at' => null,
                            'updated_at' => null,
                        ]
                    ]);
                }

                // Jika payroll ditemukan, return data normal
                return response()->json([
                    [
                        'id' => $payroll->payroll_id ? (string)$payroll->payroll_id : null,
                        'payroll_id' => $payroll->payroll_id ? (string)$payroll->payroll_id : null,
                        'guru_id' => $payroll->guru_id,
                        'nama_lengkap' => $payroll->guru->nama_lengkap ?? '',
                        'nip' => $payroll->guru->nip ?? '',
                        'email' => $payroll->guru->email ?? '',
                        'nama_jabatan' => $payroll->guru->jabatan->nama ?? '',
                        'unit_sekolah_nama' => $payroll->guru->unitSekolah->nama ?? '',
                        'gaji_pokok' => $payroll->gaji_pokok,
                        'jabatan' => $payroll->jabatan,
                        'masa_kerja' => $payroll->masa_kerja,
                        'wali_kelas' => $payroll->wali_kelas ?? 0,
                        'koordinator' => $payroll->koordinator ?? 0,
                        'tatap_muka' => $payroll->tatap_muka ?? 0,
                        't_muka_pengganti' => $payroll->t_muka_pengganti ?? 0,
                        'jml_jam_t_muka_pengganti' => $payroll->jml_jam_t_muka_pengganti ?? 0,
                        'tunj_keluarga' => $payroll->tunj_keluarga ?? 0,
                        'transport1' => $payroll->transport1 ?? 0,
                        'jml_hari_transport1' => $payroll->jml_hari_transport1 ?? 0,
                        'transport2' => $payroll->transport2 ?? 0,
                        'jml_hari_transport2' => $payroll->jml_hari_transport2 ?? 0,
                        'total_transport_all' => $payroll->total_transport_all ?? 0,
                        'makan' => $payroll->makan ?? 0,
                        'makan_hari' => $payroll->makan_hari ?? 0,
                        'jamsostek' => $payroll->jamsostek ?? 0,
                        'overtime' => $payroll->overtime ?? 0,
                        'overtime_hari' => $payroll->overtime_hari ?? 0,
                        'pramuka' => $payroll->pramuka ?? 0,
                        'jml_jam_pramuka' => $payroll->jml_jam_pramuka ?? 0,
                        'tunj_lain' => $payroll->tunj_lain ?? 0,
                        'ekskul' => $payroll->ekskul ?? 0,
                        'jml_jam_insentif_ekskul' => $payroll->jml_jam_insentif_ekskul ?? 0,
                        'bpjs' => $payroll->bpjs ?? 0,
                        'bimbel' => $payroll->bimbel ?? 0,
                        'jml_jam_insentif_bimbel' => $payroll->jml_jam_insentif_bimbel ?? 0,
                        'proyek' => $payroll->proyek ?? 0,
                        'jml_jam_insentif_proyek' => $payroll->jml_jam_insentif_proyek ?? 0,
                        'insentif_peng_pramuka' => $payroll->insentif_peng_pramuka ?? 0,
                        'insentif_peng_ekskul' => $payroll->insentif_peng_ekskul ?? 0,
                        'insentif_peng_proyek' => $payroll->insentif_peng_proyek ?? 0,
                        'insentif_pengurus_bimbel' => $payroll->insentif_pengurus_bimbel ?? 0,
                        'insentif_lain' => $payroll->insentif_lain ?? 0,
                        'potongan_yayasan' => $payroll->potongan_yayasan ?? 0,
                        'potongan_lain' => $payroll->potongan_lain ?? 0,
                        'potongan_koperasi_wajib' => $payroll->potongan_koperasi_wajib ?? 0,
                        'potongan_koperasi_sukarela' => $payroll->potongan_koperasi_sukarela ?? 0,
                        'potongan_angsuran_koperasi' => $payroll->potongan_angsuran_koperasi ?? 0,
                        'deposit_annurmart' => $payroll->deposit_annurmart ?? 0,
                        'potongan_jht' => $payroll->potongan_jht ?? 0,
                        'potongan_pph21' => $payroll->potongan_pph21 ?? 0,
                        'potongan_t_muka_pengganti' => $payroll->potongan_t_muka_pengganti ?? 0,
                        'jumlah_hari' => $payroll->jumlah_hari ?? 0,
                        'total_transport' => $payroll->total_transport ?? 0,
                        'total_gaji' => $payroll->total_gaji,
                        'total_potongan' => $payroll->total_potongan,
                        'gaji_bersih' => $payroll->gaji_bersih,
                        'status' => $payroll->status,
                        'periode_bulan' => $payroll->periode_bulan,
                        'periode_tahun' => $payroll->periode_tahun,
                        'created_date' => $payroll->created_date,
                        'created_at' => $payroll->created_at,
                        'updated_at' => $payroll->updated_at,
                    ]
                ]);
            }

            // Query normal tanpa filter spesifik (return semua atau dengan filter parsial)
            $query = \App\Models\Payroll::select('*')->with([
                'guru' => function($query) {
                    $query->select('id', 'nama_lengkap', 'nip', 'email', 'jabatan_id', 'unit_sekolah_id', 'tunj_lain', 'bpjs', 'jamsostek', 'proyek')
                          ->with([
                              'jabatan:id,nama',
                              'unitSekolah:id,nama'
                          ]);
                }
            ]);

            // Filter berdasarkan query parameter (untuk backward compatibility)
            if (request()->has('guru_id') && request()->get('guru_id') !== '') {
                $query->where('guru_id', request()->get('guru_id'));
            }

            if (request()->has('periode_bulan') && request()->get('periode_bulan') !== '') {
                $query->where('periode_bulan', request()->get('periode_bulan'));
            }

            if (request()->has('periode_tahun') && request()->get('periode_tahun') !== '') {
                $query->where('periode_tahun', request()->get('periode_tahun'));
            }

            $payrolls = $this->orderByPeriodeTerbaru($query)->get();

            // Transform data untuk frontend
            $transformedData = $payrolls->map(function($payroll) {
                return [
                    'id' => $payroll->payroll_id ? (string)$payroll->payroll_id : null,
                    'payroll_id' => $payroll->payroll_id ? (string)$payroll->payroll_id : null,
                    'guru_id' => $payroll->guru_id,
                    'nama_lengkap' => $payroll->guru->nama_lengkap ?? '',
                    'nip' => $payroll->guru->nip ?? '',
                    'email' => $payroll->guru->email ?? '',
                    'nama_jabatan' => $payroll->guru->jabatan->nama ?? '',
                    'unit_sekolah_nama' => $payroll->guru->unitSekolah->nama ?? '',
                    // Data payroll
                    'gaji_pokok' => $payroll->gaji_pokok,
                    'jabatan' => $payroll->jabatan,
                    'masa_kerja' => $payroll->masa_kerja,
                    'wali_kelas' => $payroll->wali_kelas ?? 0,
                    'koordinator' => $payroll->koordinator ?? 0,
                    'tatap_muka' => $payroll->tatap_muka ?? 0,
                    't_muka_pengganti' => $payroll->t_muka_pengganti ?? 0,
                    'jml_jam_t_muka_pengganti' => $payroll->jml_jam_t_muka_pengganti ?? 0,
                    'tunj_keluarga' => $payroll->tunj_keluarga ?? 0,
                    'transport1' => $payroll->transport1 ?? 0,
                    'jml_hari_transport1' => $payroll->jml_hari_transport1 ?? 0,
                    'transport2' => $payroll->transport2 ?? 0,
                    'jml_hari_transport2' => $payroll->jml_hari_transport2 ?? 0,
                    'total_transport_all' => $payroll->total_transport_all ?? 0,
                    'makan' => $payroll->makan ?? 0,
                    'makan_hari' => $payroll->makan_hari ?? 0,
                    'jamsostek' => $payroll->jamsostek ?? 0,
                    'overtime' => $payroll->overtime ?? 0,
                    'overtime_hari' => $payroll->overtime_hari ?? 0,
                    'pramuka' => $payroll->pramuka ?? 0,
                    'jml_jam_pramuka' => $payroll->jml_jam_pramuka ?? 0,
                    'tunj_lain' => $payroll->tunj_lain ?? 0,
                    'ekskul' => $payroll->ekskul ?? 0,
                    'jml_jam_insentif_ekskul' => $payroll->jml_jam_insentif_ekskul ?? 0,
                    'bpjs' => $payroll->bpjs ?? 0,
                    'bimbel' => $payroll->bimbel ?? 0,
                    'jml_jam_insentif_bimbel' => $payroll->jml_jam_insentif_bimbel ?? 0,
                    'proyek' => $payroll->proyek ?? 0,
                    'jml_jam_insentif_proyek' => $payroll->jml_jam_insentif_proyek ?? 0,
                    'insentif_peng_pramuka' => $payroll->insentif_peng_pramuka ?? 0,
                    'insentif_peng_ekskul' => $payroll->insentif_peng_ekskul ?? 0,
                    'insentif_peng_proyek' => $payroll->insentif_peng_proyek ?? 0,
                    'insentif_pengurus_bimbel' => $payroll->insentif_pengurus_bimbel ?? 0,
                    'insentif_lain' => $payroll->insentif_lain ?? 0,
                    'potongan_yayasan' => $payroll->potongan_yayasan ?? 0,
                    'potongan_lain' => $payroll->potongan_lain ?? 0,
                    'potongan_koperasi_wajib' => $payroll->potongan_koperasi_wajib ?? 0,
                    'potongan_koperasi_sukarela' => $payroll->potongan_koperasi_sukarela ?? 0,
                    'potongan_angsuran_koperasi' => $payroll->potongan_angsuran_koperasi ?? 0,
                    'deposit_annurmart' => $payroll->deposit_annurmart ?? 0,
                    'potongan_jht' => $payroll->potongan_jht ?? 0,
                    'potongan_pph21' => $payroll->potongan_pph21 ?? 0,
                    'potongan_t_muka_pengganti' => $payroll->potongan_t_muka_pengganti ?? 0,
                    'jumlah_hari' => $payroll->jumlah_hari ?? 0,
                    'total_transport' => $payroll->total_transport ?? 0,
                    'total_gaji' => $payroll->total_gaji,
                    'total_potongan' => $payroll->total_potongan,
                    'gaji_bersih' => $payroll->gaji_bersih,
                    'status' => $payroll->status,
                    'periode_bulan' => $payroll->periode_bulan,
                    'periode_tahun' => $payroll->periode_tahun,
                    'created_date' => $payroll->created_date,
                    'created_at' => $payroll->created_at,
                    'updated_at' => $payroll->updated_at,
                ];
            });

            return response()->json($transformedData);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data payroll',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all payrolls (simplified version)
     * Filter out records with null IDs
     */
    public function getAllPayrolls()
    {
        try {
            $payrolls = $this->orderByPeriodeTerbaru(
                \App\Models\Payroll::with([
                    'guru' => function($query) {
                        $query->select('id', 'nama_lengkap', 'nip', 'email', 'jabatan_id', 'unit_sekolah_id', 'tunj_lain', 'bpjs', 'jamsostek', 'proyek')
                              ->with([
                                  'jabatan:id,nama',
                                  'unitSekolah:id,nama'
                              ]);
                    }
                ])
            )
            ->get()
            ->filter(function($payroll) {
                // Hanya return payroll yang memiliki ID valid
                return $payroll && $payroll->payroll_id && !is_null($payroll->payroll_id);
            });

            $transformedData = $payrolls->map(function($payroll) {
                return [
                    'id' => (string)$payroll->payroll_id,
                    'payroll_id' => (string)$payroll->payroll_id,
                    'guru_id' => $payroll->guru_id,
                    'nama_lengkap' => $payroll->guru->nama_lengkap ?? '',
                    'nip' => $payroll->guru->nip ?? '',
                    'email' => $payroll->guru->email ?? '',
                    'nama_jabatan' => $payroll->guru->jabatan->nama ?? '',
                    'unit_sekolah_nama' => $payroll->guru->unitSekolah->nama ?? '',
                    'gaji_pokok' => $payroll->gaji_pokok,
                    'jabatan' => $payroll->jabatan,
                    'masa_kerja' => $payroll->masa_kerja,
                    'wali_kelas' => $payroll->wali_kelas ?? 0,
                    'koordinator' => $payroll->koordinator ?? 0,
                    'tatap_muka' => $payroll->tatap_muka ?? 0,
                    't_muka_pengganti' => $payroll->t_muka_pengganti ?? 0,
                    'jml_jam_t_muka_pengganti' => $payroll->jml_jam_t_muka_pengganti ?? 0,
                    'tunj_keluarga' => $payroll->tunj_keluarga ?? 0,
                    'transport1' => $payroll->transport1 ?? 0,
                    'jml_hari_transport1' => $payroll->jml_hari_transport1 ?? 0,
                    'transport2' => $payroll->transport2 ?? 0,
                    'jml_hari_transport2' => $payroll->jml_hari_transport2 ?? 0,
                    'total_transport_all' => $payroll->total_transport_all ?? 0,
                    'makan' => $payroll->makan ?? 0,
                    'makan_hari' => $payroll->makan_hari ?? 0,
                    'jamsostek' => $payroll->jamsostek ?? 0,
                    'overtime' => $payroll->overtime ?? 0,
                    'overtime_hari' => $payroll->overtime_hari ?? 0,
                    'pramuka' => $payroll->pramuka ?? 0,
                    'jml_jam_pramuka' => $payroll->jml_jam_pramuka ?? 0,
                    'tunj_lain' => $payroll->tunj_lain ?? 0,
                    'ekskul' => $payroll->ekskul ?? 0,
                    'jml_jam_insentif_ekskul' => $payroll->jml_jam_insentif_ekskul ?? 0,
                    'bpjs' => $payroll->bpjs ?? 0,
                    'bimbel' => $payroll->bimbel ?? 0,
                    'jml_jam_insentif_bimbel' => $payroll->jml_jam_insentif_bimbel ?? 0,
                    'proyek' => $payroll->proyek ?? 0,
                    'jml_jam_insentif_proyek' => $payroll->jml_jam_insentif_proyek ?? 0,
                    'insentif_peng_pramuka' => $payroll->insentif_peng_pramuka ?? 0,
                    'insentif_peng_ekskul' => $payroll->insentif_peng_ekskul ?? 0,
                    'insentif_peng_proyek' => $payroll->insentif_peng_proyek ?? 0,
                    'insentif_pengurus_bimbel' => $payroll->insentif_pengurus_bimbel ?? 0,
                    'insentif_lain' => $payroll->insentif_lain ?? 0,
                    'potongan_yayasan' => $payroll->potongan_yayasan ?? 0,
                    'potongan_lain' => $payroll->potongan_lain ?? 0,
                    'potongan_koperasi_wajib' => $payroll->potongan_koperasi_wajib ?? 0,
                    'potongan_koperasi_sukarela' => $payroll->potongan_koperasi_sukarela ?? 0,
                    'potongan_angsuran_koperasi' => $payroll->potongan_angsuran_koperasi ?? 0,
                    'deposit_annurmart' => $payroll->deposit_annurmart ?? 0,
                    'potongan_jht' => $payroll->potongan_jht ?? 0,
                    'potongan_pph21' => $payroll->potongan_pph21 ?? 0,
                    'potongan_t_muka_pengganti' => $payroll->potongan_t_muka_pengganti ?? 0,
                    'jumlah_hari' => $payroll->jumlah_hari ?? 0,
                    'total_transport' => $payroll->total_transport ?? 0,
                    'total_gaji' => $payroll->total_gaji,
                    'total_potongan' => $payroll->total_potongan,
                    'gaji_bersih' => $payroll->gaji_bersih,
                    'status' => $payroll->status,
                    'periode_bulan' => $payroll->periode_bulan,
                    'periode_tahun' => $payroll->periode_tahun,
                    'created_date' => $payroll->created_date,
                    'created_at' => $payroll->created_at,
                    'updated_at' => $payroll->updated_at,
                ];
            });

            return response()->json($transformedData->values());
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data payroll',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $validator = Validator::make($data,[
            'guru_id'                    => 'required|integer|exists:gurus,id',
            'gaji_pokok'                 => 'required|numeric',
            'jabatan'                    => 'required|numeric',
            'masa_kerja'                 => 'required|integer',
            'wali_kelas'                 => 'nullable|numeric',
            'koordinator'                => 'nullable|numeric',
            'tatap_muka'                 => 'nullable|numeric',
            't_muka_pengganti'           => 'nullable|numeric',
            'jml_jam_t_muka_pengganti'   => 'nullable|integer',
            'tunj_keluarga'              => 'nullable|numeric',
            'transport1'                 => 'nullable|numeric',
            'jml_hari_transport1'        => 'nullable|integer',
            'transport2'                 => 'nullable|numeric',
            'jml_hari_transport2'        => 'nullable|integer',
            'total_transport_all'        => 'nullable|numeric',
            'makan'                      => 'nullable|numeric',
            'makan_hari'                 => 'nullable|integer',
            'jamsostek'                  => 'nullable|numeric',
            'overtime'                   => 'nullable|numeric',
            'overtime_hari'              => 'nullable|integer',
            'pramuka'                    => 'nullable|numeric',
            'jml_jam_pramuka'            => 'nullable|integer',
            'tunj_lain'                  => 'nullable|numeric',
            'ekskul'                     => 'nullable|numeric',
            'jml_jam_insentif_ekskul'    => 'nullable|integer',
            'bpjs'                       => 'nullable|numeric',
            'bimbel'                     => 'nullable|numeric',
            'jml_jam_insentif_bimbel'    => 'nullable|integer',
            'proyek'                     => 'nullable|numeric',
            'jml_jam_insentif_proyek'    => 'nullable|integer',
            'insentif_peng_pramuka'      => 'nullable|numeric',
            'insentif_peng_ekskul'       => 'nullable|numeric',
            'insentif_peng_proyek'       => 'nullable|numeric',
            'insentif_pengurus_bimbel'   => 'nullable|numeric',
            'insentif_lain'              => 'nullable|numeric',
            'potongan_yayasan'           => 'nullable|numeric',
            'potongan_lain'              => 'nullable|numeric',
            'potongan_koperasi_wajib'    => 'nullable|numeric',
            'potongan_koperasi_sukarela' => 'nullable|numeric',
            'potongan_angsuran_koperasi' => 'nullable|numeric',
            'deposit_annurmart'          => 'nullable|numeric',
            'potongan_jht'               => 'nullable|numeric',
            'potongan_pph21'             => 'nullable|numeric',
            'potongan_t_muka_pengganti'  => 'nullable|numeric',
            'jumlah_hari'                => 'nullable|integer',
            'total_transport'            => 'nullable|numeric',
            'total_gaji'                 => 'required|numeric',
            'total_potongan'             => 'required|numeric',
            'gaji_bersih'                => 'required|numeric',
            'status'                     => 'required|string',
            'periode_bulan'              => 'required|string',
            'periode_tahun'              => 'required|string',
            'created_date'               => now(),
            'created_by'                 => auth()->user()->name ?? 'system',
            'potongan_list'              => 'nullable|array',
            'potongan_list.*.nama_potongan' => 'required_with:potongan_list|string',
            'potongan_list.*.jumlah_potongan' => 'required_with:potongan_list|numeric|min:0',
        ]);

        if ($validator->fails()) {
            // jangan return $validator (itu objek). Gunakan ->errors() atau ->errors()->toArray()
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()->toArray()
            ], 422);
        }

        $validated = $validator->validated();

        if (empty($validated['created_date'])) {
            $validated['created_date'] = now();
        }
        if (empty($validated['created_by'])) {
            $validated['created_by'] = auth()->user()->name ?? 'system';
        }

        // Simpan data payroll utama
        $payroll = \App\Models\Payroll::create($validated);

        // Simpan data potongan jika ada
        if (!empty($validated['potongan_list'])) {
            foreach ($validated['potongan_list'] as $potonganData) {
                if (!empty($potonganData['nama_potongan']) && !empty($potonganData['jumlah_potongan'])) {
                    $potonganData['guru_id'] = $validated['guru_id'];
                    $potonganData['periode_bulan'] = $validated['periode_bulan'];
                    $potonganData['periode_tahun'] = $validated['periode_tahun'];
                    $potonganData['created_by'] = $validated['created_by'];
                    $potonganData['created_date'] = $validated['created_date'];
                    
                    // Ubah nama field untuk sesuai dengan model
                    $potonganData['jumlah'] = $potonganData['jumlah_potongan'];
                    unset($potonganData['jumlah_potongan']);
                    
                    // Hapus id_potongan dari data karena akan auto increment
                    unset($potonganData['id_potongan']);
                    
                    $this->potonganRepo->create($potonganData);
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data payroll berhasil disimpan.',
            'data' => $payroll
            ], 201);
    }

    public function show($id)
    {
        $payroll = \App\Models\Payroll::with([
            'guru' => function($query) {
                $query->select('id', 'nama_lengkap', 'nip', 'email', 'jabatan_id', 'unit_sekolah_id', 'tmt', 'nama_bank', 'no_rekening', 'transport1', 'transport2', 't_muka_pengganti', 'makan', 'jamsostek', 'overtime', 'pramuka', 'tunj_lain', 'ekskul', 'bpjs', 'bimbel', 'proyek')
                      ->with([
                          'jabatan:id,nama',
                          'unitSekolah:id,nama'
                      ]);
            }
        ])->find($id);

        if (!$payroll) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payroll data not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $payroll
        ]);
    }

    public function update(Request $request, $id)
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'guru_id'                    => 'sometimes|required|integer|exists:gurus,id',
            'gaji_pokok'                 => 'sometimes|required|numeric',
            'jabatan'                    => 'sometimes|required|numeric',
            'masa_kerja'                 => 'sometimes|required|integer',
            'wali_kelas'                 => 'nullable|numeric',
            'koordinator'                => 'nullable|numeric',
            'tatap_muka'                 => 'nullable|numeric',
            't_muka_pengganti'           => 'nullable|numeric',
            'jml_jam_t_muka_pengganti'   => 'nullable|integer',
            'tunj_keluarga'              => 'nullable|numeric',
            'transport1'                 => 'nullable|numeric',
            'jml_hari_transport1'        => 'nullable|integer',
            'transport2'                 => 'nullable|numeric',
            'jml_hari_transport2'        => 'nullable|integer',
            'total_transport_all'        => 'nullable|numeric',
            'makan'                      => 'nullable|numeric',
            'makan_hari'                 => 'nullable|integer',
            'jamsostek'                  => 'nullable|numeric',
            'overtime'                   => 'nullable|numeric',
            'overtime_hari'              => 'nullable|integer',
            'pramuka'                    => 'nullable|numeric',
            'jml_jam_pramuka'            => 'nullable|integer',
            'tunj_lain'                  => 'nullable|numeric',
            'ekskul'                     => 'nullable|numeric',
            'jml_jam_insentif_ekskul'    => 'nullable|integer',
            'bpjs'                       => 'nullable|numeric',
            'bimbel'                     => 'nullable|numeric',
            'jml_jam_insentif_bimbel'    => 'nullable|integer',
            'proyek'                     => 'nullable|numeric',
            'jml_jam_insentif_proyek'    => 'nullable|integer',
            'insentif_peng_pramuka'      => 'nullable|numeric',
            'insentif_peng_ekskul'       => 'nullable|numeric',
            'insentif_peng_proyek'       => 'nullable|numeric',
            'insentif_pengurus_bimbel'   => 'nullable|numeric',
            'insentif_lain'              => 'nullable|numeric',
            'potongan_yayasan'           => 'nullable|numeric',
            'potongan_lain'              => 'nullable|numeric',
            'potongan_koperasi_wajib'    => 'nullable|numeric',
            'potongan_koperasi_sukarela' => 'nullable|numeric',
            'potongan_angsuran_koperasi' => 'nullable|numeric',
            'deposit_annurmart'          => 'nullable|numeric',
            'potongan_jht'               => 'nullable|numeric',
            'potongan_pph21'             => 'nullable|numeric',
            'potongan_t_muka_pengganti'  => 'nullable|numeric',
            'jumlah_hari'                => 'nullable|integer',
            'total_transport'            => 'nullable|numeric',
            'total_gaji'                 => 'sometimes|required|numeric',
            'total_potongan'             => 'sometimes|required|numeric',
            'gaji_bersih'                => 'sometimes|required|numeric',
            'status'                     => 'sometimes|required|string',
            'periode_bulan'              => 'sometimes|required|string',
            'periode_tahun'              => 'sometimes|required|string',
            'potongan_list'              => 'nullable|array',
            'potongan_list.*.nama_potongan' => 'required_with:potongan_list|string',
            'potongan_list.*.jumlah_potongan' => 'required_with:potongan_list|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()->toArray()
            ], 422);
        }

        $validated = $validator->validated();

        // Cari payroll
        $payroll = \App\Models\Payroll::find($id);
        if (!$payroll) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payroll data not found'
            ], 404);
        }

        // Update data payroll utama
        $payroll->update($validated);

        // Update data potongan jika ada
        if (!empty($validated['potongan_list'])) {
            // Hapus potongan lama
            \App\Models\PayrollPotongan::where('payroll_id', $id)->delete();
            
            // Simpan potongan baru
            foreach ($validated['potongan_list'] as $potonganData) {
                if (!empty($potonganData['nama_potongan']) && !empty($potonganData['jumlah_potongan'])) {
                    $potonganData['guru_id'] = $validated['guru_id'] ?? $payroll->guru_id;
                    $potonganData['payroll_id'] = $id;
                    $potonganData['periode_bulan'] = $validated['periode_bulan'] ?? $payroll->periode_bulan;
                    $potonganData['periode_tahun'] = $validated['periode_tahun'] ?? $payroll->periode_tahun;
                    $potonganData['created_by'] = auth()->user()->name ?? 'system';
                    $potonganData['created_date'] = now();
                    
                    // Ubah nama field untuk sesuai dengan model
                    $potonganData['jumlah'] = $potonganData['jumlah_potongan'];
                    unset($potonganData['jumlah_potongan']);
                    
                    \App\Models\PayrollPotongan::create($potonganData);
                }
            }
        }

        // Return updated payroll with relations
        $updatedPayroll = \App\Models\Payroll::with([
            'guru' => function($query) {
                $query->select('id', 'nama_lengkap', 'nip', 'email', 'jabatan_id', 'unit_sekolah_id', 'tmt', 'nama_bank', 'no_rekening', 'tunj_lain', 'bpjs', 'jamsostek', 'proyek')
                      ->with([
                          'jabatan:id,nama',
                          'unitSekolah:id,nama'
                      ]);
            }
        ])->find($id);

        return response()->json([
            'status' => 'success',
            'message' => 'Payroll data berhasil diperbarui.',
            'data' => $updatedPayroll
        ], 200);
    }

    public function destroy($id)
    {
        try {
            // Debug log
            \Log::info('Delete payroll request received', [
                'raw_id' => $id,
                'id_type' => gettype($id),
                'id_value' => var_export($id, true)
            ]);

            // Validasi input ID - terima berbagai format
            if (!$id || $id === '' || trim($id) === '') {
                \Log::warning('Invalid ID format', [
                    'id' => $id,
                    'id_type' => gettype($id)
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'ID tidak valid'
                ], 422);
            }

            // Cek apakah payroll ada
            $payroll = \App\Models\Payroll::with('guru:id,nama_lengkap,nip')
                ->find($id);

            if (!$payroll) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data payroll tidak ditemukan'
                ], 404);
            }

            // Simpan informasi untuk logging
            $guruName = $payroll->guru->nama_lengkap ?? 'Unknown';
            $guruNip = $payroll->guru->nip ?? 'Unknown';
            $periode = "{$payroll->periode_bulan} {$payroll->periode_tahun}";

            // Hapus data potongan terkait terlebih dahulu
            \App\Models\PayrollPotongan::where('guru_id', $payroll->guru_id)
                ->where('periode_bulan', $payroll->periode_bulan)
                ->where('periode_tahun', $payroll->periode_tahun)
                ->delete();

            // Hapus payroll
            $payroll->delete();

            // Log aktivitas
            \Log::info('Payroll deleted', [
                'payroll_id' => $id,
                'guru_id' => $payroll->guru_id,
                'guru_name' => $guruName,
                'guru_nip' => $guruNip,
                'periode' => $periode,
                'deleted_by' => auth()->user()->name ?? 'System',
                'deleted_at' => now()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => "Data payroll untuk {$guruName} ({$guruNip}) periode {$periode} berhasil dihapus",
                'data' => [
                    'id' => $id,
                    'guru_name' => $guruName,
                    'periode' => $periode
                ]
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Payroll not found for deletion', [
                'payroll_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Data payroll tidak ditemukan'
            ], 404);

        } catch (\Exception $e) {
            \Log::error('Error deleting payroll', [
                'payroll_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus data payroll: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payroll information for authenticated guru
     */
    public function getGuruPayroll(Request $request)
    {
        try {
            // Get authenticated guru from middleware
            $guru = $request->user();
            
            if (!$guru) {
                return response()->json([
                    'success' => false,
                    'message' => 'Guru tidak terauthentikasi'
                ], 401);
            }

            // Get the latest payroll data for the authenticated guru
            // Exclude payroll with status "Draft" - hanya tampilkan yang sudah approved/published
            $payroll = $this->orderByPeriodeTerbaru(
                \App\Models\Payroll::where('guru_id', $guru->id)
                    ->where('status', '!=', 'Draft')
                    ->with(['guru' => function($query) {
                        $query->select('id', 'nama_lengkap', 'nip', 'email', 'jabatan_id')
                              ->with('jabatan:id,nama');
                    }])
            )->first();

            if (!$payroll) {
                return response()->json([
                    'success' => true,
                    'message' => 'Belum ada data payroll untuk periode ini',
                    'data' => null
                ]);
            }

            // Get potongan details for this payroll
            $potongan = \App\Models\PayrollPotongan::where('guru_id', $guru->id)
                ->where('periode_bulan', $payroll->periode_bulan)
                ->where('periode_tahun', $payroll->periode_tahun)
                ->get();

            // Calculate total tunjangan
            $totalTunjangan = $payroll->jabatan + $payroll->masa_kerja + 
                            ($payroll->wali_kelas ?? 0) + ($payroll->koordinator ?? 0) + 
                            ($payroll->tatap_muka ?? 0) + ($payroll->t_muka_pengganti ?? 0) + 
                            ($payroll->tunj_keluarga ?? 0) + ($payroll->transport1 ?? 0) + 
                            ($payroll->transport2 ?? 0) + ($payroll->makan ?? 0) + 
                            ($payroll->jamsostek ?? 0) + ($payroll->overtime ?? 0) + 
                            ($payroll->pramuka ?? 0) + ($payroll->tunj_lain ?? 0) + 
                            ($payroll->ekskul ?? 0) + ($payroll->bpjs ?? 0) + 
                            ($payroll->bimbel ?? 0) + ($payroll->proyek ?? 0) + 
                            ($payroll->insentif_peng_pramuka ?? 0) + 
                            ($payroll->insentif_peng_ekskul ?? 0) + ($payroll->insentif_peng_proyek ?? 0) + 
                            ($payroll->insentif_pengurus_bimbel ?? 0);

            // Format response data
            $responseData = [
                'id' => (string)$payroll->payroll_id,
                'guru' => [
                    'id' => $payroll->guru->id,
                    'nama_lengkap' => $payroll->guru->nama_lengkap,
                    'nip' => $payroll->guru->nip,
                    'email' => $payroll->guru->email,
                    'jabatan' => $payroll->guru->jabatan
                ],
                'periode' => [
                    'bulan' => $payroll->periode_bulan,
                    'tahun' => $payroll->periode_tahun,
                    'status' => $payroll->status
                ],
                'gaji_pokok' => $payroll->gaji_pokok,
                'tunjangan' => [
                    'jabatan' => $payroll->jabatan,
                    'masa_kerja' => $payroll->masa_kerja,
                    'wali_kelas' => $payroll->wali_kelas ?? 0,
                    'koordinator' => $payroll->koordinator ?? 0,
                    'tatap_muka' => $payroll->tatap_muka ?? 0,
                    't_muka_pengganti' => $payroll->t_muka_pengganti ?? 0,
                    'jml_jam_t_muka_pengganti' => $payroll->jml_jam_t_muka_pengganti ?? 0,
                    'tunj_keluarga' => $payroll->tunj_keluarga ?? 0,
                    'transport1' => $payroll->transport1 ?? 0,
                    'transport2' => $payroll->transport2 ?? 0,
                    'makan' => $payroll->makan ?? 0,
                    'jamsostek' => $payroll->jamsostek ?? 0,
                    'overtime' => $payroll->overtime ?? 0,
                    'pramuka' => $payroll->pramuka ?? 0,
                    'tunj_lain' => $payroll->tunj_lain ?? 0,
                    'ekskul' => $payroll->ekskul ?? 0,
                    'bpjs' => $payroll->bpjs ?? 0,
                    'bimbel' => $payroll->bimbel ?? 0,
                    'proyek' => $payroll->proyek ?? 0,
                    'jml_jam_insentif_proyek' => $payroll->jml_jam_insentif_proyek ?? 0,
                    'insentif_peng_pramuka' => $payroll->insentif_peng_pramuka ?? 0,
                    'insentif_peng_ekskul' => $payroll->insentif_peng_ekskul ?? 0,
                    'insentif_peng_proyek' => $payroll->insentif_peng_proyek ?? 0,
                    'insentif_pengurus_bimbel' => $payroll->insentif_pengurus_bimbel ?? 0,
                    'total' => $totalTunjangan
                ],
                'potongan' => $potongan->map(function($item) {
                    return [
                        'nama_potongan' => $item->nama_potongan,
                        'jumlah' => $item->jumlah
                    ];
                }),
                'total_potongan' => $payroll->total_potongan,
                'gaji_bersih' => $payroll->gaji_bersih,
                'created_date' => $payroll->created_date,
                'created_by' => $payroll->created_by
            ];

            return response()->json([
                'success' => true,
                'message' => 'Data payroll guru berhasil diambil',
                'data' => $responseData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data payroll',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get full payroll data for slip gaji (for authenticated guru)
     */
    public function getGuruPayrollSlip(Request $request, $id)
    {
        try {
            // Get authenticated guru from middleware
            $guru = $request->user();
            
            if (!$guru) {
                return response()->json([
                    'success' => false,
                    'message' => 'Guru tidak terauthentikasi'
                ], 401);
            }

            // Get payroll data dengan semua relasi yang diperlukan untuk slip gaji
            $payroll = \App\Models\Payroll::where('payroll_id', $id)
                ->where('guru_id', $guru->id) // Pastikan hanya bisa akses payroll mereka sendiri
                ->with([
                    'guru' => function($query) {
                        $query->select('id', 'nama_lengkap', 'nip', 'email', 'jabatan_id', 'unit_sekolah_id', 'tmt', 'nama_bank', 'no_rekening', 'transport1', 'transport2', 't_muka_pengganti', 'makan', 'jamsostek', 'overtime', 'pramuka', 'tunj_lain', 'ekskul', 'bpjs', 'bimbel', 'proyek')
                              ->with([
                                  'jabatan:id,nama',
                                  'unitSekolah:id,nama'
                              ]);
                    }
                ])
                ->first();

            if (!$payroll) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data payroll tidak ditemukan atau tidak memiliki akses'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $payroll
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengambil data payroll',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payroll history for authenticated guru
     */
    public function getGuruPayrollHistory(Request $request)
    {
        try {
            // Get authenticated guru from middleware
            $guru = $request->user();
            
            if (!$guru) {
                return response()->json([
                    'success' => false,
                    'message' => 'Guru tidak terauthentikasi'
                ], 401);
            }

            // Get payroll history, exclude payroll with status "Draft"
            $payrollHistory = $this->orderByPeriodeTerbaru(
                \App\Models\Payroll::where('guru_id', $guru->id)
                    ->where('status', '!=', 'Draft')
                    ->with(['guru' => function($query) {
                        $query->select('id', 'nama_lengkap', 'nip');
                    }])
            )->get();

            if ($payrollHistory->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Belum ada riwayat payroll',
                    'data' => []
                ]);
            }

            $formattedHistory = $payrollHistory->map(function($payroll) {
                return [
                    'id' => (string)$payroll->payroll_id,
                    'periode' => $payroll->periode_bulan . ' ' . $payroll->periode_tahun,
                    'periode_bulan' => $payroll->periode_bulan,
                    'periode_tahun' => $payroll->periode_tahun,
                    'gaji_pokok' => $payroll->gaji_pokok,
                    'total_gaji' => $payroll->total_gaji,
                    'total_potongan' => $payroll->total_potongan,
                    'gaji_bersih' => $payroll->gaji_bersih,
                    'status' => $payroll->status,
                    'created_date' => $payroll->created_date
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Riwayat payroll guru berhasil diambil',
                'data' => $formattedHistory
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil riwayat payroll',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // CRUD PayrollPotongan
    public function potonganIndex()
    {
        return response()->json($this->potonganRepo->all());
    }

    public function potonganStore(Request $request)
    {
        $validated = $request->validate([
            'id_potongan'   => 'required|integer|unique:payroll_potongan,id_potongan',
            'nama_potongan' => 'required|string',
            'jumlah'        => 'required|numeric',
            'created_by'    => 'required|string',
            'created_date'  => 'required|date',
        ]);
        $potongan = $this->potonganRepo->create($validated);
        return response()->json($potongan, 201);
    }

    public function potonganShow($id)
    {
        $potongan = $this->potonganRepo->find($id);
        if (!$potongan) return response()->json(['message' => 'Not found'], 404);
        return response()->json($potongan);
    }

    public function potonganUpdate(Request $request, $id)
    {
        $validated = $request->validate([
            'nama_potongan' => 'sometimes|required|string',
            'jumlah'        => 'sometimes|required|numeric',
            'created_by'    => 'sometimes|required|string',
            'created_date'  => 'sometimes|required|date',
        ]);
        $potongan = $this->potonganRepo->update($id, $validated);
        return response()->json($potongan);
    }

    public function potonganDestroy($id)
    {
        $this->potonganRepo->delete($id);
        return response()->json(['message' => 'Deleted successfully']);
    }

    // CRUD GuruPotongan
    public function guruPotonganIndex()
    {
        return response()->json($this->guruPotonganRepo->all());
    }

    public function guruPotonganStore(Request $request)
    {
        $validated = $request->validate([
            'id_guru'     => 'required|integer',
            'id_potongan' => 'required|integer',
        ]);
        $record = $this->guruPotonganRepo->create($validated);
        return response()->json($record, 201);
    }

    public function guruPotonganShow($id_guru, $id_potongan)
    {
        $record = $this->guruPotonganRepo->find($id_guru, $id_potongan);
        if (!$record) return response()->json(['message' => 'Not found'], 404);
        return response()->json($record);
    }

    public function guruPotonganDestroy($id_guru, $id_potongan)
    {
        $deleted = $this->guruPotonganRepo->delete($id_guru, $id_potongan);
        if ($deleted) {
            return response()->json(['message' => 'Deleted successfully']);
        }
        return response()->json(['message' => 'Not found'], 404);
    }

    // Export Rekening BBJS - Return JSON Data
    public function exportRekeningBBJS(Request $request)
    {
        try {
            // Validasi input
            $validator = Validator::make($request->all(), [
                'bulan' => 'required|integer|min:1|max:12',
                'tahun' => 'required|integer|min:2000',
                'nama_bank' => 'required|string|in:Bank Syariah Indonesia (BSI),BJB Syariah,Tunai',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $bulan = $request->bulan;
            $tahun = $request->tahun;
            $namaBank = $request->nama_bank;

            // Convert bulan integer ke nama bulan
            $bulanNames = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            $bulanName = $bulanNames[$bulan - 1];

            // Fetch payroll data dengan guru info
            $payrolls = \App\Models\Payroll::whereHas('guru', function($query) use ($namaBank) {
                $query->whereNotNull('no_rekening')
                      ->where('nama_bank', $namaBank);
            })
            ->with(['guru' => function($query) {
                $query->select('id', 'nama_lengkap', 'nama_bank', 'no_rekening');
            }])
            ->where('periode_bulan', $bulanName)
            ->where('periode_tahun', $tahun)
            ->whereNotNull('gaji_bersih')
            ->where('gaji_bersih', '>', 0)
            ->orderBy('guru_id')
            ->get();

            // Filter untuk hanya yang memiliki rekening dan guru data
            $data = $payrolls->filter(function($payroll) {
                return $payroll->guru && 
                       $payroll->guru->no_rekening && 
                       !empty($payroll->guru->nama_lengkap);
            })->map(function($payroll, $index) {
                return [
                    'no' => $index + 1,
                    'nama_nasabah' => trim($payroll->guru->nama_lengkap),
                    'no_rekening' => trim($payroll->guru->no_rekening),
                    'jumlah_gaji' => (int)$payroll->gaji_bersih
                ];
            })->values();

            if ($data->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tidak ada data rekening untuk periode ini'
                ], 404);
            }

            // Return JSON data untuk di-process di frontend
            return response()->json([
                'status' => 'success',
                'data' => $data,
                'periode' => [
                    'bulan' => $bulan,
                    'bulan_name' => $bulanName,
                    'tahun' => $tahun,
                    'nama_bank' => $namaBank
                ],
                'total_gaji' => $data->sum('jumlah_gaji')
            ]);

        } catch (\Exception $e) {
            \Log::error('Export Rekening BBJS Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data rekening',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk Generate Payroll dari data TU Unit
     * Mengambil data dari payroll_input_tu dan merge dengan data dasar dari gurus
     */
    public function bulkGenerate(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'periode_bulan' => 'required|string',
                'periode_tahun' => 'required|string',
                'unit_sekolah_ids' => 'nullable|array',
                'unit_sekolah_ids.*' => 'integer|exists:unit_sekolahs,id',
                'status' => 'nullable|string|in:Draft,Final,Dibayar',
                'overwrite_existing' => 'nullable|boolean', // Jika true, akan update payroll yang sudah ada
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()->toArray()
                ], 422);
            }

            $periodeBulan = $request->periode_bulan;
            $periodeTahun = $request->periode_tahun;
            $unitSekolahIds = $request->unit_sekolah_ids;
            $status = $request->status ?? 'Draft';
            $overwriteExisting = $request->overwrite_existing ?? false;

            // Query payroll_input_tu berdasarkan periode
            $query = PayrollInputTu::with(['guru', 'unitSekolah'])
                ->where('periode_bulan', $periodeBulan)
                ->where('periode_tahun', $periodeTahun)
                ->where('status', '!=', 'Draft'); // Hanya ambil yang sudah submitted/approved

            // Filter by unit_sekolah_ids jika ada
            if ($unitSekolahIds && count($unitSekolahIds) > 0) {
                $query->whereIn('unit_sekolah_id', $unitSekolahIds);
            }

            $payrollInputs = $query->get();

            if ($payrollInputs->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tidak ada data input TU untuk periode ini. Pastikan data sudah di-submit oleh TU Unit.'
                ], 404);
            }

            $created = [];
            $updated = [];
            $failed = [];

            DB::beginTransaction();
            try {
                foreach ($payrollInputs as $inputTu) {
                    try {
                        $guru = $inputTu->guru;
                        
                        if (!$guru) {
                            $failed[] = [
                                'guru_id' => $inputTu->guru_id,
                                'message' => 'Data guru tidak ditemukan'
                            ];
                            continue;
                        }

                        // Cek apakah payroll sudah ada
                        $existingPayroll = \App\Models\Payroll::where('guru_id', $guru->id)
                            ->where('periode_bulan', $periodeBulan)
                            ->where('periode_tahun', $periodeTahun)
                            ->first();

                        // Prepare data payroll
                        $payrollData = [
                            'guru_id' => $guru->id,
                            'periode_bulan' => $periodeBulan,
                            'periode_tahun' => $periodeTahun,
                            'status' => $status,
                            'created_by' => auth()->user()->name ?? 'system',
                            'created_date' => now(),
                            
                            // Data dasar dari gurus
                            'gaji_pokok' => $guru->gaji_pokok ?? 0,
                            'jabatan' => $guru->tunjangan_jabatan ?? 0,
                            'masa_kerja' => $guru->tunjangan_masa_kerja ?? 0,
                            'wali_kelas' => $guru->wali_kelas ?? 0,
                            'koordinator' => $guru->koordinator ?? 0,
                            'tatap_muka' => $guru->tatap_muka ?? 0,
                            'tunj_keluarga' => $guru->tunj_keluarga ?? 0,
                            'transport1' => $guru->transport1 ?? 0,
                            'transport2' => $guru->transport2 ?? 0,
                            'makan' => $guru->makan ?? 0,
                            'jamsostek' => $guru->jamsostek ?? 0,
                            'overtime' => $guru->overtime ?? 0,
                            'pramuka' => $guru->pramuka ?? 0,
                            'tunj_lain' => $guru->tunj_lain ?? 0,
                            'ekskul' => $guru->ekskul ?? 0,
                            'bpjs' => $guru->bpjs ?? 0,
                            'bimbel' => $guru->bimbel ?? 0,
                            'insentif_peng_pramuka' => $guru->insentif_peng_pramuka ?? 0,
                            'insentif_peng_ekskul' => $guru->insentif_peng_ekskul ?? 0,
                            'insentif_peng_proyek' => $guru->insentif_peng_proyek ?? 0,
                            'insentif_pengurus_bimbel' => $guru->insentif_pengurus_bimbel ?? 0,
                            
                            // Data dari TU Unit - merge dengan data dasar
                            't_muka_pengganti' => ($guru->t_muka_pengganti ?? 0) + ($inputTu->t_muka_pengganti_gaji_pokok ?? 0),
                            'bimbel' => ($guru->bimbel ?? 0) + ($inputTu->bimbel ?? 0),
                            'proyek' => ($inputTu->proyek ?? 0),
                            'ekskul' => ($guru->ekskul ?? 0) + ($inputTu->eskul ?? 0),
                            'pramuka' => ($guru->pramuka ?? 0) + ($inputTu->pramuka ?? 0),
                            'insentif_lain' => ($inputTu->insentif_lain ?? 0),
                            
                            // Potongan dari TU Unit
                            'potongan_t_muka_pengganti' => ($inputTu->t_muka_pengganti_potongan ?? 0),
                            'potongan_lain' => ($inputTu->potongan_lain ?? 0),
                            
                            // Potongan standar dari gurus (jika ada)
                            'potongan_yayasan' => 0,
                            'potongan_koperasi_wajib' => 0,
                            'potongan_koperasi_sukarela' => 0,
                            'potongan_angsuran_koperasi' => 0,
                            'deposit_annurmart' => 0,
                            'potongan_jht' => 0,
                            'potongan_pph21' => 0,
                            
                            // Field jumlah (untuk tracking)
                            'jml_jam_t_muka_pengganti' => 0,
                            'jml_hari_transport1' => 0,
                            'jml_hari_transport2' => 0,
                            'makan_hari' => 0,
                            'overtime_hari' => 0,
                            'jml_jam_pramuka' => 0,
                            'jml_jam_insentif_ekskul' => 0,
                            'jml_jam_insentif_bimbel' => 0,
                            'jml_jam_insentif_proyek' => 0,
                            'jumlah_hari' => 0,
                        ];

                        // Hitung total_gaji
                        $payrollData['total_gaji'] = 
                            ($payrollData['gaji_pokok'] ?? 0) +
                            ($payrollData['jabatan'] ?? 0) +
                            ($payrollData['masa_kerja'] ?? 0) +
                            ($payrollData['wali_kelas'] ?? 0) +
                            ($payrollData['koordinator'] ?? 0) +
                            ($payrollData['tatap_muka'] ?? 0) +
                            ($payrollData['t_muka_pengganti'] ?? 0) +
                            ($payrollData['tunj_keluarga'] ?? 0) +
                            ($payrollData['transport1'] ?? 0) +
                            ($payrollData['transport2'] ?? 0) +
                            ($payrollData['total_transport_all'] ?? 0) +
                            ($payrollData['makan'] ?? 0) +
                            ($payrollData['jamsostek'] ?? 0) +
                            ($payrollData['overtime'] ?? 0) +
                            ($payrollData['pramuka'] ?? 0) +
                            ($payrollData['tunj_lain'] ?? 0) +
                            ($payrollData['ekskul'] ?? 0) +
                            ($payrollData['bpjs'] ?? 0) +
                            ($payrollData['bimbel'] ?? 0) +
                            ($payrollData['proyek'] ?? 0) +
                            ($payrollData['insentif_peng_pramuka'] ?? 0) +
                            ($payrollData['insentif_peng_ekskul'] ?? 0) +
                            ($payrollData['insentif_peng_proyek'] ?? 0) +
                            ($payrollData['insentif_pengurus_bimbel'] ?? 0) +
                            ($payrollData['insentif_lain'] ?? 0);

                        // Hitung total_potongan
                        $payrollData['total_potongan'] = 
                            ($payrollData['potongan_yayasan'] ?? 0) +
                            ($payrollData['potongan_lain'] ?? 0) +
                            ($payrollData['potongan_koperasi_wajib'] ?? 0) +
                            ($payrollData['potongan_koperasi_sukarela'] ?? 0) +
                            ($payrollData['potongan_angsuran_koperasi'] ?? 0) +
                            ($payrollData['deposit_annurmart'] ?? 0) +
                            ($payrollData['potongan_jht'] ?? 0) +
                            ($payrollData['potongan_pph21'] ?? 0) +
                            ($payrollData['potongan_t_muka_pengganti'] ?? 0);

                        // Hitung gaji_bersih
                        $payrollData['gaji_bersih'] = $payrollData['total_gaji'] - $payrollData['total_potongan'];

                        // Hitung total_transport_all
                        $payrollData['total_transport_all'] = 
                            ($payrollData['transport1'] ?? 0) + 
                            ($payrollData['transport2'] ?? 0);

                        // Hitung total_transport (sama dengan total_transport_all)
                        $payrollData['total_transport'] = $payrollData['total_transport_all'];

                        if ($existingPayroll) {
                            if ($overwriteExisting) {
                                // Update existing payroll
                                $existingPayroll->update($payrollData);
                                $updated[] = [
                                    'guru_id' => $guru->id,
                                    'guru_nama' => $guru->nama_lengkap,
                                    'payroll_id' => $existingPayroll->payroll_id
                                ];
                            } else {
                                $failed[] = [
                                    'guru_id' => $guru->id,
                                    'guru_nama' => $guru->nama_lengkap,
                                    'message' => 'Payroll sudah ada untuk periode ini. Gunakan overwrite_existing=true untuk update.'
                                ];
                            }
                        } else {
                            // Generate UUID untuk payroll_id
                            $payrollId = (string) Str::uuid();
                            $payrollData['payroll_id'] = $payrollId;

                            // Create new payroll
                            $payroll = \App\Models\Payroll::create($payrollData);
                            $created[] = [
                                'guru_id' => $guru->id,
                                'guru_nama' => $guru->nama_lengkap,
                                'payroll_id' => $payroll->payroll_id
                            ];
                        }
                    } catch (\Exception $e) {
                        $failed[] = [
                            'guru_id' => $inputTu->guru_id,
                            'message' => $e->getMessage()
                        ];
                        \Log::error('Error generating payroll for guru_id: ' . $inputTu->guru_id, [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                    }
                }

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Bulk generate payroll berhasil',
                    'data' => [
                        'periode_bulan' => $periodeBulan,
                        'periode_tahun' => $periodeTahun,
                        'total_processed' => $payrollInputs->count(),
                        'created' => count($created),
                        'updated' => count($updated),
                        'failed' => count($failed),
                        'created_data' => $created,
                        'updated_data' => $updated,
                        'failed_data' => $failed
                    ]
                ], 200);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            \Log::error('Bulk Generate Payroll Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal melakukan bulk generate payroll',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Urutkan query payroll berdasarkan periode terbaru (tahun lalu nama bulan kalender).
     * periode_bulan disimpan sebagai nama (string), bukan angka — sorting alfabet salah
     * (contoh: Mei muncul sebelum Juni).
     */
    private function orderByPeriodeTerbaru($query)
    {
        return $query
            ->orderBy('periode_tahun', 'desc')
            ->orderByRaw("FIELD(periode_bulan, 'Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember') DESC");
    }

}
