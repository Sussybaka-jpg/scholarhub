
import React, { useState } from 'react';
import { User, Role } from '../types';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../constants';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const fetchIp = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'Unknown';
    } catch (e) {
      console.warn("Failed to fetch IP address:", e);
      return 'Unknown';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    const normalizedEmail = email.toLowerCase();
    const userIp = await fetchIp();

    if (isAdminPortal) {
      if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        onLogin({ 
          email: normalizedEmail, 
          role: 'admin', 
          displayName: 'System Admin',
          lastIp: userIp 
        });
      } else {
        setError('Invalid admin credentials.');
        setIsLoggingIn(false);
      }
    } else {
      if (normalizedEmail === ADMIN_EMAIL) {
        setError('Please use the Admin Portal for this email address.');
        setIsLoggingIn(false);
        return;
      }
      onLogin({ 
        email: normalizedEmail, 
        role: 'student', 
        displayName: username || normalizedEmail.split('@')[0],
        lastIp: userIp 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-white">
      <div className="max-w-md w-full">
        <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-6 shadow-sm border border-slate-800">
          <button
            onClick={() => { setIsAdminPortal(false); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isAdminPortal ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Student Portal
          </button>
          <button
            onClick={() => { setIsAdminPortal(true); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isAdminPortal ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Cloud Admin
          </button>
        </div>

        <div className={`bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 border-t-8 transition-all relative overflow-hidden ${isAdminPortal ? 'border-indigo-600' : 'border-blue-600'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
             </svg>
          </div>

          <div className="text-center mb-8 relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-colors ${isAdminPortal ? 'bg-indigo-600 shadow-indigo-900/40' : 'bg-blue-600 shadow-blue-900/40'}`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isAdminPortal ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                )}
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {isAdminPortal ? 'Cloud Control' : 'ScholarHub'}
            </h1>
            <p className="text-slate-400 mt-2 font-medium text-sm">
              {isAdminPortal ? 'Manage central 15GB drive node' : 'Enter the Knowledge Vault'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950/30 border-l-4 border-red-500 text-red-400 text-sm font-bold rounded-r-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Node Email</label>
              <input
                type="email"
                required
                disabled={isLoggingIn}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-950 border-2 border-slate-800 focus:bg-slate-800 focus:border-blue-600 outline-none transition-all disabled:opacity-50 text-white font-medium placeholder-slate-600"
                placeholder="you@school.edu"
              />
            </div>
            {!isAdminPortal && (
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Username</label>
                <input
                  type="text"
                  disabled={isLoggingIn}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-950 border-2 border-slate-800 focus:bg-slate-800 focus:border-blue-600 outline-none transition-all disabled:opacity-50 text-white font-medium placeholder-slate-600"
                  placeholder="Anonymous Scholar"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Auth Pass-Key</label>
              <input
                type="password"
                required
                disabled={isLoggingIn}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-950 border-2 border-slate-800 focus:bg-slate-800 focus:border-blue-600 outline-none transition-all disabled:opacity-50 text-white font-medium placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-4 rounded-2xl text-white font-black text-lg shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isAdminPortal ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40'} disabled:opacity-70`}
            >
              {isLoggingIn ? 'Syncing...' : 'Unlock Portal'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
              Authorized Cloud Management Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
