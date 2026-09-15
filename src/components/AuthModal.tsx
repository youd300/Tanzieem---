import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Sparkles, AlertCircle, Coins, Lock, Mail, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../services/authContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'register' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!username.trim()) throw new Error('Please choose a username');
        if (!email.trim()) throw new Error('Please enter your email');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await register(name.trim(), username.trim(), email.trim(), password);
      } else {
        if (!email.trim()) throw new Error('Please enter your username or email');
        if (!password) throw new Error('Please enter your password');
        await login(email.trim(), password);
      }
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-[#080E1C] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.15)] overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-800 text-center relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.4)] mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">TANZIEEM</h2>
            <p className="text-xs text-cyan-400 font-medium mt-0.5">Organize Your Time. Build Your Life.</p>

            {/* Starting Bonus Banner */}
            <div className="mt-4 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-blue-500/10 border border-amber-400/30 flex items-center justify-center gap-2 text-xs text-amber-300 font-semibold">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Starting Balance: 500 Real Coins on Signup!</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex border-b border-slate-800 bg-slate-950/50 p-1">
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Account
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Robinson"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Username</label>
                  <div className="relative">
                    <span className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                      placeholder="alex_chrono"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {mode === 'register' ? 'Email Address' : 'Email or Username'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={mode === 'register' ? 'email' : 'text'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'register' ? 'alex@example.com' : 'Your email or username'}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl font-extrabold text-xs bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : mode === 'register' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Account & Claim 500 Coins
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Tanzieem
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="p-3.5 bg-slate-950/60 border-t border-slate-800/80 text-center">
            <p className="text-[10px] text-slate-400">
              Persistent & Secure User Isolation • No Mock Data • Production SQLite
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
