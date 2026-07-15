'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/agent', label: 'Overview', icon: LayoutDashboard },
  { href: '/agent/requests', label: 'Assigned Requests', icon: ClipboardList },
  { href: '/agent/messages', label: 'Messages', icon: MessageSquare },
  { href: '/agent/profile', label: 'Profile', icon: User },
];

export default function AgentDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg terra-gradient flex items-center justify-center">
                <span className="text-white font-black text-sm">G</span>
              </div>
              <span className="font-black text-sm hidden sm:block">Agent Panel</span>
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    pathname === href ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
                  <Icon className="h-3.5 w-3.5" /><span className="hidden md:block">{label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-muted-foreground">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
