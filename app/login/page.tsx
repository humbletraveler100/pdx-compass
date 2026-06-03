'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTos, setAgreeTos] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && !agreeTos) {
      alert("You must agree to the Terms of Service and Privacy Policy to create an account.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/feed');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Account created successfully! Please check your email to verify your account, then set up your profile.");
        router.push('/profile');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#cffafe] flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-[#0f766e]">
        
        {/* Header Tabs */}
        <div className="flex bg-gray-50 border-b">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 text-sm font-bold tracking-wide transition ${isLogin ? 'text-[#164e63] bg-white border-b-2 border-[#164e63]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            SIGN IN
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 text-sm font-bold tracking-wide transition ${!isLogin ? 'text-[#164e63] bg-white border-b-2 border-[#164e63]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#164e63] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xs shadow">PDX</div>
            <h2 className="text-2xl font-extrabold text-[#164e63]">Welcome to Compass</h2>
            <p className="text-gray-500 text-sm mt-1">{isLogin ? 'Sign in to connect with neighbors.' : 'Join your local community network.'}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none transition"
                placeholder="neighbor@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none transition"
                placeholder="••••••••"
              />
            </div>

            {/* MANDATORY TOS CHECKBOX FOR SIGNUP */}
            {!isLogin && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex gap-3 items-start">
                <input 
                  type="checkbox" 
                  id="tos" 
                  checked={agreeTos} 
                  onChange={(e) => setAgreeTos(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#0f766e] rounded focus:ring-[#0f766e] cursor-pointer"
                />
                <label htmlFor="tos" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                  I am at least 18 years old and I agree to the{' '}
                  <a href="/legal" target="_blank" className="text-[#0f766e] font-bold hover:underline">Terms of Service</a>,{' '}
                  <a href="/legal" target="_blank" className="text-[#0f766e] font-bold hover:underline">Privacy Policy</a>, and strictly agree to the <strong>Zero-Money Policy</strong>.
                </label>
              </div>
            )}

            <button 
              type="submit" disabled={loading}
              className="w-full bg-[#fcd34d] text-[#164e63] font-extrabold py-3 rounded-lg shadow hover:bg-opacity-90 transition mt-2"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-[#0f766e] text-sm font-bold hover:underline">← Return Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
