<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnitSekolah extends Model
{
    protected $fillable = [
        'kode',
        'nama',
        'jenjang',
        'deskripsi',
        'kepala_sekolah',
        'alamat',
        'telepon',
        'status'
    ];

    protected $casts = [
        'jenjang' => 'string',
        'status' => 'string'
    ];

    public function unitKelas(): HasMany
    {
        return $this->hasMany(UnitKelas::class);
    }

    public function gurus(): HasMany
    {
        return $this->hasMany(Guru::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'Aktif');
    }

    public function scopeByJenjang($query, $jenjang)
    {
        return $query->where('jenjang', $jenjang);
    }
}
