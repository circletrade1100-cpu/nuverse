<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cuti extends Model
{
    protected $table = 'cuti';
    
    protected $fillable = [
        'id_guru',
        'jenis',
        'tanggal_mulai',
        'tanggal_selesai',
        'durasi',
        'status',
        'alasan',
        'tanggal_disetujui',
        'pengganti',
        'disetujui_oleh',
        'created_by'
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'tanggal_disetujui' => 'date',
        'durasi' => 'integer'
    ];

    // Relasi ke model Guru (yang mengajukan cuti)
    public function guru(): BelongsTo
    {
        return $this->belongsTo(Guru::class, 'id_guru');
    }

    // Relasi ke model Guru (yang membuat pengajuan)
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Guru::class, 'created_by');
    }

    // Relasi ke model User (yang menyetujui)
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    // Scope untuk filter berdasarkan status
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Scope untuk filter berdasarkan guru
    public function scopeByGuru($query, $guruId)
    {
        return $query->where('id_guru', $guruId);
    }

    // Scope untuk status pending
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Scope untuk status approved
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    // Scope untuk status rejected
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // Scope untuk filter berdasarkan tanggal
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_mulai', [$startDate, $endDate]);
    }

    // Accessor untuk mendapatkan status dengan warna
    public function getStatusColorAttribute()
    {
        switch ($this->status) {
            case 'approved':
                return 'green';
            case 'pending':
                return 'yellow';
            case 'rejected':
                return 'red';
            default:
                return 'gray';
        }
    }

    // Accessor untuk mendapatkan status dalam bahasa Indonesia
    public function getStatusIndonesiaAttribute()
    {
        switch ($this->status) {
            case 'approved':
                return 'Disetujui';
            case 'pending':
                return 'Menunggu';
            case 'rejected':
                return 'Ditolak';
            default:
                return 'Tidak Diketahui';
        }
    }
}

