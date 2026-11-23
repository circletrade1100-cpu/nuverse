<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountBalance extends Model
{
    protected $fillable = [
        'account_id',
        'period_year',
        'period_month',
        'opening_debit',
        'opening_credit',
        'period_debit',
        'period_credit',
        'closing_debit',
        'closing_credit',
    ];

    protected $casts = [
        'period_year' => 'integer',
        'period_month' => 'integer',
        'opening_debit' => 'decimal:2',
        'opening_credit' => 'decimal:2',
        'period_debit' => 'decimal:2',
        'period_credit' => 'decimal:2',
        'closing_debit' => 'decimal:2',
        'closing_credit' => 'decimal:2',
    ];

    // Relationships
    public function account()
    {
        return $this->belongsTo(ChartOfAccount::class, 'account_id');
    }
}
