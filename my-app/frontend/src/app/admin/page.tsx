'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';

/* ── Types ───────────────────────────────────────────────────────────── */

type TopCity = {
  city: string;
  count: number;
};

type TripsPerMonth = {
  year: number;
  month: number;
  count: number;
};

type RecentUser = {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
  is_active: boolean;
};

type AdminDashboard = {
  total_users: number;
  total_trips: number;
  active_users: number;
  top_cities: TopCity[];
  trips_per_month: TripsPerMonth[];
  recent_users: RecentUser[];
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Auth + Admin guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.is_admin) {
      router.push('/dashboard');
      return;
    }
  }, [authLoading, user, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!user || !user.is_admin) return;
    const load = async () => {
      try {
        const result = await fetchApi('/admin/dashboard');
        setData(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="serif text-3xl mb-2">Access Denied</h2>
          <p className="sans text-xs uppercase tracking-widest text-gray-500">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="animate-pulse space-y-10">
          <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-black p-8">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 mb-4"></div>
                <div className="h-12 w-16 bg-gray-200 dark:bg-gray-800"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="h-64 bg-gray-200 dark:bg-gray-800 border border-black/10 dark:border-white/10"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 border border-black/10 dark:border-white/10"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[calc(100vh-65px)] max-w-7xl mx-auto px-6 py-12 md:py-20 text-center py-20">
        <h2 className="serif text-3xl mb-2">Dashboard Error</h2>
        <p className="sans text-xs text-gray-500">{error}</p>
      </div>
    );
  }

  const maxCityCount = Math.max(...data.top_cities.map(c => c.count), 1);
  const maxMonthCount = Math.max(...data.trips_per_month.map(m => m.count), 1);
  const engagementRate = data.total_users > 0
    ? Math.round((data.active_users / data.total_users) * 100)
    : 0;

  return (
    <div className="min-h-[calc(100vh-65px)] max-w-7xl mx-auto px-6 py-12 md:py-20">

      {/* Header */}
      <div className="mb-16 border-b border-black/10 dark:border-white/10 pb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">Platform Insights</p>
          <h1 className="serif text-5xl md:text-7xl leading-[0.95]">
            Admin<br />
            <span className="text-gray-400 dark:text-gray-500">Dashboard.</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="sans text-[10px] uppercase tracking-widest text-gray-500">Live Data</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-px bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 mb-16">
        <div className="bg-white dark:bg-black p-6 md:p-8">
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Total Users</p>
          <p className="serif text-4xl md:text-5xl">{data.total_users}</p>
        </div>
        <div className="bg-white dark:bg-black p-6 md:p-8">
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Total Trips</p>
          <p className="serif text-4xl md:text-5xl">{data.total_trips}</p>
        </div>
        <div className="bg-white dark:bg-black p-6 md:p-8">
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Active Users</p>
          <p className="serif text-4xl md:text-5xl">{data.active_users}</p>
        </div>
        <div className="bg-white dark:bg-black p-6 md:p-8">
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Engagement</p>
          <p className="serif text-4xl md:text-5xl">{engagementRate}%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">

        {/* Top Cities - Horizontal Bar Chart */}
        <div>
          <h2 className="serif text-3xl mb-8">Top Cities.</h2>
          {data.top_cities.length > 0 ? (
            <div className="space-y-4">
              {data.top_cities.map((city, idx) => {
                const pct = (city.count / maxCityCount) * 100;
                return (
                  <div key={city.city}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span className="sans text-[10px] uppercase tracking-widest text-gray-400 w-5">{idx + 1}.</span>
                        <span className="sans text-sm font-medium">{city.city}</span>
                      </div>
                      <span className="sans text-xs text-gray-500">{city.count} trip{city.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="w-full h-6 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 relative overflow-hidden">
                      <div
                        className="h-full bg-black dark:bg-white transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-black/20 dark:border-white/20 p-8 text-center">
              <p className="sans text-xs text-gray-500">No city data available yet.</p>
            </div>
          )}
        </div>

        {/* Trips Per Month - Vertical Bar Chart */}
        <div>
          <h2 className="serif text-3xl mb-8">Trips Over Time.</h2>
          {data.trips_per_month.length > 0 ? (
            <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-black p-6">
              <div className="flex items-end gap-2 h-48">
                {data.trips_per_month.map((m) => {
                  const pct = (m.count / maxMonthCount) * 100;
                  return (
                    <div key={`${m.year}-${m.month}`} className="flex-1 flex flex-col items-center gap-2 group">
                      {/* Count label */}
                      <span className="sans text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition">
                        {m.count}
                      </span>
                      {/* Bar */}
                      <div className="w-full flex flex-col justify-end" style={{ height: '10rem' }}>
                        <div
                          className="w-full bg-black dark:bg-white transition-all duration-1000 ease-out hover:bg-accent dark:hover:bg-accent min-h-[4px]"
                          style={{ height: `${Math.max(pct, 3)}%` }}
                        ></div>
                      </div>
                      {/* Month label */}
                      <span className="sans text-[9px] uppercase tracking-widest text-gray-500">
                        {MONTH_NAMES[m.month - 1]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-black/20 dark:border-white/20 p-8 text-center">
              <p className="sans text-xs text-gray-500">No trip history yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Users Table */}
      <div>
        <h2 className="serif text-3xl mb-8">Recent Users.</h2>
        {data.recent_users.length > 0 ? (
          <div className="border border-black/10 dark:border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                  <th className="text-left p-4 sans text-[10px] uppercase tracking-widest text-gray-500 font-normal">User</th>
                  <th className="text-left p-4 sans text-[10px] uppercase tracking-widest text-gray-500 font-normal hidden sm:table-cell">Email</th>
                  <th className="text-left p-4 sans text-[10px] uppercase tracking-widest text-gray-500 font-normal hidden md:table-cell">Joined</th>
                  <th className="text-left p-4 sans text-[10px] uppercase tracking-widest text-gray-500 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_users.map((u) => (
                  <tr key={u.id} className="border-b border-black/5 dark:border-white/5 last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center sans text-[10px] font-bold flex-shrink-0">
                          {u.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span className="sans text-sm font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="p-4 sans text-sm text-gray-500 hidden sm:table-cell">{u.email}</td>
                    <td className="p-4 sans text-sm text-gray-500 hidden md:table-cell">{formatDate(u.created_at)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 sans text-[10px] uppercase tracking-widest ${
                        u.is_active ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-black/20 dark:border-white/20 p-8 text-center">
            <p className="sans text-xs text-gray-500">No users registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
