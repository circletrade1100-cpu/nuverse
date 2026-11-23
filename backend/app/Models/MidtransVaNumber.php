<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MidtransVaNumber extends Model
{
    protected $fillable = [
        'student_id',
        'bank_code',
        'va_number',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the student that owns the VA number
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Generate VA Number unik per siswa per bank
     * Format: 8808 + STUDENT_ID (6 digits padded)
     * Example: 8808000005 untuk student_id = 5
     */
    public static function generateForStudent($studentId, $bankCode = 'bca')
    {
        $prefix = '8808';
        $studentIdPadded = str_pad($studentId, 6, '0', STR_PAD_LEFT);
        $vaNumber = $prefix . $studentIdPadded;

        return self::updateOrCreate(
            [
                'student_id' => $studentId,
                'bank_code' => $bankCode
            ],
            [
                'va_number' => $vaNumber,
                'is_active' => true
            ]
        );
    }

    /**
     * Get VA number by student and bank
     */
    public static function getByStudentAndBank($studentId, $bankCode)
    {
        return self::where('student_id', $studentId)
            ->where('bank_code', $bankCode)
            ->where('is_active', true)
            ->first();
    }
}

