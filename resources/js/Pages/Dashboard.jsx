import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '@/context/ThemeContext';

export default function Dashboard({ stats, recentOrders, recentActivities }) {
    const { auth } = usePage().props;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const user = auth.user;
    const userRole = user?.role_type;
    const isAdmin = userRole === 'admin';
    const isVendor = userRole === 'vendor';

    const [dashboardStats, setDashboardStats] = useState(stats || {
        total_orders: 0,
        total_revenue: 0,
        total_customers: 0,
        total_products: 0,
        pending_orders: 0,
        overdue_orders: 0,
        due_today: 0,
        change_percentages: { orders: 0, revenue: 0, customers: 0, products: 0 }
    });

    const [orders, setOrders] = useState(recentOrders || []);
    const [activities, setActivities] = useState(recentActivities || []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(route('dashboard.stats'));
                setDashboardStats(response.data.stats);
                setOrders(response.data.recentOrders || []);
                setActivities(response.data.recentActivities || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        if (!stats) { fetchDashboardData(); } else { setLoading(false); }
    }, [stats]);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR',
        minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(value || 0);

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    // ── Theme variables — all in one place for consistency ──
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

        // Boxes
        numberBox: isDark ? 'bg-white/[0.04] border-white/[0.07]' : 'bg-gray-100 border-gray-200',
        emptyBox: isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-gray-50 border-gray-200',
        emptyIcon: isDark ? 'text-slate-600' : 'text-gray-300',
        activityBox: isDark ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-gray-100 border-gray-200',
        activityText: isDark ? 'text-white/75' : 'text-gray-700',
        supportText: isDark ? 'text-slate-600' : 'text-gray-400',

        // Loading states
        spinner: isDark ? 'border-violet-400/20 border-t-violet-400' : 'border-violet-200 border-t-violet-500',
        skeleton: isDark ? 'bg-white/[0.05]' : 'bg-gray-100',

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
                            Dashboard
                        </h2>
                        <p className={`text-[11px] font-light tracking-widest uppercase mt-0.5 ${themeClasses.headerSub}`}>
                            {isVendor ? 'Order Overview' : 'Overview & Analytics'}
                        </p>
                    </div>
                    {isVendor && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-400/20">
                            Vendor
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className={`min-h-screen transition-colors duration-300 ${themeClasses.pageBg}`}>
                <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

                    {/* ── Welcome Banner ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                        <div className="absolute top-0 right-0 w-96 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-1/4 w-64 h-40 bg-indigo-600/4 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative px-6 sm:px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-bold tracking-[0.35em] uppercase mb-2 ${themeClasses.welcomeGreet}`}>
                                    {greeting}
                                </p>
                                <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-snug ${themeClasses.welcomeTitle}`}>
                                    Welcome back,{' '}
                                    <span className={themeClasses.welcomeName}>{user?.name ?? 'User'}</span>
                                </h1>
                                <p className={`text-sm font-light mt-2 leading-relaxed max-w-md ${themeClasses.welcomeDesc}`}>
                                    {isVendor
                                        ? `You have ${dashboardStats.pending_orders || 0} pending orders and ${dashboardStats.due_today || 0} due today.`
                                        : "Here's what's happening with your business today."}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="text-right hidden sm:block">
                                    <p className={`text-[13px] font-medium leading-tight ${themeClasses.welcomeUserName}`}>{user?.name}</p>
                                    <p className={`text-[11px] font-light mt-0.5 ${themeClasses.welcomeUserEmail}`}>{user?.email}</p>
                                    <span className={`inline-flex mt-1.5 items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${themeClasses.welcomeBadge}`}>
                                        {userRole}
                                    </span>
                                </div>
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center flex-shrink-0 ${themeClasses.welcomeAvatar}`}>
                                    <span className="text-xl font-semibold uppercase">
                                        {user?.name?.charAt(0) ?? 'U'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Stats Grid ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <StatCard
                            label="Total Orders"
                            value={dashboardStats.total_orders?.toString() || "0"}
                            change={dashboardStats.change_percentages?.orders}
                            icon={<OrderIcon />}
                            color="violet"
                            loading={loading}
                            isDark={isDark}
                        />
                        <StatCard
                            label="Revenue"
                            value={formatCurrency(dashboardStats.total_revenue)}
                            change={dashboardStats.change_percentages?.revenue}
                            icon={<RevenueIcon />}
                            color="emerald"
                            loading={loading}
                            isDark={isDark}
                        />
                        <StatCard
                            label="Customers"
                            value={dashboardStats.total_customers?.toString() || "0"}
                            change={dashboardStats.change_percentages?.customers}
                            icon={<UsersIcon />}
                            color="blue"
                            loading={loading}
                            isDark={isDark}
                        />
                        <StatCard
                            label="Products"
                            value={isAdmin ? (dashboardStats.total_products?.toString() || "0") : "—"}
                            change={isAdmin ? dashboardStats.change_percentages?.products : null}
                            icon={<ProductIcon />}
                            color="indigo"
                            loading={loading}
                            isRestricted={isVendor}
                            isDark={isDark}
                        />
                    </div>

                    {/* ── Vendor Status Row ── */}
                    {isVendor && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <MiniStatusCard
                                label="Pending Orders"
                                value={dashboardStats.pending_orders || 0}
                                color="amber"
                                loading={loading}
                                isDark={isDark}
                            />
                            <MiniStatusCard
                                label="Due Today"
                                value={dashboardStats.due_today || 0}
                                color="blue"
                                loading={loading}
                                isDark={isDark}
                            />
                            <MiniStatusCard
                                label="Overdue"
                                value={dashboardStats.overdue_orders || 0}
                                color="red"
                                loading={loading}
                                isDark={isDark}
                            />
                        </div>
                    )}

                    {/* ── Main Content Row ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                        {/* Recent Orders */}
                        <div className={`lg:col-span-2 relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className={`px-5 sm:px-6 py-4 border-b flex items-center justify-between ${themeClasses.borderBottom}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Recent Orders</h3>
                                        <p className={`text-[11px] font-light tracking-wide hidden sm:block ${themeClasses.subheading}`}>
                                            {isVendor ? 'Your latest orders' : 'Latest orders in the system'}
                                        </p>
                                    </div>
                                </div>
                                <Link href={route('orders.index')} className="flex items-center gap-1 text-[12px] text-violet-400 hover:text-violet-300 transition-colors">
                                    View all
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            {loading ? (
                                <div className="px-6 py-12 flex items-center justify-center">
                                    <div className={`w-7 h-7 border-2 rounded-full animate-spin ${themeClasses.spinner}`} />
                                </div>
                            ) : orders.length > 0 ? (
                                <div className={`divide-y ${themeClasses.divide}`}>
                                    {orders.map((order) => (
                                        <Link key={order.id} href={route('orders.show', order.id)}
                                            className={`flex items-center justify-between px-5 sm:px-6 py-3.5 transition-colors group ${themeClasses.rowHover}`}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${themeClasses.numberBox}`}>
                                                    <span className="text-[11px] font-mono text-violet-400 font-semibold">
                                                        #{order.order_number?.slice(-4) ?? '—'}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-[13px] font-medium truncate ${themeClasses.body}`}>
                                                        {order.customer_name || 'Walk-in Customer'}
                                                    </p>
                                                    <p className={`text-[11px] font-light ${themeClasses.subheading}`}>
                                                        {formatDate(order.order_date)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                                                <span className={`hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getStatusColor(order.status, isDark)}`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-[13px] font-semibold text-emerald-400 whitespace-nowrap">
                                                    {formatCurrency(order.total_amount)}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-3 ${themeClasses.emptyBox}`}>
                                        <svg className={`w-5 h-5 ${themeClasses.emptyIcon}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <p className={`text-[13px] font-light ${themeClasses.muted}`}>No orders yet</p>
                                    {isAdmin && (
                                        <Link href={route('orders.create')} className="mt-4 px-4 py-2 bg-violet-600/10 border border-violet-500/20 rounded-lg text-violet-400 text-[13px] hover:bg-violet-600/15 transition-colors">
                                            Create first order
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className={`px-5 sm:px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Quick Links</h3>
                                    <p className={`text-[11px] font-light tracking-wide hidden sm:block ${themeClasses.subheading}`}>Shortcuts</p>
                                </div>
                            </div>

                            <div className="px-3 sm:px-4 py-3 space-y-0.5">
                                <QuickLink href={route('profile.edit')} label="Edit Profile" icon={<ProfileIcon />} isDark={isDark} />
                                <QuickLink href={route('orders.index')} label="View Orders" icon={<OrdersIcon />} isDark={isDark} />
                                {isAdmin && (
                                    <>
                                        <QuickLink href={route('products.index')} label="Products" icon={<BoxIcon />} isDark={isDark} />
                                        <QuickLink href={route('measurement-units.index')} label="Measurement Units" icon={<RulerIcon />} isDark={isDark} />
                                    </>
                                )}
                                <QuickLink href="#" label="Documentation" icon={<DocIcon />} external isDark={isDark} />
                            </div>

                            <div className={`px-5 sm:px-6 py-4 border-t ${themeClasses.borderBottom}`}>
                                <p className={`text-[11px] leading-relaxed ${themeClasses.supportText}`}>
                                    Need help?{' '}
                                    <a href="mailto:support@spidetodo.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                                        Contact support
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Recent Activity ── */}
                    {isAdmin && (
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className={`px-5 sm:px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Recent Activity</h3>
                                    <p className={`text-[11px] font-light tracking-wide hidden sm:block ${themeClasses.subheading}`}>Latest actions in the system</p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="px-6 py-10 flex items-center justify-center">
                                    <div className={`w-7 h-7 border-2 rounded-full animate-spin ${themeClasses.spinner}`} />
                                </div>
                            ) : activities.length > 0 ? (
                                <div className={`divide-y ${themeClasses.divide}`}>
                                    {activities.map((activity, index) => (
                                        <div key={index} className="px-5 sm:px-6 py-3 flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${themeClasses.activityBox}`}>
                                                <span className="text-sm leading-none">{activity.icon || '📝'}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[13px] leading-snug truncate ${themeClasses.activityText}`}>{activity.description}</p>
                                                <p className={`text-[11px] font-light mt-0.5 ${themeClasses.subheading}`}>{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-6 py-8 flex items-center justify-center">
                                    <p className={`text-[13px] font-light ${themeClasses.muted}`}>No recent activity</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, change, icon, color, loading, isRestricted, isDark }) {
    const colorMap = {
        violet:  { iconBg: "bg-violet-500/10",  iconBorder: "border-violet-500/20",  iconText: "text-violet-400",  via: "via-violet-500/30"  },
        emerald: { iconBg: "bg-emerald-500/10", iconBorder: "border-emerald-500/20", iconText: "text-emerald-400", via: "via-emerald-500/30" },
        blue:    { iconBg: "bg-blue-500/10",    iconBorder: "border-blue-500/20",    iconText: "text-blue-400",    via: "via-blue-500/30"    },
        indigo:  { iconBg: "bg-indigo-500/10",  iconBorder: "border-indigo-500/20",  iconText: "text-indigo-400",  via: "via-indigo-500/30"  },
    };
    const c = colorMap[color] ?? colorMap.violet;

    const card = isDark ? 'bg-[#12131a] border-white/[0.06]' : 'bg-white border-gray-200';
    const cardHover = isDark ? 'hover:border-white/[0.10] hover:bg-[#141520]' : 'hover:border-gray-300 hover:shadow-sm';
    const valueText = isDark ? 'text-white/85' : 'text-gray-900';
    const labelText = isDark ? 'text-slate-500' : 'text-gray-500';
    const skeleton = isDark ? 'bg-white/[0.05]' : 'bg-gray-100';
    const ghost = isDark ? 'text-white/30' : 'text-gray-300';

    if (isRestricted) {
        return (
            <div className={`relative rounded-2xl border overflow-hidden opacity-40 select-none transition-colors duration-300 ${card}`}>
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${c.via} to-transparent`} />
                <div className="px-4 sm:px-5 py-5">
                    <div className={`w-8 h-8 rounded-xl ${c.iconBg} border ${c.iconBorder} flex items-center justify-center ${c.iconText} mb-4`}>{icon}</div>
                    <p className={`text-xl font-semibold ${ghost}`}>—</p>
                    <p className={`text-[11px] font-light mt-1 tracking-wide ${labelText}`}>{label}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative rounded-2xl border overflow-hidden transition-all duration-200 ${card} ${cardHover}`}>
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${c.via} to-transparent`} />
            <div className="px-4 sm:px-5 py-5">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-8 h-8 rounded-xl ${c.iconBg} border ${c.iconBorder} flex items-center justify-center ${c.iconText}`}>
                        {loading ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
                    </div>
                    {change !== undefined && change !== null && <ChangeChip change={change} isDark={isDark} />}
                </div>
                <p className={`text-xl sm:text-2xl font-semibold tracking-tight leading-none ${valueText}`}>
                    {loading ? <span className={`inline-block w-14 h-6 rounded-md animate-pulse ${skeleton}`} /> : value}
                </p>
                <p className={`text-[11px] font-light mt-1.5 tracking-wide ${labelText}`}>{label}</p>
            </div>
        </div>
    );
}

// ── Change chip ───────────────────────────────────────────────────────────────
function ChangeChip({ change, isDark }) {
    if (change > 0) return (
        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7 7 7" /></svg>
            +{change}%
        </span>
    );
    if (change < 0) return (
        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7-7-7" /></svg>
            {change}%
        </span>
    );
    return (
        <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${isDark ? 'text-slate-500 bg-white/[0.04] border border-white/[0.08]' : 'text-gray-400 bg-gray-100 border border-gray-200'}`}>
            —
        </span>
    );
}

// ── Mini Status Card ──────────────────────────────────────────────────────────
function MiniStatusCard({ label, value, color, loading, isDark }) {
    const colorMap = {
        amber: { text: "text-amber-400", dot: "bg-amber-400" },
        blue:  { text: "text-blue-400",  dot: "bg-blue-400"  },
        red:   { text: "text-red-400",   dot: "bg-red-400"   },
    };
    const c = colorMap[color] ?? colorMap.amber;
    const card = isDark ? 'bg-[#12131a] border-white/[0.06]' : 'bg-white border-gray-200';
    const labelText = isDark ? 'text-slate-500' : 'text-gray-500';
    const skeleton = isDark ? 'bg-white/[0.05]' : 'bg-gray-100';

    return (
        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${card}`}>
            <div className="px-5 py-4 flex items-center gap-4">
                <div className={`w-1.5 h-8 rounded-full ${c.dot}`} />
                <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-light tracking-wide ${labelText}`}>{label}</p>
                    <p className={`text-2xl font-semibold mt-0.5 ${c.text}`}>
                        {loading ? <span className={`inline-block w-10 h-7 rounded animate-pulse ${skeleton}`} /> : value}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Quick Link ────────────────────────────────────────────────────────────────
function QuickLink({ href, label, icon, external, isDark }) {
    const Comp = external ? 'a' : Link;
    const extraProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

    const row = isDark ? 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50';
    const iconColor = isDark ? 'text-slate-600 group-hover:text-violet-400' : 'text-gray-400 group-hover:text-violet-600';
    const arrowColor = isDark ? 'text-slate-700 group-hover:text-violet-400/50' : 'text-gray-300 group-hover:text-violet-400';

    return (
        <Comp href={href} {...extraProps}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${row}`}>
            <span className={`flex-shrink-0 transition-colors ${iconColor}`}>{icon}</span>
            <span className="text-[13px] font-medium tracking-[0.01em] flex-1">{label}</span>
            <svg className={`w-3 h-3 flex-shrink-0 transition-colors ${arrowColor}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
        </Comp>
    );
}

// ── Status color helper ───────────────────────────────────────────────────────
function getStatusColor(status, isDark) {
    const colors = {
        draft:      isDark ? 'bg-slate-400/10 text-slate-400 border-slate-400/20' : 'bg-slate-100 text-slate-600 border-slate-200',
        pending:    isDark ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-amber-100 text-amber-700 border-amber-200',
        confirmed:  isDark ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : 'bg-blue-100 text-blue-700 border-blue-200',
        processing: isDark ? 'bg-violet-400/10 text-violet-400 border-violet-400/20' : 'bg-violet-100 text-violet-700 border-violet-200',
        completed:  isDark ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
        cancelled:  isDark ? 'bg-red-400/10 text-red-400 border-red-400/20' : 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || colors.draft;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const OrderIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

const RevenueIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ProductIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const ProfileIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
);

const OrdersIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
);

const BoxIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    </svg>
);

const RulerIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h4m4 0h4m4 0h2M3 17h18" />
    </svg>
);

const DocIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
);
