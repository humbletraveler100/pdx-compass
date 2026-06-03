'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function SpotlightPage() {
  const [spotlights, setSpotlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpotlights = async () => {
      const { data, error } = await supabase
        .from('spotlights')
        .select('*')
        .order('completed_at', { ascending: false });
        
      if (data) setSpotlights(data);
      setLoading(false);
    };

    fetchSpotlights();
  }, []);

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest text-[#fcd34d]">Neighborhood Spotlight</h1>
        <div className="space-x-4">
          <a href="/feed" className="text-sm font-bold text-gray-300 hover:text-white transition">Feed</a>
          <a href="/" className="text-sm font-bold text-gray-300 hover:text-white transition">Home</a>
        </div>
      </nav>

      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#164e63]">The Good News Feed</h2>
          <p className="text-gray-600 text-sm">Celebrating community victories and upcoming events.</p>
        </div>

        {loading ? (
          <p className="text-center text-[#164e63] font-bold mt-10">Loading stories...</p>
        ) : spotlights.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center border-t-4 border-[#0f766e]">
            <p className="text-[#164e63] font-bold mb-2">The spotlight is warming up!</p>
            <p className="text-sm text-gray-500">Check back soon for neighborhood success stories and events.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {spotlights.map((post) => (
              <div 
                key={post.id} 
                className={`bg-white p-6 rounded-xl shadow-md border-t-4 ${post.post_type === 'admin_event' ? 'border-[#b45309]' : 'border-[#0f766e]'}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">
                    {post.post_type === 'admin_event' ? '📢' : '🌟'}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${post.post_type === 'admin_event' ? 'text-[#b45309]' : 'text-[#0f766e]'}`}>
                    {post.post_type === 'admin_event' ? 'Community Event' : 'Neighbor Story'}
                  </span>
                </div>
                
                {post.title && (
                  <h3 className="font-bold text-xl text-[#164e63] leading-tight mb-2">
                    {post.title}
                  </h3>
                )}
                
                <p className="text-gray-700 text-base mb-4 whitespace-pre-wrap leading-relaxed">
                  {post.story}
                </p>
                
                {post.image_url && (
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-200">
                    <img src={post.image_url} alt="Spotlight" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-semibold">
                  <span>📍 {post.neighborhood || 'Portland'}</span>
                  <span>{new Date(post.completed_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
