import type { City } from '@/lib/types';

export default function CityCard({ city }: { city: City }) {
  return (
    <article className="rounded-3xl border border-black/10 bg-white p-6">
      <h3 className="font-semibold">{city.name}</h3>
      <p className="text-sm text-black/70">{city.country}</p>
    </article>
  );
}
