<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'nip',
        'jabatan',
        'unit_kerja',
        'unit_sekolah',
        'status',
        'tmt',
        'tempat_lahir',
        'tanggal_lahir',
        'jenjang_pendidikan',
        'jurusan',
        'status_pernikahan',
        'tugas_tambahan',
        'mapel_diampu',
        'jam_mengajar',
        'avatar',
        'alamat',
        'no_telepon',
        'kontak_darurat',
        'telepon_darurat'
    ];

    protected $casts = [
        'mapel_diampu' => 'array',
        'tmt' => 'date',
        'tanggal_lahir' => 'date'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getMasaKerjaAttribute()
    {
        if (!$this->tmt) {
            return null;
        }
        
        $tmt = $this->tmt;
        $now = now();
        
        $years = $now->diffInYears($tmt);
        $months = $now->diffInMonths($tmt) % 12;
        
        return "{$years} tahun {$months} bulan";
    }
}
