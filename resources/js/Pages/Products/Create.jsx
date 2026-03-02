import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Create() {
    const { auth } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        category: '',
        brand: '',
        is_active: true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('products.store'));
    };

    // Common category suggestions
    const categorySuggestions = [
        'Electronics', 'Clothing', 'Food & Beverages', 'Furniture',
        'Automotive', 'Books', 'Toys', 'Sports', 'Beauty', 'Healthcare',
        'Home & Garden', 'Office Supplies', 'Pet Supplies', 'Jewelry'
    ];

    // Common brand suggestions
    const brandSuggestions = [
        'Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Microsoft',
        'Dell', 'HP', 'Lenovo', 'Coca-Cola', 'Pepsi', 'Nestle', 'P&G',
        'Unilever', 'Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes'
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-amber-400 rounded-full" />
                    <div>
                        <h2 className="text-base font-semibold text-white/90 leading-tight">
                            Create Product
                        </h2>
                        <p className="text-xs text-slate-500 font-light tracking-wide mt-0.5">
                            Add a new product to your catalog
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Create Product" />

            <div className="min-h-screen bg-[#0a0b0f]">
                {/* Top gradient rule */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-8" />

                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-12">
                    {/* Form Card */}
                    <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                        {/* Header with back button */}
                        <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('products.index')}
                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-400/20 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Link>
                                <div>
                                    <h3 className="text-lg font-semibold text-white/90">New Product</h3>
                                    <p className="text-xs text-slate-600 font-light mt-0.5">Fill in the product details below</p>
                                </div>
                            </div>

                            {/* Status indicator */}
                            <div className={`px-3 py-1.5 rounded-lg border ${data.is_active ? 'bg-emerald-400/10 border-emerald-400/20' : 'bg-slate-400/10 border-slate-400/20'}`}>
                                <span className={`text-xs font-medium ${data.is_active ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    {data.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Product Name */}
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Product Name <span className="text-amber-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g., Wireless Headphones, Cotton T-Shirt, Coffee Mug"
                                    className={`w-full px-4 py-3 bg-white/5 border ${errors.name ? 'border-red-400/30' : 'border-white/10'} rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all`}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* SKU & Barcode Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* SKU Field */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        SKU <span className="text-slate-600">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.sku}
                                        onChange={e => setData('sku', e.target.value.toUpperCase())}
                                        placeholder="e.g., TS-BLK-M-001"
                                        className={`w-full px-4 py-3 bg-white/5 border ${errors.sku ? 'border-red-400/30' : 'border-white/10'} rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all uppercase`}
                                    />
                                    {errors.sku && (
                                        <p className="text-xs text-red-400 mt-1">{errors.sku}</p>
                                    )}
                                </div>

                                {/* Barcode Field */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Barcode <span className="text-slate-600">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.barcode}
                                        onChange={e => setData('barcode', e.target.value)}
                                        placeholder="e.g., 123456789012"
                                        className={`w-full px-4 py-3 bg-white/5 border ${errors.barcode ? 'border-red-400/30' : 'border-white/10'} rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all`}
                                    />
                                    {errors.barcode && (
                                        <p className="text-xs text-red-400 mt-1">{errors.barcode}</p>
                                    )}
                                </div>
                            </div>

                            {/* Category & Brand Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Category Field with suggestions */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Category <span className="text-slate-600">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.category}
                                            onChange={e => setData('category', e.target.value)}
                                            placeholder="e.g., Electronics, Clothing"
                                            list="category-suggestions"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all"
                                        />
                                        <datalist id="category-suggestions">
                                            {categorySuggestions.map(category => (
                                                <option key={category} value={category} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>

                                {/* Brand Field with suggestions */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Brand <span className="text-slate-600">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.brand}
                                            onChange={e => setData('brand', e.target.value)}
                                            placeholder="e.g., Apple, Nike, Sony"
                                            list="brand-suggestions"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all"
                                        />
                                        <datalist id="brand-suggestions">
                                            {brandSuggestions.map(brand => (
                                                <option key={brand} value={brand} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>
                            </div>

                            {/* Description Field */}
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Description <span className="text-slate-600">(optional)</span>
                                </label>
                                <textarea
                                    rows="4"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Enter a detailed description of the product..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all resize-none"
                                />
                            </div>

                            {/* Active Status */}
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Status
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setData('is_active', true)}
                                        className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-200 ${
                                            data.is_active
                                                ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-400'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Active</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('is_active', false)}
                                        className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-200 ${
                                            !data.is_active
                                                ? 'bg-slate-400/10 border-slate-400/20 text-slate-400'
                                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-400'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            <span className="text-sm">Inactive</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div className="relative rounded-xl bg-white/3 border border-white/5 p-4 mt-6">
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Preview</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/90 font-medium">{data.name || 'Product Name'}</span>
                                            {data.sku && (
                                                <span className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                                                    {data.sku}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {data.category && (
                                                <span className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">
                                                    {data.category}
                                                </span>
                                            )}
                                            {data.brand && (
                                                <span className="text-xs text-slate-500">
                                                    {data.brand}
                                                </span>
                                            )}
                                        </div>
                                        {data.description && (
                                            <p className="text-xs text-slate-600 mt-2 line-clamp-1">
                                                {data.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                                <Link
                                    href={route('products.index')}
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
                                            <span>Create Product</span>
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
