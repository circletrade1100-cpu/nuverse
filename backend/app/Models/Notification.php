<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'student_id',
        'type',
        'title',
        'description',
        'full_content',
        'data',
        'category',
        'is_read',
        'read_at'
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the student that owns the notification
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Scope untuk notifikasi yang belum dibaca
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope untuk notifikasi yang sudah dibaca
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Scope berdasarkan tipe
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope berdasarkan kategori
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread()
    {
        $this->update([
            'is_read' => false,
            'read_at' => null
        ]);
    }

    /**
     * Create notification tagihan
     */
    public static function createTagihanNotification($studentId, $billData)
    {
        $studentName = $billData['student_name'] ?? 'Siswa';
        $billType = $billData['bill_type'] ?? 'Tagihan';
        $amount = $billData['amount'] ?? 0;
        $dueDate = $billData['due_date'] ?? '-';
        $notes = $billData['notes'] ?? null;

        // Build full content with notes if available
        $fullContent = "Tagihan {$billType} untuk {$studentName} telah dibuat dengan nominal Rp " . number_format($amount, 0, ',', '.') . ". Harap segera melakukan pembayaran sebelum tanggal jatuh tempo: " . date('d F Y', strtotime($dueDate)) . ".";
        
        if ($notes) {
            $fullContent .= "\n\nCatatan: " . $notes;
        }
        
        $fullContent .= " Terima kasih.";

        return self::create([
            'student_id' => $studentId,
            'type' => 'tagihan',
            'category' => 'tagihan',
            'title' => 'Tagihan Baru: ' . $billType,
            'description' => 'Anda memiliki tagihan baru sebesar Rp ' . number_format($amount, 0, ',', '.') . '. Jatuh tempo: ' . date('d M Y', strtotime($dueDate)),
            'full_content' => $fullContent,
            'data' => [
                'bill_id' => $billData['bill_id'] ?? null,
                'bill_type' => $billType,
                'amount' => $amount,
                'due_date' => $dueDate,
                'student_name' => $studentName,
                'notes' => $notes,
            ],
            'is_read' => false
        ]);
    }

    /**
     * Create notification pembayaran
     */
    public static function createPembayaranNotification($studentId, $paymentData)
    {
        $billType = $paymentData['bill_type'] ?? 'Tagihan';
        $amount = $paymentData['amount'] ?? 0;
        $paymentDate = $paymentData['payment_date'] ?? now();

        return self::create([
            'student_id' => $studentId,
            'type' => 'pembayaran',
            'category' => 'tagihan',
            'title' => 'Pembayaran Berhasil: ' . $billType,
            'description' => 'Pembayaran sebesar Rp ' . number_format($amount, 0, ',', '.') . ' telah diterima pada ' . date('d M Y', strtotime($paymentDate)),
            'full_content' => "Terima kasih atas pembayaran {$billType} sebesar Rp " . number_format($amount, 0, ',', '.') . " yang telah diterima pada " . date('d F Y', strtotime($paymentDate)) . ". Pembayaran Anda telah tercatat dalam sistem.",
            'data' => [
                'payment_id' => $paymentData['payment_id'] ?? null,
                'bill_type' => $billType,
                'amount' => $amount,
                'payment_date' => $paymentDate,
            ],
            'is_read' => false
        ]);
    }
}

