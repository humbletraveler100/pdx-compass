'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Public Identity State
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState('');
  const [skills, setSkills] = useState('');

  // Private Details State
  const [fullLegalName, setFullLegalName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullAddress, setFullAddress] = useState(''); 

  // Toggles (Steering Wheel)
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [snoozeNotifications, setSnoozeNotifications] = useState(false);
  const [showSkillsPublicly, setShowSkillsPublicly] = useState(true);
  const [isProfilePublic, setIsProfilePublic] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setProfile(data);
        setName(data.name || '');
        setNeighborhood(data.neighborhood || '');
        setBio(data.bio || '');
        setLanguages(data.languages || '');
        setSkills(data.skills || '');
        setFullLegalName(data.full_legal_name || '');
        setPhoneNumber(data.phone_number || '');
        setFullAddress(data.full_address || '');
        setSmsOptIn(data.sms_opt_in || false);
        setNewsletterOptIn(data.newsletter_opt_in || false);
        setSnoozeNotifications(data.snooze_notifications || false);
        setShowSkillsPublicly(data.show_skills_publicly ?? true);
        setIsProfilePublic(data.is_profile_public ?? true);
      }
      setLoading(false);
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

      const { error: uploadError } = await supabase.storage.from('compass-images').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('compass-images').getPublicUrl(fileName);

      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id);
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
      .update({
        name, neighborhood, bio, languages, skills,
        full_legal_name: fullLegalName, phone_number: phoneNumber, full_address: fullAddress,
        sms_opt_in: smsOptIn, newsletter_opt_in: newsletterOptIn, snooze_notifications: snoozeNotifications,
        show_skills_publicly: showSkillsPublicly, is_profile_public: isProfilePublic
      })
      .eq('id', user.id);

    if (error) {
      alert(`Error updating profile: ${error.message}`);
    } else {
      alert('Profile info saved successfully!');
    }
    setSaving(false);
  };

  const handleDownloadData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "my_compass_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading) return <div className="p-8 text-center text-[#164e63] font-bold">Loading Engine Room...</div>;

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest">Settings</h1>
        <a href="/" className="text-sm font-bold text-[#fcd34d] hover:underline">Home</a>
      </nav>
      
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Top Header & Avatar */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#0f766e] flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-[#fcd34d] overflow-hidden mb-4 shadow-sm flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 font-bold text-3xl">{profile?.name?.charAt(0) || '?'}</span>
            )}
          </div>
          <label className="bg-[#164e63] text-white px-4 py-2 rounded-lg text-sm font-bold shadow cursor-pointer hover:bg-opacity-90 transition">
            {uploading ? 'Uploading...' : 'Change Photo'}
            <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
          </label>
        </div>

        {/* 1. Public Identity Section */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="text-lg font-bold text-[#164e63]">Public Identity</h3>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={isProfilePublic} onChange={() => setIsProfilePublic(!isProfilePublic)} />
                <div className={`block w-10 h-6 rounded-full ${isProfilePublic ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isProfilePublic ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <span className="ml-2 text-xs font-bold text-gray-600">{isProfilePublic ? 'Visible' : 'Hidden'}</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Display Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0f766e] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Neighborhood Label</label>
              <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="e.g. Cathedral Park Resident" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0f766e] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">"Why I'm Here" (Bio)</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Your personal mission statement..." rows={2} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0f766e] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Languages Spoken</label>
              <input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="e.g. English, Spanish" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0f766e] outline-none" />
            </div>
          </div>
        </div>

        {/* 2. Skills & Assets Section */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="text-lg font-bold text-[#164e63]">Skills & Assets</h3>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={showSkillsPublicly} onChange={() => setShowSkillsPublicly(!showSkillsPublicly)} />
                <div className={`block w-10 h-6 rounded-full ${showSkillsPublicly ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${showSkillsPublicly ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <span className="ml-2 text-xs font-bold text-gray-600">Show</span>
            </label>
          </div>
          <textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Graphic Design, Tool Repair, Legal Aid..." rows={2} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0f766e] outline-none" />
        </div>

        {/* 3. Private Details (Admin Only) */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">🔒 Private Details</h3>
          <p className="text-xs text-gray-500 mb-4">This information is strictly for platform operations and is never shown publicly.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Legal Name</label>
              <input type="text" value={fullLegalName} onChange={(e) => setFullLegalName(e.target.value)} className="w-full p-2 border border-gray-300 rounded outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Address</label>
              <input type="text" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} className="w-full p-2 border border-gray-300 rounded outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded outline-none" />
            </div>
            <div className="pt-2 flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} className="w-5 h-5 text-[#0f766e] rounded focus:ring-[#0f766e]" />
                <span className="text-sm text-gray-800 font-semibold">I opt-in to SMS updates</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={newsletterOptIn} onChange={(e) => setNewsletterOptIn(e.target.checked)} className="w-5 h-5 text-[#0f766e] rounded focus:ring-[#0f766e]" />
                <span className="text-sm text-gray-800 font-semibold">Subscribe to the PDX Compass Newsletter</span>
              </label>
            </div>
          </div>
        </div>

        {/* Master Save Button */}
        <button onClick={saveProfileInfo} disabled={saving} className="w-full bg-[#fcd34d] text-[#164e63] font-bold py-3 rounded-xl text-lg hover:bg-opacity-90 shadow-md">
          {saving ? 'Saving Profile...' : 'Save All Changes'}
        </button>

        {/* 4. Privacy & Steering Wheel */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Data & Preferences</h3>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 font-semibold">Snooze Notifications (Pause Alerts)</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={snoozeNotifications} onChange={() => setSnoozeNotifications(!snoozeNotifications)} />
              <div className={`block w-10 h-6 rounded-full ${snoozeNotifications ? 'bg-orange-400' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${snoozeNotifications ? 'transform translate-x-4' : ''}`}></div>
            </div>
          </label>
          <button onClick={handleDownloadData} className="w-full mt-4 bg-gray-100 text-gray-700 border border-gray-300 font-bold py-2 rounded-lg text-sm hover:bg-gray-200 transition">
            📥 Download My Data
          </button>
        </div>

      </div>
    </div>
  );
}
