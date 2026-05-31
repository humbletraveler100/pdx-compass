'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-[#164e63] text-white p-4 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="https://i.ibb.co/HTPNMBMB/thtf-compass-logo.png"
              alt="Humble Travelers Logo"
              className="h-10 w-10 rounded-full bg-white object-cover"
            />
            <h1 className="text-xl font-bold tracking-widest">PDX Compass</h1>
          </div>
          {user ? (
            <button onClick={handleSignOut} className="bg-[#fed7aa] text-[#164e63] px-4 py-2 rounded-full font-bold text-sm hover:bg-opacity-90">
              Sign Out
            </button>
          ) : (
            <a href="/login" className="bg-[#fcd34d] text-[#164e63] px-4 py-2 rounded-full font-bold text-sm hover:bg-opacity-90">
              Sign In
            </a>
          )}
        </div>
      </nav>
      <header className="bg-[#cffafe] p-8 text-center text-[#164e63]">
        <h2 className="text-3xl font-bold mb-4">We Are All Travelers Shaping Stronger Communities Together</h2>
        <p className="text-lg mb-6">A Portland-based 501(c)(3) fostering inclusion, bridging divides, and building capacity through grassroots engagement.</p>
        <button className="bg-[#164e63] text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90">Ask for Help</button>
      </header>
      <main className="p-4 max-w-md mx-auto space-y-6">
        <div className="bg-[#fed7aa] p-4 rounded-lg text-[#164e63] text-sm">
          <strong>Safety Notice:</strong> The Humble Travelers Foundation requires all neighbors to verify their identity before exchanging services.
        </div>
        <section className="grid grid-cols-2 gap-4 text-[#164e63]">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-bold text-lg mb-1">Act</h3>
            <p className="text-xs text-gray-600">Volunteer your time.</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-bold text-lg mb-1">Aid</h3>
            <p className="text-xs text-gray-600">Borrow or lend tools.</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-bold text-lg mb-1">Connect</h3>
            <p className="text-xs text-gray-600">Propose a project.</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-bold text-lg mb-1">Space</h3>
            <p className="text-xs text-gray-600">Locate resources.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
