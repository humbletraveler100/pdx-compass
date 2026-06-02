'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Form States
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [skills, setSkills] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setProfile(data);
        setName(data.name || '');
        setNeighborhood(data.neighborhood || '');
        setSkills(data.skills || '');
      }
    };
    fetchProfile();
  }, [router]);

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('compass-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('compass-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      alert('Profile picture updated successfully!');
    } catch (error: any) {
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const saveProfileInfo = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('users')
      .update({ name, neighborhood, skills })
      .eq('id', user.id);

    if (error) {
      alert(`Error updating profile: ${error.message}`);
    } else {
      alert('Profile info saved successfully!');
    }
    setSaving(false);
  };

  if (!profile) return <div className="p-8 text-center text-[#164e63] font-bold">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest">My Profile</h1>
        <a href="/feed" className="text-sm font-bold text-[#fcd34d] hover:underline">Back to Feed</a>
      </nav>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* Top Card: Avatar & Basic Info */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#0f766e]">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-[#fcd34d] overflow-hidden mb-4 shadow-sm flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 font-bold text-3xl">{profile.name?.charAt(0) || '?'}</span>
              )}
            </div>
            <label className="bg-[#164e63] text-white px-4 py-2 rounded-lg text-sm font-bold shadow cursor-pointer hover:bg-opacity-90 transition">
              {uploading ? 'Uploading...' : 'Change Photo'}
              <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
            </label>
          </div>

          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Display Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0f766e] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Neighborhood / Zip Code</label>
              <input 
                type="text" 
                value={neighborhood} 
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g. St. Johns, 97203"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0f766e] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">My Skills & Hobbies</label>
              <textarea 
                value={skills} 
                onChange={(e) => setSkills(e.target.value)}
                placeholder="What are you good at? What do you enjoy doing?"
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0f766e] outline-none"
              />
            </div>
            <button 
              onClick={saveProfileInfo}
              disabled={saving}
              className="w-full bg-[#fcd34d] text-[#164e63] font-bold py-2 rounded-lg text-sm hover:bg-opacity-90 shadow"
            >
              {saving ? 'Saving...' : 'Save Profile Info'}
            </button>
          </div>
        </div>

        {/* Bottom Card: The Community Journey Tracker V1 */}
        <div className="bg-[#fef3c7] p-6 rounded-xl border border-[#fcd34d] shadow-md">
          <h3 className="font-bold text-[#b45309] mb-4 flex items-center gap-2 text-xl">
            🌟 Community Journey
          </h3>
          <ul className="text-sm text-[#78350f] space-y-3 mb-5">
            <li className="flex items-center gap-3">
              <span className="text-green-600 font-bold text-xl">✓</span> 
              <span className="text-base"><strong>{profile.completed_tasks}</strong> Tasks Completed</span>
            </li>
            <li className="flex items-center gap-3 text-gray-500 opacity-75">
              <span className="font-bold text-xl">○</span> <span className="text-base">Attended Cultural Event</span>
            </li>
            <li className="flex items-center gap-3 text-gray-500 opacity-75">
              <span className="font-bold text-xl">○</span> <span className="text-base">Shared a Community Idea</span>
            </li>
          </ul>
          <div className="pt-4 border-t border-[#fcd34d]">
            <p className="text-[#b45309] font-bold">
              Next Stamp: <span className="uppercase tracking-wide text-[#78350f]">Community Builder</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
