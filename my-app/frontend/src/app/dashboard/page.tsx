'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';

// Types matching backend TripListOut schema
type Trip = {
  id: number;
  name: string;
  cover_url: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  is_public: boolean;
  stop_count: number;
  total_cost: number;
  created_at: string;
};

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
});

// Fallback images when trip has no cover
const fallbackImages = [
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
  'https://images.unsplash.com/photo-1513635269975-59693e0cd100?w=800',
];

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'No dates set';
  const s = new Date(start);
  const startStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (!end) return startStr;
  const e = new Date(end);
  const endStr = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startStr} – ${endStr}`;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch user's trips from backend
  useEffect(() => {
    if (!user) return;
    const loadTrips = async () => {
      try {
        const data = await fetchApi('/trips/');
        setTrips(data || []);
      } catch (err) {
        console.error('Failed to load trips:', err);
        setTrips([]);
      } finally {
        setTripsLoading(false);
      }
    };
    loadTrips();
  }, [user]);

  const displayName = user ? user.full_name.split(' ')[0] : 'Traveler';

  // Compute stats from real data
  const tripCount = trips.length;
  const totalBudget = trips.reduce((sum, t) => sum + (t.total_cost || 0), 0);
  const totalSpent = trips
    .filter(t => t.status === 'completed' || t.status === 'ongoing')
    .reduce((sum, t) => sum + (t.total_cost || 0), 0);

  // Show most recent 3 trips
  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-65px)] max-w-7xl mx-auto px-6 py-12 md:py-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] max-w-7xl mx-auto px-6 py-12 md:py-20">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-black/10 dark:border-white/10 pb-12">
        <div>
          <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">{today}</p>
          <h1 className="serif text-5xl md:text-7xl leading-[0.95]">
            Welcome back,<br />
            <span className="text-gray-400 dark:text-gray-500">{displayName}.</span>
          </h1>
        </div>
        <Link
          href="/trips/new"
          className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 sans text-[10px] uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-white transition whitespace-nowrap text-center"
        >
          + Plan New Trip
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 mb-16">
        <div className="bg-white dark:bg-black p-8">
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Total Estimated</p>
          {tripsLoading ? (
            <div className="h-12 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
          ) : (
            <p className="serif text-4xl md:text-5xl">₹{(totalBudget * 83).toLocaleString('en-IN')}</p>
          )}
        </div>
        <div className="bg-white dark:bg-black p-8">
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Active Spend</p>
          {tripsLoading ? (
            <div className="h-12 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
          ) : (
            <p className="serif text-4xl md:text-5xl">₹{(totalSpent * 83).toLocaleString('en-IN')}</p>
          )}
        </div>
        <div className="bg-white dark:bg-black p-8 group hover:bg-black/5 dark:hover:bg-white/5 transition relative cursor-pointer">
          <Link href="/trips" className="absolute inset-0 z-10"></Link>
          <div className="flex justify-between items-start mb-4">
            <p className="sans text-[10px] uppercase tracking-widest text-gray-500">Your Trips</p>
            <span className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition transform group-hover:translate-x-1">&rarr;</span>
          </div>
          {tripsLoading ? (
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
          ) : (
            <p className="serif text-4xl md:text-5xl">{tripCount}</p>
          )}
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

        {/* Left Column: Recent Itineraries */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-8">
            <h2 className="serif text-3xl">Recent Itineraries.</h2>
            <Link href="/trips" className="sans text-[10px] uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition pb-1 border-b border-black/10 dark:border-white/10">
              View All
            </Link>
          </div>

          {tripsLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-6 p-4 border border-black/10 dark:border-white/10">
                  <div className="w-24 h-24 sm:w-32 sm:h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                  <div className="flex-grow space-y-3">
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentTrips.length > 0 ? (
            <div className="space-y-6">
              {recentTrips.map((trip, index) => (
                <Link key={trip.id} href={`/trips/${trip.id}`} className="block group">
                  <div className="flex items-center gap-6 p-4 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition">
                    <div className="w-24 h-24 sm:w-32 sm:h-24 flex-shrink-0 overflow-hidden relative">
                      <img
                        src={trip.cover_url || fallbackImages[index % fallbackImages.length]}
                        alt={trip.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
                      />
                      {trip.status === 'ongoing' && (
                        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-accent animate-pulse shadow-lg"></div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="sans text-[10px] uppercase tracking-widest text-accent mb-1">
                        {formatDateRange(trip.start_date, trip.end_date)}
                      </p>
                      <h3 className="serif text-xl sm:text-2xl mb-1">{trip.name}</h3>
                      <p className="sans text-xs text-gray-500">
                        {trip.stop_count} {trip.stop_count === 1 ? 'stop' : 'stops'} · {trip.status}
                      </p>
                    </div>
                    <div className="pr-4 hidden sm:block opacity-0 group-hover:opacity-100 transition transform -translate-x-2 group-hover:translate-x-0">
                      &rarr;
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-black/20 dark:border-white/20 p-12 text-center">
              <p className="serif text-2xl mb-2">No trips yet.</p>
              <p className="sans text-xs text-gray-500 uppercase tracking-widest mb-6">Start planning your first adventure</p>
              <Link
                href="/trips/new"
                className="inline-block bg-black text-white dark:bg-white dark:text-black px-6 py-3 sans text-[10px] uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-white transition"
              >
                + Create Trip
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Toolkit */}
        <div className="lg:col-span-1 space-y-12">
          <div>
            <h2 className="serif text-3xl mb-8">Toolkit.</h2>
            <div className="space-y-4">
              <Link href="/search" className="flex items-center justify-between p-6 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition group">
                <div>
                  <h3 className="serif text-xl mb-1">Discover</h3>
                  <p className="sans text-[10px] uppercase tracking-widest text-gray-500">Find Destinations</p>
                </div>
                <span className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition">&rarr;</span>
              </Link>
              <Link href="/activities" className="flex items-center justify-between p-6 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition group">
                <div>
                  <h3 className="serif text-xl mb-1">Activities</h3>
                  <p className="sans text-[10px] uppercase tracking-widest text-gray-500">Browse Experiences</p>
                </div>
                <span className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition">&rarr;</span>
              </Link>
              <Link href="/checklist" className="flex items-center justify-between p-6 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition group">
                <div>
                  <h3 className="serif text-xl mb-1">Checklist</h3>
                  <p className="sans text-[10px] uppercase tracking-widest text-gray-500">Packing & Prep</p>
                </div>
                <span className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition">&rarr;</span>
              </Link>
              <Link href="/notes" className="flex items-center justify-between p-6 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition group">
                <div>
                  <h3 className="serif text-xl mb-1">Journal</h3>
                  <p className="sans text-[10px] uppercase tracking-widest text-gray-500">Travel Logs</p>
                </div>
                <span className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
