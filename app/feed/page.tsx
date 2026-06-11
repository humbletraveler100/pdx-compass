'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFeed = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser(session.user);
      }

      const { data } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (data) setRequests(data);
      loadingCacheFix();
    };

    fetchFeed();
  }, []);

  const loadingCacheFix = () => {
    setTimeout(() => setLoading(false), 100);
  };

  const handleOfferHelp = async (requestOwnerId: string, requestTitle: string) => {
    if (!currentUser) {
      alert("Please sign in or create an account to offer help to your neighbors.");
      router.push('/login');
      return;
    }

    if (currentUser.id === requestOwnerId) {
      alert("You can't offer to help yourself on your own request!");
      return;
    }

    const confirmHelp = window.confirm("Would you like to notify this neighbor that you can help?");
    if (!confirmHelp) return;

    const { data: helperData } = await supabase
      .from('users')
      .select('name')
      .eq('id', currentUser.id)
      .maybeSingle();

    const helperName = helperData?.name || 'A neighbor';
    const helperEmail = currentUser.email;

    const message = `${helperName} (${helperEmail}) has offered to help with your request: "${requestTitle}". Send them an email to coordinate safely!`;

    const { error } = await supabase.from('notifications').insert({
      user_id: requestOwnerId,
      message: message
    });

    if (!error) {
      alert("✅ Notification sent! The neighbor will see your offer in their Alerts inbox.");
    } else {
      alert("There was an error sending your offer. Please try again.");
    }
  };

  const flagPost = async (postId: string) => {
    if (!currentUser) {
      alert("Please sign in to report community violations.");
      return;
    }
    const confirmFlag = window.confirm("Report this post for violating community safety standards?");
    if (!confirmFlag) return;

    await supabase.from('reports').insert({
      post_id: postId,
      reason: 'Flagged from Community Feed'
    });
    alert("Post flagged. An admin will review it shortly.");
  };

  const getTagStyle = (tag: string) => {
    switch (tag?.toLowerCase()) {
      case 'borrow':
      case 'borrow tools':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'food':
      case 'food access':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'transportation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pet care':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'small repairs':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <div className="p-8 text-center text-[#0f766e] font-bold">Loading Community Feed...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      <nav className="bg-[#0f766e] text-white p-4 shadow-md rounded-b-xl mb-6 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-sm font-bold text-[#fcd34d] hover:underline">← Back</button>
        <h1 className="text-lg font-bold tracking-widest text-center flex-1">Community Feed</h1>
        <a href="/" className="text-sm font-bold text-white hover:underline">Home</a>
      </nav>

      <div className="max-w-2xl mx-auto px-4 space-y-6">

        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-[#0f766e] flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Open Requests</h2>
            <p className="text-gray-600 text-sm">Requests for assistance — volunteer today.</p>
          </div>
          <a href="/ask" className="bg-[#0f766e] text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-opacity-90 transition text-sm text-center">
            Ask for<br/>Help
          </a>
        </div>

        {requests.length === 0 ? (
          <div className="bg-teal-50 p-6 rounded-lg border border-teal-100 text-center text-teal-800 font-bold text-sm shadow-sm">
            No open requests right now. The community is caught up!
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              // Ensure we check against correct database columns: user_id or author_id
              const matchId = req.user_id || req.author_id;
              const isOwnPost = currentUser && currentUser.id === matchId;

              return (
                <div key={req.id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition relative overflow-hidden">

                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-lg text-[#164e63]">{req.title}</h3>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getTagStyle(req.category_tag || 'General')}`}>
                        {req.category_tag || 'General'}
                      </span>
                    </div>
                    <button onClick={() => flagPost(req.id)} className="text-gray-400 hover:text-red-500 text-xs font-bold transition whitespace-nowrap" title="Report Post">
                      🚩 Flag
                  </button>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">{req.description}</p>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-gray-100 pt-3">
                    
                    {/* FIXED: Completely remove "Offer to help" button if it's your own post */}
                    {!isOwnPost ? (
                      <button
                        onClick={() => handleOfferHelp(matchId, req.title)}
                        className="w-full sm:w-auto bg-[#fcd34d] text-[#78350f] px-5 py-2 rounded-lg font-bold shadow-sm hover:bg-opacity-90 text-sm transition flex items-center justify-center gap-2"
                      >
                        <span>🤝</span> Offer to Help
                      </button>
                    ) : (
                      <div className="w-full sm:w-auto bg-slate-100 text-slate-500 px-5 py-2 rounded-lg font-bold text-sm text-center border border-slate-200 uppercase tracking-wider text-xs">
                        Your Request
                      </div>
                    )}

                    <button 
                      onClick={() => currentUser ? router.push(`/neighbor/${matchId}`) : alert("Please sign in to view identity profiles.")}
                      className="text-xs text-[#0f766e] font-bold hover:underline bg-transparent border-0 cursor-pointer self-end sm:self-auto"
                    >
                      View Neighbor Profile
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
