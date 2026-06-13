'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function FrontPorch() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard'); 
      } else {
        setLoading(false); 
      }
    };
    checkSession();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-[#0f766e] font-bold">Loading PDX Compass...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12 selection:bg-teal-200">
      
      {/* HEADER: Sign-in remains here for desktop/header scanners */}
      <nav className="bg-white p-4 shadow-sm border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <h1 className="text-xl font-black text-[#164e63] tracking-wider uppercase">PDX Compass</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/login')} 
            className="bg-transparent border-2 border-[#0f766e] text-[#0f766e] px-5 py-1.5 rounded-lg font-bold hover:bg-teal-50 transition text-sm"
          >
            Sign In
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 mt-8 space-y-10">
        
        {/* HERO SECTION */}
        <div className="text-center space-y-5 py-6">
          <h2 className="text-4xl sm:text-5xl font-black text-gray-800 leading-tight">
            We Are All Travelers – Helping Each Other Build a Stronger Portland
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            A Portland-based 501(c)(3) connecting neighbors to share help, lift up local voices, and find trusted resources when life gets hard.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button onClick={() => router.push('/ask')} className="w-full sm:w-auto bg-[#0f766e] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-opacity-90 transition text-lg">
              Ask for Help
            </button>
            <button onClick={() => router.push('/feed')} className="w-full sm:w-auto bg-white border-2 border-[#0f766e] text-[#0f766e] px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-teal-50 transition text-lg">
              See Who Needs Help
            </button>
          </div>
          
          {/* FEEDBACK IMPLEMENTED: Obvious returning user sign-in route directly under primary CTAs */}
          <p className="pt-2 text-sm text-gray-500 font-bold">
            Already a neighbor? <button onClick={() => router.push('/login')} className="text-[#0f766e] hover:underline cursor-pointer">Sign in to your account.</button>
          </p>
        </div>

        {/* FEEDBACK IMPLEMENTED: Action Tiles moved UP above Safety Notice to guarantee mobile "above-the-fold" visibility */}
        <div>
          <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Choose how you'd like to start</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group">
              <div className="text-3xl mb-3">🛠️</div>
              <h4 className="text-lg font-black text-gray-800 mb-2">I Need a Hand</h4>
              {/* FEEDBACK IMPLEMENTED: Tighter, verb-led copy */}
              <p className="text-sm text-gray-500 mb-4">Ask neighbors for help with tasks, tools, rides, or support.</p>
              <button onClick={() => router.push('/ask')} className="text-[#0f766e] font-bold text-sm group-hover:underline">Post a Request →</button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group">
              <div className="text-3xl mb-3">🤝</div>
              <h4 className="text-lg font-black text-gray-800 mb-2">I Want to Help</h4>
              <p className="text-sm text-gray-500 mb-4">See who needs help today and volunteer when you can.</p>
              <button onClick={() => router.push('/feed')} className="text-[#0f766e] font-bold text-sm group-hover:underline">View Community Feed →</button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group">
              <div className="text-3xl mb-3">💬</div>
              <h4 className="text-lg font-black text-gray-800 mb-2">I Want a Say</h4>
              <p className="text-sm text-gray-500 mb-4">Visit Town Square to read local topics and participate in polls.</p>
              <button onClick={() => router.push('/ideas')} className="text-[#164e63] font-bold text-sm group-hover:underline">Visit Town Square →</button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group">
              <div className="text-3xl mb-3">🗺️</div>
              <h4 className="text-lg font-black text-gray-800 mb-2">I Need Resources</h4>
              <p className="text-sm text-gray-500 mb-4">Open the PDX Resource Compass for housing, food, health, and more.</p>
              <a href="https://humbletravelers.org/community-support" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-sm group-hover:underline">Open PDX Resource Compass ↗</a>
            </div>

          </div>
        </div>

        {/* SAFETY MICRO-BLOCK: Moved below tiles for better flow */}
        <div className="bg-amber-50 border-l-4 border-[#ca8a04] p-5 rounded-r-xl shadow-sm text-sm">
          <h3 className="font-extrabold text-[#854d0e] mb-1 flex items-center gap-2">
            🛡️ Safety Notice
          </h3>
          <p className="text-[#713f12] leading-relaxed mb-2">
            The Humble Travelers Foundation facilitates community connections but does not supervise or guarantee services between neighbors. We require identity verification before exchanging services and never share your exact address or contact info publicly.
          </p>
          <a href="/safety" className="text-[#ca8a04] font-bold hover:underline text-xs uppercase tracking-wider">
            Review Community Safety Standards →
          </a>
        </div>

        {/* HOW IT WORKS */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-[#164e63] mb-6 border-b border-gray-100 pb-4">How PDX Community Compass Works</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-black flex items-center justify-center shrink-0">1</div>
              <div>
                <h4 className="font-bold text-gray-800">Look Around</h4>
                <p className="text-sm text-gray-600 mt-1">Browse open requests, Town Square topics, and resource listings. You can explore most of the app before creating an account.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-black flex items-center justify-center shrink-0">2</div>
              <div>
                <h4 className="font-bold text-gray-800">Join as a Neighbor</h4>
                <p className="text-sm text-gray-600 mt-1">Create a free account, verify your identity, and set your neighborhood. Your exact address and contact info stay private.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-black flex items-center justify-center shrink-0">3</div>
              <div>
                <h4 className="font-bold text-gray-800">Ask, Offer, or Speak Up</h4>
                <p className="text-sm text-gray-600 mt-1">Post a request, volunteer, or participate in Town Square polls. Your actions earn <strong className="text-amber-500">stars</strong> that count toward a monthly drawing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* WHY STARS: FEEDBACK IMPLEMENTED - Clean, single sentence explanation */}
        <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-md">
          <h3 className="text-lg font-black text-amber-400 mb-3">⭐ Why Stars and a Monthly Drawing?</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Stars help us recognize mutual aid and civic participation; they are automatic entries in a monthly drawing, not payment for labor.
          </p>
          <a href="/rewards" className="text-amber-400 hover:text-amber-300 font-bold text-sm flex items-center gap-1 group">
            Review the Monthly Reward Drawing Rules <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-gray-200 bg-white py-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest space-y-4">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 px-4">
          <a href="/rewards" className="hover:text-gray-800 transition">Reward Rules</a>
          <a href="/safety" className="hover:text-gray-800 transition">Safety Standards</a>
          <a href="/legal" className="hover:text-gray-800 transition">Legal Agreements</a>
          <a href="#" className="hover:text-gray-800 transition">Privacy Policy</a>
        </div>
        <p className="opacity-50 tracking-normal capitalize pt-4">© 2026 The Humble Travelers Foundation.</p>
      </footer>

    </div>
  );
}
