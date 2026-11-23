<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class THR extends Model
{
    protected $table = 'thr';
    
    protected $fillable = [
        'guru_id',
        'tahun',
        'jumlah_tatap_muka',
        'tatap_muka_rupiah',
        'masa_kerja',
        'total_rupiah',
        'keterangan_rupiah',
        'created_by',
        'created_date'
    ];

    protected $casts = [
        'tahun' => 'integer',
        'jumlah_tatap_muka' => 'integer',
        'tatap_muka_rupiah' => 'integer',
        'masa_kerja' => 'integer',
        'total_rupiah' => 'integer',
        'keterangan_rupiah' => 'integer',
        'created_date' => 'date'
    ];

    // Relasi ke Guru
    public function guru(): BelongsTo
    {
        return $this->belongsTo(Guru::class, 'guru_id', 'id');
    }
}
