<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\UserProfile;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',      // Added username field
        'email',
        'password',
        'is_admin',       // Added is_admin field
        'is_staff',       // Added is_staff field
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
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
            'is_admin' => 'boolean',    // Cast to boolean
            'is_staff' => 'boolean',    // Cast to boolean
        ];
    }

    /**
     * Get the profiles for the user.
     */
    public function profiles()
    {
        return $this->hasMany(UserProfile::class, 'user_id');
    }

    /**
     * Get the organizations this user belongs to through profiles.
     */
    public function organizations()
    {
        return $this->belongsToMany(Organization::class, 'user_profiles', 'user_id', 'organization_id')
                    ->withPivot(['first_name', 'last_name', 'phone', 'avatar'])
                    ->withTimestamps();
    }

    /**
     * Get the profile for a specific organization.
     *
     * @param int $organizationId
     * @return \App\Models\UserProfile|null
     */
    public function profileForOrganization($organizationId)
    {
        return $this->profiles()->where('organization_id', $organizationId)->first();
    }

    /**
     * Check if user belongs to a specific organization.
     *
     * @param int $organizationId
     * @return bool
     */
    public function belongsToOrganization($organizationId)
    {
        return $this->profiles()->where('organization_id', $organizationId)->exists();
    }

    /**
     * Check if user is a global admin.
     *
     * @return bool
     */
    public function isAdmin()
    {
        return $this->is_admin === true;
    }

    /**
     * Check if user is a staff member (not admin).
     *
     * @return bool
     */
    public function isStaff()
    {
        return $this->is_staff === true && $this->is_admin === false;
    }

    /**
     * Scope a query to only include admins.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAdmins($query)
    {
        return $query->where('is_admin', true);
    }

    /**
     * Scope a query to only include staff members.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeStaff($query)
    {
        return $query->where('is_staff', true)->where('is_admin', false);
    }

    /**
     * Get all organizations where user is admin/staff.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getStaffOrganizationsAttribute()
    {
        return $this->organizations()->get();
    }

    /**
     * Get the user's role as a string.
     *
     * @return string
     */
    public function getRoleAttribute()
    {
        if ($this->is_admin) {
            return 'admin';
        }
        if ($this->is_staff) {
            return 'staff';
        }
        return 'user';
    }
}
