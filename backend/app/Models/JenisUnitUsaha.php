<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JenisUnitUsaha extends Model
{
    use HasFactory;

    protected $table = 'jenis_unit_usaha';

    protected $fillable = [
        'kode_unit_usaha',
        'nama_jenis_unit_usaha',
        'status'
    ];

    // Relationships - Commented out until business_units table has jenis_unit_usaha_id column
    // public function businessUnits(): HasMany
    // {
    //     return $this->hasMany(BusinessUnit::class, 'jenis_unit_usaha_id');
    // }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Accessors & Mutators
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'active' => 'Aktif',
            'inactive' => 'Tidak Aktif',
            default => $this->status
        };
    }
}