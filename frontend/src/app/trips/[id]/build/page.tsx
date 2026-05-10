"use client";

import { useState } from 'react';
import Link from 'next/link';

// --- Types based on backend schema ---
type Activity = {
  id: string; // Use string for frontend mock IDs to avoid collision easily
  name: string;
  day_number: number;
  time_slot: string;
  duration_minutes: number;
  estimated_cost: number;
  cost_category: string;
};

type Stop = {
  id: string;
  city_name: string;
  country: string;
  arrival_date: string;
  departure_date: string;
  activities: Activity[];
};

export default function BuildItineraryPage({ params }: { params: { id: string } }) {
  // --- State ---
  const [stops, setStops] = useState<Stop[]>([
    {
      id: 's1',
      city_name: 'Rome',
      country: 'Italy',
      arrival_date: '2026-10-12',
      departure_date: '2026-10-16',
      activities: [
        { id: 'a1', name: 'Colosseum Tour', day_number: 1, time_slot: '10:00', duration_minutes: 120, estimated_cost: 35.0, cost_category: 'activity' },
      ]
    }
  ]);

  const [isAddingStop, setIsAddingStop] = useState(false);
  const [newStop, setNewStop] = useState({ city_name: '', country: '', arrival_date: '', departure_date: '' });

  const [activeStopIdForActivity, setActiveStopIdForActivity] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState({ name: '', day_number: 1, time_slot: '09:00', duration_minutes: 60, estimated_cost: 0, cost_category: 'activity' });

  // --- Handlers ---
  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    const stop: Stop = {
      id: `s${Date.now()}`,
      ...newStop,
      activities: []
    };
    setStops([...stops, stop]);
    setNewStop({ city_name: '', country: '', arrival_date: '', departure_date: '' });
    setIsAddingStop(false);
  };

  const handleAddActivity = (e: React.FormEvent, stopId: string) => {
    e.preventDefault();
    const activity: Activity = {
      id: `a${Date.now()}`,
      ...newActivity
    };
    setStops(stops.map(stop => 
      stop.id === stopId 
        ? { ...stop, activities: [...stop.activities, activity].sort((a, b) => a.day_number - b.day_number || a.time_slot.localeCompare(b.time_slot)) } 
        : stop
    ));
    setNewActivity({ name: '', day_number: 1, time_slot: '09:00', duration_minutes: 60, estimated_cost: 0, cost_category: 'activity' });
    setActiveStopIdForActivity(null);
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newStops = [...stops];
    if (direction === 'up' && index > 0) {
      [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
    } else if (direction === 'down' && index < newStops.length - 1) {
      [newStops[index + 1], newStops[index]] = [newStops[index], newStops[index + 1]];
    }
    setStops(newStops);
  };

  const deleteStop = (stopId: string) => {
    setStops(stops.filter(s => s.id !== stopId));
  };

  const deleteActivity = (stopId: string, activityId: string) => {
    setStops(stops.map(stop => 
      stop.id === stopId 
        ? { ...stop, activities: stop.activities.filter(a => a.id !== activityId) } 
        : stop
    ));
  };

  return (
    <div className="min-h-[calc(100vh-65px)] px-6 py-12 md:py-20 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div>
          <Link href={`/trips/${params.id}`} className="sans text-[10px] uppercase tracking-widest text-gray-500 hover:text-accent transition flex items-center gap-2 mb-8 w-max">
            <span>&larr;</span> Back to Overview
          </Link>
          <div className="w-8 h-px bg-accent mb-6"></div>
          <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4">Architecture</p>
          <h1 className="serif text-5xl md:text-6xl leading-[0.95]">
            Design the<br />
            <i className="text-gray-400">Experience.</i>
          </h1>
        </div>
        
        <button 
          onClick={() => setIsAddingStop(true)}
          className="bg-black text-white px-8 py-4 sans text-xs uppercase tracking-widest hover:bg-accent transition inline-block border border-black hover:border-accent"
        >
          Add New Stop
        </button>
      </div>

      {/* Add Stop Form */}
      {isAddingStop && (
        <div className="mb-16 bg-black/5 dark:bg-white/5 p-8 border border-black/10 dark:border-white/10 relative">
          <button onClick={() => setIsAddingStop(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h3 className="serif text-2xl mb-8">New Destination</h3>
          <form onSubmit={handleAddStop} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-4">City Name</label>
              <input required type="text" value={newStop.city_name} onChange={e => setNewStop({...newStop, city_name: e.target.value})} className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none focus:border-accent transition" placeholder="e.g. Florence" />
            </div>
            <div>
              <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-4">Country</label>
              <input type="text" value={newStop.country} onChange={e => setNewStop({...newStop, country: e.target.value})} className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none focus:border-accent transition" placeholder="e.g. Italy" />
            </div>
            <div>
              <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-4">Arrival Date</label>
              <input type="date" value={newStop.arrival_date} onChange={e => setNewStop({...newStop, arrival_date: e.target.value})} className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none focus:border-accent transition" style={{ colorScheme: 'light dark' }} />
            </div>
            <div>
              <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-4">Departure Date</label>
              <input type="date" value={newStop.departure_date} onChange={e => setNewStop({...newStop, departure_date: e.target.value})} className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none focus:border-accent transition" style={{ colorScheme: 'light dark' }} />
            </div>
            <div className="md:col-span-2 pt-4 flex justify-end">
              <button type="submit" className="bg-black text-white px-8 py-3 sans text-[10px] uppercase tracking-widest hover:bg-accent transition">Confirm Stop</button>
            </div>
          </form>
        </div>
      )}

      {/* Itinerary Timeline */}
      <div className="space-y-16">
        {stops.map((stop, index) => (
          <div key={stop.id} className="relative group/stop">
            
            {/* Stop Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1 mr-2 opacity-0 group-hover/stop:opacity-100 transition-opacity">
                  <button onClick={() => moveStop(index, 'up')} disabled={index === 0} className="text-gray-400 hover:text-accent disabled:opacity-30"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                  <button onClick={() => moveStop(index, 'down')} disabled={index === stops.length - 1} className="text-gray-400 hover:text-accent disabled:opacity-30"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                </div>
                <div>
                  <h2 className="serif text-4xl mb-1 flex items-center gap-4">
                    {stop.city_name}
                  </h2>
                  <p className="sans text-[10px] uppercase tracking-[0.2em] text-gray-500">
                    {stop.country} &nbsp;|&nbsp; {stop.arrival_date} &mdash; {stop.departure_date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveStopIdForActivity(stop.id)}
                  className="sans text-[10px] uppercase tracking-widest text-accent hover:text-black dark:hover:text-white transition"
                >
                  + Add Activity
                </button>
                <button 
                  onClick={() => deleteStop(stop.id)}
                  className="sans text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700 transition opacity-0 group-hover/stop:opacity-100"
                >
                  Remove Stop
                </button>
              </div>
            </div>

            {/* Activities List */}
            <div className="pl-4 md:pl-16 border-l border-black/10 dark:border-white/10 space-y-6">
              {stop.activities.length === 0 && (
                <p className="sans text-xs text-gray-400 italic">No activities planned yet.</p>
              )}
              {stop.activities.map((activity) => (
                <div key={activity.id} className="relative group/activity bg-black/5 dark:bg-white/5 p-4 border border-black/10 dark:border-white/10 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:border-accent transition">
                  <div className="absolute -left-[21px] md:-left-[69px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent"></div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="sans text-[9px] uppercase tracking-widest bg-black text-white px-2 py-0.5">Day {activity.day_number}</span>
                      <span className="sans text-[10px] tracking-widest text-gray-500">{activity.time_slot}</span>
                    </div>
                    <h4 className="serif text-xl">{activity.name}</h4>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="sans text-sm tracking-wider">${activity.estimated_cost.toFixed(2)}</p>
                      <p className="sans text-[9px] uppercase tracking-widest text-gray-500 mt-1">{activity.duration_minutes} MIN | {activity.cost_category}</p>
                    </div>
                    <button onClick={() => deleteActivity(stop.id, activity.id)} className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover/activity:opacity-100">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Activity Form */}
              {activeStopIdForActivity === stop.id && (
                <div className="bg-white dark:bg-black p-6 border border-black/10 dark:border-white/10 mt-6 relative shadow-lg">
                  <button onClick={() => setActiveStopIdForActivity(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <h4 className="serif text-xl mb-6">New Activity</h4>
                  <form onSubmit={(e) => handleAddActivity(e, stop.id)} className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="col-span-2">
                      <label className="sans text-[9px] uppercase tracking-widest text-gray-500 block mb-2">Activity Name</label>
                      <input required type="text" value={newActivity.name} onChange={e => setNewActivity({...newActivity, name: e.target.value})} className="w-full border-b border-black bg-transparent py-2 sans text-xs outline-none focus:border-accent transition" placeholder="e.g. Colosseum Tour" />
                    </div>
                    <div>
                      <label className="sans text-[9px] uppercase tracking-widest text-gray-500 block mb-2">Day #</label>
                      <input required type="number" min="1" value={newActivity.day_number} onChange={e => setNewActivity({...newActivity, day_number: parseInt(e.target.value)})} className="w-full border-b border-black bg-transparent py-2 sans text-xs outline-none focus:border-accent transition" />
                    </div>
                    <div>
                      <label className="sans text-[9px] uppercase tracking-widest text-gray-500 block mb-2">Time Slot</label>
                      <input required type="time" value={newActivity.time_slot} onChange={e => setNewActivity({...newActivity, time_slot: e.target.value})} className="w-full border-b border-black bg-transparent py-2 sans text-xs outline-none focus:border-accent transition" style={{ colorScheme: 'light dark' }} />
                    </div>
                    <div>
                      <label className="sans text-[9px] uppercase tracking-widest text-gray-500 block mb-2">Duration (Min)</label>
                      <input required type="number" min="1" value={newActivity.duration_minutes} onChange={e => setNewActivity({...newActivity, duration_minutes: parseInt(e.target.value)})} className="w-full border-b border-black bg-transparent py-2 sans text-xs outline-none focus:border-accent transition" />
                    </div>
                    <div>
                      <label className="sans text-[9px] uppercase tracking-widest text-gray-500 block mb-2">Est. Cost ($)</label>
                      <input required type="number" min="0" step="0.01" value={newActivity.estimated_cost} onChange={e => setNewActivity({...newActivity, estimated_cost: parseFloat(e.target.value)})} className="w-full border-b border-black bg-transparent py-2 sans text-xs outline-none focus:border-accent transition" />
                    </div>
                    <div className="col-span-2">
                      <label className="sans text-[9px] uppercase tracking-widest text-gray-500 block mb-2">Category</label>
                      <select value={newActivity.cost_category} onChange={e => setNewActivity({...newActivity, cost_category: e.target.value})} className="w-full border-b border-black bg-transparent py-2 sans text-xs outline-none focus:border-accent transition">
                        <option value="activity">Activity</option>
                        <option value="food">Food</option>
                        <option value="transport">Transport</option>
                        <option value="accommodation">Accommodation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-4 pt-2 flex justify-end">
                      <button type="submit" className="bg-black text-white px-6 py-2 sans text-[9px] uppercase tracking-widest hover:bg-accent transition">Save Activity</button>
                    </div>
                  </form>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {stops.length === 0 && !isAddingStop && (
        <div className="py-24 text-center border-t border-black/10 mt-16">
          <p className="serif text-2xl text-gray-400 mb-6">Your canvas is blank.</p>
          <button onClick={() => setIsAddingStop(true)} className="sans text-xs uppercase tracking-widest text-black hover:text-accent border-b border-black hover:border-accent pb-1 transition">
            Add Your First Stop
          </button>
        </div>
      )}

      {/* Save Button */}
      {stops.length > 0 && (
        <div className="mt-20 pt-8 border-t border-black/10 flex justify-end">
          <Link href={`/trips/${params.id}`} className="bg-black text-white px-12 py-4 sans text-xs uppercase tracking-widest hover:bg-accent border border-black hover:border-accent transition">
            Save Itinerary
          </Link>
        </div>
      )}

    </div>
  );
}
