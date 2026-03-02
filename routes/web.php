<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MeasurementUnitController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductUnitPriceController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }

    return redirect()->route('dashboard');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'stats' => null,
        'recentOrders' => null,
        'recentActivities' => null
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// API route - returns JSON data
Route::get('/dashboard/stats', [DashboardController::class, 'stats'])
    ->middleware(['auth'])
    ->name('dashboard.stats');
// Profile routes - accessible to all authenticated users
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Orders routes - Organized for both roles
Route::middleware(['auth'])->prefix('orders')->name('orders.')->group(function () {

    // ==================== API/JSON ROUTES (Must come first) ====================
    Route::get('/api/products-with-prices', [OrderController::class, 'getProductsWithPrices'])->name('products-with-prices');
    Route::get('/api/search', [OrderController::class, 'searchOrders'])->name('search');

    // ==================== FILTER/SPECIAL ROUTES (Come before resource routes) ====================
    Route::get('/stats/today', [OrderController::class, 'getTodayStats'])->name('stats.today');
    Route::get('/stats/weekly', [OrderController::class, 'getWeeklyStats'])->name('stats.weekly');
    Route::get('/stats/monthly', [OrderController::class, 'getMonthlyStats'])->name('stats.monthly');
    Route::get('/filter/status/{status}', [OrderController::class, 'filterByStatus'])->name('filter.status');
    Route::get('/filter/date-range', [OrderController::class, 'filterByDateRange'])->name('filter.date-range');
    Route::get('/overdue', [OrderController::class, 'overdueOrders'])->name('overdue');
    Route::get('/due-today', [OrderController::class, 'dueToday'])->name('due-today');

    // ==================== CREATE ROUTE (Must come before {order} parameter) ====================
    Route::get('/create', [OrderController::class, 'create'])->name('create')->middleware('role:admin');

    // ==================== RESOURCE ROUTES (Routes with parameters go last) ====================
    // View routes (accessible to all)
    Route::get('/', [OrderController::class, 'index'])->name('index');
    Route::get('/{order}', [OrderController::class, 'show'])->name('show');

    // Admin only routes with parameters
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/', [OrderController::class, 'store'])->name('store');
        Route::get('/{order}/edit', [OrderController::class, 'edit'])->name('edit');
        Route::put('/{order}', [OrderController::class, 'update'])->name('update');
        Route::delete('/{order}', [OrderController::class, 'destroy'])->name('destroy');
        Route::post('/{order}/update-status', [OrderController::class, 'updateStatus'])->name('update-status');
        Route::post('/{order}/cancel', [OrderController::class, 'cancel'])->name('cancel');
        Route::post('/{order}/complete', [OrderController::class, 'complete'])->name('complete');
        Route::post('/{order}/recalculate', [OrderController::class, 'recalculateOrder'])->name('recalculate');
        Route::post('/{order}/extend-due-date', [OrderController::class, 'extendDueDate'])->name('extend-due-date');

        // Price calculations
        Route::post('/calculate-price', [OrderController::class, 'calculatePrice'])->name('calculate-price');

        // Bulk operations
        Route::post('/bulk-delete', [OrderController::class, 'bulkDelete'])->name('bulk-delete');
        Route::post('/bulk-update-status', [OrderController::class, 'bulkUpdateStatus'])->name('bulk-update-status');

        // Reports (Admin only)
        Route::get('/reports/daily', [OrderController::class, 'dailyReport'])->name('reports.daily');
        Route::get('/reports/monthly', [OrderController::class, 'monthlyReport'])->name('reports.monthly');
        Route::get('/reports/export', [OrderController::class, 'exportOrders'])->name('reports.export');
    });
});

// Master List routes - Admin only (no vendor access)
Route::middleware(['auth', 'role:admin'])->group(function () {
    // Measurement Units
    Route::resource('measurement-units', MeasurementUnitController::class);
    Route::post('/measurement-units/{measurementUnit}/toggle-active', [MeasurementUnitController::class, 'toggleActive'])->name('measurement-units.toggle-active');
    Route::post('/measurement-units/bulk-delete', [MeasurementUnitController::class, 'bulkDestroy'])->name('measurement-units.bulk-destroy');
    Route::get('/measurement-units/active/list', [MeasurementUnitController::class, 'getActiveUnits'])->name('measurement-units.active');

    // Products
    Route::resource('products', ProductController::class);
    Route::post('/products/{product}/toggle-active', [ProductController::class, 'toggleActive'])->name('products.toggle-active');
    Route::post('/products/bulk-delete', [ProductController::class, 'bulkDelete'])->name('products.bulk-delete');

    // Product Unit Prices Routes (Nested under Products)
    Route::prefix('products/{product}/unit-prices')->name('products.unit-prices.')->group(function () {
        Route::get('/', [ProductUnitPriceController::class, 'index'])->name('index');
        Route::get('/create', [ProductUnitPriceController::class, 'create'])->name('create');
        Route::post('/', [ProductUnitPriceController::class, 'store'])->name('store');
        Route::get('/{unitPrice}/edit', [ProductUnitPriceController::class, 'edit'])->name('edit');
        Route::put('/{unitPrice}', [ProductUnitPriceController::class, 'update'])->name('update');
        Route::delete('/{unitPrice}', [ProductUnitPriceController::class, 'destroy'])->name('destroy');

        // Custom routes for unit prices
        Route::post('/{unitPrice}/toggle-availability', [ProductUnitPriceController::class, 'toggleAvailability'])->name('toggle-availability');
        Route::post('/{unitPrice}/update-stock', [ProductUnitPriceController::class, 'updateStock'])->name('update-stock');
        Route::post('/bulk-update-prices', [ProductUnitPriceController::class, 'bulkUpdatePrices'])->name('bulk-update-prices');
    });
});

require __DIR__ . '/auth.php';
