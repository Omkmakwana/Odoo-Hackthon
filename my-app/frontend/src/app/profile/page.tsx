'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Pencil, X, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [language, setLanguage] = useState('English');
  const [savedDestinations, setSavedDestinations] = useState(['Rome', 'Paris', 'Kyoto', 'Reykjavík', 'New York']);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+91 98765 43210',
    city: 'Ahmedabad',
    country: 'India'
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Sync form data when user loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.full_name,
        email: user.email
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.full_name ?? '',
      email: user?.email ?? '',
      phone: formData.phone,
      city: formData.city,
      country: formData.country
    });
    setIsEditing(false);
  };

  const handleRemoveDestination = (dest: string) => {
    setSavedDestinations((prev) => prev.filter((d) => d !== dest));
  };

  const initials = formData.name
    ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  if (loading) {
    return (
      <main className="w-full px-4 md:px-12 py-12 bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-12 pb-6 border-b border-[var(--border)]">
            <div className="w-48 h-12 bg-gray-200 animate-pulse"></div>
          </div>
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 w-28 h-28 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="mx-auto w-32 h-6 bg-gray-200 animate-pulse mt-6"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full px-4 md:px-12 py-12 bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-3xl">
        {/* Page Header */}
        <div className="mb-12 pb-6 border-b border-[var(--border)] flex items-end justify-between">
          <h1 className="font-serif text-4xl md:text-5xl">Your Profile</h1>
          <p className="font-sans text-xs uppercase tracking-widest text-[var(--muted)]">
            Account Settings
          </p>
        </div>

        {/* Avatar Section */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 w-28 h-28 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold font-sans">
            {initials}
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--card-bg)] transition duration-200 font-sans text-sm uppercase tracking-widest">
            <Camera size={16} />
            Change Photo
          </button>
          <h2 className="font-serif text-2xl mt-6">{formData.name}</h2>
        </div>

        {/* Editable Info Card */}
        <div className="mb-8 p-6 border border-[var(--border)] bg-[var(--card-bg)]">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-serif text-xl">Account Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-3 py-1 text-[var(--foreground)] hover:text-[var(--accent)] transition font-sans text-sm uppercase tracking-widest"
              >
                <Pencil size={16} />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-[var(--muted)] block mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border-b border-[var(--border)] bg-transparent py-2 font-serif text-lg focus:outline-none focus:border-[var(--accent)]"
                />
              ) : (
                <p className="font-serif text-lg">{formData.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-[var(--muted)] block mb-2">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border-b border-[var(--border)] bg-transparent py-2 font-serif text-lg focus:outline-none focus:border-[var(--accent)]"
                />
              ) : (
                <p className="font-serif text-lg">{formData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-[var(--muted)] block mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full border-b border-[var(--border)] bg-transparent py-2 font-serif text-lg focus:outline-none focus:border-[var(--accent)]"
                />
              ) : (
                <p className="font-serif text-lg">{formData.phone}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-[var(--muted)] block mb-2">
                City
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full border-b border-[var(--border)] bg-transparent py-2 font-serif text-lg focus:outline-none focus:border-[var(--accent)]"
                />
              ) : (
                <p className="font-serif text-lg">{formData.city}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-[var(--muted)] block mb-2">
                Country
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full border-b border-[var(--border)] bg-transparent py-2 font-serif text-lg focus:outline-none focus:border-[var(--accent)]"
                />
              ) : (
                <p className="font-serif text-lg">{formData.country}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-black text-white border border-black hover:bg-[var(--accent)] hover:border-[var(--accent)] transition duration-200 font-sans font-semibold uppercase tracking-wide"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="text-[var(--foreground)] hover:text-[var(--accent)] transition font-sans text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Language Preference */}
        <div className="mb-8 p-6 border border-[var(--border)] bg-[var(--card-bg)]">
          <label className="font-sans text-xs uppercase tracking-widest text-[var(--muted)] block mb-4">
            Language Preference
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-sans focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="French">French</option>
            <option value="Spanish">Spanish</option>
            <option value="Japanese">Japanese</option>
          </select>
        </div>

        {/* Saved Destinations */}
        <div className="mb-8 p-6 border border-[var(--border)] bg-[var(--card-bg)]">
          <label className="font-sans text-xs uppercase tracking-widest text-[var(--muted)] block mb-4">
            Saved Destinations
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {savedDestinations.map((dest) => (
              <div
                key={dest}
                className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border)] font-sans text-xs uppercase tracking-widest bg-[var(--background)]"
              >
                {dest}
                <button
                  onClick={() => handleRemoveDestination(dest)}
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--card-bg)] transition duration-200 font-sans text-xs uppercase tracking-widest">
              + Add Destination
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 border-2 border-red-300 bg-[var(--card-bg)]">
          <h3 className="font-serif text-xl text-red-700 mb-4">Danger Zone</h3>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition duration-200 font-sans font-semibold uppercase tracking-wide"
            >
              <Trash2 size={16} className="inline mr-2" />
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <p className="font-sans text-sm text-[var(--foreground)]">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 transition duration-200 font-sans font-semibold uppercase tracking-wide"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--card-bg)] transition duration-200 font-sans font-semibold uppercase tracking-wide"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
