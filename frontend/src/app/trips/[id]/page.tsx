"use client";

import { useState } from 'react';
import Link from 'next/link';

// Mock data based on the backend TripOut schema
const MOCK_TRIP = {
  id: 1,
  name: 'The Rome Chronicles',
  description: 'A week exploring the ancient ruins, eating amazing pasta, and visiting the Vatican.',
  cover_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=2670&auto=format&fit=crop',
  start_date: '2026-10-12',
  end_date: '2026-10-19',
  status: 'draft',
  is_public: false,
  budget_limit: 2500.0,
  stops: [
    {
      id: 101,
      city_name: 'Rome',
      country: 'Italy',
      arrival_date: '2026-10-12',
      departure_date: '2026-10-19',
      order: 1,
      activities: [
        { id: 1001, name: 'Colosseum Tour', day_number: 1, time_slot: '10:00 AM', duration_minutes: 120, estimated_cost: 35.0, cost_category: 'activity' },
        { id: 1002, name: 'Vatican Museums', day_number: 2, time_slot: '09:00 AM', duration_minutes: 180, estimated_cost: 45.0, cost_category: 'activity' },
        { id: 1003, name: 'Pasta Making Class', day_number: 3, time_slot: '05:00 PM', duration_minutes: 150, estimated_cost: 80.0, cost_category: 'food' },
      ]
    }
  ]
};

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
}

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Use mock data for now
  const trip = MOCK_TRIP;
  const totalCost = trip.stops.reduce((acc, stop) => 
    acc + stop.activities.reduce((sum, act) => sum + act.estimated_cost, 0), 0
  );

  return (
    <div className="min-h-[calc(100vh-65px)] pb-20">
      
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[65vh] flex flex-col justify-end p-6 md:p-16 mb-16 overflow-hidden">
        <img 
          src={trip.cover_url} 
          alt={trip.name} 
          className="absolute inset-0 w-full h-full object-cover grayscale-[30%]"
        />
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
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href={`/trips/${params.id}/build`}
              className="bg-white text-black px-8 py-3 sans text-xs uppercase tracking-widest hover:bg-black hover:text-white border border-white transition text-center"
            >
              Design Experience
            </Link>
            <Link 
              href={`/trips/${params.id}/edit`}
              className="bg-white/10 backdrop-blur-md text-white px-8 py-3 sans text-xs uppercase tracking-widest hover:bg-white hover:text-black border border-white/20 transition text-center"
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
              {trip.description}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex justify-end mb-8">
            <div className="inline-flex bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-6 py-2 sans text-[10px] uppercase tracking-widest transition ${viewMode === 'list' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
              >
                List View
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`px-6 py-2 sans text-[10px] uppercase tracking-widest transition ${viewMode === 'calendar' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
              >
                Calendar View
              </button>
            </div>
          </div>

          {/* List View (Grouped by City) */}
          {viewMode === 'list' && (
            <div className="space-y-16">
              {trip.stops.map((stop) => (
                <div key={stop.id}>
                  <div className="flex items-end gap-4 mb-8">
                    <h3 className="serif text-4xl">{stop.city_name}</h3>
                    <span className="sans text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-1.5">{stop.country}</span>
                  </div>
                  
                  <div className="space-y-8 pl-4 md:pl-8 border-l border-black/10 dark:border-white/10">
                    {stop.activities.map((activity) => (
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
                              ${activity.estimated_cost.toFixed(2)}
                            </p>
                            <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-1">
                              {activity.duration_minutes} MIN
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Calendar View (Grouped by Day) */}
          {viewMode === 'calendar' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: Math.max(...trip.stops.flatMap(s => s.activities.map(a => a.day_number)), 1) }, (_, i) => i + 1).map(day => {
                const dayActivities = trip.stops.flatMap(s => s.activities.map(a => ({...a, stopName: s.city_name}))).filter(a => a.day_number === day).sort((a, b) => a.time_slot.localeCompare(b.time_slot));
                
                return (
                  <div key={day} className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-6">
                    <h3 className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-6 pb-4 border-b border-black/10 dark:border-white/10">Day {day}</h3>
                    
                    {dayActivities.length === 0 ? (
                      <p className="sans text-xs text-gray-400 italic">No activities planned.</p>
                    ) : (
                      <div className="space-y-6">
                        {dayActivities.map(act => (
                          <div key={act.id} className="relative pl-4 border-l-2 border-accent">
                            <p className="sans text-[9px] uppercase tracking-widest text-gray-500 mb-1">{act.time_slot} &bull; {act.stopName}</p>
                            <h4 className="serif text-lg leading-tight mb-1">{act.name}</h4>
                            <p className="sans text-[10px] tracking-widest">${act.estimated_cost.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Column: Budget & Meta */}
        <div className="lg:col-span-4 space-y-10">
          
          <div className="bg-black/5 dark:bg-white/5 p-8 border border-black/10 dark:border-white/10">
            <h3 className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-6">Financial Overview</h3>
            <div className="space-y-6">
              <div>
                <p className="serif text-4xl">${totalCost.toFixed(2)}</p>
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-1">Total Estimated Cost</p>
              </div>
              <div className="h-px w-full bg-black/10 dark:bg-white/10"></div>
              <div>
                <p className="serif text-2xl">${trip.budget_limit.toFixed(2)}</p>
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-1">Budget Limit</p>
              </div>
              
              {/* Progress Bar */}
              <div className="pt-4">
                <div className="w-full h-1 bg-black/10 dark:bg-white/10 mb-2">
                  <div 
                    className="h-full bg-accent" 
                    style={{ width: `${Math.min((totalCost / trip.budget_limit) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500 text-right">
                  {((totalCost / trip.budget_limit) * 100).toFixed(0)}% Allocated
                </p>
              </div>
            </div>
          </div>

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
