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
      // Fetch the public details of the user matching the ID in the URL
      const { data, error } = await supabase
        .from('users')
        .select('id, name, bio, neighborhood, completed_tasks')
        .eq('id', params.id)
        .maybeSingle();

      if (data) {
        setNeighbor(data);
      }
      setLoading(false);
    };

    fetchNeighbor();
  }, [params.id]);

  if (loading) return <div className="min-h-screen bg-gray-100 p-8 text-center text-[#164e63] font-bold">Loading Profile...</div>;
  
  if (!neighbor) return (
    <div className="min-h-screen bg-gray-100 p-8 text-center flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Neighbor not found</h1>
      <p className="text-gray-500 mb-6">This account may have been removed or deactivated.</p>
      <button onClick={() => router.back()} className="bg-[#164e63] text-white px-6 py-2 rounded-full font-bold">Go Back</button>
    </div>
  );

  // Impact Dashboard Logic (Milestones instead of competitive leaderboards)
  const tasks = neighbor.completed_tasks || 0;
  let rank = "New Neighbor";
  let badgeIcon = "🌱";
  
  if (tasks >= 1) { rank = "Community Helper"; badgeIcon = "🤝"; }
  if (tasks >= 5) { rank = "Neighborhood Hero"; badgeIcon = "🌟"; }
  if (tasks >= 15) { rank = "Local Legend"; badgeIcon = "👑"; }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      {/* Header */}
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-b-xl mb-6 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-sm font-bold text-[#fcd34d] hover:underline">← Back</button>
        <h1 className="text-lg font-bold tracking-widest text-center flex-1">Neighbor Profile</h1>
        <div className="w-12"></div>
      </nav>

      <div className="max-w-xl mx-auto px-4 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-[#0f766e]">
          <div className="bg-[#e0f2fe] p-6 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-[#164e63] text-white rounded-full flex items-center justify-center text-4xl font-bold mb-3 shadow-lg border-4 border-white">
              {neighbor.name ? neighbor.name.charAt(0).toUpperCase() : '?'}
            </div>
            <h2 className="text-2xl font-extrabold text-[#164e63]">{neighbor.name || 'Anonymous Neighbor'}</h2>
            {neighbor.neighborhood && (
              <p className="text-[#0f766e] font-bold text-sm mt-1 flex items-center gap-1 justify-center">
                📍 {neighbor.neighborhood}
              </p>
            )}
          </div>
          
          <div className="p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {neighbor.bio || "This neighbor hasn't written a bio yet, but they are an active part of the Compass community!"}
            </p>
          </div>
        </div>

        {/* Impact Dashboard */}
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#fcd34d]">
          <h3 className="text-lg font-extrabold text-gray-800 mb-4 flex items-center gap-2">
            🌟 Community Impact
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Task Counter */}
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100 flex flex-col justify-center transition hover:shadow-md">
              <span className="text-3xl font-extrabold text-blue-600 mb-1">{tasks}</span>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Tasks Completed</span>
            </div>

            {/* Rank Badge */}
            <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-100 flex flex-col justify-center items-center transition hover:shadow-md">
              <span className="text-3xl mb-1">{badgeIcon}</span>
              <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider">{rank}</span>
            </div>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-5 font-medium italic">
            "We are all travelers shaping stronger communities together."
          </p>
        </div>

      </div>
    </div>
  );
}
