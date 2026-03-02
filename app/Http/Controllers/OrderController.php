<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with('items.product', 'items.measurementUnit');

        $user = Auth::user();
        $isVendor = $user->role_type === 'vendor';

        // For vendors, we need to filter by something - what associates orders with vendors?
        // If there's no vendor association, vendors will see all orders (read-only)
        // Remove this section if vendors should see all orders
        if ($isVendor) {
            // If you have a way to identify vendor-specific orders, add it here
            // For example: $query->where('vendor_id', $user->vendor_id);
            // If not, just remove this condition or leave it empty
        }

        // Date range filters (default to last 7 days)
        if ($request->filled('date_from')) {
            $query->whereDate('order_date', '>=', $request->date_from);
        } else {
            $query->whereDate('order_date', '>=', now()->subDays(7)->toDateString());
        }

        if ($request->filled('date_to')) {
            $query->whereDate('order_date', '<=', $request->date_to);
        } else {
            $query->whereDate('order_date', '<=', now()->toDateString());
        }

        // Single date filter (overrides date range if both are present)
        if ($request->filled('date')) {
            $query->whereDate('order_date', $request->date);
        }

        // Due date filter
        if ($request->filled('due_date')) {
            $query->whereDate('order_due_date', $request->due_date);
        }

        // Due today filter
        if ($request->boolean('due_today')) {
            $query->whereDate('order_due_date', now()->toDateString())
                  ->whereNotIn('status', ['completed', 'cancelled']);
        }

        // Overdue filter
        if ($request->boolean('overdue')) {
            $query->where('order_due_date', '<', now())
                  ->whereNotIn('status', ['completed', 'cancelled']);
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by order number or customer
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'ILIKE', "%{$search}%")
                    ->orWhere('customer_name', 'ILIKE', "%{$search}%");
            });
        }

        $orders = $query->orderBy('order_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get daily stats for the dashboard widgets
        $dailyStats = [
            'total_orders' => Order::whereDate('order_date', now()->toDateString())->count(),
            'total_revenue' => Order::whereDate('order_date', now()->toDateString())->sum('total_amount'),
            'average_order' => Order::whereDate('order_date', now()->toDateString())->avg('total_amount') ?? 0,
            'due_today' => Order::whereDate('order_due_date', now()->toDateString())->count(),
            'overdue' => Order::where('order_due_date', '<', now())
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->count()
        ];

        // Prepare filters for frontend
        $filters = $request->only([
            'date',
            'due_date',
            'status',
            'search',
            'overdue',
            'due_today',
            'date_from',
            'date_to'
        ]);

        // Ensure date range is set for frontend
        if (!isset($filters['date_from'])) {
            $filters['date_from'] = now()->subDays(7)->toDateString();
        }
        if (!isset($filters['date_to'])) {
            $filters['date_to'] = now()->toDateString();
        }

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'dailyStats' => $dailyStats,
            'filters' => $filters,
            'statuses' => ['draft', 'pending', 'confirmed', 'processing', 'completed', 'cancelled']
        ]);
    }

    /**
     * Show form for creating new order.
     */
    public function create()
    {
        // Check if user is admin (vendors cannot create orders)
        if (Auth::user()->role_type !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $products = Product::with(['unitPrices' => function ($query) {
            $query->where('is_available', true);
        }, 'unitPrices.measurementUnit'])->active()->get();

        return Inertia::render('Orders/Create', [
            'products' => $products
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        // Check if user is admin
        if (Auth::user()->role_type !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'order_due_date' => 'nullable|date|after_or_equal:today',
            'status' => 'required|in:draft,pending,confirmed,processing,completed,cancelled',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.measurement_unit_id' => 'required|exists:measurement_units,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
            'items.*.product_name' => 'required|string',
            'items.*.unit_name' => 'required|string',
            'items.*.unit_code' => 'required|string',
            'discount_amount' => 'nullable|numeric|min:0'
        ]);

        try {
            DB::beginTransaction();

            // Create order
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'order_date' => now(),
                'order_due_date' => $validated['order_due_date'] ?? null,
                'status' => $validated['status'],
                'customer_name' => $validated['customer_name'] ?? null,
                'subtotal' => 0,
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'total_amount' => 0,
                'notes' => $validated['notes'] ?? null
            ]);

            // Create order items
            foreach ($validated['items'] as $item) {
                $subtotal = $item['quantity'] * $item['unit_price'];
                $discountAmount = $subtotal * (($item['discount_percentage'] ?? 0) / 100);
                $total = $subtotal - $discountAmount;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'measurement_unit_id' => $item['measurement_unit_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount_percentage' => $item['discount_percentage'] ?? 0,
                    'subtotal' => $subtotal,
                    'total' => $total,
                    'product_name' => $item['product_name'],
                    'unit_name' => $item['unit_name'],
                    'unit_code' => $item['unit_code']
                ]);
            }

            // Calculate order totals
            $order->calculateTotals();

            DB::commit();

            return redirect()->route('orders.index')
                ->with('success', 'Order created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create order: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        // Add this check to prevent 'create' from being treated as an ID
        if (request()->route('order') === 'create') {
            abort(404);
        }

        $order->load('items.product', 'items.measurementUnit');

        // Check if order is overdue
        $isOverdue = $order->order_due_date &&
            $order->order_due_date < now() &&
            !in_array($order->status, ['completed', 'cancelled']);

        return Inertia::render('Orders/Show', [
            'order' => $order,
            'isOverdue' => $isOverdue
        ]);
    }

    /**
     * Show form for editing order.
     */
    public function edit(Order $order)
    {
        // Check if user is admin
        if (Auth::user()->role_type !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $order->load('items');
        $products = Product::with(['unitPrices' => function ($query) {
            $query->where('is_available', true);
        }, 'unitPrices.measurementUnit'])->active()->get();

        return Inertia::render('Orders/Edit', [
            'order' => $order,
            'products' => $products
        ]);
    }

    /**
     * Update the specified order.
     */
    public function update(Request $request, Order $order)
    {
        // Check if user is admin
        if (Auth::user()->role_type !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'order_due_date' => 'nullable|date',
            'status' => 'required|in:draft,pending,confirmed,processing,completed,cancelled',
            'notes' => 'nullable|string',
            'discount_amount' => 'nullable|numeric|min:0'
        ]);

        try {
            DB::beginTransaction();

            $order->update([
                'status' => $validated['status'],
                'customer_name' => $validated['customer_name'] ?? $order->customer_name,
                'order_due_date' => $validated['order_due_date'] ?? $order->order_due_date,
                'discount_amount' => $validated['discount_amount'] ?? $order->discount_amount,
                'notes' => $validated['notes'] ?? $order->notes
            ]);

            $order->calculateTotals();

            DB::commit();

            return redirect()->route('orders.index')
                ->with('success', 'Order updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update order: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified order.
     */
    public function destroy(Order $order)
    {
        // Check if user is admin
        if (Auth::user()->role_type !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        try {
            DB::beginTransaction();

            // Delete order items first
            $order->items()->delete();
            // Delete order
            $order->delete();

            DB::commit();

            return redirect()->route('orders.index')
                ->with('success', 'Order deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete order: ' . $e->getMessage());
        }
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, Order $order)
    {
        // Check if user is admin
        if (Auth::user()->role_type !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'status' => 'required|in:draft,pending,confirmed,processing,completed,cancelled'
        ]);

        $order->update(['status' => $request->status]);

        return redirect()->back()
            ->with('success', 'Order status updated successfully.');
    }

    /**
     * Get products with their unit prices for API
     */
    public function getProductsWithPrices()
    {
        $products = Product::with(['unitPrices' => function ($query) {
            $query->where('is_available', true);
        }, 'unitPrices.measurementUnit'])->active()->get();

        return response()->json($products);
    }

    /**
     * Calculate price based on product, unit and quantity
     */
    public function calculatePrice(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'measurement_unit_id' => 'required|exists:measurement_units,id',
            'quantity' => 'required|numeric|min:0.01'
        ]);

        $product = Product::find($request->product_id);
        $unitPrice = $product->unitPrices()
            ->where('measurement_unit_id', $request->measurement_unit_id)
            ->where('is_available', true)
            ->first();

        if (!$unitPrice) {
            return response()->json(['error' => 'Unit price not found'], 404);
        }

        $finalPrice = $unitPrice->final_price;
        $subtotal = $request->quantity * $finalPrice;

        return response()->json([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_id' => $unitPrice->measurement_unit_id,
            'unit_name' => $unitPrice->measurementUnit->name,
            'unit_code' => $unitPrice->measurementUnit->code,
            'unit_price' => $finalPrice,
            'quantity' => $request->quantity,
            'subtotal' => $subtotal,
            'discount_percentage' => $unitPrice->discount_percentage,
            'discount_amount' => $unitPrice->discount_amount,
            'total' => $subtotal * (1 - $unitPrice->discount_percentage / 100) - $unitPrice->discount_amount
        ]);
    }

    /**
     * Get overdue orders
     */
    public function overdueOrders(Request $request)
    {
        $query = Order::with('items.product')
            ->where('order_due_date', '<', now())
            ->whereNotIn('status', ['completed', 'cancelled']);

        $overdueOrders = $query->orderBy('order_due_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Orders/Overdue', [
            'orders' => $overdueOrders
        ]);
    }

    /**
     * Get orders due today
     */
    public function dueToday(Request $request)
    {
        $query = Order::with('items.product')
            ->whereDate('order_due_date', now()->toDateString())
            ->whereNotIn('status', ['completed', 'cancelled']);

        $dueToday = $query->orderBy('order_due_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Orders/DueToday', [
            'orders' => $dueToday
        ]);
    }

    /**
     * Extend due date
     */
    public function extendDueDate(Request $request, Order $order)
    {
        // Check if user is admin
        if (Auth::user()->role_type !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'new_due_date' => 'required|date|after:today'
        ]);

        $order->update([
            'order_due_date' => $request->new_due_date
        ]);

        return redirect()->back()
            ->with('success', 'Due date extended successfully.');
    }
}
