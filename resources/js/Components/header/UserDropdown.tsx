import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link, usePage } from "@inertiajs/react";

export default function UserDropdown() {
  // ✅ Pull real authenticated user from Inertia shared props
  const { auth } = usePage().props;
  const user = auth.user;
  const baseUrl = import.meta.env.VITE_APP_SUB_URL || ""
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown  = () => setIsOpen(false);

  return (
    <div className="relative">

      {/* ── Trigger button ── */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors duration-200 group"
      >
        {/* Avatar initial */}
        <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/25 flex items-center justify-center flex-shrink-0">
          <span className="text-amber-400 text-sm font-semibold uppercase leading-none">
            {user?.name?.charAt(0) ?? "U"}
          </span>
        </div>

        {/* Name — hidden on mobile */}
        <span className="hidden sm:block text-sm font-medium text-slate-300 group-hover:text-white transition-colors max-w-[120px] truncate">
          {user?.name ?? "User"}
        </span>

        {/* Chevron */}
        <svg
          className={`w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-all duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Dropdown panel ── */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 w-[260px] flex flex-col rounded-2xl border border-white/[0.08] bg-[#0f1117] shadow-2xl overflow-hidden z-50"
      >
        {/* Top amber gradient rule */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

        {/* ── User info header ── */}
        <div className="px-4 py-4 flex items-center gap-3 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-400 text-base font-semibold uppercase">
              {user?.name?.charAt(0) ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/85 truncate leading-tight">
              {user?.name ?? "User"}
            </p>
            <p className="text-xs text-slate-500 font-light truncate mt-0.5">
              {user?.email ?? ""}
            </p>
          </div>
        </div>

        {/* ── Nav links ── */}
        <ul className="flex flex-col gap-0.5 p-2 border-b border-white/[0.06]">
          {[
            {
              label: "Edit Profile",
              href: `${baseUrl}profile`,
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },

          ].map(({ label, href, icon }) => (
            <li key={label}>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-200 group"
              >
                <span className="text-slate-600 group-hover:text-amber-400 transition-colors duration-200">
                  {icon}
                </span>
                {label}
              </DropdownItem>
            </li>
          ))}
        </ul>

        {/* ── Sign out ── */}
        <div className="p-2">
          <Link
            href="/spider_todo/logout"
            method="post"
            as="button"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 group"
          >
            <span className="text-red-500/40 group-hover:text-red-400 transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            Sign Out
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
