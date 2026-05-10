"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function EditTripPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadTrip() {
      try {
        const data = await fetchApi(`/trips/${params.id}`);
        setFormData({
          name: data.name || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          description: data.description || '',
        });
        setExistingCoverUrl(data.cover_url);
      } catch (err: any) {
        setError(err.message || 'Failed to load trip');
      } finally {
        setLoading(false);
      }
    }
    loadTrip();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverPhoto(e.target.files[0]);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this journey? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      await fetchApi(`/trips/${params.id}`, { method: 'DELETE' });
      router.push('/trips');
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip');
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    
    try {
      let cover_url = existingCoverUrl;

      // Upload new cover photo if selected
      if (coverPhoto) {
        const formDataPayload = new FormData();
        formDataPayload.append('file', coverPhoto);
        
        const uploadResponse = await fetchApi('/trips/upload/cover', {
          method: 'POST',
          body: formDataPayload,
        });
        cover_url = uploadResponse.cover_url;
      }

      await fetchApi(`/trips/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          description: formData.description || null,
          cover_url: cover_url,
        }),
      });
      
      router.push(`/trips/${params.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update trip');
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] px-6 py-12 md:py-20 max-w-4xl mx-auto flex flex-col justify-center">
      {/* Header */}
      <div className="mb-16">
        <Link href="/trips" className="sans text-[10px] uppercase tracking-widest text-gray-500 hover:text-accent transition flex items-center gap-2 mb-8">
          <span>&larr;</span> Back to Itineraries
        </Link>
        <div className="w-8 h-px bg-accent mb-6"></div>
        <p className="sans text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4">Edit Details</p>
        <h1 className="serif text-5xl md:text-6xl leading-[0.95]">
          Update<br />
          <i className="text-gray-400">Journey.</i>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* Name */}
        <div>
          <label htmlFor="name" className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-4">
            Trip Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. The Rome Chronicles"
            className="w-full border-b border-black bg-transparent py-4 serif text-2xl md:text-3xl outline-none placeholder:text-gray-300 focus:border-accent transition"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label htmlFor="start_date" className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-4">
              Start Date
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              required
              value={formData.start_date}
              onChange={handleChange}
              className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none text-black focus:border-accent transition"
              style={{ colorScheme: 'light dark' }}
            />
          </div>
          <div>
            <label htmlFor="end_date" className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-4">
              End Date
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              required
              value={formData.end_date}
              onChange={handleChange}
              className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none text-black focus:border-accent transition"
              style={{ colorScheme: 'light dark' }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-4">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="A brief overview of your travel plans..."
            className="w-full border-b border-black bg-transparent py-3 sans text-sm outline-none placeholder:text-gray-400 focus:border-accent transition resize-none"
          />
        </div>

        {/* Cover Photo */}
        <div>
          <label className="sans text-[10px] uppercase tracking-widest text-gray-500 block mb-4">
            Cover Photo <span className="text-gray-400 lowercase tracking-normal">(optional)</span>
          </label>
          <div className="relative w-full h-48 border border-dashed border-gray-400 hover:border-accent transition flex flex-col items-center justify-center group cursor-pointer bg-black/5 dark:bg-white/5">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {coverPhoto ? (
              <p className="sans text-xs text-black">{coverPhoto.name}</p>
            ) : (
              <>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-accent mb-3 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="sans text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-accent transition">
                  {existingCoverUrl ? 'Click to replace existing photo' : 'Click or drag to upload photo'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 sans text-xs uppercase tracking-widest hover:text-red-700 transition disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Journey'}
          </button>
          
          <div className="flex flex-col items-end gap-2">
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={isSaving}
              className="bg-black text-white px-12 py-4 sans text-xs uppercase tracking-widest hover:bg-accent border border-black hover:border-accent transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
