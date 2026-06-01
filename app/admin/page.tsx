'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const ADMIN_EMAIL = 'thehumbletravelers@gmail.com'; 

  useEffect(() => {
    const fetchPending = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user || session.user.email !== ADMIN_EMAIL) {
        alert("Access Denied: You must be an administrator to view this page.");
        router.push('/');
        return;
      }

      const { data, error } = await supabase
        .from('requests')
        .select(`
          id, title, description, category_group, urgency, location_label, created_at,
          requester:users(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // NEW: Sound the alarm if the database throws an error!
      if (error) {
        alert("Database Error: " + error.message);
      }

      if (data) setPendingRequests(data);
      setLoading(false);
    };

    fetchPending();
  }, [router]);

  const handleModeration = async (reqId: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'open' : 'cancelled';
    
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', reqId);

    if (error) {
      alert(`Error updating request: ${error.message}`);
    } else {
      setPendingRequests(pendingRequests.filter(req => req.id !== reqId));
      alert(`Request has been ${action === 'approve' ? 'approved and is now live!' : 'rejected.'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans pb-12">
      <nav className="bg-gray-800 text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest text-red-400">Admin Moderation</h1>
        <a href="/" className="text-sm font-bold text-gray-300 hover:underline">Exit</a>
      </nav>

      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Moderation Queue</h2>
        <p className="text-gray-600 text-sm mb-6">Review pending requests before they appear on the public Community Feed.</p>

        {loading ? (
          <p className="text-center text-gray-600 font-bold mt-10">Loading queue...</p>
        ) : pendingRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center border-t-4 border-gray-400">
            <p className="text-gray-800 font-bold mb-2">Queue is empty</p>
            <p className="text-sm text-gray-500">There are no pending requests to review right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white p-5 rounded-xl shadow border-l-4 border-red-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800 leading-tight">{req.title}</h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">Pending Review</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 p-3 bg-gray-50 rounded border border-gray-200">{req.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                  <p><strong>Requester:</strong> {req.requester?.name || 'Unknown'}</p>
                  <p><strong>Category:</strong> {req.category_group}</p>
                  <p><strong>Location:</strong> {req.location_label}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleModeration(req.id, 'approve')}
                    className="flex-1 bg-green-600 text-white font-bold py-2 rounded shadow hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleModeration(req.id, 'reject')}
                    className="flex-1 bg-red-100 text-red-700 border border-red-200 font-bold py-2 rounded shadow hover:bg-red-200"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
