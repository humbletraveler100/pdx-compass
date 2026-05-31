'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [skills, setSkills] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  const handleSaveProfile = async () => {
    // We will wire this up to the database next!
    setMessage('Profile UI looks great! Database connection coming soon.');
  };

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-widest">PDX Compass</h1>
        </div>
      </nav>

      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto border-t-4 border-[#0f766e]">
        <h2 className="text-2xl font-bold text-[#0f766e] mb-2">Set Up Your Profile</h2>
        <p className="text-gray-600 mb-6 text-sm">Let your neighbors know who you are and how you can help.</p>

        {user && <p className="text-xs text-gray-400 mb-4">Logged in as: {user.email}</p>}

        <label className="block text-sm font-bold text-[#164e63] mb-1">Full Name</label>
        <input
          type="text"
          placeholder="e.g., Jane Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0f766e]"
        />

        <label className="block text-sm font-bold text-[#164e63] mb-1">Neighborhood / Zip Code</label>
        <input
          type="text"
          placeholder="e.g., Cathedral Park, 97212"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0f766e]"
        />

        <label className="block text-sm font-bold text-[#164e63] mb-1">Skills to Share</label>
        <textarea
          placeholder="e.g., DIY auto repair, vegetable gardening, community organizing..."
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          rows={3}
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0f766e]"
        />

        <button
          onClick={handleSaveProfile}
          className="w-full bg-[#fcd34d] text-[#164e63] font-bold py-3 rounded-lg hover:bg-opacity-90 shadow-md"
        >
          Save Profile
        </button>

        {message && (
          <p className="mt-4 text-center text-sm font-semibold text-[#0f766e]">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
