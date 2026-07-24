'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  TableProperties,
  BookOpen,
  Repeat,
  BarChart3,
  LogOut,
  X,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Strictly Dashboard, Problems, Formula Sheet, Revision, Analytics
  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Problems', href: '/problems', icon: TableProperties },
    { name: 'Formula Sheet', href: '/formula', icon: BookOpen },
    { name: 'Revision', href: '/revision', icon: Repeat },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Top Header Bar with Hamburger Button */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <Link href="/" className="font-extrabold text-base tracking-tight text-slate-100">
          MERA DSA
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-slate-100 rounded-lg bg-slate-800"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile Drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 w-60 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen font-sans transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Clean Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block">
              <h2 className="font-extrabold text-lg tracking-tight text-slate-100">
                MERA DSA
              </h2>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 text-slate-500 hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lock Button */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 flex items-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Lock App</span>
          </button>
        </div>
      </aside>
    </>
  );
}
