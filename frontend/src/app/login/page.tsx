"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with backend auth
    console.log('Login attempt:', { email, password });
  };

  return (
    <section className="flex-grow flex items-center justify-center px-4 py-16 md:py-24">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="serif text-5xl md:text-6xl mb-4">Welcome<br /><i className="text-gray-400">Back.</i></h1>
          <p className="sans text-xs uppercase tracking-widest text-gray-500">
            Sign in to continue your journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <label htmlFor="login-email" className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-2">
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

          {/* Password */}
          <div>
            <label htmlFor="login-password" className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-2">
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

          {/* Forgot password */}
          <div className="flex justify-end">
            <button type="button" className="sans text-[10px] uppercase tracking-widest text-gray-400 hover:text-accent transition">
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-black text-white hover:bg-accent border border-black hover:border-accent py-4 sans text-xs uppercase tracking-widest transition"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="sans text-[10px] uppercase tracking-widest text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Social login buttons */}
        <div className="space-y-3">
          <button className="w-full border border-black py-3 flex items-center justify-center gap-3 sans text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition group">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Sign up link */}
        <p className="text-center mt-10 sans text-xs text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-black hover:text-accent transition uppercase tracking-widest border-b border-transparent hover:border-accent pb-px">
            Create One
          </Link>
        </p>

      </div>
    </section>
  );
}
