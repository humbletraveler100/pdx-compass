'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

// FORCE CLOUDFLARE TO BYPASS CACHE AND FETCH LIVE DATA EVERY TIME
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [starsBreakdown, setStarsBreakdown] = useState({
    taskPoints: 0,
    discussionPoints: 0,
    pollPoints: 0,
    totalStars: 0
  });

  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [helperEmail, setHelperEmail] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      // Fetch from the dynamic database view live
      const { data: summaryData } = await supabase
        .from('neighbor_engagement_summary')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (summaryData) {
        setStarsBreakdown({
          taskPoints: summaryData.task_points || 0,
          discussionPoints: summaryData.discussion_points || 0,
          pollPoints: summaryData.poll_points || 0,
          totalStars: summaryData.total_engagement_stars || 0
        });
      }

      // Fetch current requests
      const { data } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setRequests(data);

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);

      if (count) setUnreadCount(count);
      setLoading(false);
    };

    fetchDashboard();
  }, [router]);

  const submitFulfillment = async (taskId: string) => {
    let helperId = null;

    if (helperEmail.trim() !== '') {
      const { data: helperData, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', helperEmail.trim())
        .maybeSingle();

      if (error || !helperData) {
        alert("We couldn't find a user with that email. Please check the spelling, or leave it blank if they aren't on the app.");
        return;
      }
      helperId = helperData.id;
    }

    const { error: updateError } = await supabase
      .from('requests')
      .update({
        status: 'pending_approval',
        helper_id: helperId
      })
      .eq('id', taskId);

    if (!updateError) {
      alert("✅ Task submitted for verification! Thank you for updating the community.");
      setRequests(requests.map(r => r.id === taskId ? { ...r, status: 'pending_approval', helper_id: helperId } : r));
      setCompletingTaskId(null);
      setHelperEmail('');
    } else {
      alert(`Error updating task: ${updateError.message}`);
    }
  };

  const deleteRequest = async (taskId: string) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this request?");
    if (!confirmed) return;

    await supabase.from('requests').delete().eq('id', taskId);
    setRequests(requests.filter(r => r.id !== taskId));
  };

  if (loading) return <div className="p-8 text-center text-[#164e63] font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#f0f9ff] p-4 font-sans pb-12">
      {/* Navigation Header */}
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest">My Dashboard</h1>
        <a href="/" className="text-sm font-bold text-[#e0f2fe] hover:underline">Home</a>
      </nav>

      <div className="max-w-2xl mx-auto space-y-6">

        {/* ALERTS INBOX BANNER */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-cyan-500 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-1">Activity Alerts</h2>
            <p className="text-gray-600 text-sm">Check your messages and updates.</p>
          </div>
          <a href="/alerts" className="relative bg-cyan-50 text-cyan-800 px-5 py-2 rounded-lg font-bold border border-cyan-200 hover:bg-cyan-100 transition shadow-sm text-sm">
            Inbox
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-cyan-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse shadow-md">
                {unreadCount}
              </span>
            )}
          </a>
        </div>

        {/* RE-RENDERED JOURNEY TRACKER */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-teal-600">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
              🌟 My Community Journey
            </h2>
            <span className="bg-teal-600 text-white px-3 py-1 rounded-full font-black text-sm shadow-sm">
              {starsBreakdown.totalStars} Total Stars
            </span>
          </div>
          
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
            Each star acts as an automatic entry ticket into our monthly Reward Drawing.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase">🤝 Tasks</p>
              <p className="text-base font-black text-emerald-600 mt-1">+{starsBreakdown.taskPoints}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase">📊 Polls</p>
              <p className="text-base font-black text-blue-600 mt-1">+{starsBreakdown.pollPoints}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase">💬 Talk</p>
              <p className="text-base font-black text-purple-600 mt-1">+{starsBreakdown.discussionPoints}</p>
            </div>
          </div>
        </div>

        {/* OPEN REQUESTS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-[#164e63]">
          <h2 className="text-xl font-extrabold text-gray-800 mb-2">My Open Requests</h2>
          <p className="text-gray-600 text-sm mb-4">Manage the help you have asked for. Don't forget to mark tasks as fulfilled so your neighbors can earn their Volunteer Raffle entries!</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-slate-50 p-6 rounded-lg border border-gray-100 text-center text-gray-500 font-bold text-sm shadow-sm">
            You don't have any active requests right now.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((task) => (
              <div key={task.id} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex flex-col gap-4">

                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                    {task.status === 'open' && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Open</span>}
                    {task.status === 'pending_approval' && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Pending Verification</span>}
                    {task.status === 'verified' && <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Completed</span>}
                  </div>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>

                {task.status === 'open' && completingTaskId !== task.id && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button onClick={() => setCompletingTaskId(task.id)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-green-700 text-sm transition">
                      Mark as Fulfilled
                    </button>
                    <button onClick={() => deleteRequest(task.id)} className="px-4 py-2 text-red-600 font-bold text-sm hover:underline">
                      Delete
                    </button>
                  </div>
                )}

                {completingTaskId === task.id && (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-2">
                    <p className="text-sm font-bold text-[#164e63] mb-2">Who helped you with this?</p>
                    <p className="text-xs text-gray-500 mb-3">Enter their account email so they can receive a Reward Drawing entry. Leave blank if they are not on the app.</p>

                    <input
                      type="email"
                      placeholder="neighbor@email.com"
                      value={helperEmail}
                      onChange={(e) => setHelperEmail(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0f766e] outline-none mb-3 text-sm"
                    />

                    <div className="flex gap-2">
                      <button onClick={() => submitFulfillment(task.id)} className="flex-1 bg-[#164e63] text-white px-4 py-2 rounded font-bold shadow hover:bg-opacity-90 text-sm transition">
                        Submit for Verification
                      </button>
                      <button onClick={() => setCompletingTaskId(null)} className="px-4 py-2 text-gray-500 font-bold text-sm hover:underline">
                        Cancel
                      </button>
                    </div>
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
