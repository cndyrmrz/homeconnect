'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react';

type User = { email?: string };

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/leads',        label: 'Leads',         icon: Users },
  { href: '/appointments', label: 'Appointments',  icon: CalendarDays },
];

const BOTTOM_NAV = [
  { href: '/settings',    label: 'Settings',      icon: Settings },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <motion.aside
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-y-0 left-0 z-20 flex flex-col w-[220px]
                 bg-surface/90 backdrop-blur-xl border-r border-border/60"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-border/40">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-ink">
          <Zap size={14} className="text-canvas" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-ink">HomeConnect</span>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="section-title px-3 mb-3">Workspace</p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}>
              <motion.div
                className={`nav-item ${active ? 'active' : ''}`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                <span>{label}</span>
                {active && (
                  <ChevronRight size={12} className="ml-auto opacity-50" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-border/40 pt-3">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                className={`nav-item ${active ? 'active' : ''}`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{label}</span>
              </motion.div>
            </Link>
          );
        })}

        {/* User + logout */}
        <div className="mt-2 pt-3 border-t border-border/40">
          <div className="flex items-center gap-3 px-3 py-2 group">
            <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
              <span className="text-accent text-xs font-semibold">
                {user?.email?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <span className="text-xs text-muted truncate flex-1 min-w-0">
              {user?.email}
            </span>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-raised text-muted hover:text-ink"
              title="Log out"
            >
              <LogOut size={13} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
