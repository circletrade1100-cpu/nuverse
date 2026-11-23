<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'student_bill_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'is_installment',
        'installment_number',
        'notes',
        'processed_by'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'is_installment' => 'boolean',
    ];

    /**
     * Get the student bill that owns the payment
     */
    public function studentBill(): BelongsTo
    {
        return $this->belongsTo(StudentBill::class);
    }

    /**
     * Get the user who processed this payment
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Scope untuk pembayaran cicilan
     */
    public function scopeInstallments($query)
    {
        return $query->where('is_installment', true);
    }

    /**
     * Scope untuk pembayaran lunas
     */
    public function scopeFullPayment($query)
    {
        return $query->where('is_installment', false);
    }

    /**
     * Scope berdasarkan metode pembayaran
     */
    public function scopeByMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }
}

