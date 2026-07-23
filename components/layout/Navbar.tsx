'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Sun, Moon, Globe, ChevronDown,
  Home, Building2, Layers, Users, Phone, LogIn, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/services', label: 'Services', icon: Layers },
  { href: '/about', label: 'About Us', icon: Users },
  { href: '/contact', label: 'Contact', icon: Phone },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'rw', label: 'Kinyarwanda' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState('EN');
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  // Only run on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Read system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('geofred_theme');
    const isDark = stored ? stored === 'dark' : prefersDark;
    setDark(isDark);
    if (isDark) document.documentElement.classList.add('dark');

    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    handler(); // set initial value
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('geofred_theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  const dashboardHref = user?.role === 'admin' ? '/admin' : user?.role === 'agent' ? '/agent' : '/dashboard';

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md' : 'bg-transparent'
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/images/logo-icon.png"
                alt="GeoFred E-Terrastate"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <span className={cn('font-black text-lg leading-none', scrolled ? 'text-foreground' : 'text-white')}>Geofred</span>
              <p className={cn('text-xs leading-none', scrolled ? 'text-primary' : 'text-orange-400')}>E-terrastate</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  scrolled
                    ? 'text-foreground hover:text-primary hover:bg-primary/10'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                )}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language picker */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors',
                  scrolled ? 'text-foreground hover:bg-muted' : 'text-white/80 hover:bg-white/10'
                )}>
                <Globe className="h-3.5 w-3.5" />
                {lang}
                <ChevronDown className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-border overflow-hidden z-50">
                    {languages.map(l => (
                      <button key={l.code}
                        onClick={() => { setLang(l.code.toUpperCase()); setLangOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">
                        {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle — only render after mount to avoid hydration mismatch */}
            {mounted && (
              <button
                onClick={toggleDark}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  scrolled ? 'text-foreground hover:bg-muted' : 'text-white/80 hover:bg-white/10'
                )}>
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {/* Auth buttons — only render after mount */}
            {mounted && (
              user ? (
                <div className="flex items-center gap-2">
                  <Link href={dashboardHref}>
                    <Button size="sm" variant="terra" className="hidden md:flex">Dashboard</Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={logout}
                    className={cn('hidden md:flex', !scrolled && 'text-white hover:bg-white/10')}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button size="sm" variant="ghost"
                      className={cn(!scrolled && 'text-white hover:bg-white/10')}>
                      <LogIn className="h-4 w-4 mr-1" /> Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" variant="terra">
                      <UserPlus className="h-4 w-4 mr-1" /> Register
                    </Button>
                  </Link>
                </div>
              )
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(!open)}
              className={cn('lg:hidden p-2 rounded-md', scrolled ? 'text-foreground' : 'text-white')}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white dark:bg-gray-900 border-b border-border overflow-hidden">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted transition-colors text-sm font-medium">
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </Link>
              ))}
              <div className="border-t border-border mt-2 pt-2 flex flex-col gap-2">
                {mounted && (user ? (
                  <>
                    <Link href={dashboardHref} onClick={() => setOpen(false)}>
                      <Button className="w-full" variant="terra" size="sm">Dashboard</Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => { logout(); setOpen(false); }}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Login</Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setOpen(false)}>
                      <Button variant="terra" size="sm" className="w-full">Register</Button>
                    </Link>
                  </>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
