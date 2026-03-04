import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

export default function OrganizationsEdit({ organization }) {
    const { auth } = usePage().props;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const user = auth.user;
    const isAdmin = user.is_admin || false;

    const { data, setData, put, processing, errors } = useForm({
        name: organization.name || '',
        description: organization.description || '',
        email: organization.email || '',
        phone: organization.phone || '',
        address_line1: organization.address_line1 || '',
        address_line2: organization.address_line2 || '',
        city: organization.city || '',
        state: organization.state || '',
        country: organization.country || '',
        postal_code: organization.postal_code || '',
        db_host: organization.db_host || 'localhost',
        db_port: organization.db_port || '5432',
        db_name: organization.db_name || '',
        db_username: organization.db_username || '',
        db_password: '',
        is_active: organization.is_active,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('organizations.update', organization.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
            router.delete(route('organizations.destroy', organization.id));
        }
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
        textarea: isDark ? 'bg-white/[0.03] border-white/[0.07] text-white/85 placeholder:text-slate-700 focus:border-violet-500/50 focus:bg-violet-500/[0.04]' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:ring-0',

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

        // Form specific
        label: isDark ? 'text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600' : 'text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500',
        helperText: isDark ? 'text-[11px] text-slate-600' : 'text-[11px] text-gray-500',
        errorText: isDark ? 'text-[11px] text-red-400/80' : 'text-[11px] text-red-600',

        // Read-only field
        readOnly: isDark ? 'bg-white/[0.02] text-slate-500 cursor-not-allowed' : 'bg-gray-50 text-gray-500 cursor-not-allowed',
    };

    if (!isAdmin) {
        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center gap-3">
                        <div className={`w-0.5 h-5 rounded-full ${isDark ? 'bg-violet-500' : 'bg-violet-600'}`} />
                        <div>
                            <h2 className={`text-[13.5px] font-semibold leading-tight tracking-wide ${themeClasses.headerTitle}`}>
                                Edit Organization
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
                                    You need administrator privileges to edit organizations.
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
                            Edit Organization
                        </h2>
                        <p className={`text-[11px] font-light tracking-widest uppercase mt-0.5 ${themeClasses.headerSub}`}>
                            {organization.name}
                        </p>
                    </div>
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                        organization.is_active ? themeClasses.badgeActive : themeClasses.badgeInactive
                    }`}>
                        {organization.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            }
        >
            <Head title={`Edit ${organization.name}`} />

            <div className={`min-h-screen transition-colors duration-300 ${themeClasses.pageBg}`}>
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

                    {/* ── Welcome Banner ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                        <div className="absolute top-0 right-0 w-96 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative px-6 sm:px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-bold tracking-[0.35em] uppercase mb-2 ${themeClasses.welcomeGreet}`}>
                                    Edit Organization
                                </p>
                                <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-snug ${themeClasses.welcomeTitle}`}>
                                    Editing <span className={themeClasses.welcomeName}>{organization.name}</span>
                                </h1>
                                <p className={`text-sm font-light mt-2 leading-relaxed max-w-md ${themeClasses.welcomeDesc}`}>
                                    Update the organization details below. Leave password blank to keep current password.
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
                                    View
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

                    {/* ── Edit Form ── */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Basic Information */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className={`px-5 sm:px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Basic Information</h3>
                                    <p className={`text-[11px] font-light tracking-wide hidden sm:block ${themeClasses.subheading}`}>
                                        Organization details and contact information
                                    </p>
                                </div>
                            </div>

                            <div className="px-5 sm:px-6 py-6 space-y-5">
                                {/* Slug (Read-only) */}
                                <div className="space-y-1.5">
                                    <label className={`block ${themeClasses.label}`}>
                                        Slug
                                    </label>
                                    <input
                                        type="text"
                                        value={organization.slug}
                                        disabled
                                        className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.readOnly}`}
                                    />
                                    <p className={themeClasses.helperText}>Unique identifier (auto-generated)</p>
                                </div>

                                {/* Organization Name */}
                                <div className="space-y-1.5">
                                    <label htmlFor="name" className={`block ${themeClasses.label}`}>
                                        Organization Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                        placeholder="Acme Corporation"
                                    />
                                    {errors.name && (
                                        <p className={themeClasses.errorText}>{errors.name}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label htmlFor="description" className={`block ${themeClasses.label}`}>
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        rows="3"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 resize-none ${themeClasses.textarea}`}
                                        placeholder="Brief description of the organization..."
                                    />
                                    {errors.description && (
                                        <p className={themeClasses.errorText}>{errors.description}</p>
                                    )}
                                </div>

                                {/* Contact Information - Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="email" className={`block ${themeClasses.label}`}>
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            placeholder="info@acme.com"
                                        />
                                        {errors.email && (
                                            <p className={themeClasses.errorText}>{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="phone" className={`block ${themeClasses.label}`}>
                                            Phone
                                        </label>
                                        <input
                                            id="phone"
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            placeholder="+1-555-123-4567"
                                        />
                                        {errors.phone && (
                                            <p className={themeClasses.errorText}>{errors.phone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-1.5">
                                    <label className={`block ${themeClasses.label}`}>Status</label>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="is_active"
                                                checked={data.is_active === true}
                                                onChange={() => setData('is_active', true)}
                                                className="sr-only peer"
                                            />
                                            <div className={`w-4 h-4 border rounded-full peer-checked:border-4 transition-all duration-200 ${
                                                isDark
                                                    ? 'border-white/[0.12] peer-checked:border-emerald-400'
                                                    : 'border-gray-300 peer-checked:border-emerald-500'
                                            }`} />
                                            <span className={`text-[12px] ${themeClasses.body}`}>Active</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="is_active"
                                                checked={data.is_active === false}
                                                onChange={() => setData('is_active', false)}
                                                className="sr-only peer"
                                            />
                                            <div className={`w-4 h-4 border rounded-full peer-checked:border-4 transition-all duration-200 ${
                                                isDark
                                                    ? 'border-white/[0.12] peer-checked:border-slate-400'
                                                    : 'border-gray-300 peer-checked:border-gray-500'
                                            }`} />
                                            <span className={`text-[12px] ${themeClasses.body}`}>Inactive</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className={`px-5 sm:px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Address</h3>
                                    <p className={`text-[11px] font-light tracking-wide hidden sm:block ${themeClasses.subheading}`}>
                                        Physical location of the organization
                                    </p>
                                </div>
                            </div>

                            <div className="px-5 sm:px-6 py-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="address_line1" className={`block ${themeClasses.label}`}>
                                        Address Line 1
                                    </label>
                                    <input
                                        id="address_line1"
                                        type="text"
                                        value={data.address_line1}
                                        onChange={e => setData('address_line1', e.target.value)}
                                        className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                        placeholder="123 Business Ave"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="address_line2" className={`block ${themeClasses.label}`}>
                                        Address Line 2
                                    </label>
                                    <input
                                        id="address_line2"
                                        type="text"
                                        value={data.address_line2}
                                        onChange={e => setData('address_line2', e.target.value)}
                                        className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                        placeholder="Suite 100"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="city" className={`block ${themeClasses.label}`}>
                                            City
                                        </label>
                                        <input
                                            id="city"
                                            type="text"
                                            value={data.city}
                                            onChange={e => setData('city', e.target.value)}
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            placeholder="San Francisco"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="state" className={`block ${themeClasses.label}`}>
                                            State
                                        </label>
                                        <input
                                            id="state"
                                            type="text"
                                            value={data.state}
                                            onChange={e => setData('state', e.target.value)}
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            placeholder="CA"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="country" className={`block ${themeClasses.label}`}>
                                            Country
                                        </label>
                                        <input
                                            id="country"
                                            type="text"
                                            value={data.country}
                                            onChange={e => setData('country', e.target.value)}
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            placeholder="USA"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="postal_code" className={`block ${themeClasses.label}`}>
                                            Postal Code
                                        </label>
                                        <input
                                            id="postal_code"
                                            type="text"
                                            value={data.postal_code}
                                            onChange={e => setData('postal_code', e.target.value)}
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            placeholder="94105"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Database Credentials */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className={`px-5 sm:px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1.5 4 4 4h8c2.5 0 4-2 4-4V7c0-2-1.5-4-4-4H8c-2.5 0-4 2-4 4z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v5h8V3" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Database Credentials</h3>
                                    <p className={`text-[11px] font-light tracking-wide hidden sm:block ${themeClasses.subheading}`}>
                                        Tenant database connection details
                                    </p>
                                </div>
                            </div>

                            <div className="px-5 sm:px-6 py-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="db_host" className={`block ${themeClasses.label}`}>
                                            Database Host <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            id="db_host"
                                            type="text"
                                            value={data.db_host}
                                            onChange={e => setData('db_host', e.target.value)}
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            placeholder="localhost"
                                        />
                                        {errors.db_host && (
                                            <p className={themeClasses.errorText}>{errors.db_host}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="db_port" className={`block ${themeClasses.label}`}>
                                            Database Port <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            id="db_port"
                                            type="text"
                                            value={data.db_port}
                                            onChange={e => setData('db_port', e.target.value)}
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            placeholder="5432"
                                        />
                                        {errors.db_port && (
                                            <p className={themeClasses.errorText}>{errors.db_port}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="db_name" className={`block ${themeClasses.label}`}>
                                        Database Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        id="db_name"
                                        type="text"
                                        value={data.db_name}
                                        onChange={e => setData('db_name', e.target.value)}
                                        className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                        placeholder="acme_tenant"
                                    />
                                    <p className={themeClasses.helperText}>Must be unique across all organizations</p>
                                    {errors.db_name && (
                                        <p className={themeClasses.errorText}>{errors.db_name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="db_username" className={`block ${themeClasses.label}`}>
                                            Database Username <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            id="db_username"
                                            type="text"
                                            value={data.db_username}
                                            onChange={e => setData('db_username', e.target.value)}
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            placeholder="acme_user"
                                        />
                                        {errors.db_username && (
                                            <p className={themeClasses.errorText}>{errors.db_username}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="db_password" className={`block ${themeClasses.label}`}>
                                            Database Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="db_password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.db_password}
                                                onChange={e => setData('db_password', e.target.value)}
                                                className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 pr-10 ${themeClasses.input}`}
                                                placeholder="Leave blank to keep current"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                                            >
                                                {showPassword ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <p className={themeClasses.helperText}>Leave blank to keep current password</p>
                                        {errors.db_password && (
                                            <p className={themeClasses.errorText}>{errors.db_password}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-5 py-2.5 rounded-lg text-[12px] font-semibold tracking-wider transition-all duration-200 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('organizations.index')}
                                    className={`px-5 py-2.5 rounded-lg text-[12px] font-semibold tracking-wider transition-all duration-200 ${themeClasses.rowHover} ${themeClasses.muted}`}
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="relative overflow-hidden group/btn bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 disabled:from-violet-600/30 disabled:to-indigo-700/30 text-white disabled:text-white/30 text-[12px] font-semibold tracking-[0.12em] uppercase py-2.5 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-violet-900/40 ring-1 ring-violet-500/30 disabled:ring-violet-500/10 disabled:shadow-none flex items-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Update Organization
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
