<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class Student extends Model
{
    use HasApiTokens;
    protected $fillable = [
        'nama_lengkap',
        'nama_panggilan',
        'nisn',
        'tempat_lahir',
        'tanggal_lahir',
        'nama_ibu',
        'nama_ayah',
        'nomor_hp',
        'alamat',
        'email',
        'unit_sekolah',
        'unit_kelas',
        'password',
        'avatar',
        'status'
    ];

    protected $hidden = [
        // Don't hide password for now (will be masked in frontend)
        // 'password',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        // Remove password hashing from casts since we handle it manually
    ];

    public function getUmurAttribute()
    {
        if (!$this->tanggal_lahir) {
            return null;
        }
        
        return now()->diffInYears($this->tanggal_lahir);
    }

    public function getAvatarAttribute($value)
    {
        // Return null if avatar is "0", empty, or null
        if (!$value || $value === "0" || $value === "null") {
            return null;
        }
        
        return $value;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'Aktif');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByUnitSekolah($query, $unitSekolah)
    {
        // Support both exact match and LIKE pattern to handle variations like SMAIT, SMPIT, SDIT, TKIT
        return $query->where(function($q) use ($unitSekolah) {
            $q->where('unit_sekolah', $unitSekolah)
              ->orWhere('unit_sekolah', 'like', $unitSekolah . '%');
        });
    }

    public function scopeByUnitKelas($query, $unitKelas)
    {
        return $query->where('unit_kelas', 'like', "%{$unitKelas}%");
    }

    public function setPasswordAttribute($value)
    {
        // Simple hash check - if doesn't start with $2y$ (bcrypt), then hash it
        if ($value && !str_starts_with($value, '$2y$')) {
            $this->attributes['password'] = Hash::make($value);
        } else {
            $this->attributes['password'] = $value;
        }
    }
}
