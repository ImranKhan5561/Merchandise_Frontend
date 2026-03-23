'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.warn("Please enter the full 6-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      const { ok, data } = await api.auth.verifyOtp(email!, code);
      if (ok) {
        toast.success("Account verified! Welcome home. ✨");
        router.push('/');
        router.refresh();
      } else {
        toast.error(data.status?.message || "Invalid or expired code.");
      }
    } catch (err) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verify when last digit is entered
  useEffect(() => {
    if (otp.every(digit => digit !== '') && otp.join('').length === 6) {
      handleVerify();
    }
  }, [otp]);

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px]">
          <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[3.5rem] p-12 shadow-2xl shadow-purple-100/50 relative overflow-hidden text-center">
            
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-50/40 rounded-full blur-3xl" />
            
            {/* Header */}
            <div className="mb-10 relative z-10">
              <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#8B7BB4]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold serif text-[#1A142E] mb-3">Verify Your Email</h1>
              <p className="text-[13px] text-[#6B6580] leading-relaxed">
                We've sent a 6-digit code to <br/>
                <span className="font-bold text-[#1A142E]">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-10 relative z-10">
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    className="w-12 h-16 sm:w-14 sm:h-20 text-center text-2xl font-bold bg-white border border-gray-100 rounded-2xl focus:border-[#8B7BB4] focus:shadow-xl focus:shadow-purple-50 outline-none transition-all"
                  />
                ))}
              </div>

              <button 
                disabled={isLoading || otp.some(d => d === '')}
                className="w-full bg-[#1A142E] text-white py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] shadow-2xl shadow-purple-900/10 hover:bg-black hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-50">
               <p className="text-xs text-[#6B6580]">
                 Didn't receive the code? 
                 <button className="font-bold text-[#8B7BB4] hover:underline ml-1">Resend Code</button>
               </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
