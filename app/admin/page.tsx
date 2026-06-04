'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const router = useRouter();

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
        
        // Fetch Flagged Reports
        const { data: reportData } = await supabase.from('reports').select('*');
        
        if (reportData) {
          // Take the IDs and fetch the actual post content so the Admin can read it
          const enrichedReports = await Promise.all(reportData.map(async (report) => {
            let postData = null;
            let postType = 'Unknown';

            // Check if it's a request
            const { data: reqData } = await supabase.from('requests').select('title, description').eq('id', report.post_id).single();
            if (reqData) {
              postData = reqData;
              postType = 'request';
            } else {
              // If not a request, check if it's an idea
              const { data: ideaData } = await supabase.from('community_ideas').select('title, description').eq('id', report.post_id).single();
              if (ideaData) {
                postData = ideaData;
                postType = 'idea';
              }
            }

            return { ...report, postData, postType };
          }));
          
          setReports(enrichedReports);
        }
      } else {
        alert("Access Denied: You do not have administrator privileges.");
        router.push('/');
      }
      setLoading(false);
    };

    checkAdminAndFetchData();
  }, [router]);

  const dismissReport = async (reportId: string) => {
    await supabase.from('reports').delete().eq('id', reportId);
    setReports(reports.filter(r => r.id !== reportId));
  };

  const deletePost = async (reportId: string, postId: string, postType: string) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this post?");
    if (!confirmDelete) return;

    // Delete from the correct table
    if (postType === 'request') {
      await supabase.from('requests').delete().eq('id', postId);
    } else if (postType === 'idea') {
      await supabase.from('community_ideas').delete().eq('id', postId);
    }

    // Dismiss the report now that the post is gone
    await dismissReport(reportId);
    alert("Post successfully deleted for violating safety standards.");
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
          <button className="bg-red-800 text-white px-5 py-2 rounded-lg font-bold shadow hover:bg-opacity-90 transition">
            + Create Announcement
          </button>
        </div>

        {/* Verification & Raffles */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">✅ Task Verification & Raffles</h2>
          <p className="text-gray-600 text-sm mb-4">Review completed community tasks to award badges and Volunteer Raffle entries.</p>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center text-blue-800 font-bold text-sm">
            Verification Queue is currently empty.
          </div>
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
                  
                  {/* Context Block */}
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Flagged: {report.reason || 'Review Required'}</p>
                      <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">ID: {report.post_id.substring(0,8)}</span>
                    </div>
                    
                    <div className="bg-gray-50 border-l-4 border-gray-300 p-3 rounded-r-md text-sm text-gray-800">
                      {report.postData ? (
                        <>
                          <p className="font-bold mb-1">{report.postData.title}</p>
                          <p className="opacity-80">{report.postData.description}</p>
                        </>
                      ) : (
                        <p className="italic text-gray-500">Post content could not be loaded. It may have already been deleted by the user.</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button onClick={() => dismissReport(report.id)} className="flex-1 bg-green-600 text-white px-4 py-3 rounded font-bold shadow hover:bg-green-700 text-sm transition">
                      Allow (Dismiss)
                    </button>
                    <button onClick={() => deletePost(report.id, report.post_id, report.postType)} className="flex-1 bg-red-600 text-white px-4 py-3 rounded font-bold shadow hover:bg-red-700 text-sm transition">
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
