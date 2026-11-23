<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jabatan extends Model
{
    protected $fillable = [
        'kode',
        'nama',
        'level',
        'deskripsi',
        'gaji_pokok',
        'tunjangan',
        'status'
    ];

    protected $casts = [
        'level' => 'integer',
        'gaji_pokok' => 'decimal:2',
        'tunjangan' => 'decimal:2',
        'status' => 'string'
    ];

    public function userProfiles(): HasMany
    {
        return $this->hasMany(UserProfile::class, 'jabatan', 'nama');
    }

    public function gurus(): HasMany
    {
        return $this->hasMany(Guru::class);
    }

    public function getTotalGajiAttribute()
    {
        return $this->gaji_pokok + $this->tunjangan;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'Aktif');
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }
}
