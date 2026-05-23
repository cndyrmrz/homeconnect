'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Zap, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      error ? setError(error.message) : setSuccess('Check your email to confirm, then sign in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/4 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.06, 0.64, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Brand mark */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-ink mb-5"
          >
            <Zap size={18} className="text-canvas" />
          </motion.div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">HomeConnect</h1>
          <p className="text-sm text-muted mt-1.5">
            {isSignUp ? 'Create your agent account' : 'Sign in to your workspace'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted">Email</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@brokerage.com"
                className="input-base"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted">Password</label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>

            {/* Feedback messages */}
            <AnimatePresence mode="wait">
              {(error || success) && (
                <motion.p
                  key={error || success}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-xs leading-relaxed ${success ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}
                >
                  {error || success}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Continue'}
                  <ArrowRight size={14} />
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Toggle sign-up / sign-in */}
        <p className="text-center text-xs text-muted mt-5">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
            className="text-ink font-medium hover:text-accent transition-colors"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
