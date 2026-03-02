import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Create({ product, measurementUnits }) {
    const { auth } = usePage().props;
    const [selectedUnit, setSelectedUnit] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        measurement_unit_id: '',
        price_per_unit: '',
        cost_per_unit: '',
        minimum_order_quantity: 1,
        maximum_order_quantity: '',
        increment_step: 1,
        pricing_type: 'fixed',
        tiered_pricing: [],
        offer_start_date: '',
        offer_end_date: '',
        is_available: true,
        effective_from: '',
        effective_to: '',
        notes: '',
        metadata: {}
    });

    // Update selected unit when measurement_unit_id changes
    useEffect(() => {
        if (data.measurement_unit_id) {
            const unit = measurementUnits.find(u => u.id === parseInt(data.measurement_unit_id));
            setSelectedUnit(unit);
        } else {
            setSelectedUnit(null);
        }
    }, [data.measurement_unit_id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('products.unit-prices.store', product.id));
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-amber-400 rounded-full" />
                    <div>
                        <h2 className="text-base font-semibold text-white/90 leading-tight">
                            Add Unit Price - {product.name}
                        </h2>
                        <p className="text-xs text-slate-500 font-light tracking-wide mt-0.5">
                            Configure pricing for a specific unit
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Add Unit Price - ${product.name}`} />

            <div className="min-h-screen bg-[#0a0b0f]">
                {/* Top gradient rule */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-8" />

                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-12">
                    {/* Form Card */}
                    <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                        {/* Header with back button */}
                        <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('products.unit-prices.index', product.id)}
                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-400/20 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Link>
                                <div>
                                    <h3 className="text-lg font-semibold text-white/90">New Unit Price</h3>
                                    <p className="text-xs text-slate-600 font-light mt-0.5">Configure pricing for {product.name}</p>
                                </div>
                            </div>

                            {/* Availability indicator */}
                            <div className={`px-3 py-1.5 rounded-lg border ${data.is_available ? 'bg-emerald-400/10 border-emerald-400/20' : 'bg-slate-400/10 border-slate-400/20'}`}>
                                <span className={`text-xs font-medium ${data.is_available ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    {data.is_available ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Basic Information Section */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-white/80 border-b border-white/[0.06] pb-2">Basic Information</h4>

                                {/* Measurement Unit Selection */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Measurement Unit <span className="text-amber-400">*</span>
                                    </label>
                                    <select
                                        value={data.measurement_unit_id}
                                        onChange={e => setData('measurement_unit_id', e.target.value)}
                                        className={`w-full px-4 py-3 bg-white/5 border ${errors.measurement_unit_id ? 'border-red-400/30' : 'border-white/10'} rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all`}
                                    >
                                        <option value="" className="bg-[#0f1117]">Select a unit</option>
                                        {measurementUnits.map(unit => (
                                            <option key={unit.id} value={unit.id} className="bg-[#0f1117]">
                                                {unit.name} ({unit.code}) - {unit.type}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.measurement_unit_id && (
                                        <p className="text-xs text-red-400 mt-1">{errors.measurement_unit_id}</p>
                                    )}
                                </div>

                                {/* Selected Unit Info */}
                                {selectedUnit && (
                                    <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                                                <span className="text-amber-400 text-sm font-semibold">
                                                    {selectedUnit.symbol || selectedUnit.code?.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-white/80">{selectedUnit.name}</p>
                                                <p className="text-xs text-slate-500">Type: {selectedUnit.type} | Code: {selectedUnit.code}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pricing Section */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-white/80 border-b border-white/[0.06] pb-2">Pricing</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Price per Unit */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Price per Unit (₹) <span className="text-amber-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price_per_unit}
                                            onChange={e => setData('price_per_unit', e.target.value)}
                                            placeholder="0.00"
                                            className={`w-full px-4 py-3 bg-white/5 border ${errors.price_per_unit ? 'border-red-400/30' : 'border-white/10'} rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all`}
                                        />
                                        {errors.price_per_unit && (
                                            <p className="text-xs text-red-400 mt-1">{errors.price_per_unit}</p>
                                        )}
                                    </div>

                                    {/* Cost per Unit */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Cost per Unit (₹) <span className="text-slate-600">(optional)</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.cost_per_unit}
                                            onChange={e => setData('cost_per_unit', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Fixed Pricing Type (hidden but set) */}
                                <input type="hidden" name="pricing_type" value="fixed" />
                            </div>

                            {/* Order Constraints Section */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-white/80 border-b border-white/[0.06] pb-2">Order Constraints</h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Minimum Order Quantity */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Min Order Qty <span className="text-amber-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={data.minimum_order_quantity}
                                            onChange={e => setData('minimum_order_quantity', e.target.value)}
                                            className={`w-full px-4 py-3 bg-white/5 border ${errors.minimum_order_quantity ? 'border-red-400/30' : 'border-white/10'} rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30`}
                                        />
                                    </div>

                                    {/* Maximum Order Quantity */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Max Order Qty
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.maximum_order_quantity}
                                            onChange={e => setData('maximum_order_quantity', e.target.value)}
                                            placeholder="Unlimited"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                        />
                                    </div>

                                    {/* Increment Step */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Increment Step <span className="text-amber-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={data.increment_step}
                                            onChange={e => setData('increment_step', e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Offer Date Range */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-white/80 border-b border-white/[0.06] pb-2">Offers</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Offer Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.offer_start_date}
                                            onChange={e => setData('offer_start_date', e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Offer End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.offer_end_date}
                                            onChange={e => setData('offer_end_date', e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Effective Date Range */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-white/80 border-b border-white/[0.06] pb-2">Effective Period</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Effective From
                                        </label>
                                        <input
                                            type="date"
                                            value={data.effective_from}
                                            onChange={e => setData('effective_from', e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Effective To
                                        </label>
                                        <input
                                            type="date"
                                            value={data.effective_to}
                                            onChange={e => setData('effective_to', e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Notes
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    placeholder="Additional notes about this pricing..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all resize-none"
                                />
                            </div>

                            {/* Price Summary Preview */}
                            {data.price_per_unit && (
                                <div className="relative rounded-xl bg-white/3 border border-white/5 p-4">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Price Summary</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500">Price per Unit</p>
                                            <p className="text-sm text-white/90">{formatCurrency(data.price_per_unit)}</p>
                                        </div>
                                        {data.cost_per_unit && (
                                            <div>
                                                <p className="text-xs text-slate-500">Cost per Unit</p>
                                                <p className="text-sm text-slate-400">{formatCurrency(data.cost_per_unit)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                                <Link
                                    href={route('products.unit-prices.index', product.id)}
                                    className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-slate-300 hover:bg-white/10 transition-all duration-200"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 rounded-xl text-amber-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span>Create Unit Price</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
