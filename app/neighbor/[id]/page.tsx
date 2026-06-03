'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams, useRouter } from 'next/navigation';

export default function NeighborProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [neighbor, setNeighbor] = useState<any>(null);
  const [recentIdeas, setRecentIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNeighborData = async () => {
      if (!id) return;
      
      // 1. Fetch the Neighbor's Profile Info
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, avatar_url, neighborhood, bio, skills, show_skills_publicly, is_profile_public, completed_tasks')
        .eq('id', id)
        .single();

      if (userData) {
        setNeighbor(userData);
        
        // 2. Fetch Contribution Stream ONLY if profile is public
        if (userData.is_profile_public) {
          const { data: ideasData } = await supabase
            .from('community_ideas')
            .select('id, title, created_at')
            .eq('author_id', id)
            .order('created_at', { ascending: false })
            .limit(3);
            
          if (ideasData) setRecentIdeas(ideasData);
        }
      }
      setLoading(false);
    };

    fetchNeighborData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-[#164e63] font-bold">Loading Neighbor...</div>;
  if (!neighbor) return <div className="p-8 text-center text-gray-500 font-bold">Neighbor not found.</div>;

  // PRIVACY LOCK: Stop rendering if they turned off their public profile
  if (!neighbor.is_profile_public) {
    return (
      <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans flex flex-col items-center pt-20">
        <div className="w-24 h-24 rounded-full bg-gray-300 mb-4 flex items-center justify-center text-4xl shadow-inner">🔒</div>
        <h2 className="text-2xl font-bold text-[#164e63] mb-2">{neighbor.name || 'Anonymous Neighbor'}</h2>
        <p className="text-gray-600 text-sm font-medium">This neighbor has chosen to keep their profile private.</p>
        <button onClick={() => router.back()} className="mt-6 text-[#0f766e] font-bold underline">Return to Feed</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans pb-12">
      {/* Navigation */}
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-sm font-bold text-[#fcd34d] hover:underline">← Back</button>
        <h1 className="text-xl font-bold tracking-widest text-center flex-1">Neighbor</h1>
        <div className="w-12"></div> {/* Visual Spacer */}
      </nav>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* Core Identity Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#0f766e] text-center relative mt-8">
          <button className="absolute top-4 right-4 text-[#0f766e] text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition shadow-sm">
            💬 Message
          </button>
          
          <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden mx-auto -mt-14 mb-4 flex items-center justify-center relative z-10 bg-white">
            {neighbor.avatar_url ? (
              <img src={neighbor.avatar_url} alt={neighbor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 font-bold text-4xl">{neighbor.name?.charAt(0) || '?'}</span>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-[#164e63] mb-1">{neighbor.name}</h2>
          <p className="text-sm font-semibold text-gray-500 mb-4">📍 {neighbor.neighborhood || 'Portland Resident'}</p>
          
          {neighbor.bio && (
            <div className="bg-gray-50 p-4 rounded-lg italic text-gray-700 text-sm border border-gray-100 shadow-inner">
              "{neighbor.bio}"
            </div>
          )}
        </div>

        {/* Visual Impact Dashboard */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#fef3c7] p-4 rounded-xl border border-[#fcd34d] shadow-sm text-center">
            <span className="text-3xl block mb-1">🌟</span>
            <span className="text-2xl font-bold text-[#b45309] block">{neighbor.completed_tasks || 0}</span>
            <span className="text-[10px] font-bold text-[#78350f] uppercase tracking-wider">Completed Tasks</span>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm text-center">
            <span className="text-3xl block mb-1">🔥</span>
            <span className="text-2xl font-bold text-blue-800 block">1</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Week Streak</span>
          </div>
        </div>

        {/* Skills & Assets (Conditional based on Privacy Toggle) */}
        {neighbor.show_skills_publicly && neighbor.skills && (
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#0f766e]">
            <h3 className="font-bold text-[#164e63] mb-3 flex items-center gap-2">🛠️ Skills Offered</h3>
            <div className="flex flex-wrap gap-2">
              {neighbor.skills.split(',').map((skill: string, index: number) => (
                <span key={index} className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Public Contribution Stream */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold text-[#164e63] mb-4 flex items-center gap-2">🌱 Recent Ideas</h3>
          {recentIdeas.length === 0 ? (
            <p className="text-sm text-gray-500 italic">This neighbor hasn't shared any ideas yet.</p>
          ) : (
            <div className="space-y-3">
              {recentIdeas.map((idea) => (
                <div key={idea.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <p className="font-semibold text-gray-800 text-sm leading-tight mb-1">{idea.title}</p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{new Date(idea.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
