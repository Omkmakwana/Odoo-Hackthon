"use client";

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { fetchApi } from '@/lib/api';

type City = {
  id: number;
  name: string;
  country: string;
  region: string;
  cost_index: string;
  popularity: number;
  image_url: string;
};

type CityApiResponse = {
  id: number;
  name: string;
  country: string;
  region: string;
  cost_index: number;
  popularity: number;
  image_url: string | null;
};

const MOCK_CITIES: City[] = [
  { id: 1, name: 'Tokyo', country: 'Japan', region: 'Asia', cost_index: 'High', popularity: 98, image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2694&auto=format&fit=crop' },
  { id: 2, name: 'Florence', country: 'Italy', region: 'Europe', cost_index: 'Medium', popularity: 95, image_url: 'https://images.unsplash.com/photo-1543429776-27826315ef98?q=80&w=2670&auto=format&fit=crop' },
  { id: 3, name: 'Marrakech', country: 'Morocco', region: 'Africa', cost_index: 'Low', popularity: 88, image_url: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2671&auto=format&fit=crop' },
  { id: 4, name: 'Kyoto', country: 'Japan', region: 'Asia', cost_index: 'High', popularity: 96, image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2670&auto=format&fit=crop' },
  { id: 5, name: 'Barcelona', country: 'Spain', region: 'Europe', cost_index: 'Medium', popularity: 94, image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2670&auto=format&fit=crop' },
  { id: 6, name: 'Buenos Aires', country: 'Argentina', region: 'South America', cost_index: 'Low', popularity: 85, image_url: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=2670&auto=format&fit=crop' },
];

const REGIONS = ['All Regions', 'Asia', 'Europe', 'Africa', 'South America', 'North America', 'Oceania'];

const FALLBACK_CITY_IMAGE =
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80';

function mapCostIndex(value: number): string {
  if (value <= 2) {
    return 'Low';
  }
  if (value === 3) {
    return 'Medium';
  }
  return 'High';
}

export default function CitySearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [cities, setCities] = useState<City[]>(MOCK_CITIES);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<number, true>>({});

  useEffect(() => {
    let active = true;

    const loadCities = async () => {
      try {
        const data = (await fetchApi('/cities?limit=100')) as CityApiResponse[];
        if (!active) {
          return;
        }

        if (Array.isArray(data) && data.length > 0) {
          setCities(
            data.map((city) => ({
              id: city.id,
              name: city.name,
              country: city.country,
              region: city.region,
              cost_index: mapCostIndex(city.cost_index),
              popularity: city.popularity,
              image_url: city.image_url || FALLBACK_CITY_IMAGE
            }))
          );
          setLoadError(null);
        } else {
          setCities(MOCK_CITIES);
        }
      } catch {
        if (active) {
          setCities(MOCK_CITIES);
          setLoadError('Showing offline demo data. Connect to the API for live catalog results.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadCities();
    return () => {
      active = false;
    };
  }, []);

  const filteredCities = useMemo(() => cities.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) || city.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All Regions' || city.region === selectedRegion;
    return matchesSearch && matchesRegion;
  }), [cities, searchQuery, selectedRegion]);

  return (
    <div className="min-h-[calc(100vh-65px)] pb-24">
      
      {/* Header Section */}
      <div className="pt-20 pb-12 px-6 max-w-7xl mx-auto">
        <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4">Discovery</p>
        <h1 className="serif text-5xl md:text-7xl leading-[0.95] mb-12">
          Find Your<br />
          <i className="text-gray-400">Next Destination.</i>
        </h1>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 bg-black/5 dark:bg-white/5 p-6 md:p-8 border border-black/10 dark:border-white/10">
          <div className="flex-grow">
            <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">Search City or Country</label>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Tokyo, Italy..."
              className="w-full bg-transparent border-b border-black dark:border-white py-3 sans text-sm outline-none focus:border-accent dark:focus:border-accent transition"
            />
          </div>
          <div className="w-full md:w-64 relative">
            <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">Region</label>
            <div className="relative">
              <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-transparent border-b border-black dark:border-white py-3 sans text-sm outline-none focus:border-accent dark:focus:border-accent transition appearance-none cursor-pointer pr-8"
              >
                {REGIONS.map(region => (
                  <option key={region} value={region} className="bg-white text-black dark:bg-black dark:text-white">
                    {region}
                  </option>
                ))}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-black dark:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {loadError ? (
          <p className="mt-4 sans text-[10px] uppercase tracking-widest text-amber-600">{loadError}</p>
        ) : null}
      </div>

      {/* Results Grid */}
      <div className="px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500">
            Showing {filteredCities.length} Results
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[390px] animate-pulse border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5" />
            ))}
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="py-24 text-center border-t border-black/10 dark:border-white/10 mt-8">
            <p className="serif text-2xl text-gray-400 mb-6">No destinations found matching your criteria.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedRegion('All Regions'); }}
              className="sans text-xs uppercase tracking-widest text-black dark:text-white hover:text-accent border-b border-black dark:border-white hover:border-accent pb-1 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCities.map((city) => (
              <div key={city.id} className="group relative border border-black/10 dark:border-white/10 overflow-hidden bg-black/5 dark:bg-white/5 flex flex-col h-full">
                
                {/* Image Header */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={failedImageIds[city.id] ? FALLBACK_CITY_IMAGE : city.image_url}
                    alt={city.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => {
                      setFailedImageIds((previous) => ({ ...previous, [city.id]: true }));
                    }}
                    className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div>
                      <h3 className="serif text-3xl text-white mb-1">{city.name}</h3>
                      <p className="sans text-[10px] uppercase tracking-widest text-white/80">{city.country}</p>
                    </div>
                  </div>
                </div>

                {/* Content & Meta */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                      <p className="sans text-[9px] uppercase tracking-widest text-gray-500 mb-1">Region</p>
                      <p className="sans text-xs">{city.region}</p>
                    </div>
                    <div>
                      <p className="sans text-[9px] uppercase tracking-widest text-gray-500 mb-1">Cost Index</p>
                      <p className="sans text-xs">{city.cost_index}</p>
                    </div>
                    <div>
                      <p className="sans text-[9px] uppercase tracking-widest text-gray-500 mb-1">Popularity</p>
                      <p className="sans text-xs">{city.popularity} / 100</p>
                    </div>
                  </div>

                  {/* Add to Trip Action */}
                  <button className="w-full bg-black text-white dark:bg-white dark:text-black py-4 sans text-[10px] uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-white transition group/btn border border-black dark:border-white hover:border-accent">
                    <span className="group-hover/btn:hidden">Add to Trip</span>
                    <span className="hidden group-hover/btn:inline">&plus; Select Itinerary</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
