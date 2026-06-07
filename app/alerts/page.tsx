'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AlertsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch unread notifications for this specific user
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setNotifications(data);
      setLoading(false);
    };

    fetchNotifications();
  }, [router]);

  const markAsRead = async (id: string) => {
    // Update the database
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    // Remove it from the screen
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id);
    setNotifications([]);
  };

  if (loading) return <div className="p-8 text-center text-[#164e63] font-bold">Loading Alerts...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-b-xl mb-6 flex justify-between items-center sticky top-0">
        <h1 className="text-xl font-bold tracking-widest">Activity Alerts</h1>
        <a href="/" className="text-sm font-bold text-[#fcd34d] hover:underline">Home</a>
      </nav>

      <div className="max-w-2xl mx-auto px-4 space-y-6">
        
        <div className="flex justify-between items-end border-b-2 border-[#0f766e] pb-2 mb-4">
          <h2 className="text-2xl font-extrabold text-gray-800">Your Inbox</h2>
          {notifications.length > 0 && (
            <button onClick={clearAll} className="text-sm text-[#0f766e] font-bold hover:underline">
              Clear All
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center shadow-sm">
            <span className="text-4xl mb-3 block">📭</span>
            <p className="text-gray-500 font-bold">You're all caught up!</p>
            <p className="text-sm text-gray-400 mt-1">When neighbors interact with your requests, alerts will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((alert) => (
              <div key={alert.id} className={`bg-white border-l-4 ${alert.is_read ? 'border-gray-300' : 'border-[#fcd34d]'} p-4 rounded-r-lg shadow-sm flex justify-between items-center gap-4 transition hover:shadow-md`}>
                
                <div className="flex-1">
                  {!alert.is_read && <span className="inline-block bg-[#fcd34d] text-[#78350f] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">New</span>}
                  <p className="text-sm text-gray-800 leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">
                    {new Date(alert.created_at).toLocaleDateString()} at {new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>

                <button onClick={() => markAsRead(alert.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm transition">
                  ✓
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
