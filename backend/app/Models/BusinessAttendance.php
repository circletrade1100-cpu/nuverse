<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_unit_id',
        'employee_id',
        'attendance_date',
        'check_in',
        'check_out',
        'shift_type',
        'overtime_hours',
        'notes'
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'overtime_hours' => 'decimal:2',
    ];

    // Relationships
    public function businessUnit(): BelongsTo
    {
        return $this->belongsTo(BusinessUnit::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    // Scopes
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('attendance_date', [$startDate, $endDate]);
    }

    public function scopeByShift($query, $shiftType)
    {
        return $query->where('shift_type', $shiftType);
    }

    // Accessors & Mutators
    public function getShiftTypeLabelAttribute()
    {
        return match($this->shift_type) {
            'morning' => 'Pagi',
            'afternoon' => 'Siang',
            'night' => 'Malam',
            default => $this->shift_type
        };
    }

    // Helper methods
    public function getWorkingHours()
    {
        if (!$this->check_in || !$this->check_out) {
            return 0;
        }

        $checkIn = \Carbon\Carbon::parse($this->check_in);
        $checkOut = \Carbon\Carbon::parse($this->check_out);
        
        return $checkOut->diffInHours($checkIn);
    }

    public function isPresent()
    {
        return $this->check_in && $this->check_out;
    }

    public function isLate($expectedCheckIn = '08:00:00')
    {
        if (!$this->check_in) return false;
        
        $checkIn = \Carbon\Carbon::parse($this->check_in);
        $expected = \Carbon\Carbon::parse($this->attendance_date->format('Y-m-d') . ' ' . $expectedCheckIn);
        
        return $checkIn->gt($expected);
    }
}
