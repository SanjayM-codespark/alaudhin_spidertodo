<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Membership extends Model
{
    use HasFactory;

    protected $table = 'memberships';

    protected $fillable = [
        'organization_id',
        'package_id',
        'start_date',
        'end_date',
        'is_trial',
        'trial_ends_at',
        'trial_days',
        'billing_cycle',
        'price_paid',
        'discount_amount',
        'coupon_code',
        'payment_status',
        'paid_at',
        'transaction_id',
        'payment_details',
        'status',
        'cancelled_at',
        'cancellation_reason',
        'auto_renew',
        'renewal_count',
        'next_billing_date',
        'allowed_projects',
        'allowed_tasks_per_project',
        'allowed_total_tasks',
        'allowed_team_members',
        'allowed_clients',
        'allowed_storage_mb',
        'feature_snapshot',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'trial_ends_at' => 'datetime',
        'paid_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'next_billing_date' => 'datetime',
        'is_trial' => 'boolean',
        'auto_renew' => 'boolean',
        'price_paid' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'payment_details' => 'json',
        'feature_snapshot' => 'json',
        'allowed_projects' => 'integer',
        'allowed_tasks_per_project' => 'integer',
        'allowed_total_tasks' => 'integer',
        'allowed_team_members' => 'integer',
        'allowed_clients' => 'integer',
        'allowed_storage_mb' => 'integer',
    ];

    /**
     * Get the organization that owns the membership.
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the package associated with the membership.
     */
    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    /**
     * Scope a query to only include active memberships.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include trial memberships.
     */
    public function scopeTrial($query)
    {
        return $query->where('status', 'trial');
    }

    /**
     * Scope a query to only include expired memberships.
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    /**
     * Scope a query to only include cancelled memberships.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope a query to only include suspended memberships.
     */
    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }

    /**
     * Scope a query to only include pending payment memberships.
     */
    public function scopePendingPayment($query)
    {
        return $query->where('status', 'pending_payment');
    }

    /**
     * Scope a query to get memberships expiring soon.
     */
    public function scopeExpiringSoon($query, $days = 7)
    {
        return $query->where('status', 'active')
            ->whereNotNull('end_date')
            ->where('end_date', '<=', Carbon::now()->addDays($days))
            ->where('end_date', '>', Carbon::now());
    }

    /**
     * Scope a query to get memberships due for renewal.
     */
    public function scopeDueForRenewal($query)
    {
        return $query->where('auto_renew', true)
            ->where('status', 'active')
            ->whereNotNull('next_billing_date')
            ->where('next_billing_date', '<=', Carbon::now()->addDays(7));
    }

    /**
     * Scope a query to get memberships by organization.
     */
    public function scopeForOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    /**
     * Scope a query to get memberships by package.
     */
    public function scopeForPackage($query, $packageId)
    {
        return $query->where('package_id', $packageId);
    }

    /**
     * Check if membership is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if membership is in trial period.
     */
    public function isInTrial(): bool
    {
        return $this->status === 'trial' ||
            ($this->is_trial && $this->trial_ends_at && $this->trial_ends_at->isFuture());
    }

    /**
     * Check if membership has expired.
     */
    public function isExpired(): bool
    {
        if ($this->status === 'expired') {
            return true;
        }

        return $this->end_date && $this->end_date->isPast() && $this->status === 'active';
    }

    /**
     * Check if membership is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if membership is suspended.
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Check if payment is pending.
     */
    public function isPaymentPending(): bool
    {
        return $this->status === 'pending_payment' || $this->payment_status === 'pending';
    }

    /**
     * Check if payment is paid.
     */
    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Get days remaining in membership.
     */
    public function getDaysRemainingAttribute(): ?int
    {
        if (!$this->end_date) {
            return null; // Lifetime membership
        }

        $now = Carbon::now();
        if ($this->end_date->lt($now)) {
            return 0;
        }

        return $now->diffInDays($this->end_date);
    }

    /**
     * Get trial days remaining.
     */
    public function getTrialDaysRemainingAttribute(): ?int
    {
        if (!$this->trial_ends_at) {
            return null;
        }

        $now = Carbon::now();
        if ($this->trial_ends_at->lt($now)) {
            return 0;
        }

        return $now->diffInDays($this->trial_ends_at);
    }

    /**
     * Get formatted price paid.
     */
    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price_paid, 2);
    }

    /**
     * Get formatted discount amount.
     */
    public function getFormattedDiscountAttribute(): string
    {
        return number_format($this->discount_amount, 2);
    }

    /**
     * Calculate prorated refund amount.
     */
    public function calculateRefundAmount(): float
    {
        if (!$this->end_date || $this->billing_cycle === 'lifetime') {
            return 0;
        }

        $totalDays = $this->start_date->diffInDays($this->end_date);
        $usedDays = $this->start_date->diffInDays(Carbon::now());
        $unusedDays = max(0, $totalDays - $usedDays);

        return ($this->price_paid / $totalDays) * $unusedDays;
    }

    /**
     * Renew the membership.
     */
    public function renew(): self
    {
        $this->renewal_count++;
        $this->start_date = Carbon::now();

        if ($this->billing_cycle !== 'lifetime') {
            $this->end_date = $this->calculateEndDate();
            $this->next_billing_date = $this->calculateNextBillingDate();
        }

        $this->status = 'active';
        $this->payment_status = 'pending';
        $this->save();

        return $this;
    }

    /**
     * Cancel the membership.
     */
    public function cancel(string $reason = null): self
    {
        $this->status = 'cancelled';
        $this->cancelled_at = Carbon::now();
        $this->cancellation_reason = $reason;
        $this->auto_renew = false;
        $this->save();

        return $this;
    }

    /**
     * Suspend the membership.
     */
    public function suspend(): self
    {
        $this->status = 'suspended';
        $this->save();

        return $this;
    }

    /**
     * Activate the membership.
     */
    public function activate(): self
    {
        $this->status = 'active';
        $this->save();

        return $this;
    }

    /**
     * Mark as paid.
     */
    public function markAsPaid(string $transactionId = null, array $paymentDetails = []): self
    {
        $this->payment_status = 'paid';
        $this->paid_at = Carbon::now();

        if ($transactionId) {
            $this->transaction_id = $transactionId;
        }

        if (!empty($paymentDetails)) {
            $this->payment_details = $paymentDetails;
        }

        // If status was pending_payment, activate it
        if ($this->status === 'pending_payment') {
            $this->status = 'active';
        }

        $this->save();

        return $this;
    }

    /**
     * Calculate end date based on billing cycle.
     */
    protected function calculateEndDate(): Carbon
    {
        return match ($this->billing_cycle) {
            'monthly' => Carbon::now()->addMonth(),
            'quarterly' => Carbon::now()->addMonths(3),
            'yearly' => Carbon::now()->addYear(),
            'lifetime' => Carbon::now()->addYears(100), // Essentially lifetime
            default => Carbon::now()->addMonth(),
        };
    }

    /**
     * Calculate next billing date.
     */
    protected function calculateNextBillingDate(): ?Carbon
    {
        if ($this->billing_cycle === 'lifetime') {
            return null;
        }

        return $this->calculateEndDate();
    }
}
