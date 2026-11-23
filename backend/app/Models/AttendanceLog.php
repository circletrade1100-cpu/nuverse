<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class AttendanceLog extends Model
{
    protected $fillable = [
        'user_id',
        'check_in',
        'check_out',
        'location',
        'ip_address',
        'status',
        'notes',
        'work_hours',
        'is_overtime'
    ];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'work_hours' => 'decimal:2',
        'is_overtime' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function calculateWorkHours()
    {
        if ($this->check_in && $this->check_out) {
            $checkIn = Carbon::parse($this->check_in);
            $checkOut = Carbon::parse($this->check_out);
            $hours = $checkOut->diffInMinutes($checkIn) / 60;
            
            $this->update(['work_hours' => $hours]);
            return $hours;
        }
        
        return 0;
    }

    public function scopeToday($query)
    {
        return $query->whereDate('check_in', today());
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('check_in', now()->month)
                    ->whereYear('check_in', now()->year);
    }
}
