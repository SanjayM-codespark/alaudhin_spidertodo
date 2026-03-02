import { Head, Link, useForm } from '@inertiajs/react';

// SpideLogo from sidebar
const SpideLogo = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="5" fill="white" />
    <line x1="16" y1="2" x2="16" y2="11" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="16" y1="21" x2="16" y2="30" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="2" y1="16" x2="11" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="21" y1="16" x2="30" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="6.1" y1="6.1" x2="12.5" y2="12.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="19.5" y1="19.5" x2="25.9" y2="25.9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="25.9" y1="6.1" x2="19.5" y2="12.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12.5" y1="19.5" x2="6.1" y2="25.9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div
            className="min-h-screen bg-[#0d0e14] flex items-center justify-center relative overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <Head title="Sign In" />

            {/* Grid texture — same as sidebar dark bg */}
            <div
                className="absolute inset-0 opacity-[0.015] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Violet ambient glow — top left */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/[0.06] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            {/* Indigo ambient glow — bottom right */}
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-700/[0.05] rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

            {/* Top accent line — same as sidebar */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            {/* ─── Card ─── */}
            <div className="relative w-full max-w-[420px] mx-4">

                {/* Card border + subtle glow ring */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-violet-500/20 via-white/[0.04] to-transparent pointer-events-none" />

                <div className="relative bg-[#0d0e14]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-8 shadow-2xl shadow-black/60">

                    {/* ── Logo block — matches sidebar logo style ── */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/40 ring-1 ring-violet-500/30">
                            <SpideLogo />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-[13.5px] tracking-wide leading-tight text-white">
                                Spide Todo
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-semibold uppercase tracking-widest leading-none text-violet-400/80">
                                    Super Admin
                                </span>
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* ── Divider — matches sidebar divider ── */}
                    <div className="border-t border-white/[0.05] mb-8" />

                    {/* ── Heading ── */}
                    <div className="mb-7">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600 mb-2">
                            Welcome back
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight text-white">
                            Sign in to your account
                        </h1>
                    </div>

                    {/* ── Status ── */}
                    {status && (
                        <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-medium tracking-wide">
                            {status}
                        </div>
                    )}

                    {/* ── Form ── */}
                    <form onSubmit={submit} className="space-y-5">

                        {/* Email */}
                        <div className="group">
                            <label
                                htmlFor="email"
                                className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600 mb-2 group-focus-within:text-violet-400/80 transition-colors duration-200"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] focus:border-violet-500/50 focus:bg-violet-500/[0.04] rounded-lg px-3 py-2.5 text-[13px] text-slate-300 placeholder:text-slate-700 focus:outline-none transition-all duration-200"
                                    placeholder="you@example.com"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-[11px] text-red-400/80 font-medium">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="group">
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="password"
                                    className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600 group-focus-within:text-violet-400/80 transition-colors duration-200"
                                >
                                    Password
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-[11px] text-slate-500 hover:text-violet-400 transition-colors duration-200 font-medium"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] focus:border-violet-500/50 focus:bg-violet-500/[0.04] rounded-lg px-3 py-2.5 text-[13px] text-slate-300 placeholder:text-slate-700 focus:outline-none transition-all duration-200"
                                placeholder="••••••••••••"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            />
                            {errors.password && (
                                <p className="mt-1.5 text-[11px] text-red-400/80 font-medium">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember me */}
                        <label className="flex items-center gap-2.5 cursor-pointer group/check">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="w-4 h-4 border border-white/[0.12] rounded-sm peer-checked:border-violet-500/70 peer-checked:bg-violet-600/15 transition-all duration-200 flex items-center justify-center">
                                    <svg
                                        className="w-2.5 h-2.5 text-violet-400 opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-[12px] text-slate-500 font-medium group-hover/check:text-slate-400 transition-colors">
                                Remember me
                            </span>
                        </label>

                        {/* Submit — matches sidebar's active nav indicator violet */}
                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full relative overflow-hidden group/btn bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 disabled:from-violet-600/30 disabled:to-indigo-700/30 text-white disabled:text-white/30 text-[12px] font-semibold tracking-[0.12em] uppercase py-3 px-8 rounded-lg transition-all duration-300 shadow-lg shadow-violet-900/40 ring-1 ring-violet-500/30 disabled:ring-violet-500/10 disabled:shadow-none"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                {/* Shimmer effect */}
                                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {processing ? (
                                        <>
                                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                            Signing in...
                                        </>
                                    ) : 'Sign In'}
                                </span>
                            </button>
                        </div>
                    </form>

                    {/* ── Bottom role badge — mirrors sidebar bottom card ── */}
                    <div className="mt-6 border-t border-white/[0.05] pt-5">
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03]">
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-medium leading-tight text-slate-300">Admin</div>
                                <div className="text-[10px] leading-tight mt-0.5 text-slate-600">Access Level</div>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
