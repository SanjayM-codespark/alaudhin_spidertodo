<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductUnitPrice;
use App\Models\MeasurementUnit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductUnitPriceController extends Controller
{
    /**
     * Display unit prices for a product.
     */
    public function index(Request $request, Product $product)
    {
        $query = $product->unitPrices()->with('measurementUnit', 'baseUnit');

        // Filter by availability
        if ($request->has('availability')) {
            if ($request->availability === 'available') {
                $query->where('is_available', true);
            } elseif ($request->availability === 'unavailable') {
                $query->where('is_available', false);
            }
        }

        // Filter by pricing type
        if ($request->has('pricing_type') && $request->pricing_type !== 'all') {
            $query->where('pricing_type', $request->pricing_type);
        }

        $unitPrices = $query->paginate(15)->withQueryString();

        return Inertia::render('ProductUnitPrices/Index', [
            'product' => $product,
            'unitPrices' => $unitPrices,
            'filters' => $request->only(['availability', 'pricing_type']),
            'pricingTypes' => ['fixed', 'tiered', 'formula']
        ]);
    }

    /**
     * Show form for creating unit price.
     */
    public function create(Product $product)
    {
        $measurementUnits = MeasurementUnit::active()->ordered()->get();

        return Inertia::render('ProductUnitPrices/Create', [
            'product' => $product,
            'measurementUnits' => $measurementUnits
        ]);
    }

    /**
     * Store a new unit price.
     */
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'measurement_unit_id' => 'required|exists:measurement_units,id',
            'price_per_unit' => 'required|numeric|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
            'minimum_order_quantity' => 'required|numeric|min:0.01',
            'maximum_order_quantity' => 'nullable|numeric|gt:minimum_order_quantity',
            'increment_step' => 'required|numeric|min:0.01',
            'pricing_type' => 'required|in:fixed,tiered,formula',
            'tiered_pricing' => 'nullable|array',
            'formula' => 'nullable|string|max:255',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'offer_start_date' => 'nullable|date',
            'offer_end_date' => 'nullable|date|after_or_equal:offer_start_date',
            'is_available' => 'boolean',
            'track_inventory' => 'boolean',
            'stock_quantity' => 'required_if:track_inventory,true|nullable|numeric|min:0',
            'low_stock_threshold' => 'nullable|numeric|min:0',
            'conversion_factor' => 'nullable|numeric|min:0',
            'base_unit_id' => 'nullable|exists:measurement_units,id',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array'
        ]);

        $validated['product_id'] = $product->id;

        // Set defaults
        $validated['discount_percentage'] = $validated['discount_percentage'] ?? 0;
        $validated['discount_amount'] = $validated['discount_amount'] ?? 0;
        $validated['increment_step'] = $validated['increment_step'] ?? 1;

        $unitPrice = ProductUnitPrice::create($validated);

        return redirect()->route('products.unit-prices.index', $product->id)
            ->with('success', 'Unit price added successfully.');
    }

    /**
     * Show form for editing unit price.
     */
    public function edit(Product $product, ProductUnitPrice $unitPrice)
    {
        $measurementUnits = MeasurementUnit::active()->ordered()->get();

        return Inertia::render('ProductUnitPrices/Edit', [
            'product' => $product,
            'unitPrice' => $unitPrice->load('measurementUnit', 'baseUnit'),
            'measurementUnits' => $measurementUnits
        ]);
    }

    /**
     * Update unit price.
     */
    public function update(Request $request, Product $product, ProductUnitPrice $unitPrice)
    {
        $validated = $request->validate([
            'measurement_unit_id' => 'required|exists:measurement_units,id',
            'price_per_unit' => 'required|numeric|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
            'minimum_order_quantity' => 'required|numeric|min:0.01',
            'maximum_order_quantity' => 'nullable|numeric|gt:minimum_order_quantity',
            'increment_step' => 'required|numeric|min:0.01',
            'pricing_type' => 'required|in:fixed,tiered,formula',
            'tiered_pricing' => 'nullable|array',
            'formula' => 'nullable|string|max:255',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'offer_start_date' => 'nullable|date',
            'offer_end_date' => 'nullable|date|after_or_equal:offer_start_date',
            'is_available' => 'boolean',
            'track_inventory' => 'boolean',
            'stock_quantity' => 'required_if:track_inventory,true|nullable|numeric|min:0',
            'low_stock_threshold' => 'nullable|numeric|min:0',
            'conversion_factor' => 'nullable|numeric|min:0',
            'base_unit_id' => 'nullable|exists:measurement_units,id',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array'
        ]);

        $unitPrice->update($validated);

        return redirect()->route('products.unit-prices.index', $product->id)
            ->with('success', 'Unit price updated successfully.');
    }

    /**
     * Delete unit price.
     */
    public function destroy(Product $product, ProductUnitPrice $unitPrice)
    {
        $unitPrice->delete();

        return redirect()->route('products.unit-prices.index', $product->id)
            ->with('success', 'Unit price deleted successfully.');
    }

    /**
     * Toggle availability.
     */
    public function toggleAvailability(Product $product, ProductUnitPrice $unitPrice)
    {
        $unitPrice->update([
            'is_available' => !$unitPrice->is_available
        ]);

        return redirect()->back()
            ->with('success', 'Availability updated successfully.');
    }

    /**
     * Update stock quantity.
     */
    public function updateStock(Request $request, Product $product, ProductUnitPrice $unitPrice)
    {
        $validated = $request->validate([
            'stock_quantity' => 'required|numeric|min:0',
            'adjustment_reason' => 'nullable|string'
        ]);

        $unitPrice->update([
            'stock_quantity' => $validated['stock_quantity']
        ]);

        // Log stock adjustment if needed
        // StockAdjustment::create([...]);

        return redirect()->back()
            ->with('success', 'Stock updated successfully.');
    }

    /**
     * Get price calculation for a quantity.
     */
    public function calculatePrice(Request $request, Product $product, ProductUnitPrice $unitPrice)
    {
        $request->validate([
            'quantity' => 'required|numeric|min:0.01'
        ]);

        $quantity = $request->quantity;

        // Check if quantity is valid
        if (!$unitPrice->isValidQuantity($quantity)) {
            return response()->json([
                'error' => 'Invalid quantity',
                'minimum' => $unitPrice->minimum_order_quantity,
                'maximum' => $unitPrice->maximum_order_quantity,
                'increment' => $unitPrice->increment_step
            ], 422);
        }

        // Calculate price based on pricing type
        if ($unitPrice->pricing_type === 'tiered') {
            $unitPrice_ = $unitPrice->getTieredPrice($quantity);
        } else {
            $unitPrice_ = $unitPrice->final_price;
        }

        $totalPrice = $unitPrice_ * $quantity;

        return response()->json([
            'quantity' => $quantity,
            'unit_price' => $unitPrice_,
            'total_price' => $totalPrice,
            'offer_active' => $unitPrice->offer_active,
            'effective' => $unitPrice->is_effective
        ]);
    }
}
