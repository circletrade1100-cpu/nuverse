<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean'
        ];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function userProfile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function hasRole($role): bool
    {
        return $this->roles()->where('name', $role)->exists();
    }

    public function hasPermission($permission): bool
    {
        // Super Admin has all permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->roles()->whereHas('permissions', function($q) use ($permission) {
            $q->where('name', $permission);
        })->exists();
    }

    public function isSuperAdmin(): bool
    {
        return $this->roles()->whereIn('name', [
            'super_admin',
            'super admin',
            'Super Admin',
            'Super Administrator',
        ])->exists();
    }

    public function getAllPermissions(): array
    {
        if ($this->isSuperAdmin()) {
            // Return all possible permissions for super admin
            return [
                'dashboard.view',
                'tata-usaha.view', 'tata-usaha.create', 'tata-usaha.edit', 'tata-usaha.delete', 'tata-usaha.export', 'tata-usaha.import',
                'pemasukan.view', 'pemasukan.create', 'pemasukan.edit', 'pemasukan.delete', 'pemasukan.export', 'pemasukan.import',
                'pengeluaran.view', 'pengeluaran.create', 'pengeluaran.edit', 'pengeluaran.delete', 'pengeluaran.export', 'pengeluaran.import',
                'payroll.view', 'payroll.create', 'payroll.edit', 'payroll.delete', 'payroll.export', 'payroll.import',
                'sarpras.view', 'sarpras.create', 'sarpras.edit', 'sarpras.delete', 'sarpras.export', 'sarpras.import',
                'dana-usaha.view', 'dana-usaha.create', 'dana-usaha.edit', 'dana-usaha.delete', 'dana-usaha.export', 'dana-usaha.import',
                'student.view', 'student.create', 'student.edit', 'student.delete', 'student.export', 'student.import',
                'guru.view', 'guru.create', 'guru.edit', 'guru.delete', 'guru.export', 'guru.import',
                'divisi-unit.view', 'divisi-unit.create', 'divisi-unit.edit', 'divisi-unit.delete', 'divisi-unit.export', 'divisi-unit.import',
                'rapbs.view', 'rapbs.create', 'rapbs.edit', 'rapbs.delete', 'rapbs.export', 'rapbs.import',
                'akuntansi.view', 'akuntansi.create', 'akuntansi.edit', 'akuntansi.delete', 'akuntansi.export', 'akuntansi.import',
                'master-data.view', 'master-data.create', 'master-data.edit', 'master-data.delete', 'master-data.export', 'master-data.import',
                'user.view', 'user.create', 'user.edit', 'user.delete', 'user.export', 'user.import',
                'parent.view', 'parent.create', 'parent.edit', 'parent.delete', 'parent.export', 'parent.import'
            ];
        }

        return $this->roles()->with('permissions')->get()->pluck('permissions')->flatten()->pluck('name')->toArray();
    }
}
