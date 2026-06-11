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
    <div className="min-h-screen bg-[#fdf2f8] p-4 font-sans pb-12">
      <nav className="bg-[#ca8a04] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-sm font-bold text-yellow-100 hover:underline">← Back</button>
        <h1 className="text-xl font-bold tracking-widest text-center flex-1">Town Square</h1>
        <a href="/" className="text-sm font-bold text-white hover:underline">Home</a>
      </nav>

      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-[#ca8a04] flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Digital Town Square</h2>
            <p className="text-gray-600 text-sm">Brainstorm, discuss initiatives, and vote on community polls.</p>
          </div>
          {currentUser ? (
            <button onClick={() => setShowNewPostForm(!showNewPostForm)} className="bg-[#ca8a04] text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-opacity-90 transition text-sm whitespace-nowrap ml-2">
              {showNewPostForm ? 'Cancel' : '+ New Post'}
            </button>
          ) : (
            <button onClick={() => router.push('/login')} className="bg-[#ca8a04] text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-opacity-90 transition text-sm whitespace-nowrap ml-2">
              Log In to Post
            </button>
          )}
        </div>

        {/* Permanent Sticky Rules Callout Container */}
        <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-xl shadow-sm text-gray-800 text-sm leading-relaxed">
          <h3 className="font-extrabold text-amber-900 text-base mb-2 flex items-center gap-2">
            📢 Community Reminder: Discussion Board Rules & Guidelines
          </h3>
          <p className="mb-3 font-medium text-amber-950">Hello everyone,</p>
          <p className="mb-4 text-gray-700">
            This is a quick, friendly reminder to review our community communication rules. Our goal is to maintain a welcoming, respectful, and productive space for everyone. Please keep the following guidelines in mind when participating in discussions:
          </p>
          <ul className="space-y-3 pl-1 mb-4 text-gray-700">
            <li><strong>• Be Respectful and Kind:</strong> Treat all members with dignity. Direct all disagreements toward the idea, not the individual. Name-calling, personal attacks, and belittling comments are never permitted.</li>
            <li><strong>• Keep it On-Topic:</strong> Stay focused on the thread's subject. Avoid posting irrelevant links, thoughts, or pictures that might dilute the value of the conversation.</li>
            <li><strong>• Write Clearly and Thoughtfully:</strong> Avoid using ALL CAPS, as it is considered shouting. Proofread your posts for clarity, and avoid excessive sarcasm since written text can easily be misinterpreted.</li>
            <li><strong>• Protect Privacy:</strong> Respect the privacy of your peers. Do not share screenshots, personal information, or copyrighted material without obtaining explicit permission first.</li>
            <li><strong>• Zero Tolerance for Hate/Spam:</strong> Content containing hate speech, discrimination, harassment, or unauthorized self-promotion/spam will be removed immediately.</li>
          </ul>
          <p className="border-t border-amber-200 pt-3 text-xs text-amber-900 font-bold">
            Thank you for helping us keep this space safe, helpful, and engaging for everyone. For the full list of our community guidelines, please review the <a href="/safety" className="underline hover:text-amber-700">Community Forum Rules</a> page.
          </p>
        </div>

        {/* New Post Form */}
        {showNewPostForm && currentUser && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-yellow-200">
            <h3 className="font-bold text-[#ca8a04] mb-4 text-lg">Post to the Town Square</h3>
            
            <input type="text" placeholder="Topic or Question Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#ca8a04] mb-3" />
            <textarea placeholder="Add details or context for the neighborhood conversation..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#ca8a04] mb-3" />

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Add a Cover Photo (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-[#ca8a04] hover:file:bg-yellow-100" />
              {uploadingImage && <p className="text-xs text-gray-500 italic mt-1">Uploading image...</p>}
              {imageUrl && (
                <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <label className="flex items-center cursor-pointer mb-3">
                  <input type="checkbox" checked={isPoll} onChange={(e) => setIsPoll(e.target.checked)} className="mr-2 w-4 h-4 text-[#ca8a04]" />
                  <span className="font-bold text-sm text-[#854d0e]">Make this an Official Poll</span>
                </label>
                
                {isPoll && (
                  <div className="space-y-2">
                    {pollOptions.map((opt, i) => (
                      <input key={i} type="text" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[i] = e.target.value;
                        setPollOptions(newOpts);
                      }} className="w-full p-2 border border-yellow-200 rounded text-sm focus:outline-none focus:border-[#ca8a04]" />
                    ))}
                    <button onClick={() => setPollOptions([...pollOptions, ''])} className="text-xs font-bold text-[#ca8a04] hover:underline">+ Add Option</button>
                  </div>
                )}
              </div>
            )}

            <button onClick={submitPost} disabled={uploadingImage} className="w-full bg-[#ca8a04] text-white font-bold py-3 rounded-lg hover:bg-opacity-90 shadow disabled:opacity-50">
              Publish Post
            </button>
          </div>
        )}

        {/* Feed */}
        {ideas.length === 0 ? (
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 text-center text-yellow-800 font-bold text-sm shadow-sm">
            The town square is quiet. Be the first to start a conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <div key={idea.id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm overflow-hidden">
                
                {idea.image_url && (
                  <div className="w-full h-48 -mx-5 -mt-5 mb-4 bg-gray-100 overflow-hidden border-b border-gray-100">
                    <img src={idea.image_url} alt={idea.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-gray-800">{idea.title}</h3>
                  {idea.is_poll && <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">📊 Official Poll</span>}
                </div>
                
                <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">
                  By {idea.users?.name || 'Neighbor'} • {new Date(idea.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{idea.description}</p>
                
                {idea.is_poll && (
                  <div className="mb-4 space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {idea.poll_options.map((opt: string, index: number) => {
                      const stats = getPollStats(idea.id, index, idea.poll_options.length);
                      const canVote = currentUser && !stats.hasVoted;
                      return (
                        <div key={index} className="relative">
                          <button 
                            onClick={() => canVote && submitVote(idea.id, index)}
                            disabled={!canVote}
                            className={`w-full text-left p-3 rounded-lg border flex justify-between items-center relative overflow-hidden transition ${!currentUser ? 'border-gray-200 bg-gray-50 cursor-default' : stats.hasVoted ? 'border-gray-300 bg-white cursor-default' : 'border-[#ca8a04] bg-white hover:bg-yellow-50 shadow-sm'}`}
                          >
                            {stats.hasVoted && (
                              <div className="absolute left-0 top-0 bottom-0 bg-yellow-100" style={{ width: `${stats.percentage}%` }}></div>
                            )}
                            <span className="relative z-10 font-bold text-sm text-gray-800">{opt}</span>
                            {stats.hasVoted && <span className="relative z-10 text-xs font-bold text-gray-500">{stats.percentage}%</span>}
                          </button>
                        </div>
                      );
                    })}
                    {!currentUser && (
                      <p className="text-center text-[11px] text-amber-800 font-bold mt-1">📊 Log in to vote on this neighborhood poll</p>
                    )}
                    {currentUser && getPollStats(idea.id, 0, 0).hasVoted && (
                      <p className="text-center text-xs text-gray-400 mt-2 font-bold">Total Votes: {votes[idea.id]?.length || 0}</p>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3">
                  <button onClick={() => loadComments(idea.id)} className="text-[#ca8a04] text-sm font-bold hover:underline flex items-center gap-1">
                    💬 {expandedIdeaId === idea.id ? 'Hide Comments' : 'View Conversation'}
                  </button>
                </div>

                {expandedIdeaId === idea.id && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {(!comments[idea.id] || comments[idea.id].length === 0) ? (
                        <p className="text-xs text-gray-500 italic">No messages in this thread yet. Say hello!</p>
                      ) : (
                        comments[idea.id].map((comment: any) => (
                          <div key={comment.id} className="bg-white p-3 rounded shadow-sm border border-gray-100">
                            <span className="text-xs font-extrabold text-[#ca8a04]">{comment.users?.name || 'Neighbor'}</span>
                            <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* FIXED: Toggle comment box input vs sign in badge hook */}
                    {currentUser ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Reply to the neighborhood..." 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#ca8a04]"
                        />
                        <button onClick={() => submitComment(idea.id)} className="bg-[#ca8a04] text-white px-4 py-2 rounded font-bold text-sm shadow hover:bg-opacity-90">
                          Reply
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <button onClick={() => router.push('/login')} className="text-xs font-extrabold text-[#ca8a04] bg-transparent border-0 cursor-pointer hover:underline">
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
