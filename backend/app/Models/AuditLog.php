<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'audit_date',
        'auditor_id',
        'condition_before',
        'condition_after',
        'status_before',
        'status_after',
        'findings',
        'recommendations',
        'action_taken',
        'estimated_repair_cost',
        'audit_type',
        'location_verified',
        'photos'
    ];

    protected $casts = [
        'audit_date' => 'date',
        'estimated_repair_cost' => 'decimal:2',
        'photos' => 'array',
    ];

    /**
     * Get the inventory item that owns the audit log.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the user who performed the audit.
     */
    public function auditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'auditor_id');
    }

    /**
     * Get condition label in Indonesian
     */
    public function getConditionLabelAttribute(): string
    {
        $conditions = [
            'baik' => 'Baik',
            'rusak_ringan' => 'Rusak Ringan',
            'rusak_berat' => 'Rusak Berat',
            'tidak_berfungsi' => 'Tidak Berfungsi'
        ];

        return $conditions[$this->condition_after] ?? $this->condition_after;
    }

    /**
     * Get status label in Indonesian
     */
    public function getStatusLabelAttribute(): string
    {
        $statuses = [
            'aktif' => 'Aktif',
            'maintenance' => 'Maintenance',
            'penghapusan' => 'Penghapusan'
        ];

        return $statuses[$this->status_after] ?? $this->status_after;
    }

    /**
     * Get audit type label in Indonesian
     */
    public function getAuditTypeLabelAttribute(): string
    {
        $types = [
            'routine' => 'Rutin',
            'special' => 'Khusus',
            'emergency' => 'Darurat'
        ];

        return $types[$this->audit_type] ?? $this->audit_type;
    }

    /**
     * Check if condition has changed
     */
    public function hasConditionChanged(): bool
    {
        return $this->condition_before !== $this->condition_after;
    }

    /**
     * Check if status has changed
     */
    public function hasStatusChanged(): bool
    {
        return $this->status_before !== $this->status_after;
    }
}