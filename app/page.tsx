'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkUserAndAlerts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('is_read', false);

        if (count) setUnreadCount(count);
      }
    };
    checkUserAndAlerts();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#cffafe] font-sans pb-4">
      {/* Header */}
      <header className="bg-[#164e63] text-white p-4 flex justify-between items-center rounded-b-xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm">
             <img src="https://humbletravelers.org/assets/images/thtf-compass-logo.png" alt="PDX Compass Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold tracking-widest leading-tight">PDX<br/>Compass</h1>
        </div>
        {user ? (
          <button onClick={handleSignOut} className="bg-[#fcd34d] text-[#164e63] px-4 py-2 rounded-full font-bold text-sm shadow hover:bg-opacity-90">Sign Out</button>
        ) : (
          <a href="/login" className="bg-[#fcd34d] text-[#164e63] px-4 py-2 rounded-full font-bold text-sm shadow hover:bg-opacity-90">Sign In</a>
        )}
      </header>

      {/* Hero Section */}
      <div className="px-6 pt-10 pb-8 text-center">
        <h2 className="text-3xl font-extrabold text-[#164e63] leading-tight mb-4">
          We Are All Travelers Shaping Stronger Communities Together
        </h2>
        <p className="text-[#0f766e] text-base mb-8 px-2">
          A Portland-based 501(c)(3) fostering inclusion, bridging divides, and building capacity through grassroots engagement.
        </p>
        <a href="/ask" className="inline-block bg-[#164e63] text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-opacity-90 transition">
          Ask for Help
        </a>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-6">
        {/* Safety Notice */}
        <div className="bg-[#fed7aa] p-5 rounded-xl text-sm text-[#78350f] shadow-sm">
          <strong>Safety Notice:</strong> The Humble Travelers Foundation requires all neighbors to verify their identity before exchanging services.
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 gap-4">

          <a href="/profile" className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition flex flex-col">
            <h3 className="font-bold text-[#164e63] text-lg mb-1">Profile</h3>
            <p className="text-gray-500 text-xs">Set up your identity.</p>
          </a>

          {/* FIXED: Action-focused description for the Community Feed */}
          <a href="/feed" className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#0f766e] hover:shadow-md transition flex flex-col">
            <h3 className="font-bold text-[#164e63] text-lg mb-1">Community Feed</h3>
            <p className="text-gray-500 text-xs">Requests for assistance - volunteer today.</p>
          </a>

          <a href="/ideas" className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#fcd34d] hover:shadow-md transition flex flex-col">
            <h3 className="font-bold text-[#164e63] text-lg mb-1">Town Square</h3>
            <p className="text-gray-500 text-xs">Discuss & vote.</p>
          </a>

          <a href="/spotlight" className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-pink-500 hover:shadow-md transition flex flex-col">
            <h3 className="font-bold text-[#164e63] text-lg mb-1">Spotlight</h3>
            <p className="text-gray-500 text-xs">Community wins.</p>
          </a>

          <a href="/dashboard" className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#b45309] hover:shadow-md transition flex flex-col relative">
            {unreadCount > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
            <h3 className="font-bold text-[#164e63] text-lg mb-1">Dashboard</h3>
            <p className="text-gray-500 text-xs">Manage activity.</p>
          </a>

          <a href="http://humbletravelers.org/community-support" target="_blank" rel="noopener noreferrer" className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition flex flex-col">
            <h3 className="font-bold text-[#164e63] text-lg mb-1">Resources</h3>
            <p className="text-gray-500 text-xs">Find local support.</p>
          </a>

        </div>

        {/* LEGAL & SAFETY FOOTER */}
        <div className="mt-10 pt-6 border-t border-[#0f766e] border-opacity-20 text-center pb-8 flex flex-col gap-2">
          <a href="/rewards" className="text-[#164e63] text-sm font-extrabold hover:underline flex items-center justify-center gap-1">
            🎁 Monthly Reward Drawing Rules
          </a>
          <a href="/safety" className="text-[#0f766e] text-sm font-bold hover:underline mt-2">
            Community Safety Standards
          </a>
          <a href="/legal" className="text-[#0f766e] text-sm font-bold hover:underline">
            Legal Agreements & Privacy Policy
          </a>
          <p className="text-[#0f766e] text-xs opacity-70 mt-2">
            © 2026 The Humble Travelers Foundation
          </p>
        </div>

      </div>
    </div>
  );
}
