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
      // Get the logged-in user
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser(session.user);
      }

      // Fetch only "open" requests for the feed
      const { data } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (data) setRequests(data);
      setLoading(false);
    };

    fetchFeed();
  }, []);

  const handleOfferHelp = async (requestOwnerId: string, requestTitle: string) => {
    if (!currentUser) {
      alert("Please sign in to offer help.");
      router.push('/login');
      return;
    }

    if (currentUser.id === requestOwnerId) {
      alert("You can't offer to help yourself on your own request!");
      return;
    }

    const confirmHelp = window.confirm("Would you like to notify this neighbor that you can help?");
    if (!confirmHelp) return;

    // Fetch the helper's profile name
    const { data: helperData } = await supabase
      .from('users')
      .select('name')
      .eq('id', currentUser.id)
      .maybeSingle();
    
    const helperName = helperData?.name || 'A neighbor';
    const helperEmail = currentUser.email;

    // Draft the notification message
    const message = `${helperName} (${helperEmail}) has offered to help with your request: "${requestTitle}". Send them an email to coordinate safely!`;

    // Drop it into the user's Alerts inbox
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
    const confirmFlag = window.confirm("Report this post for violating community safety standards?");
    if (!confirmFlag) return;

    await supabase.from('reports').insert({
      post_id: postId,
      reason: 'Flagged from Community Feed'
    });
    alert("Post flagged. An admin will review it shortly.");
  };

  if (loading) return <div className="p-8 text-center text-[#164e63] font-bold">Loading Community Feed...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      <nav className="bg-[#0f766e] text-white p-4 shadow-md rounded-b-xl mb-6 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-sm font-bold text-[#fcd34d] hover:underline">← Back</button>
        <h1 className="text-lg font-bold tracking-widest text-center flex-1">Community Feed</h1>
        <a href="/" className="text-sm font-bold text-white hover:underline">Home</a>
      </nav>

      <div className="max-w-2xl mx-auto px-4 space-y-6">
        
        {/* Feed Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-[#0f766e] flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Open Requests</h2>
            <p className="text-gray-600 text-sm">Step up and help a neighbor in need.</p>
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
            {requests.map((req) => (
              <div key={req.id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                
                {/* Top Row: Title & Flag Button */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-[#164e63]">{req.title}</h3>
                  <button onClick={() => flagPost(req.id)} className="text-gray-400 hover:text-red-500 text-xs font-bold transition" title="Report Post">
                    🚩 Flag
                  </button>
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-700 mb-4">{req.description}</p>
                
                {/* Action Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-gray-100 pt-3">
                  
                  {/* Dynamic Button Rendering */}
                  {currentUser?.id !== req.user_id ? (
                    <button 
                      onClick={() => handleOfferHelp(req.user_id, req.title)} 
                      className="w-full sm:w-auto bg-[#fcd34d] text-[#78350f] px-5 py-2 rounded-lg font-bold shadow-sm hover:bg-opacity-90 text-sm transition flex items-center justify-center gap-2"
                    >
                      <span>🤝</span> Offer to Help
                    </button>
                  ) : (
                    <div className="w-full sm:w-auto bg-gray-100 text-gray-500 px-5 py-2 rounded-lg font-bold text-sm text-center border border-gray-200">
                      Your Request
                    </div>
                  )}

                  <a href={`/neighbor/${req.user_id}`} className="text-xs text-[#0f766e] font-bold hover:underline self-end sm:self-auto">
                    View Neighbor Profile
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
