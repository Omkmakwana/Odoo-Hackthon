'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';

/* ── Backend types ───────────────────────────────────────────────────── */

type CatalogActivity = {
  id: number;
  name: string;
  city_id: number | null;
  category: string;
  description: string;
  image_url: string | null;
  estimated_cost: number;
  duration_minutes: number;
  created_at: string;
};

type City = {
  id: number;
  name: string;
  country: string;
  region: string;
};

type TripOption = {
  id: number;
  name: string;
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

const CATEGORIES = ['All', 'sightseeing', 'food', 'adventure', 'culture', 'shopping'];
const COST_RANGES = [
  { label: 'Any Price', value: '' },
  { label: 'Under ₹2,000', value: '25' },
  { label: 'Under ₹6,000', value: '75' },
  { label: 'Under ₹16,000', value: '200' },
];
const DURATION_RANGES = [
  { label: 'Any Duration', value: '' },
  { label: 'Under 1 hour', value: '60' },
  { label: 'Under 2 hours', value: '120' },
  { label: 'Half-day (4h)', value: '240' },
  { label: 'Full-day (8h)', value: '480' },
];

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatCost(cost: number): string {
  if (cost === 0) return 'Free';
  return `₹${(cost * 83).toLocaleString('en-IN')}`;
}

function categoryLabel(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

const fallbackImage = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800';

/* ── Component ───────────────────────────────────────────────────────── */

export default function ActivitySearchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activities, setActivities] = useState<CatalogActivity[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCost, setSelectedCost] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');

  // UI state
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [addingToTrip, setAddingToTrip] = useState<number | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [imageFallbackMap, setImageFallbackMap] = useState<Record<number, boolean>>({});
  const [addSuccess, setAddSuccess] = useState<number | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  // Fetch cities + user trips (one time)
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [citiesData, tripsData] = await Promise.all([
          fetchApi('/cities'),
          fetchApi('/trips/'),
        ]);
        setCities(citiesData || []);
        setTrips((tripsData || []).map((t: { id: number; name: string }) => ({ id: t.id, name: t.name })));
      } catch (err) {
        console.error('Failed to load cities/trips', err);
      }
    };
    load();
  }, [user]);

  // Fetch activities with filters (debounced)
  const fetchActivities = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (selectedCost) params.set('max_cost', selectedCost);
      if (selectedDuration) params.set('max_duration', selectedDuration);
      if (selectedCityId) params.set('city_id', selectedCityId);
      params.set('limit', '50');

      const data = await fetchApi(`/activities?${params.toString()}`);
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [user, searchQuery, selectedCategory, selectedCost, selectedDuration, selectedCityId]);

  useEffect(() => {
    const timer = setTimeout(fetchActivities, 300);
    return () => clearTimeout(timer);
  }, [fetchActivities]);

  // Add activity to a trip stop
  const handleAddToTrip = async (activity: CatalogActivity) => {
    if (!selectedTripId) return;
    try {
      // Get trip details to find first stop
      const trip = await fetchApi(`/trips/${selectedTripId}`);
      if (!trip.stops || trip.stops.length === 0) {
        alert('This trip has no stops yet. Add a stop first.');
        return;
      }
      const stopId = trip.stops[0].id;
      await fetchApi(`/trips/${selectedTripId}/stops/${stopId}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          activity_id: activity.id,
          name: activity.name,
          description: activity.description,
          estimated_cost: activity.estimated_cost,
          duration_minutes: activity.duration_minutes,
          cost_category: 'activity',
        }),
      });
      setAddSuccess(activity.id);
      setTimeout(() => { setAddSuccess(null); setAddingToTrip(null); }, 2000);
    } catch (err) {
      console.error('Failed to add activity:', err);
      alert('Failed to add activity to trip.');
    }
  };

  // City lookup helper
  const getCityName = (cityId: number | null) => {
    if (!cityId) return null;
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : null;
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-65px)] px-6 py-12 md:py-20 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-16 border-b border-black/10 dark:border-white/10 pb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">Curate Your Experience</p>
          <h1 className="serif text-5xl md:text-7xl leading-[0.95]">
            Discover<br />
            <span className="text-gray-400 dark:text-gray-500">Activities.</span>
          </h1>
        </div>
        <p className="sans text-xs text-gray-500 max-w-xs">
          Browse and select things to do at each stop — sightseeing, food tours, adventure, and more.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-6 md:p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Search */}
          <div>
            <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">Search</label>
            <input
              type="text"
              placeholder="E.g., 'Museum' or 'Tour'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-black dark:border-white py-2 sans text-sm outline-none focus:border-accent dark:focus:border-accent transition"
            />
          </div>

          {/* City */}
          <div className="relative">
            <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">City</label>
            <div className="relative">
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full bg-transparent border-b border-black dark:border-white py-2 sans text-sm outline-none focus:border-accent transition appearance-none cursor-pointer pr-8"
              >
                <option value="" className="bg-white text-black dark:bg-black dark:text-white">All Cities</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id} className="bg-white text-black dark:bg-black dark:text-white">
                    {c.name}, {c.country}
                  </option>
                ))}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="relative">
            <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">Interest</label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent border-b border-black dark:border-white py-2 sans text-sm outline-none focus:border-accent transition appearance-none cursor-pointer pr-8"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-white text-black dark:bg-black dark:text-white">
                    {cat === 'All' ? 'All Interests' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Cost */}
          <div className="relative">
            <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">Cost</label>
            <div className="relative">
              <select
                value={selectedCost}
                onChange={(e) => setSelectedCost(e.target.value)}
                className="w-full bg-transparent border-b border-black dark:border-white py-2 sans text-sm outline-none focus:border-accent transition appearance-none cursor-pointer pr-8"
              >
                {COST_RANGES.map(r => (
                  <option key={r.value} value={r.value} className="bg-white text-black dark:bg-black dark:text-white">{r.label}</option>
                ))}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="relative">
            <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">Duration</label>
            <div className="relative">
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full bg-transparent border-b border-black dark:border-white py-2 sans text-sm outline-none focus:border-accent transition appearance-none cursor-pointer pr-8"
              >
                {DURATION_RANGES.map(r => (
                  <option key={r.value} value={r.value} className="bg-white text-black dark:bg-black dark:text-white">{r.label}</option>
                ))}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-8 flex items-center justify-between">
        <p className="sans text-[10px] uppercase tracking-widest text-gray-500">
          {loading ? 'Searching…' : `${activities.length} activit${activities.length === 1 ? 'y' : 'ies'} found`}
        </p>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="border border-black/10 dark:border-white/10 animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-gray-800"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => {
            const cityName = getCityName(activity.city_id);
            return (
              <div key={activity.id} className="border border-black/10 dark:border-white/10 group flex flex-col relative bg-white dark:bg-black">

                {/* Image */}
                <div className="relative h-64 overflow-hidden w-full">
                  <img
                    src={imageFallbackMap[activity.id] ? fallbackImage : (activity.image_url || fallbackImage)}
                    alt={activity.name}
                    onError={() => setImageFallbackMap(p => ({ ...p, [activity.id]: true }))}
                    className="absolute inset-0 w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300"></div>

                  {/* Tags */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
                    {cityName && (
                      <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1.5 sans text-[9px] uppercase tracking-[0.2em] border border-white/20 rounded-sm shadow-xl">
                        {cityName}
                      </span>
                    )}
                    <span className="bg-black/50 backdrop-blur-md text-accent px-3 py-1.5 sans text-[9px] uppercase tracking-[0.2em] border border-white/20 rounded-sm shadow-xl ml-auto">
                      {categoryLabel(activity.category)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="serif text-2xl mb-2 pr-8">{activity.name}</h3>

                  <div className="flex gap-4 mb-4 mt-auto">
                    <span className="sans text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {formatDuration(activity.duration_minutes)}
                    </span>
                    <span className="sans text-[10px] uppercase tracking-widest text-accent flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {formatCost(activity.estimated_cost)}
                    </span>
                  </div>

                  {/* Expanding Description */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedId === activity.id ? 'max-h-40 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
                    <p className="sans text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-black/10 dark:border-white/10 pt-4 mt-2">
                      {activity.description || 'No description available.'}
                    </p>
                  </div>

                  {/* Add to Trip Popup */}
                  {addingToTrip === activity.id && (
                    <div className="border-t border-black/10 dark:border-white/10 pt-4 mt-2 space-y-3">
                      {addSuccess === activity.id ? (
                        <p className="sans text-xs text-green-600 font-semibold text-center py-2">Added to trip successfully</p>
                      ) : (
                        <>
                          <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block">Select Trip</label>
                          {trips.length > 0 ? (
                            <>
                              <select
                                onChange={(e) => setSelectedTripId(Number(e.target.value) || null)}
                                className="w-full bg-transparent border border-black/20 dark:border-white/20 py-2 px-3 sans text-sm outline-none"
                              >
                                <option value="">Choose a trip…</option>
                                {trips.map(t => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAddToTrip(activity)}
                                disabled={!selectedTripId}
                                className="w-full bg-black text-white dark:bg-white dark:text-black py-2 sans text-[10px] uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-white transition disabled:opacity-30"
                              >
                                Confirm
                              </button>
                            </>
                          ) : (
                            <p className="sans text-xs text-gray-500">No trips yet. Create one first.</p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 border-t border-black/10 dark:border-white/10 mt-auto">
                  <button
                    onClick={() => setExpandedId(expandedId === activity.id ? null : activity.id)}
                    className="p-4 sans text-[10px] uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition border-r border-black/10 dark:border-white/10"
                  >
                    {expandedId === activity.id ? 'Close View' : 'Quick View'}
                  </button>
                  <button
                    onClick={() => {
                      setAddingToTrip(addingToTrip === activity.id ? null : activity.id);
                      setSelectedTripId(null);
                    }}
                    className="p-4 sans text-[10px] uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:bg-accent dark:hover:bg-accent transition"
                  >
                    {addingToTrip === activity.id ? 'Cancel' : 'Add to Trip +'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="col-span-full py-20 text-center border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
          <h3 className="serif text-3xl mb-2">No activities found</h3>
          <p className="sans text-xs uppercase tracking-widest text-gray-500">Try adjusting your filters.</p>
        </div>
      )}
    </main>
  );
}
