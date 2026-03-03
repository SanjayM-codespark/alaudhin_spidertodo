<?php

namespace App\Http\Controllers;

use App\Models\Membership;
use App\Models\Organization;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class MembershipController extends Controller
{
    /**
     * Display a listing of the memberships.
     */
    public function index(Request $request)
    {
        $query = Membership::query()
            ->with(['organization', 'package']);

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('organization', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('package', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Payment status filter
        if ($request->has('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        // Billing cycle filter
        if ($request->has('billing_cycle') && $request->billing_cycle !== 'all') {
            $query->where('billing_cycle', $request->billing_cycle);
        }

        // Organization filter
        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        // Package filter
        if ($request->has('package_id')) {
            $query->where('package_id', $request->package_id);
        }

        // Date range filters
        if ($request->has('date_from')) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('end_date', '<=', $request->date_to);
        }

        // Trial filter
        if ($request->has('is_trial')) {
            $query->where('is_trial', $request->boolean('is_trial'));
        }

        // Auto-renew filter
        if ($request->has('auto_renew')) {
            $query->where('auto_renew', $request->boolean('auto_renew'));
        }

        // Sorting
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $memberships = $query->paginate($request->get('per_page', 15));

        // Get counts for dashboard stats
        $stats = [
            'active' => Membership::where('status', 'active')->count(),
            'trial' => Membership::where('status', 'trial')->count(),
            'expired' => Membership::where('status', 'expired')->count(),
            'cancelled' => Membership::where('status', 'cancelled')->count(),
            'pending_payment' => Membership::where('status', 'pending_payment')->count(),
            'expiring_soon' => Membership::expiringSoon()->count(),
            'due_for_renewal' => Membership::dueForRenewal()->count(),
            'total_revenue' => Membership::where('payment_status', 'paid')->sum('price_paid'),
        ];

        return inertia('Memberships/Index', [
            'memberships' => $memberships,
            'filters' => $request->only([
                'search',
                'status',
                'payment_status',
                'billing_cycle',
                'organization_id',
                'package_id',
                'date_from',
                'date_to',
                'is_trial',
                'auto_renew',
                'sort_field',
                'sort_direction'
            ]),
            'stats' => $stats,
            'organizations' => Organization::select('id', 'name')->get(),
            'packages' => Package::select('id', 'name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new membership.
     */
    public function create(Request $request)
    {
        $organizations = Organization::active()->get();
        $packages = Package::active()->public()->get();

        $selectedOrganization = null;
        if ($request->has('organization')) {
            $selectedOrganization = Organization::find($request->organization);
        }

        return inertia('Memberships/Create', [
            'organizations' => $organizations,
            'packages' => $packages,
            'selectedOrganization' => $selectedOrganization,
        ]);
    }

    /**
     * Store a newly created membership in storage.
     */
    public function store(Request $request)
    {
        $validated = $this->validateMembership($request);

        // Get package details for snapshot
        $package = Package::findOrFail($validated['package_id']);

        // Set ALL snapshot values from package - these are required fields!
        $validated['allowed_projects'] = $package->max_projects ?? 0;
        $validated['allowed_tasks_per_project'] = $package->max_tasks_per_project ?? 0;
        $validated['allowed_total_tasks'] = $package->max_total_tasks ?? 0;
        $validated['allowed_team_members'] = $package->max_team_members ?? 1;
        $validated['allowed_clients'] = $package->max_clients ?? 0;
        $validated['allowed_storage_mb'] = $package->max_storage_mb ?? 100;
        $validated['feature_snapshot'] = $package->features ?? json_encode([]);

        // Set trial information
        if ($validated['is_trial'] ?? false) {
            $validated['trial_days'] = $validated['trial_days'] ?? ($package->trial_days ?? 14);
            $validated['trial_ends_at'] = Carbon::now()->addDays($validated['trial_days']);
            $validated['status'] = 'trial';
        }

        // Set dates based on billing cycle
        $validated['start_date'] = $validated['start_date'] ?? Carbon::now();

        if ($validated['billing_cycle'] !== 'lifetime') {
            $validated['end_date'] = $this->calculateEndDate($validated['billing_cycle'], $validated['start_date']);
            $validated['next_billing_date'] = $validated['end_date'];
        } else {
            $validated['end_date'] = null;
            $validated['next_billing_date'] = null;
        }

        // Set initial status
        if (!isset($validated['status'])) {
            $validated['status'] = $validated['payment_status'] === 'paid' ? 'active' : 'pending_payment';
        }

        // Ensure all required fields have values
        $validated = $this->ensureRequiredFields($validated);

        $membership = Membership::create($validated);

        return redirect()->route('memberships.show', $membership)
            ->with('success', 'Membership created successfully.');
    }

    /**
     * Ensure all required fields have values
     */
    protected function ensureRequiredFields(array $data): array
    {
        // Set default values for any missing required fields
        $defaults = [
            'allowed_projects' => 0,
            'allowed_tasks_per_project' => 0,
            'allowed_total_tasks' => 0,
            'allowed_team_members' => 1,
            'allowed_clients' => 0,
            'allowed_storage_mb' => 100,
            'feature_snapshot' => json_encode([]),
            'trial_days' => 0,
            'discount_amount' => 0,
            'auto_renew' => true,
            'renewal_count' => 0,
        ];

        foreach ($defaults as $field => $defaultValue) {
            if (!isset($data[$field]) || $data[$field] === null) {
                $data[$field] = $defaultValue;
            }
        }

        return $data;
    }

    /**
     * Display the specified membership.
     */
    public function show(Membership $membership)
    {

        $membership->load(['organization', 'package']);

        return inertia('Memberships/Show', [
            'membership' => $membership,
            'daysRemaining' => $membership->days_remaining,
            'trialDaysRemaining' => $membership->trial_days_remaining,
            'canRenew' => $membership->isExpired() || $membership->isCancelled(),
            'canCancel' => $membership->isActive() || $membership->isInTrial(),
            'canSuspend' => $membership->isActive(),
            'canActivate' => $membership->isSuspended() || $membership->isCancelled(),
            'refundAmount' => $membership->calculateRefundAmount(),
        ]);
    }

    /**
     * Show the form for editing the specified membership.
     */
    public function edit(Membership $membership)
    {
        $organizations = Organization::active()->get();
        $packages = Package::active()->get();

        return inertia('Memberships/Edit', [
            'membership' => $membership,
            'organizations' => $organizations,
            'packages' => $packages,
        ]);
    }

    /**
     * Update the specified membership in storage.
     */
    public function update(Request $request, Membership $membership)
    {
        $validated = $this->validateMembership($request, $membership->id);

        // Don't allow changing package on existing membership?
        // Or handle with care as it might affect snapshots
        if (isset($validated['package_id']) && $validated['package_id'] != $membership->package_id) {
            $package = Package::findOrFail($validated['package_id']);
            $validated['allowed_projects'] = $package->max_projects;
            $validated['allowed_tasks_per_project'] = $package->max_tasks_per_project;
            $validated['allowed_total_tasks'] = $package->max_total_tasks;
            $validated['allowed_team_members'] = $package->max_team_members;
            $validated['allowed_clients'] = $package->max_clients;
            $validated['allowed_storage_mb'] = $package->max_storage_mb;
            $validated['feature_snapshot'] = $package->features;
        }

        $membership->update($validated);

        return redirect()->route('memberships.show', $membership)
            ->with('success', 'Membership updated successfully.');
    }

    /**
     * Remove the specified membership from storage.
     */
    public function destroy(Membership $membership)
    {
        // Check if membership is active
        if ($membership->isActive()) {
            return back()->with('error', 'Cannot delete active membership. Cancel it first.');
        }

        $membership->delete();

        return redirect()->route('memberships.index')
            ->with('success', 'Membership deleted successfully.');
    }

    /**
     * Cancel a membership.
     */
    public function cancel(Request $request, Membership $membership)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $membership->cancel($request->reason);

        return back()->with('success', 'Membership cancelled successfully.');
    }

    /**
     * Renew a membership.
     */
    public function renew(Membership $membership)
    {
        $membership->renew();

        return back()->with('success', 'Membership renewed successfully.');
    }

    /**
     * Suspend a membership.
     */
    public function suspend(Membership $membership)
    {
        $membership->suspend();

        return back()->with('success', 'Membership suspended successfully.');
    }

    /**
     * Activate a membership.
     */
    public function activate(Membership $membership)
    {
        $membership->activate();

        return back()->with('success', 'Membership activated successfully.');
    }

    /**
     * Mark membership as paid.
     */
    public function markPaid(Request $request, Membership $membership)
    {
        $request->validate([
            'transaction_id' => 'nullable|string|max:100',
            'payment_details' => 'nullable|array',
        ]);

        $membership->markAsPaid(
            $request->transaction_id,
            $request->payment_details ?? []
        );

        return back()->with('success', 'Membership marked as paid successfully.');
    }

    /**
     * Process refund for membership.
     */
    public function refund(Request $request, Membership $membership)
    {
        $request->validate([
            'amount' => 'nullable|numeric|min:0|max:' . $membership->price_paid,
            'reason' => 'nullable|string|max:500',
        ]);

        $refundAmount = $request->amount ?? $membership->calculateRefundAmount();

        // Update membership
        $membership->update([
            'payment_status' => 'refunded',
            'status' => 'cancelled',
            'cancelled_at' => Carbon::now(),
            'cancellation_reason' => $request->reason ?? 'Refund processed',
            'notes' => $membership->notes . "\nRefunded: {$refundAmount} on " . Carbon::now()->toDateTimeString(),
        ]);

        return back()->with('success', "Refund of {$refundAmount} processed successfully.");
    }

    /**
     * Get memberships expiring soon (API endpoint).
     */
    public function getExpiringSoon(Request $request)
    {
        $days = $request->get('days', 7);

        $memberships = Membership::with(['organization', 'package'])
            ->expiringSoon($days)
            ->get();

        return response()->json([
            'count' => $memberships->count(),
            'memberships' => $memberships,
        ]);
    }

    /**
     * Get active memberships count (API endpoint).
     */
    public function getActiveCount()
    {
        $count = Membership::where('status', 'active')->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Calculate end date based on billing cycle.
     */
    protected function calculateEndDate(string $cycle, $startDate): Carbon
    {
        $start = $startDate instanceof Carbon ? $startDate : Carbon::parse($startDate);

        return match ($cycle) {
            'monthly' => $start->copy()->addMonth(),
            'quarterly' => $start->copy()->addMonths(3),
            'yearly' => $start->copy()->addYear(),
            default => $start->copy()->addMonth(),
        };
    }



    protected function validateMembership(Request $request, $ignoreId = null)
    {
        $rules = [
            'organization_id' => 'required|exists:organizations,id',
            'package_id' => 'required|exists:packages,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_trial' => 'boolean',
            'trial_ends_at' => 'nullable|date|after:start_date',
            'trial_days' => 'integer|min:0',
            'billing_cycle' => 'required|in:monthly,yearly,quarterly,lifetime',
            'price_paid' => 'required|numeric|min:0',
            'discount_amount' => 'numeric|min:0',
            'coupon_code' => 'nullable|string|max:50',
            'payment_status' => 'required|in:pending,paid,failed,refunded',
            'paid_at' => 'nullable|date',
            'transaction_id' => 'nullable|string|max:100',
            'payment_details' => 'nullable|array',
            'status' => 'required|in:active,expired,cancelled,suspended,trial,pending_payment',
            'cancelled_at' => 'nullable|date',
            'cancellation_reason' => 'nullable|string|max:1000',
            'auto_renew' => 'boolean',
            'renewal_count' => 'integer|min:0',
            'next_billing_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ];

        return $request->validate($rules);
    }
}
