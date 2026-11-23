<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalTemplateDetail extends Model
{
    protected $fillable = [
        'template_id',
        'account_id',
        'debit_amount',
        'credit_amount',
        'is_percentage',
        'percentage_field',
    ];

    protected $casts = [
        'debit_amount' => 'decimal:2',
        'credit_amount' => 'decimal:2',
        'is_percentage' => 'boolean',
    ];

    // Relationships
    public function template()
    {
        return $this->belongsTo(JournalTemplate::class, 'template_id');
    }

    public function account()
    {
        return $this->belongsTo(ChartOfAccount::class, 'account_id');
    }
}
