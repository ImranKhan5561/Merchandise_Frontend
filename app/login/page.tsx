'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { ok, data } = await api.auth.login(email, password);
      if (ok) {
        toast.success("Welcome back!", { icon: "✨" });
        router.push('/');
        router.refresh();
      } else {
        toast.error(data.status?.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      toast.error("Connecting to server failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-50 via-transparent to-transparent">
        <div className="w-full max-w-[440px] perspective-1000">
          <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[3.5rem] p-12 shadow-2xl shadow-purple-100/50 relative overflow-hidden group">
            
            {/* Decorative background elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-100/30 rounded-full blur-3xl group-hover:bg-purple-200/40 transition-colors" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50/20 rounded-full blur-3xl" />

            {/* Header */}
            <div className="text-center mb-12 relative z-10">
              <h1 className="text-4xl font-bold serif text-[#1A142E] mb-3">Welcome Back</h1>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8B7BB4]">Sign in to your Ethereal account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B6580] ml-2">Email Address</label>
                <input 
                   type="email" 
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="alex@example.com"
                   className="w-full bg-white/50 border border-gray-100 rounded-2xl py-4 px-6 text-[13px] focus:bg-white focus:border-[#8B7BB4] focus:shadow-xl focus:shadow-purple-50 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B6580]">Password</label>
                   <Link href="/forgot" className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#8B7BB4] hover:underline opacity-50">Forgot?</Link>
                </div>
                <input 
                   type="password" 
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className="w-full bg-white/50 border border-gray-100 rounded-2xl py-4 px-6 text-[13px] focus:bg-white focus:border-[#8B7BB4] focus:shadow-xl focus:shadow-purple-50 transition-all outline-none"
                />
              </div>

              <button 
                disabled={isLoading}
                className="w-full bg-[#1A142E] text-white py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] shadow-2xl shadow-purple-900/10 hover:bg-black hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : "Enter Boutique"}
              </button>
            </form>

            <div className="mt-12 text-center relative z-10 pt-8 border-t border-gray-50">
               <span className="text-xs text-[#6B6580]">New to Ethereal? </span>
               <Link href="/register" className="text-xs font-bold text-[#8B7BB4] hover:underline ml-1">Create Account</Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
