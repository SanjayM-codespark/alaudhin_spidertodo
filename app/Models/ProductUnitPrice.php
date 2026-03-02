<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductUnitPrice extends Model
{
    // use SoftDeletes;

    protected $table = 'product_unit_prices';

    protected $fillable = [
        'product_id',
        'measurement_unit_id',
        'price_per_unit',
        'cost_per_unit',
        'minimum_order_quantity',
        'maximum_order_quantity',
        'increment_step',
        'pricing_type',
        'tiered_pricing',
        'formula',
        'discount_percentage',
        'discount_amount',
        'offer_start_date',
        'offer_end_date',
        'is_available',
        'track_inventory',
        'stock_quantity',
        'low_stock_threshold',
        'conversion_factor',
        'base_unit_id',
        'effective_from',
        'effective_to',
        'notes',
        'metadata'
    ];

    protected $casts = [
        'price_per_unit' => 'decimal:2',
        'cost_per_unit' => 'decimal:2',
        'minimum_order_quantity' => 'decimal:2',
        'maximum_order_quantity' => 'decimal:2',
        'increment_step' => 'decimal:2',
        'tiered_pricing' => 'array',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'offer_start_date' => 'date',
        'offer_end_date' => 'date',
        'is_available' => 'boolean',
        'track_inventory' => 'boolean',
        'stock_quantity' => 'decimal:2',
        'low_stock_threshold' => 'decimal:2',
        'conversion_factor' => 'decimal:4',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Get the product that owns this price
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the measurement unit for this price
     */
    public function measurementUnit()
    {
        return $this->belongsTo(MeasurementUnit::class);
    }

    /**
     * Get the base unit for conversion
     */
    public function baseUnit()
    {
        return $this->belongsTo(MeasurementUnit::class, 'base_unit_id');
    }

    /**
     * Calculate final price after discount
     */
    public function getFinalPriceAttribute()
    {
        $price = $this->price_per_unit;

        if ($this->discount_percentage > 0) {
            $price = $price * (1 - ($this->discount_percentage / 100));
        }

        if ($this->discount_amount > 0) {
            $price = $price - $this->discount_amount;
        }

        return max($price, 0); // Ensure price doesn't go negative
    }

    /**
     * Check if offer is currently active
     */
    public function getOfferActiveAttribute()
    {
        $today = now()->startOfDay();

        if (!$this->offer_start_date && !$this->offer_end_date) {
            return $this->discount_percentage > 0 || $this->discount_amount > 0;
        }

        if ($this->offer_start_date && $today < $this->offer_start_date) {
            return false;
        }

        if ($this->offer_end_date && $today > $this->offer_end_date) {
            return false;
        }

        return true;
    }

    /**
     * Check if price is currently effective
     */
    public function getIsEffectiveAttribute()
    {
        $today = now()->startOfDay();

        if ($this->effective_from && $today < $this->effective_from) {
            return false;
        }

        if ($this->effective_to && $today > $this->effective_to) {
            return false;
        }

        return true;
    }

    /**
     * Get tiered price for quantity
     */
    public function getTieredPrice($quantity)
    {
        if ($this->pricing_type !== 'tiered' || !$this->tiered_pricing) {
            return $this->final_price;
        }

        $tiers = collect($this->tiered_pricing)
            ->sortByDesc('min_quantity')
            ->filter(function ($tier) use ($quantity) {
                return $quantity >= ($tier['min_quantity'] ?? 0);
            });

        $applicableTier = $tiers->first();

        return $applicableTier['price'] ?? $this->final_price;
    }

    /**
     * Check if quantity is valid
     */
    public function isValidQuantity($quantity)
    {
        if ($quantity < $this->minimum_order_quantity) {
            return false;
        }

        if ($this->maximum_order_quantity && $quantity > $this->maximum_order_quantity) {
            return false;
        }

        if ($this->increment_step > 0) {
            $remainder = fmod($quantity, $this->increment_step);
            if (abs($remainder) > 0.0001) {
                return false;
            }
        }

        return true;
    }

    /**
     * Scope for available prices
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope for effective prices
     */
    public function scopeEffective($query)
    {
        $today = now()->startOfDay();

        return $query->where(function ($q) use ($today) {
            $q->whereNull('effective_from')
                ->orWhere('effective_from', '<=', $today);
        })->where(function ($q) use ($today) {
            $q->whereNull('effective_to')
                ->orWhere('effective_to', '>=', $today);
        });
    }

    /**
     * Scope with active offers
     */
    public function scopeWithActiveOffers($query)
    {
        $today = now()->startOfDay();

        return $query->where(function ($q) {
            $q->where('discount_percentage', '>', 0)
                ->orWhere('discount_amount', '>', 0);
        })->where(function ($q) use ($today) {
            $q->whereNull('offer_start_date')
                ->orWhere('offer_start_date', '<=', $today);
        })->where(function ($q) use ($today) {
            $q->whereNull('offer_end_date')
                ->orWhere('offer_end_date', '>=', $today);
        });
    }

    /**
     * Scope for low stock
     */
    public function scopeLowStock($query)
    {
        return $query->where('track_inventory', true)
            ->whereNotNull('low_stock_threshold')
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
    }
}
