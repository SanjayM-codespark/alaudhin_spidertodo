import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function MembershipsIndex({ memberships, filters, stats, organizations, packages }) {
    const { auth } = usePage().props;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const user = auth.user;
    const userRole = user?.role_type;
    const isAdmin = user.is_admin || false;

    // Filter states
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState(filters?.payment_status || '');
    const [billingCycleFilter, setBillingCycleFilter] = useState(filters?.billing_cycle || '');
    const [organizationFilter, setOrganizationFilter] = useState(filters?.organization_id || '');
    const [packageFilter, setPackageFilter] = useState(filters?.package_id || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [isTrial, setIsTrial] = useState(filters?.is_trial || '');
    const [autoRenew, setAutoRenew] = useState(filters?.auto_renew || '');
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedMemberships, setSelectedMemberships] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [membershipToDelete, setMembershipToDelete] = useState(null);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    // Use a ref to track if this is the initial load
    const initialLoad = useRef(true);

    // Debounced filters - but skip on initial load
    useEffect(() => {
        // Skip the effect on initial mount
        if (initialLoad.current) {
            initialLoad.current = false;
            return;
        }

        const timer = setTimeout(() => {
            setLoading(true);
            router.get(
                route('memberships.index'),
                {
                    search: searchTerm,
                    status: statusFilter,
                    payment_status: paymentStatusFilter,
                    billing_cycle: billingCycleFilter,
                    organization_id: organizationFilter,
                    package_id: packageFilter,
                    date_from: dateFrom,
                    date_to: dateTo,
                    is_trial: isTrial,
                    auto_renew: autoRenew,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setLoading(false),
                }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [
        searchTerm, statusFilter, paymentStatusFilter, billingCycleFilter,
        organizationFilter, packageFilter, dateFrom, dateTo, isTrial, autoRenew
    ]);

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setPaymentStatusFilter('');
        setBillingCycleFilter('');
        setOrganizationFilter('');
        setPackageFilter('');
        setDateFrom('');
        setDateTo('');
        setIsTrial('');
        setAutoRenew('');
    };

    const handleDelete = (membership) => {
        if (membership.status === 'active') {
            if (!confirm('Cannot delete active membership. Cancel it first.')) return;
            return;
        }
        setMembershipToDelete(membership);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!membershipToDelete) return;
        router.delete(route('memberships.destroy', membershipToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setMembershipToDelete(null);
            },
        });
    };

    const handleBulkDelete = () => {
        if (selectedMemberships.length === 0) return;
        router.post(route('memberships.bulk-delete'), {
            ids: selectedMemberships,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedMemberships([]);
                setShowBulkDeleteModal(false);
            },
        });
    };

    const handleBulkStatusUpdate = (status) => {
        if (selectedMemberships.length === 0) return;
        router.post(route('memberships.bulk-update-status'), {
            ids: selectedMemberships,
            status: status,
        }, {
            preserveScroll: true,
            onSuccess: () => setSelectedMemberships([]),
        });
    };

    const handleSelectAll = () => {
        if (selectedMemberships.length === memberships.data.length) {
            setSelectedMemberships([]);
        } else {
            setSelectedMemberships(memberships.data.map(m => m.id));
        }
    };

    const handleSelect = (id) => {
        setSelectedMemberships(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleAction = (method, url, options = {}) => {
        router[method](url, {}, {
            preserveScroll: true,
            ...options,
        });
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // ── Status Badge Component ──
    const StatusBadge = ({ status }) => {
        const config = {
            active: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400', label: 'Active' },
            trial: { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400', label: 'Trial' },
            expired: { bg: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400', label: 'Expired' },
            cancelled: { bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20', dot: 'bg-gray-400', label: 'Cancelled' },
            suspended: { bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400', label: 'Suspended' },
            pending_payment: { bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-400', label: 'Pending' },
        };

        const { bg, dot, label } = config[status] || config.pending_payment;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold border ${bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                {label}
            </span>
        );
    };

    // ── Payment Status Badge ──
    const PaymentStatusBadge = ({ status }) => {
        const config = {
            paid: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Paid' },
            pending: { bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', label: 'Pending' },
            failed: { bg: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Failed' },
            refunded: { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Refunded' },
        };

        const { bg, label } = config[status] || config.pending;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold border ${bg}`}>
                {label}
            </span>
        );
    };

    // ── Billing Cycle Badge ──
    const BillingCycleBadge = ({ cycle }) => {
        const config = {
            monthly: { bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', label: 'Monthly' },
            quarterly: { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Quarterly' },
            yearly: { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Yearly' },
            lifetime: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Lifetime' },
        };

        const { bg, label } = config[cycle] || config.monthly;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold border ${bg}`}>
                {label}
            </span>
        );
    };

    // ── Stats Card Component ──
    const StatsCard = ({ title, value, icon, color }) => (
        <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
            <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-[10px] font-bold tracking-wider uppercase ${themeClasses.muted}`}>{title}</p>
                        <p className={`text-xl font-semibold mt-1 ${themeClasses.body}`}>{value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${color} ${themeClasses.card}`}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );

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

        // Badge colors (for reference)
        badgeActive: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
        badgeInactive: isDark ? 'bg-slate-400/10 text-slate-400 border-slate-400/20' : 'bg-gray-100 text-gray-600 border-gray-200',

        // Header specific
        headerTitle: isDark ? 'text-white/90' : 'text-gray-900',
        headerSub: isDark ? 'text-slate-500' : 'text-gray-400',

        // Welcome banner specific
        welcomeGreet: isDark ? 'text-violet-400/70' : 'text-violet-600',
        welcomeTitle: isDark ? 'text-white/90' : 'text-gray-900',
        welcomeName: isDark ? 'text-violet-400' : 'text-violet-600',
        welcomeDesc: isDark ? 'text-slate-500' : 'text-gray-500',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className={`w-0.5 h-5 rounded-full ${isDark ? 'bg-violet-500' : 'bg-violet-600'}`} />
                    <div>
                        <h2 className={`text-[13.5px] font-semibold leading-tight tracking-wide ${themeClasses.headerTitle}`}>
                            Memberships
                        </h2>
                        <p className={`text-[11px] font-light tracking-widest uppercase mt-0.5 ${themeClasses.headerSub}`}>
                            Manage organization subscriptions
                        </p>
                    </div>
                    {!isAdmin && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-400/20">
                            {userRole}
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Memberships" />

            <div className={`min-h-screen transition-colors duration-300 ${themeClasses.pageBg}`}>
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

                    {/* ── Welcome Banner ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                        <div className="absolute top-0 right-0 w-96 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative px-6 sm:px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-bold tracking-[0.35em] uppercase mb-2 ${themeClasses.welcomeGreet}`}>
                                    Subscription Management
                                </p>
                                <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-snug ${themeClasses.welcomeTitle}`}>
                                    All <span className={themeClasses.welcomeName}>Memberships</span>
                                </h1>
                                <p className={`text-sm font-light mt-2 leading-relaxed max-w-md ${themeClasses.welcomeDesc}`}>
                                    {isAdmin
                                        ? `Total ${memberships.total || 0} active subscriptions.`
                                        : "You don't have permission to manage memberships."}
                                </p>
                            </div>

                            {isAdmin && (
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <Link
                                        href={route('memberships.create')}
                                        className="px-4 py-2 bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white text-[12px] font-semibold tracking-wider uppercase rounded-lg shadow-lg shadow-violet-900/40 ring-1 ring-violet-500/30 transition-all duration-300 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        New Membership
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isAdmin ? (
                        // ── Access Denied ──
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
                            <div className="px-8 py-16 flex flex-col items-center justify-center text-center">
                                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 ${themeClasses.card}`}>
                                    <svg className={`w-8 h-8 ${themeClasses.muted}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className={`text-lg font-semibold mb-2 ${themeClasses.body}`}>Access Restricted</h3>
                                <p className={`text-sm max-w-md ${themeClasses.muted}`}>
                                    You need administrator privileges to manage memberships.
                                    Please contact your system administrator for access.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ── Stats Cards ── */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatsCard
                                    title="Active"
                                    value={stats?.active || 0}
                                    color="border-emerald-500/20"
                                    icon={
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                                <StatsCard
                                    title="Trial"
                                    value={stats?.trial || 0}
                                    color="border-blue-500/20"
                                    icon={
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                                <StatsCard
                                    title="Expiring Soon"
                                    value={stats?.expiring_soon || 0}
                                    color="border-yellow-500/20"
                                    icon={
                                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    }
                                />
                                <StatsCard
                                    title="Revenue"
                                    value={formatCurrency(stats?.total_revenue || 0)}
                                    color="border-purple-500/20"
                                    icon={
                                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                            </div>

                            {/* ── Bulk Actions ── */}
                            {selectedMemberships.length > 0 && (
                                <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card} border-violet-500/30`}>
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                                    <div className="px-5 py-3 flex items-center justify-between">
                                        <span className={`text-[13px] ${themeClasses.body}`}>
                                            {selectedMemberships.length} membership(s) selected
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleBulkStatusUpdate('active')}
                                                className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[11px] font-medium hover:bg-emerald-500/15 transition-colors"
                                            >
                                                Activate
                                            </button>
                                            <button
                                                onClick={() => handleBulkStatusUpdate('suspended')}
                                                className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-[11px] font-medium hover:bg-yellow-500/15 transition-colors"
                                            >
                                                Suspend
                                            </button>
                                            <button
                                                onClick={() => handleBulkStatusUpdate('cancelled')}
                                                className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[11px] font-medium hover:bg-red-500/15 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => setShowBulkDeleteModal(true)}
                                                className="px-3 py-1.5 bg-gray-500/10 border border-gray-500/20 rounded-lg text-gray-400 text-[11px] font-medium hover:bg-gray-500/15 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Filters Bar ── */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className="px-5 sm:px-6 py-4">
                                    {/* Search */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                                        <div className="flex-1 min-w-[200px]">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search by organization or package..."
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

                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[13px] transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                            Filters
                                            <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Expanded Filters */}
                                    {showFilters && (
                                        <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                {/* Status Filter */}
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                    className={`px-3 py-2 rounded-lg text-[12px] border ${themeClasses.input}`}
                                                >
                                                    <option value="">All Statuses</option>
                                                    <option value="active">Active</option>
                                                    <option value="trial">Trial</option>
                                                    <option value="expired">Expired</option>
                                                    <option value="cancelled">Cancelled</option>
                                                    <option value="suspended">Suspended</option>
                                                    <option value="pending_payment">Pending Payment</option>
                                                </select>

                                                {/* Payment Status Filter */}
                                                <select
                                                    value={paymentStatusFilter}
                                                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                                    className={`px-3 py-2 rounded-lg text-[12px] border ${themeClasses.input}`}
                                                >
                                                    <option value="">Payment Status</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="failed">Failed</option>
                                                    <option value="refunded">Refunded</option>
                                                </select>

                                                {/* Billing Cycle Filter */}
                                                <select
                                                    value={billingCycleFilter}
                                                    onChange={(e) => setBillingCycleFilter(e.target.value)}
                                                    className={`px-3 py-2 rounded-lg text-[12px] border ${themeClasses.input}`}
                                                >
                                                    <option value="">Billing Cycle</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="yearly">Yearly</option>
                                                    <option value="lifetime">Lifetime</option>
                                                </select>

                                                {/* Organization Filter */}
                                                <select
                                                    value={organizationFilter}
                                                    onChange={(e) => setOrganizationFilter(e.target.value)}
                                                    className={`px-3 py-2 rounded-lg text-[12px] border ${themeClasses.input}`}
                                                >
                                                    <option value="">All Organizations</option>
                                                    {organizations?.map(org => (
                                                        <option key={org.id} value={org.id}>{org.name}</option>
                                                    ))}
                                                </select>

                                                {/* Package Filter */}
                                                <select
                                                    value={packageFilter}
                                                    onChange={(e) => setPackageFilter(e.target.value)}
                                                    className={`px-3 py-2 rounded-lg text-[12px] border ${themeClasses.input}`}
                                                >
                                                    <option value="">All Packages</option>
                                                    {packages?.map(pkg => (
                                                        <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                                    ))}
                                                </select>

                                                {/* Trial Filter */}
                                                <select
                                                    value={isTrial}
                                                    onChange={(e) => setIsTrial(e.target.value)}
                                                    className={`px-3 py-2 rounded-lg text-[12px] border ${themeClasses.input}`}
                                                >
                                                    <option value="">All (Trial)</option>
                                                    <option value="1">Trial Only</option>
                                                    <option value="0">Non-Trial</option>
                                                </select>

                                                {/* Auto Renew Filter */}
                                                <select
                                                    value={autoRenew}
                                                    onChange={(e) => setAutoRenew(e.target.value)}
                                                    className={`px-3 py-2 rounded-lg text-[12px] border ${themeClasses.input}`}
                                                >
                                                    <option value="">All (Auto Renew)</option>
                                                    <option value="1">Auto Renew On</option>
                                                    <option value="0">Auto Renew Off</option>
                                                </select>

                                                {/* Date Range */}
                                                <div className="flex gap-2">
                                                    <input
                                                        type="date"
                                                        value={dateFrom}
                                                        onChange={(e) => setDateFrom(e.target.value)}
                                                        className={`flex-1 px-3 py-2 rounded-lg text-[12px] border ${themeClasses.input}`}
                                                        placeholder="From"
                                                    />
                                                    <input
                                                        type="date"
                                                        value={dateTo}
                                                        onChange={(e) => setDateTo(e.target.value)}
                                                        className={`flex-1 px-3 py-2 rounded-lg text-[12px] border ${themeClasses.input}`}
                                                        placeholder="To"
                                                    />
                                                </div>
                                            </div>

                                            {/* Filter Actions */}
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={clearFilters}
                                                    className="px-4 py-2 text-[12px] text-slate-400 hover:text-slate-300 transition-colors"
                                                >
                                                    Clear Filters
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Memberships Table ── */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className={`px-5 sm:px-6 py-4 border-b flex items-center justify-between ${themeClasses.borderBottom}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7.5l-8-4-8 4v9l8 4 8-4v-9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l4-2v4l-4 2-4-2v-4l4 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Memberships</h3>
                                            <p className={`text-[11px] font-light tracking-wide hidden sm:block ${themeClasses.subheading}`}>
                                                {memberships.total} total • Showing {memberships.from || 0} to {memberships.to || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1000px]">
                                        <thead>
                                            <tr className={`border-b ${themeClasses.borderBottom}`}>
                                                <th className="w-10 px-5 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMemberships.length === memberships.data?.length && memberships.data?.length > 0}
                                                        onChange={handleSelectAll}
                                                        className="rounded border-gray-300 dark:border-white/[0.1] text-violet-600 focus:ring-violet-500"
                                                    />
                                                </th>
                                                <th className={`text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Organization</th>
                                                <th className={`text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Package</th>
                                                <th className={`text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Period</th>
                                                <th className={`text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Status</th>
                                                <th className={`text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Payment</th>
                                                <th className={`text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Amount</th>
                                                <th className={`text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${themeClasses.divide}`}>
                                            {memberships.data?.map((membership) => (
                                                <tr key={membership.id} className={`transition-colors ${themeClasses.rowHover}`}>
                                                    <td className="px-5 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMemberships.includes(membership.id)}
                                                            onChange={() => handleSelect(membership.id)}
                                                            className="rounded border-gray-300 dark:border-white/[0.1] text-violet-600 focus:ring-violet-500"
                                                        />
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <Link
                                                            href={route('organizations.show', membership.organization_id)}
                                                            className={`text-[13px] font-medium hover:text-violet-400 transition-colors ${themeClasses.body}`}
                                                        >
                                                            {membership.organization?.name || 'N/A'}
                                                        </Link>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div>
                                                            <Link
                                                                href={route('packages.show', membership.package_id)}
                                                                className={`text-[13px] hover:text-violet-400 transition-colors ${themeClasses.body}`}
                                                            >
                                                                {membership.package?.name || 'N/A'}
                                                            </Link>
                                                            <div className="mt-1">
                                                                <BillingCycleBadge cycle={membership.billing_cycle} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className={`text-[13px] ${themeClasses.body}`}>
                                                            {formatDate(membership.start_date)}
                                                        </p>
                                                        <p className={`text-[11px] font-light ${themeClasses.subheading}`}>
                                                            {membership.end_date ? formatDate(membership.end_date) : 'Lifetime'}
                                                        </p>
                                                        {membership.is_trial && (
                                                            <p className={`text-[10px] font-light text-blue-400 mt-1`}>
                                                                Trial ends: {formatDate(membership.trial_ends_at)}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <StatusBadge status={membership.status} />
                                                        {membership.auto_renew && membership.status === 'active' && (
                                                            <p className={`text-[10px] font-light ${themeClasses.subheading} mt-1`}>
                                                                Next: {formatDate(membership.next_billing_date)}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <PaymentStatusBadge status={membership.payment_status} />
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className={`text-[13px] font-medium ${themeClasses.body}`}>
                                                            {formatCurrency(membership.price_paid)}
                                                        </p>
                                                        {membership.discount_amount > 0 && (
                                                            <p className={`text-[10px] font-light text-emerald-400`}>
                                                                -{formatCurrency(membership.discount_amount)}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={route('memberships.show', membership.id)}
                                                                className={`p-1.5 rounded-lg transition-colors ${themeClasses.rowHover}`}
                                                                title="View"
                                                            >
                                                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                            <Link
                                                                href={route('memberships.edit', membership.id)}
                                                                className={`p-1.5 rounded-lg transition-colors ${themeClasses.rowHover}`}
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </Link>
                                                            {membership.status === 'active' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleAction('post', route('memberships.suspend', membership.id))}
                                                                        className={`p-1.5 rounded-lg transition-colors ${themeClasses.rowHover}`}
                                                                        title="Suspend"
                                                                    >
                                                                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (confirm('Are you sure you want to cancel this membership?')) {
                                                                                handleAction('post', route('memberships.cancel', membership.id));
                                                                            }
                                                                        }}
                                                                        className={`p-1.5 rounded-lg transition-colors ${themeClasses.rowHover}`}
                                                                        title="Cancel"
                                                                    >
                                                                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </>
                                                            )}
                                                            {membership.status === 'suspended' && (
                                                                <button
                                                                    onClick={() => handleAction('post', route('memberships.activate', membership.id))}
                                                                    className={`p-1.5 rounded-lg transition-colors ${themeClasses.rowHover}`}
                                                                    title="Activate"
                                                                >
                                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(membership)}
                                                                className={`p-1.5 rounded-lg transition-colors ${themeClasses.rowHover}`}
                                                                title="Delete"
                                                            >
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {memberships.data?.length === 0 && (
                                        <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                                            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-3 ${themeClasses.card}`}>
                                                <svg className={`w-5 h-5 ${themeClasses.muted}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7.5l-8-4-8 4v9l8 4 8-4v-9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l4-2v4l-4 2-4-2v-4l4 2z" />
                                                </svg>
                                            </div>
                                            <p className={`text-[13px] font-light ${themeClasses.muted}`}>No memberships found</p>
                                            <Link
                                                href={route('memberships.create')}
                                                className="mt-4 px-4 py-2 bg-violet-600/10 border border-violet-500/20 rounded-lg text-violet-400 text-[13px] hover:bg-violet-600/15 transition-colors"
                                            >
                                                Create your first membership
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* ── Pagination ── */}
                                {memberships.links && memberships.total > memberships.per_page && (
                                    <div className={`px-5 sm:px-6 py-4 border-t flex items-center justify-between ${themeClasses.borderBottom}`}>
                                        <p className={`text-[11px] ${themeClasses.muted}`}>
                                            Showing {memberships.from || 0} to {memberships.to || 0} of {memberships.total} results
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {memberships.links.map((link, index) => {
                                                if (index === 0 || index === memberships.links.length - 1) return null;
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
                        </>
                    )}
                </div>
            </div>

            {/* ── Delete Confirmation Modal ── */}
            {showDeleteModal && membershipToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card} max-w-md w-full`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                        <div className="p-6">
                            <h3 className={`text-lg font-semibold mb-2 ${themeClasses.body}`}>Delete Membership</h3>
                            <p className={`text-sm mb-6 ${themeClasses.muted}`}>
                                Are you sure you want to delete the membership for{' '}
                                <span className="font-medium text-white">
                                    {membershipToDelete.organization?.name}
                                </span>
                                ? This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className={`px-4 py-2 text-[13px] rounded-lg transition-colors ${themeClasses.muted} hover:text-white`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[13px] font-medium hover:bg-red-500/15 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Bulk Delete Modal ── */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card} max-w-md w-full`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                        <div className="p-6">
                            <h3 className={`text-lg font-semibold mb-2 ${themeClasses.body}`}>Delete Memberships</h3>
                            <p className={`text-sm mb-6 ${themeClasses.muted}`}>
                                Are you sure you want to delete {selectedMemberships.length} selected membership(s)?
                                This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowBulkDeleteModal(false)}
                                    className={`px-4 py-2 text-[13px] rounded-lg transition-colors ${themeClasses.muted} hover:text-white`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[13px] font-medium hover:bg-red-500/15 transition-colors"
                                >
                                    Delete {selectedMemberships.length} items
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
