'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    // Simulate API call for admin login
    setTimeout(() => {
      setIsLoading(false);
      // Example routing after successful login:
      // router.push('/dashboard');
      console.log('Logged in with', email);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-surface selection:bg-primary/30">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up {
          opacity: 0;
          animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}} />

      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-tertiary/10 blur-[150px]"></div>
        <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
        
        {/* Logo or Brand */}
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-tertiary p-[2px] mb-6 shadow-xl shadow-primary/20">
            <div className="w-full h-full bg-surface rounded-[14px] flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                admin_panel_settings
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight font-display mb-2">
            <span className="bg-gradient-to-br from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              BillTea Admin
            </span>
          </h1>
          <p className="text-on-surface-variant font-medium tracking-wide">
            Secure login to the administration panel
          </p>
        </div>

        {/* Login Form Panel */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-outline-variant/30 relative overflow-hidden backdrop-blur-2xl">
          {/* subtle inset highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-6 relative z-10">
            {error && (
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-500/20 flex items-start gap-3 shadow-sm">
                <span className="material-symbols-outlined text-red-500 text-[20px] mt-0.5">error</span>
                <div className="text-sm text-red-600 font-medium whitespace-pre-line leading-relaxed">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors text-[20px]">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@billtea.com"
                    className="glass-input pl-12 pr-4 py-3.5 rounded-xl text-sm text-on-surface w-full font-semibold focus:ring-primary/50 transition-all placeholder:font-normal placeholder:text-on-surface-variant/40"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Password
                  </label>
                  <a href="#" className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors text-[20px]">
                    lock
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="glass-input pl-12 pr-4 py-3.5 rounded-xl text-sm text-on-surface w-full font-semibold focus:ring-primary/50 transition-all placeholder:tracking-widest"
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 group relative w-full h-14 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center gap-3 overflow-hidden shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Decoration */}
        <footer className="w-full opacity-40 text-center flex items-center justify-center gap-4 mt-12 mb-4">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-on-surface-variant to-transparent"></div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
            BillTea Admin Portal
          </p>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-on-surface-variant to-transparent"></div>
        </footer>
      </div>
    </div>
  );
}
