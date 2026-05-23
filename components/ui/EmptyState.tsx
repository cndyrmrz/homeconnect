'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      {/* Icon container with subtle ring */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-accent/5 scale-150 blur-xl" />
        <div className="relative w-14 h-14 rounded-2xl bg-canvas border border-border flex items-center justify-center">
          <Icon size={22} strokeWidth={1.5} className="text-faint" />
        </div>
      </div>

      <h3 className="text-sm font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-xs leading-relaxed">{description}</p>

      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
