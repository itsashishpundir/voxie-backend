'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth';
import {
  LayoutDashboard, BookOpen, Users, Image, BarChart2,
  Settings, LogOut, Puzzle,
} from 'lucide-react';

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/courses', icon: BookOpen, label: 'Courses' },
  { href: '/dashboard/exercise-types', icon: Puzzle, label: 'Exercise Types' },
  { href: '/dashboard/users', icon: Users, label: 'Users' },
  { href: '/dashboard/media', icon: Image, label: 'Media' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/dashboard/config', icon: Settings, label: 'App Config' },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-sidebar flex flex-col z-20">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <span className="text-2xl">🦜</span>
        <div>
          <p className="text-white font-bold text-sm">Voxie</p>
          <p className="text-slate-400 text-xs">Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const active = item.href === '/dashboard'
            ? path === '/dashboard'
            : path.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
