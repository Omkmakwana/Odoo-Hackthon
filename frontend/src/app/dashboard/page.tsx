'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus, Map, PackageCheck, NotebookPen, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const recentTrips = [
  { id: '1', name: 'The Rome Chronicles', destination: 'Rome, Italy', dates: '12–19 Oct', status: 'ongoing', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
  { id: '2', name: 'Parisian Winter', destination: 'Paris, France', dates: 'Nov 22–28', status: 'upcoming', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800' },
  { id: '3', name: 'Nordic Serenity', destination: 'Reykjavík, Iceland', dates: 'Dec 5–10', status: 'upcoming', image: 'https://images.unsplash.com/photo-1513635269975-59693e0cd100?w=800' }
];

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
});

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const displayName = user ? user.full_name.split(' ')[0] : 'Traveler';

  return (
    <div className="min-h-[calc(100vh-65px)] max-w-7xl mx-auto px-6 py-12 md:py-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-black/10 dark:border-white/10 pb-12">
        <div>
          <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">{today}</p>
          <h1 className="serif text-5xl md:text-7xl leading-[0.95]">
            Welcome back,<br />
            {loading ? (
              <span className="inline-block w-64 h-12 bg-gray-200 dark:bg-gray-800 animate-pulse mt-2"></span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">{displayName}.</span>
            )}
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
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Total Budget</p>
          <p className="serif text-4xl md:text-5xl">$4,400</p>
        </div>
        <div className="bg-white dark:bg-black p-8">
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Spent YTD</p>
          <p className="serif text-4xl md:text-5xl">$3,240</p>
        </div>
        <div className="bg-white dark:bg-black p-8 group hover:bg-black/5 dark:hover:bg-white/5 transition relative cursor-pointer">
          <Link href="/trips" className="absolute inset-0 z-10"></Link>
          <div className="flex justify-between items-start mb-4">
            <p className="sans text-[10px] uppercase tracking-widest text-gray-500">Trips This Year</p>
            <span className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition transform group-hover:translate-x-1">&rarr;</span>
          </div>
          <p className="serif text-4xl md:text-5xl">4</p>
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
          
          <div className="space-y-6">
            {recentTrips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`} className="block group">
                <div className="flex items-center gap-6 p-4 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition">
                  <div className="w-24 h-24 sm:w-32 sm:h-24 flex-shrink-0 overflow-hidden relative">
                    <img 
                      src={trip.image} 
                      alt={trip.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
                    />
                    {trip.status === 'ongoing' && (
                      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-accent animate-pulse shadow-lg"></div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="sans text-[10px] uppercase tracking-widest text-accent mb-1">{trip.dates}</p>
                    <h3 className="serif text-xl sm:text-2xl mb-1">{trip.name}</h3>
                    <p className="sans text-xs text-gray-500">{trip.destination}</p>
                  </div>
                  <div className="pr-4 hidden sm:block opacity-0 group-hover:opacity-100 transition transform -translate-x-2 group-hover:translate-x-0">
                    &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
