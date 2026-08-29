'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Image as ImageIcon,
  Dna,
  Settings,
  Plus,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { createBrowserClient } from '@/lib/supabase/browser';

const NAV_ITEMS = [
  { label: 'Inicio', href: '/app', icon: LayoutDashboard },
  { label: 'Proyectos', href: '/app/projects', icon: FolderKanban },
  { label: 'Clientes', href: '/app/clients', icon: Users },
  { label: 'Portafolio', href: '/app/portfolio', icon: ImageIcon },
  { label: 'Style DNA', href: '/app/style-dna', icon: Dna },
  { label: 'Ajustes', href: '/app/settings/profile', icon: Settings },
];

export function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const NavLinks = () => (
    <nav className="flex-1 space-y-1.5 px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/app'
            ? pathname === '/app'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3.5 px-4 py-3 rounded-md text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-[#7C3DFF]/15 text-white border-l-4 border-[#7C3DFF] font-semibold pl-3'
                : 'text-[#A9A7B7] hover:text-white hover:bg-[#100A2E]'
            )}
          >
            <Icon className={cn('h-5 w-5', isActive ? 'text-[#7C3DFF]' : 'text-[#A9A7B7]')} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen bg-[#080714] text-[#F7F7FB] overflow-hidden">
      {/* Desktop Sidebar (272px fixed) */}
      <aside className="hidden md:flex flex-col w-[272px] bg-[#0c0a1f] border-r border-[#7C3DFF]/15 h-full z-40 flex-shrink-0">
        {/* Logo area */}
        <div className="p-6 border-b border-[#7C3DFF]/10 flex items-center justify-between">
          <Logo mode="dark" size="md" href="/app" />
        </div>

        {/* Navigation */}
        <NavLinks />

        {/* Bottom CTA & Signout */}
        <div className="p-4 border-t border-[#7C3DFF]/10 space-y-3">
          <Button asChild variant="primary" className="w-full justify-center gap-2 shadow-glow-purple">
            <Link href="/app/projects/new">
              <Plus className="h-4 w-4" />
              <span>Nuevo proyecto</span>
            </Link>
          </Button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#A9A7B7] hover:text-white rounded transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/80" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col w-[280px] bg-[#0c0a1f] border-r border-[#7C3DFF]/20 h-full p-4 z-50">
            <div className="flex items-center justify-between pb-4 border-b border-[#7C3DFF]/10">
              <Logo mode="dark" size="sm" href="/app" />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-[#A9A7B7] hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <NavLinks />
            <div className="pt-4 border-t border-[#7C3DFF]/10">
              <Button asChild variant="primary" className="w-full justify-center gap-2">
                <Link href="/app/projects/new" onClick={() => setMobileOpen(false)}>
                  <Plus className="h-4 w-4" />
                  <span>Nuevo proyecto</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0c0a1f] border-b border-[#7C3DFF]/15">
          <Logo mode="symbol" size="sm" href="/app" />
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-[#A9A7B7] hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Scrollable Content Container (max 1440px) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#080714]">
          <div className="max-w-[1440px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
