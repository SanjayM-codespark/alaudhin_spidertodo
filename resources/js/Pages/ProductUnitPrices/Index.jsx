import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ product, unitPrices, filters, pricingTypes }) {
    const { auth } = usePage().props;
    const [availabilityFilter, setAvailabilityFilter] = useState(filters.availability || 'all');
    const [pricingTypeFilter, setPricingTypeFilter] = useState(filters.pricing_type || 'all');
    const [selectedPrices, setSelectedPrices] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Handle filter changes
    const handleFilter = (key, value) => {
        router.get(
            route('products.unit-prices.index', product.id),
            { ...filters, [key]: value, page: 1 },
            { preserveState: true, replace: true }
        );
    };

    // Handle toggle availability
    const handleToggleAvailability = (id) => {
        router.post(route('products.unit-prices.toggle-availability', [product.id, id]), {}, {
            preserveScroll: true
        });
    };

    // Handle delete
    const handleDelete = (id, unitName) => {
        if (confirm(`Are you sure you want to delete this price for ${unitName}?`)) {
            router.delete(route('products.unit-prices.destroy', [product.id, id]));
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedPrices([]);
        } else {
            setSelectedPrices(unitPrices.data.map(price => price.id));
        }
        setSelectAll(!selectAll);
    };

    // Handle individual select
    const handleSelect = (id) => {
        setSelectedPrices(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(value);
    };

    // Check if offer is active
    const isOfferActive = (price) => {
        if (!price.offer_start_date && !price.offer_end_date) {
            return price.discount_percentage > 0 || price.discount_amount > 0;
        }

        const today = new Date();
        const startDate = price.offer_start_date ? new Date(price.offer_start_date) : null;
        const endDate = price.offer_end_date ? new Date(price.offer_end_date) : null;

        if (startDate && today < startDate) return false;
        if (endDate && today > endDate) return false;

        return price.discount_percentage > 0 || price.discount_amount > 0;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-amber-400 rounded-full" />
                    <div>
                        <h2 className="text-base font-semibold text-white/90 leading-tight">
                            Unit Prices - {product.name}
                        </h2>
                        <p className="text-xs text-slate-500 font-light tracking-wide mt-0.5">
                            Manage pricing per unit for this product
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`${product.name} - Unit Prices`} />

            <div className="min-h-screen bg-[#0a0b0f]">
                {/* Top gradient rule */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-8" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 space-y-6" style={{maxWidth:"975px"}}>
                    {/* Header with navigation and actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('products.show', product.id)}
                                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-400/20 transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h1 className="text-xl font-semibold text-white/90">Unit Prices</h1>
                                <span className="text-xs bg-white/5 text-slate-400 px-2 py-1 rounded-full border border-white/10">
                                    Total: {unitPrices.total}
                                </span>
                            </div>
                        </div>

                        <Link
                            href={route('products.unit-prices.create', product.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 rounded-xl text-amber-400 transition-all duration-200 group"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-sm font-medium">Add Unit Price</span>
                        </Link>
                    </div>

                    {/* Product Info Banner */}
                    <div className="relative rounded-xl bg-[#0f1117] border border-white/[0.06] p-4">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white/90 font-medium">{product.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    {product.sku && (
                                        <span className="text-xs text-slate-500">SKU: {product.sku}</span>
                                    )}
                                    {product.category && (
                                        <span className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">
                                            {product.category}
                                        </span>
                                    )}
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        product.is_active
                                            ? 'bg-emerald-400/10 text-emerald-400'
                                            : 'bg-slate-400/10 text-slate-400'
                                    }`}>
                                        {product.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                        <div className="p-4">
                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={availabilityFilter}
                                    onChange={(e) => handleFilter('availability', e.target.value)}
                                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 focus:outline-none focus:border-amber-400/30"
                                >
                                    <option value="all">All Availability</option>
                                    <option value="available">Available</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>

                                <select
                                    value={pricingTypeFilter}
                                    onChange={(e) => handleFilter('pricing_type', e.target.value)}
                                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 focus:outline-none focus:border-amber-400/30"
                                >
                                    <option value="all">All Pricing Types</option>
                                    {pricingTypes.map(type => (
                                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                    ))}
                                </select>

                                {(filters.availability !== 'all' || filters.pricing_type !== 'all') && (
                                    <button
                                        onClick={() => router.get(route('products.unit-prices.index', product.id))}
                                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-slate-300 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Unit Prices Table */}
                    <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/[0.06]">
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                className="rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400/20 focus:ring-offset-0"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Unit
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Price per Unit
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Min Order
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Increment
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Type
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Offer
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Available
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Stock
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Actions
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.06]">
                                    {unitPrices.data.length > 0 ? (
                                        unitPrices.data.map((price) => (
                                            <tr key={price.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPrices.includes(price.id)}
                                                        onChange={() => handleSelect(price.id)}
                                                        className="rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400/20 focus:ring-offset-0"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mr-3">
                                                            <span className="text-xs font-semibold">
                                                                {price.measurement_unit?.symbol || price.measurement_unit?.code?.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-white/90">
                                                                {price.measurement_unit?.name}
                                                            </div>
                                                            <div className="text-xs text-slate-500 font-mono">
                                                                {price.measurement_unit?.code}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-white/90">
                                                        {formatCurrency(price.price_per_unit)}
                                                    </div>
                                                    {price.cost_per_unit && (
                                                        <div className="text-xs text-slate-500">
                                                            Cost: {formatCurrency(price.cost_per_unit)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-400">
                                                        {price.minimum_order_quantity}
                                                    </span>
                                                    {price.maximum_order_quantity && (
                                                        <div className="text-xs text-slate-500">
                                                            Max: {price.maximum_order_quantity}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-400">
                                                        {price.increment_step}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs bg-white/5 text-slate-400 px-2 py-1 rounded-full border border-white/10">
                                                        {price.pricing_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isOfferActive(price) ? (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs bg-emerald-400/10 text-emerald-400 px-2 py-1 rounded-full">
                                                                {price.discount_percentage > 0 ? `${price.discount_percentage}% off` : ''}
                                                                {price.discount_amount > 0 ? formatCurrency(price.discount_amount) + ' off' : ''}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-600">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleToggleAvailability(price.id)}
                                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                                                            price.is_available ? 'bg-emerald-400/20' : 'bg-white/10'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
                                                                price.is_available
                                                                    ? 'translate-x-5 bg-emerald-400'
                                                                    : 'translate-x-1 bg-slate-500'
                                                            }`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {price.track_inventory ? (
                                                        <div>
                                                            <span className={`text-sm ${
                                                                price.stock_quantity <= price.low_stock_threshold
                                                                    ? 'text-red-400'
                                                                    : 'text-slate-400'
                                                            }`}>
                                                                {price.stock_quantity}
                                                            </span>
                                                            {price.low_stock_threshold && (
                                                                <div className="text-xs text-slate-500">
                                                                    Low: {price.low_stock_threshold}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-600">Not tracked</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={route('products.unit-prices.edit', [product.id, price.id])}
                                                            className="p-2 text-slate-500 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(price.id, price.measurement_unit?.name)}
                                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center mb-4">
                                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-slate-500 text-sm font-light">No unit prices found</p>
                                                    <p className="text-slate-700 text-xs mt-1">Get started by adding a unit price for this product</p>
                                                    <Link
                                                        href={route('products.unit-prices.create', product.id)}
                                                        className="mt-4 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-lg text-amber-400 text-sm hover:bg-amber-400/15 transition-colors"
                                                    >
                                                        Add Unit Price
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {unitPrices.links && unitPrices.total > unitPrices.per_page && (
                            <div className="px-6 py-4 border-t border-white/[0.06]">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-500">
                                        Showing {unitPrices.from} to {unitPrices.to} of {unitPrices.total} results
                                    </p>
                                    <div className="flex gap-2">
                                        {unitPrices.links.map((link, index) => {
                                            if (index === 0 || index === unitPrices.links.length - 1) return null;
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => router.get(link.url)}
                                                    disabled={!link.url}
                                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                                        link.active
                                                            ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                                                            : 'text-slate-500 hover:text-slate-400 hover:bg-white/5'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
