export default function Footer() {
  return (
    <footer className="border-t border-black bg-black text-white px-4 md:px-12 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-2">
          <h2 className="serif text-5xl md:text-7xl mb-6">Traveloop.</h2>
          <p className="sans text-xs uppercase tracking-widest text-gray-400 max-w-xs leading-relaxed">
            Elevating the art of travel planning. Curate, organize, and execute your itineraries with editorial precision.
          </p>
        </div>
        <div className="sans text-xs uppercase tracking-widest leading-loose flex flex-col gap-2">
          <span className="text-gray-500 mb-2">Platform</span>
          <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
          <a href="/trips" className="hover:text-gray-300">Itineraries</a>
          <a href="/search" className="hover:text-gray-300">Destinations</a>
          <a href="/trips/new" className="hover:text-gray-300">Expenses</a>
        </div>
        <div className="sans text-xs uppercase tracking-widest leading-loose flex flex-col gap-2">
          <span className="text-gray-500 mb-2">Account</span>
          <a href="/profile" className="hover:text-gray-300">Profile</a>
          <a href="#" className="hover:text-gray-300">Settings</a>
          <a href="#" className="hover:text-gray-300">Sign Out</a>
        </div>
      </div>

      <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center sans text-[10px] uppercase tracking-widest text-gray-500">
        <p>&copy; 2026 Traveloop. Odoo Hackathon.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
        </div>
      </div>
    </footer>
  );
}
