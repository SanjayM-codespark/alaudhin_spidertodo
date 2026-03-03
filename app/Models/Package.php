<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Package extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'package_type',
        'no_of_projects',
        'no_of_tasks_per_project',
        'total_tasks_allowed',
        'no_of_team_members',
        'no_of_clients',
        'has_time_tracking',
        'has_deadline_management',
        'has_efficiency_tracking',
        'has_reminders',
        'has_kpi_tracking',
        'kpi_points_per_task',
        'kpi_metrics',
        'has_priority_support',
        'has_api_access',
        'has_advanced_reports',
        'has_custom_fields',
        'has_file_attachments',
        'storage_limit_mb',
        'price_monthly',
        'price_yearly',
        'setup_fee',
        'is_free',
        'has_trial',
        'trial_days',
        'is_active',
        'is_featured',
        'is_public',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'kpi_metrics' => 'array',
        'has_time_tracking' => 'boolean',
        'has_deadline_management' => 'boolean',
        'has_efficiency_tracking' => 'boolean',
        'has_reminders' => 'boolean',
        'has_kpi_tracking' => 'boolean',
        'has_priority_support' => 'boolean',
        'has_api_access' => 'boolean',
        'has_advanced_reports' => 'boolean',
        'has_custom_fields' => 'boolean',
        'has_file_attachments' => 'boolean',
        'is_free' => 'boolean',
        'has_trial' => 'boolean',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_public' => 'boolean',
        'price_monthly' => 'decimal:2',
        'price_yearly' => 'decimal:2',
        'setup_fee' => 'decimal:2',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($package) {
            if (empty($package->slug)) {
                $package->slug = Str::slug($package->name);
            }
        });

        static::updating(function ($package) {
            if ($package->isDirty('name') && !$package->isDirty('slug')) {
                $package->slug = Str::slug($package->name);
            }
        });
    }

    // Removed subscriptions relationship since table doesn't exist yet

    /**
     * Check if package has unlimited projects.
     */
    public function getHasUnlimitedProjectsAttribute(): bool
    {
        return $this->no_of_projects === 0;
    }

    /**
     * Check if package has unlimited tasks.
     */
    public function getHasUnlimitedTasksAttribute(): bool
    {
        return $this->total_tasks_allowed === 0;
    }

    /**
     * Get formatted price monthly.
     */
    public function getFormattedPriceMonthlyAttribute(): string
    {
        return $this->is_free ? 'Free' : '₹' . number_format($this->price_monthly, 2);
    }

    /**
     * Get formatted price yearly.
     */
    public function getFormattedPriceYearlyAttribute(): string
    {
        return $this->is_free ? 'Free' : '₹' . number_format($this->price_yearly, 2);
    }

    /**
     * Get savings percentage for yearly vs monthly.
     */
    public function getYearlySavingsPercentageAttribute(): ?int
    {
        if ($this->is_free || $this->price_monthly == 0 || $this->price_yearly == 0) {
            return null;
        }

        $monthlyYearlyTotal = $this->price_monthly * 12;
        $savings = (($monthlyYearlyTotal - $this->price_yearly) / $monthlyYearlyTotal) * 100;

        return round($savings);
    }

    /**
     * Scope a query to only include active packages.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include public packages.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope a query to only include featured packages.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Scope a query to only include free packages.
     */
    public function scopeFree($query)
    {
        return $query->where('is_free', true);
    }

    /**
     * Scope a query to only include paid packages.
     */
    public function scopePaid($query)
    {
        return $query->where('is_free', false);
    }
}
