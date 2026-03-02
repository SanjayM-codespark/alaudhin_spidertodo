import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    {/* Amber accent mark */}
                    <div className="w-1 h-6 bg-amber-400 rounded-full" />
                    <div>
                        <h2 className="text-base font-semibold text-white/90 leading-tight">
                            Profile Settings
                        </h2>
                        <p className="text-xs text-slate-500 font-light tracking-wide mt-0.5">
                            Manage your account information
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="min-h-screen bg-[#0a0b0f]">
                {/* ── Top gradient line (mirrors sidebar) ── */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-8" />

                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-12 space-y-5">

                    {/* ── Section: Profile Information ── */}
                    <ProfileCard
                        index={1}
                        title="Profile Information"
                        subtitle="Update your name and email address"
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    >
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </ProfileCard>

                    {/* ── Section: Update Password ── */}
                    <ProfileCard
                        index={2}
                        title="Update Password"
                        subtitle="Ensure your account is using a strong password"
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        }
                    >
                        <UpdatePasswordForm className="max-w-xl" />
                    </ProfileCard>

                    {/* ── Section: Delete Account ── */}
                    <ProfileCard
                        index={3}
                        title="Delete Account"
                        subtitle="Permanently remove your account and all data"
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        }
                        danger
                    >
                        <DeleteUserForm className="max-w-xl" />
                    </ProfileCard>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// ── Reusable card shell ───────────────────────────────────────────────────────
function ProfileCard({ index, title, subtitle, icon, danger = false, children }) {
    return (
        <div className={[
            "relative rounded-2xl border transition-all duration-200 overflow-hidden",
            danger
                ? "bg-[#130e0e] border-red-500/10 hover:border-red-500/20"
                : "bg-[#0f1117] border-white/[0.06] hover:border-white/[0.10]",
        ].join(" ")}>

            {/* Top accent line */}
            <div className={[
                "absolute top-0 left-0 right-0 h-px",
                danger
                    ? "bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
                    : "bg-gradient-to-r from-transparent via-amber-400/20 to-transparent",
            ].join(" ")} />

            {/* Card header */}
            <div className={[
                "flex items-center gap-4 px-6 py-5 border-b",
                danger ? "border-red-500/8" : "border-white/[0.06]",
            ].join(" ")}>
                {/* Icon badge */}
                <div className={[
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border",
                    danger
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-amber-400/10 border-amber-400/20 text-amber-400",
                ].join(" ")}>
                    {icon}
                </div>

                {/* Title block */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className={[
                            "text-sm font-semibold leading-tight",
                            danger ? "text-red-300/80" : "text-white/85",
                        ].join(" ")}>
                            {title}
                        </h3>
                        {/* Step number pill */}
                        <span className={[
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-wider",
                            danger
                                ? "bg-red-500/10 text-red-500/60"
                                : "bg-white/5 text-slate-600",
                        ].join(" ")}>
                            {String(index).padStart(2, "0")}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-light mt-0.5 tracking-wide">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Card body */}
            <div className="px-6 py-6 [&_label]:text-slate-400 [&_label]:text-xs [&_label]:font-medium [&_label]:tracking-wide [&_label]:uppercase [&_label]:mb-2 [&_input]:bg-[#0a0b0f] [&_input]:border-white/10 [&_input]:text-white/80 [&_input]:text-sm [&_input]:rounded-lg [&_input:focus]:border-amber-400/40 [&_input:focus]:ring-0 [&_input:focus]:outline-none [&_input]:placeholder:text-slate-600 [&_button[type=submit]]:bg-amber-400 [&_button[type=submit]]:text-[#0a0b0f] [&_button[type=submit]]:font-semibold [&_button[type=submit]]:text-xs [&_button[type=submit]]:tracking-widest [&_button[type=submit]]:uppercase [&_button[type=submit]]:px-6 [&_button[type=submit]]:py-2.5 [&_button[type=submit]]:rounded-lg [&_button[type=submit]:hover]:bg-amber-300 [&_button[type=submit]]:transition-colors [&_p.text-sm]:text-slate-400 [&_p.text-sm]:text-xs">
                {children}
            </div>
        </div>
    );
}
