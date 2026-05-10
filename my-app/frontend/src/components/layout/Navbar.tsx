"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSwitchUser = () => {
    setMenuOpen(false);
    logout();
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  // Get user initials for avatar
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b border-black">
      <nav className="sans flex items-center justify-between uppercase text-[10px] tracking-[0.2em] px-4 md:px-12 py-5 w-full">
        <div className="flex items-center gap-8 md:gap-16">
          <Link href="/" className="font-bold tracking-[0.3em] text-xs hover:text-accent transition">
            Traveloop.
          </Link>
          <div className="hidden md:flex gap-8 text-gray-500">
            <Link href="/dashboard" className="hover:text-accent transition border-b border-transparent hover:border-accent pb-1 text-black">
              Dashboard
            </Link>
            <Link href="/trips" className="hover:text-accent transition border-b border-transparent hover:border-accent pb-1">
              Itineraries
            </Link>
            <Link href="/search" className="hover:text-accent transition border-b border-transparent hover:border-accent pb-1">
              Destinations
            </Link>
            <Link href="/activities" className="hover:text-accent transition border-b border-transparent hover:border-accent pb-1">
              Activities
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="w-px h-3 bg-gray-300 hidden sm:block"></div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="w-20 h-4 bg-gray-200 animate-pulse hidden sm:block"></div>
          ) : user ? (
            /* ── Logged-in state ── */
            <div className="relative hidden sm:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 hover:text-accent transition"
              >
                {/* Avatar circle with initials */}
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold tracking-normal">
                  {initials}
                </div>
                <span className="hidden md:inline">{user.full_name.split(' ')[0]}</span>
                {/* Chevron */}
                <svg className={`w-3 h-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-3 w-52 bg-white border border-black shadow-lg z-50 normal-case tracking-normal text-xs">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-sm truncate">{user.full_name}</p>
                    <p className="text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  {/* Menu items */}
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 hover:bg-gray-50 hover:text-accent transition border-b border-gray-100"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleSwitchUser}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-50 hover:text-accent transition border-b border-gray-100"
                  >
                    Switch User
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-red-600 hover:text-red-700 transition"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Logged-out state ── */
            <>
              <Link href="/login" className="hover:text-accent transition hidden sm:block">
                Sign In
              </Link>
              <Link href="/register" className="bg-black text-white hover:bg-accent border border-black hover:border-accent px-4 py-2 transition text-center hidden sm:block">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
