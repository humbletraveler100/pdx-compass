'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);

      const { data: reqData } = await supabase
        .from('requests')
        .select('*')
        .eq('requester_id', session.user.id)
        .order('created_at', { ascending: false });

      if (reqData) setMyRequests(reqData);

      const { data: claimData } = await supabase
        .from('claims')
        .select(`
          id,
          status,
          requests (
            id,
            title,
            description,
            location_label,
            status
          )
        `)
        .eq('helper_id', session.user.id)
        .order('claimed_at', { ascending: false });

      if (claimData) setMyClaims(claimData);

      setLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  // NEW: Function to handle Mark Fulfilled and Remove
  const handleUpdateRequestStatus = async (reqId: string, newStatus: string) => {
    const confirmMsg = newStatus === 'cancelled' 
      ? "Are you sure you want to remove this request?" 
      : "Awesome! Has this request been fully completed?";
      
    if (!window.confirm(confirmMsg)) return;

    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', reqId);

    if (error) {
      alert(`Error updating request: ${error.message}`);
    } else {
      // Instantly update the screen so they don't have to refresh
      setMyRequests(myRequests.map(req => 
        req.id === reqId ? { ...req, status: newStatus } : req
      ));
    }
  };

  // NEW: Temporary function for the Message button
  const handleMessageNeighbor = () => {
    alert("In-app messaging system coming soon! This will allow secure communication between neighbors.");
  };

  // NEW: Temporary function for the Edit button
  const handleEdit = () => {
    alert("Edit form coming soon! For now, you can remove this request and post a new one.");
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded border border-green-200">Open</span>;
      case 'claimed': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-200">Claimed</span>;
      case 'completed': return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border border-gray-200">Completed</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded border border-red-200">Removed</span>;
      default: return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 capitalize">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest">PDX Compass</h1>
        <a href="/" className="text-sm font-bold text-[#fcd34d] hover:underline">Home</a>
      </nav>

      <div className="max-w-md mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-[#164e63] mb-1">My Dashboard</h2>
          <p className="text-gray-600 text-sm">Manage your mutual aid activity.</p>
        </div>

        {loading ? (
          <p className="text-center text-[#164e63] font-bold">Loading your activity...</p>
        ) : (
          <>
            <section>
              <h3 className="text-lg font-bold text-[#0f766e] border-b-2 border-[#0f766e] pb-1 mb-4">Help I Need</h3>
              {myRequests.length === 0 ? (
                <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-center">
                  <p className="text-sm text-gray-500">You haven't posted any requests yet.</p>
                  <a href="/ask" className="text-[#0f766e] font-bold text-sm hover:underline mt-2 inline-block">Ask for help</a>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests.map((req) => (
                    <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#0f766e]">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-[#164e63] text-sm">{req.title}</h4>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 mb-3">{req.description}</p>
                      
                      {/* NEW: Action Buttons for Requests */}
                      <div className="flex gap-2">
                        {req.status !== 'completed' && req.status !== 'cancelled' && (
                          <>
                            <button 
                              onClick={() => handleUpdateRequestStatus(req.id, 'completed')}
                              className="flex-1 bg-[#10b981] text-white text-xs font-bold py-2 rounded shadow-sm hover:bg-opacity-90"
                            >
                              Mark Fulfilled
                            </button>
                            <button 
                              onClick={handleEdit}
                              className="flex-1 bg-gray-100 text-gray-700 border border-gray-300 text-xs font-bold py-2 rounded shadow-sm hover:bg-gray-200"
                            >
                              Edit
                            </button>
                          </>
                        )}
                        {req.status === 'open' && (
                          <button 
                            onClick={() => handleUpdateRequestStatus(req.id, 'cancelled')}
                            className="bg-red-50 text-red-600 border border-red-200 px-3 text-xs font-bold py-2 rounded shadow-sm hover:bg-red-100"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-lg font-bold text-[#b45309] border-b-2 border-[#b45309] pb-1 mb-4">Help I'm Giving</h3>
              {myClaims.length === 0 ? (
                <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-center">
                  <p className="text-sm text-gray-500">You haven't claimed any tasks yet.</p>
                  <a href="/feed" className="text-[#b45309] font-bold text-sm hover:underline mt-2 inline-block">Check the community feed</a>
                </div>
              ) : (
                <div className="space-y-3">
                  {myClaims.map((claim) => {
                    const req = claim.requests;
                    return (
                      <div key={claim.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#fcd34d]">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-[#164e63] text-sm">{req?.title || 'Unknown Request'}</h4>
                          {getStatusBadge(claim.status)}
                        </div>
                        {req?.location_label && (
                          <p className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block mt-1">📍 {req.location_label}</p>
                        )}
                        
                        {/* NEW: Wired up Message Button */}
                        <button 
                          onClick={() => router.push(`/chat/${req?.id}`)}
                          className="w-full mt-3 bg-[#164e63] text-white text-xs font-bold py-2 rounded shadow hover:bg-opacity-90"
                        >
                          Message Neighbor
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
