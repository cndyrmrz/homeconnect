'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Bot, MessageSquare, CalendarDays, Clock,
  CheckCircle2, Eye, EyeOff, ExternalLink, Loader2
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

type Settings = {
  openai_api_key: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
  google_calendar_id: string;
  google_connected: boolean;
  business_hours: { start: string; end: string };
};

const DEFAULT: Settings = {
  openai_api_key: '',
  twilio_account_sid: '',
  twilio_auth_token: '',
  twilio_phone_number: '',
  google_calendar_id: 'primary',
  google_connected: false,
  business_hours: { start: '09:00', end: '17:00' },
};

export default function SettingsClient({ initialSettings, agentId }: {
  initialSettings: Partial<Settings> | null;
  agentId: string;
}) {
  const supabase = createClient();
  const [s, setS] = useState<Settings>({ ...DEFAULT, ...(initialSettings ?? {}) });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase
      .from('agent_settings')
      .upsert({ agent_id: agentId, ...s }, { onConflict: 'agent_id' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const sections = [
    {
      icon: Bot,
      title: 'OpenAI',
      description: 'Powers the AI conversation engine',
      fields: (
        <SecretField
          label="API Key"
          value={s.openai_api_key}
          placeholder="sk-proj-…"
          onChange={v => setS({ ...s, openai_api_key: v })}
          hint={<a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">Get key <ExternalLink size={10} /></a>}
        />
      ),
      status: s.openai_api_key ? 'connected' : 'not_set',
    },
    {
      icon: MessageSquare,
      title: 'Twilio SMS',
      description: 'Sends and receives texts with your leads',
      fields: (
        <div className="space-y-3">
          <PlainField label="Account SID" value={s.twilio_account_sid} placeholder="ACxxxxxxxx…"
            onChange={v => setS({ ...s, twilio_account_sid: v })} />
          <SecretField label="Auth Token" value={s.twilio_auth_token} placeholder="your auth token"
            onChange={v => setS({ ...s, twilio_auth_token: v })} />
          <PlainField label="Phone Number" value={s.twilio_phone_number} placeholder="+15551234567"
            onChange={v => setS({ ...s, twilio_phone_number: v })} />
        </div>
      ),
      status: (s.twilio_account_sid && s.twilio_auth_token && s.twilio_phone_number) ? 'connected' : 'not_set',
    },
    {
      icon: CalendarDays,
      title: 'Google Calendar',
      description: 'Checks availability and books appointments',
      fields: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${s.google_connected ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
              <span className="text-sm text-muted">
                {s.google_connected ? 'Calendar connected' : 'Not connected'}
              </span>
            </div>
            <a href="/api/auth/google">
              <button type="button" className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <ExternalLink size={11} />
                {s.google_connected ? 'Reconnect' : 'Connect Google'}
              </button>
            </a>
          </div>
          <PlainField label="Calendar ID" value={s.google_calendar_id} placeholder="primary"
            onChange={v => setS({ ...s, google_calendar_id: v })} />
        </div>
      ),
      status: s.google_connected ? 'connected' : 'not_set',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      description: 'AI only offers slots within these hours',
      fields: (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1.5">Open</label>
            <input type="time" value={s.business_hours.start}
              onChange={e => setS({ ...s, business_hours: { ...s.business_hours, start: e.target.value } })}
              className="input-base" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1.5">Close</label>
            <input type="time" value={s.business_hours.end}
              onChange={e => setS({ ...s, business_hours: { ...s.business_hours, end: e.target.value } })}
              className="input-base" />
          </div>
        </div>
      ),
      status: 'neutral',
    },
  ];

  return (
    <div className="px-8 py-8 max-w-2xl">
      <PageHeader title="Settings" description="Configure your integrations" />

      <form onSubmit={handleSave} className="space-y-4">
        {sections.map(({ icon: Icon, title, description, fields, status }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="rounded-2xl border border-border/60 bg-surface overflow-hidden"
          >
            {/* Section header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-canvas border border-border/60 flex items-center justify-center">
                  <Icon size={14} strokeWidth={1.8} className="text-muted" />
                </div>
                <div>
                  <div className="text-sm font-medium text-ink">{title}</div>
                  <div className="text-xs text-muted">{description}</div>
                </div>
              </div>
              {status === 'connected' && (
                <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle2 size={12} />Connected
                </span>
              )}
            </div>

            {/* Fields */}
            <div className="px-5 py-4">{fields}</div>
          </motion.div>
        ))}

        {/* Save */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-between pt-2"
        >
          <p className="text-xs text-muted">Credentials are stored in your Supabase project.</p>
          <button type="submit" disabled={saving} className="btn-primary px-6">
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> :
             saved  ? <><CheckCircle2 size={13} /> Saved</> : 'Save Changes'}
          </button>
        </motion.div>
      </form>
    </div>
  );
}

// ─── Field components ─────────────────────────────────────────────────────────
function PlainField({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-muted">{label}</label>
        {hint && <span className="text-xs">{hint}</span>}
      </div>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className="input-base" />
    </div>
  );
}

function SecretField({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-muted">{label}</label>
        {hint && <span className="text-xs">{hint}</span>}
      </div>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-base pr-10" />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted transition-colors">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}
