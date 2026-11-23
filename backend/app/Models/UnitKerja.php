<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnitKerja extends Model
{
    protected $fillable = [
        'kode',
        'nama',
        'deskripsi',
        'status',
        'unit_sekolah_id'
    ];

    protected $casts = [
        'status' => 'string'
    ];

    public function userProfiles(): HasMany
    {
        return $this->hasMany(UserProfile::class, 'unit_kerja', 'nama');
    }

    public function unitSekolah(): BelongsTo
    {
        return $this->belongsTo(UnitSekolah::class);
    }

    public function divisionalTransactions(): HasMany
    {
        return $this->hasMany(DivisionalTransaction::class);
    }

    public function rapbsPlans(): HasMany
    {
        return $this->hasMany(RapbsPlan::class);
    }

    // Helper method untuk mengecek apakah unit kerja ini adalah unit sekolah
    public function isUnitSekolah(): bool
    {
        return $this->unit_sekolah_id !== null;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'Aktif');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'Tidak Aktif');
    }
}
