'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function CommunityFeed() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRequestsAndUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (data) {
        setRequests(data);
      }
      setLoading(false);
    };

    fetchRequestsAndUser();
  }, []);

  const handleClaim = async (reqId: string) => {
    if (!user) {
      alert("Please sign in to help your neighbors!");
      router.push('/login');
      return;
    }

    const { error } = await supabase.rpc('claim_request', { target_request_id: reqId });

    if (error) {
      alert(`Error claiming request: ${error.message}`);
    } else {
      // Instantly remove the claimed request from the screen
      setRequests(requests.filter(req => req.id !== reqId));
      alert("Awesome! You've claimed this request. The neighbor has been notified.");
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest">PDX Compass</h1>
        <a href="/" className="text-sm font-bold text-[#fcd34d] hover:underline">Home</a>
      </nav>

      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#164e63]">Community Board</h2>
            <p className="text-gray-600 text-sm">See where your neighbors need a hand.</p>
          </div>
          <a href="/ask" className="bg-[#164e63] text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-opacity-90">
            + Ask
          </a>
        </div>

        {loading ? (
          <p className="text-center text-[#164e63] font-bold mt-10">Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center border-t-4 border-[#0f766e]">
            <p className="text-[#164e63] font-bold mb-2">It's quiet out there!</p>
            <p className="text-sm text-gray-500">There are no open requests right now. Check back later or post your own.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white p-5 rounded-xl shadow-md border-l-4 border-[#0f766e]">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-[#164e63] leading-tight">{req.title}</h3>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{req.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200 capitalize">
                    {req.category_group}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded border capitalize font-semibold ${getUrgencyColor(req.urgency)}`}>
                    {req.urgency} Urgency
                  </span>
                  {req.location_label && (
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-200">
                      📍 {req.location_label}
                    </span>
                  )}
                </div>

                {/* The wired-up button! */}
                {user?.id === req.requester_id ? (
                  <button disabled className="w-full bg-gray-200 text-gray-500 font-bold py-2 rounded-lg text-sm cursor-not-allowed">
                    This is your request
                  </button>
                ) : (
                  <button 
                    onClick={() => handleClaim(req.id)}
                    className="w-full bg-[#fcd34d] text-[#164e63] font-bold py-2 rounded-lg text-sm hover:bg-opacity-90 transition shadow-sm"
                  >
                    Offer to Help
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
