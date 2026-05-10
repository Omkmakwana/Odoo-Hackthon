"use client";

import Link from 'next/link';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

type TripListOut = {
  id: number;
  name: string;
  cover_url: string | null;
  start_date: string;
  end_date: string;
  status: string;
  is_public: boolean;
  stop_count: number;
  total_cost: number;
  created_at: string;
};

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return 'DATES TBD';
  if (start && !end) {
    const startDate = new Date(start);
    return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  }
  if (!start && end) {
    const endDate = new Date(end);
    return `UNTIL ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`;
  }
  
  const startDate = new Date(start!);
  const endDate = new Date(end!);
  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startStr} — ${endStr}`.toUpperCase();
}

export default function TripsPage() {
  const [trips, setTrips] = useState<TripListOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      try {
        const data = await fetchApi('/trips');
        setTrips(data);
      } catch (err) {
        console.error('Failed to load trips:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this journey? This action cannot be undone.')) return;
    
    try {
      await fetchApi(`/trips/${id}`, { method: 'DELETE' });
      setTrips(trips.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <p className="sans text-xs uppercase tracking-widest text-gray-500">Loading your journeys...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] px-6 py-12 md:py-20 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div>
          <div className="w-8 h-px bg-accent mb-6"></div>
          <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4">Your Library</p>
          <h1 className="serif text-5xl md:text-6xl leading-[0.95]">
            My<br />
            <i className="text-gray-400">Itineraries.</i>
          </h1>
        </div>
        
        <Link 
          href="/trips/new" 
          className="bg-black text-white px-8 py-4 sans text-xs uppercase tracking-widest hover:bg-accent transition inline-block border border-black hover:border-accent"
        >
          Begin New Journey
        </Link>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {trips.map((trip) => (
          <div key={trip.id} className="group relative flex flex-col">
            
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-black/5 dark:bg-white/5">
              <img 
                src={trip.cover_url || 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=2670&auto=format&fit=crop'} 
                alt={trip.name} 
                className="w-full h-full object-cover filter grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 border border-white/20">
                <span className="sans text-[9px] uppercase tracking-widest text-white">
                  {trip.status}
                </span>
              </div>

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <Link 
                  href={`/trips/${trip.id}`} 
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:text-accent hover:scale-110 transition-transform"
                  title="View"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
                <Link 
                  href={`/trips/${trip.id}/edit`} 
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:text-accent hover:scale-110 transition-transform"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Link>
                <button 
                  onClick={(e) => handleDelete(e, trip.id)}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 hover:text-white hover:bg-red-600 hover:scale-110 transition-all"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Info */}
            <div className="flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-3">
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500">
                  {formatDateRange(trip.start_date, trip.end_date)}
                </p>
                <p className="sans text-[10px] uppercase tracking-widest text-gray-400">
                  {trip.stop_count} {trip.stop_count === 1 ? 'Stop' : 'Stops'}
                </p>
              </div>
              <h2 className="serif text-3xl mb-4 group-hover:text-accent transition">
                <Link href={`/trips/${trip.id}`}>
                  {trip.name}
                </Link>
              </h2>
            </div>
            
            <div className="h-px w-full bg-black/10 dark:bg-white/10 mt-auto"></div>
          </div>
        ))}
      </div>

      {trips.length === 0 && (
        <div className="py-24 text-center border-t border-black/10">
          <p className="serif text-2xl text-gray-400 mb-6">No itineraries crafted yet.</p>
          <Link href="/trips/new" className="sans text-xs uppercase tracking-widest text-black hover:text-accent border-b border-black hover:border-accent pb-1 transition">
            Start Your First Journey
          </Link>
        </div>
      )}

    </div>
  );
}
