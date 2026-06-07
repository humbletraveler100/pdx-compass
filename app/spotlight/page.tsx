'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function SpotlightPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSpotlight = async () => {
      const { data, error } = await supabase
        .from('spotlight')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setAnnouncements(data);
      setLoading(false);
    };

    fetchSpotlight();
  }, []);

  if (loading) return <div className="p-8 text-center text-[#164e63] font-bold">Loading Spotlight...</div>;

  return (
    <div className="min-h-screen bg-[#fdf2f8] p-4 font-sans pb-12">
      <nav className="bg-pink-600 text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-sm font-bold text-pink-200 hover:underline">← Back</button>
        <h1 className="text-xl font-bold tracking-widest text-center flex-1">Spotlight</h1>
        <a href="/" className="text-sm font-bold text-white hover:underline">Home</a>
      </nav>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Hero */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-pink-500 text-center">
          <span className="text-4xl block mb-2">📣</span>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Community Highlights</h2>
          <p className="text-gray-600 text-sm">Official updates, events, and wins from The Humble Travelers Foundation.</p>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-pink-50 p-6 rounded-lg border border-pink-100 text-center text-pink-800 font-bold text-sm shadow-sm">
            No official announcements right now. Check back soon!
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((post) => (
              <div key={post.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col gap-3">
                
                {/* Post Header */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-xl text-[#164e63] pr-2">{post.title}</h3>
                  <span className="text-[10px] text-pink-600 font-bold uppercase tracking-wider bg-pink-50 border border-pink-100 px-2 py-1 rounded whitespace-nowrap">
                    Official
                  </span>
                </div>
                
                {/* Post Content */}
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                
                {/* Post Footer */}
                <div className="pt-3 flex justify-between items-center text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">
                  <span>{post.author_name}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
