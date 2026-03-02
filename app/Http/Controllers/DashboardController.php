<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics as JSON (for API calls)
     */
    public function stats(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->role_type === 'admin';
        $isVendor = $user->role_type === 'vendor';

        if ($isAdmin) {
            // Admin stats - everything
            $stats = $this->getAdminStats();
            $recentOrders = $this->getRecentOrders();
            $recentActivities = $this->getRecentActivities();
        } else if ($isVendor) {
            // Vendor stats - only their orders
            $stats = $this->getVendorStats($user->id);
            $recentOrders = $this->getVendorRecentOrders($user->id);
            $recentActivities = []; // Vendors don't see activities
        } else {
            // Default fallback
            $stats = $this->getDefaultStats();
            $recentOrders = [];
            $recentActivities = [];
        }

        // Always return JSON for this endpoint
        return response()->json([
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'recentActivities' => $recentActivities
        ]);
    }

    /**
     * Get admin statistics
     */
    private function getAdminStats()
    {
        // Get current month's start and end
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Total orders
        $totalOrders = Order::count();
        $ordersThisMonth = Order::where('created_at', '>=', $startOfMonth)->count();
        $ordersLastMonth = Order::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

        // Total revenue
        $totalRevenue = Order::where('status', 'completed')->sum('total_amount') ?? 0;
        $revenueThisMonth = Order::where('status', 'completed')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('total_amount') ?? 0;
        $revenueLastMonth = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('total_amount') ?? 0;

        // Customers (unique customer names from orders)
        $totalCustomers = Order::distinct('customer_name')->count('customer_name');
        $customersThisMonth = Order::where('created_at', '>=', $startOfMonth)
            ->distinct('customer_name')
            ->count('customer_name');
        $customersLastMonth = Order::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->distinct('customer_name')
            ->count('customer_name');

        // Products
        $totalProducts = Product::count();
        $productsThisMonth = Product::where('created_at', '>=', $startOfMonth)->count();
        $productsLastMonth = Product::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

        // Order status counts
        $pendingOrders = Order::where('status', 'pending')->count();
        $processingOrders = Order::where('status', 'processing')->count();
        $completedOrders = Order::where('status', 'completed')->count();
        $cancelledOrders = Order::where('status', 'cancelled')->count();

        // Overdue orders
        $overdueOrders = Order::where('order_due_date', '<', now())
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        // Due today
        $dueToday = Order::whereDate('order_due_date', today())
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        return [
            'total_orders' => $totalOrders,
            'total_revenue' => number_format($totalRevenue, 2),
            'total_customers' => $totalCustomers,
            'total_products' => $totalProducts,
            'pending_orders' => $pendingOrders,
            'processing_orders' => $processingOrders,
            'completed_orders' => $completedOrders,
            'cancelled_orders' => $cancelledOrders,
            'overdue_orders' => $overdueOrders,
            'due_today' => $dueToday,
            'change_percentages' => [
                'orders' => $this->calculatePercentageChange($ordersLastMonth, $ordersThisMonth),
                'revenue' => $this->calculatePercentageChange($revenueLastMonth, $revenueThisMonth),
                'customers' => $this->calculatePercentageChange($customersLastMonth, $customersThisMonth),
                'products' => $this->calculatePercentageChange($productsLastMonth, $productsThisMonth),
            ]
        ];
    }

    /**
     * Get vendor statistics (only their orders)
     */
    private function getVendorStats($userId)
    {
        // Get current month's start and end
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Total orders for this vendor
        $totalOrders = Order::where('user_id', $userId)->count();
        $ordersThisMonth = Order::where('user_id', $userId)
            ->where('created_at', '>=', $startOfMonth)
            ->count();
        $ordersLastMonth = Order::where('user_id', $userId)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();

        // Total revenue for this vendor
        $totalRevenue = Order::where('user_id', $userId)
            ->where('status', 'completed')
            ->sum('total_amount') ?? 0;
        $revenueThisMonth = Order::where('user_id', $userId)
            ->where('status', 'completed')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('total_amount') ?? 0;
        $revenueLastMonth = Order::where('user_id', $userId)
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('total_amount') ?? 0;

        // Unique customers for this vendor (by customer_name)
        $totalCustomers = Order::where('user_id', $userId)
            ->whereNotNull('customer_name')
            ->distinct('customer_name')
            ->count('customer_name');

        // Order status counts for this vendor
        $pendingOrders = Order::where('user_id', $userId)->where('status', 'pending')->count();
        $processingOrders = Order::where('user_id', $userId)->where('status', 'processing')->count();
        $completedOrders = Order::where('user_id', $userId)->where('status', 'completed')->count();
        $cancelledOrders = Order::where('user_id', $userId)->where('status', 'cancelled')->count();

        // Overdue orders for this vendor
        $overdueOrders = Order::where('user_id', $userId)
            ->where('order_due_date', '<', now())
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        // Due today for this vendor
        $dueToday = Order::where('user_id', $userId)
            ->whereDate('order_due_date', today())
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        return [
            'total_orders' => $totalOrders,
            'total_revenue' => number_format($totalRevenue, 2),
            'total_customers' => $totalCustomers,
            'total_products' => 0, // Vendors don't have product access
            'pending_orders' => $pendingOrders,
            'processing_orders' => $processingOrders,
            'completed_orders' => $completedOrders,
            'cancelled_orders' => $cancelledOrders,
            'overdue_orders' => $overdueOrders,
            'due_today' => $dueToday,
            'change_percentages' => [
                'orders' => $this->calculatePercentageChange($ordersLastMonth, $ordersThisMonth),
                'revenue' => $this->calculatePercentageChange($revenueLastMonth, $revenueThisMonth),
                'customers' => 0, // Not calculating for vendors
                'products' => 0,
            ]
        ];
    }

    /**
     * Get default stats (fallback)
     */
    private function getDefaultStats()
    {
        return [
            'total_orders' => 0,
            'total_revenue' => '0.00',
            'total_customers' => 0,
            'total_products' => 0,
            'pending_orders' => 0,
            'processing_orders' => 0,
            'completed_orders' => 0,
            'cancelled_orders' => 0,
            'overdue_orders' => 0,
            'due_today' => 0,
            'change_percentages' => [
                'orders' => 0,
                'revenue' => 0,
                'customers' => 0,
                'products' => 0,
            ]
        ];
    }

    /**
     * Get recent orders for admin
     */
    private function getRecentOrders($limit = 5)
    {
        return Order::latest()
            ->take($limit)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name ?? 'Walk-in Customer',
                    'order_date' => $order->order_date,
                    'status' => $order->status,
                    'total_amount' => number_format($order->total_amount, 2),
                ];
            });
    }

    /**
     * Get recent orders for vendor
     */
    private function getVendorRecentOrders($userId, $limit = 5)
    {
        return Order::where('user_id', $userId)
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name ?? 'Walk-in Customer',
                    'order_date' => $order->order_date,
                    'status' => $order->status,
                    'total_amount' => number_format($order->total_amount, 2),
                ];
            });
    }

    /**
     * Get recent activities (admin only)
     */
    private function getRecentActivities($limit = 5)
    {
        $recentOrders = Order::latest()->take(3)->get();

        $activities = [];

        foreach ($recentOrders as $order) {
            $activities[] = [
                'icon' => '📦',
                'description' => "New order {$order->order_number} created",
                'time' => $order->created_at->diffForHumans(),
            ];
        }

        // Add some other activities
        $activities[] = [
            'icon' => '✏️',
            'description' => 'Product inventory updated',
            'time' => '2 hours ago',
        ];

        $activities[] = [
            'icon' => '📊',
            'description' => 'Monthly report generated',
            'time' => '5 hours ago',
        ];

        return $activities;
    }

    /**
     * Calculate percentage change between two values
     */
    private function calculatePercentageChange($oldValue, $newValue)
    {
        if ($oldValue == 0) {
            return $newValue > 0 ? 100 : 0;
        }

        return round((($newValue - $oldValue) / $oldValue) * 100, 1);
    }
}
