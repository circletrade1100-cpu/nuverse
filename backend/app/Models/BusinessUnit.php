<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessUnit extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'manager_id',
        'status',
        'description',
        'monthly_budget'
    ];

    protected $casts = [
        'monthly_budget' => 'decimal:2',
    ];

    // Relationships
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(BusinessTransaction::class);
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(BusinessAttendance::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Accessors & Mutators
    public function getTypeLabelAttribute()
    {
        return match($this->type) {
            'catering' => 'Catering',
            'swimming_pool' => 'Kolam Renang',
            'canteen' => 'Kantin',
            'other' => 'Usaha Lainnya',
            default => $this->type
        };
    }

    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'active' => 'Aktif',
            'inactive' => 'Tidak Aktif',
            default => $this->status
        };
    }

    // Helper methods
    public function getTotalIncome($startDate = null, $endDate = null)
    {
        $query = $this->transactions()->where('transaction_type', 'income');
        
        if ($startDate) {
            $query->where('transaction_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('transaction_date', '<=', $endDate);
        }
        
        return $query->sum('amount');
    }

    public function getTotalExpense($startDate = null, $endDate = null)
    {
        $query = $this->transactions()->where('transaction_type', 'expense');
        
        if ($startDate) {
            $query->where('transaction_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('transaction_date', '<=', $endDate);
        }
        
        return $query->sum('amount');
    }

    public function getNetProfit($startDate = null, $endDate = null)
    {
        return $this->getTotalIncome($startDate, $endDate) - $this->getTotalExpense($startDate, $endDate);
    }

    public function getProfitMargin($startDate = null, $endDate = null)
    {
        $income = $this->getTotalIncome($startDate, $endDate);
        if ($income == 0) return 0;
        
        return ($this->getNetProfit($startDate, $endDate) / $income) * 100;
    }
}
