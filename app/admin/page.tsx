'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const ADMIN_EMAIL = 'thehumbletravelers@gmail.com'; 

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user || session.user.email !== ADMIN_EMAIL) {
        alert("Access Denied: You must be an administrator to view this page.");
        router.push('/');
        return;
      }

      // 1. Fetch pending requests
      const { data: reqData, error: reqError } = await supabase
        .from('requests')
        .select(`
          id, title, description, category_group, urgency, location_label, created_at,
          requester:users!requester_id(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (reqError) alert("Requests Error: " + reqError.message);
      if (reqData) setPendingRequests(reqData);

      // 2. Fetch pending reports
      const { data: repData, error: repError } = await supabase
        .from('reports')
        .select(`
          id, reason, created_at,
          request:requests(id, title, description),
          reporter:users!reporter_id(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (repError) alert("Reports Error: " + repError.message);
      if (repData) setPendingReports(repData);

      setLoading(false);
    };

    fetchAdminData();
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
      alert(`Request has been ${action === 'approve' ? 'approved' : 'rejected'}.`);
    }
  };

  const handleReportAction = async (reportId: string, reqId: string, action: 'dismiss' | 'remove_post') => {
    if (!window.confirm(`Are you sure you want to ${action === 'dismiss' ? 'dismiss this report' : 'remove this post from the feed'}?`)) return;

    // First, mark the report as reviewed so it leaves the queue
    const { error: repError } = await supabase
      .from('reports')
      .update({ status: 'reviewed' })
      .eq('id', reportId);

    if (repError) {
      alert(`Error updating report: ${repError.message}`);
      return;
    }

    // If removing the post, update the original request status to cancelled
    if (action === 'remove_post') {
      const { error: reqError } = await supabase
        .from('requests')
        .update({ status: 'cancelled' })
        .eq('id', reqId);
      
      if (reqError) alert(`Error removing post: ${reqError.message}`);
    }

    setPendingReports(pendingReports.filter(rep => rep.id !== reportId));
    alert("Report handled successfully.");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans pb-12">
      <nav className="bg-gray-800 text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest text-red-400">Admin Moderation</h1>
        <a href="/" className="text-sm font-bold text-gray-300 hover:underline">Exit</a>
      </nav>

      <div className="max-w-2xl mx-auto space-y-10">
        
        {/* Flagged Posts Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🚨 Flagged Posts
          </h2>
          {loading ? (
            <p className="text-gray-600 font-bold">Loading...</p>
          ) : pendingReports.length === 0 ? (
             <div className="bg-white p-6 rounded-xl shadow border-t-4 border-gray-400">
               <p className="text-gray-500 text-sm">No pending reports.</p>
             </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((rep) => (
                <div key={rep.id} className="bg-white p-5 rounded-xl shadow border-l-4 border-purple-500">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-red-600">Reason: {rep.reason}</h3>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4 text-sm text-gray-600">
                    <p className="font-bold mb-1 text-gray-800">Original Post: {rep.request?.title}</p>
                    <p>{rep.request?.description}</p>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-4">Reported by: {rep.reporter?.name || 'Unknown User'}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleReportAction(rep.id, rep.request?.id, 'dismiss')} 
                      className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded shadow hover:bg-gray-300"
                    >
                      Dismiss Report
                    </button>
                    <button 
                      onClick={() => handleReportAction(rep.id, rep.request?.id, 'remove_post')} 
                      className="flex-1 bg-red-600 text-white font-bold py-2 rounded shadow hover:bg-red-700"
                    >
                      Remove Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Moderation Queue Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📝 New Post Queue
          </h2>
          {loading ? (
            <p className="text-gray-600 font-bold">Loading...</p>
          ) : pendingRequests.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow border-t-4 border-gray-400">
              <p className="text-gray-500 text-sm">No pending requests to review right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-xl shadow border-l-4 border-yellow-500">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">{req.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 p-3 bg-gray-50 rounded border border-gray-200">{req.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                    <p><strong>Requester:</strong> {req.requester?.name || 'Unknown'}</p>
                    <p><strong>Category:</strong> {req.category_group}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleModeration(req.id, 'approve')} className="flex-1 bg-green-600 text-white font-bold py-2 rounded shadow hover:bg-green-700">Approve</button>
                    <button onClick={() => handleModeration(req.id, 'reject')} className="flex-1 bg-red-100 text-red-700 border border-red-200 font-bold py-2 rounded shadow hover:bg-red-200">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
