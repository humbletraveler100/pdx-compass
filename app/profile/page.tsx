'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

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

      if (data) setProfile(data);
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

      // 1. Upload the physical file to the Supabase warehouse
      const { error: uploadError } = await supabase.storage
        .from('compass-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the permanent public link for the image
      const { data: { publicUrl } } = supabase.storage
        .from('compass-images')
        .getPublicUrl(filePath);

      // 3. Save that link to the user's database row
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Update the screen instantly
      setProfile({ ...profile, avatar_url: publicUrl });
      alert('Profile picture updated successfully!');
    } catch (error: any) {
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <div className="p-8 text-center text-[#164e63] font-bold">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest">My Profile</h1>
        <a href="/feed" className="text-sm font-bold text-[#fcd34d] hover:underline">Back to Feed</a>
      </nav>

      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md border-t-4 border-[#0f766e]">
        <div className="flex flex-col items-center text-center mb-6">
          
          {/* Profile Image Display */}
          <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-[#fcd34d] overflow-hidden mb-4 shadow-sm flex items-center justify-center">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 font-bold text-3xl">{profile.name?.charAt(0) || '?'}</span>
            )}
          </div>

          {/* Secure Upload Button */}
          <label className="bg-[#164e63] text-white px-4 py-2 rounded-lg text-sm font-bold shadow cursor-pointer hover:bg-opacity-90 transition">
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input 
              type="file" 
              accept="image/*" 
              onChange={uploadAvatar} 
              disabled={uploading}
              className="hidden" 
            />
          </label>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-2xl font-bold text-[#164e63] mb-1">{profile.name}</h2>
          <p className="text-gray-500 text-sm mb-4">Portland Neighbor</p>
          
          {/* The Community Journey Tracker V1 */}
          <div className="bg-[#fef3c7] p-5 rounded-xl border border-[#fcd34d] shadow-inner">
            <h3 className="font-bold text-[#b45309] mb-3 flex items-center gap-2 text-lg">
              🌟 Community Journey
            </h3>
            <ul className="text-sm text-[#78350f] space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold text-lg">✓</span> 
                <strong>{profile.completed_tasks}</strong> Tasks Completed
              </li>
              <li className="flex items-center gap-2 text-gray-500 opacity-75">
                <span className="font-bold text-lg">○</span> Attended Cultural Event
              </li>
              <li className="flex items-center gap-2 text-gray-500 opacity-75">
                <span className="font-bold text-lg">○</span> Shared a Community Idea
              </li>
            </ul>
            <div className="pt-3 border-t border-[#fcd34d]">
              <p className="text-sm text-[#b45309] font-bold">
                Next Stamp: <span className="uppercase tracking-wide">Community Builder</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
