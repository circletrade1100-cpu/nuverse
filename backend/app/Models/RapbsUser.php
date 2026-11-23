<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RapbsUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'division_id',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    /**
     * Get the user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the division (unit kerja)
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class, 'division_id');
    }

    /**
     * Scope to filter by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Check if user has specific permission
     */
    public function hasPermission($permission): bool
    {
        if (!$this->permissions) {
            return false;
        }

        return in_array($permission, $this->permissions);
    }

    /**
     * Get users by role
     */
    public static function getPlanners()
    {
        return self::where('role', 'planner')->with('user')->get();
    }

    public static function getApprovers()
    {
        return self::where('role', 'approver')->with('user')->get();
    }

    public static function getExecutors()
    {
        return self::where('role', 'executor')->with('user')->get();
    }

    public static function getViewers()
    {
        return self::where('role', 'viewer')->with('user')->get();
    }
}

