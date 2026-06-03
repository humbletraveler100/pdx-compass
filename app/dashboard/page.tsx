'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    // Fetch user profile to get their neighborhood for the Spotlight
    const { data: profile } = await supabase
      .from('users')
      .select('neighborhood')
      .eq('id', session.user.id)
      .single();
      
    setUserProfile(profile);

    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('requester_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) setMyRequests(data);
    setLoading(false);
  };

  const handleCompleteAndSpotlight = async (reqId: string) => {
    // 1. The Prompt: Ask for the story
    const story = window.prompt("Marking this as completed! Add a short story about this exchange to feature it in the Neighborhood Spotlight (Optional):");

    if (story === null) return; // User clicked Cancel

    try {
      // 2. Update Requests.status = completed
      const { error: updateError } = await supabase
        .from('requests')
        .update({ status: 'completed' })
        .eq('id', reqId);

      if (updateError) throw updateError;

      // 3. Create New Spotlight record (if they wrote a story)
      if (story.trim() !== "") {
        const { error: spotlightError } = await supabase
          .from('spotlights')
          .insert({
            request_id: reqId,
            story: story,
            neighborhood: userProfile?.neighborhood || 'Portland'
          });
          
        if (spotlightError) throw spotlightError;
        alert("Awesome! Request completed and your story was added to the Spotlight.");
      } else {
        alert("Request marked as completed.");
      }

      // Refresh the dashboard list
      fetchMyData();

    } catch (error: any) {
      alert(`Error updating request: ${error.message}`);
    }
  };

  const handleRemove = async (reqId: string) => {
    if (!window.confirm("Are you sure you want to completely remove this request?")) return;
    
    const { error } = await supabase
      .from('requests')
      .update({ status: 'cancelled' })
      .eq('id', reqId);

    if (error) {
      alert(`Error removing request: ${error.message}`);
    } else {
      fetchMyData();
    }
  };

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest">PDX Compass</h1>
        <a href="/" className="text-sm font-bold text-[#fcd34d] hover:underline">Home</a>
      </nav>

      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#164e63]">My Dashboard</h2>
          <p className="text-gray-600 text-sm">Manage your mutual aid activity.</p>
        </div>

        <h3 className="text-xl font-bold text-[#0f766e] border-b-2 border-[#0f766e] pb-2 mb-4">Help I Need</h3>
        
        {loading ? (
          <p className="text-center text-[#164e63] font-bold">Loading your activity...</p>
        ) : myRequests.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 text-center">
            <p className="text-gray-500">You haven't posted any requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.map((req) => (
              <div key={req.id} className="bg-white p-5 rounded-xl shadow border-l-4 border-[#0f766e]">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-[#164e63] text-lg">{req.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded font-semibold capitalize ${req.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-4 truncate">{req.description}</p>
                
                {req.status === 'open' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCompleteAndSpotlight(req.id)}
                      className="flex-1 bg-[#10b981] text-white font-bold py-2 rounded shadow hover:bg-[#059669]"
                    >
                      Mark Fulfilled
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded shadow border border-gray-200">
                      Edit
                    </button>
                    <button 
                      onClick={() => handleRemove(req.id)}
                      className="flex-1 bg-red-50 text-red-600 font-bold py-2 rounded shadow border border-red-200 hover:bg-red-100"
                    >
                      Remove
                    </button>
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
