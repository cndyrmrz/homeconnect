// Minimal status badge — consistent across all tables and panels
type Variant = 'new' | 'contacted' | 'qualified' | 'booked' | 'lost' |
               'active' | 'completed' | 'failed' |
               'pending' | 'confirmed' | 'cancelled';

const STYLES: Record<string, string> = {
  new:       'bg-blue-50   text-blue-600   dark:bg-blue-500/10   dark:text-blue-400',
  contacted: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  qualified: 'bg-amber-50  text-amber-600  dark:bg-amber-500/10  dark:text-amber-400',
  booked:    'bg-green-50  text-green-600  dark:bg-green-500/10  dark:text-green-400',
  lost:      'bg-zinc-100  text-zinc-500   dark:bg-zinc-500/10   dark:text-zinc-400',
  active:    'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  completed: 'bg-green-50  text-green-600  dark:bg-green-500/10  dark:text-green-400',
  failed:    'bg-red-50    text-red-500    dark:bg-red-500/10    dark:text-red-400',
  pending:   'bg-amber-50  text-amber-600  dark:bg-amber-500/10  dark:text-amber-400',
  confirmed: 'bg-green-50  text-green-600  dark:bg-green-500/10  dark:text-green-400',
  cancelled: 'bg-zinc-100  text-zinc-500   dark:bg-zinc-500/10   dark:text-zinc-400',
};

const DOTS: Record<string, string> = {
  new:       'bg-blue-500',
  contacted: 'bg-violet-500',
  active:    'bg-violet-500',
  qualified: 'bg-amber-500',
  booked:    'bg-green-500',
  completed: 'bg-green-500',
  confirmed: 'bg-green-500',
  lost:      'bg-zinc-400',
  cancelled: 'bg-zinc-400',
  failed:    'bg-red-500',
  pending:   'bg-amber-500',
};

export default function Badge({ status, dot = false }: { status: string; dot?: boolean }) {
  const style = STYLES[status] ?? 'bg-zinc-100 text-zinc-500';
  const dotColor = DOTS[status] ?? 'bg-zinc-400';

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${style}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse-soft`} />}
      {status}
    </span>
  );
}
