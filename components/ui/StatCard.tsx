'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LucideIcon, TrendingUp } from 'lucide-react';

type Props = {
  label: string;
  value: number;
  icon: LucideIcon;
  href?: string;
  trend?: { value: number; label: string };
  accent?: boolean;
  index?: number;
};

export default function StatCard({ label, value, icon: Icon, href, trend, accent = false, index = 0 }: Props) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-border/60
                 bg-surface shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
    >
      {/* Subtle top gradient line on accent card */}
      {accent && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />
      )}

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-noise pointer-events-none" />

      <div className="relative p-5">
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-4
          ${accent
            ? 'bg-accent/10 text-accent'
            : 'bg-canvas text-muted border border-border/60 group-hover:text-ink transition-colors'
          }`}
        >
          <Icon size={16} strokeWidth={1.8} />
        </div>

        {/* Value */}
        <div className="tabular-nums text-3xl font-semibold tracking-tight text-ink">
          {value}
        </div>

        {/* Label + trend */}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm text-muted">{label}</span>
          {trend && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
              <TrendingUp size={11} />
              {trend.value}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
