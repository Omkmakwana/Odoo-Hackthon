import Link from 'next/link';
import ThemeToggle from '@/components/shared/ThemeToggle';

export default function Navbar() {
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
          <Link href="/login" className="hover:text-accent transition hidden sm:block">
            Sign In
          </Link>
          <Link href="/register" className="bg-black text-white hover:bg-accent border border-black hover:border-accent px-4 py-2 transition text-center hidden sm:block">
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
}
