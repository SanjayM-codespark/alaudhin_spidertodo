import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function MembershipsShow({ membership, daysRemaining, trialDaysRemaining, canRenew, canCancel, canSuspend, canActivate, refundAmount: initialRefundAmount }) {
    const { auth } = usePage().props;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const user = auth.user;
    const userRole = user?.role_type;
    const isAdmin = user.is_admin || false;

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [refundAmount, setRefundAmount] = useState(initialRefundAmount || 0);
    const [refundReason, setRefundReason] = useState('');
    const [processing, setProcessing] = useState(false);

    // Parse feature snapshot if it's a string
    const featureSnapshot = typeof membership.feature_snapshot === 'string'
        ? JSON.parse(membership.feature_snapshot || '{}')
        : membership.feature_snapshot || {};

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatDateTime = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const handleAction = (action, data = {}) => {
        setProcessing(true);
        router.post(route(`memberships.${action}`, membership.id), data, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                setShowCancelModal(false);
                setShowSuspendModal(false);
                setShowRenewModal(false);
                setShowRefundModal(false);
                setCancellationReason('');
                setRefundReason('');
            },
            onError: () => {
                setProcessing(false);
            },
        });
    };

    // ── Status Badge Component ──
    const StatusBadge = ({ status }) => {
        const config = {
            active: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400', label: 'Active' },
            trial: { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400', label: 'Trial' },
            expired: { bg: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400', label: 'Expired' },
            cancelled: { bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20', dot: 'bg-gray-400', label: 'Cancelled' },
            suspended: { bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400', label: 'Suspended' },
            pending_payment: { bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-400', label: 'Pending Payment' },
        };

        const { bg, dot, label } = config[status] || config.pending_payment;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border ${bg}`}>
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
            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-[11px] font-semibold border ${bg}`}>
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
            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-[11px] font-semibold border ${bg}`}>
                {label}
            </span>
        );
    };

    // ── Package Feature Card ──
    const FeatureCard = ({ label, value, icon }) => (
        <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${themeClasses.card}`}>
                        {icon}
                    </div>
                    <div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${themeClasses.muted}`}>{label}</p>
                        <p className={`text-[15px] font-semibold ${themeClasses.body}`}>{value}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── Theme variables — matching Index style ──
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

        // Labels
        label: isDark ? 'text-slate-400' : 'text-gray-600',

        // Buttons
        buttonPrimary: 'bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white text-[12px] font-semibold tracking-wider rounded-lg shadow-lg shadow-violet-900/40 ring-1 ring-violet-500/30 transition-all duration-300',
        buttonSecondary: isDark ? 'bg-white/[0.03] border-white/[0.07] text-slate-300 hover:bg-white/[0.05]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
        buttonDanger: 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-colors',

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
                            Membership Details
                        </h2>
                        <p className={`text-[11px] font-light tracking-widest uppercase mt-0.5 ${themeClasses.headerSub}`}>
                            {membership.organization?.name} • {membership.package?.name}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Membership - ${membership.organization?.name}`} />

            <div className={`min-h-screen transition-colors duration-300 ${themeClasses.pageBg}`}>
                <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

                    {/* ── Welcome Banner ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                        <div className="absolute top-0 right-0 w-96 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative px-6 sm:px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-bold tracking-[0.35em] uppercase mb-2 ${themeClasses.welcomeGreet}`}>
                                    Membership Overview
                                </p>
                                <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-snug ${themeClasses.welcomeTitle}`}>
                                    {membership.organization?.name} • <span className={themeClasses.welcomeName}>{membership.package?.name}</span>
                                </h1>
                                <div className="flex items-center gap-3 mt-3">
                                    <StatusBadge status={membership.status} />
                                    <PaymentStatusBadge status={membership.payment_status} />
                                    <BillingCycleBadge cycle={membership.billing_cycle} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                                <Link
                                    href={route('memberships.edit', membership.id)}
                                    className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-2 ${themeClasses.buttonSecondary}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                </Link>
                                <Link
                                    href={route('memberships.index')}
                                    className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${themeClasses.buttonSecondary}`}
                                >
                                    Back to List
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ── Stats Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Price Paid Card */}
                        <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
                            <div className="px-4 py-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${themeClasses.muted}`}>Price Paid</p>
                                        <p className={`text-lg font-semibold ${themeClasses.body}`}>{formatCurrency(membership.price_paid)}</p>
                                        {membership.discount_amount > 0 && (
                                            <p className={`text-[11px] mt-1 ${themeClasses.muted}`}>Discount: -{formatCurrency(membership.discount_amount)}</p>
                                        )}
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${themeClasses.card}`}>
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Days Remaining Card */}
                        <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
                            <div className="px-4 py-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${themeClasses.muted}`}>Days Remaining</p>
                                        <p className={`text-lg font-semibold ${themeClasses.body}`}>{daysRemaining !== null ? daysRemaining : '∞'}</p>
                                        {membership.end_date && (
                                            <p className={`text-[11px] mt-1 ${themeClasses.muted}`}>Until {formatDate(membership.end_date)}</p>
                                        )}
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${themeClasses.card}`}>
                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trial Status Card */}
                        <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
                            <div className="px-4 py-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${themeClasses.muted}`}>Trial Status</p>
                                        <p className={`text-lg font-semibold ${themeClasses.body}`}>{membership.is_trial ? 'Active Trial' : 'No Trial'}</p>
                                        {membership.trial_ends_at && (
                                            <p className={`text-[11px] mt-1 ${themeClasses.muted}`}>Ends {formatDate(membership.trial_ends_at)}</p>
                                        )}
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${themeClasses.card}`}>
                                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Auto Renewal Card */}
                        <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
                            <div className="px-4 py-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${themeClasses.muted}`}>Auto Renewal</p>
                                        <p className={`text-lg font-semibold ${themeClasses.body}`}>{membership.auto_renew ? 'Enabled' : 'Disabled'}</p>
                                        {membership.next_billing_date && (
                                            <p className={`text-[11px] mt-1 ${themeClasses.muted}`}>Next: {formatDate(membership.next_billing_date)}</p>
                                        )}
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${themeClasses.card}`}>
                                        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Action Buttons ── */}
                    <div className="flex flex-wrap items-center gap-3">
                        {canRenew && (
                            <button
                                onClick={() => setShowRenewModal(true)}
                                className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-2 ${themeClasses.buttonPrimary}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Renew Membership
                            </button>
                        )}
                        {canActivate && (
                            <button
                                onClick={() => handleAction('activate')}
                                disabled={processing}
                                className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Activate
                            </button>
                        )}
                        {canSuspend && (
                            <button
                                onClick={() => setShowSuspendModal(true)}
                                disabled={processing}
                                className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/15`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Suspend
                            </button>
                        )}
                        {canCancel && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                disabled={processing}
                                className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </button>
                        )}
                        {membership.payment_status === 'paid' && (
                            <button
                                onClick={() => setShowRefundModal(true)}
                                disabled={processing}
                                className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/15`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2z" />
                                </svg>
                                Refund
                            </button>
                        )}
                    </div>

                    {/* ── Package Features Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FeatureCard
                            label="Projects"
                            value={membership.package?.no_of_projects || 0}
                            icon={
                                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            label="Tasks per Project"
                            value={membership.package?.no_of_tasks_per_project || 0}
                            icon={
                                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            label="Total Tasks"
                            value={membership.package?.total_tasks_allowed || 0}
                            icon={
                                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            label="Team Members"
                            value={membership.package?.no_of_team_members || 1}
                            icon={
                                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            label="Clients"
                            value={membership.package?.no_of_clients || 0}
                            icon={
                                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            label="Storage"
                            value={`${membership.package?.storage_limit_mb || 100} MB`}
                            icon={
                                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            label="KPI Points/Task"
                            value={membership.package?.kpi_points_per_task || 0}
                            icon={
                                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            label="Setup Fee"
                            value={formatCurrency(membership.package?.setup_fee || 0)}
                            icon={
                                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                    </div>

                    {/* ── Additional Features Section ── */}
                    {membership.package && (
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className="px-6 py-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Package Features</h3>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {membership.package.has_time_tracking && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            <span className={`text-[12px] ${themeClasses.body}`}>Time Tracking</span>
                                        </div>
                                    )}
                                    {membership.package.has_file_attachments && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            <span className={`text-[12px] ${themeClasses.body}`}>File Attachments</span>
                                        </div>
                                    )}
                                    {membership.package.has_reminders && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            <span className={`text-[12px] ${themeClasses.body}`}>Reminders</span>
                                        </div>
                                    )}
                                    {membership.package.has_deadline_management && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            <span className={`text-[12px] ${themeClasses.body}`}>Deadline Management</span>
                                        </div>
                                    )}
                                    {membership.package.has_kpi_tracking && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            <span className={`text-[12px] ${themeClasses.body}`}>KPI Tracking</span>
                                        </div>
                                    )}
                                    {membership.package.has_efficiency_tracking && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            <span className={`text-[12px] ${themeClasses.body}`}>Efficiency Tracking</span>
                                        </div>
                                    )}
                                    {membership.package.has_advanced_reports && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            <span className={`text-[12px] ${themeClasses.body}`}>Advanced Reports</span>
                                        </div>
                                    )}
                                    {membership.package.has_api_access && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            <span className={`text-[12px] ${themeClasses.body}`}>API Access</span>
                                        </div>
                                    )}
                                    {membership.package.has_custom_fields && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            <span className={`text-[12px] ${themeClasses.body}`}>Custom Fields</span>
                                        </div>
                                    )}
                                    {membership.package.has_priority_support && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            <span className={`text-[12px] ${themeClasses.body}`}>Priority Support</span>
                                        </div>
                                    )}
                                </div>

                                {membership.package.kpi_metrics && (
                                    <div className="mt-4">
                                        <p className={`text-[11px] font-medium mb-2 ${themeClasses.subheading}`}>KPI Metrics</p>
                                        <p className={`text-[12px] p-3 rounded-lg border ${themeClasses.input}`}>
                                            {membership.package.kpi_metrics}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Main Content Grid ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Left Column - Organization Info */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Organization Details */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className="px-6 py-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Organization Information</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                            <span className={`text-[12px] font-light ${themeClasses.muted}`}>Organization Name</span>
                                            <Link
                                                href={route('organizations.show', membership.organization_id)}
                                                className={`text-[13px] font-medium text-violet-400 hover:text-violet-300`}
                                            >
                                                {membership.organization?.name}
                                            </Link>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                            <span className={`text-[12px] font-light ${themeClasses.muted}`}>Email</span>
                                            <span className={`text-[13px] font-medium ${themeClasses.body}`}>{membership.organization?.email || '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                            <span className={`text-[12px] font-light ${themeClasses.muted}`}>Phone</span>
                                            <span className={`text-[13px] font-medium ${themeClasses.body}`}>{membership.organization?.phone || '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className={`text-[12px] font-light ${themeClasses.muted}`}>Tax Number</span>
                                            <span className={`text-[13px] font-medium ${themeClasses.body}`}>{membership.organization?.tax_number || '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Timeline & Payment Details */}
                        <div className="space-y-5">
                            {/* Timeline */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className="px-6 py-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Timeline</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                            <span className={`text-[12px] font-light ${themeClasses.muted}`}>Start Date</span>
                                            <span className={`text-[13px] font-medium ${themeClasses.body}`}>{formatDate(membership.start_date)}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                            <span className={`text-[12px] font-light ${themeClasses.muted}`}>End Date</span>
                                            <span className={`text-[13px] font-medium ${themeClasses.body}`}>{membership.end_date ? formatDate(membership.end_date) : 'Lifetime'}</span>
                                        </div>
                                        {membership.is_trial && (
                                            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                                <span className={`text-[12px] font-light ${themeClasses.muted}`}>Trial Ends</span>
                                                <span className={`text-[13px] font-medium text-blue-400`}>{formatDate(membership.trial_ends_at)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                            <span className={`text-[12px] font-light ${themeClasses.muted}`}>Next Billing</span>
                                            <span className={`text-[13px] font-medium ${themeClasses.body}`}>{membership.next_billing_date ? formatDate(membership.next_billing_date) : '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                            <span className={`text-[12px] font-light ${themeClasses.muted}`}>Created At</span>
                                            <span className={`text-[13px] font-medium ${themeClasses.body}`}>{formatDateTime(membership.created_at)}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className={`text-[12px] font-light ${themeClasses.muted}`}>Last Updated</span>
                                            <span className={`text-[13px] font-medium ${themeClasses.body}`}>{formatDateTime(membership.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className="px-6 py-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Payment Details</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                            <span className={`text-[12px] font-light ${themeClasses.muted}`}>Payment Status</span>
                                            <PaymentStatusBadge status={membership.payment_status} />
                                        </div>
                                        {membership.paid_at && (
                                            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                                <span className={`text-[12px] font-light ${themeClasses.muted}`}>Paid At</span>
                                                <span className={`text-[13px] font-medium ${themeClasses.body}`}>{formatDateTime(membership.paid_at)}</span>
                                            </div>
                                        )}
                                        {membership.transaction_id && (
                                            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                                <span className={`text-[12px] font-light ${themeClasses.muted}`}>Transaction ID</span>
                                                <span className={`text-[13px] font-medium ${themeClasses.body}`}>{membership.transaction_id}</span>
                                            </div>
                                        )}
                                        {membership.cancelled_at && (
                                            <>
                                                <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                                    <span className={`text-[12px] font-light ${themeClasses.muted}`}>Cancelled At</span>
                                                    <span className={`text-[13px] font-medium text-red-400`}>{formatDateTime(membership.cancelled_at)}</span>
                                                </div>
                                                {membership.cancellation_reason && (
                                                    <div className="mt-3">
                                                        <p className={`text-[11px] font-light mb-2 ${themeClasses.muted}`}>Cancellation Reason</p>
                                                        <p className={`text-[12px] p-3 rounded-lg border ${themeClasses.input}`}>
                                                            {membership.cancellation_reason}
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {membership.notes && (
                                <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                    <div className="px-6 py-5">
                                        <h3 className={`text-[13px] font-semibold mb-3 ${themeClasses.heading}`}>Notes</h3>
                                        <p className={`text-[12px] p-3 rounded-lg border ${themeClasses.input}`}>
                                            {membership.notes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Action Modals ── */}

                    {/* Cancel Modal */}
                    {showCancelModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card} max-w-md w-full`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                                <div className="p-6">
                                    <h3 className={`text-lg font-semibold mb-2 ${themeClasses.body}`}>Cancel Membership</h3>
                                    <p className={`text-sm mb-4 ${themeClasses.muted}`}>
                                        Are you sure you want to cancel this membership? This action can be reversed later by reactivating.
                                    </p>

                                    <div className="mb-4">
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                            Cancellation Reason (Optional)
                                        </label>
                                        <textarea
                                            value={cancellationReason}
                                            onChange={(e) => setCancellationReason(e.target.value)}
                                            rows="3"
                                            className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            placeholder="Enter reason for cancellation..."
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => setShowCancelModal(false)}
                                            className={`px-4 py-2 text-[13px] rounded-lg transition-colors ${themeClasses.muted} hover:text-white`}
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => handleAction('cancel', { reason: cancellationReason })}
                                            disabled={processing}
                                            className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[13px] font-medium hover:bg-red-500/15 transition-colors disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : 'Cancel Membership'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Suspend Modal */}
                    {showSuspendModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card} max-w-md w-full`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
                                <div className="p-6">
                                    <h3 className={`text-lg font-semibold mb-2 ${themeClasses.body}`}>Suspend Membership</h3>
                                    <p className={`text-sm mb-6 ${themeClasses.muted}`}>
                                        Are you sure you want to suspend this membership? The organization will temporarily lose access to features.
                                    </p>
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => setShowSuspendModal(false)}
                                            className={`px-4 py-2 text-[13px] rounded-lg transition-colors ${themeClasses.muted} hover:text-white`}
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => handleAction('suspend')}
                                            disabled={processing}
                                            className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-[13px] font-medium hover:bg-yellow-500/15 transition-colors disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : 'Suspend Membership'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Renew Modal */}
                    {showRenewModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card} max-w-md w-full`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                                <div className="p-6">
                                    <h3 className={`text-lg font-semibold mb-2 ${themeClasses.body}`}>Renew Membership</h3>
                                    <p className={`text-sm mb-6 ${themeClasses.muted}`}>
                                        Are you sure you want to renew this membership? A new billing cycle will start.
                                    </p>
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => setShowRenewModal(false)}
                                            className={`px-4 py-2 text-[13px] rounded-lg transition-colors ${themeClasses.muted} hover:text-white`}
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => handleAction('renew')}
                                            disabled={processing}
                                            className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[13px] font-medium hover:bg-emerald-500/15 transition-colors disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : 'Renew Membership'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Refund Modal */}
                    {showRefundModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${themeClasses.card} max-w-md w-full`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                                <div className="p-6">
                                    <h3 className={`text-lg font-semibold mb-2 ${themeClasses.body}`}>Process Refund</h3>
                                    <p className={`text-sm mb-4 ${themeClasses.muted}`}>
                                        Process a refund for this membership. The membership will be cancelled after refund.
                                    </p>

                                    <div className="mb-4">
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                            Refund Amount (Max: {formatCurrency(membership.price_paid)})
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={refundAmount}
                                                onChange={(e) => setRefundAmount(e.target.value)}
                                                max={membership.price_paid}
                                                className={`w-full pl-8 pr-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                            Refund Reason
                                        </label>
                                        <textarea
                                            value={refundReason}
                                            onChange={(e) => setRefundReason(e.target.value)}
                                            rows="3"
                                            className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            placeholder="Enter reason for refund..."
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => setShowRefundModal(false)}
                                            className={`px-4 py-2 text-[13px] rounded-lg transition-colors ${themeClasses.muted} hover:text-white`}
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => handleAction('refund', { amount: refundAmount, reason: refundReason })}
                                            disabled={processing}
                                            className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-[13px] font-medium hover:bg-purple-500/15 transition-colors disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : 'Process Refund'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
