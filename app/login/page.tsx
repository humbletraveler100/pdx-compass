'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage('Success! Your account has been created.');
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else setMessage('Logged in successfully! Welcome back.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e0f2fe] p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full border-t-4 border-[#0f766e]">
        <h2 className="text-2xl font-bold text-[#0f766e] mb-6 text-center">Join PDX Compass</h2>
        
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0f766e]"
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0f766e]"
        />
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignIn}
            className="w-full bg-[#0f766e] text-white font-bold py-3 rounded-lg hover:bg-opacity-90"
          >
            Sign In
          </button>
          
          <button
            onClick={handleSignUp}
            className="w-full bg-[#fed7aa] text-[#0f766e] font-bold py-3 rounded-lg hover:bg-opacity-90"
          >
            Create Account
          </button>
        </div>

        {message && (
          <p className="mt-4 text-center text-sm font-semibold text-[#0f766e]">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

