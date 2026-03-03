import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function OrganizationsIndex({ organizations, filters }) {
    const { auth } = usePage().props;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const user = auth.user;
    const userRole = user?.role_type;
    const isAdmin = user.is_admin || false;

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [loading, setLoading] = useState(false);

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
            if (searchTerm !== filters?.search || statusFilter !== filters?.status) {
                setLoading(true);
                router.get(
                    route('organizations.index'),
                    {
                        search: searchTerm,
                        status: statusFilter,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true, // Use replace instead of push to avoid history clutter
                        onFinish: () => setLoading(false),
                    }
                );
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter]); // Add statusFilter to dependencies

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        // The useEffect will handle the navigation
    };

    const handleDelete = (organization) => {
        if (confirm(`Are you sure you want to delete ${organization.name}?`)) {
            router.delete(route('organizations.destroy', organization.id), {
                preserveScroll: true,
            });
        }
    };

    const handleToggleStatus = (organization) => {
        router.patch(route('organizations.toggle-status', organization.id), {}, {
            preserveScroll: true,
        });
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    // ── Theme variables — matching Dashboard style ──
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

        // Header specific
        headerTitle: isDark ? 'text-white/90' : 'text-gray-900',
        headerSub: isDark ? 'text-slate-500' : 'text-gray-400',

        // Welcome banner specific
        welcomeGreet: isDark ? 'text-violet-400/70' : 'text-violet-600',
        welcomeTitle: isDark ? 'text-white/90' : 'text-gray-900',
        welcomeName: isDark ? 'text-violet-400' : 'text-violet-600',
        welcomeDesc: isDark ? 'text-slate-500' : 'text-gray-500',
        welcomeUserName: isDark ? 'text-white/60' : 'text-gray-700',
        welcomeUserEmail: isDark ? 'text-slate-600' : 'text-gray-400',
        welcomeBadge: isDark ? 'bg-violet-500/10 text-violet-400 border-violet-400/20' : 'bg-violet-50 text-violet-700 border-violet-200',
        welcomeAvatar: isDark ? 'bg-violet-600/15 border-violet-500/25 text-violet-400' : 'bg-violet-50 border-violet-200 text-violet-600',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className={`w-0.5 h-5 rounded-full ${isDark ? 'bg-violet-500' : 'bg-violet-600'}`} />
                    <div>
                        <h2 className={`text-[13.5px] font-semibold leading-tight tracking-wide ${themeClasses.headerTitle}`}>
                            Organizations
                        </h2>
                        <p className={`text-[11px] font-light tracking-widest uppercase mt-0.5 ${themeClasses.headerSub}`}>
                            Manage tenant organizations
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
            <Head title="Organizations" />

            <div className={`min-h-screen transition-colors duration-300 ${themeClasses.pageBg}`}>
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

                    {/* ── Welcome Banner ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                        <div className="absolute top-0 right-0 w-96 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative px-6 sm:px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-bold tracking-[0.35em] uppercase mb-2 ${themeClasses.welcomeGreet}`}>
                                    Organization Management
                                </p>
                                <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-snug ${themeClasses.welcomeTitle}`}>
                                    All <span className={themeClasses.welcomeName}>Organizations</span>
                                </h1>
                                <p className={`text-sm font-light mt-2 leading-relaxed max-w-md ${themeClasses.welcomeDesc}`}>
                                    {isAdmin
                                        ? `Total ${organizations.total || 0} organizations in the system.`
                                        : "You don't have permission to manage organizations."}
                                </p>
                            </div>

                            {isAdmin && (
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <Link
                                        href={route('organizations.create')}
                                        className="px-4 py-2 bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white text-[12px] font-semibold tracking-wider uppercase rounded-lg shadow-lg shadow-violet-900/40 ring-1 ring-violet-500/30 transition-all duration-300 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        New Organization
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
                                    You need administrator privileges to manage organizations.
                                    Please contact your system administrator for access.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ── Filters Bar ── */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search organizations..."
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
                                </div>
                            </div>

                            {/* ── Organizations Table ── */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className={`px-5 sm:px-6 py-4 border-b flex items-center justify-between ${themeClasses.borderBottom}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Organizations</h3>
                                            <p className={`text-[11px] font-light tracking-wide hidden sm:block ${themeClasses.subheading}`}>
                                                {organizations.total} total • Showing {organizations.from || 0} to {organizations.to || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px]">
                                        <thead>
                                            <tr className={`border-b ${themeClasses.borderBottom}`}>
                                                <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Organization</th>
                                                <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Contact</th>
                                                <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Location</th>
                                                <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Database</th>
                                                <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Status</th>
                                                <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Created</th>
                                                <th className={`text-right px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${themeClasses.divide}`}>
                                            {organizations.data?.map((org) => (
                                                <tr key={org.id} className={`transition-colors ${themeClasses.rowHover}`}>
                                                    <td className="px-5 sm:px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${themeClasses.card}`}>
                                                                <span className="text-xs font-semibold text-violet-400">
                                                                    {org.name.charAt(0)}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <Link
                                                                    href={route('organizations.show', org.id)}
                                                                    className={`text-[13px] font-medium hover:text-violet-400 transition-colors ${themeClasses.body}`}
                                                                >
                                                                    {org.name}
                                                                </Link>
                                                                <p className={`text-[11px] font-light ${themeClasses.subheading}`}>
                                                                    {org.slug}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 sm:px-6 py-4">
                                                        <div>
                                                            <p className={`text-[13px] ${themeClasses.body}`}>{org.email || '—'}</p>
                                                            <p className={`text-[11px] font-light ${themeClasses.subheading}`}>{org.phone || '—'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 sm:px-6 py-4">
                                                        <p className={`text-[13px] ${themeClasses.body}`}>
                                                            {[org.city, org.state, org.country].filter(Boolean).join(', ') || '—'}
                                                        </p>
                                                        {org.address_line1 && (
                                                            <p className={`text-[11px] font-light ${themeClasses.subheading}`}>
                                                                {org.address_line1}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-5 sm:px-6 py-4">
                                                        <p className={`text-[13px] ${themeClasses.body}`}>{org.db_name}</p>
                                                        <p className={`text-[11px] font-light ${themeClasses.subheading}`}>
                                                            {org.db_host}:{org.db_port}
                                                        </p>
                                                    </td>
                                                    <td className="px-5 sm:px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold border ${
                                                            org.is_active ? themeClasses.badgeActive : themeClasses.badgeInactive
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${org.is_active ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                                                            {org.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 sm:px-6 py-4">
                                                        <p className={`text-[13px] ${themeClasses.body}`}>{formatDate(org.created_at)}</p>
                                                    </td>
                                                    <td className="px-5 sm:px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleToggleStatus(org)}
                                                                className={`p-1.5 rounded-lg transition-colors ${themeClasses.rowHover}`}
                                                                title={org.is_active ? 'Deactivate' : 'Activate'}
                                                            >
                                                                {org.is_active ? (
                                                                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                            <Link
                                                                href={route('organizations.edit', org.id)}
                                                                className={`p-1.5 rounded-lg transition-colors ${themeClasses.rowHover}`}
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(org)}
                                                                className={`p-1.5 rounded-lg transition-colors ${themeClasses.rowHover}`}
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

                                    {organizations.data?.length === 0 && (
                                        <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                                            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-3 ${themeClasses.card}`}>
                                                <svg className={`w-5 h-5 ${themeClasses.muted}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <p className={`text-[13px] font-light ${themeClasses.muted}`}>No organizations found</p>
                                            <Link
                                                href={route('organizations.create')}
                                                className="mt-4 px-4 py-2 bg-violet-600/10 border border-violet-500/20 rounded-lg text-violet-400 text-[13px] hover:bg-violet-600/15 transition-colors"
                                            >
                                                Create your first organization
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* ── Pagination ── */}
                                {organizations.links && organizations.total > organizations.per_page && (
                                    <div className={`px-5 sm:px-6 py-4 border-t flex items-center justify-between ${themeClasses.borderBottom}`}>
                                        <p className={`text-[11px] ${themeClasses.muted}`}>
                                            Showing {organizations.from || 0} to {organizations.to || 0} of {organizations.total} results
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {organizations.links.map((link, index) => {
                                                if (index === 0 || index === organizations.links.length - 1) return null;
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
        </AuthenticatedLayout>
    );
}
