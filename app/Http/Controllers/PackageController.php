<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PackageController extends Controller
{
    /**
     * Display a listing of the packages.
     */
    public function index(Request $request)
    {
        $packages = Package::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->type, function ($query, $type) {
                $query->where('package_type', $type);
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('is_active', $request->status === 'active');
            })
            ->when($request->free !== null, function ($query) use ($request) {
                $query->where('is_free', $request->free === 'true');
            })
            ->ordered()
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        return Inertia::render('Packages/Index', [
            'packages' => $packages,
            'filters' => $request->only(['search', 'type', 'status', 'free', 'per_page']),
            'types' => Package::select('package_type')->distinct()->pluck('package_type'),
        ]);
    }

    /**
     * Show the form for creating a new package.
     */
    public function create()
    {
        return Inertia::render('Packages/Create');
    }

    /**
     * Store a newly created package in storage.
     */
    public function store(Request $request)
    {
        $validated = $this->validatePackage($request);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle free package logic
        if ($request->boolean('is_free')) {
            $validated['price_monthly'] = 0;
            $validated['price_yearly'] = 0;
            $validated['setup_fee'] = 0;
        }

        $package = Package::create($validated);

        return redirect()
            ->route('packages.show', $package)
            ->with('success', 'Package created successfully.');
    }

    /**
     * Display the specified package.
     */
    public function show(Package $package)
    {
        // Removed subscription count since table doesn't exist
        return Inertia::render('Packages/Show', [
            'package' => $package,
            // Removed recentSubscriptions
        ]);
    }

    /**
     * Show the form for editing the specified package.
     */
    public function edit(Package $package)
    {
        return Inertia::render('Packages/Edit', [
            'package' => $package,
        ]);
    }

    /**
     * Update the specified package in storage.
     */
    public function update(Request $request, Package $package)
    {
        $validated = $this->validatePackage($request, $package->id);

        // Handle free package logic
        if ($request->boolean('is_free')) {
            $validated['price_monthly'] = 0;
            $validated['price_yearly'] = 0;
            $validated['setup_fee'] = 0;
        }

        $package->update($validated);

        return redirect()
            ->route('packages.show', $package)
            ->with('success', 'Package updated successfully.');
    }

    /**
     * Remove the specified package from storage.
     */
    public function destroy(Package $package)
    {
        // Removed subscription check since table doesn't exist
        $package->delete();

        return redirect()
            ->route('packages.index')
            ->with('success', 'Package deleted successfully.');
    }

    /**
     * Toggle package active status.
     */
    public function toggleActive(Package $package)
    {
        $package->update([
            'is_active' => !$package->is_active
        ]);

        return back()->with('success',
            $package->is_active ? 'Package activated successfully.' : 'Package deactivated successfully.'
        );
    }

    /**
     * Toggle package featured status.
     */
    public function toggleFeatured(Package $package)
    {
        $package->update([
            'is_featured' => !$package->is_featured
        ]);

        return back()->with('success',
            $package->is_featured ? 'Package featured successfully.' : 'Package unfeatured successfully.'
        );
    }

    /**
     * Toggle package public visibility.
     */
    public function togglePublic(Package $package)
    {
        $package->update([
            'is_public' => !$package->is_public
        ]);

        return back()->with('success',
            $package->is_public ? 'Package is now public.' : 'Package is now hidden.'
        );
    }

    /**
     * Bulk delete packages.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:packages,id'
        ]);

        // Removed subscription check since table doesn't exist
        Package::whereIn('id', $request->ids)->delete();

        return back()->with('success', 'Selected packages deleted successfully.');
    }

    /**
     * Update sort order of packages.
     */
    public function updateSortOrder(Request $request)
    {
        $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:packages,id',
            'orders.*.sort_order' => 'required|integer|min:0'
        ]);

        foreach ($request->orders as $order) {
            Package::where('id', $order['id'])->update([
                'sort_order' => $order['sort_order']
            ]);
        }

        return response()->json(['message' => 'Sort order updated successfully.']);
    }

    /**
     * Get active packages for public listing.
     */
    public function getActivePackages()
    {
        $packages = Package::active()
            ->public()
            ->ordered()
            ->get()
            ->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'description' => $package->description,
                    'package_type' => $package->package_type,
                    'price_monthly' => $package->price_monthly,
                    'price_yearly' => $package->price_yearly,
                    'formatted_price_monthly' => $package->formatted_price_monthly,
                    'formatted_price_yearly' => $package->formatted_price_yearly,
                    'yearly_savings' => $package->yearly_savings_percentage,
                    'is_free' => $package->is_free,
                    'has_trial' => $package->has_trial,
                    'trial_days' => $package->trial_days,
                    'features' => [
                        'projects' => $package->no_of_projects,
                        'tasks_per_project' => $package->no_of_tasks_per_project,
                        'total_tasks' => $package->total_tasks_allowed,
                        'team_members' => $package->no_of_team_members,
                        'clients' => $package->no_of_clients,
                        'storage_mb' => $package->storage_limit_mb,
                        'has_time_tracking' => $package->has_time_tracking,
                        'has_deadline_management' => $package->has_deadline_management,
                        'has_efficiency_tracking' => $package->has_efficiency_tracking,
                        'has_reminders' => $package->has_reminders,
                        'has_kpi_tracking' => $package->has_kpi_tracking,
                        'kpi_points_per_task' => $package->kpi_points_per_task,
                        'has_priority_support' => $package->has_priority_support,
                        'has_api_access' => $package->has_api_access,
                        'has_advanced_reports' => $package->has_advanced_reports,
                        'has_custom_fields' => $package->has_custom_fields,
                        'has_file_attachments' => $package->has_file_attachments,
                    ]
                ];
            });

        return response()->json($packages);
    }

    /**
     * Validate package request.
     */
    protected function validatePackage(Request $request, $ignoreId = null)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('packages')->ignore($ignoreId)
            ],
            'description' => 'nullable|string',
            'package_type' => 'required|string|max:50',
            'no_of_projects' => 'required|integer|min:0',
            'no_of_tasks_per_project' => 'required|integer|min:0',
            'total_tasks_allowed' => 'required|integer|min:0',
            'no_of_team_members' => 'required|integer|min:1',
            'no_of_clients' => 'required|integer|min:0',
            'has_time_tracking' => 'boolean',
            'has_deadline_management' => 'boolean',
            'has_efficiency_tracking' => 'boolean',
            'has_reminders' => 'boolean',
            'has_kpi_tracking' => 'boolean',
            'kpi_points_per_task' => 'required|integer|min:0',
            'kpi_metrics' => 'nullable|array',
            'has_priority_support' => 'boolean',
            'has_api_access' => 'boolean',
            'has_advanced_reports' => 'boolean',
            'has_custom_fields' => 'boolean',
            'has_file_attachments' => 'boolean',
            'storage_limit_mb' => 'required|integer|min:0',
            'price_monthly' => 'required|numeric|min:0',
            'price_yearly' => 'required|numeric|min:0',
            'setup_fee' => 'required|numeric|min:0',
            'is_free' => 'boolean',
            'has_trial' => 'boolean',
            'trial_days' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_public' => 'boolean',
            'sort_order' => 'required|integer|min:0',
        ];

        // First, get the validated data
        $validated = $request->validate($rules);

        // Convert checkbox values to boolean after validation
        $booleanFields = [
            'has_time_tracking',
            'has_deadline_management',
            'has_efficiency_tracking',
            'has_reminders',
            'has_kpi_tracking',
            'has_priority_support',
            'has_api_access',
            'has_advanced_reports',
            'has_custom_fields',
            'has_file_attachments',
            'is_free',
            'has_trial',
            'is_active',
            'is_featured',
            'is_public',
        ];

        foreach ($booleanFields as $field) {
            if ($request->has($field)) {
                $validated[$field] = $request->boolean($field);
            }
        }

        return $validated;
    }
}
