'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';

export default function Chat() {
  const [user, setUser] = useState<any>(null);
  const [request, setRequest] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  useEffect(() => {
    const loadChat = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      // 1. Get the request details to know who is talking
      const { data: reqData } = await supabase
        .from('requests')
        .select('id, title, requester_id, claimed_by')
        .eq('id', requestId)
        .single();
        
      setRequest(reqData);

      // 2. Load existing messages
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (msgData) setMessages(msgData);
      setLoading(false);
    };

    loadChat();
  }, [requestId, router]);

  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !request) return;

    // Figure out who we are sending this to
    const receiverId = user.id === request.requester_id 
      ? request.claimed_by 
      : request.requester_id;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        request_id: requestId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: newMessage.trim()
      })
      .select()
      .single();

    if (!error && data) {
      setMessages([...messages, data]); // Add the new message to the screen instantly
      setNewMessage(''); // Clear the input box
    }
  };

  if (loading) return <div className="min-h-screen bg-[#e0f2fe] p-8 text-center text-[#164e63] font-bold">Loading secure chat...</div>;

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 font-sans flex flex-col">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-4 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold tracking-widest truncate max-w-[200px]">{request?.title || 'Chat'}</h1>
        <button onClick={() => router.back()} className="text-sm font-bold text-[#fcd34d] hover:underline">Back</button>
      </nav>

      <div className="flex-1 bg-white rounded-xl shadow-lg border-t-4 border-[#0f766e] flex flex-col overflow-hidden max-w-md mx-auto w-full">
        {/* Chat History Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-gray-400 mt-10">Send a message to coordinate details safely!</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-xl text-sm ${isMe ? 'bg-[#0f766e] text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2 shrink-0">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#0f766e]"
          />
          <button type="submit" className="bg-[#fcd34d] text-[#164e63] px-5 font-bold rounded-full hover:bg-opacity-90 shadow">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
