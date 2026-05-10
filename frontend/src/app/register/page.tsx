"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { register, saveTokens } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const destinations = [
  {
    city: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=2670&auto=format&fit=crop',
    tagline: 'Neon dreams meet ancient temples.',
  },
  {
    city: 'Rome',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=2670&auto=format&fit=crop',
    tagline: 'Every cobblestone tells a story.',
  },
  {
    city: 'Cairo',
    country: 'Egypt',
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=2670&auto=format&fit=crop',
    tagline: 'Wonders carved from sand and time.',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentDest, setCurrentDest] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setImgLoaded(false);
      setCurrentDest((prev) => (prev + 1) % destinations.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const dest = destinations[currentDest];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const tokens = await register(fullName, email, password);
      saveTokens(tokens.access_token, tokens.refresh_token);
      await refresh();
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex-grow flex min-h-[calc(100vh-65px)]">

      {/* ── Left: Destination Image ── */}
      <div className="hidden lg:block lg:w-[50%] relative overflow-hidden">
        <img
          key={currentDest}
          src={dest.image}
          alt={dest.city}
          onLoad={() => setImgLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover filter grayscale-[40%] transition-all duration-[2000ms] ${
            imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/70"></div>
        <div className="absolute top-8 left-12">
          <p className="sans text-[10px] uppercase tracking-[0.3em] text-white/40">
            Your journey begins here
          </p>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12">
          <p
            className="sans text-[10px] uppercase tracking-[0.3em] text-white/50 mb-4 transition-opacity duration-1000"
            style={{ opacity: imgLoaded ? 1 : 0 }}
          >
            &ldquo;{dest.tagline}&rdquo;
          </p>
          <h2
            className="serif text-8xl md:text-9xl text-white leading-none mb-2 transition-all duration-1000"
            style={{
              opacity: imgLoaded ? 1 : 0,
              transform: imgLoaded ? 'translateY(0)' : 'translateY(30px)',
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
        </div>
        <div className="absolute bottom-8 left-12 right-12 flex items-center justify-between">
          <div className="flex gap-3">
            {destinations.map((d, i) => (
              <button
                key={i}
                onClick={() => { setImgLoaded(false); setCurrentDest(i); }}
                className={`sans text-[10px] uppercase tracking-widest transition-all duration-500 ${
                  i === currentDest
                    ? 'text-white border-b border-white pb-1'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {d.city}
              </button>
            ))}
          </div>
          <p className="sans text-[10px] text-white/30 tracking-widest">
            {String(currentDest + 1).padStart(2, '0')} / {String(destinations.length).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12">
        <div className="max-w-sm mx-auto w-full">

          {/* Header */}
          <div className="mb-10">
            <div className="w-8 h-px bg-accent mb-6"></div>
            <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4">Start your journey</p>
            <h1 className="serif text-5xl md:text-6xl leading-[0.95]">
              Begin Your<br />
              <i className="text-gray-400">Story.</i>
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 border border-red-300 bg-red-50 sans text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="register-name" className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-2">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none placeholder:text-gray-400 focus:border-accent transition"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-2">
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none placeholder:text-gray-400 focus:border-accent transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="register-password" className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none placeholder:text-gray-400 focus:border-accent transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 sans text-[10px] uppercase tracking-widest text-gray-400 hover:text-accent transition"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="register-confirm" className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-2">
                  Confirm
                </label>
                <input
                  id="register-confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none placeholder:text-gray-400 focus:border-accent transition"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input id="register-terms" type="checkbox" required className="mt-1 accent-accent" />
              <label htmlFor="register-terms" className="sans text-[11px] text-gray-500 leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-black hover:text-accent transition border-b border-transparent hover:border-accent">Terms</a>
                {' '}and{' '}
                <a href="#" className="text-black hover:text-accent transition border-b border-transparent hover:border-accent">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white hover:bg-accent border border-black hover:border-accent py-4 sans text-xs uppercase tracking-widest transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
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

          {/* Login link */}
          <p className="mt-8 sans text-xs text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-black hover:text-accent transition uppercase tracking-widest border-b border-transparent hover:border-accent pb-px">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
