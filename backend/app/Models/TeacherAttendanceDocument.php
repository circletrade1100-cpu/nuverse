<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherAttendanceDocument extends Model
{
    protected $fillable = [
        'teacher_id',
        'attendance_date',
        'document_type',
        'document_file',
        'file_name',
        'file_size',
        'mime_type',
        'status',
        'approved_by',
        'approved_at',
        'notes',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'approved_at' => 'datetime',
        'file_size' => 'integer',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Guru::class, 'teacher_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
