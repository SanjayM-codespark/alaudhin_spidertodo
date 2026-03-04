<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_profiles';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'organization_id',
        'first_name',
        'last_name',
        'phone',
        'avatar',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the organization that the profile belongs to.
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    /**
     * Get the user's full name from first_name and last_name.
     *
     * @return string
     */
    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get the initials from first name for avatar fallback.
     *
     * @return string
     */
    public function getInitialsAttribute()
    {
        if ($this->first_name) {
            return strtoupper(substr($this->first_name, 0, 1));
        }

        if ($this->user && $this->user->name) {
            return strtoupper(substr($this->user->name, 0, 1));
        }

        return '?';
    }

    /**
     * Scope a query to filter by organization.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $organizationId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    /**
     * Scope a query to filter by user.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
