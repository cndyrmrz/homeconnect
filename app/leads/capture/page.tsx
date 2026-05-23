'use client';

// Public lead capture page — shareable URL for prospects
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const INTERESTS = [
  { value: 'buying',    label: 'Buying a home',        emoji: '🏠' },
  { value: 'renting',   label: 'Renting a property',   emoji: '🔑' },
  { value: 'selling',   label: 'Selling my home',       emoji: '📝' },
  { value: 'investing', label: 'Investment property',   emoji: '📈' },
  { value: 'other',     label: 'Just exploring',        emoji: '👀' },
];

export default function LeadCapturePage() {
  const [form, setForm]     = useState({ name: '', phone: '', email: '', interest: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [step, setStep]     = useState(1); // 1 = details, 2 = interest

  async function handleSubmit() {
    setStatus('loading');
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? 'success' : 'error');
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-500/10 mb-6"
          >
            <CheckCircle2 size={28} className="text-green-600 dark:text-green-400" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-ink tracking-tight mb-2">You're all set!</h2>
          <p className="text-muted text-sm leading-relaxed">
            We'll text you within a few minutes to answer your questions and find a time to chat.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      {/* Ambient light */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-ink mb-4">
            <Zap size={18} className="text-canvas" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Find your perfect home</h1>
          <p className="text-sm text-muted mt-1.5">Tell us a bit about yourself and we'll be in touch.</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ width: step === i ? 24 : 6 }}
              transition={{ duration: 0.3 }}
              className={`h-1.5 rounded-full transition-colors ${step >= i ? 'bg-ink' : 'bg-border'}`}
            />
          ))}
        </div>

        <div className="glass-card p-7">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleStep1}
                className="space-y-4"
              >
                <p className="text-xs font-medium text-muted mb-1">Your details</p>

                <div className="space-y-1">
                  <label className="text-xs text-muted">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Smith" className="input-base" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">Phone Number *</label>
                  <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000" className="input-base" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">Email <span className="text-faint">(optional)</span></label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@example.com" className="input-base" />
                </div>

                <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full mt-2">
                  Continue <ArrowRight size={14} />
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs font-medium text-muted mb-3">What are you looking for?</p>
                <div className="space-y-2 mb-5">
                  {INTERESTS.map(opt => (
                    <motion.button
                      key={opt.value}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setForm({ ...form, interest: opt.value })}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all
                        ${form.interest === opt.value
                          ? 'border-accent/40 bg-accent/5 text-ink'
                          : 'border-border bg-canvas text-muted hover:border-border/80 hover:text-ink'
                        }`}
                    >
                      <span>{opt.emoji}</span>
                      {opt.label}
                      {form.interest === opt.value && (
                        <CheckCircle2 size={14} className="ml-auto text-accent flex-shrink-0" />
                      )}
                    </motion.button>
                  ))}
                </div>

                {status === 'error' && (
                  <p className="text-xs text-red-500 mb-3">Something went wrong. Please try again.</p>
                )}

                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost px-4">Back</button>
                  <motion.button
                    type="button"
                    disabled={status === 'loading'}
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary flex-1"
                  >
                    {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <>Get in Touch <ArrowRight size={14} /></>}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-faint mt-4 leading-relaxed">
          By submitting you agree to receive SMS messages. Reply STOP to opt out.
        </p>
      </div>
    </div>
  );
}
