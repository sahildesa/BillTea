'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../../components/ThemeProvider';
import { BranchProvider, useBranch } from '../../components/BranchProvider';
import Link from 'next/link';
import { isLoggedIn, logout } from '../../lib/auth';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { branches, selectedBranchId, setSelectedBranchId, isLoadingBranches } = useBranch();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ fullName: string; email: string; role?: string }>({
    fullName: 'Sarang Wagh',
    email: 'admin@indux.com',
    role: 'owner',
  });
  const [mounted, setMounted] = useState(false);

  // Navigation items with role-based access
  const allNavItems = [
    { href: '/home', icon: 'grid_view', label: 'Dashboard', roles: ['owner', 'manager', 'staff'] },
    { href: '/quotations', icon: 'request_quote', label: 'Quotations', roles: ['owner', 'manager', 'staff'] },
    { href: '/invoices', icon: 'receipt_long', label: 'Invoices', roles: ['owner', 'manager', 'staff'] },
    { href: '/customers', icon: 'group', label: 'Customers', roles: ['owner', 'manager', 'staff'] },
    { href: '/products', icon: 'inventory_2', label: 'Products', roles: ['owner', 'manager', 'staff'] },
    { href: '/reports', icon: 'bar_chart', label: 'Reports', roles: ['owner', 'manager', 'staff'] },
    { href: '/profit', icon: 'trending_up', label: 'Profit Report', roles: ['owner', 'manager'] },
    { href: '/expenses', icon: 'account_balance_wallet', label: 'Expenses', roles: ['owner', 'manager', 'staff'] },
  ];

  const userRole = (user.role || 'staff').toLowerCase();
  const filteredNavItems = allNavItems.filter(item => item.roles.includes(userRole));
  const showSettings = userRole === 'owner' || userRole === 'manager';

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        // use default
      }
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex overflow-hidden antialiased transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`flex-shrink-0 border-outline-variant/30 glass-panel flex flex-col h-screen z-20 transition-[width] duration-300 ease-in-out overflow-hidden border-r ${sidebarOpen
          ? 'w-56'
          : 'w-[72px]'
        }`}>
        <div className="flex items-center gap-3 relative border-b border-outline-variant/10 p-4 h-20 shrink-0 overflow-hidden whitespace-nowrap">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
          <div className="size-10 shrink-0 rounded-full bg-cover bg-center border border-primary/20 shadow-[0_0_15px_rgba(125,211,252,0.1)] z-10" style={{ backgroundImage: "url('/images/logo.png')" }}></div>
          <div className={`z-10 flex-1 flex flex-col min-w-0 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="text-on-surface font-semibold text-lg tracking-wide leading-tight truncate">Indux Tech</h1>

            <div className="relative mt-0.5 group w-auto inline-flex items-center">
              {isLoadingBranches ? (
                <div className="text-primary text-[10px] uppercase tracking-wider font-semibold">Loading...</div>
              ) : (
                <>
                  <select
                    value={selectedBranchId || ''}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="appearance-none bg-transparent text-primary text-[10px] uppercase tracking-wider font-semibold cursor-pointer focus:outline-none pr-5 hover:text-primary-fixed transition-colors relative z-10 w-full"
                  >
                    {branches.map(branch => (
                      <option key={branch.id} className="bg-surface-container normal-case tracking-normal text-sm" value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary text-[14px] pointer-events-none group-hover:text-primary-fixed transition-colors">expand_more</span>
                </>
              )}
            </div>
          </div>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {filteredNavItems.map((item) => (
            <Link key={item.href} href={item.href} title={!sidebarOpen ? item.label : undefined} className={`nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 overflow-hidden whitespace-nowrap ${pathname === item.href ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(125,211,252,0.1)]' : 'text-on-surface-variant border border-transparent hover:bg-surface-container-highest hover:text-on-surface hover:translate-x-1'}`}>
              <span className="material-symbols-outlined shrink-0 text-[20px] transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
              <span className={`transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
            </Link>
          ))}
          {showSettings && (
            <div className="pt-2">
              <Link href="/settings" title={!sidebarOpen ? 'Settings' : undefined} className={`nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 overflow-hidden whitespace-nowrap ${pathname === '/settings' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(125,211,252,0.1)]' : 'text-on-surface-variant border border-transparent hover:bg-surface-container-highest hover:text-on-surface hover:translate-x-1'}`}>
                <span className="material-symbols-outlined shrink-0 text-[20px] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90">settings</span>
                <span className={`transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Settings</span>
              </Link>
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-outline-variant/30 shrink-0 overflow-hidden whitespace-nowrap">
          <div
            onClick={handleLogout}
            title={!sidebarOpen ? 'Sign Out' : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg glass-button cursor-pointer active:scale-98 transition-all duration-300 hover:bg-error/10 hover:text-error hover:border-error/30 group"
          >
            <span className="material-symbols-outlined shrink-0 text-[20px] transition-transform duration-300 group-hover:-translate-x-0.5">logout</span>
            <span className={`text-sm font-medium transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Navigation */}
        <header className="h-20 flex-shrink-0 border-b border-outline-variant/30 glass-panel flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 group cursor-pointer active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-on-surface">menu</span>
            </button>
            <h2 className="text-2xl font-semibold text-on-surface tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
              {pathname === '/home' ? 'Dashboard' :
                pathname.includes('/edit') ? `Edit ${pathname.split('/')[1].replace(/s$/, '').charAt(0).toUpperCase() + pathname.split('/')[1].replace(/s$/, '').slice(1)}` :
                  pathname.includes('/new') ? `New ${pathname.split('/')[1].replace(/s$/, '').charAt(0).toUpperCase() + pathname.split('/')[1].replace(/s$/, '').slice(1)}` :
                    pathname.split('/')[1].charAt(0).toUpperCase() + pathname.split('/')[1].slice(1)}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full glass-button flex items-center justify-center group cursor-pointer"
              title="Toggle Theme"
            >
              <span className="material-symbols-outlined select-none text-xl">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <Link href="/settings/profile" className="p-1.5 glass-panel rounded-xl pl-2 pr-4 border border-outline-variant/30 hover:border-primary/45 hover:bg-surface-container-highest/20 transition-all cursor-pointer flex items-center gap-3">
              <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden shadow-[0_0_10px_rgba(125,211,252,0.1)]">
                <span className="material-symbols-outlined text-primary text-[28px] select-none">account_circle</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-on-surface leading-tight">{user.fullName}</span>
                <span className="text-[10px] text-on-surface-variant/80 tracking-wide uppercase leading-none mt-0.5">{userRole}</span>
              </div>
            </Link>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <BranchProvider>
      <DashboardContent>{children}</DashboardContent>
    </BranchProvider>
  );
}
