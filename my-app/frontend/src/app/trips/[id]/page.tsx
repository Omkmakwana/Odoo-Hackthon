"use client";

import Link from 'next/link';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return 'DATES TBD';
  if (start && !end) return new Date(start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  if (!start && end) return `Until ${new Date(end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  
  const startDate = new Date(start!);
  const endDate = new Date(end!);
  return `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
}

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    async function loadTrip() {
      try {
        const data = await fetchApi(`/trips/${params.id}`);
        setTrip(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load trip');
      } finally {
        setLoading(false);
      }
    }
    loadTrip();
  }, [params.id]);

  const handleTogglePublic = async () => {
    if (!trip) return;
    setToggling(true);
    try {
      const updated = await fetchApi(`/trips/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_public: !trip.is_public }),
      });
      setTrip(updated);
    } catch (err: any) {
      console.error('Failed to toggle visibility:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleCopyLink = async () => {
    if (!trip?.public_slug) return;
    const url = `${window.location.origin}/shared/${trip.public_slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch { /* fallback */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || 'Trip not found'}</p>
      </div>
    );
  }

  const totalCost = trip.stops?.reduce((acc: number, stop: any) => 
    acc + (stop.activities?.reduce((sum: number, act: any) => sum + act.estimated_cost, 0) || 0), 0
  ) || 0;

  return (
    <div className="min-h-[calc(100vh-65px)] pb-20">
      
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[65vh] flex flex-col justify-end p-6 md:p-16 mb-16 overflow-hidden">
        {trip.cover_url && (
          <img 
            src={trip.cover_url} 
            alt={trip.name} 
            className="absolute inset-0 w-full h-full object-cover grayscale-[30%]"
          />
        )}
        {!trip.cover_url && (
           <div className="absolute inset-0 w-full h-full bg-black/10 dark:bg-white/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <Link href="/trips" className="sans text-[10px] uppercase tracking-widest text-white/70 hover:text-white transition flex items-center gap-2 mb-6 w-max">
              <span>&larr;</span> Back to Itineraries
            </Link>
            <p className="sans text-[10px] uppercase tracking-[0.3em] text-white/80 mb-3">
              {formatDateRange(trip.start_date, trip.end_date)}
            </p>
            <h1 className="serif text-5xl md:text-7xl text-white leading-none">
              {trip.name}
            </h1>
          </div>
          <div className="flex gap-4">
            <Link 
              href={`/trips/${params.id}/edit`}
              className="bg-white/10 backdrop-blur-md text-white px-8 py-3 sans text-xs uppercase tracking-widest hover:bg-white hover:text-black border border-white/20 transition"
            >
              Edit Journey
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Itinerary Details */}
        <div className="lg:col-span-8">
          <div className="mb-12">
            <h2 className="serif text-3xl mb-4">The Vision.</h2>
            <div className="w-8 h-px bg-accent mb-6"></div>
            <p className="sans text-sm leading-relaxed text-black/80 dark:text-white/80">
              {trip.description || "No description provided for this journey."}
            </p>
          </div>

          <div className="space-y-16">
            {trip.stops?.length === 0 ? (
              <p className="sans text-sm text-gray-500 italic">No stops have been added to this trip yet.</p>
            ) : (
              trip.stops?.map((stop: any) => (
                <div key={stop.id}>
                  <div className="flex items-end gap-4 mb-8">
                    <h3 className="serif text-4xl">{stop.city_name}</h3>
                    <span className="sans text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-1.5">{stop.country}</span>
                  </div>
                  
                  <div className="space-y-8 pl-4 md:pl-8 border-l border-black/10 dark:border-white/10">
                    {stop.activities?.length === 0 ? (
                      <p className="sans text-xs text-gray-400">No activities planned here.</p>
                    ) : (
                      stop.activities?.map((activity: any) => (
                        <div key={activity.id} className="relative">
                          <div className="absolute -left-[21px] md:-left-[37px] top-1.5 w-2 h-2 rounded-full bg-accent"></div>
                          
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                            <div>
                              <p className="sans text-[10px] uppercase tracking-widest text-accent mb-1">
                                Day {activity.day_number} &mdash; {activity.time_slot}
                              </p>
                              <h4 className="serif text-2xl mb-1">{activity.name}</h4>
                              <span className="sans text-[10px] uppercase tracking-wider text-gray-500 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-sm">
                                {activity.cost_category}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="sans text-sm tracking-wider">
                                ₹{((activity.estimated_cost || 0) * 83).toLocaleString('en-IN')}
                              </p>
                              <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-1">
                                {activity.duration_minutes} MIN
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Share, Budget & Meta */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* ── Share Panel ── */}
          <div className="bg-black/5 dark:bg-white/5 p-8 border border-black/10 dark:border-white/10">
            <h3 className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-6">Share This Trip</h3>
            
            {/* Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="sans text-sm font-medium">{trip.is_public ? 'Public' : 'Private'}</p>
                <p className="sans text-[10px] text-gray-500 mt-0.5">
                  {trip.is_public ? 'Anyone with the link can view' : 'Only you can see this trip'}
                </p>
              </div>
              <button
                onClick={handleTogglePublic}
                disabled={toggling}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  trip.is_public ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'
                } ${toggling ? 'opacity-50' : ''}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  trip.is_public ? 'translate-x-[26px]' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>

            {/* Shareable Link (only when public) */}
            {trip.is_public && trip.public_slug && (
              <div className="border-t border-black/10 dark:border-white/10 pt-6 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${trip.public_slug}`}
                    className="flex-grow bg-transparent border border-black/20 dark:border-white/20 px-3 py-2 sans text-xs text-gray-600 dark:text-gray-400 outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 sans text-[10px] uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-white transition whitespace-nowrap"
                  >
                    {linkCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <Link
                  href={`/shared/${trip.public_slug}`}
                  target="_blank"
                  className="block text-center border border-black/20 dark:border-white/20 px-4 py-2.5 sans text-[10px] uppercase tracking-widest hover:border-black dark:hover:border-white transition"
                >
                  Preview Public Page →
                </Link>
              </div>
            )}
          </div>

          {/* ── Financial Overview ── */}
          <div className="bg-black/5 dark:bg-white/5 p-8 border border-black/10 dark:border-white/10">
            <h3 className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-6">Financial Overview</h3>
            <div className="space-y-6">
              <div>
                <p className="serif text-4xl">₹{(totalCost * 83).toLocaleString('en-IN')}</p>
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-1">Total Estimated Cost</p>
              </div>
              <div className="h-px w-full bg-black/10 dark:bg-white/10"></div>
              <div>
                <p className="serif text-2xl">₹{(trip.budget_limit * 83).toLocaleString('en-IN')}</p>
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-1">Budget Limit</p>
              </div>
              
              {/* Progress Bar */}
              <div className="pt-4">
                <div className="w-full h-1 bg-black/10 dark:bg-white/10 mb-2">
                  <div 
                    className="h-full bg-accent" 
                    style={{ width: `${Math.min((totalCost / (trip.budget_limit || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500 text-right">
                  {trip.budget_limit > 0 ? `${((totalCost / trip.budget_limit) * 100).toFixed(0)}% Allocated` : 'No budget set'}
                </p>
              </div>

              {/* Link to full budget page */}
              <Link
                href={`/trips/${params.id}/budget`}
                className="block text-center border border-black/20 dark:border-white/20 px-4 py-2.5 sans text-[10px] uppercase tracking-widest hover:border-black dark:hover:border-white hover:text-accent transition mt-4"
              >
                View Full Breakdown →
              </Link>
            </div>
          </div>

          {/* ── Trip Status ── */}
          <div className="bg-black/5 dark:bg-white/5 p-8 border border-black/10 dark:border-white/10">
             <h3 className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-6">Trip Status</h3>
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent"></div>
               <p className="sans text-sm uppercase tracking-widest">{trip.status}</p>
             </div>
             <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-4">
               {trip.is_public ? 'Publicly Visible' : 'Private Itinerary'}
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
