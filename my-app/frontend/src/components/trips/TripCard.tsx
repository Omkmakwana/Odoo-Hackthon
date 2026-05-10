import type { Trip } from '@/lib/types';

export default function TripCard({ trip }: { trip: Trip }) {
  return (
    <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-black/50">{trip.status}</p>
      <h3 className="mt-2 text-xl font-semibold">{trip.name}</h3>
      <p className="mt-2 text-sm text-black/70">{trip.description ?? 'Trip summary'}</p>
    </article>
  );
}
