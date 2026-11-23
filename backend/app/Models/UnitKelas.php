<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnitKelas extends Model
{
    protected $fillable = [
        'kode',
        'nama',
        'tingkat',
        'unit_sekolah_id',
        'wali_kelas',
        'kapasitas',
        'deskripsi',
        'status'
    ];

    protected $casts = [
        'tingkat' => 'integer',
        'kapasitas' => 'integer',
        'unit_sekolah_id' => 'integer',
        'status' => 'string'
    ];

    public function unitSekolah(): BelongsTo
    {
        return $this->belongsTo(UnitSekolah::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'Aktif');
    }

    public function scopeByTingkat($query, $tingkat)
    {
        return $query->where('tingkat', $tingkat);
    }
}
