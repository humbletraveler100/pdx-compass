'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function IdeasPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Feed Data
  const [ideas, setIdeas] = useState<any[]>([]);
  const [comments, setComments] = useState<any>({});
  const [votes, setVotes] = useState<any>({});
  
  // UI States
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // New Post State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  // Comment State
  const [newComment, setNewComment] = useState('');

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUser(session.user);
      const { data: userData } = await supabase.from('users').select('is_admin').eq('id', session.user.id).single();
      if (userData?.is_admin) setIsAdmin(true);
    }

    const { data: ideasData } = await supabase
      .from('community_ideas')
      .select('*, users(name)')
      .order('created_at', { ascending: false });
    
    if (ideasData) {
      setIdeas(ideasData);
      
      const { data: votesData } = await supabase.from('poll_votes').select('*');
      const votesMap: any = {};
      if (votesData) {
        votesData.forEach(vote => {
          if (!votesMap[vote.idea_id]) votesMap[vote.idea_id] = [];
          votesMap[vote.idea_id].push(vote);
        });
      }
      setVotes(votesMap);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `town-square/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('announcements')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('announcements')
        .getPublicUrl(filePath);

      setImageUrl(data.publicUrl);
    } catch (error: any) {
      alert(`Image upload failed: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const loadComments = async (ideaId: string) => {
    if (expandedIdeaId === ideaId) {
      setExpandedIdeaId(null);
      return;
    }
    
    const { data } = await supabase
      .from('idea_comments')
      .select('*, users(name)')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true });
      
    if (data) {
      setComments({ ...comments, [ideaId]: data });
    }
    setExpandedIdeaId(ideaId);
  };

  const submitPost = async () => {
    if (!currentUser) return router.push('/login');
    if (!newTitle.trim() || !newDescription.trim()) return alert("Title and description are required.");

    const cleanedOptions = isPoll ? pollOptions.filter(opt => opt.trim() !== '') : [];
    if (isPoll && cleanedOptions.length < 2) return alert("Polls require at least two valid options.");

    const { error } = await supabase.from('community_ideas').insert({
      user_id: currentUser.id,
      title: newTitle,
      description: newDescription,
      image_url: imageUrl || null,
      is_poll: isPoll,
      poll_options: isPoll ? cleanedOptions : []
    });

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setShowNewPostForm(false);
      setNewTitle('');
      setNewDescription('');
      setImageUrl('');
      setIsPoll(false);
      setPollOptions(['', '']);
      fetchData();
    }
  };

  const submitComment = async (ideaId: string) => {
    if (!currentUser) return router.push('/login');
    if (!newComment.trim()) return;

    const { error } = await supabase.from('idea_comments').insert({
      idea_id: ideaId,
      user_id: currentUser.id,
      content: newComment
    });

    if (!error) {
      setNewComment('');
      loadComments(ideaId);
    }
  };

  const submitVote = async (ideaId: string, optionIndex: number) => {
    if (!currentUser) return router.push('/login');

    const { error } = await supabase.from('poll_votes').insert({
      idea_id: ideaId,
      user_id: currentUser.id,
      option_index: optionIndex
    });

    if (error) {
      alert("You have already voted on this poll!");
    } else {
      fetchData();
    }
  };

  const getPollStats = (ideaId: string, optionIndex: number, optionsLength: number) => {
    const postVotes = votes[ideaId] || [];
    const totalVotes = postVotes.length;
    const optionVotes = postVotes.filter((v: any) => v.option_index === optionIndex).length;
    const percentage = totalVotes === 0 ? 0 : Math.round((optionVotes / totalVotes) * 100);
    const hasVoted = postVotes.some((v: any) => v.user_id === currentUser?.id);
    return { percentage, optionVotes, totalVotes, hasVoted };
  };

  if (loading) return <div className="p-8 text-center text-[#164e63] font-bold">Loading Town Square...</div>;

  return (
    // THEME UPDATE: Soft blue background replacing old colors
    <div className="min-h-screen bg-[#f0f9ff] p-4 font-sans pb-12">
      {/* Navbar: High-contrast Deep Indigo with Sky accents */}
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-sm font-bold text-cyan-200 hover:underline">← Back</button>
        <h1 className="text-lg font-bold tracking-widest text-center flex-1">Town Square</h1>
        <a href="/" className="text-sm font-bold text-white hover:underline">Home</a>
      </nav>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Block with Clean Action Triggers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-cyan-600 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-1">Digital Town Square</h2>
            <p className="text-gray-500 text-xs">Brainstorm initiatives and vote on active neighborhood polls.</p>
          </div>
          {currentUser ? (
            <button onClick={() => setShowNewPostForm(!showNewPostForm)} className="bg-[#0f766e] text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-opacity-90 transition text-sm whitespace-nowrap ml-4">
              {showNewPostForm ? 'Cancel' : '+ New Post'}
            </button>
          ) : (
            <button onClick={() => router.push('/login')} className="bg-[#164e63] text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-opacity-90 transition text-xs font-extrabold whitespace-nowrap ml-4">
              Log In to Post
            </button>
          )}
        </div>

        {/* Dynamic Theme Upgrade on Sticky Guidelines Card */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-xs text-gray-700 text-sm leading-relaxed">
          <h3 className="font-extrabold text-[#164e63] text-base mb-2 flex items-center gap-2">
            📢 Community Reminder: Forum Rules & Guidelines
          </h3>
          <p className="mb-2 font-semibold text-slate-800">Hello neighbors,</p>
          <p className="mb-4 text-xs text-gray-600">
            This is a quick reminder to review our community parameters. Our goal is to maintain a welcoming, respectful, and productive public square for everyone:
          </p>
          <ul className="space-y-3.5 pl-1 mb-4 text-xs">
            <li><strong>• Be Respectful and Kind:</strong> Treat all members with dignity. Direct all disagreements toward the idea, not the individual.</li>
            <li><strong>• Keep it On-Topic:</strong> Stay focused on the thread's core subject. Avoid dropping irrelevant or distracting links.</li>
            <li><strong>• Write Thoughtfully:</strong> Avoid using aggressive ALL CAPS structures. Proofread text to prevent misinterpretation.</li>
            <li><strong>• Protect Privacy:</strong> Respect personal boundaries. Never share identifying private info without explicit permissions.</li>
            <li><strong>• Zero Tolerance Policy:</strong> Direct hate speech, discrimination, harassment, or malicious spam updates are removed immediately.</li>
          </ul>
          <p className="border-t border-slate-200 pt-3 text-xs text-[#0f766e] font-bold">
            Thank you for helping us keep this space safe. For detailed conditions, review our <a href="/safety" className="underline hover:text-cyan-800">Community Forum Rules</a> template.
          </p>
        </div>

        {/* Post Form */}
        {showNewPostForm && currentUser && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h3 className="font-bold text-[#164e63] mb-4 text-lg">Post to the Town Square</h3>
            
            <input type="text" placeholder="Topic or Question Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#164e63] mb-3 text-sm" />
            <textarea placeholder="Add details or context for the neighborhood conversation..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#164e63] mb-3 text-sm" />

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Add a Cover Photo (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-[#164e63] hover:file:bg-slate-100" />
              {uploadingImage && <p className="text-xs text-gray-400 italic mt-1">Uploading image file...</p>}
              {imageUrl && (
                <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="flex items-center cursor-pointer mb-3">
                  <input type="checkbox" checked={isPoll} onChange={(e) => setIsPoll(e.target.checked)} className="mr-2 w-4 h-4 text-[#164e63]" />
                  <span className="font-bold text-sm text-slate-800">Make this an Official Poll</span>
                </label>
                
                {isPoll && (
                  <div className="space-y-2">
                    {pollOptions.map((opt, i) => (
                      <input key={i} type="text" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[i] = e.target.value;
                        setPollOptions(newOpts);
                      }} className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#164e63]" />
                    ))}
                    <button onClick={() => setPollOptions([...pollOptions, ''])} className="text-xs font-bold text-[#0f766e] hover:underline">+ Add Option</button>
                  </div>
                )}
              </div>
            )}

            <button onClick={submitPost} disabled={uploadingImage} className="w-full bg-[#164e63] text-white font-bold py-3 rounded-lg hover:bg-opacity-90 shadow disabled:opacity-50 text-sm">
              Publish Post
            </button>
          </div>
        )}

        {/* Conversation Streams */}
        {ideas.length === 0 ? (
          <div className="bg-slate-50 p-6 rounded-lg border border-gray-200 text-center text-gray-500 font-bold text-sm shadow-sm">
            The town square is quiet. Be the first to start a conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <div key={idea.id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm overflow-hidden">
                
                {idea.image_url && (
                  <div className="w-full h-48 -mx-5 -mt-5 mb-4 bg-gray-50 overflow-hidden border-b border-gray-100">
                    <img src={idea.image_url} alt={idea.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-800">{idea.title}</h3>
                  {idea.is_poll && <span className="bg-cyan-50 text-cyan-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-cyan-100 uppercase tracking-wide">📊 Poll</span>}
                </div>
                
                <p className="text-[10px] text-gray-400 font-bold mb-3 uppercase tracking-wider">
                  By {idea.users?.name || 'Neighbor'} • {new Date(idea.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">{idea.description}</p>
                
                {idea.is_poll && (
                  <div className="mb-4 space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {idea.poll_options.map((opt: string, index: number) => {
                      const stats = getPollStats(idea.id, index, idea.poll_options.length);
                      const canVote = currentUser && !stats.hasVoted;
                      return (
                        <div key={index} className="relative">
                          <button 
                            onClick={() => canVote && submitVote(idea.id, index)}
                            disabled={!canVote}
                            className={`w-full text-left p-3 rounded-lg border flex justify-between items-center relative overflow-hidden transition ${!currentUser ? 'border-slate-200 bg-slate-50 cursor-default' : stats.hasVoted ? 'border-gray-200 bg-white cursor-default' : 'border-cyan-600 bg-white hover:bg-cyan-50/50 shadow-xs'}`}
                          >
                            {stats.hasVoted && (
                              <div className="absolute left-0 top-0 bottom-0 bg-cyan-50" style={{ width: `${stats.percentage}%` }}></div>
                            )}
                            <span className="relative z-10 font-bold text-sm text-gray-700">{opt}</span>
                            {stats.hasVoted && <span className="relative z-10 text-xs font-bold text-cyan-700">{stats.percentage}%</span>}
                          </button>
                        </div>
                      );
                    })}
                    {!currentUser && (
                      <p className="text-center text-[10px] text-cyan-800 font-bold mt-1">📊 Log in to participate in this poll</p>
                    )}
                    {currentUser && getPollStats(idea.id, 0, 0).hasVoted && (
                      <p className="text-center text-xs text-gray-400 mt-2 font-bold">Total Votes: {votes[idea.id]?.length || 0}</p>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3">
                  <button onClick={() => loadComments(idea.id)} className="text-[#0f766e] text-xs font-bold hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer">
                    💬 {expandedIdeaId === idea.id ? 'Hide Comments' : 'View Conversation'}
                  </button>
                </div>

                {expandedIdeaId === idea.id && (
                  <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {(!comments[idea.id] || comments[idea.id].length === 0) ? (
                        <p className="text-xs text-gray-400 italic">No messages in this thread yet. Say hello!</p>
                      ) : (
                        comments[idea.id].map((comment: any) => (
                          <div key={comment.id} className="bg-white p-3 rounded shadow-xs border border-gray-100">
                            <span className="text-xs font-extrabold text-[#0f766e]">{comment.users?.name || 'Neighbor'}</span>
                            <p className="text-xs text-gray-600 mt-1">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {currentUser ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Reply to the neighborhood..." 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 p-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#164e63]"
                        />
                        <button onClick={() => submitComment(idea.id)} className="bg-[#164e63] text-white px-4 py-2 rounded font-bold text-xs shadow hover:bg-opacity-90">
                          Reply
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-2 bg-slate-100 border border-slate-200 rounded-lg">
                        <button onClick={() => router.push('/login')} className="text-xs font-extrabold text-cyan-800 bg-transparent border-0 cursor-pointer hover:underline">
                          👋 Log in or create an account to join this conversation
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
