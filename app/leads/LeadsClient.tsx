'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Users, MessageSquare, Phone,
  Mail, ArrowUpRight, ChevronRight, Loader2, Link2
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';

type Lead = {
  id: string; name: string; phone: string; email: string;
  interest: string; status: string; created_at: string;
  conversations?: { id: string; status: string; updated_at: string; messages: any[] }[];
};

type Props = { leads: Lead[]; agentId: string };

const INTEREST_LABEL: Record<string, string> = {
  buying: 'Buying', renting: 'Renting', selling: 'Selling', investing: 'Investing', other: 'Exploring',
};

export default function LeadsClient({ leads, agentId }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const filtered = leads.filter(l =>
    l.name?.toLowerCase().includes(query.toLowerCase()) ||
    l.phone?.includes(query) ||
    l.email?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="px-8 py-8 max-w-5xl">
      <PageHeader
        title="Leads"
        description={`${leads.length} total leads`}
        action={
          <>
            <a href="/leads/capture" target="_blank" rel="noreferrer">
              <button className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
                <Link2 size={12} /> Share Form
              </button>
            </a>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              <Plus size={14} /> Add Lead
            </button>
          </>
        }
      />

      {/* Add lead slide-down form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden mb-5"
          >
            <AddLeadForm agentId={agentId} onClose={() => { setShowAddForm(false); router.refresh(); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, phone, or email…"
          className="input-base pl-9"
        />
      </div>

      {/* Two-panel layout — list + conversation detail */}
      <div className="flex gap-4 min-h-[520px]">
        {/* Lead list */}
        <div className="flex-1 min-w-0 rounded-2xl border border-border/60 bg-surface overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No leads found"
              description={query ? 'Try a different search.' : 'Add your first lead or share the capture form.'}
              action={
                !query && (
                  <button onClick={() => setShowAddForm(true)} className="btn-primary text-xs px-3 py-2">
                    <Plus size={12} /> Add Lead
                  </button>
                )
              }
            />
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              className="divide-y divide-border/30"
            >
              {filtered.map(lead => {
                const conv = lead.conversations?.[0];
                const isSelected = selectedLead?.id === lead.id;
                return (
                  <motion.button
                    key={lead.id}
                    variants={{ hidden: { opacity: 0, x: -6 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3 } } }}
                    onClick={() => setSelectedLead(isSelected ? null : lead)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors
                      ${isSelected ? 'bg-accent/5' : 'hover:bg-canvas/50'}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent text-xs font-semibold">{lead.name?.[0]?.toUpperCase()}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-ink truncate">{lead.name}</span>
                        <span className="text-xs text-faint flex-shrink-0">
                          {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted">{lead.phone}</span>
                        {lead.interest && (
                          <>
                            <span className="text-faint">·</span>
                            <span className="text-xs text-muted">{INTEREST_LABEL[lead.interest] ?? lead.interest}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge status={lead.status} />
                      {conv && conv.status === 'active' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse-soft" />
                      )}
                      <ChevronRight size={12} className={`text-faint transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Conversation detail panel */}
        <AnimatePresence>
          {selectedLead && (
            <motion.div
              key={selectedLead.id}
              initial={{ opacity: 0, x: 12, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 320 }}
              exit={{ opacity: 0, x: 12, width: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="flex-shrink-0 rounded-2xl border border-border/60 bg-surface overflow-hidden flex flex-col"
              style={{ width: 320 }}
            >
              <ConversationPanel lead={selectedLead} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Conversation Panel ───────────────────────────────────────────────────────
function ConversationPanel({ lead }: { lead: Lead }) {
  const conv = lead.conversations?.[0];
  const messages: { role: string; content: string; timestamp: string }[] = conv?.messages ?? [];

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <span className="text-accent text-xs font-semibold">{lead.name?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <div className="text-sm font-medium text-ink">{lead.name}</div>
            <div className="text-xs text-muted flex items-center gap-2">
              <Phone size={10} /> {lead.phone}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Badge status={lead.status} />
          {conv && <Badge status={conv.status} />}
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full py-8">
            <div className="text-center">
              <MessageSquare size={18} className="text-faint mx-auto mb-2" />
              <p className="text-xs text-muted">No messages yet</p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed
                ${msg.role === 'assistant'
                  ? 'bg-canvas border border-border/60 text-ink rounded-tl-sm'
                  : 'bg-ink text-canvas rounded-tr-sm'
                }`}
              >
                {msg.content.replace(/\[APPOINTMENT_BOOKED:[^\]]+\]/g, '').trim()}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Lead details footer */}
      <div className="border-t border-border/40 px-4 py-3 space-y-1">
        {lead.email && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <Mail size={11} /> {lead.email}
          </div>
        )}
        {lead.interest && (
          <div className="text-xs text-muted capitalize">
            Looking to: {INTEREST_LABEL[lead.interest] ?? lead.interest}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Add Lead Form ────────────────────────────────────────────────────────────
function AddLeadForm({ agentId, onClose }: { agentId: string; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', interest: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, agentId }),
    });

    if (res.ok) {
      setStatus('success');
      setTimeout(onClose, 1200);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Something went wrong. Check your Twilio settings.');
      setStatus('error');
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-5 mb-1">
      <h3 className="text-sm font-medium text-ink mb-4">New Lead</h3>
      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input required placeholder="Full Name *" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} className="input-base" />
        <input required type="tel" placeholder="Phone *" value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })} className="input-base" />
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} className="input-base" />
        <select value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })}
          className="input-base">
          <option value="">Interest</option>
          <option value="buying">Buying</option>
          <option value="renting">Renting</option>
          <option value="selling">Selling</option>
          <option value="investing">Investing</option>
        </select>

        <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-3">
          <button type="submit" disabled={status === 'loading'} className="btn-primary">
            {status === 'loading' ? <><Loader2 size={13} className="animate-spin" /> Adding…</> : 'Add & Start Conversation'}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          {status === 'success' && <span className="text-xs text-green-600">Lead added! AI texting them now.</span>}
          {status === 'error' && <span className="text-xs text-red-500">{error}</span>}
        </div>
      </form>
    </div>
  );
}
