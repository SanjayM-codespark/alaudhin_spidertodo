<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class OrganizationController extends Controller
{
    /**
     * Display a listing of the organizations.
     */
    public function index(Request $request)
    {
        $query = Organization::query();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $organizations = $query->paginate(10)
            ->withQueryString();

        return Inertia::render('Organizations/Index', [
            'organizations' => $organizations,
            'filters' => $request->only(['search', 'status', 'sort_field', 'sort_direction']),
        ]);
    }

    /**
     * Show the form for creating a new organization.
     */
    public function create()
    {
        return Inertia::render('Organizations/Create');
    }

    /**
     * Store a newly created organization in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address_line1' => 'nullable|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'db_host' => 'required|string|max:255',
            'db_port' => 'required|string|max:10',
            'db_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('organizations', 'db_name'),
            ],
            'db_username' => 'required|string|max:255',
            'db_password' => 'required|string|max:255',
            'is_active' => 'boolean',
            // Admin account validation
            'create_admin' => 'boolean',
            'admin_name' => 'required_if:create_admin,true|string|max:255',
            'admin_username' => 'required_if:create_admin,true|string|max:255|unique:users,username',
            'admin_email' => 'required_if:create_admin,true|email|max:255|unique:users,email',
            'admin_password' => 'required_if:create_admin,true|string|min:8|max:255',
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(6);

        // Set default values
        $validated['is_active'] = $request->has('is_active');

        // Create the organization
        $organization = Organization::create($validated);

        // Create admin account if requested
        if ($request->boolean('create_admin')) {
            // Ensure all required fields are present
            if (empty($validated['admin_username'])) {
                throw new \Exception('Admin username is required but was not provided');
            }

            try {
                // Create the user with explicit fields
                $user = new User();
                $user->name = $validated['admin_name'];
                $user->username = $validated['admin_username'];
                $user->email = $validated['admin_email'];
                $user->password = Hash::make($validated['admin_password']);
                $user->is_staff = true;
                $user->is_admin = false;
                $user->email_verified_at = now();
                $user->save();

                // Create user profile linking to organization
                DB::table('user_profiles')->insert([
                    'user_id' => $user->id,
                    'organization_id' => $organization->id,
                    'first_name' => explode(' ', $validated['admin_name'])[0] ?? $validated['admin_name'],
                    'last_name' => explode(' ', $validated['admin_name'], 2)[1] ?? '',
                    'phone' => $validated['phone'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                Log::info('Admin account created successfully', [
                    'user_id' => $user->id,
                    'username' => $user->username,
                    'organization_id' => $organization->id
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to create admin account: ' . $e->getMessage(), [
                    'admin_data' => [
                        'name' => $validated['admin_name'] ?? 'missing',
                        'username' => $validated['admin_username'] ?? 'missing',
                        'email' => $validated['admin_email'] ?? 'missing',
                    ]
                ]);

                // Re-throw or handle gracefully
                throw $e;
            }
        }

        return redirect()->route('organizations.index')
            ->with('success', 'Organization created successfully.' .
                ($request->boolean('create_admin') ? ' Admin account was also created.' : ''));
    }

    /**
     * Display the specified organization.
     */
    public function show(Organization $organization)
    {
        return Inertia::render('Organizations/Show', [
            'organization' => $organization,
        ]);
    }

    /**
     * Show the form for editing the specified organization.
     */
    public function edit(Organization $organization)
    {
        return Inertia::render('Organizations/Edit', [
            'organization' => $organization,
        ]);
    }

    /**
     * Update the specified organization in storage.
     */
    public function update(Request $request, Organization $organization)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address_line1' => 'nullable|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'db_host' => 'required|string|max:255',
            'db_port' => 'required|string|max:10',
            'db_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('organizations', 'db_name')->ignore($organization->id),
            ],
            'db_username' => 'required|string|max:255',
            'db_password' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Only update password if provided
        if (empty($validated['db_password'])) {
            unset($validated['db_password']);
        }

        $validated['is_active'] = $request->has('is_active');

        $organization->update($validated);

        return redirect()->route('organizations.index')
            ->with('success', 'Organization updated successfully.');
    }

    /**
     * Remove the specified organization from storage.
     */
    public function destroy(Organization $organization)
    {
        $organization->delete();

        return redirect()->route('organizations.index')
            ->with('success', 'Organization deleted successfully.');
    }

    /**
     * Toggle organization active status.
     */
    public function toggleStatus(Organization $organization)
    {
        $organization->update([
            'is_active' => !$organization->is_active
        ]);

        return redirect()->back()
            ->with('success', 'Organization status updated successfully.');
    }

    public function users(Organization $organization)
    {
        $users = User::whereHas('profiles', function ($query) use ($organization) {
            $query->where('organization_id', $organization->id);
        })
            ->with(['profiles' => function ($query) use ($organization) {
                $query->where('organization_id', $organization->id);
            }])
            ->select('id', 'name', 'username', 'email', 'is_admin', 'is_staff', 'email_verified_at', 'created_at')
            ->get();

        return inertia('Organizations/Users', [
            'organization' => $organization,
            'users' => $users
        ]);
    }

    /**
     * Get users for a specific organization (JSON API for modals)
     */
    public function getUsers(Organization $organization)
    {
        $users = User::whereHas('profiles', function ($query) use ($organization) {
            $query->where('organization_id', $organization->id);
        })
            ->with(['profiles' => function ($query) use ($organization) {
                $query->where('organization_id', $organization->id);
            }])
            ->select('id', 'name', 'username', 'email', 'is_admin', 'is_staff', 'email_verified_at')
            ->get();

        return response()->json([
            'users' => $users,
            'organization' => $organization->name
        ]);
    }
}
