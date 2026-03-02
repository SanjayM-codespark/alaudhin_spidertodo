<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'measurement_unit_id',
        'quantity',
        'unit_price',
        'discount_percentage',
        'subtotal',
        'total',
        'product_name',
        'unit_name',
        'unit_code'
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the order that owns this item
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product for this item
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the measurement unit for this item
     */
    public function measurementUnit()
    {
        return $this->belongsTo(MeasurementUnit::class);
    }

    /**
     * Calculate item totals based on quantity
     */
    public function calculateTotals($quantity = null)
    {
        if ($quantity !== null) {
            $this->quantity = $quantity;
        }

        $this->subtotal = $this->quantity * $this->unit_price;
        $discountAmount = $this->subtotal * ($this->discount_percentage / 100);
        $this->total = $this->subtotal - $discountAmount;

        return [
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'subtotal' => $this->subtotal,
            'discount' => $discountAmount,
            'total' => $this->total
        ];
    }
}
