'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';

/* ── Types ───────────────────────────────────────────────────────────── */

type ChecklistItemData = {
  id: number;
  user_id: number;
  trip_id: number;
  label: string;
  category: string;
  is_packed: boolean;
  created_at: string;
};

type ChecklistSummary = {
  trip_id: number;
  total: number;
  packed: number;
  percentage: number;
  items: ChecklistItemData[];
};

type TripOption = {
  id: number;
  name: string;
};

/* ── Constants ───────────────────────────────────────────────────────── */

const CATEGORIES = [
  { value: 'clothing', label: 'Clothing', icon: 'CL' },
  { value: 'documents', label: 'Documents', icon: 'DC' },
  { value: 'electronics', label: 'Electronics', icon: 'EL' },
  { value: 'toiletries', label: 'Toiletries', icon: 'TL' },
  { value: 'other', label: 'Other', icon: 'OT' },
];

function getCategoryIcon(cat: string): string {
  return CATEGORIES.find(c => c.value === cat)?.icon || 'OT';
}

function getCategoryLabel(cat: string): string {
  return CATEGORIES.find(c => c.value === cat)?.label || cat;
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function ChecklistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [trips, setTrips] = useState<TripOption[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [checklist, setChecklist] = useState<ChecklistSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [tripsLoading, setTripsLoading] = useState(true);

  // Form state
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState('other');
  const [addingItem, setAddingItem] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Collapsed categories
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  // Load trips
  useEffect(() => {
    if (!user) return;
    const loadTrips = async () => {
      try {
        const data = await fetchApi('/trips/');
        setTrips((data || []).map((t: { id: number; name: string }) => ({ id: t.id, name: t.name })));
        // Auto-select first trip if available
        if (data && data.length > 0) {
          setSelectedTripId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load trips:', err);
      } finally {
        setTripsLoading(false);
      }
    };
    loadTrips();
  }, [user]);

  // Load checklist for selected trip
  const loadChecklist = useCallback(async () => {
    if (!user || !selectedTripId) {
      setChecklist(null);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchApi(`/trips/${selectedTripId}/checklist`);
      setChecklist(data);
    } catch (err) {
      console.error('Failed to load checklist:', err);
      setChecklist(null);
    } finally {
      setLoading(false);
    }
  }, [user, selectedTripId]);

  useEffect(() => {
    loadChecklist();
  }, [loadChecklist]);

  // Add item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !selectedTripId) return;
    setAddingItem(true);
    try {
      await fetchApi('/checklist', {
        method: 'POST',
        body: JSON.stringify({
          trip_id: selectedTripId,
          label: newLabel.trim(),
          category: newCategory,
        }),
      });
      setNewLabel('');
      setNewCategory('other');
      await loadChecklist();
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setAddingItem(false);
    }
  };

  // Toggle packed
  const handleTogglePacked = async (item: ChecklistItemData) => {
    try {
      await fetchApi(`/checklist/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_packed: !item.is_packed }),
      });
      // Optimistic update
      if (checklist) {
        setChecklist({
          ...checklist,
          packed: item.is_packed ? checklist.packed - 1 : checklist.packed + 1,
          percentage: checklist.total > 0
            ? Math.round(((item.is_packed ? checklist.packed - 1 : checklist.packed + 1) / checklist.total) * 1000) / 10
            : 0,
          items: checklist.items.map(i => i.id === item.id ? { ...i, is_packed: !i.is_packed } : i),
        });
      }
    } catch (err) {
      console.error('Failed to toggle item:', err);
      await loadChecklist(); // Revert on error
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: number) => {
    try {
      await fetchApi(`/checklist/${itemId}`, { method: 'DELETE' });
      await loadChecklist();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Reset all
  const handleReset = async () => {
    if (!selectedTripId) return;
    setResetting(true);
    try {
      await fetchApi(`/trips/${selectedTripId}/checklist/reset`, { method: 'POST' });
      await loadChecklist();
    } catch (err) {
      console.error('Failed to reset checklist:', err);
    } finally {
      setResetting(false);
    }
  };

  // Toggle category collapse
  const toggleCategory = (cat: string) => {
    setCollapsedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Group items by category
  const groupedItems: Record<string, ChecklistItemData[]> = {};
  if (checklist) {
    for (const item of checklist.items) {
      if (!groupedItems[item.category]) groupedItems[item.category] = [];
      groupedItems[item.category].push(item);
    }
  }
  // Sort categories so they appear in a consistent order
  const categoryOrder = CATEGORIES.map(c => c.value);
  const sortedCategories = Object.keys(groupedItems).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-65px)] px-6 py-12 md:py-20 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-16 border-b border-black/10 dark:border-white/10 pb-12">
        <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">Stay Organised</p>
        <h1 className="serif text-5xl md:text-7xl leading-[0.95]">
          Packing<br />
          <span className="text-gray-400 dark:text-gray-500">Checklist.</span>
        </h1>
      </div>

      {/* Trip Selector */}
      <div className="mb-10">
        <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">Select Trip</label>
        {tripsLoading ? (
          <div className="h-10 bg-gray-200 dark:bg-gray-800 animate-pulse w-full max-w-sm"></div>
        ) : trips.length > 0 ? (
          <div className="relative max-w-sm">
            <select
              value={selectedTripId || ''}
              onChange={(e) => setSelectedTripId(Number(e.target.value) || null)}
              className="w-full bg-transparent border-b-2 border-black dark:border-white py-3 sans text-base outline-none focus:border-accent transition appearance-none cursor-pointer pr-8"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id} className="bg-white text-black dark:bg-black dark:text-white">
                  {t.name}
                </option>
              ))}
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-black/20 dark:border-white/20 p-8 text-center max-w-sm">
            <p className="sans text-xs text-gray-500">No trips yet. Create a trip first.</p>
          </div>
        )}
      </div>

      {selectedTripId && (
        <>
          {/* Progress Bar */}
          {checklist && checklist.total > 0 && (
            <div className="mb-10 border border-black/10 dark:border-white/10 bg-white dark:bg-black p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="sans text-[10px] uppercase tracking-widest text-gray-500">Progress</p>
                  <p className="serif text-3xl mt-1">{checklist.percentage}%</p>
                </div>
                <p className="sans text-xs text-gray-500">
                  {checklist.packed} of {checklist.total} packed
                </p>
              </div>
              <div className="w-full h-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 overflow-hidden">
                <div
                  className="h-full bg-black dark:bg-white transition-all duration-700 ease-out"
                  style={{ width: `${checklist.percentage}%` }}
                ></div>
              </div>
              {checklist.percentage === 100 && (
                <p className="sans text-xs text-green-600 mt-3 font-medium">All packed! You&apos;re ready to go.</p>
              )}
            </div>
          )}

          {/* Add Item Form */}
          <form onSubmit={handleAddItem} className="mb-10 border border-black/10 dark:border-white/10 bg-white dark:bg-black p-6">
            <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Add Item</p>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 items-end">
              <div>
                <input
                  type="text"
                  placeholder="E.g., 'Passport', 'Phone charger'"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full bg-transparent border-b border-black dark:border-white py-2 sans text-sm outline-none focus:border-accent transition"
                />
              </div>
              <div className="relative">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-transparent border-b border-black dark:border-white py-2 sans text-sm outline-none focus:border-accent transition appearance-none cursor-pointer pr-8 min-w-[140px]"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value} className="bg-white text-black dark:bg-black dark:text-white">
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <button
                type="submit"
                disabled={!newLabel.trim() || addingItem}
                className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 sans text-[10px] uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-white transition disabled:opacity-30"
              >
                {addingItem ? '…' : '+ Add'}
              </button>
            </div>
          </form>

          {/* Checklist Items */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-gray-200 dark:bg-gray-800 border border-black/10 dark:border-white/10"></div>
              ))}
            </div>
          ) : checklist && checklist.items.length > 0 ? (
            <div className="space-y-6">
              {sortedCategories.map(cat => {
                const items = groupedItems[cat];
                const isCollapsed = collapsedCats.has(cat);
                const catPacked = items.filter(i => i.is_packed).length;
                return (
                  <div key={cat} className="border border-black/10 dark:border-white/10 bg-white dark:bg-black">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getCategoryIcon(cat)}</span>
                        <span className="sans text-sm font-medium uppercase tracking-wide">{getCategoryLabel(cat)}</span>
                        <span className="sans text-[10px] uppercase tracking-widest text-gray-500">
                          {catPacked}/{items.length}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Items */}
                    {!isCollapsed && (
                      <div className="border-t border-black/5 dark:border-white/5">
                        {items.map(item => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5 last:border-b-0 group transition ${
                              item.is_packed ? 'bg-black/[0.02] dark:bg-white/[0.02]' : ''
                            }`}
                          >
                            <button
                              onClick={() => handleTogglePacked(item)}
                              className="flex items-center gap-3 flex-grow text-left"
                            >
                              {/* Checkbox */}
                              <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                item.is_packed
                                  ? 'border-black dark:border-white bg-black dark:bg-white'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white'
                              }`}>
                                {item.is_packed && (
                                  <svg className="w-3 h-3 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className={`sans text-sm transition ${item.is_packed ? 'line-through text-gray-400' : ''}`}>
                                {item.label}
                              </span>
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-accent p-1"
                              title="Remove item"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Reset Button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleReset}
                  disabled={resetting || (checklist && checklist.packed === 0)}
                  className="sans text-[10px] uppercase tracking-widest text-gray-500 hover:text-accent transition border-b border-transparent hover:border-accent pb-1 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {resetting ? 'Resetting…' : 'Reset All to Unpacked'}
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-black/20 dark:border-white/20 p-12 text-center">
              <p className="serif text-2xl mb-2">No items yet.</p>
              <p className="sans text-xs text-gray-500 uppercase tracking-widest">
                Add items above to start your packing checklist.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
