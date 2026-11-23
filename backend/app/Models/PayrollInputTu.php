<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollInputTu extends Model
{
    protected $table = 'payroll_input_tu';

    protected $fillable = [
        'guru_id',
        'unit_sekolah_id',
        'periode_bulan',
        'periode_tahun',
        'bimbel',
        'proyek',
        'eskul',
        'pramuka',
        't_muka_pengganti_gaji_pokok',
        't_muka_pengganti_potongan',
        'insentif_lain',
        'potongan_lain',
        'status',
        'created_by',
    ];

    protected $casts = [
        'bimbel' => 'integer',
        'proyek' => 'integer',
        'eskul' => 'integer',
        'pramuka' => 'integer',
        't_muka_pengganti_gaji_pokok' => 'integer',
        't_muka_pengganti_potongan' => 'integer',
        'insentif_lain' => 'integer',
        'potongan_lain' => 'integer',
    ];

    // Relasi ke Guru
    public function guru(): BelongsTo
    {
        return $this->belongsTo(Guru::class, 'guru_id', 'id');
    }

    // Relasi ke UnitSekolah
    public function unitSekolah(): BelongsTo
    {
        return $this->belongsTo(UnitSekolah::class, 'unit_sekolah_id', 'id');
    }
}
