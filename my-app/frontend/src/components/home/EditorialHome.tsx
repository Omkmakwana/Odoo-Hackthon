"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

const destinations = [
  { name: 'Kyoto', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2670&auto=format&fit=crop' },
  { name: 'Paris', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop' },
  { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=2670&auto=format&fit=crop' },
  { name: 'Rome', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=2670&auto=format&fit=crop' },
  { name: 'Cairo', image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=2670&auto=format&fit=crop' }
];

export default function EditorialHome() {
  const [destIndex, setDestIndex] = useState(0);
  const [typedName, setTypedName] = useState(destinations[0].name);
  const [imgOpacity, setImgOpacity] = useState(1);

  useEffect(() => {
    const currentDest = destinations[destIndex];
    let txtIndex = currentDest.name.length;
    let isDeleting = true;
    let timeoutId: number;

    setTypedName(currentDest.name);

    const typeWriter = () => {
      if (isDeleting) {
        setTypedName(currentDest.name.substring(0, txtIndex - 1));
        txtIndex -= 1;
      } else {
        setTypedName(currentDest.name.substring(0, txtIndex + 1));
        txtIndex += 1;
      }

      let typeSpeed = isDeleting ? 100 : 150;

      if (!isDeleting && txtIndex === currentDest.name.length) {
        typeSpeed = 2500;
        isDeleting = true;
      } else if (isDeleting && txtIndex === 0) {
        isDeleting = false;
        // Fade out image
        setImgOpacity(0);
        setTimeout(() => {
          setDestIndex((current) => (current + 1) % destinations.length);
          // Fade back in after index update
          setTimeout(() => setImgOpacity(1), 100);
        }, 1000);
        typeSpeed = 1200;
      }

      timeoutId = window.setTimeout(typeWriter, typeSpeed);
    };

    timeoutId = window.setTimeout(typeWriter, 2500);
    return () => window.clearTimeout(timeoutId);
  }, [destIndex]);

  return (
    <main className="flex-grow w-full px-4 md:px-12 py-12">

      {/* Header for the section */}
      <div className="flex justify-between items-end border-b border-black pb-6 mb-12">
        <h2 className="serif text-4xl md:text-5xl">Active Journey</h2>
        <p className="sans text-xs uppercase tracking-widest text-gray-400">Vol. 01</p>
      </div>

      {/* Featured View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">

        {/* Left Text Content */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <p className="sans text-xs uppercase tracking-widest text-gray-500 mb-6">Current Draft</p>
          <h1 className="serif text-7xl md:text-8xl leading-none mb-6">
            The <span id="typer-city" className="text-black">{typedName}</span>
            <span className="animate-pulse text-accent">|</span>
            <br />
            <i className="text-gray-400">Chronicles.</i>
          </h1>
          <p className="sans text-sm leading-relaxed text-gray-600 mb-8 max-w-sm">
            A seven day exploration through the ancient capital. From the bamboo groves of Arashiyama to the quiet contemplation of temple gardens.
          </p>

          <div className="grid grid-cols-2 gap-8 border-t border-black pt-6 sans text-xs uppercase tracking-widest">
            <div><span className="block text-gray-400 mb-1">Dates</span>12—19 Oct</div>
            <div><span className="block text-gray-400 mb-1">Pace</span>Leisurely</div>
            <div><span className="block text-gray-400 mb-1">Budget</span>₹1,99,200 <span className="lowercase normal-case">est.</span></div>
            <div>
              <Link href="/trips/new" className="bg-black text-white hover:bg-accent border border-black hover:border-accent px-4 py-3 transition w-full block text-center">
                Edit Trip
              </Link>
            </div>
          </div>
        </div>

        {/* Right Large Image */}
        <div className="lg:col-span-7 relative group">
          <img
            src={destinations[destIndex].image}
            alt={destinations[destIndex].name}
            className="w-full aspect-[3/4] md:aspect-auto md:h-[600px] object-cover filter grayscale hover:grayscale-0 transition duration-1000"
            style={{ opacity: imgOpacity, transition: 'opacity 1s' }}
          />
          <div className="absolute -left-8 md:-left-16 bottom-12 bg-white p-6 shadow-2xl sans hidden md:block max-w-xs transition-transform transform group-hover:translate-x-4">
            <p className="uppercase text-xs tracking-widest border-b border-gray-200 pb-2 mb-4">Daily Agenda</p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex justify-between"><span>01. Arrival &amp; Check-in</span> <span className="text-gray-400">—</span></li>
              <li className="flex justify-between"><span>02. The Golden Pavilion</span> <span className="text-gray-400">Act</span></li>
              <li className="flex justify-between text-gray-400"><span>03. Free Afternoon</span> <span>—</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Secondary Section: Recent Drafts */}
      <div className="pt-12 pb-24">
        <div className="flex justify-between items-center mb-12">
          <h3 className="serif text-3xl">Upcoming &amp; Past</h3>
          <Link href="/trips" className="sans text-xs uppercase tracking-widest hover:italic hover:text-accent transition">View All</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group cursor-pointer">
            <div className="w-full h-64 bg-gray-200 mb-4 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop" alt="Parisian Winter" className="w-full h-full object-cover filter grayscale opacity-80 group-hover:scale-105 group-hover:opacity-100 transition duration-700" />
            </div>
            <p className="sans text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-accent transition mb-2">Nov 22 — Paris, FR</p>
            <h4 className="serif text-2xl group-hover:italic group-hover:text-accent transition">Parisian Winter</h4>
          </div>
          {/* Card 2 */}
          <div className="group cursor-pointer">
            <div className="w-full h-64 bg-gray-200 mb-4 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2070&auto=format&fit=crop" alt="Nordic Serenity" className="w-full h-full object-cover filter grayscale opacity-80 group-hover:scale-105 group-hover:opacity-100 transition duration-700" />
            </div>
            <p className="sans text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-accent transition mb-2">Dec 05 — Reykjavík, IS</p>
            <h4 className="serif text-2xl group-hover:italic group-hover:text-accent transition">Nordic Serenity</h4>
          </div>
          {/* Card 3 */}
          <div className="group cursor-pointer">
            <div className="w-full h-64 bg-gray-200 mb-4 overflow-hidden flex items-center justify-center border border-dashed border-gray-400 group-hover:border-accent group-hover:bg-accent/5 transition">
              <span className="serif text-4xl text-gray-400 group-hover:text-accent transition">+</span>
            </div>
            <p className="sans text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-accent transition mb-2">Blank Canvas</p>
            <h4 className="serif text-2xl group-hover:italic group-hover:text-accent transition">Start New Draft</h4>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="pt-12 pb-24 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1 flex flex-col justify-between">
          <h3 className="serif text-3xl">Your<br />Footprint.</h3>
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-4">Since 2024</p>
        </div>
        <div className="md:border-l border-gray-300 md:pl-6 flex flex-col justify-center">
          <span className="serif text-6xl md:text-7xl">12</span>
          <span className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-2">Countries</span>
        </div>
        <div className="border-l border-gray-300 pl-6 flex flex-col justify-center">
          <span className="serif text-6xl md:text-7xl">48</span>
          <span className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-2">Cities</span>
        </div>
        <div className="border-l border-gray-300 pl-6 flex flex-col justify-center">
          <span className="serif text-6xl md:text-7xl">14k</span>
          <span className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-2">Miles Traveled</span>
        </div>
      </div>

      {/* Inspiration Section */}
      <div className="pt-12 pb-24">
        <div className="flex justify-between items-center mb-12">
          <h3 className="serif text-3xl">Curated Experiences</h3>
          <Link href="/search" className="sans text-[10px] uppercase tracking-widest text-gray-500 hover:italic hover:text-accent transition">Explore All</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <div className="group relative overflow-hidden h-[400px] md:h-[600px] bg-gray-200 cursor-pointer">
            <img src="https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=2000&auto=format&fit=crop" alt="The Architecture Tour" className="w-full h-full object-cover filter grayscale opacity-90 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100 transition duration-1000" />
            <div className="absolute bottom-8 left-8 text-white z-10 drop-shadow-md">
              <p className="sans text-[10px] uppercase tracking-[0.2em] mb-2 drop-shadow-lg group-hover:text-accent/80 transition">Featured</p>
              <h4 className="serif text-5xl md:text-6xl leading-none drop-shadow-2xl group-hover:text-white transition duration-700">The<br />Architecture<br />Tour.</h4>
            </div>
          </div>

          <div className="flex flex-col gap-10 md:pl-8">
            <p className="sans text-sm leading-relaxed text-gray-600 border-l border-black pl-6">
              Immerse yourself in our hand-picked selections. Discover hidden gems, architectural wonders, and culinary masterpieces across the globe. Each collection is thoughtfully curated to provide an unforgettable narrative.
            </p>

            <div className="group cursor-pointer flex gap-6 items-center hover:opacity-75 transition">
              <img src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop" alt="New York Noir" className="w-24 h-24 object-cover filter grayscale group-hover:grayscale-0 transition duration-700" />
              <div>
                <h5 className="serif text-2xl group-hover:italic group-hover:text-accent transition">New York Noir</h5>
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-1">4 Days / Urban</p>
              </div>
            </div>

            <div className="group cursor-pointer flex gap-6 items-center hover:opacity-75 transition">
              <img src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800&auto=format&fit=crop" alt="Venetian Canals" className="w-24 h-24 object-cover filter grayscale group-hover:grayscale-0 transition duration-700" />
              <div>
                <h5 className="serif text-2xl group-hover:italic group-hover:text-accent transition">Venetian Canals</h5>
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mt-1">3 Days / Romance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}