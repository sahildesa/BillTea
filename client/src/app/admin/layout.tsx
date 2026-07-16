'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../../components/ThemeProvider';
import Link from 'next/link';
import { isLoggedIn, logout } from '../../lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (pathname === '/admin/auth' || pathname === '/') return;

    if (!isLoggedIn()) {
      router.push('/admin/auth');
      return;
    }
    
    // Check if user is super admin
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== 'SUPER_ADMIN') {
          router.push('/home'); // Redirect non-admins
        }
      } catch (e) {}
    }
  }, [router, pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!mounted) return null;

  if (pathname === '/admin/auth' || pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex overflow-hidden antialiased transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`flex-shrink-0 border-outline-variant/30 glass-panel flex flex-col h-screen z-20 transition-[width] duration-300 ease-in-out overflow-hidden border-r ${sidebarOpen ? 'w-56' : 'w-[72px]'}`}>
        <div className="flex items-center gap-3 relative border-b border-outline-variant/10 p-4 h-20 shrink-0 overflow-hidden whitespace-nowrap">
          <div className="absolute inset-0 bg-gradient-to-b from-error/5 to-transparent pointer-events-none"></div>
          <div className="size-10 shrink-0 rounded-full bg-error/20 flex items-center justify-center border border-error/30 shadow-[0_0_15px_rgba(220,38,38,0.1)] z-10">
            <span className="material-symbols-outlined text-error">admin_panel_settings</span>
          </div>
          <div className={`z-10 flex-1 flex flex-col min-w-0 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="text-on-surface font-semibold text-lg tracking-wide leading-tight truncate">Admin Panel</h1>
            <span className="text-error text-[10px] uppercase tracking-wider font-semibold">Super Admin</span>
          </div>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <Link href="/dashboard" title={!sidebarOpen ? 'Dashboard' : undefined} className={`nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 overflow-hidden whitespace-nowrap ${pathname === '/admin/dashboard' || pathname === '/dashboard' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(125,211,252,0.1)]' : 'text-on-surface-variant border border-transparent hover:bg-surface-container-highest hover:text-on-surface hover:translate-x-1'}`}>
            <span className="material-symbols-outlined shrink-0 text-[20px] transition-transform duration-300 group-hover:scale-110">dashboard</span>
            <span className={`transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Dashboard</span>
          </Link>
          <Link href="/admin/plans" title={!sidebarOpen ? 'Plans' : undefined} className={`nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 overflow-hidden whitespace-nowrap ${pathname === '/admin/plans' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(125,211,252,0.1)]' : 'text-on-surface-variant border border-transparent hover:bg-surface-container-highest hover:text-on-surface hover:translate-x-1'}`}>
            <span className="material-symbols-outlined shrink-0 text-[20px] transition-transform duration-300 group-hover:scale-110">card_membership</span>
            <span className={`transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Subscription Plans</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-outline-variant/30 shrink-0 overflow-hidden whitespace-nowrap">
          <div onClick={handleLogout} title={!sidebarOpen ? 'Sign Out' : undefined} className="flex items-center gap-3 px-3 py-2.5 rounded-lg glass-button cursor-pointer active:scale-98 transition-all duration-300 hover:bg-error/10 hover:text-error hover:border-error/30 group">
            <span className="material-symbols-outlined shrink-0 text-[20px] transition-transform duration-300 group-hover:-translate-x-0.5">logout</span>
            <span className={`text-sm font-medium transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 flex-shrink-0 border-b border-outline-variant/30 glass-panel flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 group cursor-pointer active:scale-95 transition-all">
              <span className="material-symbols-outlined text-on-surface">menu</span>
            </button>
            <h2 className="text-2xl font-semibold text-on-surface tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
              {pathname === '/admin/plans' ? 'Subscription Plans' : 'Admin Panel'}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={toggleTheme} className="h-10 w-10 rounded-full glass-button flex items-center justify-center group cursor-pointer" title="Toggle Theme">
              <span className="material-symbols-outlined select-none text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
