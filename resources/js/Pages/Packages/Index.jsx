import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useTheme } from '@/context/ThemeContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function PackagesIndex({ packages, filters, types }) {
    const { auth } = usePage().props;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const user = auth.user;
    const isAdmin = user?.is_admin || false;

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [typeFilter, setTypeFilter] = useState(filters?.type || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [freeFilter, setFreeFilter] = useState(filters?.free || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 15);
    const [loading, setLoading] = useState(false);
    const [selectedPackages, setSelectedPackages] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState(null);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    // Use a ref to track if this is the initial load
    const initialLoad = useRef(true);

    // Debounced search - but skip on initial load
    useEffect(() => {
        // Skip the effect on initial mount
        if (initialLoad.current) {
            initialLoad.current = false;
            return;
        }

        const timer = setTimeout(() => {
            // Only trigger if values actually changed from current filters
            if (searchTerm !== filters?.search ||
                typeFilter !== filters?.type ||
                statusFilter !== filters?.status ||
                freeFilter !== filters?.free ||
                perPage !== filters?.per_page) {

                setLoading(true);
                router.get(
                    route('packages.index'),
                    {
                        search: searchTerm,
                        type: typeFilter,
                        status: statusFilter,
                        free: freeFilter,
                        per_page: perPage,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        onFinish: () => setLoading(false),
                    }
                );
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, typeFilter, statusFilter, freeFilter, perPage]);

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
    };

    const handleTypeFilter = (type) => {
        setTypeFilter(type);
    };

    const handleFreeFilter = (free) => {
        setFreeFilter(free);
    };

    const handlePerPageChange = (e) => {
        setPerPage(e.target.value);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setTypeFilter('');
        setStatusFilter('');
        setFreeFilter('');
        setPerPage(15);
    };

    // Package selection
    const toggleSelectAll = () => {
        if (selectedPackages.length === packages.data.length) {
            setSelectedPackages([]);
        } else {
            setSelectedPackages(packages.data.map(p => p.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedPackages(prev =>
            prev.includes(id)
                ? prev.filter(pId => pId !== id)
                : [...prev, id]
        );
    };

    // Handle delete
    const confirmDelete = (pkg) => {
        setPackageToDelete(pkg);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (packageToDelete) {
            router.delete(route('packages.destroy', packageToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setPackageToDelete(null);
                },
            });
        }
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        router.post(route('packages.bulk-delete'), {
            ids: selectedPackages
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedPackages([]);
                setShowBulkDeleteModal(false);
            },
        });
    };

    // Toggle package status
    const toggleStatus = (pkg) => {
        router.post(route('packages.toggle-active', pkg.id), {}, {
            preserveScroll: true,
        });
    };

    // Toggle featured status
    const toggleFeatured = (pkg) => {
        router.post(route('packages.toggle-featured', pkg.id), {}, {
            preserveScroll: true,
        });
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    // ── Theme variables — matching Organizations style ──
    const themeClasses = {
        // Backgrounds
        pageBg: isDark ? 'bg-[#0d0e14]' : 'bg-gray-50',

        // Cards
        card: isDark ? 'bg-[#12131a] border-white/[0.06]' : 'bg-white border-gray-200',
        cardHover: isDark ? 'hover:border-white/[0.10] hover:bg-[#141520]' : 'hover:border-gray-300 hover:shadow-sm',

        // Borders & Dividers
        borderBottom: isDark ? 'border-white/[0.06]' : 'border-gray-200',
        divide: isDark ? 'divide-white/[0.04]' : 'divide-gray-100',

        // Text colors
        heading: isDark ? 'text-white/80' : 'text-gray-800',
        subheading: isDark ? 'text-slate-600' : 'text-gray-400',
        body: isDark ? 'text-white/85' : 'text-gray-900',
        muted: isDark ? 'text-slate-500' : 'text-gray-500',

        // Interactive states
        rowHover: isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50',

        // Inputs
        input: isDark ? 'bg-white/[0.03] border-white/[0.07] text-white/85 placeholder:text-slate-700 focus:border-violet-500/50 focus:bg-violet-500/[0.04]' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:ring-0',

        // Badge colors
        badgeActive: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
        badgeInactive: isDark ? 'bg-slate-400/10 text-slate-400 border-slate-400/20' : 'bg-gray-100 text-gray-600 border-gray-200',
        badgeFree: isDark ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-violet-100 text-violet-700 border-violet-200',
        badgePaid: isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-700 border-blue-200',
        badgeFeatured: isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-100 text-purple-700 border-purple-200',

        // Button styles
        buttonPrimary: isDark ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white',
        buttonSecondary: isDark ? 'bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200',
        buttonDanger: isDark ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200',
        buttonIcon: isDark ? 'hover:bg-white/[0.05] text-slate-400' : 'hover:bg-gray-100 text-gray-500',

        // Header specific
        headerTitle: isDark ? 'text-white/90' : 'text-gray-900',
        headerSub: isDark ? 'text-slate-500' : 'text-gray-400',

        // Welcome banner specific
        welcomeGreet: isDark ? 'text-violet-400/70' : 'text-violet-600',
        welcomeTitle: isDark ? 'text-white/90' : 'text-gray-900',
        welcomeName: isDark ? 'text-violet-400' : 'text-violet-600',
        welcomeDesc: isDark ? 'text-slate-500' : 'text-gray-500',
        welcomeAvatar: isDark ? 'bg-violet-600/15 border-violet-500/25 text-violet-400' : 'bg-violet-50 border-violet-200 text-violet-600',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className={`w-0.5 h-5 rounded-full ${isDark ? 'bg-violet-500' : 'bg-violet-600'}`} />
                    <div>
                        <h2 className={`text-[13.5px] font-semibold leading-tight tracking-wide ${themeClasses.headerTitle}`}>
                            Packages
                        </h2>
                        <p className={`text-[11px] font-light tracking-widest uppercase mt-0.5 ${themeClasses.headerSub}`}>
                            Manage subscription packages
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Packages" />

            <div className={`min-h-screen transition-colors duration-300 ${themeClasses.pageBg}`}>
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

                    {/* ── Welcome Banner ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                        <div className="absolute top-0 right-0 w-96 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative px-6 sm:px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-bold tracking-[0.35em] uppercase mb-2 ${themeClasses.welcomeGreet}`}>
                                    Package Management
                                </p>
                                <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-snug ${themeClasses.welcomeTitle}`}>
                                    All <span className={themeClasses.welcomeName}>Packages</span>
                                </h1>
                                <p className={`text-sm font-light mt-2 leading-relaxed max-w-md ${themeClasses.welcomeDesc}`}>
                                    {packages.total || 0} packages in the system.
                                </p>
                            </div>

                            {isAdmin && (
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <Link
                                        href={route('packages.create')}
                                        className="px-4 py-2 bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white text-[12px] font-semibold tracking-wider uppercase rounded-lg shadow-lg shadow-violet-900/40 ring-1 ring-violet-500/30 transition-all duration-300 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        New Package
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Stats Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 p-5 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
                            <p className={`text-[11px] font-light tracking-wider uppercase ${themeClasses.subheading}`}>Total Packages</p>
                            <p className={`text-2xl font-semibold mt-1 ${themeClasses.heading}`}>{packages.total || 0}</p>
                        </div>
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 p-5 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
                            <p className={`text-[11px] font-light tracking-wider uppercase ${themeClasses.subheading}`}>Active</p>
                            <p className={`text-2xl font-semibold mt-1 text-emerald-500`}>
                                {packages.data?.filter(p => p.is_active).length || 0}
                            </p>
                        </div>
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 p-5 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
                            <p className={`text-[11px] font-light tracking-wider uppercase ${themeClasses.subheading}`}>Free Packages</p>
                            <p className={`text-2xl font-semibold mt-1 text-violet-400`}>
                                {packages.data?.filter(p => p.is_free).length || 0}
                            </p>
                        </div>
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 p-5 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/25 to-transparent" />
                            <p className={`text-[11px] font-light tracking-wider uppercase ${themeClasses.subheading}`}>Featured</p>
                            <p className={`text-2xl font-semibold mt-1 text-purple-400`}>
                                {packages.data?.filter(p => p.is_featured).length || 0}
                            </p>
                        </div>
                    </div>

                    {/* ── Filters Bar ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                        <div className="px-5 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Search */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search packages..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 pl-10 ${themeClasses.input}`}
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    {loading && (
                                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 rounded-full animate-spin ${isDark ? 'border-violet-400/20 border-t-violet-400' : 'border-violet-200 border-t-violet-500'}`} />
                                    )}
                                </div>
                            </div>

                            {/* Type Filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => handleTypeFilter(e.target.value)}
                                className={`px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 min-w-[140px] ${themeClasses.input}`}
                            >
                                <option value="">All Types</option>
                                {types?.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>

                            {/* Status Filters */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleStatusFilter('')}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                        statusFilter === ''
                                            ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                                            : `${themeClasses.muted} ${themeClasses.rowHover}`
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('active')}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                        statusFilter === 'active'
                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                            : `${themeClasses.muted} ${themeClasses.rowHover}`
                                    }`}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('inactive')}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                        statusFilter === 'inactive'
                                            ? 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                                            : `${themeClasses.muted} ${themeClasses.rowHover}`
                                    }`}
                                >
                                    Inactive
                                </button>
                            </div>

                            {/* Free/Paid Filter */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleFreeFilter('')}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                        freeFilter === ''
                                            ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                                            : `${themeClasses.muted} ${themeClasses.rowHover}`
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => handleFreeFilter('true')}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                        freeFilter === 'true'
                                            ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                                            : `${themeClasses.muted} ${themeClasses.rowHover}`
                                    }`}
                                >
                                    Free
                                </button>
                                <button
                                    onClick={() => handleFreeFilter('false')}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                        freeFilter === 'false'
                                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                            : `${themeClasses.muted} ${themeClasses.rowHover}`
                                    }`}
                                >
                                    Paid
                                </button>
                            </div>

                            {/* Per Page */}
                            <select
                                value={perPage}
                                onChange={handlePerPageChange}
                                className={`px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 min-w-[100px] ${themeClasses.input}`}
                            >
                                <option value="15">15/page</option>
                                <option value="25">25/page</option>
                                <option value="50">50/page</option>
                                <option value="100">100/page</option>
                            </select>

                            {/* Clear Filters */}
                            {(searchTerm || typeFilter || statusFilter || freeFilter) && (
                                <button
                                    onClick={clearFilters}
                                    className={`px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 border ${themeClasses.buttonSecondary}`}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        {/* Bulk Actions */}
                        {selectedPackages.length > 0 && (
                            <div className="px-5 sm:px-6 py-3 border-t flex items-center gap-3">
                                <span className={`text-[13px] ${themeClasses.muted}`}>
                                    {selectedPackages.length} package(s) selected
                                </span>
                                <button
                                    onClick={() => setShowBulkDeleteModal(true)}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 border ${themeClasses.buttonDanger}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Selected
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Packages Table ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                        <div className={`px-5 sm:px-6 py-4 border-b flex items-center justify-between ${themeClasses.borderBottom}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path d="M20 7.5l-8-4-8 4v9l8 4 8-4v-9z" />
                                        <path d="M12 12l4-2v4l-4 2-4-2v-4l4 2z" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Packages</h3>
                                    <p className={`text-[11px] font-light tracking-wide hidden sm:block ${themeClasses.subheading}`}>
                                        {packages.total} total • Showing {packages.from || 0} to {packages.to || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                    <tr className={`border-b ${themeClasses.borderBottom}`}>
                                        <th className="w-10 px-5 sm:px-6 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedPackages.length === packages.data?.length && packages.data?.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                            />
                                        </th>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Package</th>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Type</th>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Projects</th>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Tasks</th>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Team</th>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Pricing</th>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Status</th>
                                        <th className={`text-right px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${themeClasses.divide}`}>
                                    {packages.data?.map((pkg) => (
                                        <tr key={pkg.id} className={`transition-colors ${themeClasses.rowHover}`}>
                                            <td className="px-5 sm:px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPackages.includes(pkg.id)}
                                                    onChange={() => toggleSelect(pkg.id)}
                                                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                />
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${themeClasses.card}`}>
                                                        <span className="text-xs font-semibold text-violet-400">
                                                            {pkg.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={route('packages.show', pkg.id)}
                                                            className={`text-[13px] font-medium hover:text-violet-400 transition-colors ${themeClasses.body}`}
                                                        >
                                                            {pkg.name}
                                                        </Link>
                                                        <p className={`text-[11px] font-light ${themeClasses.subheading}`}>
                                                            {pkg.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold border ${themeClasses.badgePaid}`}>
                                                    {pkg.package_type}
                                                </span>
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <p className={`text-[13px] ${themeClasses.body}`}>
                                                    {pkg.no_of_projects === 0 ? '∞' : pkg.no_of_projects}
                                                </p>
                                                <p className={`text-[11px] font-light ${themeClasses.subheading}`}>
                                                    projects
                                                </p>
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <p className={`text-[13px] ${themeClasses.body}`}>
                                                    {pkg.total_tasks_allowed === 0 ? '∞' : pkg.total_tasks_allowed}
                                                </p>
                                                <p className={`text-[11px] font-light ${themeClasses.subheading}`}>
                                                    tasks
                                                </p>
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <p className={`text-[13px] ${themeClasses.body}`}>
                                                    {pkg.no_of_team_members}
                                                </p>
                                                <p className={`text-[11px] font-light ${themeClasses.subheading}`}>
                                                    members
                                                </p>
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <div>
                                                    <p className={`text-[13px] font-medium ${themeClasses.body}`}>
                                                        ₹{pkg.price_monthly}/mo
                                                    </p>
                                                    <p className={`text-[11px] font-light ${themeClasses.subheading}`}>
                                                        ₹{pkg.price_yearly}/yr
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold border w-fit ${
                                                        pkg.is_active ? themeClasses.badgeActive : themeClasses.badgeInactive
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${pkg.is_active ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                                                        {pkg.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {pkg.is_free && (
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold border w-fit ${themeClasses.badgeFree}`}>
                                                            Free
                                                        </span>
                                                    )}
                                                    {pkg.is_featured && (
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold border w-fit ${themeClasses.badgeFeatured}`}>
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('packages.show', pkg.id)}
                                                        className={`p-1.5 rounded-lg transition-colors ${themeClasses.buttonIcon}`}
                                                        title="View"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                    <Link
                                                        href={route('packages.edit', pkg.id)}
                                                        className={`p-1.5 rounded-lg transition-colors ${themeClasses.buttonIcon}`}
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => toggleStatus(pkg)}
                                                        className={`p-1.5 rounded-lg transition-colors ${themeClasses.buttonIcon}`}
                                                        title={pkg.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {pkg.is_active ? (
                                                            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleFeatured(pkg)}
                                                        className={`p-1.5 rounded-lg transition-colors ${themeClasses.buttonIcon}`}
                                                        title={pkg.is_featured ? 'Remove Featured' : 'Mark Featured'}
                                                    >
                                                        {pkg.is_featured ? (
                                                            <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(pkg)}
                                                        className={`p-1.5 rounded-lg transition-colors ${themeClasses.buttonIcon}`}
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {packages.data?.length === 0 && (
                                <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-3 ${themeClasses.card}`}>
                                        <svg className={`w-5 h-5 ${themeClasses.muted}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path d="M20 7.5l-8-4-8 4v9l8 4 8-4v-9z" />
                                            <path d="M12 12l4-2v4l-4 2-4-2v-4l4 2z" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <p className={`text-[13px] font-light ${themeClasses.muted}`}>No packages found</p>
                                    {isAdmin && (
                                        <Link
                                            href={route('packages.create')}
                                            className="mt-4 px-4 py-2 bg-violet-600/10 border border-violet-500/20 rounded-lg text-violet-400 text-[13px] hover:bg-violet-600/15 transition-colors"
                                        >
                                            Create your first package
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Pagination ── */}
                        {packages.links && packages.total > packages.per_page && (
                            <div className={`px-5 sm:px-6 py-4 border-t flex items-center justify-between ${themeClasses.borderBottom}`}>
                                <p className={`text-[11px] ${themeClasses.muted}`}>
                                    Showing {packages.from || 0} to {packages.to || 0} of {packages.total} results
                                </p>
                                <div className="flex items-center gap-2">
                                    {packages.links.map((link, index) => {
                                        if (index === 0 || index === packages.links.length - 1) return null;
                                        return (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                                    link.active
                                                        ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                                                        : link.url
                                                        ? `${themeClasses.muted} ${themeClasses.rowHover}`
                                                        : `${themeClasses.muted} opacity-50 cursor-not-allowed`
                                                }`}
                                                preserveState
                                                preserveScroll
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`max-w-md w-full rounded-xl border shadow-xl ${themeClasses.card}`}>
                        <div className="p-6">
                            <h3 className={`text-lg font-semibold ${themeClasses.heading}`}>Confirm Delete</h3>
                            <p className={`mt-2 text-sm ${themeClasses.muted}`}>
                                Are you sure you want to delete the package "{packageToDelete?.name}"? This action cannot be undone.
                            </p>
                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${themeClasses.buttonSecondary}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${themeClasses.buttonDanger}`}
                                >
                                    Delete Package
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`max-w-md w-full rounded-xl border shadow-xl ${themeClasses.card}`}>
                        <div className="p-6">
                            <h3 className={`text-lg font-semibold ${themeClasses.heading}`}>Confirm Bulk Delete</h3>
                            <p className={`mt-2 text-sm ${themeClasses.muted}`}>
                                Are you sure you want to delete {selectedPackages.length} selected packages? This action cannot be undone.
                            </p>
                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowBulkDeleteModal(false)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${themeClasses.buttonSecondary}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${themeClasses.buttonDanger}`}
                                >
                                    Delete Selected
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
