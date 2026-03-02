<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    // use SoftDeletes;

    protected $fillable = [
        'name',
        'sku',
        'barcode',
        'description',
        'category',
        'brand',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Get the unit prices for this product
     */
    public function unitPrices()
    {
        return $this->hasMany(ProductUnitPrice::class);
    }

    /**
     * Get active unit prices
     */
    public function activeUnitPrices()
    {
        return $this->unitPrices()->where('is_available', true);
    }

    /**
     * Get the default unit price (lowest price or first)
     */
    public function defaultUnitPrice()
    {
        return $this->unitPrices()->orderBy('price_per_unit')->first();
    }

    /**
     * Scope for active products
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for searching products
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")
                ->orWhere('barcode', 'like', "%{$search}%")
                ->orWhere('category', 'like', "%{$search}%")
                ->orWhere('brand', 'like', "%{$search}%");
        });
    }

    /**
     * Scope by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope by brand
     */
    public function scopeByBrand($query, $brand)
    {
        return $query->where('brand', $brand);
    }

    /**
     * Get all available categories
     */
    public static function getCategories()
    {
        return self::select('category')
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');
    }

    /**
     * Get all available brands
     */
    public static function getBrands()
    {
        return self::select('brand')
            ->whereNotNull('brand')
            ->distinct()
            ->pluck('brand');
    }
}
