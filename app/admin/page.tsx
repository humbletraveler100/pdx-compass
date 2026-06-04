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
        if (reportData) setReports(reportData);
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
                <div key={report.id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Reported Item ID: {report.post_id || report.id}</p>
                    <p className="text-xs text-gray-500">Reason: {report.reason || 'Flagged by user for review'}</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => dismissReport(report.id)} className="flex-1 md:flex-none bg-green-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-green-700 text-sm">
                      Allow (Dismiss)
                    </button>
                    <button className="flex-1 md:flex-none bg-red-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-red-700 text-sm">
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
