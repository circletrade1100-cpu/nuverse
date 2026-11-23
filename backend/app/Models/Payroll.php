<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    // Nama tabel di database
    protected $table = 'payroll';

    // Primary key
    protected $primaryKey = 'payroll_id';

    // Primary key bertipe UUID
    public $incrementing = false;
    protected $keyType = 'string';

    // Laravel default timestamps tidak digunakan karena ada created_date custom
    public $timestamps = false;

    // Kolom yang bisa diisi secara massal
    protected $fillable = [
        'guru_id',
        'gaji_pokok',
        'jabatan',
        'masa_kerja',
        'wali_kelas',
        'koordinator',
        'tatap_muka',
        't_muka_pengganti',
        'jml_jam_t_muka_pengganti',
        'tunj_keluarga',
        'transport1',
        'jml_hari_transport1',
        'transport2',
        'jml_hari_transport2',
        'total_transport_all',
        'makan',
        'makan_hari',
        'jamsostek',
        'overtime',
        'overtime_hari',
        'pramuka',
        'jml_jam_pramuka',
        'tunj_lain',
        'ekskul',
        'jml_jam_insentif_ekskul',
        'bpjs',
        'bimbel',
        'jml_jam_insentif_bimbel',
        'proyek',
        'jml_jam_insentif_proyek',
        'insentif_peng_pramuka',
        'insentif_peng_ekskul',
        'insentif_peng_proyek',
        'insentif_pengurus_bimbel',
        'insentif_lain',
        'potongan_yayasan',
        'potongan_lain',
        'potongan_koperasi_wajib',
        'potongan_koperasi_sukarela',
        'potongan_angsuran_koperasi',
        'deposit_annurmart',
        'potongan_jht',
        'potongan_pph21',
        'potongan_t_muka_pengganti',
        'total_gaji',
        'total_potongan',
        'gaji_bersih',
        'status',
        'periode_bulan',
        'periode_tahun',
        'created_date',
        'created_by'
    ];

    // Jika ingin mengatur format tanggal otomatis (misal created_date)
    protected $dates = ['created_date'];

    // Casting untuk field
    protected $casts = [
        'payroll_id' => 'string',
        'created_date' => 'datetime',
        'tatap_muka' => 'string',
        't_muka_pengganti' => 'string',
        'total_transport_all' => 'integer',
    ];

    // Contoh relasi ke tabel guru (optional)
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id', 'id');
    }
}
