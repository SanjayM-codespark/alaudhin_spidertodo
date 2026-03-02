import { useEffect, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import UserDropdown from "@/components/header/UserDropdown";

const SpideLogo = () => (
  <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
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

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className={`sticky top-0 z-[99999] w-full backdrop-blur-md border-b transition-colors duration-300 ${
      isDark ? "bg-[#0d0e14]/95 border-white/[0.05]" : "bg-white/95 border-gray-200"
    }`}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      <div className="flex items-center justify-between h-14 px-4 lg:px-6">

        {/* ── Left ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
            className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 border border-transparent ${
              isDark
                ? "text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] hover:border-white/[0.08]"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover:border-gray-200"
            }`}
          >
            {isMobileOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h10M4 18h16" />
              </svg>
            )}
          </button>

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <SpideLogo />
            </div>
            <div className="flex flex-col">
              <span className={`font-semibold text-[13px] tracking-wide leading-none ${isDark ? "text-white" : "text-gray-900"}`}>
                Spide Todo
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-violet-500/70 leading-none mt-0.5">
                Super Admin
              </span>
            </div>
          </Link>

          {/* Desktop breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 ml-1">
            <div className={`w-px h-4 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-medium uppercase tracking-widest ${isDark ? "text-slate-600" : "text-gray-400"}`}>
                Panel
              </span>
              <svg className={`w-3 h-3 ${isDark ? "text-slate-700" : "text-gray-300"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={`text-[11px] font-medium uppercase tracking-widest ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                Super Admin
              </span>
            </div>
          </div>
        </div>

        {/* ── Center: Status badge ── */}
        <div className="hidden lg:flex items-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            isDark ? "bg-white/[0.03] border-white/[0.06]" : "bg-gray-50 border-gray-200"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className={`text-[11px] font-medium tracking-wide ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              System Online
            </span>
          </div>
        </div>

        {/* ── Right: Theme toggle + User ── */}
        <div className="flex items-center gap-2">
          {/* Mobile dots menu */}
          <button
            onClick={() => setApplicationMenuOpen(!isApplicationMenuOpen)}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 lg:hidden ${
              isDark ? "text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>

          <div className={`${isApplicationMenuOpen ? "flex" : "hidden"} lg:flex items-center gap-2`}>

            {/* ── Theme Toggle ── */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 border ${
                isDark
                  ? "text-slate-400 hover:text-amber-300 bg-white/[0.03] hover:bg-amber-400/[0.08] border-white/[0.06] hover:border-amber-400/20"
                  : "text-gray-500 hover:text-violet-600 bg-gray-50 hover:bg-violet-50 border-gray-200 hover:border-violet-200"
              }`}
            >
              {/* Sun — shown in dark mode (click to go light) */}
              <span className={`absolute transition-all duration-300 ${isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-90"}`}>
                <SunIcon />
              </span>
              {/* Moon — shown in light mode (click to go dark) */}
              <span className={`absolute transition-all duration-300 ${isDark ? "opacity-0 scale-50 -rotate-90" : "opacity-100 scale-100 rotate-0"}`}>
                <MoonIcon />
              </span>
            </button>

            <div className={`hidden lg:block w-px h-5 mx-1 ${isDark ? "bg-white/[0.08]" : "bg-gray-200"}`} />

            <UserDropdown />
          </div>
        </div>

      </div>
    </header>
  );
};

export default AppHeader;
