'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Admin Announcement State
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceStory, setAnnounceStory] = useState('');
  const [announceType, setAnnounceType] = useState('admin_event');
  const [posting, setPosting] = useState(false);

  const ADMIN_EMAIL = 'thehumbletravelers@gmail.com'; 

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user || session.user.email !== ADMIN_EMAIL) {
        alert("Access Denied: You must be an administrator to view this page.");
        router.push('/');
        return;
      }

      // Fetch pending requests
      const { data: reqData } = await supabase
        .from('requests')
        .select('id, title, description, category_group, urgency, location_label, created_at, requester:users!requester_id(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (reqData) setPendingRequests(reqData);

      // Fetch pending reports
      const { data: repData } = await supabase
        .from('reports')
        .select('id, reason, created_at, request:requests(id, title, description), reporter:users!reporter_id(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (repData) setPendingReports(repData);

      setLoading(false);
    };

    fetchAdminData();
  }, [router]);

  const handleAdminPost = async () => {
    if (!announceTitle || !announceStory) {
      alert("Please provide both a title and details.");
      return;
    }
    
    setPosting(true);
    const { error } = await supabase
      .from('spotlights')
      .insert({
        title: announceTitle,
        story: announceStory,
        post_type: announceType,
        neighborhood: 'Admin Broadcast'
      });

    if (error) {
      alert(`Error posting: ${error.message}`);
    } else {
      alert("Success! Your post has been published.");
      setAnnounceTitle('');
      setAnnounceStory('');
    }
    setPosting(false);
  };

  const handleModeration = async (reqId: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'open' : 'cancelled';
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

    const { error } = await supabase.from('requests').update({ status: newStatus }).eq('id', reqId);
    if (!error) {
      setPendingRequests(pendingRequests.filter(req => req.id !== reqId));
    }
  };

  const handleReportAction = async (reportId: string, reqId: string, action: 'dismiss' | 'remove_post') => {
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    await supabase.from('reports').update({ status: 'reviewed' }).eq('id', reportId);
    if (action === 'remove_post') {
      await supabase.from('requests').update({ status: 'cancelled' }).eq('id', reqId);
    }
    setPendingReports(pendingReports.filter(rep => rep.id !== reportId));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans pb-12">
      <nav className="bg-gray-800 text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest text-red-400">Admin Command Center</h1>
        <a href="/" className="text-sm font-bold text-gray-300 hover:underline">Exit</a>
      </nav>

      <div className="max-w-2xl mx-auto space-y-10">

        {/* Admin Megaphone Section */}
        <section className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">📢 Broadcast to Community</h2>
          <div className="space-y-4">
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={announceType === 'admin_event'} onChange={() => setAnnounceType('admin_event')} />
                <span className="font-bold text-gray-700">Community Event</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={announceType === 'admin_spotlight'} onChange={() => setAnnounceType('admin_spotlight')} />
                <span className="font-bold text-gray-700">Official Spotlight</span>
              </label>
            </div>
            
            <input 
              type="text" placeholder="Title of Event or Spotlight" value={announceTitle} onChange={(e) => setAnnounceTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea 
              placeholder="Provide the details, dates, and story here..." value={announceStory} onChange={(e) => setAnnounceStory(e.target.value)} rows={4}
              className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleAdminPost} disabled={posting}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition"
            >
              {posting ? 'Publishing...' : 'Publish to Feed'}
            </button>
          </div>
        </section>
        
        {/* Flagged Posts Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🚨 Flagged Posts</h2>
          {pendingReports.length === 0 ? (
             <div className="bg-white p-6 rounded-xl shadow text-gray-500 text-sm">No pending reports.</div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((rep) => (
                <div key={rep.id} className="bg-white p-5 rounded-xl shadow border-l-4 border-purple-500">
                  <h3 className="font-bold text-red-600 mb-2">Reason: {rep.reason}</h3>
                  <div className="bg-gray-50 p-3 rounded border text-sm text-gray-600 mb-4">
                    <p className="font-bold text-gray-800">Original Post: {rep.request?.title}</p>
                    <p>{rep.request?.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleReportAction(rep.id, rep.request?.id, 'dismiss')} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded">Dismiss Report</button>
                    <button onClick={() => handleReportAction(rep.id, rep.request?.id, 'remove_post')} className="flex-1 bg-red-600 text-white font-bold py-2 rounded">Remove Post</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Moderation Queue Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 New Post Queue</h2>
          {pendingRequests.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow text-gray-500 text-sm">No pending requests.</div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-xl shadow border-l-4 border-yellow-500">
                  <h3 className="font-bold text-lg text-gray-800 leading-tight mb-2">{req.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{req.description}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleModeration(req.id, 'approve')} className="flex-1 bg-green-600 text-white font-bold py-2 rounded">Approve</button>
                    <button onClick={() => handleModeration(req.id, 'reject')} className="flex-1 bg-red-100 text-red-700 font-bold py-2 rounded">Reject</button>
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
