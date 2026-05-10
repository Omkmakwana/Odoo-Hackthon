"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, saveTokens } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const destinations = [
  {
    city: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop',
    quote: 'The city of light awaits your return.',
  },
  {
    city: 'Kyoto',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2670&auto=format&fit=crop',
    quote: 'Where tradition whispers through bamboo.',
  },
  {
    city: 'Santorini',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2574&auto=format&fit=crop',
    quote: 'Sun-kissed walls above an endless blue.',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentDest, setCurrentDest] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setImgLoaded(false);
      setCurrentDest((prev) => (prev + 1) % destinations.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const dest = destinations[currentDest];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokens = await login(email, password);
      saveTokens(tokens.access_token, tokens.refresh_token);
      await refresh();
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex-grow flex min-h-[calc(100vh-65px)]">

      {/* ── Left: Form ── */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-20 py-16">
        <div className="max-w-sm mx-auto w-full">

          {/* Branding accent */}
          <div className="mb-12">
            <div className="w-8 h-px bg-accent mb-6"></div>
            <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4">Welcome back to</p>
            <h1 className="serif text-5xl md:text-6xl leading-[0.95]">
              Your Next<br />
              <i className="text-gray-400">Chapter.</i>
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 border border-red-300 bg-red-50 sans text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="login-email" className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none placeholder:text-gray-400 focus:border-accent transition"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none placeholder:text-gray-400 focus:border-accent transition pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 sans text-[10px] uppercase tracking-widest text-gray-400 hover:text-accent transition"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="flex justify-end mt-3">
                <button type="button" className="sans text-[10px] uppercase tracking-widest text-gray-400 hover:text-accent transition">
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white hover:bg-accent border border-black hover:border-accent py-4 sans text-xs uppercase tracking-widest transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="sans text-[10px] uppercase tracking-widest text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google */}
          <button className="w-full border border-black py-3 flex items-center justify-center gap-3 sans text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Sign up link */}
          <p className="mt-10 sans text-xs text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-black hover:text-accent transition uppercase tracking-widest border-b border-transparent hover:border-accent pb-px">
              Create One
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: Destination Image ── */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <img
          key={currentDest}
          src={dest.image}
          alt={dest.city}
          onLoad={() => setImgLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover filter grayscale-[30%] transition-all duration-[2000ms] ${
            imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>
        <div className="absolute top-8 right-8 text-right">
          <p className="sans text-[10px] uppercase tracking-[0.3em] text-white/50">
            {String(currentDest + 1).padStart(2, '0')} / {String(destinations.length).padStart(2, '0')}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <p
            key={`quote-${currentDest}`}
            className="sans text-xs uppercase tracking-[0.2em] text-white/60 mb-4 transition-opacity duration-1000"
            style={{ opacity: imgLoaded ? 1 : 0 }}
          >
            &ldquo;{dest.quote}&rdquo;
          </p>
          <h2
            key={`city-${currentDest}`}
            className="serif text-7xl md:text-8xl text-white leading-none mb-3 transition-all duration-1000"
            style={{
              opacity: imgLoaded ? 1 : 0,
              transform: imgLoaded ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            {dest.city}.
          </h2>
          <p
            className="sans text-[10px] uppercase tracking-[0.3em] text-white/40 transition-opacity duration-1000"
            style={{ opacity: imgLoaded ? 1 : 0 }}
          >
            {dest.country}
          </p>
          <div className="flex gap-2 mt-8">
            {destinations.map((_, i) => (
              <div
                key={i}
                className={`h-px transition-all duration-500 ${
                  i === currentDest ? 'w-8 bg-white' : 'w-4 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
