import { useCallback, useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import SidebarWidget from "@/Layouts/SidebarWidget";

// ── Icons ────────────────────────────────────────────────────────────────────
const GridIcon = () => (
  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const UserCircleIcon = () => (
  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BoxCubeIcon = () => (
  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" strokeLinecap="round" />
  </svg>
);

const ChevronIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${className}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DotsIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <circle cx="4" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="16" cy="10" r="1.5" />
  </svg>
);

const SpideLogo = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
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

const baseUrl = import.meta.env.VITE_APP_SUB_URL || "";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  vendorAccess?: boolean;
};

const navItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: `${baseUrl}dashboard`, vendorAccess: true },
  { icon: <ListIcon />, name: "Orders", path: `${baseUrl}orders`, vendorAccess: true },
  {
    name: "Master List",
    icon: <BoxCubeIcon />,
    subItems: [
      { name: "Measurement Units", path: `${baseUrl}measurement-units` },
      { name: "Products", path: `${baseUrl}products` },
    ],
    vendorAccess: false,
  },
  { icon: <UserCircleIcon />, name: "User Profile", path: `${baseUrl}profile`, vendorAccess: true },
];

const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { url, props } = usePage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const userRole = (props.auth?.user as any)?.role_type || "admin";
  const isAdmin = userRole === "admin";
  const isVendor = userRole === "vendor";

  const isActive = useCallback((path: string) => url === path, [url]);
  const isCollapsed = !isExpanded && !isHovered && !isMobileOpen;

  const [openSubmenu, setOpenSubmenu] = useState<{ type: "main" | "others"; index: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLUListElement | null>>({});

  const getFilteredNavItems = (items: NavItem[]) => {
    if (isAdmin) return items;
    if (isVendor) return items.filter((item) => item.vendorAccess === true);
    return [];
  };

  const filteredNavItems = getFilteredNavItems(navItems);
  const filteredOthersItems = getFilteredNavItems(othersItems);

  useEffect(() => {
    let matched = false;
    (["main", "others"] as const).forEach((menuType) => {
      const items = menuType === "main" ? filteredNavItems : filteredOthersItems;
      items.forEach((nav, index) => {
        if (nav.subItems?.some((sub) => isActive(sub.path))) {
          setOpenSubmenu({ type: menuType, index });
          matched = true;
        }
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [url, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev?.type === menuType && prev?.index === index ? null : { type: menuType, index }
    );
  };

  // ── Theme-aware class sets ──
  const t = {
    sidebar:    isDark ? "bg-[#0d0e14] border-white/[0.05]"          : "bg-white border-gray-200",
    divider:    isDark ? "border-white/[0.05]"                        : "border-gray-100",
    sectionLbl: isDark ? "text-slate-600"                             : "text-gray-400",
    dotsIcon:   isDark ? "text-slate-700"                             : "text-gray-300",
    navDefault: isDark ? "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]" : "text-gray-500 hover:text-gray-900 hover:bg-violet-50/60",
    navActive:  isDark ? "bg-violet-600/15 text-violet-300"           : "bg-violet-50 text-violet-700",
    iconDefault:isDark ? "text-slate-500 group-hover:text-slate-300"  : "text-gray-400 group-hover:text-gray-700",
    iconActive: isDark ? "text-violet-400"                            : "text-violet-600",
    chevron:    isDark ? "text-slate-600"                             : "text-gray-300",
    subDefault: isDark ? "text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]" : "text-gray-400 hover:text-gray-800 hover:bg-violet-50/50",
    subActive:  isDark ? "bg-violet-600/10 text-violet-300"           : "bg-violet-50 text-violet-700",
    subDot:     isDark ? "bg-slate-600"                               : "bg-gray-300",
    subDotActive:isDark ? "bg-violet-400"                             : "bg-violet-600",
    bottomCard: isDark ? "bg-white/[0.03] border-white/[0.06]"        : "bg-gray-50 border-gray-200",
    roleName:   isDark ? "text-slate-300"                             : "text-gray-700",
    roleSub:    isDark ? "text-slate-600"                             : "text-gray-400",
    gradFade:   isDark ? "from-[#0d0e14]"                             : "from-white",
    logoName:   isDark ? "text-white"                                 : "text-gray-900",
    logoSub:    isDark ? "text-violet-400/80"                         : "text-violet-500",
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="space-y-0.5">
      {items.map((nav, index) => {
        const isSubmenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
        const hasActiveChild = nav.subItems?.some((s) => isActive(s.path));

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <div>
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={[
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group relative",
                    isCollapsed ? "lg:justify-center" : "justify-start",
                    isSubmenuOpen || hasActiveChild ? t.navActive : t.navDefault,
                  ].join(" ")}
                >
                  {(isSubmenuOpen || hasActiveChild) && (
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${isDark ? "bg-violet-400" : "bg-violet-600"}`} />
                  )}
                  <span className={`shrink-0 ${isSubmenuOpen || hasActiveChild ? t.iconActive : t.iconDefault}`}>
                    {nav.icon}
                  </span>
                  {!isCollapsed && <span className="flex-1 text-left tracking-[0.01em]">{nav.name}</span>}
                  {!isCollapsed && (
                    <ChevronIcon className={isSubmenuOpen ? `rotate-90 ${t.iconActive}` : t.chevron} />
                  )}
                </button>

                {nav.subItems && !isCollapsed && (
                  <ul
                    ref={(el) => { subMenuRefs.current[`${menuType}-${index}`] = el; }}
                    className="overflow-hidden transition-all duration-300 ease-in-out mt-0.5 space-y-0.5"
                    style={{ height: isSubmenuOpen ? `${subMenuHeight[`${menuType}-${index}`] || 0}px` : "0px" }}
                  >
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.path}
                          className={[
                            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] transition-all duration-200 ml-7",
                            isActive(subItem.path) ? t.subActive : t.subDefault,
                          ].join(" ")}
                        >
                          <span className={`w-1 h-1 rounded-full ${isActive(subItem.path) ? t.subDotActive : t.subDot}`} />
                          <span className="flex-1 tracking-[0.01em]">{subItem.name}</span>
                          {subItem.new && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 rounded-md tracking-wide">NEW</span>
                          )}
                          {subItem.pro && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-violet-500/15 text-violet-400 rounded-md tracking-wide">PRO</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={[
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group",
                    isCollapsed ? "lg:justify-center" : "justify-start",
                    isActive(nav.path) ? t.navActive : t.navDefault,
                  ].join(" ")}
                >
                  {isActive(nav.path) && (
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${isDark ? "bg-violet-400" : "bg-violet-600"}`} />
                  )}
                  <span className={`shrink-0 ${isActive(nav.path) ? t.iconActive : t.iconDefault}`}>
                    {nav.icon}
                  </span>
                  {!isCollapsed && <span className="tracking-[0.01em]">{nav.name}</span>}
                </Link>
              )
            )}
          </li>
        );
      })}
    </ul>
  );

  if (filteredNavItems.length === 0 && filteredOthersItems.length === 0) return null;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={[
        "fixed top-0 left-0 h-screen z-50 flex flex-col border-r transition-colors duration-300",
        t.sidebar,
        "transition-all duration-300 ease-in-out",
        isExpanded || isMobileOpen || isHovered ? "w-[260px]" : "w-[66px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
      ].join(" ")}
    >
      {/* Grid texture — dark only */}
      {isDark && (
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      )}

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      {/* ── Logo ── */}
      <div className={`shrink-0 ${isCollapsed ? "px-3 py-5" : "px-4 py-5"}`}>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/40 ring-1 ring-violet-500/30">
            <SpideLogo />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className={`font-semibold text-[13.5px] tracking-wide leading-tight ${t.logoName}`}>
                Spide Todo
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-semibold uppercase tracking-widest leading-none ${t.logoSub}`}>
                  Super Admin
                </span>
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`mx-4 border-t ${t.divider}`} />

      {/* ── Nav ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 scrollbar-thin scrollbar-thumb-white/[0.06] scrollbar-track-transparent">
        <div className={`mb-2 px-1 ${isCollapsed ? "flex justify-center" : ""}`}>
          {!isCollapsed ? (
            <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${t.sectionLbl}`}>Navigation</span>
          ) : (
            <DotsIcon className={`w-3.5 h-3.5 ${t.dotsIcon}`} />
          )}
        </div>

        {renderMenuItems(filteredNavItems, "main")}

        {filteredOthersItems.length > 0 && (
          <>
            <div className={`my-3 border-t ${t.divider}`} />
            <div className={`mb-2 px-1 ${isCollapsed ? "flex justify-center" : ""}`}>
              {!isCollapsed ? (
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${t.sectionLbl}`}>Other</span>
              ) : (
                <DotsIcon className={`w-3.5 h-3.5 ${t.dotsIcon}`} />
              )}
            </div>
            {renderMenuItems(filteredOthersItems, "others")}
          </>
        )}

        {!isCollapsed && isAdmin && (
          <div className="mt-4"><SidebarWidget /></div>
        )}
      </div>

      {/* ── Bottom role badge ── */}
      {!isCollapsed && (
        <div className={`shrink-0 px-4 py-4 border-t ${t.divider}`}>
          <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border ${t.bottomCard}`}>
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-[11px] font-medium leading-tight capitalize ${t.roleName}`}>{userRole}</div>
              <div className={`text-[10px] leading-tight mt-0.5 ${t.roleSub}`}>Access Level</div>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          </div>
        </div>
      )}

      <div className={`absolute bottom-[68px] left-0 right-0 h-8 bg-gradient-to-t ${t.gradFade} to-transparent pointer-events-none`} />
    </aside>
  );
};

export default AppSidebar;
