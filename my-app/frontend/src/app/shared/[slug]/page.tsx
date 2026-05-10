'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_BASE = 'http://localhost:8000/api';

type Activity = {
  name: string;
  description: string;
  day_number: number;
  time_slot: string;
  duration_minutes: number;
  estimated_cost: number;
  cost_category: string;
};

type Stop = {
  city_name: string;
  country: string;
  arrival_date: string | null;
  departure_date: string | null;
  order: number;
  activities: Activity[];
};

type SharedTrip = {
  id: number;
  name: string;
  description: string;
  cover_url: string | null;
  owner_name: string;
  start_date: string | null;
  end_date: string | null;
  budget_limit: number;
  total_cost: number;
  stop_count: number;
  public_slug: string | null;
  stops: Stop[];
  created_at: string;
};

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'Dates not set';
  const s = new Date(start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  if (!end) return s;
  const e = new Date(end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return `${s} – ${e}`;
}

function costIcon(cat: string): string {
  const map: Record<string, string> = { transport: '✈', stay: '🏨', meal: '🍽', activity: '🎯' };
  return map[cat] || '•';
}

export default function SharedItineraryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyingTrip, setCopyingTrip] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/shared/${slug}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('This itinerary does not exist or is no longer public.');
          throw new Error('Failed to load itinerary.');
        }
        const data = await res.json();
        setTrip(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const handleCopyTrip = async () => {
    if (!trip) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setCopyingTrip(true);
    try {
      const res = await fetch(`${API_BASE}/community/trips/${trip.id}/copy`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to copy trip.');
      }
      setCopySuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Copy failed.');
    } finally {
      setCopyingTrip(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black dark:border-gray-700 dark:border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-500">Loading itinerary…</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error && !trip) {
    return (
      <main className="min-h-[calc(100vh-65px)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="serif text-5xl mb-4">404</h1>
          <p className="sans text-sm text-gray-500 mb-8">{error}</p>
          <Link href="/" className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 sans text-[10px] uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-white transition">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  if (!trip) return null;

  // Sort stops by order
  const sortedStops = [...trip.stops].sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-[calc(100vh-65px)]">

      {/* ── Hero Section ── */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {trip.cover_url ? (
          <img
            src={trip.cover_url}
            alt={trip.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 sans text-[9px] uppercase tracking-[0.2em] border border-white/20">
              Shared Itinerary
            </span>
            <span className="bg-accent/80 backdrop-blur-md text-white px-3 py-1.5 sans text-[9px] uppercase tracking-[0.2em] border border-accent/30">
              {trip.stop_count} {trip.stop_count === 1 ? 'Stop' : 'Stops'}
            </span>
          </div>
          <h1 className="serif text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] mb-4">
            {trip.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-white/60 sans text-[10px] uppercase tracking-[0.2em]">
            <span>By {trip.owner_name}</span>
            <span className="w-px h-3 bg-white/30 hidden sm:block"></span>
            <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
            {trip.total_cost > 0 && (
              <>
                <span className="w-px h-3 bg-white/30 hidden sm:block"></span>
                <span>Est. ${trip.total_cost.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-black sticky top-[65px] z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCopyLink}
              className="border border-black/20 dark:border-white/20 px-5 py-2.5 sans text-[10px] uppercase tracking-widest hover:border-black dark:hover:border-white transition flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            {/* Social Share */}
            <a
              href={`https://twitter.com/intent/tweet?text=Check out this trip: ${trip.name}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-black/20 dark:border-white/20 p-2.5 hover:border-black dark:hover:border-white transition"
              title="Share on X"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out this trip: ${trip.name} — ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-black/20 dark:border-white/20 p-2.5 hover:border-black dark:hover:border-white transition"
              title="Share on WhatsApp"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>

          {copySuccess ? (
            <Link
              href="/trips"
              className="bg-accent text-white px-6 py-2.5 sans text-[10px] uppercase tracking-widest transition"
            >
              ✓ View in My Trips
            </Link>
          ) : (
            <button
              onClick={handleCopyTrip}
              disabled={copyingTrip}
              className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 sans text-[10px] uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-white transition disabled:opacity-50"
            >
              {copyingTrip ? 'Copying…' : 'Copy This Trip +'}
            </button>
          )}
        </div>
      </div>

      {/* ── Description ── */}
      {trip.description && (
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-12 border-b border-black/10 dark:border-white/10">
          <p className="sans text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-400 max-w-3xl">
            {trip.description}
          </p>
        </div>
      )}

      {/* ── Itinerary Stops ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        <div className="flex items-end justify-between mb-12 border-b border-black/10 dark:border-white/10 pb-6">
          <h2 className="serif text-4xl md:text-5xl">The Route.</h2>
          <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-500">
            {sortedStops.length} {sortedStops.length === 1 ? 'city' : 'cities'}
          </p>
        </div>

        {sortedStops.length === 0 ? (
          <div className="border border-dashed border-black/20 dark:border-white/20 p-16 text-center">
            <p className="serif text-2xl text-gray-400">No stops added yet.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {sortedStops.map((stop, index) => {
              const stopActivities = [...stop.activities].sort((a, b) => {
                if (a.day_number !== b.day_number) return a.day_number - b.day_number;
                return a.time_slot.localeCompare(b.time_slot);
              });
              const stopCost = stop.activities.reduce((s, a) => s + a.estimated_cost, 0);

              return (
                <div key={index} className="relative">
                  {/* Timeline connector */}
                  {index < sortedStops.length - 1 && (
                    <div className="absolute left-[19px] md:left-[23px] top-12 bottom-0 w-px bg-black/10 dark:bg-white/10"></div>
                  )}

                  <div className="flex gap-6 md:gap-10">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center sans text-xs font-bold bg-white dark:bg-black relative z-10">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>

                    {/* Stop content */}
                    <div className="flex-grow pb-16">
                      {/* City header */}
                      <div className="mb-6">
                        <h3 className="serif text-3xl md:text-4xl mb-1">{stop.city_name}</h3>
                        <div className="flex flex-wrap items-center gap-4 sans text-[10px] uppercase tracking-[0.2em] text-gray-500">
                          <span>{stop.country}</span>
                          {stop.arrival_date && (
                            <>
                              <span className="w-px h-3 bg-gray-300 dark:bg-gray-600"></span>
                              <span>{formatDate(stop.arrival_date)} → {formatDate(stop.departure_date)}</span>
                            </>
                          )}
                          {stopCost > 0 && (
                            <>
                              <span className="w-px h-3 bg-gray-300 dark:bg-gray-600"></span>
                              <span className="text-accent">${stopCost.toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Activities */}
                      {stopActivities.length > 0 && (
                        <div className="space-y-3">
                          {stopActivities.map((act, ai) => (
                            <div
                              key={ai}
                              className="border border-black/10 dark:border-white/10 p-5 hover:border-black/30 dark:hover:border-white/30 transition"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-grow">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="sans text-[9px] uppercase tracking-widest text-gray-400 bg-black/5 dark:bg-white/5 px-2 py-1">
                                      Day {act.day_number} · {act.time_slot}
                                    </span>
                                    <span className="sans text-[9px] uppercase tracking-widest text-gray-400">
                                      {costIcon(act.cost_category)} {act.cost_category}
                                    </span>
                                  </div>
                                  <h4 className="serif text-lg mb-1">{act.name}</h4>
                                  {act.description && (
                                    <p className="sans text-xs text-gray-500 leading-relaxed">{act.description}</p>
                                  )}
                                </div>
                                <div className="flex-shrink-0 text-right">
                                  {act.estimated_cost > 0 && (
                                    <p className="sans text-sm font-medium text-accent">${act.estimated_cost}</p>
                                  )}
                                  <p className="sans text-[9px] uppercase tracking-widest text-gray-400 mt-1">
                                    {act.duration_minutes}min
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Budget Summary Footer ── */}
      {trip.total_cost > 0 && (
        <div className="border-t border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10">
              <div className="bg-white dark:bg-black p-8">
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-3">Total Estimated</p>
                <p className="serif text-3xl md:text-4xl">${trip.total_cost.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-black p-8">
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-3">Budget Limit</p>
                <p className="serif text-3xl md:text-4xl">
                  {trip.budget_limit > 0 ? `$${trip.budget_limit.toLocaleString()}` : '—'}
                </p>
              </div>
              <div className="bg-white dark:bg-black p-8">
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-3">Total Stops</p>
                <p className="serif text-3xl md:text-4xl">{trip.stop_count}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom CTA ── */}
      <div className="border-t border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-16 text-center">
          <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">Inspired by this trip?</p>
          <h2 className="serif text-4xl md:text-5xl mb-8">Make it yours.</h2>
          {copySuccess ? (
            <Link
              href="/trips"
              className="inline-block bg-accent text-white px-10 py-4 sans text-[10px] uppercase tracking-widest transition"
            >
              ✓ Go to My Trips
            </Link>
          ) : (
            <button
              onClick={handleCopyTrip}
              disabled={copyingTrip}
              className="bg-black text-white dark:bg-white dark:text-black px-10 py-4 sans text-[10px] uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-white transition disabled:opacity-50"
            >
              {copyingTrip ? 'Copying…' : 'Copy This Trip to My Account'}
            </button>
          )}
          <p className="sans text-xs text-gray-400 mt-4">
            You&apos;ll get a full copy of the itinerary to customize as your own.
          </p>
        </div>
      </div>

    </main>
  );
}
