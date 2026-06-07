'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function NeighborProfile({ params }: { params: { id: string } }) {
  const [neighbor, setNeighbor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNeighbor = async () => {
      // 1. Get the currently logged-in user
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;

      // 2. Fetch the profile being requested
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) {
        // Show profile IF it belongs to the logged-in user, OR if they set it to Public
        if (currentUserId === params.id || data.is_profile_public !== false) {
          setNeighbor(data);
        }
      }
      setLoading(false);
    };

    fetchNeighbor();
  }, [params.id]);

  if (loading) return <div className="p-8 text-center text-[#164e63] font-bold">Looking up neighbor...</div>;

  if (!neighbor) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-[#164e63] mb-2">Neighbor not found</h1>
        <p className="text-gray-500 mb-6 text-center">This account may have been removed, deactivated, or set to private.</p>
        <button onClick={() => router.back()} className="bg-[#164e63] text-white px-6 py-2 rounded-lg font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      <nav className="bg-[#0f766e] text-white p-4 shadow-md rounded-b-xl mb-6 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-sm font-bold text-[#fcd34d] hover:underline">← Back</button>
        <h1 className="text-lg font-bold tracking-widest text-center flex-1">Neighbor Profile</h1>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </nav>

      <div className="max-w-md mx-auto px-4 space-y-6">
        
        {/* Profile Hero */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-[#0f766e] flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-[#fcd34d] overflow-hidden mb-4 shadow-sm flex items-center justify-center">
            {neighbor.avatar_url ? (
              <img src={neighbor.avatar_url} alt={neighbor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 font-bold text-3xl">{neighbor.name?.charAt(0) || '?'}</span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-[#164e63] mb-1">{neighbor.name || 'Anonymous Neighbor'}</h2>
          
          {neighbor.neighborhood && (
            <span className="bg-teal-50 text-[#0f766e] px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-teal-100 mt-2">
              📍 {neighbor.neighborhood}
            </span>
          )}
        </div>

        {/* Bio */}
        {neighbor.bio && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About Me</h3>
            <p className="text-gray-700 leading-relaxed text-sm">{neighbor.bio}</p>
          </div>
        )}

        {/* Skills (Respects the Show/Hide Skills toggle) */}
        {neighbor.show_skills_publicly !== false && neighbor.skills && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Skills & Assets</h3>
            <p className="text-gray-700 leading-relaxed text-sm">{neighbor.skills}</p>
          </div>
        )}
        
        {/* Languages */}
        {neighbor.languages && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Languages</h3>
            <p className="text-gray-700 leading-relaxed text-sm">{neighbor.languages}</p>
          </div>
        )}

      </div>
    </div>
  );
}
