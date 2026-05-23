'use client';

import { motion } from 'framer-motion';
import { CalendarDays, Clock, Phone } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';

type Appointment = {
  id: string;
  scheduled_at: string;
  status: string;
  duration_minutes: number;
  notes?: string;
  leads: { name: string; phone: string; email: string; interest: string };
};

export default function AppointmentsClient({ appointments }: { appointments: Appointment[] }) {
  const now = new Date();
  const upcoming = appointments.filter(a => new Date(a.scheduled_at) >= now);
  const past     = appointments.filter(a => new Date(a.scheduled_at) < now);

  return (
    <div className="px-8 py-8 max-w-4xl">
      <PageHeader
        title="Appointments"
        description={`${upcoming.length} upcoming · ${past.length} past`}
      />

      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No appointments yet"
          description="The AI will book appointments automatically as it qualifies leads. Connect Google Calendar in Settings to sync."
        />
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <Section title="Upcoming" appointments={upcoming} />
          )}

          {/* Past */}
          {past.length > 0 && (
            <Section title="Past" appointments={past} muted />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Timeline section ─────────────────────────────────────────────────────────
function Section({ title, appointments, muted = false }: {
  title: string; appointments: Appointment[]; muted?: boolean;
}) {
  return (
    <div>
      <p className="section-title mb-3">{title}</p>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-2"
      >
        {appointments.map((appt, i) => (
          <AppointmentCard key={appt.id} appt={appt} muted={muted} index={i} />
        ))}
      </motion.div>
    </div>
  );
}

function AppointmentCard({ appt, muted, index }: { appt: Appointment; muted: boolean; index: number }) {
  const date = new Date(appt.scheduled_at);

  const dayName  = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum   = date.getDate();
  const month    = date.toLocaleDateString('en-US', { month: 'short' });
  const time     = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
      whileHover={{ y: -1, transition: { duration: 0.2 } }}
      className={`flex items-center gap-5 rounded-2xl border border-border/60 bg-surface px-5 py-4
        hover:shadow-md transition-shadow duration-300 ${muted ? 'opacity-60' : ''}`}
    >
      {/* Date block */}
      <div className="flex-shrink-0 w-14 text-center">
        <div className="text-xs text-muted font-medium uppercase">{dayName}</div>
        <div className="text-2xl font-semibold text-ink tabular-nums leading-none my-0.5">{dayNum}</div>
        <div className="text-xs text-muted">{month}</div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-border/60 flex-shrink-0" />

      {/* Lead info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <span className="text-accent text-xs font-semibold">{appt.leads?.name?.[0]?.toUpperCase()}</span>
          </div>
          <span className="text-sm font-medium text-ink truncate">{appt.leads?.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1"><Clock size={10} />{time}</span>
          {appt.leads?.phone && (
            <span className="flex items-center gap-1"><Phone size={10} />{appt.leads.phone}</span>
          )}
          {appt.leads?.interest && (
            <span className="capitalize hidden sm:block">{appt.leads.interest}</span>
          )}
        </div>
      </div>

      {/* Status + duration */}
      <div className="flex-shrink-0 flex items-center gap-3">
        <span className="text-xs text-muted hidden sm:block">{appt.duration_minutes ?? 30} min</span>
        <Badge status={appt.status} />
      </div>
    </motion.div>
  );
}
