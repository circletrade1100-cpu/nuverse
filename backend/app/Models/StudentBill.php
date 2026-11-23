<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentBill extends Model
{
    protected $fillable = [
        'student_id',
        'bill_type_id',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'due_date',
        'period_month',
        'period_year',
        'status',
        'allow_installment',
        'notes'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'due_date' => 'date',
        'allow_installment' => 'boolean',
    ];

    /**
     * Get the student that owns the bill
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the bill type for this bill
     */
    public function billType(): BelongsTo
    {
        return $this->belongsTo(BillType::class);
    }

    /**
     * Get all payments for this bill
     */
    public function payments(): HasMany
    {
        return $this->hasMany(BillPayment::class);
    }

    /**
     * Update bill status based on payment amount
     */
    public function updateStatus(): void
    {
        if ($this->paid_amount >= $this->total_amount) {
            $this->status = 'paid';
        } elseif ($this->paid_amount > 0) {
            $this->status = 'partial';
        } else {
            $this->status = $this->due_date < now()->toDateString() ? 'overdue' : 'unpaid';
        }
        
        $this->remaining_amount = $this->total_amount - $this->paid_amount;
        $this->save();
    }

    /**
     * Scope untuk tagihan berdasarkan status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk tagihan yang sudah jatuh tempo
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now()->toDateString())
                    ->whereIn('status', ['unpaid', 'partial']);
    }
}
