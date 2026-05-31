'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AskForHelp() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryGroup, setCategoryGroup] = useState('community');
  const [urgency, setUrgency] = useState('low');
  const [timeWindow, setTimeWindow] = useState('flexible');
  const [locationLabel, setLocationLabel] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        router.push('/login');
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    setMessage('Submitting your request...');

    const { error } = await supabase
      .from('requests')
      .insert({
        requester_id: user.id,
        title: title,
        description: description,
        category: category || 'General Help',
        category_group: categoryGroup,
        urgency: urgency,
        time_window: timeWindow,
        location_label: locationLabel,
        status: 'open', // Skips the 'pending_review' step for the MVP so it shows up immediately
      });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Request submitted successfully!');
      setTimeout(() => router.push('/'), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest">PDX Compass</h1>
        <a href="/" className="text-sm font-bold text-[#fcd34d] hover:underline">Cancel</a>
      </nav>

      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto border-t-4 border-[#0f766e]">
        <h2 className="text-2xl font-bold text-[#0f766e] mb-2">Ask for Help</h2>
        <p className="text-gray-600 mb-6 text-sm">Post a request to the community board.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-[#164e63] mb-1">What do you need help with?</label>
            <input
              type="text"
              required
              placeholder="e.g., Need to borrow a socket set"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0f766e]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#164e63] mb-1">Details</label>
            <textarea
              placeholder="e.g., Replacing a front wheel bearing this weekend, just need the tools for a few hours."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0f766e]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#164e63] mb-1">Type of Help</label>
              <select 
                value={categoryGroup} 
                onChange={(e) => setCategoryGroup(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0f766e] bg-white"
              >
                <option value="physical">Physical Task</option>
                <option value="care">Care / Support</option>
                <option value="logistics">Logistics / Tools</option>
                <option value="community">Community Project</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#164e63] mb-1">Specific Category</label>
              <input
                type="text"
                placeholder="e.g., Auto Repair"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0f766e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#164e63] mb-1">Urgency</label>
              <select 
                value={urgency} 
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0f766e] bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#164e63] mb-1">Timeline</label>
              <select 
                value={timeWindow} 
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0f766e] bg-white"
              >
                <option value="flexible">Flexible</option>
                <option value="within_24h">Within 24 Hours</option>
                <option value="urgent">Urgent / ASAP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#164e63] mb-1">General Location</label>
            <input
              type="text"
              placeholder="e.g., 97212 or Cathedral Park area"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0f766e]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#164e63] text-white font-bold py-3 rounded-lg hover:bg-opacity-90 shadow-md mt-4"
          >
            Post Request
          </button>

          {message && (
            <p className="mt-4 text-center text-sm font-semibold text-[#0f766e]">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
