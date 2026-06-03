'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function IdeasBoard() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIdeasAndUser();
  }, []);

  const fetchIdeasAndUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);

    const { data, error } = await supabase
      .from('community_ideas')
      .select(`
        *,
        author:users!author_id(name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (data) setIdeas(data);
    setLoading(false);
  };

  const handlePostIdea = async () => {
    if (!user) {
      alert("Please sign in to share an idea.");
      router.push('/login');
      return;
    }
    if (!title || !description) {
      alert("Please provide a title and description.");
      return;
    }

    setSubmitting(true);
    let finalImageUrl = null;

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `idea-${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('compass-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('compass-images').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('community_ideas')
        .insert({
          author_id: user.id,
          title: title,
          description: description,
          image_url: finalImageUrl
        });

      if (insertError) throw insertError;

      alert("Idea shared successfully!");
      setShowForm(false);
      setTitle('');
      setDescription('');
      setImageFile(null);
      fetchIdeasAndUser(); 

    } catch (error: any) {
      alert(`Error posting idea: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest">Ideas Board</h1>
        <div className="space-x-4">
          <a href="/feed" className="text-sm font-bold text-gray-300 hover:text-white">Feed</a>
          <a href="/profile" className="text-sm font-bold text-[#fcd34d] hover:underline">Profile</a>
        </div>
      </nav>

      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#164e63]">Community Ideas</h2>
            <p className="text-gray-600 text-sm">Propose projects and share inspiration.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-[#164e63] text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-opacity-90"
          >
            {showForm ? 'Cancel' : '+ New Idea'}
          </button>
        </div>

        {/* Share Idea Form */}
        {showForm && (
          <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-[#fcd34d] mb-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's your idea?" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0f766e] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Explain how it helps the neighborhood..." rows={4} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0f766e] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Attach a Photo (Optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#0f766e] hover:file:bg-blue-100" />
            </div>
            <button onClick={handlePostIdea} disabled={submitting} className="w-full bg-[#fcd34d] text-[#164e63] font-bold py-2 rounded-lg text-sm hover:bg-opacity-90 shadow">
              {submitting ? 'Posting...' : 'Share Idea'}
            </button>
          </div>
        )}

        {/* Ideas Feed */}
        {loading ? (
          <p className="text-center text-[#164e63] font-bold mt-10">Loading ideas...</p>
        ) : ideas.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center border-t-4 border-[#0f766e]">
            <p className="text-[#164e63] font-bold mb-2">No ideas yet!</p>
            <p className="text-sm text-gray-500">Be the first to share a vision for the community.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {ideas.map((idea) => (
              <div key={idea.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                {idea.image_url && (
                  <div className="w-full h-48 bg-gray-100">
                    <img src={idea.image_url} alt={idea.title} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="p-5">
                  <h3 className="font-bold text-xl text-[#164e63] leading-tight mb-2">{idea.title}</h3>
                  <p className="text-gray-700 text-sm mb-4 whitespace-pre-wrap">{idea.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    {/* UPGRADED: Clickable Neighbor Link */}
                    <a href={`/neighbor/${idea.author_id}`} className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center">
                        {idea.author?.avatar_url ? (
                          <img src={idea.author.avatar_url} alt="Author" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-500 text-xs font-bold">{idea.author?.name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#0f766e] hover:underline">{idea.author?.name || 'Neighbor'}</span>
                    </a>
                    <button className="text-xs font-bold text-[#0f766e] hover:underline">
                      💬 Comment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
