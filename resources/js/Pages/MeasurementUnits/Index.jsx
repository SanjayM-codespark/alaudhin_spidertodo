import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ units, filters, types }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Handle search with debounce
    const handleSearch = (value) => {
        setSearch(value);
        const timeout = setTimeout(() => {
            router.get(
                route('measurement-units.index'),
                { ...filters, search: value, page: 1 },
                { preserveState: true, replace: true }
            );
        }, 500);
        return () => clearTimeout(timeout);
    };

    // Handle filter changes
    const handleFilter = (key, value) => {
        router.get(
            route('measurement-units.index'),
            { ...filters, [key]: value, page: 1 },
            { preserveState: true, replace: true }
        );
    };

    // Handle sort
    const handleSort = (field) => {
        const direction = filters.sort_field === field && filters.sort_direction === 'asc' ? 'desc' : 'asc';
        router.get(
            route('measurement-units.index'),
            { ...filters, sort_field: field, sort_direction: direction },
            { preserveState: true, replace: true }
        );
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        if (selectedUnits.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedUnits.length} selected unit(s)?`)) {
            router.post(route('measurement-units.bulk-destroy'), {
                ids: selectedUnits
            }, {
                onSuccess: () => {
                    setSelectedUnits([]);
                    setSelectAll(false);
                }
            });
        }
    };

    // Handle individual delete
    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            router.delete(route('measurement-units.destroy', id));
        }
    };

    // Handle toggle active
    const handleToggleActive = (id) => {
        router.post(route('measurement-units.toggle-active', id), {}, {
            preserveScroll: true
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedUnits([]);
        } else {
            setSelectedUnits(units.data.map(unit => unit.id));
        }
        setSelectAll(!selectAll);
    };

    // Handle individual select
    const handleSelect = (id) => {
        setSelectedUnits(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Sort indicator component
    const SortIcon = ({ field }) => {
        if (filters.sort_field !== field) return null;
        return (
            <svg className={`w-3.5 h-3.5 ml-1 inline-block transition-transform ${filters.sort_direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-amber-400 rounded-full" />
                    <div>
                        <h2 className="text-base font-semibold text-white/90 leading-tight">
                            Measurement Units
                        </h2>
                        <p className="text-xs text-slate-500 font-light tracking-wide mt-0.5">
                            Manage your measurement units & conversions
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Measurement Units" />

            <div className="min-h-screen bg-[#0a0b0f]">
                {/* Top gradient rule */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-8" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 space-y-6" style={{maxWidth:"975px"}}>
                    {/* Header with actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-semibold text-white/90">Measurement Units</h1>
                            <span className="text-xs bg-white/5 text-slate-400 px-2 py-1 rounded-full border border-white/10">
                                Total: {units.total}
                            </span>
                        </div>

                        <Link
                            href={route('measurement-units.create')}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 rounded-xl text-amber-400 transition-all duration-200 group"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-sm font-medium">Add New Unit</span>
                        </Link>
                    </div>

                    {/* Filters Bar */}
                    <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                        <div className="p-4 space-y-4">
                            {/* Search and bulk actions */}
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <div className="relative flex-1 max-w-md">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Search units by name, code or type..."
                                        className="block w-full pl-10 pr-3 py-2 border border-white/10 bg-white/5 rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all"
                                    />
                                </div>

                                {selectedUnits.length > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center gap-2 px-3 py-2 bg-red-400/10 hover:bg-red-400/15 border border-red-400/20 rounded-xl text-red-400 transition-all duration-200 text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Delete Selected ({selectedUnits.length})</span>
                                    </button>
                                )}
                            </div>

                            {/* Filter chips */}
                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={typeFilter}
                                    onChange={(e) => handleFilter('type', e.target.value)}
                                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 focus:outline-none focus:border-amber-400/30"
                                >
                                    <option value="all">All Types</option>
                                    {types.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleFilter('status', e.target.value)}
                                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 focus:outline-none focus:border-amber-400/30"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>

                                {(filters.search || filters.type !== 'all' || filters.status !== 'all') && (
                                    <button
                                        onClick={() => router.get(route('measurement-units.index'))}
                                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-slate-300 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Units Table */}
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
                                            <button
                                                onClick={() => handleSort('name')}
                                                className="text-xs font-medium text-slate-500 hover:text-slate-400 uppercase tracking-wider flex items-center"
                                            >
                                                Name <SortIcon field="name" />
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <button
                                                onClick={() => handleSort('code')}
                                                className="text-xs font-medium text-slate-500 hover:text-slate-400 uppercase tracking-wider flex items-center"
                                            >
                                                Code <SortIcon field="code" />
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <button
                                                onClick={() => handleSort('symbol')}
                                                className="text-xs font-medium text-slate-500 hover:text-slate-400 uppercase tracking-wider flex items-center"
                                            >
                                                Symbol <SortIcon field="symbol" />
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <button
                                                onClick={() => handleSort('type')}
                                                className="text-xs font-medium text-slate-500 hover:text-slate-400 uppercase tracking-wider flex items-center"
                                            >
                                                Type <SortIcon field="type" />
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <button
                                                onClick={() => handleSort('is_active')}
                                                className="text-xs font-medium text-slate-500 hover:text-slate-400 uppercase tracking-wider flex items-center"
                                            >
                                                Status <SortIcon field="is_active" />
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <button
                                                onClick={() => handleSort('display_order')}
                                                className="text-xs font-medium text-slate-500 hover:text-slate-400 uppercase tracking-wider flex items-center"
                                            >
                                                Order <SortIcon field="display_order" />
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.06]">
                                    {units.data.length > 0 ? (
                                        units.data.map((unit) => (
                                            <tr key={unit.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUnits.includes(unit.id)}
                                                        onChange={() => handleSelect(unit.id)}
                                                        className="rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400/20 focus:ring-offset-0"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mr-3">
                                                            <span className="text-xs font-semibold uppercase">
                                                                {unit.symbol || unit.code?.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-white/90">
                                                                {unit.name}
                                                            </div>
                                                            {unit.description && (
                                                                <div className="text-xs text-slate-600 font-light mt-0.5 line-clamp-1">
                                                                    {unit.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-400 font-mono">
                                                        {unit.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-400">
                                                        {unit.symbol || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs bg-white/5 text-slate-400 px-2.5 py-1 rounded-full border border-white/10">
                                                        {unit.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleToggleActive(unit.id)}
                                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                                                            unit.is_active ? 'bg-emerald-400/20' : 'bg-white/10'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
                                                                unit.is_active
                                                                    ? 'translate-x-5 bg-emerald-400'
                                                                    : 'translate-x-1 bg-slate-500'
                                                            }`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-400">
                                                        {unit.display_order}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={route('measurement-units.show', unit.id)}
                                                            className="p-2 text-slate-500 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </Link>
                                                        <Link
                                                            href={route('measurement-units.edit', unit.id)}
                                                            className="p-2 text-slate-500 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(unit.id, unit.name)}
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
                                            <td colSpan="8" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center mb-4">
                                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-slate-500 text-sm font-light">No measurement units found</p>
                                                    <p className="text-slate-700 text-xs mt-1">Get started by creating a new unit</p>
                                                    <Link
                                                        href={route('measurement-units.create')}
                                                        className="mt-4 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-lg text-amber-400 text-sm hover:bg-amber-400/15 transition-colors"
                                                    >
                                                        Add Your First Unit
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {units.links && units.total > units.per_page && (
                            <div className="px-6 py-4 border-t border-white/[0.06]">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-500">
                                        Showing {units.from} to {units.to} of {units.total} results
                                    </p>
                                    <div className="flex gap-2">
                                        {units.links.map((link, index) => {
                                            if (index === 0 || index === units.links.length - 1) return null;
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
