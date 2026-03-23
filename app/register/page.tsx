'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { ok, data } = await api.auth.register(name, email, password);
      if (ok) {
        toast.success("One last step! Verify your email.", { icon: "📧" });
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(data.status?.message || "Registration failed. Please try again.");
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
      
      <main className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent">
        <div className="w-full max-w-[480px]">
          <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[3.5rem] p-12 shadow-2xl shadow-purple-100/50 relative overflow-hidden">
            
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-50/30 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-50/20 rounded-full blur-3xl" />

            {/* Header */}
            <div className="text-center mb-10 relative z-10">
              <h1 className="text-4xl font-bold serif text-[#1A142E] mb-3">Join Ethereal</h1>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8B7BB4]">Curate your luxury experience</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6B6580] ml-2">Full Name</label>
                <input 
                   type="text" 
                   required
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   placeholder="Alex Sterling"
                   className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3.5 px-6 text-[13px] focus:bg-white focus:border-[#8B7BB4] transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6B6580] ml-2">Email Address</label>
                <input 
                   type="email" 
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="alex@example.com"
                   className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3.5 px-6 text-[13px] focus:bg-white focus:border-[#8B7BB4] transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6B6580] ml-2">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3.5 px-6 text-[13px] focus:bg-white focus:border-[#8B7BB4] transition-all outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6B6580] ml-2">Confirm</label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3.5 px-6 text-[13px] focus:bg-white focus:border-[#8B7BB4] transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  disabled={isLoading}
                  className="w-full bg-[#1A142E] text-white py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] shadow-2xl shadow-purple-900/10 hover:bg-black hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : "Create Account"}
                </button>
              </div>
            </form>

            <div className="mt-10 text-center relative z-10 pt-8 border-t border-gray-50">
               <span className="text-xs text-[#6B6580]">Already with us? </span>
               <Link href="/login" className="text-xs font-bold text-[#8B7BB4] hover:underline ml-1">Sign In</Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
