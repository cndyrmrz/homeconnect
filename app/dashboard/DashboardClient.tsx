'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, CalendarDays, MessageSquare, CheckCircle2,
  ArrowUpRight, Plus, Clock, Sparkles
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

type Props = {
  leads: any[];
  appointments: any[];
  conversations: any[];
  agentId: string;
};

// Stagger container — children animate one by one
const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
};

export default function DashboardClient({ leads, appointments, conversations, agentId }: Props) {
  const activeConversations = conversations.filter(c => c.status === 'active');
  const bookedLeads = leads.filter(l => l.status === 'booked');

  const stats = [
    { label: 'Total Leads',    value: leads.length,               icon: Users,          href: '/leads',        index: 0 },
    { label: 'Conversations',  value: activeConversations.length, icon: MessageSquare,  href: '/leads',        index: 1, accent: activeConversations.length > 0 },
    { label: 'Appointments',   value: appointments.length,        icon: CalendarDays,   href: '/appointments', index: 2 },
    { label: 'Booked',         value: bookedLeads.length,         icon: CheckCircle2,   href: '/leads',        index: 3 },
  ];

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">Your AI is working in the background.</p>
        </div>
        <Link href="/leads">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
          >
            <Plus size={14} />
            Add Lead
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Two-column content grid */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent leads — wider column */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-3 rounded-2xl border border-border/60 bg-surface overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <span className="text-sm font-medium text-ink">Recent Leads</span>
            <Link href="/leads" className="text-xs text-muted hover:text-ink flex items-center gap-1 transition-colors">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          {leads.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No leads yet"
              description="Share your lead capture form and they'll appear here automatically."
              action={
                <Link href="/leads/capture" target="_blank">
                  <button className="btn-secondary text-xs px-3 py-1.5">Copy form link</button>
                </Link>
              }
            />
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="visible" className="divide-y divide-border/30">
              {leads.map((lead) => (
                <motion.div key={lead.id} variants={item}
                  className="flex items-center justify-between px-5 py-3 hover:bg-canvas/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent text-xs font-semibold">
                        {lead.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{lead.name}</div>
                      <div className="text-xs text-faint">{lead.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-faint hidden sm:block">
                      {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <Badge status={lead.status} dot={lead.status === 'contacted' || lead.status === 'qualified'} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Upcoming appointments */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.38 }}
            className="flex-1 rounded-2xl border border-border/60 bg-surface overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <span className="text-sm font-medium text-ink">Upcoming</span>
              <Link href="/appointments" className="text-xs text-muted hover:text-ink flex items-center gap-1 transition-colors">
                All <ArrowUpRight size={12} />
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Clock size={20} className="text-faint mx-auto mb-2" />
                <p className="text-xs text-muted">No upcoming appointments</p>
              </div>
            ) : (
              <motion.div variants={stagger} initial="hidden" animate="visible" className="divide-y divide-border/30">
                {appointments.map(appt => (
                  <motion.div key={appt.id} variants={item}
                    className="px-5 py-3 hover:bg-canvas/50 transition-colors"
                  >
                    <div className="text-sm font-medium text-ink truncate">{(appt.leads as any)?.name}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-muted">
                        {new Date(appt.scheduled_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
                      </span>
                      <Badge status={appt.status} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* AI status card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="rounded-2xl border border-border/60 bg-surface px-5 py-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                <Sparkles size={14} className="text-accent" />
              </div>
              <div>
                <div className="text-sm font-medium text-ink">AI Status</div>
                <div className="text-xs text-muted">Automatic outreach</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-soft" />
              <span className="text-xs text-muted">
                {activeConversations.length > 0
                  ? `${activeConversations.length} active conversation${activeConversations.length !== 1 ? 's' : ''}`
                  : 'Ready — waiting for new leads'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Share link banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-4 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4 flex items-center justify-between"
      >
        <div>
          <p className="text-sm font-medium text-ink">Share your lead capture form</p>
          <p className="text-xs text-muted mt-0.5">New leads will be texted by the AI instantly.</p>
        </div>
        <Link href="/leads/capture" target="_blank">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
          >
            Open form <ArrowUpRight size={12} />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
