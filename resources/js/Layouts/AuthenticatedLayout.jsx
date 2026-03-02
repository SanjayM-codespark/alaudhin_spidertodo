import AppHeader from '@/Layouts/AppHeader';
import AppSidebar from '@/Layouts/AppSidebar';
import Backdrop from '@/Layouts/Backdrop';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';

function LayoutContent({ header, children }) {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen xl:flex transition-colors duration-300 ${isDark ? 'bg-[#0d0e14]' : 'bg-gray-50'}`}>
            <div>
                <AppSidebar />
                <Backdrop />
            </div>
            <div
                className={`flex-1 transition-all duration-300 ease-in-out min-h-screen ${isDark ? 'bg-[#0d0e14]' : 'bg-gray-50'} ${
                    isExpanded || isHovered ? 'lg:ml-[260px]' : 'lg:ml-[66px]'
                } ${isMobileOpen ? 'ml-0' : ''}`}
            >
                <AppHeader />
                {header && (
                    <div className={`border-b transition-colors duration-300 ${isDark ? 'bg-[#0d0e14] border-white/[0.05]' : 'bg-white border-gray-200'}`}>
                        <div className="mx-auto max-w-screen-2xl px-4 py-4 md:px-6">
                            {header}
                        </div>
                    </div>
                )}
                <div className={`transition-colors duration-300 ${isDark ? 'bg-[#0d0e14]' : 'bg-gray-50'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    // ⚠️ ThemeProvider is NOT here — it lives in app.jsx and wraps the whole app
    return (
        <SidebarProvider>
            <LayoutContent header={header}>
                {children}
            </LayoutContent>
        </SidebarProvider>
    );
}
