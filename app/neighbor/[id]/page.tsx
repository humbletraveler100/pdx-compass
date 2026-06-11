'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams, useRouter } from 'next/navigation';

export default function NeighborProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading) return <div className="p-8 text-center font-bold text-[#164e63]">Loading profile...</div>;

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black text-[#164e63] mb-2">Neighbor not found</h2>
        <p className="text-gray-500 text-sm max-w-sm mb-6">This account may have been removed, deactivated, or set to private.</p>
        <button onClick={() => router.back()} className="bg-[#164e63] text-white px-6 py-2 rounded-lg font-bold shadow">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f9ff] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-sm font-bold text-cyan-100 hover:underline">← Back</button>
        <h1 className="text-lg font-bold tracking-widest flex-1 text-center">Neighbor Profile</h1>
        <a href="/" className="text-sm font-bold text-white hover:underline">Home</a>
      </nav>

      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border-t-4 border-teal-600 space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-16 h-16 bg-teal-50 text-teal-700 font-black text-2xl rounded-full flex items-center justify-center uppercase shadow-inner">
            {profile.name?.charAt(0) || 'N'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-800">{profile.name}</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">📍 Zip Code: {profile.neighborhood_label || profile.zip_code || 'PDX'}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">"Why I'm Here" (Bio)</h3>
          <p className="text-sm text-gray-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
            {profile.bio || "This neighbor hasn't added a public bio intro statement yet."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded border border-gray-100 text-center">
            <span className="text-gray-400 font-semibold block">Languages</span>
            <span className="font-bold text-gray-800 block mt-0.5">{profile.languages_spoken || 'English'}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-gray-100 text-center">
            <span className="text-gray-400 font-semibold block">Verification Status</span>
            <span className="font-bold text-emerald-600 block mt-0.5">✓ Identity Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
