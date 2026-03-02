<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    // use SoftDeletes;

    protected $fillable = [
        'order_number',
        'order_date',
        'order_due_date',
        'status',
        'customer_name',
        'subtotal',
        'discount_amount',
        'total_amount',
        'notes'
    ];

    protected $casts = [
        'order_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Get the items for this order
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Generate a unique order number
     */
    public static function generateOrderNumber()
    {
        $date = now()->format('Ymd');
        $lastOrder = self::whereDate('created_at', today())->count();
        $sequence = str_pad($lastOrder + 1, 4, '0', STR_PAD_LEFT);

        return 'ORD-' . $date . '-' . $sequence;
    }

    /**
     * Calculate order totals
     */
    public function calculateTotals()
    {
        $this->subtotal = $this->items->sum('subtotal');
        $this->total_amount = $this->subtotal - $this->discount_amount;
        $this->save();
    }

    /**
     * Scope for daily orders
     */
    public function scopeDaily($query, $date = null)
    {
        $date = $date ?? now()->toDateString();
        return $query->whereDate('order_date', $date);
    }

    /**
     * Scope for monthly orders
     */
    public function scopeMonthly($query, $year = null, $month = null)
    {
        $year = $year ?? now()->year;
        $month = $month ?? now()->month;
        return $query->whereYear('order_date', $year)->whereMonth('order_date', $month);
    }
}
