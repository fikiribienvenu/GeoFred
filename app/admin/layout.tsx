'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Building2, ClipboardList, Settings,
  Menu, X, LogOut, Bell, Sun, Moon, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/agents', label: 'Agent Management', icon: Users },
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/requests', label: 'Service Requests', icon: ClipboardList },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth guard — redirect non-admins
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Show loading while checking auth
  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect in progress
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-white font-bold">Access Denied</p>
          <p className="text-gray-400 text-sm mt-1">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 bg-gray-900 dark:bg-gray-950 h-full flex flex-col overflow-hidden border-r border-gray-800">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-800">
              <div className="w-8 h-8 rounded-lg terra-gradient flex items-center justify-center">
                <span className="text-white font-black">G</span>
              </div>
              <div>
                <div className="text-white font-black text-sm">GeoFredE</div>
                <div className="text-gray-400 text-xs">Admin Panel</div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
                return (
                  <Link key={href} href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all',
                      active
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    )}>
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</div>
                  <div className="text-gray-400 text-xs truncate">{user?.email}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800 gap-2"
                onClick={logout}>
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-muted transition-colors">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-2 hidden sm:block">
              Admin: <strong>{user?.name}</strong>
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-md hover:bg-muted transition-colors">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className="relative p-2 rounded-md hover:bg-muted transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
