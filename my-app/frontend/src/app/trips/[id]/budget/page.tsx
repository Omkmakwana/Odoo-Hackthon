'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';

/* ── Types ───────────────────────────────────────────────────────────── */

type BudgetBreakdown = {
  category: string;
  total: number;
  percentage: number;
};

type DailyCost = {
  day: number;
  cost: number;
};

type BudgetSummary = {
  trip_id: number;
  trip_name: string;
  budget_limit: number;
  total_estimated: number;
  remaining: number;
  is_over_budget: boolean;
  average_per_day: number;
  breakdown: BudgetBreakdown[];
  daily_costs: DailyCost[];
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

const CATEGORY_COLORS: Record<string, string> = {
  transport: '#3b82f6',
  stay: '#8b5cf6',
  activity: '#f59e0b',
  meal: '#10b981',
  other: '#6b7280',
};

const CATEGORY_ICONS: Record<string, string> = {
  transport: 'Transport',
  stay: 'Stay',
  activity: 'Activity',
  meal: 'Meal',
  other: 'Other',
};

function fmt(n: number): string {
  return `₹${(n * 83).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function TripBudgetPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !id) return;
    const load = async () => {
      try {
        const data = await fetchApi(`/trips/${id}/budget`);
        setBudget(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load budget');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, id]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800"></div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-px bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-black p-8">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 mb-4"></div>
                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800"></div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 border border-black/10 dark:border-white/10"></div>
        </div>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="min-h-[calc(100vh-65px)] max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center py-20 border border-black/10 dark:border-white/10">
          <h2 className="serif text-3xl mb-2">Could not load budget</h2>
          <p className="sans text-xs text-gray-500">{error || 'Unknown error'}</p>
          <Link href={`/trips/${id}`} className="inline-block mt-6 bg-black text-white dark:bg-white dark:text-black px-6 py-3 sans text-[10px] uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-white transition">
            ← Back to Trip
          </Link>
        </div>
      </div>
    );
  }

  const maxDailyCost = Math.max(...budget.daily_costs.map(d => d.cost), 1);
  const avgPerDay = budget.average_per_day;

  // Generate conic gradient for donut chart
  let gradientStops = '';
  let cumPercent = 0;
  budget.breakdown.forEach((b) => {
    const color = CATEGORY_COLORS[b.category] || CATEGORY_COLORS.other;
    const start = cumPercent;
    cumPercent += b.percentage;
    gradientStops += `${color} ${start}% ${cumPercent}%, `;
  });
  if (cumPercent < 100) {
    gradientStops += `#e5e7eb ${cumPercent}% 100%`;
  } else {
    gradientStops = gradientStops.slice(0, -2); // remove trailing ", "
  }

  return (
    <div className="min-h-[calc(100vh-65px)] max-w-7xl mx-auto px-6 py-12 md:py-20">

      {/* Header */}
      <div className="mb-16 border-b border-black/10 dark:border-white/10 pb-12">
        <Link href={`/trips/${id}`} className="sans text-[10px] uppercase tracking-widest text-gray-500 hover:text-accent transition mb-4 inline-block">
          ← Back to {budget.trip_name}
        </Link>
        <h1 className="serif text-5xl md:text-7xl leading-[0.95]">
          Budget<br />
          <span className="text-gray-400 dark:text-gray-500">Breakdown.</span>
        </h1>
      </div>

      {/* Over-budget Alert */}
      {budget.is_over_budget && (
        <div className="mb-8 border-2 border-accent bg-accent/5 p-6 flex items-center gap-4">
          <span className="text-xl font-semibold text-accent">!</span>
          <div>
            <p className="sans text-sm font-semibold text-accent">Over Budget!</p>
            <p className="sans text-xs text-gray-500 mt-1">
              You&apos;re {fmt(Math.abs(budget.remaining))} over your budget limit of {fmt(budget.budget_limit)}.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 mb-16">
        <div className="bg-white dark:bg-black p-6 md:p-8">
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Budget Limit</p>
          <p className="serif text-3xl md:text-4xl">{fmt(budget.budget_limit)}</p>
        </div>
        <div className="bg-white dark:bg-black p-6 md:p-8">
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Total Estimated</p>
          <p className={`serif text-3xl md:text-4xl ${budget.is_over_budget ? 'text-accent' : ''}`}>
            {fmt(budget.total_estimated)}
          </p>
        </div>
        <div className="bg-white dark:bg-black p-6 md:p-8">
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Remaining</p>
          <p className={`serif text-3xl md:text-4xl ${budget.remaining < 0 ? 'text-accent' : 'text-green-600'}`}>
            {budget.remaining < 0 ? `-${fmt(Math.abs(budget.remaining))}` : fmt(budget.remaining)}
          </p>
        </div>
        <div className="bg-white dark:bg-black p-6 md:p-8">
          <p className="sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">Avg / Day</p>
          <p className="serif text-3xl md:text-4xl">{fmt(avgPerDay)}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Donut Chart */}
        <div>
          <h2 className="serif text-3xl mb-8">By Category.</h2>
          <div className="flex flex-col items-center">
            {/* CSS Donut Chart */}
            <div
              className="relative w-56 h-56 rounded-full mb-8"
              style={{
                background: budget.breakdown.length > 0
                  ? `conic-gradient(${gradientStops})`
                  : '#e5e7eb',
              }}
            >
              <div className="absolute inset-6 rounded-full bg-white dark:bg-black flex flex-col items-center justify-center">
                <p className="serif text-3xl">{fmt(budget.total_estimated)}</p>
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500">Total</p>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-4">
              {budget.breakdown.map((b) => (
                <div key={b.category} className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[b.category] || CATEGORY_COLORS.other }}
                    ></div>
                    <span className="sans text-sm capitalize">
                    {CATEGORY_ICONS[b.category] || 'Other'} — {b.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="sans text-sm font-medium">{fmt(b.total)}</span>
                    <span className="sans text-[10px] uppercase tracking-widest text-gray-500 ml-2">
                      ({b.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
              {budget.breakdown.length === 0 && (
                <p className="sans text-xs text-gray-500 text-center py-4">No expenses recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Daily Cost Bar Chart */}
        <div>
          <h2 className="serif text-3xl mb-8">Daily Costs.</h2>
          {budget.daily_costs.length > 0 ? (
            <div className="space-y-3">
              {budget.daily_costs.map((day) => {
                const pct = (day.cost / maxDailyCost) * 100;
                const overBudgetDay = budget.budget_limit > 0 && day.cost > (budget.budget_limit / (budget.daily_costs.length || 1));
                return (
                  <div key={day.day} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="sans text-[10px] uppercase tracking-widest text-gray-500">Day {day.day}</span>
                      <span className={`sans text-xs font-medium ${overBudgetDay ? 'text-accent' : ''}`}>
                        {fmt(day.cost)}
                        {overBudgetDay && ' (over)'}
                      </span>
                    </div>
                    <div className="w-full h-8 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 relative overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ease-out ${overBudgetDay ? 'bg-accent/70' : 'bg-black dark:bg-white'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              {/* Average line indicator */}
              {budget.daily_costs.length > 1 && (
                <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                  <span className="sans text-[10px] uppercase tracking-widest text-gray-500">Average</span>
                  <span className="sans text-sm font-medium">{fmt(avgPerDay)}/day</span>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-black/20 dark:border-white/20 p-12 text-center">
              <p className="serif text-xl mb-2">No daily costs recorded.</p>
              <p className="sans text-xs uppercase tracking-widest text-gray-500">
                Add activities to your stops to see daily cost breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
