<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absensi extends Model
{
    protected $table = 'absensi';
    
    protected $fillable = [
        'id_guru',
        'tanggal',
        'jam_masuk',
        'jam_keluar',
        'status',
        'keterangan',
        'jam_mengajar',
        'lokasi',
        'nama_lokasi',
        'foto'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jam_masuk' => 'string', // Changed from datetime to string to prevent timezone issues
        'jam_keluar' => 'string', // Changed from datetime to string to prevent timezone issues
        'jam_mengajar' => 'integer'
    ];

    // Relasi ke model Guru
    public function guru(): BelongsTo
    {
        return $this->belongsTo(Guru::class, 'id_guru');
    }

    // Scope untuk filter berdasarkan status
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Scope untuk filter berdasarkan tanggal
    public function scopeByDate($query, $date)
    {
        return $query->whereDate('tanggal', $date);
    }

    // Scope untuk filter berdasarkan bulan dan tahun
    public function scopeByMonthYear($query, $month, $year)
    {
        return $query->whereMonth('tanggal', $month)
                    ->whereYear('tanggal', $year);
    }

    // Scope untuk filter berdasarkan guru
    public function scopeByGuru($query, $guruId)
    {
        return $query->where('id_guru', $guruId);
    }

    // Scope untuk status hadir
    public function scopeHadir($query)
    {
        return $query->where('status', 'hadir');
    }

    // Scope untuk status sakit
    public function scopeSakit($query)
    {
        return $query->where('status', 'sakit');
    }

    // Scope untuk status izin
    public function scopeIzin($query)
    {
        return $query->where('status', 'izin');
    }

    // Scope untuk status alpha
    public function scopeAlpha($query)
    {
        return $query->where('status', 'alpha');
    }

    // Accessor untuk mendapatkan durasi kerja dalam jam
    public function getDurasiKerjaAttribute()
    {
        if ($this->jam_masuk && $this->jam_keluar) {
            $masuk = \Carbon\Carbon::parse($this->jam_masuk);
            $keluar = \Carbon\Carbon::parse($this->jam_keluar);
            return $masuk->diffInHours($keluar);
        }
        return 0;
    }

    // Accessor untuk mendapatkan status dengan warna
    public function getStatusColorAttribute()
    {
        switch ($this->status) {
            case 'hadir':
                return 'green';
            case 'sakit':
                return 'yellow';
            case 'izin':
                return 'blue';
            case 'alpha':
                return 'red';
            default:
                return 'gray';
        }
    }

    // Accessor untuk mendapatkan status dalam bahasa Indonesia
    public function getStatusIndonesiaAttribute()
    {
        switch ($this->status) {
            case 'hadir':
                return 'Hadir';
            case 'sakit':
                return 'Sakit';
            case 'izin':
                return 'Izin';
            case 'alpha':
                return 'Alpha';
            default:
                return 'Tidak Diketahui';
        }
    }
}
