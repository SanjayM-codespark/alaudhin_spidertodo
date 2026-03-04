import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function OrganizationUsers({ organization, users }) {
    const { auth } = usePage().props;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const user = auth.user;
    const isAdmin = user.is_admin || false;

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole =
            roleFilter === '' ||
            (roleFilter === 'admin' && user.is_admin) ||
            (roleFilter === 'staff' && user.is_staff && !user.is_admin);

        return matchesSearch && matchesRole;
    });

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    // ── Theme variables ──
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
        badgeAdmin: isDark ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-violet-100 text-violet-700 border-violet-200',
        badgeStaff: isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-700 border-blue-200',

        // Header specific
        headerTitle: isDark ? 'text-white/90' : 'text-gray-900',
        headerSub: isDark ? 'text-slate-500' : 'text-gray-400',

        // Welcome banner specific
        welcomeGreet: isDark ? 'text-violet-400/70' : 'text-violet-600',
        welcomeTitle: isDark ? 'text-white/90' : 'text-gray-900',
        welcomeName: isDark ? 'text-violet-400' : 'text-violet-600',
        welcomeDesc: isDark ? 'text-slate-500' : 'text-gray-500',
    };

    if (!isAdmin) {
        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center gap-3">
                        <div className={`w-0.5 h-5 rounded-full ${isDark ? 'bg-violet-500' : 'bg-violet-600'}`} />
                        <div>
                            <h2 className={`text-[13.5px] font-semibold leading-tight tracking-wide ${themeClasses.headerTitle}`}>
                                Organization Users
                            </h2>
                            <p className={`text-[11px] font-light tracking-widest uppercase mt-0.5 ${themeClasses.headerSub}`}>
                                Access Restricted
                            </p>
                        </div>
                    </div>
                }
            >
                <Head title="Access Restricted" />
                <div className={`min-h-screen transition-colors duration-300 ${themeClasses.pageBg}`}>
                    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                    You need administrator privileges to view organization users.
                                    Please contact your system administrator for access.
                                </p>
                                <Link
                                    href={route('organizations.index')}
                                    className="mt-6 px-4 py-2 bg-violet-600/10 border border-violet-500/20 rounded-lg text-violet-400 text-[13px] hover:bg-violet-600/15 transition-colors"
                                >
                                    Back to Organizations
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className={`w-0.5 h-5 rounded-full ${isDark ? 'bg-violet-500' : 'bg-violet-600'}`} />
                    <div>
                        <h2 className={`text-[13.5px] font-semibold leading-tight tracking-wide ${themeClasses.headerTitle}`}>
                            Organization Users
                        </h2>
                        <p className={`text-[11px] font-light tracking-widest uppercase mt-0.5 ${themeClasses.headerSub}`}>
                            {organization.name}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`${organization.name} - Users`} />

            <div className={`min-h-screen transition-colors duration-300 ${themeClasses.pageBg}`}>
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

                    {/* ── Welcome Banner ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                        <div className="absolute top-0 right-0 w-96 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative px-6 sm:px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-bold tracking-[0.35em] uppercase mb-2 ${themeClasses.welcomeGreet}`}>
                                    Staff Management
                                </p>
                                <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-snug ${themeClasses.welcomeTitle}`}>
                                    <span className={themeClasses.welcomeName}>{organization.name}</span> Users
                                </h1>
                                <p className={`text-sm font-light mt-2 leading-relaxed max-w-md ${themeClasses.welcomeDesc}`}>
                                    Managing {users.length} staff member{users.length !== 1 ? 's' : ''} for this organization
                                </p>
                            </div>

                            <div className="flex items-center gap-4 flex-shrink-0">
                                <Link
                                    href={route('organizations.show', organization.id)}
                                    className="px-4 py-2 bg-white/[0.05] border border-white/[0.1] text-white/80 hover:text-white hover:bg-white/[0.1] text-[12px] font-semibold tracking-wider uppercase rounded-lg transition-all duration-300 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Organization
                                </Link>
                                <Link
                                    href={route('organizations.index')}
                                    className="px-4 py-2 bg-white/[0.05] border border-white/[0.1] text-white/80 hover:text-white hover:bg-white/[0.1] text-[12px] font-semibold tracking-wider uppercase rounded-lg transition-all duration-300 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ── Filters Bar ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                        <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 pl-10 ${themeClasses.input}`}
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setRoleFilter('')}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                        roleFilter === ''
                                            ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                                            : `${themeClasses.muted} ${themeClasses.rowHover}`
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setRoleFilter('admin')}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                        roleFilter === 'admin'
                                            ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                                            : `${themeClasses.muted} ${themeClasses.rowHover}`
                                    }`}
                                >
                                    Admin
                                </button>
                                <button
                                    onClick={() => setRoleFilter('staff')}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                        roleFilter === 'staff'
                                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                            : `${themeClasses.muted} ${themeClasses.rowHover}`
                                    }`}
                                >
                                    Staff
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Users Table ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                        <div className={`px-5 sm:px-6 py-4 border-b flex items-center justify-between ${themeClasses.borderBottom}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Staff Members</h3>
                                    <p className={`text-[11px] font-light tracking-wide hidden sm:block ${themeClasses.subheading}`}>
                                        {filteredUsers.length} users • {users.filter(u => u.is_admin).length} admins • {users.filter(u => u.is_staff && !u.is_admin).length} staff
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className={`border-b ${themeClasses.borderBottom}`}>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>User</th>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Username</th>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Email</th>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Role</th>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Status</th>
                                        <th className={`text-left px-5 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Joined</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${themeClasses.divide}`}>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className={`transition-colors ${themeClasses.rowHover}`}>
                                            <td className="px-5 sm:px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${themeClasses.card}`}>
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                                                        ) : (
                                                            <span className="text-xs font-semibold text-violet-400">
                                                                {user.name?.charAt(0) || user.email?.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`text-[13px] font-medium ${themeClasses.body}`}>
                                                            {user.name || '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <p className={`text-[13px] ${themeClasses.body}`}>{user.username}</p>
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <p className={`text-[13px] ${themeClasses.body}`}>{user.email}</p>
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {user.is_admin && (
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider border ${themeClasses.badgeAdmin}`}>
                                                            Admin
                                                        </span>
                                                    )}
                                                    {user.is_staff && !user.is_admin && (
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider border ${themeClasses.badgeStaff}`}>
                                                            Staff
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold border ${
                                                    user.email_verified_at
                                                        ? themeClasses.badgeActive
                                                        : themeClasses.badgeInactive
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        user.email_verified_at ? 'bg-emerald-400' : 'bg-slate-400'
                                                    }`} />
                                                    {user.email_verified_at ? 'Verified' : 'Unverified'}
                                                </span>
                                            </td>
                                            <td className="px-5 sm:px-6 py-4">
                                                <p className={`text-[13px] ${themeClasses.body}`}>
                                                    {formatDate(user.created_at)}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredUsers.length === 0 && (
                                <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-3 ${themeClasses.card}`}>
                                        <svg className={`w-5 h-5 ${themeClasses.muted}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <p className={`text-[13px] font-light ${themeClasses.muted}`}>No users found</p>
                                    <p className={`text-[11px] mt-1 ${themeClasses.subheading}`}>
                                        {searchTerm || roleFilter ? 'Try adjusting your filters' : 'This organization has no staff members yet'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Summary Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
                            <div className="px-5 py-4">
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Total Users</p>
                                <p className={`text-2xl font-semibold mt-1 ${themeClasses.body}`}>{users.length}</p>
                            </div>
                        </div>

                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
                            <div className="px-5 py-4">
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Admins</p>
                                <p className={`text-2xl font-semibold mt-1 text-violet-400`}>
                                    {users.filter(u => u.is_admin).length}
                                </p>
                            </div>
                        </div>

                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
                            <div className="px-5 py-4">
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${themeClasses.subheading}`}>Staff</p>
                                <p className={`text-2xl font-semibold mt-1 text-blue-400`}>
                                    {users.filter(u => u.is_staff && !u.is_admin).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
