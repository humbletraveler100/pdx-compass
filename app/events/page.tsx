'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function EventsHubPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [myRsvps, setMyRsvps] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  
  // New Event Form State (For Admins/Organizers)
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [starReward, setStarReward] = useState(3);

  const router = useRouter();

  useEffect(() => {
    const initializeEvents = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Check if user is admin
        const { data: userData } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', session.user.id)
          .maybeSingle();
        if (userData?.is_admin) setIsAdmin(true);

        // Fetch User RSVPs
        const { data: rsvpData } = await supabase
          .from('event_rsvps')
          .select('event_id')
          .eq('user_id', session.user.id);
        
        if (rsvpData) {
          const rsvpMap: Record<string, boolean> = {};
          rsvpData.forEach(r => rsvpMap[r.event_id] = true);
          setMyRsvps(rsvpMap);
        }
      }

      // Fetch upcoming community events
      const { data: eventsData } = await supabase
        .from('community_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (eventsData) setEvents(eventsData);
      setLoading(false);
    };

    initializeEvents();
  }, []);

  const handleRsvp = async (eventId: string) => {
    if (!user) {
      router.push('/login?returnTo=/events');
      return;
    }

    const isRsvped = !!myRsvps[eventId];

    if (isRsvped) {
      // Cancel RSVP
      const { error } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (!error) {
        setMyRsvps(prev => ({ ...prev, [eventId]: false }));
      }
    } else {
      // Sign Up / RSVP
      const { error } = await supabase
        .from('event_rsvps')
        .insert({ event_id: eventId, user_id: user.id });

      if (!error) {
        setMyRsvps(prev => ({ ...prev, [eventId]: true }));
        alert("🎉 You're on the list! Attendance or volunteering at this event will secure your Star entries.");
      }
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !user) return;

    const { error } = await supabase
      .from('community_events')
      .insert({
        organizer_id: user.id,
        title,
        description,
        event_date: new Date(eventDate).toISOString(),
        location,
        star_reward: starReward
      });

    if (!error) {
      alert("✅ Community Event posted successfully!");
      setTitle('');
      setDescription('');
      setEventDate('');
      setLocation('');
      setShowForm(false);
      
      // Refresh listings
      const { data } = await supabase.from('community_events').select('*').order('event_date', { ascending: true });
      if (data) setEvents(data);
    } else {
      alert(`Error creating event: ${error.message}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-[#164e63] font-bold">Opening the Events Calendar...</div>;

  return (
    <div className="min-h-screen bg-emerald-50/40 p-4 font-sans pb-12">
      <nav className="bg-emerald-800 text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-sm font-bold text-emerald-200 hover:underline">← Back</button>
        <h1 className="text-lg font-bold tracking-widest text-center flex-1">Community Events</h1>
        <a href="/dashboard" className="text-sm font-bold text-white hover:underline">Dashboard</a>
      </nav>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Intro Board Banner */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-emerald-600 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-1">Gatherings & Shared Time</h2>
            <p className="text-gray-500 text-xs">Potlucks, clean-up crews, and cultural celebrations focused on neighborhood connection.</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(!showForm)} className="bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-emerald-800 transition text-sm whitespace-nowrap ml-4">
              {showForm ? 'Cancel' : '+ Host Event'}
            </button>
          )}
        </div>

        {showForm && isAdmin && (
          <form onSubmit={handleCreateEvent} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
            <h3 className="font-bold text-emerald-800 text-lg">Schedule a New Neighborhood Event</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Title</label>
              <input type="text" required placeholder="e.g., Neighborhood Potluck & Recipe Share" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
              <textarea required placeholder="Details about the gathering, what to bring, or schedule..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date & Time</label>
                <input type="datetime-local" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-600 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Star Reward Value</label>
                <input type="number" required min={1} max={10} value={starReward} onChange={(e) => setStarReward(parseInt(e.target.value))} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-600" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location Label</label>
              <input type="text" required placeholder="e.g., Cathedral Park picnic tables" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-600" />
            </div>
            <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-2.5 rounded-lg shadow hover:bg-emerald-800 transition text-sm">
              Broadcast Community Event
            </button>
          </form>
        )}

        {/* Listings Layout Grid */}
        {events.length === 0 ? (
          <div className="bg-slate-50 p-8 rounded-lg border border-gray-200 text-center text-gray-400 font-medium text-sm">
            No upcoming events listed right now. Check back soon for potlucks and park projects!
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((evt) => {
              const hasRsvped = !!myRsvps[evt.id];
              return (
                <div key={evt.id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <h3 className="font-extrabold text-lg text-gray-800">{evt.title}</h3>
                      <span className="bg-amber-100 text-amber-800 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        ⭐ +{evt.star_reward} Entry Stars
                      </span>
                    </div>
                    <p className="text-xs font-bold text-emerald-700">
                      📅 {new Date(evt.event_date).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})} • 📍 {evt.location}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{evt.description}</p>
                  </div>
                  
                  <button
                    onClick={() => handleRsvp(evt.id)}
                    className={`w-full md:w-auto px-5 py-2 rounded-lg font-bold text-xs transition shadow-sm border ${hasRsvped ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : 'bg-emerald-700 text-white border-transparent hover:bg-emerald-800'}`}
                  >
                    {hasRsvped ? '✓ Going (Cancel RSVP)' : 'RSVP to Event'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
