<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankReconciliation extends Model
{
    protected $fillable = [
        'bank_account_id',
        'reconciliation_date',
        'bank_statement_balance',
        'book_balance',
        'reconciled_balance',
        'status',
        'created_by',
    ];

    protected $casts = [
        'reconciliation_date' => 'date',
        'bank_statement_balance' => 'decimal:2',
        'book_balance' => 'decimal:2',
        'reconciled_balance' => 'decimal:2',
    ];

    // Relationships
    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class, 'bank_account_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
