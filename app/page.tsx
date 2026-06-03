'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#cffafe] font-sans pb-12">
      {/* Header */}
      <header className="bg-[#164e63] text-white p-4 flex justify-between items-center rounded-b-xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
             <span className="text-[#164e63] font-bold text-xs px-1 text-center leading-none">PDX</span>
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
          
          <a href="/profile" className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition flex flex-col">
            <h3 className="font-bold text-[#164e63] text-lg mb-1">Profile</h3>
            <p className="text-gray-500 text-xs">Set up your identity.</p>
          </a>
          
          <a href="/feed" className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#0f766e] hover:shadow-md transition flex flex-col">
            <h3 className="font-bold text-[#164e63] text-lg mb-1">Community Feed</h3>
            <p className="text-gray-500 text-xs">View open requests.</p>
          </a>
          
          <a href="/ideas" className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#fcd34d] hover:shadow-md transition flex flex-col">
            <h3 className="font-bold text-[#164e63] text-lg mb-1">Ideas</h3>
            <p className="text-gray-500 text-xs">Share inspiration.</p>
          </a>

          <a href="/dashboard" className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#b45309] hover:shadow-md transition flex flex-col">
            <h3 className="font-bold text-[#164e63] text-lg mb-1">Dashboard</h3>
            <p className="text-gray-500 text-xs">Manage your activity.</p>
          </a>
          
          {/* EXTERNAL LINK: PDX Resource Compass */}
          <a href="https://humbletravelers.org/community-support" target="_blank" rel="noopener noreferrer" className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition flex flex-col">
            <h3 className="font-bold text-[#164e63] text-lg mb-1">Resources</h3>
            <p className="text-gray-500 text-xs">Find local support.</p>
          </a>

        </div>
      </div>
    </div>
  );
}
