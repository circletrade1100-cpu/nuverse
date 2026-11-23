<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MidtransTransaction extends Model
{
    protected $fillable = [
        'order_id',
        'student_bill_id',
        'student_id',
        'transaction_id',
        'payment_type',
        'bank',
        'va_number',
        'snap_token',
        'gross_amount',
        'transaction_status',
        'settlement_time',
        'raw_response'
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'settlement_time' => 'datetime',
        'raw_response' => 'array',
    ];

    /**
     * Get the student bill associated with this transaction
     */
    public function studentBill(): BelongsTo
    {
        return $this->belongsTo(StudentBill::class);
    }

    /**
     * Get the student associated with this transaction
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Scope untuk transaksi pending
     */
    public function scopePending($query)
    {
        return $query->where('transaction_status', 'pending');
    }

    /**
     * Scope untuk transaksi sukses
     */
    public function scopeSettled($query)
    {
        return $query->whereIn('transaction_status', ['settlement', 'capture']);
    }

    /**
     * Scope untuk transaksi gagal
     */
    public function scopeFailed($query)
    {
        return $query->whereIn('transaction_status', ['deny', 'cancel', 'expire']);
    }

    /**
     * Check if transaction is successful
     */
    public function isSuccessful(): bool
    {
        return in_array($this->transaction_status, ['settlement', 'capture']);
    }

    /**
     * Check if transaction is pending
     */
    public function isPending(): bool
    {
        return $this->transaction_status === 'pending';
    }

    /**
     * Check if transaction is failed
     */
    public function isFailed(): bool
    {
        return in_array($this->transaction_status, ['deny', 'cancel', 'expire']);
    }
}

