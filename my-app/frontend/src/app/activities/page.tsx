'use client';

import { useState } from 'react';

type Activity = {
  id: string;
  title: string;
  city: string;
  category: 'Sightseeing' | 'Food' | 'Adventure' | 'Culture';
  cost: '$' | '$$' | '$$$';
  duration: string;
  image: string;
  description: string;
};

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: 'Colosseum Underground Tour',
    city: 'Rome',
    category: 'Sightseeing',
    cost: '$$',
    duration: 'Half-day',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    description: 'Explore the restricted underground levels of the Colosseum where gladiators once prepared for battle.'
  },
  {
    id: '2',
    title: 'Pasta Making Masterclass',
    city: 'Rome',
    category: 'Food',
    cost: '$$$',
    duration: '< 2 hours',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?w=800',
    description: 'Learn the ancient art of making fresh pasta from scratch with a local Roman chef.'
  },
  {
    id: '3',
    title: 'Vatican Museums Early Access',
    city: 'Rome',
    category: 'Culture',
    cost: '$$$',
    duration: 'Half-day',
    image: 'https://images.unsplash.com/photo-1531572753322-ad011ceef8f2?w=800',
    description: 'Enter the Sistine Chapel before the crowds arrive and experience Michelangelo’s masterpiece in peace.'
  },
  {
    id: '4',
    title: 'Mt. Fuji Summit Hike',
    city: 'Kyoto',
    category: 'Adventure',
    cost: '$',
    duration: 'Full-day',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    description: 'A challenging but rewarding trek to the top of Japan’s most iconic volcanic peak.'
  },
  {
    id: '5',
    title: 'Seine River Dinner Cruise',
    city: 'Paris',
    category: 'Food',
    cost: '$$$',
    duration: '< 2 hours',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
    description: 'Enjoy a gourmet multi-course meal while gliding past the illuminated Eiffel Tower and Notre-Dame.'
  },
  {
    id: '6',
    title: 'Catacombs Exploration',
    city: 'Paris',
    category: 'Adventure',
    cost: '$$',
    duration: '< 2 hours',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    description: 'Descend into the dark underground ossuaries holding the remains of over six million Parisians.'
  }
];

export default function ActivitySearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCost, setSelectedCost] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<string>('All');
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  // Filter logic
  const filteredActivities = MOCK_ACTIVITIES.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          activity.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || activity.category === selectedCategory;
    const matchesCost = selectedCost === 'All' || activity.cost === selectedCost;
    const matchesDuration = selectedDuration === 'All' || activity.duration === selectedDuration;
    
    return matchesSearch && matchesCategory && matchesCost && matchesDuration;
  });

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
      </div>

      {/* Filters Section */}
      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-6 md:p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Search */}
          <div>
            <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">Search</label>
            <input 
              type="text" 
              placeholder="E.g., 'Museum' or 'Rome'" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-black dark:border-white py-2 sans text-sm outline-none focus:border-accent dark:focus:border-accent transition"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">Interest</label>
            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent border-b border-black dark:border-white py-2 sans text-sm outline-none focus:border-accent dark:focus:border-accent transition appearance-none cursor-pointer pr-8"
              >
                <option value="All" className="bg-white text-black dark:bg-black dark:text-white">All Interests</option>
                <option value="Sightseeing" className="bg-white text-black dark:bg-black dark:text-white">Sightseeing</option>
                <option value="Food" className="bg-white text-black dark:bg-black dark:text-white">Food & Drink</option>
                <option value="Adventure" className="bg-white text-black dark:bg-black dark:text-white">Adventure</option>
                <option value="Culture" className="bg-white text-black dark:bg-black dark:text-white">Culture</option>
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-black dark:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Cost Filter */}
          <div className="relative">
            <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">Cost</label>
            <div className="relative">
              <select 
                value={selectedCost}
                onChange={(e) => setSelectedCost(e.target.value)}
                className="w-full bg-transparent border-b border-black dark:border-white py-2 sans text-sm outline-none focus:border-accent dark:focus:border-accent transition appearance-none cursor-pointer pr-8"
              >
                <option value="All" className="bg-white text-black dark:bg-black dark:text-white">Any Price</option>
                <option value="$" className="bg-white text-black dark:bg-black dark:text-white">$ (Budget)</option>
                <option value="$$" className="bg-white text-black dark:bg-black dark:text-white">$$ (Moderate)</option>
                <option value="$$$" className="bg-white text-black dark:bg-black dark:text-white">$$$ (Luxury)</option>
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-black dark:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Duration Filter */}
          <div className="relative">
            <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">Duration</label>
            <div className="relative">
              <select 
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full bg-transparent border-b border-black dark:border-white py-2 sans text-sm outline-none focus:border-accent dark:focus:border-accent transition appearance-none cursor-pointer pr-8"
              >
                <option value="All" className="bg-white text-black dark:bg-black dark:text-white">Any Duration</option>
                <option value="< 2 hours" className="bg-white text-black dark:bg-black dark:text-white">Under 2 hours</option>
                <option value="Half-day" className="bg-white text-black dark:bg-black dark:text-white">Half-day</option>
                <option value="Full-day" className="bg-white text-black dark:bg-black dark:text-white">Full-day</option>
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-black dark:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="border border-black/10 dark:border-white/10 group flex flex-col relative bg-white dark:bg-black">
              
              {/* Image Section */}
              <div className="relative h-64 overflow-hidden w-full">
                <img 
                  src={activity.image} 
                  alt={activity.title}
                  className="absolute inset-0 w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300"></div>
                
                {/* Meta tags top */}
                <div className="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
                  <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1.5 sans text-[9px] uppercase tracking-[0.2em] border border-white/20 rounded-sm shadow-xl">
                    {activity.city}
                  </span>
                  <span className="bg-black/50 backdrop-blur-md text-accent px-3 py-1.5 sans text-[9px] uppercase tracking-[0.2em] border border-white/20 rounded-sm shadow-xl">
                    {activity.category}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="serif text-2xl mb-2 pr-8">{activity.title}</h3>
                
                <div className="flex gap-4 mb-4 mt-auto">
                  <span className="sans text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {activity.duration}
                  </span>
                  <span className="sans text-[10px] uppercase tracking-widest text-accent flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {activity.cost}
                  </span>
                </div>

                {/* Expanding Description */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedActivityId === activity.id ? 'max-h-40 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
                  <p className="sans text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-black/10 dark:border-white/10 pt-4 mt-2">
                    {activity.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 border-t border-black/10 dark:border-white/10 mt-auto">
                <button 
                  onClick={() => setExpandedActivityId(expandedActivityId === activity.id ? null : activity.id)}
                  className="p-4 sans text-[10px] uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition border-r border-black/10 dark:border-white/10"
                >
                  {expandedActivityId === activity.id ? 'Close View' : 'Quick View'}
                </button>
                <button className="p-4 sans text-[10px] uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:bg-accent dark:hover:bg-accent transition">
                  Add to Trip +
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
            <h3 className="serif text-3xl mb-2">No activities found</h3>
            <p className="sans text-xs uppercase tracking-widest text-gray-500">Try adjusting your filters.</p>
          </div>
        )}
      </div>

    </main>
  );
}
