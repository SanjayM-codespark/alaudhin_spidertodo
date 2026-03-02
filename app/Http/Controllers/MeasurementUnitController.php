<?php

namespace App\Http\Controllers;

use App\Models\MeasurementUnit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MeasurementUnitController extends Controller
{
    public function index(Request $request)
    {
        $query = MeasurementUnit::query();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filter by active status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Sort
        $sortField = $request->get('sort_field', 'display_order');
        $sortDirection = $request->get('sort_direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $units = $query->paginate(15)->withQueryString();

        return Inertia::render('MeasurementUnits/Index', [
            'units' => $units,
            'filters' => $request->only(['search', 'type', 'status', 'sort_field', 'sort_direction']),
            'types' => MeasurementUnit::select('type')->distinct()->pluck('type')
        ]);
    }

    /**
     * Show the form for creating a new measurement unit.
     */
    public function create()
    {
        return Inertia::render('MeasurementUnits/Create');
    }

    /**
     * Store a newly created measurement unit in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:measurement_units',
            'symbol' => 'nullable|string|max:20',
            'type' => 'required|string|max:50',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
            'display_order' => 'integer|min:0'
        ]);

        $unit = MeasurementUnit::create($validated);

        return redirect()->route('measurement-units.index')
            ->with('success', 'Measurement unit created successfully.');
    }

    /**
     * Display the specified measurement unit.
     */
    public function show(MeasurementUnit $measurementUnit)
    {
        return Inertia::render('MeasurementUnits/Show', [
            'unit' => $measurementUnit
        ]);
    }

    /**
     * Show the form for editing the specified measurement unit.
     */
    public function edit(MeasurementUnit $measurementUnit)
    {
        return Inertia::render('MeasurementUnits/Edit', [
            'unit' => $measurementUnit
        ]);
    }

    /**
     * Update the specified measurement unit in storage.
     */
    public function update(Request $request, MeasurementUnit $measurementUnit)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:measurement_units,code,' . $measurementUnit->id,
            'symbol' => 'nullable|string|max:20',
            'type' => 'required|string|max:50',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
            'display_order' => 'integer|min:0'
        ]);

        $measurementUnit->update($validated);

        return redirect()->route('measurement-units.index')
            ->with('success', 'Measurement unit updated successfully.');
    }

    /**
     * Remove the specified measurement unit from storage.
     */
    public function destroy(MeasurementUnit $measurementUnit)
    {
        $measurementUnit->delete();

        return redirect()->route('measurement-units.index')
            ->with('success', 'Measurement unit deleted successfully.');
    }

    /**
     * Toggle the active status of a measurement unit.
     */
    public function toggleActive(MeasurementUnit $measurementUnit)
    {
        $measurementUnit->update([
            'is_active' => !$measurementUnit->is_active
        ]);

        return redirect()->back()
            ->with('success', 'Measurement unit status updated successfully.');
    }

    /**
     * Get all active units for dropdown/API usage.
     */
    public function getActiveUnits()
    {
        $units = MeasurementUnit::active()->ordered()->get();

        if (request()->wantsJson()) {
            return response()->json($units);
        }

        return $units;
    }

    /**
     * Bulk delete measurement units.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:measurement_units,id'
        ]);

        MeasurementUnit::whereIn('id', $request->ids)->delete();

        return redirect()->route('measurement-units.index')
            ->with('success', 'Selected measurement units deleted successfully.');
    }
}
