import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useTheme } from '@/context/ThemeContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function PackagesShow({ package: pkg }) {
    const { auth } = usePage().props;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const user = auth.user;
    const isAdmin = user?.is_admin || false;

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this package?')) {
            router.delete(route('packages.destroy', pkg.id), {
                preserveScroll: true,
            });
        }
    };

    const handleToggleActive = () => {
        router.post(route('packages.toggle-active', pkg.id), {}, {
            preserveScroll: true,
        });
    };

    const handleToggleFeatured = () => {
        router.post(route('packages.toggle-featured', pkg.id), {}, {
            preserveScroll: true,
        });
    };

    const handleTogglePublic = () => {
        router.post(route('packages.toggle-public', pkg.id), {}, {
            preserveScroll: true,
        });
    };

    // Theme classes
    const themeClasses = {
        pageBg: isDark ? 'bg-[#0d0e14]' : 'bg-gray-50',
        card: isDark ? 'bg-[#12131a] border-white/[0.06]' : 'bg-white border-gray-200',
        borderBottom: isDark ? 'border-white/[0.06]' : 'border-gray-200',
        heading: isDark ? 'text-white/90' : 'text-gray-900',
        subheading: isDark ? 'text-slate-600' : 'text-gray-400',
        body: isDark ? 'text-white/85' : 'text-gray-900',
        muted: isDark ? 'text-slate-500' : 'text-gray-500',
        label: isDark ? 'text-slate-300' : 'text-gray-700',
        badgeActive: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
        badgeInactive: isDark ? 'bg-slate-400/10 text-slate-400 border-slate-400/20' : 'bg-gray-100 text-gray-600 border-gray-200',
        badgeFree: isDark ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-violet-100 text-violet-700 border-violet-200',
        badgeFeatured: isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-100 text-purple-700 border-purple-200',
        buttonSecondary: isDark ? 'bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200',
        buttonDanger: isDark ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200',
        headerTitle: isDark ? 'text-white/90' : 'text-gray-900',
        headerSub: isDark ? 'text-slate-500' : 'text-gray-400',
        welcomeGreet: isDark ? 'text-violet-400/70' : 'text-violet-600',
        welcomeName: isDark ? 'text-violet-400' : 'text-violet-600',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className={`w-0.5 h-5 rounded-full ${isDark ? 'bg-violet-500' : 'bg-violet-600'}`} />
                    <div>
                        <h2 className={`text-[13.5px] font-semibold leading-tight tracking-wide ${themeClasses.headerTitle}`}>
                            Package Details
                        </h2>
                        <p className={`text-[11px] font-light tracking-widest uppercase mt-0.5 ${themeClasses.headerSub}`}>
                            {pkg.name}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Package: ${pkg.name}`} />

            <div className={`min-h-screen transition-colors duration-300 ${themeClasses.pageBg}`}>
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Success Message */}
                    {usePage().props.flash?.success && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                            {usePage().props.flash.success}
                        </div>
                    )}

                    {/* Header with Actions */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 mb-6 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

                        <div className="relative px-6 sm:px-8 py-7">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={route('packages.index')}
                                        className={`p-2 rounded-lg transition-colors ${themeClasses.buttonSecondary}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    </Link>
                                    <div>
                                        <p className={`text-[10px] font-bold tracking-[0.35em] uppercase ${themeClasses.welcomeGreet}`}>
                                            Package Details
                                        </p>
                                        <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-snug ${themeClasses.heading}`}>
                                            {pkg.name}
                                        </h1>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('packages.edit', pkg.id)}
                                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-semibold rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Package
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors border ${themeClasses.buttonDanger}`}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className={`px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Basic Information</h3>
                                </div>

                                <div className="p-6">
                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <dt className={`text-[11px] font-light uppercase tracking-wider ${themeClasses.subheading}`}>Package Name</dt>
                                            <dd className={`text-[15px] font-medium mt-1 ${themeClasses.body}`}>{pkg.name}</dd>
                                        </div>
                                        <div>
                                            <dt className={`text-[11px] font-light uppercase tracking-wider ${themeClasses.subheading}`}>Slug</dt>
                                            <dd className={`text-[15px] font-medium mt-1 ${themeClasses.body}`}>{pkg.slug}</dd>
                                        </div>
                                        <div className="md:col-span-2">
                                            <dt className={`text-[11px] font-light uppercase tracking-wider ${themeClasses.subheading}`}>Description</dt>
                                            <dd className={`text-[13px] mt-1 ${themeClasses.body}`}>{pkg.description || 'No description provided'}</dd>
                                        </div>
                                        <div>
                                            <dt className={`text-[11px] font-light uppercase tracking-wider ${themeClasses.subheading}`}>Package Type</dt>
                                            <dd>
                                                <span className={`inline-flex items-center px-2 py-1 mt-1 rounded-md text-[11px] font-semibold border ${themeClasses.badgeFeatured}`}>
                                                    {pkg.package_type}
                                                </span>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className={`text-[11px] font-light uppercase tracking-wider ${themeClasses.subheading}`}>Sort Order</dt>
                                            <dd className={`text-[15px] font-medium mt-1 ${themeClasses.body}`}>{pkg.sort_order}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Limits & Quotas */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className={`px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Limits & Quotas</h3>
                                </div>

                                <div className="p-6">
                                    <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <dt className={`text-[11px] font-light uppercase tracking-wider ${themeClasses.subheading}`}>Projects</dt>
                                            <dd className={`text-[15px] font-medium mt-1 ${themeClasses.body}`}>
                                                {pkg.no_of_projects === 0 ? '∞ Unlimited' : pkg.no_of_projects}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className={`text-[11px] font-light uppercase tracking-wider ${themeClasses.subheading}`}>Tasks per Project</dt>
                                            <dd className={`text-[15px] font-medium mt-1 ${themeClasses.body}`}>
                                                {pkg.no_of_tasks_per_project === 0 ? '∞ Unlimited' : pkg.no_of_tasks_per_project}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className={`text-[11px] font-light uppercase tracking-wider ${themeClasses.subheading}`}>Total Tasks</dt>
                                            <dd className={`text-[15px] font-medium mt-1 ${themeClasses.body}`}>
                                                {pkg.total_tasks_allowed === 0 ? '∞ Unlimited' : pkg.total_tasks_allowed}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className={`text-[11px] font-light uppercase tracking-wider ${themeClasses.subheading}`}>Team Members</dt>
                                            <dd className={`text-[15px] font-medium mt-1 ${themeClasses.body}`}>{pkg.no_of_team_members}</dd>
                                        </div>
                                        <div>
                                            <dt className={`text-[11px] font-light uppercase tracking-wider ${themeClasses.subheading}`}>Clients</dt>
                                            <dd className={`text-[15px] font-medium mt-1 ${themeClasses.body}`}>
                                                {pkg.no_of_clients === 0 ? '∞ Unlimited' : pkg.no_of_clients}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className={`text-[11px] font-light uppercase tracking-wider ${themeClasses.subheading}`}>Storage</dt>
                                            <dd className={`text-[15px] font-medium mt-1 ${themeClasses.body}`}>{pkg.storage_limit_mb} MB</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Features */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className={`px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Features</h3>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${themeClasses.subheading}`}>Time Management</h4>
                                            <ul className="space-y-2">
                                                <FeatureItem label="Time Tracking" enabled={pkg.has_time_tracking} />
                                                <FeatureItem label="Deadline Management" enabled={pkg.has_deadline_management} />
                                                <FeatureItem label="Efficiency Tracking" enabled={pkg.has_efficiency_tracking} />
                                                <FeatureItem label="Reminders" enabled={pkg.has_reminders} />
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${themeClasses.subheading}`}>KPI & Performance</h4>
                                            <ul className="space-y-2">
                                                <FeatureItem label="KPI Tracking" enabled={pkg.has_kpi_tracking} />
                                                {pkg.has_kpi_tracking && (
                                                    <li className={`text-[13px] ml-6 ${themeClasses.body}`}>Points per task: {pkg.kpi_points_per_task}</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${themeClasses.subheading}`}>Advanced</h4>
                                            <ul className="space-y-2">
                                                <FeatureItem label="Priority Support" enabled={pkg.has_priority_support} />
                                                <FeatureItem label="API Access" enabled={pkg.has_api_access} />
                                                <FeatureItem label="Advanced Reports" enabled={pkg.has_advanced_reports} />
                                                <FeatureItem label="Custom Fields" enabled={pkg.has_custom_fields} />
                                                <FeatureItem label="File Attachments" enabled={pkg.has_file_attachments} />
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Status & Pricing */}
                        <div className="space-y-6">
                            {/* Status Cards */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className={`px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Status</h3>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[13px] ${themeClasses.label}`}>Active</span>
                                        <button
                                            onClick={handleToggleActive}
                                            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                                pkg.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : themeClasses.buttonSecondary
                                            }`}
                                        >
                                            {pkg.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[13px] ${themeClasses.label}`}>Featured</span>
                                        <button
                                            onClick={handleToggleFeatured}
                                            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                                pkg.is_featured
                                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                    : themeClasses.buttonSecondary
                                            }`}
                                        >
                                            {pkg.is_featured ? 'Featured' : 'Not Featured'}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[13px] ${themeClasses.label}`}>Public</span>
                                        <button
                                            onClick={handleTogglePublic}
                                            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                                pkg.is_public
                                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    : themeClasses.buttonSecondary
                                            }`}
                                        >
                                            {pkg.is_public ? 'Public' : 'Hidden'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Card */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className={`px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Pricing</h3>
                                </div>

                                <div className="p-6">
                                    {pkg.is_free ? (
                                        <div className="text-center py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${themeClasses.badgeFree}`}>
                                                Free Package
                                            </span>
                                        </div>
                                    ) : (
                                        <dl className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <dt className={`text-[13px] ${themeClasses.label}`}>Monthly</dt>
                                                <dd className={`text-[15px] font-semibold ${themeClasses.body}`}>₹{pkg.price_monthly}</dd>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <dt className={`text-[13px] ${themeClasses.label}`}>Yearly</dt>
                                                <dd className={`text-[15px] font-semibold ${themeClasses.body}`}>₹{pkg.price_yearly}</dd>
                                            </div>
                                            {pkg.setup_fee > 0 && (
                                                <div className="flex justify-between items-center pt-2 border-t">
                                                    <dt className={`text-[13px] ${themeClasses.label}`}>Setup Fee</dt>
                                                    <dd className={`text-[15px] font-semibold ${themeClasses.body}`}>₹{pkg.setup_fee}</dd>
                                                </div>
                                            )}
                                            {pkg.yearly_savings_percentage && (
                                                <div className="mt-2 text-center">
                                                    <span className="text-[11px] text-emerald-400">
                                                        Save {pkg.yearly_savings_percentage}% with yearly billing
                                                    </span>
                                                </div>
                                            )}
                                        </dl>
                                    )}

                                    {pkg.has_trial && (
                                        <div className="mt-4 pt-4 border-t text-center">
                                            <span className={`text-[12px] ${themeClasses.body}`}>
                                                {pkg.trial_days} days free trial
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                                <div className={`px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Quick Actions</h3>
                                </div>

                                <div className="p-6 space-y-2">
                                    <Link
                                        href={route('packages.edit', pkg.id)}
                                        className="w-full px-4 py-2 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 text-[13px] font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Package
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Helper component for feature items
function FeatureItem({ label, enabled }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <li className="flex items-center gap-2">
            {enabled ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            <span className={`text-[13px] ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{label}</span>
        </li>
    );
}
