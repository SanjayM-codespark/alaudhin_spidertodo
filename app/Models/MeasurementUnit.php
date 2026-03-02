<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeasurementUnit extends Model
{
    protected $fillable = [
        'name',
        'code',
        'symbol',
        'type',
        'is_active',
        'description',
        'display_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer'
    ];

    // Scope for active units
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope for ordering by display order
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('name');
    }

    // Get units by type
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}
