'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const router = useRouter();

  // Megaphone State
  const [isMegaphoneOpen, setIsMegaphoneOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementImage, setAnnouncementImage] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // Raffle State
  const [raffleWinner, setRaffleWinner] = useState<any>(null);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (userData?.is_admin) {
        setIsAdmin(true);
        
        // 1. Fetch Flagged Reports
        const { data: reportData } = await supabase.from('reports').select('*');
        if (reportData) {
          const enrichedReports = await Promise.all(reportData.map(async (report) => {
            let postData = null;
            let postType = 'Unknown';
            const targetId = report.post_id || report.id; 

            if (targetId) {
                const { data: reqData } = await supabase.from('requests').select('title, description').eq('id', targetId).maybeSingle();
                if (reqData) {
                  postData = reqData;
                  postType = 'request';
                } else {
                  const { data: ideaData } = await supabase.from('community_ideas').select('title, description').eq('id', targetId).maybeSingle();
                  if (ideaData) {
                    postData = ideaData;
                    postType = 'idea';
                  }
                }
            }
            return { ...report, postData, postType, targetId };
          }));
          setReports(enrichedReports);
        }

        // 2. Fetch Tasks Pending Verification
        const { data: tasksData } = await supabase
          .from('requests')
          .select('*')
          .eq('status', 'pending_approval');
        
        if (tasksData) {
          const enrichedTasks = await Promise.all(tasksData.map(async (task) => {
            let helperName = "Unknown Neighbor";
            if (task.helper_id) {
              const { data: helperData } = await supabase.from('users').select('name').eq('id', task.helper_id).maybeSingle();
              if (helperData?.name) helperName = helperData.name;
            }
            return { ...task, helperName };
          }));
          setPendingTasks(enrichedTasks);
        }

        // 3. Fetch Volunteers for the Raffle
        const { data: volData } = await supabase
          .from('users')
          .select('id, name, email, completed_tasks')
          .gt('completed_tasks', 0)
          .order('completed_tasks', { ascending: false });
        
        if (volData) setVolunteers(volData);

      } else {
        alert("Access Denied: You do not have administrator privileges.");
        router.push('/');
      }
      setLoading(false);
    };

    checkAdminAndFetchData();
  }, [router]);

  // --- MEGAPHONE FUNCTIONS ---
  const handlePostAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      alert("Please fill out both the title and content.");
      return;
    }
    
    setIsPosting(true);
    let imageUrl = null;

    if (announcementImage) {
      const fileExt = announcementImage.name.split('.').pop();
      const fileName = `spotlight-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('compass-images').upload(fileName, announcementImage);
      
      if (uploadError) {
        alert(`Error uploading image: ${uploadError.message}`);
        setIsPosting(false);
        return;
      }

      const { data } = supabase.storage.from('compass-images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from('spotlight').insert({
      title: announcementTitle,
      content: announcementContent,
      image_url: imageUrl
    });

    if (error) {
      alert(`Error posting announcement: ${error.message}`);
    } else {
      alert("✅ Announcement broadcasted to the Spotlight feed!");
      setIsMegaphoneOpen(false);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setAnnouncementImage(null);
    }
    setIsPosting(false);
  };

  // --- RAFFLE DRAW ALGORITHM ---
  const drawWinner = () => {
    if (volunteers.length === 0) {
      alert("There are no volunteer entries yet!");
      return;
    }

    // Create a weighted pool: if someone has 3 entries, add their name 3 times
    const drawingPool: any[] = [];
    volunteers.forEach((vol) => {
      for (let i = 0; i < vol.completed_tasks; i++) {
        drawingPool.push(vol);
      }
    });

    // Pick a random ticket from the pool
    const winningIndex = Math.floor(Math.random() * drawingPool.length);
    setRaffleWinner(drawingPool[winningIndex]);
  };

  // --- REPORT FUNCTIONS ---
  const dismissReport = async (reportId: string) => {
    const { error } = await supabase.from('reports').delete().eq('id', reportId);
    if (error) {
      alert(`Database Security Error: ${error.message}`);
    } else {
      setReports(reports.filter(r => r.id !== reportId));
    }
  };

  const deletePost = async (reportId: string, targetId: string, postType: string) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this post?");
    if (!confirmDelete) return;

    if (postType === 'request') {
      await supabase.from('requests').delete().eq('id', targetId);
    } else if (postType === 'idea') {
      await supabase.from('community_ideas').delete().eq('id', targetId);
    }

    await dismissReport(reportId);
    alert("Post successfully deleted for violating safety standards.");
  };

  // --- TASK VERIFICATION FUNCTIONS ---
  const approveTask = async (taskId: string, helperId: string) => {
    const confirmApprove = window.confirm("Approve this task and award a Volunteer Raffle entry to the helper?");
    if (!confirmApprove) return;

    try {
      await supabase.from('requests').update({ status: 'verified' }).eq('id', taskId);

      if (helperId) {
        const { data: helperData } = await supabase.from('users').select('completed_tasks').eq('id', helperId).single();
        const currentScore = helperData?.completed_tasks || 0;
        await supabase.from('users').update({ completed_tasks: currentScore + 1 }).eq('id', helperId);
        
        const updatedVolunteers = volunteers.map(vol => 
          vol.id === helperId ? { ...vol, completed_tasks: vol.completed_tasks + 1 } : vol
        );
        // If they weren't in the list before, they won't automatically show until refresh, but this updates existing ones visually.
        setVolunteers(updatedVolunteers);
      }

      setPendingTasks(pendingTasks.filter(t => t.id !== taskId));
      alert("✅ Task verified! The helper has been awarded their raffle entry.");
    } catch (error) {
      alert("There was an error verifying this task. Please try again.");
    }
  };

  const rejectTask = async (taskId: string) => {
    const confirmReject = window.confirm("Reject this verification? The task will be sent back to the open community feed.");
    if (!confirmReject) return;

    await supabase.from('requests').update({ status: 'open', helper_id: null }).eq('id', taskId);
    setPendingTasks(pendingTasks.filter(t => t.id !== taskId));
  };

  if (loading) return <div className="min-h-screen bg-gray-100 p-8 text-center text-[#164e63] font-bold">Verifying Credentials...</div>;
  if (!isAdmin) return null; 

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans pb-12">
      <nav className="bg-red-900 text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <h1 className="text-lg font-bold tracking-widest">Command Center</h1>
        </div>
        <a href="/" className="text-sm font-bold text-gray-300 hover:text-white">Exit Admin</a>
      </nav>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* The Megaphone */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-800">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">📢 The Megaphone</h2>
          <p className="text-gray-600 text-sm mb-4">Publish official Foundation events and updates directly to the Spotlight feed.</p>
          
          {!isMegaphoneOpen ? (
            <button onClick={() => setIsMegaphoneOpen(true)} className="bg-red-800 text-white px-5 py-2 rounded-lg font-bold shadow hover:bg-opacity-90 transition">
              + Create Announcement
            </button>
          ) : (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4">
              <input 
                type="text" 
                placeholder="Announcement Title" 
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full p-2 border border-red-300 rounded focus:ring-2 focus:ring-red-800 outline-none mb-3 text-sm font-bold text-gray-800"
              />
              <textarea 
                placeholder="Write your official update here..." 
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                rows={4}
                className="w-full p-2 border border-red-300 rounded focus:ring-2 focus:ring-red-800 outline-none mb-3 text-sm text-gray-800"
              />
              
              <div className="mb-4 p-3 bg-white border border-red-200 rounded-lg flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Attach Image (Optional)</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setAnnouncementImage(e.target.files ? e.target.files[0] : null)}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={handlePostAnnouncement} disabled={isPosting} className="flex-1 bg-red-800 text-white px-4 py-2 rounded font-bold shadow hover:bg-opacity-90 text-sm transition">
                  {isPosting ? 'Uploading & Broadcasting...' : 'Broadcast to Spotlight'}
                </button>
                <button onClick={() => { setIsMegaphoneOpen(false); setAnnouncementImage(null); }} className="px-4 py-2 text-red-800 font-bold text-sm hover:underline">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RAFFLE MANAGER & LEADERBOARD */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">🎟️ Raffle Manager</h2>
              <p className="text-gray-600 text-sm">A complete list of all volunteers and their current number of reward entries.</p>
            </div>
            <button onClick={drawWinner} className="bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-400 transition text-sm whitespace-nowrap ml-2">
              Draw Random Winner
            </button>
          </div>

          {raffleWinner && (
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-6 rounded-xl border-2 border-yellow-400 mb-6 text-center shadow-inner">
              <span className="text-4xl block mb-2">🎉</span>
              <h3 className="font-extrabold text-yellow-800 text-xl tracking-widest uppercase mb-1">Winner Selected!</h3>
              <p className="text-yellow-900 font-bold text-2xl my-2">{raffleWinner.name || 'Anonymous'}</p>
              <p className="text-yellow-700 text-base mb-3 font-medium">{raffleWinner.email}</p>
              <button onClick={() => setRaffleWinner(null)} className="text-sm font-bold text-yellow-600 hover:text-yellow-800 underline transition">
                Clear Winner
              </button>
            </div>
          )}
          
          {volunteers.length === 0 ? (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 text-center text-yellow-800 font-bold text-sm">
              No verified tasks yet. The entries will appear here!
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">Neighbor</th>
                    <th className="px-4 py-3 font-bold">Email (Contact)</th>
                    <th className="px-4 py-3 font-bold text-center">Raffle Entries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {volunteers.map((vol) => (
                    <tr key={vol.id} className="bg-white hover:bg-yellow-50 transition">
                      <td className="px-4 py-3 font-bold text-[#164e63]">{vol.name || 'Anonymous'}</td>
                      <td className="px-4 py-3 text-gray-500">{vol.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full font-extrabold shadow-sm">
                          {vol.completed_tasks}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Verification & Raffles */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">✅ Task Verification Queue</h2>
          <p className="text-gray-600 text-sm mb-4">Review completed community tasks to award badges and entries.</p>
          
          {pendingTasks.length === 0 ? (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center text-blue-800 font-bold text-sm">
              Verification Queue is currently empty.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Pending Verification</p>
                    </div>
                    <div className="bg-gray-50 border-l-4 border-blue-300 p-3 rounded-r-md text-sm text-gray-800 mb-3">
                      <p className="font-bold mb-1">"{task.title}"</p>
                      <p className="opacity-80 text-xs">{task.description}</p>
                    </div>
                    <p className="text-sm text-gray-700"><strong>Helper to Reward:</strong> {task.helperName}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => approveTask(task.id, task.helper_id)} className="flex-1 bg-blue-600 text-white px-4 py-3 rounded font-bold shadow hover:bg-blue-700 text-sm transition">
                      Approve & Award Entry
                    </button>
                    <button onClick={() => rejectTask(task.id)} className="flex-1 bg-gray-200 text-gray-700 border border-gray-300 px-4 py-3 rounded font-bold shadow hover:bg-gray-300 text-sm transition">
                      Reject (Send Back)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flagged Content */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-orange-500">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">🚨 Flagged Content</h2>
          <p className="text-gray-600 text-sm mb-4">Review posts reported by the community for safety violations.</p>
          
          {reports.length === 0 ? (
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-100 text-center text-orange-800 font-bold text-sm">
              No flagged content right now. The community is healthy!
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Flagged: {report.reason || 'Review Required'}</p>
                      <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">ID: {report.targetId ? report.targetId.substring(0,8) : 'Unknown'}</span>
                    </div>
                    <div className="bg-gray-50 border-l-4 border-gray-300 p-3 rounded-r-md text-sm text-gray-800">
                      {report.postData ? (
                        <>
                          <p className="font-bold mb-1">{report.postData.title}</p>
                          <p className="opacity-80">{report.postData.description}</p>
                        </>
                      ) : (
                        <p className="italic text-gray-500">Post content could not be loaded. It may have already been deleted.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => dismissReport(report.id)} className="flex-1 bg-green-600 text-white px-4 py-3 rounded font-bold shadow hover:bg-green-700 text-sm transition">
                      Allow (Dismiss)
                    </button>
                    <button onClick={() => deletePost(report.id, report.targetId, report.postType)} className="flex-1 bg-red-600 text-white px-4 py-3 rounded font-bold shadow hover:bg-red-700 text-sm transition" disabled={!report.postData}>
                      Delete Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
