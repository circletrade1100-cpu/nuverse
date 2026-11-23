<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillPayment extends Model
{
    protected $fillable = [
        'student_bill_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'processed_by',
        'transaction_id',
        'is_installment',
        'installment_number',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'is_installment' => 'boolean',
    ];

    /**
     * Get the student bill that this payment belongs to
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
     * Get the transaction in TU system
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Scope untuk pembayaran berdasarkan metode
     */
    public function scopeByPaymentMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    /**
     * Scope untuk pembayaran cicilan
     */
    public function scopeInstallment($query)
    {
        return $query->where('is_installment', true);
    }
}
