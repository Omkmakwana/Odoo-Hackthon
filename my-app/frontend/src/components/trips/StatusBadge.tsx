const statusStyles: Record<string, string> = {
  ongoing: 'bg-emerald-100 text-emerald-900',
  upcoming: 'bg-amber-100 text-amber-900',
  completed: 'bg-slate-200 text-slate-900'
};

export default function StatusBadge({ status }: { status: 'ongoing' | 'upcoming' | 'completed' }) {
  return <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${statusStyles[status]}`}>{status}</span>;
}
